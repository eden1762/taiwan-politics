window.ELECTION_DATA = {
  asOf: "2026-08-25",
  localElectionDate: "2026-11-28",
  candidateNotice: "截至 2026-08-25，候選人登記尚未開始；下列人選依政黨提名、公開參選與藍白合作資訊整理，正式名單以中選會公告為準。",
  geojsonUrl: "https://raw.githubusercontent.com/ronnywang/twgeojson/master/twcounty2010.2.json",
  parties: {
    DPP: { label: "民進黨", short: "民進黨", color: "#1b8f55" },
    KMT: { label: "國民黨", short: "國民黨", color: "#2f6fce" },
    TPP: { label: "民眾黨", short: "民眾黨", color: "#36aeb4" },
    IND: { label: "無黨／合作", short: "無黨", color: "#c58b2a" },
    JRP: { label: "司法改革黨", short: "司改黨", color: "#7a5fc0" },
    TWP: { label: "台灣工黨", short: "台灣工黨", color: "#b45f82" },
    OTHER: { label: "其他／未定", short: "其他", color: "#77828d" }
  },
  sources: {
    cecSchedule: { title: "中選會｜115年地方公職人員選舉投票日及工作程序", url: "https://web.cec.gov.tw/central/article/61721" },
    cecDb: { title: "中選會選舉資料庫", url: "https://db.cec.gov.tw/" },
    candidatesPts: { title: "公視｜2026九合一各政黨提名人選整理", url: "https://news.pts.org.tw/article/801606" },
    candidatesObserve: { title: "2026 市長官方來源觀測站（六都）", url: "https://mayor2026.observe.tw/" },
    geojson: { title: "ronnywang/twgeojson｜臺灣縣市界 GeoJSON", url: "https://github.com/ronnywang/twgeojson" },
    linzer: { title: "Linzer (2013), Dynamic Bayesian Forecasting of Presidential Elections in the States", url: "https://doi.org/10.1080/01621459.2012.737735" },
    jackman: { title: "Jackman (2005), Pooling the polls over an election campaign", url: "https://doi.org/10.1080/10361140500302472" },
    shirani: { title: "Shirani-Mehr et al. (2018), Disentangling Bias and Variance in Election Polls", url: "https://doi.org/10.1080/01621459.2018.1448823" }
  },
  model: {
    localHalfLifeDays: 120,
    presidentialHalfLifeDays: 240,
    localPollBlendMin: 0.45,
    localPollBlendMax: 0.80,
    presidentialPollBlend: 0.42,
    councilPartyPollBlend: 0.35,
    councilOtherShareSixCities: 0.18,
    councilOtherShareOtherCounties: 0.35,
    note: "論文支持民調彙整、時間動態、歷史先驗與額外民調誤差等設計方向；本站的半衰期、品質係數與混合比例是透明、可調的工程參數，不是論文原公式。"
  },
  counties: [
    { name:"臺北市", mayorVotes2022:1360951, councilVotes2022:1330504, presidentVotes2024:1542011, p2024:{DPP:38.13,KMT:38.08,TPP:23.79} },
    { name:"新北市", mayorVotes2022:1846531, councilVotes2022:1812097, presidentVotes2024:2458480, p2024:{DPP:38.59,KMT:35.17,TPP:26.24} },
    { name:"桃園市", mayorVotes2022:1071763, councilVotes2022:1031739, presidentVotes2024:1350792, p2024:{DPP:35.27,KMT:34.12,TPP:30.61} },
    { name:"臺中市", mayorVotes2022:1346471, councilVotes2022:1319188, presidentVotes2024:1707203, p2024:{DPP:37.58,KMT:32.37,TPP:30.05} },
    { name:"臺南市", mayorVotes2022:888674, councilVotes2022:886130, presidentVotes2024:1120238, p2024:{DPP:50.95,KMT:25.61,TPP:23.44} },
    { name:"高雄市", mayorVotes2022:1318733, councilVotes2022:1295491, presidentVotes2024:1636962, p2024:{DPP:48.89,KMT:29.23,TPP:21.88} },
    { name:"宜蘭縣", mayorVotes2022:235281, councilVotes2022:222394, presidentVotes2024:267129, p2024:{DPP:44.74,KMT:28.99,TPP:26.27} },
    { name:"新竹縣", mayorVotes2022:258305, councilVotes2022:247114, presidentVotes2024:340310, p2024:{DPP:27.42,KMT:37.03,TPP:35.55} },
    { name:"苗栗縣", mayorVotes2022:292100, councilVotes2022:283439, presidentVotes2024:318665, p2024:{DPP:28.81,KMT:41.18,TPP:30.01} },
    { name:"彰化縣", mayorVotes2022:650424, councilVotes2022:645252, presidentVotes2024:741368, p2024:{DPP:38.11,KMT:32.93,TPP:28.96} },
    { name:"南投縣", mayorVotes2022:275499, councilVotes2022:258482, presidentVotes2024:287296, p2024:{DPP:35.95,KMT:38.00,TPP:26.05} },
    { name:"雲林縣", mayorVotes2022:366833, councilVotes2022:365299, presidentVotes2024:380619, p2024:{DPP:44.54,KMT:29.33,TPP:26.13} },
    { name:"嘉義縣", mayorVotes2022:273294, councilVotes2022:272627, presidentVotes2024:292534, p2024:{DPP:47.69,KMT:29.28,TPP:23.03} },
    { name:"屏東縣", mayorVotes2022:443153, councilVotes2022:407853, presidentVotes2024:475927, p2024:{DPP:47.51,KMT:30.84,TPP:21.65} },
    { name:"臺東縣", mayorVotes2022:112148, councilVotes2022:72545, presidentVotes2024:109941, p2024:{DPP:27.41,KMT:49.32,TPP:23.28} },
    { name:"花蓮縣", mayorVotes2022:149307, councilVotes2022:104679, presidentVotes2024:174157, p2024:{DPP:24.78,KMT:50.50,TPP:24.72} },
    { name:"澎湖縣", mayorVotes2022:51242, councilVotes2022:50762, presidentVotes2024:49277, p2024:{DPP:38.60,KMT:36.63,TPP:24.76} },
    { name:"連江縣", mayorVotes2022:8505, councilVotes2022:8459, presidentVotes2024:6159, p2024:{DPP:10.52,KMT:62.67,TPP:26.81} },
    { name:"金門縣", mayorVotes2022:47114, councilVotes2022:46880, presidentVotes2024:45612, p2024:{DPP:10.02,KMT:61.40,TPP:28.58} },
    { name:"基隆市", mayorVotes2022:182893, councilVotes2022:178064, presidentVotes2024:218781, p2024:{DPP:34.77,KMT:38.63,TPP:26.60} },
    { name:"新竹市", mayorVotes2022:217941, councilVotes2022:213811, presidentVotes2024:266389, p2024:{DPP:34.79,KMT:30.90,TPP:34.30} },
    { name:"嘉義市", mayorVotes2022:93813, councilVotes2022:114088, presidentVotes2024:157656, p2024:{DPP:43.26,KMT:31.40,TPP:25.34} }
  ],
  mayorRaces: {
    "基隆市": { candidates:[{id:"tong",name:"童子瑋",party:"DPP",baseKeys:["DPP"]},{id:"hsieh",name:"謝國樑",party:"KMT",baseKeys:["KMT"]}] },
    "臺北市": { candidates:[{id:"puma",name:"沈伯洋",party:"DPP",baseKeys:["DPP"]},{id:"chiang",name:"蔣萬安",party:"KMT",baseKeys:["KMT"]}] },
    "新北市": { candidates:[{id:"su",name:"蘇巧慧",party:"DPP",baseKeys:["DPP"]},{id:"lee",name:"李四川",party:"KMT",baseKeys:["KMT","TPP"]}], allianceNote:"藍白協調後由李四川代表主要在野陣營" },
    "桃園市": { candidates:[{id:"huang",name:"黃世杰",party:"DPP",baseKeys:["DPP"]},{id:"chang",name:"張善政",party:"KMT",baseKeys:["KMT"]}] },
    "臺中市": { candidates:[{id:"ho",name:"何欣純",party:"DPP",baseKeys:["DPP"]},{id:"johnny",name:"江啟臣",party:"KMT",baseKeys:["KMT"]}] },
    "臺南市": { candidates:[{id:"chen",name:"陳亭妃",party:"DPP",baseKeys:["DPP"]},{id:"lung",name:"謝龍介",party:"KMT",baseKeys:["KMT"]}] },
    "高雄市": { candidates:[{id:"lai",name:"賴瑞隆",party:"DPP",manualBase:48.89},{id:"ko",name:"柯志恩",party:"KMT",manualBase:29.23},{id:"changjing",name:"張靜",party:"JRP",manualBase:2.0}], note:"第三黨候選人缺乏可比民調；模型僅給低比例結構先驗。" },
    "宜蘭縣": { candidates:[{id:"lin",name:"林國漳",party:"DPP",baseKeys:["DPP"]},{id:"wu",name:"吳宗憲",party:"KMT",baseKeys:["KMT","TPP"]}], allianceNote:"藍白整合後以吳宗憲為共同支持人選" },
    "新竹縣": { candidates:[{id:"cheng",name:"鄭朝方",party:"DPP",baseKeys:["DPP"]},{id:"hsu",name:"徐欣瑩",party:"KMT",baseKeys:["KMT"]}] },
    "新竹市": { candidates:[{id:"chuang",name:"莊競程",party:"DPP",baseKeys:["DPP"]},{id:"kao",name:"高虹安",party:"IND",baseKeys:["KMT","TPP"]}], allianceNote:"主要藍白合作情境以無黨籍高虹安為共同支持人選" },
    "苗栗縣": { candidates:[{id:"chenpa",name:"陳品安",party:"DPP",baseKeys:["DPP"]},{id:"chung",name:"鍾東錦",party:"KMT",baseKeys:["KMT"]}] },
    "彰化縣": { candidates:[{id:"chensu",name:"陳素月",party:"DPP",manualBase:26.68},{id:"wei",name:"魏平政",party:"KMT",baseKeys:["KMT"]},{id:"chiu",name:"邱建富",party:"IND",manualBase:11.43}], note:"邱建富已宣布無黨籍參選；歷史先驗將2024民進黨基準票按70/30暫分給陳素月／邱建富，屬可調工程先驗。" },
    "南投縣": { candidates:[{id:"wen",name:"温世政",party:"DPP",baseKeys:["DPP"]},{id:"hsu2",name:"許淑華",party:"KMT",baseKeys:["KMT"]}] },
    "雲林縣": { candidates:[{id:"liu",name:"劉建國",party:"DPP",baseKeys:["DPP"]},{id:"changchia",name:"張嘉郡",party:"KMT",baseKeys:["KMT"]}] },
    "嘉義縣": { candidates:[{id:"tsai",name:"蔡易餘",party:"DPP",baseKeys:["DPP"]},{id:"wupin",name:"吳品叡",party:"IND",baseKeys:["KMT"]}], allianceNote:"國民黨公開支持吳品叡；尚有其他公開參選人，模型聚焦主要對決" },
    "嘉義市": { candidates:[{id:"wang",name:"王美惠",party:"DPP",baseKeys:["DPP"]},{id:"changcc",name:"張啓楷",party:"TPP",baseKeys:["KMT","TPP"]}], allianceNote:"藍白整合後共同支持張啓楷" },
    "屏東縣": { candidates:[{id:"chou",name:"周春米",party:"DPP",baseKeys:["DPP"]},{id:"su2",name:"蘇清泉",party:"KMT",baseKeys:["KMT"]}] },
    "臺東縣": { candidates:[{id:"chenying",name:"陳瑩",party:"DPP",baseKeys:["DPP"]},{id:"wuhsiu",name:"吳秀華",party:"KMT",baseKeys:["KMT"]}] },
    "花蓮縣": { candidates:[{id:"changjun",name:"張峻",party:"IND",manualBase:27.0},{id:"yu",name:"游淑貞",party:"KMT",manualBase:50.5},{id:"wei2",name:"魏嘉賢",party:"IND",manualBase:16.0},{id:"luo",name:"羅佩秦",party:"TWP",manualBase:6.5}], note:"人選多且缺乏可比公開民調；僅以2024政治結構與公開支持關係配置結構先驗，低信心。" },
    "澎湖縣": { candidates:[{id:"wushu",name:"吳淑瑾",party:"DPP",manualBase:38.60},{id:"chenzhen",name:"陳振中",party:"KMT",manualBase:36.63},{id:"hsu3",name:"許智富",party:"IND",manualBase:24.77}], note:"多方競逐缺乏可比公開民調，低信心。" },
    "金門縣": { candidates:[{id:"chenyu",name:"陳玉珍",party:"KMT",manualBase:61.4},{id:"otherkm",name:"其他／未定",party:"OTHER",manualBase:38.6}], note:"正式登記前主要競爭人選尚未完整，僅顯示結構估計。" },
    "連江縣": { candidates:[{id:"wangchung",name:"王忠銘",party:"KMT",manualBase:62.67},{id:"otherlc",name:"其他／未定",party:"OTHER",manualBase:37.33}], note:"正式登記前主要競爭人選尚未完整，僅顯示結構估計。" }
  },
  mayorPolls: [
    { county:"臺北市", pollster:"TVBS民調中心", sponsor:"TVBS", fieldEnd:"2026-05-26", n:901, moe:3.3, quality:1.00, values:{chiang:58,puma:30}, undecided:13, url:"https://news.tvbs.com.tw/politics/3214867", note:"有投票意願者" },
    { county:"臺北市", pollster:"TPOC台灣議題研究中心", sponsor:"TPOC", fieldEnd:"2026-08-07", n:1099, moe:2.96, quality:0.95, values:{chiang:48.4,puma:33.0}, undecided:18.7, url:"https://news.tvbs.com.tw/politics/4007563", note:"8/5–8/7市話分層比例隨機抽樣" },
    { county:"新北市", pollster:"TVBS民調中心", sponsor:"國民黨新北市議會黨團", fieldEnd:"2026-07-23", n:1303, moe:2.7, quality:0.85, values:{lee:43.7,su:36.8}, undecided:17.4, other:2.1, url:"https://news.tvbs.com.tw/politics/3270596", note:"委託案，CATI/RDD" },
    { county:"新北市", pollster:"ETtoday民調雲", sponsor:"東森民調雲", fieldEnd:"2026-08-13", n:1213, moe:2.8, quality:0.88, values:{lee:39.3,su:37.3}, undecided:21.6, other:1.7, url:"https://news.tvbs.com.tw/politics/4010367", note:"8/5–8/13 EDM＋手機簡訊封閉式網路問卷；網路調查品質係數下調" },
    { county:"桃園市", pollster:"TVBS民調中心", sponsor:"TVBS", fieldEnd:"2025-12-12", n:953, moe:3.2, quality:1.00, values:{chang:61,huang:19}, undecided:20, url:"https://news.tvbs.com.tw/politics/3073015", note:"舊於120天，僅低權重使用" },
    { county:"臺中市", pollster:"艾普羅行銷市場研究", sponsor:"公開媒體報導", fieldEnd:"2026-08-05", n:1077, moe:3.0, quality:0.92, values:{johnny:38.2,ho:24.1}, undecided:null, url:"https://news.tvbs.com.tw/politics/4004018", note:"8/3–8/5住宅電話訪問；報導未列完整未表態比例" },
    { county:"臺中市", pollster:"新台灣國策智庫／趨勢民調", sponsor:"新台灣國策智庫／凱達格蘭基金會", fieldEnd:"2026-08-13", n:1159, moe:2.88, quality:0.90, values:{johnny:42.8,ho:36.1}, undecided:21.1, url:"https://news.tvbs.com.tw/politics/4008251", note:"8/11–8/13市話分層比例隨機抽樣" },
    { county:"臺南市", pollster:"TVBS民調中心", sponsor:"TVBS", fieldEnd:"2026-03-12", n:1052, moe:3.0, quality:1.00, values:{chen:53,lung:30}, undecided:17, url:"https://news.tvbs.com.tw/politics/3152745", note:"有投票意願者" },
    { county:"高雄市", pollster:"年代民調中心", sponsor:"年代", fieldEnd:"2026-07-18", n:1071, moe:3.0, quality:0.95, values:{lai:36.2,ko:23.6}, undecided:32.8, other:7.4, url:"https://news.tvbs.com.tw/politics/3262370", note:"張靜未列入題目，故僅用於賴／柯相對比例" },
    { county:"高雄市", pollster:"山水民調", sponsor:"震傳媒", fieldEnd:"2026-07-20", n:1069, moe:3.0, quality:1.00, values:{lai:39.6,ko:31.6}, undecided:28.8, url:"https://www.zmedia.com.tw/Document/PoolDetail/43287", note:"CATI" },
    { county:"高雄市", pollster:"皮爾森數據", sponsor:"鉅聞天下", fieldEnd:"2026-08-01", n:1608, moe:2.4, quality:0.82, values:{lai:47.78,ko:46.14}, undecided:4.24, other:1.84, url:"https://news.tvbs.com.tw/politics/4004777", note:"7/27–8/1網路人口調查；方法與電話抽樣不同，品質係數下調" },
    { county:"宜蘭縣", pollster:"TVBS民調中心", sponsor:"TVBS", fieldEnd:"2026-03-19", n:1042, moe:3.0, quality:1.00, values:{lin:38,wu:35}, undecided:27, url:"https://news.tvbs.com.tw/politics/3158893", note:"採藍綠兩人對決題" },
    { county:"新竹縣", pollster:"年代民調中心", sponsor:"年代", fieldEnd:"2026-06-16", n:null, moe:null, quality:0.90, values:{hsu:32.3,cheng:30.5}, undecided:33.6, other:3.6, url:"https://news.tvbs.com.tw/politics/3233397", note:"6月中公布；公開報導未完整列示樣本／誤差，品質係數下調" },
    { county:"新竹縣", pollster:"精確市場研究", sponsor:"公開民調", fieldEnd:"2026-08-20", n:1070, moe:3.0, quality:0.95, values:{hsu:41.4,cheng:38.1}, undecided:15.6, other:4.9, url:"https://news.tvbs.com.tw/politics/4010909", note:"8/18–8/20中華電信市話後兩碼隨機、分層比例抽樣；主模型採藍綠對決題" },
    { county:"新竹市", pollster:"匯流民調／趨勢民調", sponsor:"CNEWS匯流新聞網", fieldEnd:"2026-05-20", n:1068, moe:3.0, quality:0.95, values:{kao:54.5,chuang:21.3}, undecided:20.2, other:3.3, url:"https://news.nextapple.com/gadget/20260527/895BA444AC41C5ADD67CE388FD734D42", note:"藍白共推高虹安情境" },
    { county:"彰化縣", pollster:"CNEWS匯流民調", sponsor:"CNEWS匯流新聞網", fieldEnd:"2026-05-21", n:1068, moe:3.0, quality:0.95, values:{chensu:42.6,wei:23.2}, undecided:34.2, url:"https://cnews.com.tw/001260525a01/", note:"藍白共推魏平政對陳素月的兩人情境；邱建富宣布參選前題型，僅列歷史脈絡", useInModel:false },
    { county:"彰化縣", pollster:"ETtoday民調雲", sponsor:"東森民調雲", fieldEnd:"2026-08-17", n:1133, moe:2.9, quality:0.88, values:{chensu:36.4,wei:19.4,chiu:12.7}, undecided:27.9, other:3.7, url:"https://news.tvbs.com.tw/politics/4009302", note:"8/10–8/17手機簡訊封閉式網路問卷；三方現行競逐題" },
    { county:"雲林縣", pollster:"皮爾森數據", sponsor:"鉅聞天下", fieldEnd:"2026-03-28", n:1417, moe:2.6, quality:0.82, values:{changchia:49.52,liu:38.91}, undecided:8.92, other:2.65, url:"https://www.bigmedia.com.tw/article/1779181485438", note:"3/23–3/28網路人口調查；方法與電話抽樣不同，品質係數下調" },
    { county:"嘉義市", pollster:"TVBS民調中心", sponsor:"TVBS", fieldEnd:"2026-04-30", n:948, moe:3.2, quality:1.00, values:{wang:43,changcc:37}, undecided:20, url:"https://news.tvbs.com.tw/politics/3194942", note:"藍白整合後對決" },
    { county:"基隆市", pollster:"TVBS民調中心", sponsor:"TVBS", fieldEnd:"2026-03-26", n:1086, moe:3.0, quality:1.00, values:{hsieh:45,tong:30}, undecided:25, url:"https://news.tvbs.com.tw/politics/3162996", note:"有投票意願者" },
    { county:"基隆市", pollster:"民進黨內參（媒體披露）", sponsor:"民進黨", fieldEnd:"2026-07-27", n:1075, moe:2.98, quality:0.75, values:{hsieh:38.5,tong:36.0}, undecided:25.5, url:"https://news.tvbs.com.tw/politics/4000309", note:"內參披露，品質係數下調；來源若失效以媒體報導為準" }
  ],
  councilPolls: [
    { pollster:"山水民調", sponsor:"震傳媒", fieldEnd:"2026-08-17", n:1070, moe:3.0, quality:1.00, values:{DPP:34.7,KMT:19.3,TPP:6.3}, neutral:35.7, url:"https://www.zmedia.com.tw/Document/PoolDetail/43758", note:"全國政黨支持度；不是議員投票意向" },
    { pollster:"美麗島電子報", sponsor:"美麗島電子報", fieldEnd:"2026-06-28", n:null, moe:null, quality:0.95, values:{DPP:30.4,KMT:17.9,TPP:7.0}, neutral:35.7, url:"https://my-formosa.com.tw/DOC_226926.htm", note:"6月國政民調政黨支持度；不是議員投票意向" }
  ],
  president: {
    scenarioLabel:"2028情境：賴清德 vs 盧秀燕 vs 柯文哲",
    candidates:[
      {id:"lai2028",name:"賴清德",party:"DPP"},
      {id:"lu2028",name:"盧秀燕",party:"KMT"},
      {id:"ko2028",name:"柯文哲",party:"TPP"}
    ],
    polls:[
      { pollster:"風傳媒民調", sponsor:"負數票協會", fieldEnd:"2026-06-10", n:1069, moe:3.0, quality:0.90, values:{lai2028:37.7,lu2028:31.0,ko2028:7.5}, undecided:17.7, other:6.1, url:"https://tw.news.yahoo.com/%E8%8B%A5%E6%8E%A1-%E8%B2%A0%E6%95%B8%E7%A5%A8%E5%88%B6%E5%BA%A6-%E6%9C%80%E6%96%B0%E6%B0%91%E8%AA%BF-%E7%9B%A7%E7%A7%80%E7%87%95%E6%B7%A8%E6%94%AF%E6%8C%81%E7%8E%87%E5%8F%8D%E8%B6%85%E8%B3%B4%E6%B8%85%E5%BE%B7-135623986.html", note:"模型只使用『現行選制』題；三人均為假設情境，非正式提名" }
    ],
    contextPolls:[
      { pollster:"山水民調", sponsor:"震傳媒", fieldEnd:"2026-08-17", n:1070, moe:3.0, values:{"蔣萬安":20.4,"韓國瑜":18.9,"盧秀燕":16.6,"鄭麗文":4.3}, undecided:38.8, url:"https://www.zmedia.com.tw/Document/PoolDetail/43755", note:"題目是『誰最適合代表國民黨參選2028』，非總統投票意向，因此不納入票數模型。" }
    ]
  },
  national2024: { DPP:40.05, KMT:33.49, TPP:26.46, validVotes:13947506 },
  history: {
    mayor: [], council: [], president: []
  }
};
