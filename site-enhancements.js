(() => {
  const E = window.ELECTION_DATA;
  const R = window.SITE_RESEARCH || {};
  if (!E) return;

  const page = document.body.dataset.page || "home";
  const params = new URLSearchParams(location.search);
  const storedLang = (() => { try { return localStorage.getItem("tcsm-lang"); } catch (_) { return null; } })();
  const lang = params.get("lang") === "en" || (!params.has("lang") && storedLang === "en") ? "en" : "zh";
  const isEn = lang === "en";
  const $ = (s, root = document) => root.querySelector(s);
  const byId = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat(isEn ? "en-US" : "zh-TW");
  const pct = n => `${Number(n).toFixed(1)}%`;
  const esc = v => String(v ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const normalizeName = n => String(n || "").replaceAll("台", "臺");
  const normalizeObject = obj => {
    const total = Object.values(obj).reduce((s, v) => s + Number(v || 0), 0) || 1;
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, Number(v || 0) / total * 100]));
  };
  const sortedShares = obj => Object.entries(obj).sort((a, b) => b[1] - a[1]);
  const sumKeys = (obj, keys = []) => keys.reduce((s, k) => s + Number(obj?.[k] || 0), 0);
  const countyIndex = Object.fromEntries(E.counties.map(c => [c.name, c]));
  const party = k => E.parties[k] || E.parties.OTHER;

  const countyEn = {
    "基隆市":"Keelung City","臺北市":"Taipei City","新北市":"New Taipei City","桃園市":"Taoyuan City","臺中市":"Taichung City","臺南市":"Tainan City","高雄市":"Kaohsiung City","宜蘭縣":"Yilan County","新竹縣":"Hsinchu County","新竹市":"Hsinchu City","苗栗縣":"Miaoli County","彰化縣":"Changhua County","南投縣":"Nantou County","雲林縣":"Yunlin County","嘉義縣":"Chiayi County","嘉義市":"Chiayi City","屏東縣":"Pingtung County","臺東縣":"Taitung County","花蓮縣":"Hualien County","澎湖縣":"Penghu County","金門縣":"Kinmen County","連江縣":"Lienchiang County"
  };
  const candidateEn = {
    "沈伯洋":"Puma Shen","蔣萬安":"Chiang Wan-an","蘇巧慧":"Su Chiao-hui","李四川":"Lee Szechuan","黃世杰":"Huang Shih-chieh","張善政":"Chang San-cheng","何欣純":"Ho Hsin-chun","江啟臣":"Johnny Chiang","陳亭妃":"Chen Ting-fei","謝龍介":"Hsieh Lung-chieh","賴瑞隆":"Lai Jui-lung","柯志恩":"Ko Chih-en","林國漳":"Lin Kuo-chang","吳宗憲":"Wu Tsung-hsien","鄭朝方":"Cheng Chao-fang","徐欣瑩":"Hsu Hsin-ying","莊競程":"Chuang Ching-cheng","高虹安":"Kao Hung-an","陳品安":"Chen Pin-an","鍾東錦":"Chung Tung-chin","陳素月":"Chen Su-yueh","魏平政":"Wei Ping-cheng","邱建富":"Chiu Chien-fu","温世政":"Wen Shih-cheng","許淑華":"Hsu Shu-hua","劉建國":"Liu Chien-kuo","張嘉郡":"Chang Chia-chun","蔡易餘":"Tsai Yi-yu","吳品叡":"Wu Pin-rui","王美惠":"Wang Mei-hui","張啓楷":"Chang Chi-kai","周春米":"Chou Chun-mi","蘇清泉":"Su Ching-chuan","陳瑩":"Chen Ying","吳秀華":"Wu Hsiu-hua","賴清德":"Lai Ching-te","盧秀燕":"Lu Shiow-yen","柯文哲":"Ko Wen-je"
  };
  const partyEn = {DPP:"DPP", KMT:"KMT", TPP:"TPP", IND:"Independent / alliance", OTHER:"Other", JRP:"Judicial Reform Party", TWP:"Taiwan Labor Party"};

  function daysBetween(a, b) {
    return Math.max(0, Math.round((new Date(`${b}T00:00:00+08:00`) - new Date(`${a}T00:00:00+08:00`)) / 86400000));
  }
  function pollWeightAt(poll, halfLife, cutoff) {
    const age = daysBetween(poll.fieldEnd, cutoff);
    const samplingSigma = poll.moe ? Number(poll.moe) / 1.96 : poll.n ? 50 / Math.sqrt(Number(poll.n)) : 3 / 1.96;
    const variance = samplingSigma ** 2 + E.model.pollErrorFloor ** 2;
    const recency = Math.pow(2, -age / halfLife);
    return { weight: (poll.quality ?? 0.9) * recency / variance, age, variance, recency };
  }
  function poolPollsAt(polls, ids, halfLife, cutoff) {
    const totals = Object.fromEntries(ids.map(id => [id, 0]));
    const infos = Object.fromEntries(ids.map(id => [id, 0]));
    let info = 0;
    polls.filter(p => p.fieldEnd <= cutoff && p.useInModel !== false).sort((a,b)=>a.fieldEnd.localeCompare(b.fieldEnd)).forEach(p => {
      const present = ids.filter(id => Number(p.values?.[id] || 0) > 0);
      if (!present.length) return;
      const norm = normalizeObject(Object.fromEntries(present.map(id => [id, Number(p.values[id])])));
      const w = pollWeightAt(p, halfLife, cutoff);
      present.forEach(id => { totals[id] += norm[id] * w.weight; infos[id] += w.weight; });
      info += w.weight;
    });
    if (!info) return null;
    const shares = {};
    ids.forEach(id => shares[id] = infos[id] ? totals[id] / infos[id] : 0);
    return { shares: normalizeObject(shares), info };
  }
  function precisionBlendAt(pool, prior, priorPrecision, cap) {
    if (!pool) return { shares: normalizeObject(prior), lambda: 0 };
    const lambda = Math.min(cap, pool.info / (pool.info + priorPrecision));
    const keys = [...new Set([...Object.keys(prior), ...Object.keys(pool.shares)])];
    const raw = {};
    keys.forEach(k => raw[k] = (pool.shares[k] || 0) * lambda + (prior[k] || 0) * (1 - lambda));
    return { shares: normalizeObject(raw), lambda };
  }
  function mayorPrior(county, race) {
    const c = countyIndex[county], raw = {};
    race.candidates.forEach(x => {
      if (x.manualPrior != null) { raw[x.id] = Number(x.manualPrior); return; }
      const local = x.manualLocal2022 ?? sumKeys(c.m2022, x.baseKeys);
      const national = sumKeys(c.p2024, x.baseKeys);
      raw[x.id] = (local * E.model.localPrior2022Weight + national * E.model.localPrior2024Weight) * (x.priorScale ?? 1);
    });
    return normalizeObject(raw);
  }
  function mayorSeatsAt(cutoff) {
    const counts = {DPP:0,KMT:0,TPP:0,IND:0,OTHER:0};
    Object.entries(E.mayorRaces).forEach(([county, race]) => {
      const ids = race.candidates.map(x => x.id);
      const polls = E.mayorPolls.filter(p => p.county === county && p.fieldEnd <= cutoff && p.useInModel !== false);
      const pool = poolPollsAt(polls, ids, E.model.localHalfLifeDays, cutoff);
      const mixed = precisionBlendAt(pool, mayorPrior(county, race), E.model.localPriorPrecision, E.model.localPollCap);
      const top = sortedShares(mixed.shares)[0]?.[0];
      const leader = race.candidates.find(x => x.id === top);
      const key = leader?.party && counts[leader.party] != null ? leader.party : "OTHER";
      counts[key]++;
    });
    counts.OTHER += counts.IND;
    delete counts.IND;
    return counts;
  }
  function historicalPartyPolls() {
    const older = (R.historicalPartyPolls || []).filter(p => p.type === "party_support" && p.useInModel !== false);
    const now = (E.councilPolls || []).filter(p => p.useInModel !== false);
    const seen = new Set();
    return [...older, ...now].filter(p => {
      const key = `${p.fieldEnd}|${p.pollster}`;
      if (seen.has(key)) return false;
      seen.add(key); return true;
    });
  }
  function councilNationalAt(cutoff) {
    const ids = ["DPP","KMT","TPP"];
    const pool = poolPollsAt(historicalPartyPolls(), ids, E.model.councilHalfLifeDays, cutoff);
    const prior = {DPP:E.national2024.DPP,KMT:E.national2024.KMT,TPP:E.national2024.TPP};
    return precisionBlendAt(pool, prior, E.model.councilPriorPrecision, E.model.councilPollCap).shares;
  }
  function largestRemainder(values, target) {
    const entries = Object.entries(values);
    const floors = Object.fromEntries(entries.map(([k,v]) => [k, Math.floor(v)]));
    let left = target - Object.values(floors).reduce((a,b)=>a+b,0);
    entries.map(([k,v]) => [k, v - Math.floor(v)]).sort((a,b)=>b[1]-a[1]).forEach(([k]) => { if (left > 0) { floors[k]++; left--; } });
    return floors;
  }
  function councilSeatsAt(cutoff) {
    const s = councilNationalAt(cutoff);
    const base = R.councilSeatBaseline || {total:910,DPP:277,KMT:367,TPP:14,OTHER:252};
    const raw = {
      DPP: base.DPP * (s.DPP / E.national2024.DPP),
      KMT: base.KMT * (s.KMT / E.national2024.KMT),
      TPP: base.TPP * (s.TPP / E.national2024.TPP),
      OTHER: base.OTHER
    };
    const scale = base.total / Object.values(raw).reduce((a,b)=>a+b,0);
    return largestRemainder(Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,v*scale])), base.total);
  }
  function presidentNationalAt(cutoff) {
    const ids = E.president.candidates.map(x => x.id);
    const pool = poolPollsAt(E.president.polls || [], ids, E.model.presidentialHalfLifeDays, cutoff);
    const pMap = {lai2028:"DPP",lu2028:"KMT",ko2028:"TPP"};
    const prior = {DPP:E.national2024.DPP,KMT:E.national2024.KMT,TPP:E.national2024.TPP};
    if (!pool) return {lai2028:prior.DPP,lu2028:prior.KMT,ko2028:prior.TPP};
    const partyPool = {info:pool.info, shares:Object.fromEntries(ids.map(id=>[pMap[id],pool.shares[id]]))};
    const mixed = precisionBlendAt(partyPool, prior, E.model.presidentialPriorPrecision, E.model.presidentialPollCap).shares;
    return {lai2028:mixed.DPP,lu2028:mixed.KMT,ko2028:mixed.TPP};
  }
  function presidentVotesAt(cutoff) {
    const s = presidentNationalAt(cutoff);
    const total = E.national2024.validVotes;
    return { shares:s, votes:largestRemainder(Object.fromEntries(Object.entries(s).map(([k,v])=>[k,total*v/100])), total), total };
  }
  function monthSeries() {
    const out = [];
    const startY = 2024, startM = 0;
    const end = new Date(`${R.asOf || E.asOf}T00:00:00+08:00`);
    for (let y=startY, m=startM; y<end.getFullYear() || (y===end.getFullYear() && m<=end.getMonth()); ) {
      const month = `${y}-${String(m+1).padStart(2,"0")}`;
      const last = new Date(y, m+1, 0);
      let cutoff = `${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,"0")}-${String(last.getDate()).padStart(2,"0")}`;
      if (y===end.getFullYear() && m===end.getMonth()) cutoff = R.asOf || E.asOf;
      out.push({month,cutoff});
      m++; if (m===12){m=0;y++;}
    }
    return out;
  }

  function addQuickActions() {
    if ($(".quick-actions")) return;
    const wrap = document.createElement("aside");
    wrap.className = "quick-actions";
    wrap.setAttribute("aria-label", isEn ? "Quick links" : "快速連結");
    const ig = document.createElement("a");
    ig.className = "quick-action";
    ig.href = R.igUrl || "https://www.instagram.com/taiwan.independence.movement/";
    ig.target = "_blank"; ig.rel = "noopener noreferrer"; ig.textContent = "IG";
    const toggle = document.createElement("button");
    toggle.type = "button"; toggle.className = "quick-action lang"; toggle.textContent = isEn ? "中文版" : "英文版";
    toggle.addEventListener("click", () => {
      const url = new URL(location.href);
      if (isEn) url.searchParams.delete("lang"); else url.searchParams.set("lang", "en");
      try { localStorage.setItem("tcsm-lang", isEn ? "zh" : "en"); } catch (_) {}
      location.href = url.toString();
    });
    wrap.append(ig, toggle); document.body.appendChild(wrap);
  }
  function enrichMapLegend(id) {
    const node = byId(id); if (!node || node.querySelector(".map-reading-legend")) return;
    const more = document.createElement("div");
    more.className = "map-reading-legend";
    more.innerHTML = `<b>${isEn?"Lead margin":"領先差深淺"}</b><span class="opacity-chip"><i></i>&lt;3pp</span><span class="opacity-chip"><i></i>3–8pp</span><span class="opacity-chip"><i></i>8–15pp</span><span class="opacity-chip"><i></i>15pp+</span><span>${isEn?"Color = leading party; darker = larger lead":"顏色＝領先陣營；越深＝領先越多"}</span>`;
    node.appendChild(more);
  }

  function chartColors(key) { return party(key).color || "#8995a1"; }
  function drawLineChart(canvas, labels, series, opts = {}) {
    const parent = canvas.parentElement;
    const render = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(300, Math.floor(rect.width)), h = Math.max(240, Math.floor(rect.height));
      canvas.width = Math.floor(w*dpr); canvas.height = Math.floor(h*dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d"); ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      const mobile = w < 600, pad = {l:mobile?48:64,r:18,t:18,b:44};
      const plotW = w-pad.l-pad.r, plotH = h-pad.t-pad.b;
      const all = series.flatMap(s=>s.values).filter(Number.isFinite);
      const maxVal = opts.max ?? Math.max(...all, 1), minVal = opts.min ?? 0;
      const top = maxVal === minVal ? maxVal+1 : maxVal;
      const textColor = getComputedStyle(document.body).color || "#dce8f2";
      ctx.font = `${mobile?10:11}px system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif`;
      ctx.textBaseline = "middle";
      for(let i=0;i<=5;i++){
        const y = pad.t + plotH*i/5, value = top-(top-minVal)*i/5;
        ctx.strokeStyle = "rgba(130,150,166,.20)"; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(w-pad.r,y); ctx.stroke();
        ctx.fillStyle = textColor; ctx.globalAlpha=.64; ctx.textAlign="right"; ctx.fillText(opts.yFormat?opts.yFormat(value):Math.round(value).toLocaleString(),pad.l-8,y); ctx.globalAlpha=1;
      }
      const tickEvery = mobile ? 12 : 6;
      labels.forEach((lab,i)=>{ if(i%tickEvery!==0 && i!==labels.length-1)return; const x=pad.l+(labels.length===1?0:plotW*i/(labels.length-1)); ctx.fillStyle=textColor;ctx.globalAlpha=.62;ctx.textAlign="center";ctx.fillText(lab,x,h-19);ctx.globalAlpha=1; });
      series.forEach(s=>{
        ctx.strokeStyle=s.color;ctx.lineWidth=2.3;ctx.lineJoin="round";ctx.lineCap="round";ctx.beginPath();
        s.values.forEach((v,i)=>{const x=pad.l+(labels.length===1?0:plotW*i/(labels.length-1)),y=pad.t+plotH*(top-v)/(top-minVal); if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
        const v=s.values[s.values.length-1],x=w-pad.r,y=pad.t+plotH*(top-v)/(top-minVal);ctx.fillStyle=s.color;ctx.beginPath();ctx.arc(x,y,3.4,0,Math.PI*2);ctx.fill();
      });
      ctx.strokeStyle="rgba(130,150,166,.35)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,h-pad.b);ctx.lineTo(w-pad.r,h-pad.b);ctx.stroke();
    };
    render();
    if (window.ResizeObserver) new ResizeObserver(render).observe(parent); else window.addEventListener("resize", render, {passive:true});
  }
  function chartSection({eyebrow,title,copy,series,labels,yFormat,max,latestHtml,caption}) {
    const section = document.createElement("section"); section.className="panel trend-panel";
    section.innerHTML = `<div class="panel-heading"><div class="trend-copy"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2><p class="muted">${esc(copy)}</p></div></div><div class="trend-chart-shell"><div class="chart-legend">${series.map(s=>`<span><i style="background:${s.color}"></i>${esc(s.label)}</span>`).join("")}</div><div class="trend-canvas-wrap"><canvas role="img" aria-label="${esc(title)}"></canvas></div><p class="chart-caption">${esc(caption)}</p></div>${latestHtml||""}`;
    requestAnimationFrame(()=>drawLineChart($("canvas",section),labels,series,{yFormat,max}));
    return section;
  }
  function insertBeforePolls(section) {
    const main = $("main"); if (!main) return;
    const panels = [...main.querySelectorAll(":scope > section.panel")];
    const poll = panels.find(p => /POLL ARCHIVE|NATIONAL SIGNALS|DIRECT POLLS/.test(p.textContent));
    if (poll) main.insertBefore(section,poll); else main.appendChild(section);
  }
  function projectionCards(items) {
    return `<div class="latest-projection">${items.map(x=>`<div class="projection-card"><strong style="color:${x.color||"inherit"}">${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join("")}</div>`;
  }

  function addMayorTrend() {
    if (byId("mayorTrendChart")) return;
    const months=monthSeries(), points=months.map(m=>mayorSeatsAt(m.cutoff));
    const keys=["DPP","KMT","TPP","OTHER"];
    const series=keys.map(k=>({key:k,label:isEn?(partyEn[k]||k):party(k).short,color:chartColors(k),values:points.map(p=>p[k]||0)}));
    const latest=points.at(-1);
    const section=chartSection({eyebrow:"MONTHLY BACKCAST",title:isEn?"2026 mayor forecast by month":"2026縣市長全國席次月度預測",copy:isEn?"Each point reruns the model using only polls available by that month-end. The 22 county/city chief offices are counted by the model leader.":"每個月以該月底以前已存在的可比民調重新計算，統計22個縣市長席次由哪個陣營在模型中領先。",labels:months.map(m=>m.month),series,max:22,yFormat:v=>Math.round(v),caption:isEn?"Historical backcast, not a record of forecasts published at those dates. Older polls lose weight through the same recency-decay formula.":"此為歷史回推（backcast），不是本站當月曾發布的預測紀錄；舊民調同樣依時間衰減降權。",latestHtml:projectionCards(keys.map(k=>({label:isEn?`${partyEn[k]||k} — current leading offices`:`${party(k).short}｜目前模型領先席次`,value:`${latest[k]||0} / 22`,color:chartColors(k)}))});
    section.id="mayorTrendChart";insertBeforePolls(section);
  }
  function addCouncilTrend() {
    if (byId("councilTrendChart")) return;
    const months=monthSeries(), points=months.map(m=>councilSeatsAt(m.cutoff));
    const keys=["DPP","KMT","TPP","OTHER"];
    const series=keys.map(k=>({key:k,label:isEn?(partyEn[k]||k):party(k).short,color:chartColors(k),values:points.map(p=>p[k]||0)}));
    const latest=points.at(-1), total=R.councilSeatBaseline?.total||910;
    const section=chartSection({eyebrow:"LOW-CONFIDENCE SEAT PROXY",title:isEn?"2026 council seat proxy by month":"2026縣市議員全國總席次月度預測",copy:isEn?"A low-confidence seat proxy converts the recency-weighted national party swing into seats using the actual 2022 seat baseline, then normalizes back to 910 seats.":"以時間衰減後的全國政黨民意擺動，套用2022實際議員席次基準，再正規化回全國910席。這是低信心席次proxy，不等同逐選區候選人模型。",labels:months.map(m=>m.month),series,max:Math.max(450,...series.flatMap(s=>s.values))*1.06,yFormat:v=>Math.round(v),caption:isEn?"Multi-member districts, candidate supply, local factions and vote allocation can produce large errors. Use this chart as a national direction indicator only.":"多席次選區、候選人數、地方派系與配票都可能造成很大誤差；此圖只適合判讀全國方向。",latestHtml:projectionCards(keys.map(k=>({label:isEn?`${partyEn[k]||k} — projected seats`:`${party(k).short}｜預測席次`,value:`${latest[k]||0} / ${total}`,color:chartColors(k)}))});
    section.id="councilTrendChart";insertBeforePolls(section);
  }
  function addPresidentTrend() {
    if (byId("presidentTrendChart")) return;
    const months=monthSeries(), points=months.map(m=>presidentVotesAt(m.cutoff));
    const meta={lai2028:{party:"DPP",zh:"賴清德",en:"Lai Ching-te"},lu2028:{party:"KMT",zh:"盧秀燕",en:"Lu Shiow-yen"},ko2028:{party:"TPP",zh:"柯文哲",en:"Ko Wen-je"}};
    const keys=Object.keys(meta);
    const series=keys.map(k=>({key:k,label:isEn?meta[k].en:meta[k].zh,color:chartColors(meta[k].party),values:points.map(p=>p.votes[k]||0)}));
    const latest=points.at(-1);
    const section=chartSection({eyebrow:"NATIONAL VOTE SCENARIO",title:isEn?"2028 presidential national vote forecast by month":"2028總統大選全國總得票月度預測",copy:isEn?"The scenario uses only directly comparable presidential vote questions. Monthly points are converted to votes using the fixed 2024 valid-vote baseline of 13,947,506.":"只使用可直接比較的總統投票情境題；每月比例以2024總統大選全國有效票13,947,506作固定基準換算為總票數。",labels:months.map(m=>m.month),series,max:Math.max(...series.flatMap(s=>s.values))*1.08,yFormat:v=>`${(v/1000000).toFixed(v>=1000000?1:2)}M`,caption:isEn?"This is a conditional share comparison, not a forecast of 2028 turnout or total valid ballots. Candidate nominations remain unsettled.":"這是條件式份額比較，不是2028投票率或有效票總量預測；候選人也尚未正式提名。",latestHtml:projectionCards(keys.map(k=>({label:isEn?`${meta[k].en} — national vote`:`${meta[k].zh}｜全國預測總票`,value:`${fmt.format(latest.votes[k])} (${pct(latest.shares[k])})`,color:chartColors(meta[k].party)}))});
    section.id="presidentTrendChart";insertBeforePolls(section);
  }

  function typeLabel(type) { return type === "party_support" ? (isEn?"Party support":"政黨支持／傾向") : (isEn?"Favorability / context":"好感度／背景"); }
  function rebuildNationalArchive() {
    const node=byId("nationalArchive"); if(!node) return;
    const combined=[...(R.historicalPartyPolls||[]),...(E.councilPolls||[]).map(p=>({...p,type:"party_support"}))].sort((a,b)=>b.fieldEnd.localeCompare(a.fieldEnd));
    node.className="table-wrap";
    node.innerHTML=`<p class="research-table-note">${isEn?"Newest first. Only rows marked ‘Model input’ enter the council national-swing model; favorability and other non-comparable questions remain visible as context.":"依民調時間由近至遠。只有標示「納入模型」的同口徑政黨支持／傾向題進入議員全國擺動模型；好感度等不同題型仍公開保留，但不混算。"}</p><table><thead><tr><th>${isEn?"Date":"日期"}</th><th>${isEn?"Poll / type":"民調／題型"}</th><th>DPP</th><th>KMT</th><th>TPP</th><th>${isEn?"Sample / MOE":"樣本／誤差"}</th><th>${isEn?"Use":"模型"}</th><th>${isEn?"Source":"來源"}</th></tr></thead><tbody>${combined.map(p=>`<tr><td>${esc(p.datePrecision==="month"?p.fieldEnd.slice(0,7):p.fieldEnd)}</td><td><b>${esc(p.pollster)}</b><br><span class="muted">${esc(typeLabel(p.type))}</span><br><span class="muted">${esc(p.note||"")}</span></td><td>${p.values?.DPP!=null?`${p.values.DPP}%`:"—"}</td><td>${p.values?.KMT!=null?`${p.values.KMT}%`:"—"}</td><td>${p.values?.TPP!=null?`${p.values.TPP}%`:"—"}</td><td>${p.n?fmt.format(p.n):"—"}${p.moe?`<br><span class="muted">95% ±${p.moe}%</span>`:""}</td><td><span class="research-tag ${p.useInModel===false?"context":"model"}">${p.useInModel===false?(isEn?"Context":"背景"):(isEn?"Model input":"納入模型")}</span></td><td>${p.url?`<a class="external" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${isEn?"Source":"來源"} ↗</a>`:"—"}</td></tr>`).join("")}</tbody></table>`;
  }
  function addMethodExtensions() {
    const grid=$(".formula-grid"); if(!grid || byId("modelExtensions")) return;
    const wrap=document.createElement("section");wrap.id="modelExtensions";wrap.className="method-addon-grid";
    wrap.innerHTML=`<article class="method-addon"><p class="eyebrow">10 — COUNCIL SEAT PROXY</p><h2>${isEn?"Convert national swing to 910 seats":"將全國擺動轉為910席"}</h2><code>RawSeat_c = Seat2022_c × (Share_c / Pres2024Share_c)\nSeats = normalize(RawSeat_DPP, RawSeat_KMT, RawSeat_TPP, Other2022) → 910</code><p>${isEn?"This is intentionally low confidence. It anchors to the actual 2022 council seats, then applies the model’s national party swing. Multi-member districts and candidate-level effects are not solved by this formula.":"這是刻意標示低信心的席次proxy：以2022實際議員席次為基準，再套用模型的全國政黨擺動；它無法解決多席次選區、候選人個人票與地方派系效應。"}</p></article><article class="method-addon"><p class="eyebrow">11 — MONTHLY BACKCAST</p><h2>${isEn?"Recalculate with information available at each month-end":"每月底只用當時已存在資料重算"}</h2><code>Forecast_m = Model({ polls | fieldEnd ≤ monthEnd_m })</code><p>${isEn?"The trend charts are backcasts, not retroactive claims that the site published those forecasts. The same inverse-variance and recency-decay rules are applied at every point.":"趨勢圖是歷史回推，不是把今天的結果冒充成當時已發布的預測；每個月都使用相同的逆變異權重與時間衰減規則。"}</p></article>`;
    grid.insertAdjacentElement("afterend",wrap);
  }

  const exactTranslations = new Map(Object.entries({
    "台灣公民與主權地圖":"Taiwan Civic & Sovereignty Map","2026縣市長":"2026 Mayors","2026縣市議員":"2026 Councils","2028總統":"2028 President","票數預測公式":"Forecast Method","主權活動資訊":"Civic & Sovereignty","選舉民調、透明模型、主權活動，各自獨立成頁。":"Election polling, transparent models and civic information — organized in one maintainable site.","2026縣市長選舉":"2026 County & City Mayoral Elections","2026縣市議員選舉":"2026 County & City Council Elections","2028總統大選":"2028 Presidential Election","縣市長預測地圖":"Mayoral forecast map","政黨總票結構地圖":"Party vote structure map","2028情境縣市地圖":"2028 scenario map","票數預測結果":"Vote forecast","各縣市票數預測":"County/city vote forecast","縣市票數預測":"County/city vote forecast","2024總統大選後公開民調資料庫":"Public poll archive since the 2024 presidential election","全國政黨民調訊號":"National party polling signals","2024總統大選後長期民調查證索引":"Long-run polling archive since 2024","可直接納入的2028投票情境民調":"Directly comparable 2028 voting scenarios","歷史預測版本":"Forecast version history","權威科學論文與用途":"Academic sources and their use","本站工程參數":"Model calibration parameters","論文支持什麼？本站自行決定什麼？":"What the literature supports vs. what this site calibrates","公開組織與活動":"Public organizations and events","查證來源":"Sources","模型資料日":"Model data date","目前模式":"Current mode","情境模擬":"Scenario simulation","資料原則":"Data principle","公開可查證":"Public and verifiable","目前預測單位":"Current forecast unit","政黨總票":"Party vote structure","非候選人席次":"Not candidate-level seats","查看公式":"Method","進入頁面 →":"Open page →","查看公式 →":"View method →","查看地圖 →":"Open map →","地圖復位":"Reset map","最新資料日":"Latest data date","來源":"Source","縣市":"County / city","信心":"Confidence","說明":"Notes","截止":"Field end","未表態":"Undecided","模型":"Model","背景":"Context","納入":"Included","日期":"Date","目前版本":"Current","歷史版本":"History"}));
  const partialTranslations = [
    [/底圖：OpenStreetMap/g,"Base map: OpenStreetMap"],[/顏色代表/g,"Colors represent"],[/民進黨/g,"DPP"],[/國民黨/g,"KMT"],[/民眾黨/g,"TPP"],[/無黨／合作/g,"Independent / alliance"],[/無黨/g,"Independent"],[/其他／未定/g,"Other / TBD"],[/其他/g,"Other"],[/模型領先縣市/g,"Counties/cities led in model"],[/有可比民調縣市/g,"Counties/cities with comparable polls"],[/領先差/g,"Lead margin"],[/民調比重/g,"Poll weight"],[/預測比例／票數/g,"Forecast share / votes"],[/調查／委託/g,"Poll / sponsor"],[/樣本／誤差/g,"Sample / MOE"],[/原始結果/g,"Raw result"],[/政黨傾向/g,"party preference"],[/支持度/g,"support"],[/低信心/g,"low confidence"],[/偏低/g,"low"],[/中高/g,"medium-high"],[/來源品質係數下調/g,"source-quality coefficient reduced"],[/較舊民調，時間衰減後權重很低/g,"older poll; strongly down-weighted by recency decay"]
  ];
  function translateDom() {
    if(!isEn) return;
    document.documentElement.lang="en";
    const titles={home:"Taiwan Civic & Sovereignty Map",mayor:"2026 Mayoral Elections | Taiwan Civic & Sovereignty Map",council:"2026 Council Elections | Taiwan Civic & Sovereignty Map",president:"2028 Presidential Election | Taiwan Civic & Sovereignty Map",method:"Forecast Method | Taiwan Civic & Sovereignty Map",sovereignty:"Civic & Sovereignty Information | Taiwan Civic & Sovereignty Map"};
    document.title=titles[page]||titles.home;
    document.querySelectorAll("a[href$='.html'],a[href*='.html?']").forEach(a=>{try{const u=new URL(a.href);u.searchParams.set("lang","en");a.href=u.toString()}catch(_){}});
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>{if(!n.nodeValue.trim()||["SCRIPT","STYLE","CODE"].includes(n.parentElement?.tagName))return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(n=>{let raw=n.nodeValue,trim=raw.trim();if(exactTranslations.has(trim)){n.nodeValue=raw.replace(trim,exactTranslations.get(trim));return;}let out=raw;partialTranslations.forEach(([re,to])=>out=out.replace(re,to));Object.entries(countyEn).forEach(([zh,en])=>out=out.replaceAll(zh,en));Object.entries(candidateEn).forEach(([zh,en])=>out=out.replaceAll(zh,en));n.nodeValue=out;});
    const lead=$(".hero > div:first-child p:not(.eyebrow)");
    const copy={home:"Public polling, historical election structure, model parameters, forecast history and OpenStreetMap choropleths are presented from shared data sources. Forecasts are conditional estimates, not guarantees.",mayor:"The model combines comparable candidate polls with 2022 local-election structure and 2024 presidential county-level structure. Polls are weighted by total error, source quality and recency.",council:"Before candidate and district slates are fully fixed, the site estimates national party swing and a clearly labeled low-confidence seat proxy. Candidate-level and district effects remain a major uncertainty.",president:"Formal nominations are still distant. Only directly asked presidential voting scenarios enter the model; favorability and intra-party preference questions remain context only.",method:"The model emphasizes transparent uncertainty: polling error exceeds sampling MOE, multiple polls should be pooled, older information should lose weight, and structural priors should stabilize sparse races.",sovereignty:"This page reuses the shared civic data source for organizations, activities and verification links. Official names, addresses and source records may remain in their original Chinese to avoid altering authoritative wording."};
    if(lead&&copy[page])lead.textContent=copy[page];
    const note=document.createElement("p");note.className="en-note";note.textContent="English UI shares the same HTML, JavaScript and data sources as the Chinese version. Proper names and primary-source wording may remain in Chinese where an official English form is unavailable.";
    const hero=$(".hero")||$(".home-hero");if(hero&&!hero.querySelector(".en-note"))hero.appendChild(note);
  }

  addQuickActions();
  if(page==="mayor"){enrichMapLegend("mayorLegend");addMayorTrend();}
  if(page==="council"){enrichMapLegend("councilLegend");addCouncilTrend();rebuildNationalArchive();}
  if(page==="president"){enrichMapLegend("presidentLegend");addPresidentTrend();}
  if(page==="method")addMethodExtensions();
  translateDom();
})();
