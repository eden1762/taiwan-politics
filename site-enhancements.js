(() => {
  const E = window.ELECTION_DATA;
  const R = window.SITE_RESEARCH || {};
  if (!E) return;

  const page = document.body.dataset.page || 'home';
  const qs = new URLSearchParams(location.search);
  let saved = null;
  try { saved = localStorage.getItem('tcsm-lang'); } catch (_) {}
  const isEn = qs.get('lang') === 'en' || (!qs.has('lang') && saved === 'en');
  const $ = (s, root = document) => root.querySelector(s);
  const byId = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat(isEn ? 'en-US' : 'zh-TW');
  const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const pct = n => `${Number(n).toFixed(1)}%`;
  const party = k => E.parties[k] || E.parties.OTHER;
  const normalize = obj => {
    const t = Object.values(obj).reduce((a,b)=>a+Number(b||0),0) || 1;
    return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k,Number(v||0)/t*100]));
  };
  const sorted = obj => Object.entries(obj).sort((a,b)=>b[1]-a[1]);
  const sumKeys = (obj, keys=[]) => keys.reduce((a,k)=>a+Number(obj?.[k]||0),0);
  const counties = Object.fromEntries(E.counties.map(c=>[c.name,c]));

  const partyName = k => isEn ? ({DPP:'DPP',KMT:'KMT',TPP:'TPP',IND:'Independent',OTHER:'Other',JRP:'Judicial Reform Party',TWP:'Taiwan Labor Party'}[k] || k) : party(k).short;
  const candidateEn = {lai2028:'Lai Ching-te',lu2028:'Lu Shiow-yen',ko2028:'Ko Wen-je'};

  function dayAge(a,b){
    return Math.max(0,Math.round((new Date(`${b}T00:00:00+08:00`)-new Date(`${a}T00:00:00+08:00`))/86400000));
  }
  function weight(p,halfLife,cutoff){
    const sigma=p.moe?Number(p.moe)/1.96:p.n?50/Math.sqrt(Number(p.n)):3/1.96;
    const variance=sigma*sigma+E.model.pollErrorFloor*E.model.pollErrorFloor;
    return (p.quality??0.9)*Math.pow(2,-dayAge(p.fieldEnd,cutoff)/halfLife)/variance;
  }
  function poolAt(polls,ids,halfLife,cutoff){
    const totals=Object.fromEntries(ids.map(k=>[k,0]));
    const infos=Object.fromEntries(ids.map(k=>[k,0]));
    let info=0;
    polls.filter(p=>p.fieldEnd<=cutoff&&p.useInModel!==false).sort((a,b)=>a.fieldEnd.localeCompare(b.fieldEnd)).forEach(p=>{
      const present=ids.filter(k=>Number(p.values?.[k]||0)>0);
      if(!present.length)return;
      const n=normalize(Object.fromEntries(present.map(k=>[k,Number(p.values[k])])));
      const w=weight(p,halfLife,cutoff);
      present.forEach(k=>{totals[k]+=n[k]*w;infos[k]+=w;});
      info+=w;
    });
    if(!info)return null;
    const shares={};ids.forEach(k=>shares[k]=infos[k]?totals[k]/infos[k]:0);
    return {shares:normalize(shares),info};
  }
  function blend(pool,prior,precision,cap){
    if(!pool)return normalize(prior);
    const lambda=Math.min(cap,pool.info/(pool.info+precision));
    const raw={};
    [...new Set([...Object.keys(prior),...Object.keys(pool.shares)])].forEach(k=>raw[k]=(pool.shares[k]||0)*lambda+(prior[k]||0)*(1-lambda));
    return normalize(raw);
  }
  function mayorPrior(county,race){
    const c=counties[county],raw={};
    race.candidates.forEach(x=>{
      if(x.manualPrior!=null){raw[x.id]=Number(x.manualPrior);return;}
      const local=x.manualLocal2022??sumKeys(c.m2022,x.baseKeys);
      const nat=sumKeys(c.p2024,x.baseKeys);
      raw[x.id]=(local*E.model.localPrior2022Weight+nat*E.model.localPrior2024Weight)*(x.priorScale??1);
    });
    return normalize(raw);
  }
  function mayorSeatsAt(cutoff){
    const out={DPP:0,KMT:0,TPP:0,OTHER:0};
    Object.entries(E.mayorRaces).forEach(([county,race])=>{
      const ids=race.candidates.map(x=>x.id);
      const pool=poolAt(E.mayorPolls.filter(p=>p.county===county),ids,E.model.localHalfLifeDays,cutoff);
      const f=blend(pool,mayorPrior(county,race),E.model.localPriorPrecision,E.model.localPollCap);
      const leader=race.candidates.find(x=>x.id===sorted(f)[0]?.[0]);
      const key=leader?.party&&Object.hasOwn(out,leader.party)?leader.party:'OTHER';
      out[key]++;
    });
    return out;
  }
  function partyPolls(){
    const older=(R.historicalPartyPolls||[]).filter(p=>p.type==='party_support'&&p.useInModel!==false);
    const now=(E.councilPolls||[]).filter(p=>p.useInModel!==false);
    const seen=new Set();
    return [...older,...now].filter(p=>{const k=`${p.fieldEnd}|${p.pollster}`;if(seen.has(k))return false;seen.add(k);return true;});
  }
  function councilSharesAt(cutoff){
    const prior={DPP:E.national2024.DPP,KMT:E.national2024.KMT,TPP:E.national2024.TPP};
    return blend(poolAt(partyPolls(),['DPP','KMT','TPP'],E.model.councilHalfLifeDays,cutoff),prior,E.model.councilPriorPrecision,E.model.councilPollCap);
  }
  function largestRemainder(values,target){
    const floor=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Math.floor(v)]));
    let left=target-Object.values(floor).reduce((a,b)=>a+b,0);
    Object.entries(values).map(([k,v])=>[k,v-Math.floor(v)]).sort((a,b)=>b[1]-a[1]).forEach(([k])=>{if(left>0){floor[k]++;left--;}});
    return floor;
  }
  function councilSeatsAt(cutoff){
    const s=councilSharesAt(cutoff);
    const b=R.councilSeatBaseline||{total:910,DPP:277,KMT:367,TPP:14,OTHER:252};
    const raw={DPP:b.DPP*(s.DPP/E.national2024.DPP),KMT:b.KMT*(s.KMT/E.national2024.KMT),TPP:b.TPP*(s.TPP/E.national2024.TPP),OTHER:b.OTHER};
    const scale=b.total/Object.values(raw).reduce((a,v)=>a+v,0);
    return largestRemainder(Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,v*scale])),b.total);
  }
  function presidentSharesAt(cutoff){
    const ids=E.president.candidates.map(x=>x.id);
    const p=poolAt(E.president.polls||[],ids,E.model.presidentialHalfLifeDays,cutoff);
    const prior={DPP:E.national2024.DPP,KMT:E.national2024.KMT,TPP:E.national2024.TPP};
    if(!p)return {lai2028:prior.DPP,lu2028:prior.KMT,ko2028:prior.TPP};
    const partyPool={info:p.info,shares:{DPP:p.shares.lai2028,KMT:p.shares.lu2028,TPP:p.shares.ko2028}};
    const f=blend(partyPool,prior,E.model.presidentialPriorPrecision,E.model.presidentialPollCap);
    return {lai2028:f.DPP,lu2028:f.KMT,ko2028:f.TPP};
  }
  function presidentVotesAt(cutoff){
    const shares=presidentSharesAt(cutoff),total=E.national2024.validVotes;
    return {shares,votes:largestRemainder(Object.fromEntries(Object.entries(shares).map(([k,v])=>[k,total*v/100])),total),total};
  }
  function months(){
    const end=(R.asOf||E.asOf).slice(0,7),out=[];
    let y=2024,m=1;
    while(`${y}-${String(m).padStart(2,'0')}`<=end){
      const month=`${y}-${String(m).padStart(2,'0')}`;
      const d=new Date(Date.UTC(y,m,0));
      let cutoff=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
      if(month===end)cutoff=R.asOf||E.asOf;
      out.push({month,cutoff});m++;if(m===13){m=1;y++;}
    }
    return out;
  }

  function addQuickActions(){
    const box=document.createElement('aside');box.className='quick-actions';box.setAttribute('aria-label',isEn?'Quick links':'快速連結');
    box.innerHTML=`<a class="quick-action" href="${esc(R.igUrl||'https://www.instagram.com/taiwan.independence.movement/')}" target="_blank" rel="noopener noreferrer">IG</a><button class="quick-action lang" type="button">${isEn?'中文版':'英文版'}</button>`;
    $('.lang',box).addEventListener('click',()=>{const u=new URL(location.href);if(isEn)u.searchParams.delete('lang');else u.searchParams.set('lang','en');try{localStorage.setItem('tcsm-lang',isEn?'zh':'en');}catch(_){}location.href=u.toString();});
    document.body.appendChild(box);
  }
  function addMapLegend(id){
    const n=byId(id);if(!n)return;
    const x=document.createElement('div');x.className='map-reading-legend';
    x.innerHTML=`<b>${isEn?'Lead margin':'領先差深淺'}</b><span class="opacity-chip"><i></i>&lt;3pp</span><span class="opacity-chip"><i></i>3–8pp</span><span class="opacity-chip"><i></i>8–15pp</span><span class="opacity-chip"><i></i>15pp+</span><span>${isEn?'Color = leading party; darker = larger lead':'顏色＝領先陣營；越深＝領先越多'}</span>`;
    n.appendChild(x);
  }
  function cards(items){return `<div class="latest-projection">${items.map(x=>`<div class="projection-card"><strong style="color:${x.color}">${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join('')}</div>`;}
  function svgChart(labels,series,maxValue,yFormat){
    const W=1000,H=360,L=78,Rr=24,T=20,B=52,pw=W-L-Rr,ph=H-T-B,max=Math.max(1,maxValue);
    const x=i=>L+(labels.length===1?0:pw*i/(labels.length-1));
    const y=v=>T+ph*(1-v/max);
    let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="trend chart" preserveAspectRatio="none">`;
    for(let i=0;i<=5;i++){const yy=T+ph*i/5,v=max*(1-i/5);svg+=`<line x1="${L}" y1="${yy}" x2="${W-Rr}" y2="${yy}" stroke="currentColor" opacity=".12"/><text x="${L-10}" y="${yy+4}" text-anchor="end" fill="currentColor" opacity=".68" font-size="12">${esc(yFormat(v))}</text>`;}
    labels.forEach((lab,i)=>{if(i%6===0||i===labels.length-1)svg+=`<text x="${x(i)}" y="${H-18}" text-anchor="middle" fill="currentColor" opacity=".65" font-size="11">${lab}</text>`;});
    series.forEach(s=>{const pts=s.values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');svg+=`<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round" stroke-linecap="round"/>`;const lv=s.values.at(-1);svg+=`<circle cx="${x(labels.length-1)}" cy="${y(lv)}" r="5" fill="${s.color}"/>`;});
    svg+=`<line x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" stroke="currentColor" opacity=".28"/><line x1="${L}" y1="${H-B}" x2="${W-Rr}" y2="${H-B}" stroke="currentColor" opacity=".28"/></svg>`;
    return svg;
  }
  function trendSection({id,eyebrow,title,copy,labels,series,max,yFormat,caption,latest}){
    const s=document.createElement('section');s.className='panel trend-panel';s.id=id;
    s.innerHTML=`<div class="panel-heading"><div class="trend-copy"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2><p class="muted">${esc(copy)}</p></div></div><div class="trend-chart-shell"><div class="chart-legend">${series.map(x=>`<span><i style="background:${x.color}"></i>${esc(x.label)}</span>`).join('')}</div><div class="trend-canvas-wrap">${svgChart(labels,series,max,yFormat)}</div><p class="chart-caption">${esc(caption)}</p></div>${latest}`;
    return s;
  }
  function insertTrend(s){
    const main=$('main');if(!main)return;
    const target=[...main.querySelectorAll(':scope > section.panel')].find(p=>/POLL ARCHIVE|NATIONAL SIGNALS|DIRECT POLLS/.test(p.textContent));
    target?main.insertBefore(s,target):main.appendChild(s);
  }
  function addMayorTrend(){
    const ms=months(),p=ms.map(x=>mayorSeatsAt(x.cutoff)),keys=['DPP','KMT','TPP','OTHER'];
    const series=keys.map(k=>({label:partyName(k),color:party(k).color,values:p.map(v=>v[k]||0)})),last=p.at(-1);
    insertTrend(trendSection({id:'mayorTrendChart',eyebrow:'MONTHLY BACKCAST',title:isEn?'2026 mayor forecast by month':'2026縣市長全國席次月度預測',copy:isEn?'Each point reruns the same model using only information available by that month-end. The 22 county/city chief offices are counted by current model leader.':'每個月只使用該月底以前已存在的可比民調重跑相同模型，統計22個縣市長席次由哪個陣營在模型中領先。',labels:ms.map(x=>x.month),series,max:22,yFormat:v=>String(Math.round(v)),caption:isEn?'Historical backcast, not a claim that the site published these numbers at the time. Older polls lose weight through the same recency-decay formula.':'此為歷史回推（backcast），不是本站當月已發布預測的紀錄；舊民調同樣依時間衰減降權。',latest:cards(keys.map(k=>({label:isEn?`${partyName(k)} — current leading offices`:`${partyName(k)}｜目前模型領先席次`,value:`${last[k]||0} / 22`,color:party(k).color})))}));
  }
  function addCouncilTrend(){
    const ms=months(),p=ms.map(x=>councilSeatsAt(x.cutoff)),keys=['DPP','KMT','TPP','OTHER'];
    const series=keys.map(k=>({label:partyName(k),color:party(k).color,values:p.map(v=>v[k]||0)})),last=p.at(-1),total=R.councilSeatBaseline?.total||910;
    const mx=Math.max(450,...series.flatMap(s=>s.values))*1.06;
    insertTrend(trendSection({id:'councilTrendChart',eyebrow:'LOW-CONFIDENCE SEAT PROXY',title:isEn?'2026 council seat proxy by month':'2026縣市議員全國總席次月度預測',copy:isEn?'The recency-weighted national party swing is applied to the actual 2022 council-seat baseline and normalized back to 910 seats. This is intentionally low confidence.':'以時間衰減後的全國政黨民意擺動套用2022實際議員席次基準，再正規化回全國910席；這是刻意標示低信心的席次proxy。',labels:ms.map(x=>x.month),series,max:mx,yFormat:v=>String(Math.round(v)),caption:isEn?'Multi-member districts, candidate supply, local factions and vote allocation can create large errors; use this only as a national direction indicator.':'多席次選區、候選人數、地方派系與配票都可能造成很大誤差；此圖只適合判讀全國方向。',latest:cards(keys.map(k=>({label:isEn?`${partyName(k)} — projected seats`:`${partyName(k)}｜預測席次`,value:`${last[k]||0} / ${total}`,color:party(k).color})))}));
  }
  function addPresidentTrend(){
    const ms=months(),p=ms.map(x=>presidentVotesAt(x.cutoff));
    const meta={lai2028:{party:'DPP',zh:'賴清德'},lu2028:{party:'KMT',zh:'盧秀燕'},ko2028:{party:'TPP',zh:'柯文哲'}},keys=Object.keys(meta);
    const series=keys.map(k=>({label:isEn?candidateEn[k]:meta[k].zh,color:party(meta[k].party).color,values:p.map(v=>v.votes[k])})),last=p.at(-1),mx=Math.max(...series.flatMap(s=>s.values))*1.08;
    insertTrend(trendSection({id:'presidentTrendChart',eyebrow:'NATIONAL VOTE SCENARIO',title:isEn?'2028 presidential national vote forecast by month':'2028總統大選全國總得票月度預測',copy:isEn?'Only directly comparable presidential vote questions enter the scenario. Shares are converted to votes using the fixed 2024 valid-vote baseline of 13,947,506.':'只使用可直接比較的總統投票情境題；每月比例以2024總統大選全國有效票13,947,506作固定基準換算為總票數。',labels:ms.map(x=>x.month),series,max:mx,yFormat:v=>`${(v/1000000).toFixed(1)}M`,caption:isEn?'This is a conditional share comparison, not a forecast of 2028 turnout or total valid ballots. Candidate nominations remain unsettled.':'這是條件式份額比較，不是2028投票率或有效票總量預測；候選人也尚未正式提名。',latest:cards(keys.map(k=>({label:isEn?`${candidateEn[k]} — national vote`:`${meta[k].zh}｜全國預測總票`,value:`${fmt.format(last.votes[k])} (${pct(last.shares[k])})`,color:party(meta[k].party).color})))}));
  }
  function rebuildArchive(){
    const n=byId('nationalArchive');if(!n)return;
    const all=[...(R.historicalPartyPolls||[]),...(E.councilPolls||[]).map(p=>({...p,type:'party_support'}))].sort((a,b)=>b.fieldEnd.localeCompare(a.fieldEnd));
    n.className='table-wrap';
    n.innerHTML=`<p class="research-table-note">${isEn?'Newest first. Only comparable party-support rows marked Model input enter the national-swing model; favorability remains visible as context.':'依民調時間由近至遠。只有標示「納入模型」的同口徑政黨支持／傾向題進入全國擺動模型；好感度等不同題型保留展示但不混算。'}</p><table><thead><tr><th>${isEn?'Date':'日期'}</th><th>${isEn?'Poll / type':'民調／題型'}</th><th>DPP</th><th>KMT</th><th>TPP</th><th>${isEn?'Sample / MOE':'樣本／誤差'}</th><th>${isEn?'Use':'模型'}</th><th>${isEn?'Source':'來源'}</th></tr></thead><tbody>${all.map(p=>`<tr><td>${esc(p.datePrecision==='month'?p.fieldEnd.slice(0,7):p.fieldEnd)}</td><td><b>${esc(p.pollster)}</b><br><span class="muted">${p.type==='party_support'?(isEn?'Party support / preference':'政黨支持／傾向'):(isEn?'Favorability / context':'好感度／背景')}</span><br><span class="muted">${esc(p.note||'')}</span></td><td>${p.values?.DPP??'—'}${p.values?.DPP!=null?'%':''}</td><td>${p.values?.KMT??'—'}${p.values?.KMT!=null?'%':''}</td><td>${p.values?.TPP??'—'}${p.values?.TPP!=null?'%':''}</td><td>${p.n?fmt.format(p.n):'—'}${p.moe?`<br><span class="muted">95% ±${p.moe}%</span>`:''}</td><td><span class="research-tag ${p.useInModel===false?'context':'model'}">${p.useInModel===false?(isEn?'Context':'背景'):(isEn?'Model input':'納入模型')}</span></td><td>${p.url?`<a class="external" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${isEn?'Source':'來源'} ↗</a>`:'—'}</td></tr>`).join('')}</tbody></table>`;
  }
  function addMethod(){
    const g=$('.formula-grid');if(!g)return;
    const s=document.createElement('section');s.className='method-addon-grid';s.id='modelExtensions';
    s.innerHTML=`<article class="method-addon"><p class="eyebrow">10 — COUNCIL SEAT PROXY</p><h2>${isEn?'Convert national swing to 910 seats':'將全國擺動轉為910席'}</h2><code>RawSeat_c = Seat2022_c × (Share_c / Pres2024Share_c)\nSeats = normalize(RawSeat_DPP, RawSeat_KMT, RawSeat_TPP, Other2022) → 910</code><p>${isEn?'Anchored to actual 2022 council seats, then adjusted by the model national swing. It remains low confidence because district and candidate effects are not modeled.':'以2022實際議員席次為基準，再套用全國政黨擺動；因未逐選區處理候選人、地方派系與配票，維持低信心。'}</p></article><article class="method-addon"><p class="eyebrow">11 — MONTHLY BACKCAST</p><h2>${isEn?'Use only information available by each month-end':'每月底只使用當時已存在資料重算'}</h2><code>Forecast_m = Model({ polls | fieldEnd ≤ monthEnd_m })</code><p>${isEn?'Trend charts are backcasts, not retroactive claims of past publication. The same inverse-variance and recency-decay rules apply to every month.':'趨勢圖是歷史回推，不是把今天的模型冒充成過去已發布結果；每月都使用相同逆變異與時間衰減規則。'}</p></article>`;
    g.insertAdjacentElement('afterend',s);
  }

  const exact={
    '台灣公民與主權地圖':'Taiwan Civic & Sovereignty Map','2026縣市長':'2026 Mayors','2026縣市議員':'2026 Councils','2028總統':'2028 President','票數預測公式':'Forecast Method','主權活動資訊':'Civic & Sovereignty','2026縣市長選舉':'2026 County & City Mayoral Elections','2026縣市議員選舉':'2026 County & City Council Elections','2028總統大選':'2028 Presidential Election','縣市長預測地圖':'Mayoral forecast map','政黨總票結構地圖':'Party vote structure map','2028情境縣市地圖':'2028 scenario map','票數預測結果':'Vote forecast','各縣市票數預測':'County/city vote forecast','縣市票數預測':'County/city vote forecast','2024總統大選後公開民調資料庫':'Public poll archive since the 2024 presidential election','全國政黨民調訊號':'National party polling signals','2024總統大選後長期民調查證索引':'Long-run polling archive since 2024','可直接納入的2028投票情境民調':'Directly comparable 2028 voting scenarios','歷史預測版本':'Forecast version history','權威科學論文與用途':'Academic sources and their use','本站工程參數':'Model calibration parameters','公開組織與活動':'Public organizations and events','查證來源':'Sources','模型資料日':'Model data date','目前模式':'Current mode','情境模擬':'Scenario simulation','資料原則':'Data principle','公開可查證':'Public and verifiable','目前預測單位':'Current forecast unit','查看公式':'Method','進入頁面 →':'Open page →','查看公式 →':'View method →','查看地圖 →':'Open map →','地圖復位':'Reset map','最新資料日':'Latest data date','來源':'Source','縣市':'County / city','信心':'Confidence','說明':'Notes','截止':'Field end','未表態':'Undecided','模型':'Model','背景':'Context','納入':'Included','日期':'Date','目前版本':'Current','歷史版本':'History'
  };
  const countiesEn={'基隆市':'Keelung City','臺北市':'Taipei City','新北市':'New Taipei City','桃園市':'Taoyuan City','臺中市':'Taichung City','臺南市':'Tainan City','高雄市':'Kaohsiung City','宜蘭縣':'Yilan County','新竹縣':'Hsinchu County','新竹市':'Hsinchu City','苗栗縣':'Miaoli County','彰化縣':'Changhua County','南投縣':'Nantou County','雲林縣':'Yunlin County','嘉義縣':'Chiayi County','嘉義市':'Chiayi City','屏東縣':'Pingtung County','臺東縣':'Taitung County','花蓮縣':'Hualien County','澎湖縣':'Penghu County','金門縣':'Kinmen County','連江縣':'Lienchiang County'};
  const people={'賴清德':'Lai Ching-te','盧秀燕':'Lu Shiow-yen','柯文哲':'Ko Wen-je','沈伯洋':'Puma Shen','蔣萬安':'Chiang Wan-an','蘇巧慧':'Su Chiao-hui','李四川':'Lee Szechuan','江啟臣':'Johnny Chiang','何欣純':'Ho Hsin-chun','陳亭妃':'Chen Ting-fei','謝龍介':'Hsieh Lung-chieh','賴瑞隆':'Lai Jui-lung','柯志恩':'Ko Chih-en','徐欣瑩':'Hsu Hsin-ying','鄭朝方':'Cheng Chao-fang','高虹安':'Kao Hung-an','周春米':'Chou Chun-mi'};
  function translate(){
    if(!isEn)return;
    document.documentElement.lang='en';
    const titles={home:'Taiwan Civic & Sovereignty Map',mayor:'2026 Mayoral Elections | Taiwan Civic & Sovereignty Map',council:'2026 Council Elections | Taiwan Civic & Sovereignty Map',president:'2028 Presidential Election | Taiwan Civic & Sovereignty Map',method:'Forecast Method | Taiwan Civic & Sovereignty Map',sovereignty:'Civic & Sovereignty Information | Taiwan Civic & Sovereignty Map'};document.title=titles[page]||titles.home;
    document.querySelectorAll("a[href*='.html']").forEach(a=>{try{const u=new URL(a.href);u.searchParams.set('lang','en');a.href=u.toString();}catch(_){}});
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{if(!n.nodeValue.trim()||['SCRIPT','STYLE','CODE'].includes(n.parentElement?.tagName))return;let t=n.nodeValue,trim=t.trim();if(exact[trim]){n.nodeValue=t.replace(trim,exact[trim]);return;}Object.entries(countiesEn).forEach(([z,e])=>t=t.replaceAll(z,e));Object.entries(people).forEach(([z,e])=>t=t.replaceAll(z,e));t=t.replaceAll('民進黨','DPP').replaceAll('國民黨','KMT').replaceAll('民眾黨','TPP').replaceAll('無黨／合作','Independent / alliance').replaceAll('無黨','Independent').replaceAll('其他／未定','Other / TBD').replaceAll('領先差','Lead margin').replaceAll('模型領先縣市','Counties/cities led in model').replaceAll('有可比民調縣市','Counties/cities with comparable polls').replaceAll('樣本／誤差','Sample / MOE').replaceAll('調查／委託','Poll / sponsor').replaceAll('原始結果','Raw result').replaceAll('預測比例／票數','Forecast share / votes').replaceAll('民調比重','Poll weight');n.nodeValue=t;});
    const lead=$('.hero > div:first-child p:not(.eyebrow)')||$('.home-hero > p');
    const copy={home:'Public polling, historical election structure, model parameters, forecast history and OpenStreetMap choropleths are rendered from shared data sources. Forecasts are conditional estimates, not guarantees.',mayor:'The model combines comparable candidate polls with 2022 local-election structure and 2024 presidential county-level structure. Polls are weighted by total error, source quality and recency.',council:'The site estimates national party swing and a clearly labeled low-confidence seat proxy. Candidate-level and district effects remain major uncertainties.',president:'Only directly asked presidential voting scenarios enter the model. Favorability and intra-party preference questions remain context only.',method:'The model emphasizes transparent uncertainty, poll pooling, recency decay, structural priors, and openly documented engineering calibration.',sovereignty:'This page reuses the shared civic data source for organizations, activities and verification links. Official names, addresses and primary-source wording may remain in Chinese for accuracy.'};if(lead&&copy[page])lead.textContent=copy[page];
    const hero=$('.hero')||$('.home-hero');if(hero){const note=document.createElement('p');note.className='en-note';note.textContent='English uses the same HTML, JavaScript and data sources as Chinese. Proper names and primary-source wording may remain in Chinese where no reliable official English form is available.';hero.appendChild(note);}
  }

  addQuickActions();
  if(page==='mayor'){addMapLegend('mayorLegend');addMayorTrend();}
  if(page==='council'){addMapLegend('councilLegend');addCouncilTrend();rebuildArchive();}
  if(page==='president'){addMapLegend('presidentLegend');addPresidentTrend();}
  if(page==='method')addMethod();
  translate();
})();
