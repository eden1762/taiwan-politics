(() => {
  "use strict";
  const E = window.ELECTION_DATA, C = window.POLL_CONTEXT_DATA;
  if (!E || !C) return;
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? "").replace(/[&<>"']/g,x=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x]));
  const regions = {
    "北部":["臺北市","新北市","桃園市","基隆市","新竹縣","新竹市","宜蘭縣"],
    "中部":["臺中市","苗栗縣","彰化縣","南投縣","雲林縣"],
    "南部":["臺南市","高雄市","嘉義縣","嘉義市","屏東縣"],
    "東部":["臺東縣","花蓮縣"],
    "離島":["澎湖縣","金門縣","連江縣"]
  };
  const parties = ["DPP","KMT","TPP","IND","OTHER"];
  const labels = {DPP:"民進黨",KMT:"國民黨",TPP:"民眾黨",IND:"無黨籍",OTHER:"其他"};
  const fmt = new Intl.NumberFormat("zh-TW");
  const percentage = n => (Math.round(n*100)/100).toFixed(2)+"%";
  const regionOf = county => Object.entries(regions).find(([,names])=>names.includes(county))?.[0]||"未分類";
  function shares(row,kind){return kind==="president2024" ? row.p2024 : row.m2022;}
  function ballots(row,kind){return kind==="president2024" ? row.presidentVotes2024 : row.mayorVotes2022;}
  function keys(kind){return kind==="president2024"?parties.slice(0,3):parties;}
  function weighted(rows,kind){
    const total=rows.reduce((n,row)=>n+ballots(row,kind),0);
    const obj={};
    for(const key of keys(kind)) obj[key]=total?rows.reduce((n,row)=>n+ballots(row,kind)*(shares(row,kind)[key]||0),0)/total:0;
    return {shares:obj,total};
  }
  const span=(key,v)=>'<span title="'+esc(labels[key]+': '+percentage(v))+'" class="regional-part regional-'+key+'" style="width:'+Math.max(0,Math.min(100,v))+'%"></span>';
  const bar=obj=>'<div class="regional-stack" role="img" aria-label="'+esc(Object.entries(obj).map(([k,v])=>labels[k]+' '+percentage(v)).join('、'))+'">'+
    parties.filter(k=>obj[k]>0).map(k=>span(k,obj[k])).join("")+'</div>';
  const legend=kind=>'<div class="regional-legend">'+keys(kind).map(k=>'<span><i class="regional-dot regional-'+k+'"></i>'+labels[k]+'</span>').join('')+'</div>';
  function render(){
    const kind=$("baselineElection").value, filter=$("regionFilter").value;
    $("regionalAsOf").textContent=E.asOf.replaceAll("-","/");
    $("electionDescription").textContent=kind==="president2024" ?
      "2024總統選舉同一組候選人的各縣市實際得票分布；不等於2026年地方政黨支持率。" :
      "2022縣市長選舉各地候選人實際得票，政黨標籤依當時候選人登記類別彙整；無黨籍與合作、候選人個人因素較多，不應直接對比總統票。";
    const included=Object.entries(regions).filter(([k])=>!filter||filter===k);
    $("regionSummary").innerHTML=included.map(([name,names])=>{
      const group=E.counties.filter(row=>names.includes(row.name)), r=weighted(group,kind);
      return '<article class="regional-region"><h3>'+name+' <small>'+group.length+'縣市｜'+fmt.format(r.total)+'有效票</small></h3>'+bar(r.shares)+
        '<div class="regional-values">'+keys(kind).map(k=>'<span>'+labels[k]+' <b>'+percentage(r.shares[k])+'</b></span>').join('')+'</div></article>';
    }).join('')+legend(kind);
    const rows=E.counties.filter(row=>!filter || regionOf(row.name)===filter);
    $("countyBaselineTable").innerHTML='<thead><tr><th scope="col">縣市</th><th scope="col">區域</th><th scope="col">當次有效票</th>'+
      keys(kind).map(k=>'<th scope="col">'+labels[k]+'</th>').join('')+
      '<th scope="col">比例圖（各縣市）</th></tr></thead><tbody>'+rows.map(row=>
      '<tr><th scope="row">'+esc(row.name)+'</th><td>'+regionOf(row.name)+'</td><td>'+fmt.format(ballots(row,kind))+'</td>'+
      keys(kind).map(k=>'<td>'+percentage(shares(row,kind)[k]||0)+'</td>').join('')+
      '<td class="regional-mini">'+bar(Object.fromEntries(keys(kind).map(k=>[k,shares(row,kind)[k]||0])))+'</td></tr>').join('')+'</tbody>';
  }
  function localPolls(){
    const cards=(C.indicators||[]).filter(p=>/政黨認同|政黨傾向/.test(p.questionType||"") && /台北市|新竹縣/.test(p.scope||""));
    $("localPartyPolls").innerHTML=cards.map(p=>'<article class="regional-survey"><h3>'+esc(p.label)+'</h3>'+
      '<p>'+esc(p.scope)+'｜'+esc(p.period)+'｜'+esc(p.questionType)+'</p><div class="regional-values">'+
      Object.entries(p.values).map(([k,v])=>'<span>'+esc(k)+' <b>'+Number(v).toFixed(1)+'%</b></span>').join('')+
      '</div><p>'+esc(p.pollster)+'｜'+esc(p.sampling)+(p.n?'｜n='+fmt.format(p.n):'')+(p.moe?'｜抽樣誤差 ±'+p.moe+'%':'')+'</p>'+
      '<p>'+esc(p.note||'')+'</p><a href="'+esc(p.url)+'" target="_blank" rel="noopener noreferrer">閱讀調查來源 ↗</a></article>').join('');
  }
  $("baselineElection").addEventListener("change",render);
  $("regionFilter").addEventListener("change",render);
  const menu=$("menuButton"),nav=$("mainNav");
  if(menu&&nav)menu.addEventListener("click",()=>nav.classList.toggle("open"));
  localPolls(); render();
})();