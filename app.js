(() => {
  const E = window.ELECTION_DATA;
  const C = window.TCSM_DATA || { categories:[], organizations:[], events:[], sources:[] };
  if (!E) return;

  const $ = (s, root=document) => root.querySelector(s);
  const fmt = new Intl.NumberFormat("zh-TW");
  const pct = n => `${Number(n).toFixed(1)}%`;
  const round1 = n => Math.round(n * 10) / 10;
  const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  const daysBetween = (a,b) => Math.max(0, Math.round((new Date(`${b}T00:00:00+08:00`) - new Date(`${a}T00:00:00+08:00`))/86400000));
  const normalizeName = n => String(n||"").replaceAll("台","臺");
  const party = key => E.parties[key] || E.parties.OTHER;
  const partyPill = key => `<span class="party-pill"><i class="swatch" style="background:${party(key).color}"></i>${esc(party(key).short)}</span>`;
  const external = (url,label="來源") => url ? `<a class="external" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>` : "—";

  function weights(poll, halfLife) {
    const age = daysBetween(poll.fieldEnd, E.asOf);
    const sample = poll.n ? Math.sqrt(poll.n / 1000) : 1;
    return (poll.quality ?? 0.9) * sample * Math.pow(2, -age / halfLife);
  }
  function normalizeObject(obj) {
    const total = Object.values(obj).reduce((a,b)=>a+Number(b||0),0) || 1;
    return Object.fromEntries(Object.entries(obj).map(([k,v])=>[k, Number(v||0)/total*100]));
  }
  function poolPolls(polls, candidateIds, halfLife) {
    const totals = Object.fromEntries(candidateIds.map(id=>[id,0]));
    let ws = 0;
    polls.forEach(p => {
      const raw = Object.fromEntries(candidateIds.map(id=>[id, Number(p.values[id]||0)]));
      const norm = normalizeObject(raw);
      const w = weights(p, halfLife);
      candidateIds.forEach(id => totals[id] += norm[id] * w);
      ws += w;
    });
    if (!ws) return null;
    return Object.fromEntries(candidateIds.map(id=>[id, totals[id]/ws]));
  }
  function blend(a,b,lambda) {
    const keys = [...new Set([...Object.keys(a||{}),...Object.keys(b||{})])];
    const out = {};
    keys.forEach(k => out[k] = (a?.[k]||0)*lambda + (b?.[k]||0)*(1-lambda));
    return normalizeObject(out);
  }
  function sortedShares(shares) { return Object.entries(shares).sort((a,b)=>b[1]-a[1]); }
  function confidenceForPolls(polls) {
    if (!polls.length) return {label:"低",cls:"low",reason:"無現行對決民調"};
    const recent = polls.filter(p=>daysBetween(p.fieldEnd,E.asOf)<=120);
    if (recent.length>=2) return {label:"中",cls:"mid",reason:"至少2份近期可比民調"};
    if (recent.length===1) return {label:"中",cls:"mid",reason:"1份近期可比民調"};
    return {label:"偏低",cls:"low",reason:"僅較舊可比民調"};
  }

  const countyIndex = Object.fromEntries(E.counties.map(c=>[c.name,c]));

  function mayorBase(county, race) {
    const c = countyIndex[county];
    const raw = {};
    race.candidates.forEach(x => raw[x.id] = x.manualBase ?? (x.baseKeys||[]).reduce((s,k)=>s+(c.p2024[k]||0),0));
    return normalizeObject(raw);
  }
  function computeMayor() {
    const daysTo = daysBetween(E.asOf,E.localElectionDate);
    const lambda = Math.max(E.model.localPollBlendMin, Math.min(E.model.localPollBlendMax, 0.45 + 0.35*Math.exp(-daysTo/180)));
    const results = {};
    Object.entries(E.mayorRaces).forEach(([county,race])=>{
      const ids = race.candidates.map(c=>c.id);
      const allPolls = E.mayorPolls.filter(p=>p.county===county);
      const polls = allPolls.filter(p=>p.useInModel!==false);
      const base = mayorBase(county,race);
      const pooled = poolPolls(polls,ids,E.model.localHalfLifeDays);
      const forecast = pooled ? blend(pooled,base,lambda) : base;
      const sorted = sortedShares(forecast);
      const leader = race.candidates.find(c=>c.id===sorted[0][0]);
      const runner = race.candidates.find(c=>c.id===sorted[1]?.[0]);
      const volume = countyIndex[county].mayorVotes2022;
      results[county] = {county,race,polls,allPolls,base,pooled,forecast,leader,runner,margin:sorted[0][1]-(sorted[1]?.[1]||0),confidence:confidenceForPolls(polls),volume,lambda:pooled?lambda:0};
    });
    return results;
  }

  function computeCouncil() {
    const ids=["DPP","KMT","TPP"];
    const pooled=poolPolls(E.councilPolls,ids,E.model.localHalfLifeDays);
    const nationalBase={DPP:E.national2024.DPP,KMT:E.national2024.KMT,TPP:E.national2024.TPP};
    const national=blend(pooled,nationalBase,E.model.councilPartyPollBlend);
    const results={};
    E.counties.forEach(c=>{
      const swing={};
      ids.forEach(k=>swing[k]=c.p2024[k]*(national[k]/E.national2024[k]));
      const norm=normalizeObject(swing);
      const six=["臺北市","新北市","桃園市","臺中市","臺南市","高雄市"].includes(c.name);
      const other=(six?E.model.councilOtherShareSixCities:E.model.councilOtherShareOtherCounties)*100;
      const shares={DPP:norm.DPP*(100-other)/100,KMT:norm.KMT*(100-other)/100,TPP:norm.TPP*(100-other)/100,OTHER:other};
      const sorted=sortedShares(shares);
      results[c.name]={county:c.name,shares,leader:sorted[0][0],margin:sorted[0][1]-sorted[1][1],volume:c.councilVotes2022,confidence:{label:"偏低",cls:"low",reason:"全國政黨支持度＋歷史結構，非議員投票題"}};
    });
    return {results,national,pooled};
  }

  function computePresident() {
    const ids=E.president.candidates.map(c=>c.id);
    const pooled=poolPolls(E.president.polls,ids,E.model.presidentialHalfLifeDays);
    const pMap={lai2028:"DPP",lu2028:"KMT",ko2028:"TPP"};
    const pollParty=Object.fromEntries(ids.map(id=>[pMap[id],pooled[id]]));
    const nationalBase={DPP:E.national2024.DPP,KMT:E.national2024.KMT,TPP:E.national2024.TPP};
    const nationalParty=blend(pollParty,nationalBase,E.model.presidentialPollBlend);
    const results={};
    E.counties.forEach(c=>{
      const raw={};
      ["DPP","KMT","TPP"].forEach(k=>raw[k]=c.p2024[k]*(nationalParty[k]/E.national2024[k]));
      const sharesParty=normalizeObject(raw);
      const shares={lai2028:sharesParty.DPP,lu2028:sharesParty.KMT,ko2028:sharesParty.TPP};
      const sorted=sortedShares(shares);
      const leader=E.president.candidates.find(x=>x.id===sorted[0][0]);
      results[c.name]={county:c.name,shares,leader,margin:sorted[0][1]-sorted[1][1],volume:c.presidentVotes2024,confidence:{label:"低",cls:"low",reason:"距2028尚遠且候選人為假設情境"}};
    });
    return {results,nationalParty,pollParty};
  }

  const mayor=computeMayor();
  const council=computeCouncil();
  const president=computePresident();

  function metric(label,value,sub="") { return `<div class="metric"><b>${esc(value)}</b><span>${esc(label)}${sub?`｜${esc(sub)}`:""}</span></div>`; }
  function renderSummary() {
    $("#mayorAsOf").textContent=E.asOf;
    $("#candidateNotice").textContent=E.candidateNotice;
    const leadCounts={}; Object.values(mayor).forEach(r=>leadCounts[r.leader.party]=(leadCounts[r.leader.party]||0)+1);
    $("#mayorSummary").innerHTML=[metric("模型領先縣市",`民進黨 ${leadCounts.DPP||0}`),metric("模型領先縣市",`國民黨 ${leadCounts.KMT||0}`),metric("有可比民調縣市",Object.values(mayor).filter(r=>r.polls.length).length),metric("尚無可比民調縣市",Object.values(mayor).filter(r=>!r.polls.length).length)].join("");
    const nat=Object.entries(council.national).sort((a,b)=>b[1]-a[1]);
    $("#councilSummary").innerHTML=nat.map(([k,v])=>metric(`${party(k).label}｜三黨結構`,pct(v))).concat(metric("資料用途","地方擺動訊號")).join("");
    const pNat=Object.entries(president.nationalParty).sort((a,b)=>b[1]-a[1]);
    $("#presidentSummary").innerHTML=pNat.map(([k,v])=>metric(`${party(k).label}｜全國情境`,pct(v))).concat(metric("模型性質","低信心情境")).join("");
  }

  function legendHtml(keys) { return keys.map(k=>`<span class="legend-item"><i class="swatch" style="background:${party(k).color}"></i>${party(k).label}</span>`).join(""); }

  function candidateSharesHtml(r) {
    return sortedShares(r.forecast).map(([id,share])=>{
      const c=r.race.candidates.find(x=>x.id===id); return `<span class="candidate-line">${esc(c.name)} ${pct(share)}（${fmt.format(Math.round(r.volume*share/100))}票）</span>`;
    }).join("<br>");
  }
  function renderTables() {
    $("#mayorForecastTable").innerHTML=`<thead><tr><th>縣市</th><th>模型領先</th><th>預測比例／票數</th><th>領先差</th><th>民調</th><th>信心</th><th>說明</th></tr></thead><tbody>${E.counties.map(c=>{
      const r=mayor[c.name]; return `<tr><td><b>${c.name}</b></td><td>${partyPill(r.leader.party)} <span class="lead">${esc(r.leader.name)}</span></td><td>${candidateSharesHtml(r)}</td><td>${pct(r.margin)}</td><td>${r.polls.length}份</td><td><span class="confidence ${r.confidence.cls}" title="${esc(r.confidence.reason)}">${r.confidence.label}</span></td><td>${esc(r.race.allianceNote||r.race.note||"—")}</td></tr>`;
    }).join("")}</tbody>`;

    $("#mayorPollTable").innerHTML=`<thead><tr><th>縣市</th><th>調查／委託</th><th>調查截止</th><th>樣本</th><th>結果</th><th>未表態</th><th>模型</th><th>q</th><th>來源</th></tr></thead><tbody>${[...E.mayorPolls].sort((a,b)=>b.fieldEnd.localeCompare(a.fieldEnd)).map(p=>{
      const race=E.mayorRaces[p.county]; const values=Object.entries(p.values).map(([id,v])=>`${race.candidates.find(c=>c.id===id)?.name||id} ${v}%`).join("；");
      const used=p.useInModel===false?`<span class="confidence low">背景</span>`:`<span class="confidence mid">納入</span>`;
      return `<tr><td>${p.county}</td><td><b>${esc(p.pollster)}</b><br><span class="muted">${esc(p.sponsor)}</span></td><td>${p.fieldEnd}</td><td>${p.n?fmt.format(p.n):"—"}${p.moe?`<br><span class="muted">±${p.moe}%</span>`:""}</td><td>${esc(values)}<br><span class="muted">${esc(p.note||"")}</span></td><td>${p.undecided!=null?`${p.undecided}%`:"—"}</td><td>${used}</td><td>${Number(p.quality).toFixed(2)}</td><td>${external(p.url)}</td></tr>`;
    }).join("")}</tbody>`;

    $("#councilForecastTable").innerHTML=`<thead><tr><th>縣市</th><th>主要陣營</th><th>民進黨</th><th>國民黨</th><th>民眾黨</th><th>其他／無黨</th><th>基準有效票量</th><th>信心</th></tr></thead><tbody>${E.counties.map(c=>{const r=council.results[c.name]; const cell=k=>`${pct(r.shares[k])}<br><span class="muted">${fmt.format(Math.round(r.volume*r.shares[k]/100))}票</span>`;return `<tr><td><b>${c.name}</b></td><td>${partyPill(r.leader)}</td><td>${cell("DPP")}</td><td>${cell("KMT")}</td><td>${cell("TPP")}</td><td>${cell("OTHER")}</td><td>${fmt.format(r.volume)}</td><td><span class="confidence low">偏低</span></td></tr>`}).join("")}</tbody>`;

    $("#councilPollTable").innerHTML=`<thead><tr><th>調查</th><th>日期</th><th>樣本</th><th>民進黨</th><th>國民黨</th><th>民眾黨</th><th>中立／無</th><th>用途</th><th>來源</th></tr></thead><tbody>${E.councilPolls.map(p=>`<tr><td><b>${esc(p.pollster)}</b><br><span class="muted">${esc(p.sponsor)}</span></td><td>${p.fieldEnd}</td><td>${p.n?fmt.format(p.n):"—"}</td><td>${p.values.DPP}%</td><td>${p.values.KMT}%</td><td>${p.values.TPP}%</td><td>${p.neutral??"—"}%</td><td>${esc(p.note)}</td><td>${external(p.url)}</td></tr>`).join("")}</tbody>`;

    const pcands=Object.fromEntries(E.president.candidates.map(c=>[c.id,c]));
    $("#presidentForecastTable").innerHTML=`<thead><tr><th>縣市</th><th>模型領先</th><th>賴清德</th><th>盧秀燕</th><th>柯文哲</th><th>領先差</th><th>基準有效票量</th><th>信心</th></tr></thead><tbody>${E.counties.map(c=>{const r=president.results[c.name]; const cell=id=>`${pct(r.shares[id])}<br><span class="muted">${fmt.format(Math.round(r.volume*r.shares[id]/100))}票</span>`;return `<tr><td><b>${c.name}</b></td><td>${partyPill(r.leader.party)} <b>${r.leader.name}</b></td><td>${cell("lai2028")}</td><td>${cell("lu2028")}</td><td>${cell("ko2028")}</td><td>${pct(r.margin)}</td><td>${fmt.format(r.volume)}</td><td><span class="confidence low">低</span></td></tr>`}).join("")}</tbody>`;
    $("#presidentPollTable").innerHTML=`<thead><tr><th>情境／調查</th><th>日期</th><th>樣本</th><th>結果</th><th>未表態</th><th>備註</th><th>來源</th></tr></thead><tbody>${E.president.polls.map(p=>`<tr><td><b>${esc(E.president.scenarioLabel)}</b><br><span class="muted">${esc(p.pollster)}／${esc(p.sponsor)}</span></td><td>${p.fieldEnd}</td><td>${fmt.format(p.n)}</td><td>${Object.entries(p.values).map(([id,v])=>`${pcands[id].name} ${v}%`).join("；")}</td><td>${p.undecided}%</td><td>${esc(p.note)}</td><td>${external(p.url)}</td></tr>`).join("")}</tbody>`;
    $("#presidentContext").innerHTML=E.president.contextPolls.map(p=>`<article class="context-card"><b>不納入模型的背景民調</b><p>${Object.entries(p.values).map(([k,v])=>`${esc(k)} ${v}%`).join("；")}</p><p class="muted">${esc(p.note)}</p>${external(p.url,"查看來源")}</article>`).join("");
  }

  function currentHistory(type) {
    if(type==="mayor") {
      const leadCounts={}; Object.values(mayor).forEach(r=>leadCounts[r.leader.party]=(leadCounts[r.leader.party]||0)+1);
      return {date:E.asOf, label:`第一版｜民進黨領先 ${leadCounts.DPP||0}、國民黨領先 ${leadCounts.KMT||0}、其他 ${Object.values(mayor).length-(leadCounts.DPP||0)-(leadCounts.KMT||0)}`, note:"建立民調＋歷史先驗模型與22縣市地圖"};
    }
    if(type==="council") return {date:E.asOf,label:`第一版｜全國三黨結構：民進黨 ${pct(council.national.DPP)}、國民黨 ${pct(council.national.KMT)}、民眾黨 ${pct(council.national.TPP)}`,note:"正式候選人登記前採政黨總票結構模型"};
    return {date:E.asOf,label:`第一版｜全國情境：民進黨 ${pct(president.nationalParty.DPP)}、國民黨 ${pct(president.nationalParty.KMT)}、民眾黨 ${pct(president.nationalParty.TPP)}`,note:"賴／盧／柯假設情境，低信心"};
  }
  function renderHistory(id,type) {
    const rows=[...(E.history[type]||[]),currentHistory(type)];
    $(id).innerHTML=`<div class="history-list">${rows.map((h,i)=>`<div class="history-item"><time>${esc(h.date)}</time><div><b>${esc(h.label)}</b><span>${esc(h.note||"")}</span></div><span>${i===rows.length-1?"目前版本":"歷史版本"}</span></div>`).join("")}</div><p class="caption">維護規則：每次更新民調／參數前，先把當前摘要寫入 election-data.js 的 history，再更新資料，歷史紀錄才不會被新模型覆蓋。</p>`;
  }

  function renderSources() {
    const src=[E.sources.linzer,E.sources.jackman,E.sources.shirani];
    $("#scienceSources").innerHTML=src.map((s,i)=>`<a class="source-card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(s.title)}</b><span>${i===0?"歷史／結構模型與民調動態結合":i===1?"多份民調 pooling 與 polling-house 差異":"民調總誤差、共同偏誤與額外變異"} ↗</span></a>`).join("");
    $("#modelNote").textContent=E.model.note;
  }

  let geoPromise;
  function getGeo() { return geoPromise ||= fetch(E.geojsonUrl).then(r=>{if(!r.ok)throw new Error("GeoJSON load failed");return r.json()}); }
  function opacityByMargin(m){return m<3?.34:m<8?.48:m<15?.62:.76}
  function createForecastMap(el, resultMap, opts={}) {
    if(!window.L) return;
    const map=L.map(el,{zoomControl:true,attributionControl:true}).setView([23.72,120.95],7);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    getGeo().then(geo=>{
      const layer=L.geoJSON(geo,{style:f=>{const n=normalizeName(f.properties.county);const r=resultMap[n];const key=opts.leaderKey?opts.leaderKey(r):r?.leader?.party||r?.leader;return {color:"#d9e5eb",weight:.7,fillColor:r?party(key).color:"#59646d",fillOpacity:r?opacityByMargin(r.margin):.2}},onEachFeature:(f,l)=>{
        const n=normalizeName(f.properties.county);const r=resultMap[n];if(!r)return;const html=opts.popup?opts.popup(r):`<div class="forecast-popup"><b>${esc(n)}</b></div>`;l.bindPopup(html);l.bindTooltip(n,{sticky:true,className:"map-tooltip"});l.on({mouseover:e=>e.target.setStyle({weight:2}),mouseout:e=>layer.resetStyle(e.target)});
      }}).addTo(map);map.fitBounds(layer.getBounds(),{padding:[8,8]});
    }).catch(()=>{const node=document.getElementById(el);node?.insertAdjacentHTML("afterend",'<p class="notice warning">行政界線暫時載入失敗；預測表仍可正常使用。</p>')});
    return map;
  }

  function setupElectionMaps() {
    $("#mayorLegend").innerHTML=legendHtml(["DPP","KMT","TPP","IND","OTHER"]);
    $("#councilLegend").innerHTML=legendHtml(["DPP","KMT","TPP","OTHER"]);
    $("#presidentLegend").innerHTML=legendHtml(["DPP","KMT","TPP"]);
    createForecastMap("mayorMap",mayor,{popup:r=>`<div class="forecast-popup"><b>${r.county}</b><div>${partyPill(r.leader.party)} ${esc(r.leader.name)} 領先 ${pct(r.margin)}</div><hr>${sortedShares(r.forecast).map(([id,s])=>{const c=r.race.candidates.find(x=>x.id===id);return `<div class="row"><span>${esc(c.name)}</span><b>${pct(s)}</b></div>`}).join("")}<small>${r.polls.length?`${r.polls.length}份可比民調｜${r.confidence.label}信心`:"結構估計｜低信心"}</small></div>`});
    createForecastMap("councilMap",council.results,{leaderKey:r=>r.leader,popup:r=>`<div class="forecast-popup"><b>${r.county}</b>${sortedShares(r.shares).map(([k,s])=>`<div class="row"><span>${party(k).label}</span><b>${pct(s)}</b></div>`).join("")}<small>政黨總票結構，非席次預測</small></div>`});
    createForecastMap("presidentMap",president.results,{popup:r=>`<div class="forecast-popup"><b>${r.county}</b>${E.president.candidates.map(c=>`<div class="row"><span>${c.name}</span><b>${pct(r.shares[c.id])}</b></div>`).join("")}<small>2028假設情境｜低信心</small></div>`});
  }

  function civicItems() {
    const today=new Date(`${E.asOf}T00:00:00+08:00`);
    const orgs=(C.organizations||[]).map(x=>({...x,kind:"org"}));
    const events=(C.events||[]).filter(x=>!x.endDate||new Date(`${x.endDate}T23:59:59+08:00`)>=today).map(x=>({...x,kind:"event"}));
    return [...orgs,...events];
  }
  let civicMap,civicLayer,civicFilter="all",civicQuery="";
  function matchesCivic(x){const filter=civicFilter==="all"||x.category===civicFilter||(civicFilter==="event"&&x.kind==="event");const hay=[x.name,x.englishName,x.type,x.address,x.host,x.demand,...(x.tags||[])].join(" ").toLowerCase();return filter&&hay.includes(civicQuery.toLowerCase())}
  function renderCivic() {
    const items=civicItems().filter(matchesCivic); $("#civicCount").textContent=`${items.length} 筆`;
    $("#civicCards").innerHTML=items.length?items.map(x=>`<article class="data-card"><span class="source-badge">${x.kind==="event"?"公開活動":"公開組織"}</span><h3>${esc(x.name)}</h3><p>${esc(x.type||"")}</p><p>${esc(x.address||x.area||x.demand||"")}</p><div class="tags">${(x.tags||[]).slice(0,5).map(t=>`<span>${esc(t)}</span>`).join("")}</div>${external(x.officialUrl||x.signupUrl||x.sourceUrl,"官方／查證")}</article>`).join(""):`<p class="no-data">沒有符合條件的公開資料。</p>`;
    if(civicLayer){civicLayer.clearLayers();items.forEach(x=>{if(Number.isFinite(x.lat)&&Number.isFinite(x.lng)){const color=x.kind==="event"?"#f0c46b":"#66d2c7";L.circleMarker([x.lat,x.lng],{radius:7,color,fillColor:color,fillOpacity:.82,weight:1}).bindPopup(`<b>${esc(x.name)}</b><br>${esc(x.address||x.area||"")}<br>${external(x.officialUrl||x.signupUrl||x.sourceUrl)}`).addTo(civicLayer)}})}
  }
  function setupCivic() {
    const cats=C.categories||[]; $("#civicFilters").innerHTML=cats.map(c=>`<button class="filter-button ${c.key==="all"?"active":""}" data-filter="${esc(c.key)}">${esc(c.label)}</button>`).join("");
    if(window.L){civicMap=L.map("civicMap").setView([23.72,120.95],7);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(civicMap);civicLayer=L.layerGroup().addTo(civicMap)}
    $("#civicFilters").addEventListener("click",e=>{const b=e.target.closest("[data-filter]");if(!b)return;civicFilter=b.dataset.filter;$("#civicFilters").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));renderCivic()});
    $("#civicSearch").addEventListener("input",e=>{civicQuery=e.target.value;renderCivic()});
    $("#civicReset").addEventListener("click",()=>civicMap?.setView([23.72,120.95],7));
    $("#civicSources").innerHTML=(C.sources||[]).map(s=>`<a class="source-card" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer"><b>${esc(s.title)}</b><span>公開查證來源 ↗</span></a>`).join("");renderCivic();
  }

  function setupNav() {
    const nav=$("#mainNav"),menu=$("#menuButton");menu.addEventListener("click",()=>nav.classList.toggle("open"));nav.addEventListener("click",()=>nav.classList.remove("open"));
    document.querySelectorAll("[data-jump]").forEach(b=>b.addEventListener("click",()=>location.hash=b.dataset.jump));
    const sections=[...document.querySelectorAll(".page-section")];const links=[...nav.querySelectorAll("a")];const observer=new IntersectionObserver(entries=>{const v=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!v)return;links.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==`#${v.target.id}`))},{rootMargin:"-25% 0px -60% 0px",threshold:[.05,.2,.5]});sections.forEach(s=>observer.observe(s));
  }

  function init(){renderSummary();renderTables();renderHistory("#mayorHistory","mayor");renderHistory("#councilHistory","council");renderHistory("#presidentHistory","president");renderSources();setupElectionMaps();setupCivic();setupNav()}
  init();
})();
