(() => {
  const params = new URLSearchParams(location.search);
  let stored = null;
  try { stored = localStorage.getItem('tcsm-lang'); } catch (_) {}
  const isEn = params.get('lang') === 'en' || (!params.has('lang') && stored === 'en');
  if (!isEn) return;

  const exact = new Map(Object.entries({
    '選舉民調、透明模型、主權活動，各自獨立成頁。':'Election polling, transparent models and civic information — organized in one maintainable site.',
    '本站將民調原始資料、歷史選舉結構、模型參數、預測版本與 OpenStreetMap 分層設色地圖公開呈現。預測是條件式估計，不是選舉結果保證。':'This site publishes raw polling inputs, historical election structure, model parameters, forecast versions and OpenStreetMap choropleths. Forecasts are conditional estimates, not guarantees of election outcomes.',
    '22縣市候選人、公開民調、票數預測、歷史版本與分層設色地圖。':'Candidates in all 22 counties and cities, public polls, vote forecasts, version history and a choropleth map.',
    '政黨總票結構加上低信心全國席次proxy，並公開多席次選區與候選人效應限制。':'Party-vote structure plus a clearly labeled low-confidence national seat proxy, with multi-member district and candidate-level limitations disclosed.',
    '只使用公開出現的直接投票假設題，並提供全國總得票條件式預測。':'Uses only published direct-vote scenarios and provides a conditional nationwide total-vote forecast.',
    '逆總變異加權、時間衰減、結構先驗、席次proxy與科學論文依據全部公開。':'Inverse-total-variance weighting, recency decay, structural priors, the seat proxy and academic foundations are all published.',
    '保留既有公民組織、活動、查證來源與地圖資料，不複製資料庫。':'Keeps the existing civic organizations, events, verification sources and map data without duplicating the database.',
    '資料應回到原始民調、中選會與公開來源查證。':'Verify data against original polls, the Central Election Commission and other primary public sources.',
    '新版模型同時使用 2022 同類地方選舉、2024 總統縣市結構與目前可比候選人民調；民調依總誤差、日期與來源透明度加權，越新的民調在其他條件相近時權重越高。':'The model combines the 2022 comparable local election, 2024 presidential county-level structure and currently comparable candidate polls. Polls are weighted by total error, date and source transparency; newer polls receive more weight when other conditions are similar.',
    '候選人可比題主要從 2025 下半年後出現；表格依民調時間由近至遠顯示。題型過時、只公布分區差距或缺乏同口徑數值者保留作背景，但不硬塞進模型。':'Comparable candidate matchups mostly appear from late 2025 onward. The table is shown newest to oldest. Outdated question formats, district-only margins and sources lacking comparable citywide figures remain as context but are not forced into the model.',
    '候選人、民調與模型都可能更新；請以中選會正式公告為準。':'Candidates, polls and model inputs may change. Official election notices from the Central Election Commission take precedence.',
    '本站先用全國政黨民調的時間衰減擺動估計各縣市政黨總票結構，再以2022全國實際議員席次作為基準，提供低信心的全國910席proxy。民調越新，在其他條件相近時權重越高。':'The site first estimates county/city party-vote structure from recency-weighted national party polling, then uses actual 2022 council seats as the baseline for a low-confidence nationwide 910-seat proxy. Newer polls receive more weight when other conditions are similar.',
    '議員採多席次選區，候選人個人票、地方派系、候選人數與配票會造成很大差異。全國席次折線圖僅適合看政黨方向，不應解讀為逐選區精準席次預測。':'Council elections use multi-member districts, so personal votes, local factions, candidate supply and vote allocation can create large differences. The national seat trend is a directional indicator, not a precise district-by-district seat forecast.',
    '政黨傾向／支持度不是議員投票意向，因此只用有限混合上限校正 2024 後的全國擺動。資料表與長期索引均依時間由近至遠顯示。':'Party preference/support is not the same as council-vote intention, so it is used only with a capped influence to update the post-2024 national swing. Tables and the long-run archive are displayed newest to oldest.',
    '政黨總票模型與910席proxy都公開限制，不製造逐選區假精準。':'Both the party-vote model and the 910-seat proxy disclose their limitations rather than implying false district-level precision.',
    '距正式提名仍遠，本頁只對「公開民調中真的問過的直接投票情境」做計算；政治人物好感度、黨內人選偏好只列背景，不當成總統投票意向。全國總票以2024有效票量作固定基準換算。':'Formal nominations remain distant. This page calculates only direct voting scenarios that were actually asked in published polls. Favorability and intra-party candidate preference are context only, not presidential vote intention. Nationwide votes use 2024 valid ballots as a fixed conversion baseline.',
    '目前可比的賴清德／盧秀燕／柯文哲三人直接投票題很少，因此使用更強的 2024 結構先驗與較低民調混合上限，避免一份遠期民調支配全國預測。總票數不是2028投票率預測。':'There are very few directly comparable Lai Ching-te / Lu Shiow-yen / Ko Wen-je three-way vote questions, so the model uses a stronger 2024 structural prior and a lower poll cap to prevent one distant-horizon poll from dominating the nationwide forecast. Total votes are not a forecast of 2028 turnout.',
    '投票情境民調依時間由近至遠顯示；不同候選人組合、好感度與黨內人選偏好不混入同一條預測線。':'Voting-scenario polls are shown newest to oldest. Different candidate combinations, favorability and intra-party preference are not mixed into the same forecast line.',
    '情境人選改變時應另開新模型，不直接沿用舊情境。':'When the scenario candidates change, a new model should be opened rather than carrying forward the old scenario unchanged.',
    '模型重點不是做出更多小數點，而是把「民調抽樣誤差之外仍有系統性誤差」、「多份民調應彙整」、「越舊資訊應降權」、「地方選舉要有同類歷史先驗」明確寫進公式；v3 另公開議員席次proxy與月度回推規則。':'The goal is not more decimal places. The model explicitly accounts for systematic error beyond sampling error, pooling multiple polls, down-weighting older information and using comparable-election structural priors. v3 also publishes the council seat proxy and monthly backcast rules.',
    '已表態比例正規化':'Normalize decided responses',
    '先在同一題明確列出的候選人／政黨之間重新正規化；未決定不是自動分票。':'Re-normalize only among candidates or parties explicitly listed in the same question. Undecided respondents are not automatically allocated.',
    '抽樣標準誤':'Sampling standard error',
    '若民調公布95%抽樣誤差，反推一個近似標準誤；若只公布樣本數則採最保守 p=.5 近似。':'If a poll publishes a 95% sampling margin of error, approximate the standard error from it. If only sample size is available, use the conservative p=.5 approximation.',
    '總誤差地板':'Total-error floor',
    'τ 用來承認 house effect、共同偏誤、測量／非回應等不在傳統 MOE 內的誤差。本站 τ=2.0pp。':'τ acknowledges house effects, shared bias, measurement and nonresponse error not captured by conventional MOE. This site uses τ=2.0 percentage points.',
    '民調資訊權重':'Poll information weight',
    '來源品質 q、日期半衰期 H 與總變異共同決定權重；越舊的民調透過時間衰減自動降權。':'Source quality q, date half-life H and total variance jointly determine weight. Older polls are automatically down-weighted by recency decay.',
    '多份民調彙整':'Pool multiple polls',
    '同口徑可比較民調 pooling，降低單押一份民調的波動；題型過時或沒有同口徑數值的不納模型。':'Pool comparable polls with the same question structure to reduce single-poll volatility. Outdated or non-comparable questions are excluded from the model.',
    '2026結構先驗':'2026 structural prior',
    '2022同類地方選舉提供地方性，2024總統票提供較新的政黨結構；特殊多方競逐另公開調整。':'The 2022 comparable local election supplies local structure, while the 2024 presidential vote supplies newer party structure. Special multi-candidate adjustments are disclosed separately.',
    '資料量決定混合比重':'Data volume determines the blend',
    'Ipoll=Σw。可比民調愈多且愈精確，民調比重自然提高；資料少時由結構先驗穩定結果。':'Ipoll=Σw. More and more precise comparable polls naturally raise the poll share; sparse data are stabilized by the structural prior.',
    '最終比例':'Final share',
    '2028與議員頁使用更強先驗／較低cap，因為距投票日較遠或題型並非直接選票問題。':'The 2028 and council pages use stronger priors and lower caps because the election is farther away or the polling question is not a direct ballot question.',
    '票數換算與縣市擺動':'Vote conversion and county/city swing',
    '票數是以最近同類有效票量做條件式換算；不是獨立的投票率預測。2028以2024縣市相對強弱分配全國 swing。':'Votes are a conditional conversion using the latest comparable valid-vote volume, not an independent turnout forecast. The 2028 scenario distributes the national swing using 2024 county/city relative strength.',
    '重要限制：此模型不是完整 Bayesian MRP，也沒有假裝能精確估計候選人尚未確定、選區配票、投票率突變或重大事件衝擊。本站把能合理量化的部分透明化，把不能可靠量化的部分用信心標籤與註記留下。':'Important limitation: this is not a full Bayesian MRP model and does not pretend to precisely estimate unsettled candidates, district vote allocation, turnout shocks or major-event effects. Quantifiable components are made transparent; unreliable components remain explicitly labeled as uncertainty.',
    '論文支持什麼？本站自行決定什麼？':'What the literature supports vs. what this site calibrates',
    '文獻支持的設計方向':'Design directions supported by the literature',
    '民調應跨時間彙整，而非只看最新一份。':'Polls should be pooled across time rather than relying on only the latest poll.',
    'polling house 與共同偏誤使實際誤差大於單純抽樣 MOE。':'Polling-house effects and shared bias make real-world error larger than sampling MOE alone.',
    '歷史／結構模型與即時民調可動態結合。':'Historical/structural models can be dynamically combined with current polling.',
    '預測誤差會隨距投票日、國家與方法而有系統性變化。':'Forecast error changes systematically with time to election, country and methodology.',
    '本站透明可調參數':'Transparent site-calibrated parameters',
    'τ=2.0pp 的誤差地板。':'A τ=2.0pp error floor.',
    '120／150／300天半衰期。':'120 / 150 / 300-day half-lives.',
    '2022地方60%＋2024總統40%的先驗配比。':'A 60% 2022-local + 40% 2024-presidential prior blend.',
    '各頁 prior precision 與 poll cap。':'Page-specific prior precision and poll caps.',
    '議員席次proxy的2022席次基準與910席正規化。':'The 2022 council-seat baseline and normalization to 910 seats.',
    '沿用既有 data.js 的公民組織、活動與查證來源，不另外複製資料；頁面只負責篩選、顯示與 OpenStreetMap 定位。':'This page reuses the existing data.js source for civic organizations, events and verification sources without duplicating records. The page only filters, displays and locates them on OpenStreetMap.',
    '活動時間與地點可能異動，參與前請以主辦單位官方資訊確認。':'Event dates and locations may change. Confirm details with the organizer before attending.',
    '搜尋組織、活動、地址、標籤…':'Search organizations, events, addresses or tags…',
    '地圖復位':'Reset map',
    '組織／活動／來源':'Organizations / events / sources',
    '低':'Low','偏低':'Low','中':'Medium','中高':'Medium-high',
    '背景':'Context','納入':'Included','查看來源':'View source',
    '政黨總票＋席次proxy':'Party vote + seat proxy','席次為低信心估計':'Low-confidence seat estimate',
    '透明、可重算':'Transparent and reproducible',
    '科學方向 + 公開工程參數':'Scientific direction + disclosed engineering parameters'
  }));

  const phrases = [
    ['底圖：OpenStreetMap；縣市界：twgeojson。顏色代表目前模型領先陣營，填色深度隨領先差距增加；完整圖例顯示於地圖上方。','Base map: OpenStreetMap; boundaries: twgeojson. Color indicates the current model-leading camp, and darker fills indicate larger leads. The full legend appears above the map.'],
    ['底圖：OpenStreetMap。顏色代表模型中的最大政黨／其他群組，不代表該縣市席次最多；圖例同時標示領先差距的填色深淺。','Base map: OpenStreetMap. Color represents the largest modeled party/other group, not the party with the most seats in that county/city. The legend also explains lead-margin shading.'],
    ['底圖：OpenStreetMap。全國情境先估計後，再以2024各縣市相對強弱做 proportional swing；圖例同時標示領先差距的填色深淺。','Base map: OpenStreetMap. The national scenario is estimated first, then distributed with a proportional swing based on 2024 county/city relative strength. The legend also explains lead-margin shading.'],
    ['目前為政黨總票結構模型，不是席次模型。','The base county/city model estimates party-vote structure; the national seat proxy is separately labeled low confidence.'],
    ['沒有現行可比民調，主要依結構先驗','No current comparable poll; mainly structural prior'],
    ['僅較舊可比民調','Only older comparable polls'],
    ['距投票日遠、候選人為假設情境','Election is distant and candidates are hypothetical'],
    ['份近期可比民調；仍有候選人與非抽樣誤差風險',' recent comparable poll(s); candidate and non-sampling error risks remain'],
    ['份近期可比民調；模型領先差大於近似誤差門檻',' recent comparable poll(s); model lead exceeds the approximate error threshold'],
    ['較舊民調，時間衰減後權重很低','Older poll; very low weight after recency decay'],
    ['品質係數下調','Quality coefficient reduced'],
    ['不是議員投票意向','Not a council-vote intention question'],
    ['不是總統投票意向','Not a presidential-vote intention question'],
    ['只作候選人環境背景','Context for the candidate environment only'],
    ['不納模型','Excluded from model'],
    ['有投票意願者','Respondents expressing willingness to vote'],
    ['電話調查','Telephone survey'],
    ['市話分層比例隨機抽樣','Stratified proportional random landline sample'],
    ['住宅電話訪問','Residential telephone interview'],
    ['網路人口調查','Online population survey'],
    ['手機簡訊封閉式網路問卷','Closed online questionnaire recruited by mobile SMS'],
    ['全國政黨支持度','National party support'],
    ['政黨支持度','Party support'],
    ['政黨傾向','Party preference'],
    ['政黨好感度','Party favorability'],
    ['政治人物好感度','Political figure favorability'],
    ['主要藍白整合對決題','Main KMT-TPP coordination matchup'],
    ['主要在野整合情境','Main opposition coordination scenario'],
    ['主要藍白合作情境','Main KMT-TPP cooperation scenario'],
    ['正式登記前仍可能變動','May change before formal registration'],
    ['正式登記前主要競爭人選未完整','Main contenders are incomplete before formal registration'],
    ['結構估計','Structural estimate'],
    ['低信心','Low confidence'],
    ['模型領先','Model leader'],
    ['民調混合比重','Poll blend weight'],
    ['直接情境民調比重','Direct-scenario poll weight'],
    ['三黨結構','Three-party structure'],
    ['全國情境','National scenario'],
    ['基準有效票量','Baseline valid votes'],
    ['主要陣營','Leading group'],
    ['其他／無黨','Other / independent'],
    ['目前預測單位','Current forecast unit'],
    ['模型目標','Model objective'],
    ['資料更新至','Data updated through'],
    ['正式名單以中選會公告為準','Official candidate lists are subject to Central Election Commission announcements']
  ];

  const people = {
    '童子瑋':'Tung Tzu-wei','謝國樑':'Hsieh Kuo-liang','沈伯洋':'Puma Shen','蔣萬安':'Chiang Wan-an','蘇巧慧':'Su Chiao-hui','李四川':'Lee Szechuan','黃世杰':'Huang Shih-chieh','張善政':'Chang San-cheng','何欣純':'Ho Hsin-chun','江啟臣':'Johnny Chiang','陳亭妃':'Chen Ting-fei','謝龍介':'Hsieh Lung-chieh','賴瑞隆':'Lai Jui-lung','柯志恩':'Ko Chih-en','張靜':'Chang Ching','林國漳':'Lin Kuo-chang','吳宗憲':'Wu Tsung-hsien','鄭朝方':'Cheng Chao-fang','徐欣瑩':'Hsu Hsin-ying','莊競程':'Chuang Ching-cheng','高虹安':'Kao Hung-an','陳品安':'Chen Pin-an','鍾東錦':'Chung Tung-chin','陳素月':'Chen Su-yueh','魏平政':'Wei Ping-cheng','邱建富':'Chiu Chien-fu','温世政':'Wen Shih-cheng','許淑華':'Hsu Shu-hua','劉建國':'Liu Chien-kuo','張嘉郡':'Chang Chia-chun','蔡易餘':'Tsai Yi-yu','吳品叡':'Wu Pin-rui','王美惠':'Wang Mei-hui','張啓楷':'Chang Chi-kai','周春米':'Chou Chun-mi','蘇清泉':'Su Ching-chuan','陳瑩':'Chen Ying','吳秀華':'Wu Hsiu-hua','張峻':'Chang Chun','游淑貞':'Yu Shu-chen','魏嘉賢':'Wei Chia-hsien','羅佩秦':'Luo Pei-chin','吳淑瑾':'Wu Shu-chin','陳振中':'Chen Chen-chung','許智富':'Hsu Chih-fu','陳玉珍':'Chen Yu-jen','王忠銘':'Wang Chung-ming','賴清德':'Lai Ching-te','盧秀燕':'Lu Shiow-yen','柯文哲':'Ko Wen-je','韓國瑜':'Han Kuo-yu','鄭麗文':'Cheng Li-wun'
  };

  function translateTextNode(node) {
    if (!node.nodeValue || !node.nodeValue.trim()) return;
    if (['SCRIPT','STYLE','CODE'].includes(node.parentElement?.tagName)) return;
    const raw = node.nodeValue;
    const trimmed = raw.trim();
    if (exact.has(trimmed)) {
      node.nodeValue = raw.replace(trimmed, exact.get(trimmed));
      return;
    }
    let out = raw;
    phrases.forEach(([zh,en]) => { out = out.split(zh).join(en); });
    Object.entries(people).forEach(([zh,en]) => { out = out.split(zh).join(en); });
    // Translate displayed numeric vote counts without touching words such as 投票 or proper source names.
    out = out.replace(/([0-9][0-9,]*)票/g, '$1 votes');
    node.nodeValue = out;
  }

  function translateAll(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
    const placeholders = document.querySelectorAll('input[placeholder]');
    placeholders.forEach(el => { if (exact.has(el.placeholder)) el.placeholder = exact.get(el.placeholder); });
  }

  translateAll();

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === Node.TEXT_NODE) translateTextNode(n);
      else if (n.nodeType === Node.ELEMENT_NODE) translateAll(n);
    }));
  });
  observer.observe(document.body, {childList:true,subtree:true});
  setTimeout(() => observer.disconnect(), 5000);
})();
