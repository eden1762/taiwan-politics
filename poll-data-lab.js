(() => {
  "use strict";
  const E = window.ELECTION_DATA;
  const C = window.POLL_CONTEXT_DATA || {indicators:[]};
  if (!E) return;
  const el = id => document.getElementById(id);
  const dateNode = el("labAsOf");
  if (dateNode) dateNode.textContent = E.asOf.replaceAll("-", "/");
  const htmlEscape = x => String(x == null ? "" : x).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const asNum = x => Number.isFinite(Number(x)) ? Number(x) : 0;
  const format = new Intl.NumberFormat("zh-TW");
  const polls = E.mayorPolls.filter(p => p && p.county && p.fieldEnd && p.values);
  const counties = E.counties.map(x => x.name);
  const dates = polls.map(p=>p.fieldEnd).sort();
  const fullBaseline = E.counties.reduce((o,x) => {
    o.mayor2022 += asNum(x.mayorVotes2022);
    o.council2022 += asNum(x.councilVotes2022);
    o.president2024 += asNum(x.presidentVotes2024);
    return o;
  },{mayor2022:0,council2022:0,president2024:0});
  const modelEligible = p => window.ELECTION_POLL_QUALITY.modelEligible(p,E.mayorRaces[p.county]?.candidates.map(c=>c.id)||[]);
  const dateSafe = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
  const partyName = id => ({DPP:"民進黨",KMT:"國民黨",TPP:"民眾黨",IND:"無黨籍",OTHER:"其他"}[id] || id);
  const candName = (county,id) => E.mayorRaces[county]?.candidates?.find(c=>c.id===id)?.name || id;
  const samplingName = p => {
    if (p.sampling === "online_nonprobability") return "網路非機率";
    if (p.sampling === "landline_mobile_random") return "市話＋手機";
    if (p.sampling === "landline_random") return "市話電話";
    if (/網路|簡訊|online|EDM/i.test([p.note,p.pollster].join(" "))) return "網路／其他";
    if (/市話|電話|CATI|RDD/i.test(p.note||"")) return "電話";
    return "未完整揭露";
  };
  const selectedCounty = el("countySelect");
  const check = el("includeContext");
  if (!selectedCounty || !check) return;
  selectedCounty.innerHTML = '<option value="">全部22縣市</option>' +
    counties.map(c => '<option value="'+htmlEscape(c)+'">'+htmlEscape(c)+'</option>').join("");
  const summary = (label,number,note) =>
    '<article class="lab-kpi"><div class="lab-muted">'+htmlEscape(label)+'</div><strong>'+htmlEscape(number)+'</strong><small>'+htmlEscape(note)+'</small></article>';

  function renderStats() {
    const actual = polls.filter(p=>modelEligible(p));
    const nKnown = polls.filter(p=>Number.isInteger(p.n) && p.n>0);
    const sumN = nKnown.reduce((s,p)=>s+p.n,0);
    const covered = new Set(polls.map(p=>p.county)).size;
    el("labSummary").innerHTML =
      summary("縣市候選人民調筆數",format.format(polls.length),"含資料不完整與背景類") +
      summary("有調查的縣市",covered+" / 22","不是22縣市都有近期樣本") +
      summary("納入原模型的民調",format.format(actual.length),"其餘依題型／可比性排除") +
      summary("已知樣本數合計",format.format(sumN),"各調查樣本可能重疊，非獨立受訪人數");
    el("baselineSummary").innerHTML =
      summary("2022 縣市長有效票基準合計",format.format(fullBaseline.mayor2022),"原站22縣市歷史投票資料") +
      summary("2022 縣市議員有效票基準合計",format.format(fullBaseline.council2022),"選區、候選人及投票制度不同") +
      summary("2024 總統有效票基準合計",format.format(fullBaseline.president2024),"原站22縣市歷史投票資料");
  }
  function renderCountyBars() {
    const rows = counties.map(name=>({name,total:polls.filter(p=>p.county===name).length,usable:polls.filter(p=>p.county===name && modelEligible(p)).length}));
    const max = Math.max(1,...rows.map(r=>r.total));
    el("countyCoverage").innerHTML=rows.map(r =>
      '<div class="lab-bar-row"><span>'+htmlEscape(r.name)+'</span><div class="lab-bar-track"><div class="lab-bar-fill" style="width:'+
      ((r.total/max)*100).toFixed(1)+'%"></div></div><b>'+r.total+'</b><small>（其中可比 '+r.usable+'）</small></div>'
    ).join("");
  }
  function renderContext() {
    el("opinionContext").innerHTML=C.indicators.map(ind =>
      '<article class="lab-context"><h3>'+htmlEscape(ind.label)+'</h3>'+
      '<p class="lab-muted">'+htmlEscape(ind.period)+'｜'+htmlEscape(ind.scope)+'｜'+htmlEscape(ind.questionType)+'</p>'+
      '<div class="lab-chips">'+Object.entries(ind.values).map(([k,v])=>'<span>'+htmlEscape(k)+'：<b>'+Number(v).toFixed(1)+'%</b></span>').join("")+'</div>'+
      '<p>'+htmlEscape(ind.note)+'</p><p class="lab-muted">機構：'+htmlEscape(ind.pollster)+'；調查：'+htmlEscape(ind.sampling)+
      (ind.n?'；n='+format.format(ind.n):'')+'</p><a href="'+htmlEscape(ind.url)+'" target="_blank" rel="noopener noreferrer">查閱原始調查 ↗</a></article>'
    ).join("");
  }
  function renderMonthly() {
    const count = {};
    polls.forEach(p=>{const m=p.fieldEnd.slice(0,7); if(m>="2026-01")count[m]=(count[m]||0)+1;});
    const keys = Object.keys(count).sort();
    const max=Math.max(1,...keys.map(k=>count[k]));
    el("monthlyChart").innerHTML=keys.map(k =>
      '<div class="lab-bar-row"><span>'+htmlEscape(k)+'</span><div class="lab-bar-track"><div class="lab-bar-fill" style="width:'+
      (count[k]/max*100).toFixed(1)+'%"></div></div><b>'+count[k]+'</b></div>'
    ).join("");
  }
  function renderScatter(county,rows) {
    const container=el("scatterPanel");
    if(!county) {
      container.innerHTML='<p class="lab-muted">選擇單一縣市，即可依調查截止日查看不同機構公布的原始候選人支持度散點；不將不同調查直接連成變化趨勢線。</p>';
      return;
    }
    const candidates=E.mayorRaces[county]?.candidates||[];
    const valid=rows.filter(p=>dateSafe(p.fieldEnd)&&Object.values(p.values).some(x=>Number.isFinite(x)));
    if(!valid.length){container.innerHTML='<p>該縣市目前沒有符合顯示條件的民調。</p>';return;}
    const w=740,h=280,pad=46;
    const ts=valid.map(p=>Date.parse(p.fieldEnd+"T00:00:00+08:00"));
    const min=Math.min(...ts),max=Math.max(...ts),range=Math.max(86400000,max-min);
    const xp=t=>pad+(t-min)/range*(w-pad*2);
    const yp=v=>h-pad-asNum(v)/100*(h-pad*1.6);
    const color=c=>(E.parties[c.party]||E.parties.OTHER).color;
    const points=valid.map((p,i)=>candidates.map((c,j)=>{
      if(!Number.isFinite(p.values[c.id]))return "";
      const x=xp(ts[i]),y=yp(p.values[c.id]);
      return '<circle cx="'+x.toFixed(2)+'" cy="'+y.toFixed(2)+'" r="5.7" fill="'+color(c)+
        '" stroke="#fff" stroke-width="1.6"><title>'+htmlEscape(p.fieldEnd+' / '+p.pollster+' / '+c.name+' '+p.values[c.id]+'%'+(modelEligible(p)?"":"（背景資料）"))+'</title></circle>';
    }).join("")).join("");
    const grids=[0,20,40,60,80,100].map(v=>
      '<line x1="'+pad+'" y1="'+yp(v)+'" x2="'+(w-pad)+'" y2="'+yp(v)+'" stroke="#64748b" opacity=".19"/>'+
      '<text x="4" y="'+(yp(v)+4)+'" fill="currentColor" font-size="12">'+v+'%</text>'
    ).join("");
    const legend=candidates.map(c=>'<span style="--dot:'+color(c)+'"><i></i>'+htmlEscape(c.name)+'</span>').join("");
    container.innerHTML='<div class="lab-chips lab-legend">'+legend+'</div><svg class="lab-svg" role="img" aria-label="'+htmlEscape(county)+'民調散點分布圖" viewBox="0 0 '+w+' '+h+'">'+grids+points+'</svg>'+
      '<p class="lab-muted">橫軸為調查截止日（從 '+htmlEscape(valid.slice().sort((a,b)=>a.fieldEnd.localeCompare(b.fieldEnd))[0].fieldEnd)+
      ' 到 '+htmlEscape(valid.slice().sort((a,b)=>a.fieldEnd.localeCompare(b.fieldEnd)).at(-1).fieldEnd)+
      '），縱軸為各機構報告的原始支持度。圓點不代表勝選機率；滑鼠移至圓點可看來源與百分比。</p>';
  }
  function update() {
    const county=selectedCounty.value;
    const filtered=polls.filter(p=>(!county || p.county===county)&&(check.checked||modelEligible(p)))
      .sort((a,b)=>b.fieldEnd.localeCompare(a.fieldEnd)||a.county.localeCompare(b.county));
    el("dataCount").textContent='顯示 '+format.format(filtered.length)+' / '+format.format(polls.length)+' 筆';
    el("pollTable").innerHTML='<thead><tr><th>縣市</th><th>調查截止日</th><th>調查機構／委託</th><th>原始投票意向</th><th>n／方法</th><th>用途</th><th>原始來源</th></tr></thead><tbody>'+
      filtered.map(p=>'<tr><td>'+htmlEscape(p.county)+'</td><td>'+htmlEscape(p.fieldEnd)+'</td><td><b>'+htmlEscape(p.pollster)+'</b><br><small>'+htmlEscape(p.sponsor||'未標示')+'</small></td><td>'+
      Object.entries(p.values).map(([id,v])=>htmlEscape(candName(p.county,id))+' '+htmlEscape(v)+'%').join('；')+
      '<br><small>未表態：'+(p.undecided==null?'未完整揭露':htmlEscape(p.undecided)+'%')+'</small></td><td>'+
      (p.n?format.format(p.n):'未揭露')+'<br><small>'+htmlEscape(samplingName(p))+'</small></td><td>'+
      (modelEligible(p)?'<span class="lab-pill">可比／模型</span>':'<span class="lab-pill lab-muted-pill">背景／不混算</span>')+
      '<details><summary>方法註記</summary><small>'+htmlEscape(p.note||'請核對原始來源')+'</small></details></td><td><a href="'+htmlEscape(p.url||'#')+'" target="_blank" rel="noopener noreferrer">來源 ↗</a></td></tr>').join('')+'</tbody>';
    renderScatter(county,filtered);
  }
  renderStats();
  renderCountyBars();
  renderMonthly();
  renderContext();
  selectedCounty.addEventListener("change",update);
  check.addEventListener("change",update);
  el("menuButton")?.addEventListener("click",()=>el("mainNav")?.classList.toggle("open"));
  update();
})();
