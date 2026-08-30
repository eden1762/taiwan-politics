window.SITE_RESEARCH = {
  asOf: "2026-08-30",
  igUrl: "https://www.instagram.com/taiwan.independence.movement/",
  councilSeatBaseline: {
    election: "2022 local elections",
    total: 910,
    DPP: 277,
    KMT: 367,
    TPP: 14,
    OTHER: 252,
    source: "https://www.cna.com.tw/news/aipl/202211275001.aspx",
    note: "2022全國直轄市／縣市議員共910席；本站以主要政黨2022實際席次作為席次轉換基準，其餘政黨與無黨籍合併為OTHER。"
  },
  historicalPartyPolls: [
    {
      fieldEnd: "2024-04-24",
      pollster: "美麗島電子報",
      sponsor: "美麗島電子報",
      n: 1073,
      moe: 3.0,
      type: "favorability",
      values: { DPP: 43.5, KMT: 35.9, TPP: 36.4 },
      useInModel: false,
      url: "https://my-formosa.com.tw/DOC_205577.htm",
      note: "政黨好感度，不是政黨支持度／議員投票意向；保留作2024年初政治環境背景，不納入席次模型。"
    },
    {
      fieldEnd: "2024-12-26",
      pollster: "美麗島電子報",
      sponsor: "美麗島電子報",
      n: 1074,
      moe: 3.0,
      type: "party_support",
      quality: 0.95,
      values: { DPP: 34.1, KMT: 15.7, TPP: 8.2 },
      undecided: 30.9,
      useInModel: true,
      url: "https://www.my-formosa.com.tw/DOC_212978.htm",
      note: "政黨支持／傾向訊號；與議員投票仍不同題型，因此只以有限混合上限影響全國擺動。"
    },
    {
      fieldEnd: "2025-05-31",
      pollster: "美麗島電子報",
      sponsor: "美麗島電子報",
      n: null,
      moe: null,
      type: "favorability",
      values: { DPP: 42.4, KMT: 26.2, TPP: 29.7 },
      useInModel: false,
      datePrecision: "month",
      url: "https://www.my-formosa.com.tw/DOC_216790.htm",
      note: "2025年5月政黨好感度；僅作長期政治環境背景。日期以月份呈現，不拿來做精細時間權重。"
    },
    {
      fieldEnd: "2025-12-24",
      pollster: "美麗島電子報",
      sponsor: "美麗島電子報",
      n: 1083,
      moe: 3.0,
      type: "party_support",
      quality: 0.95,
      values: { DPP: 31.4, KMT: 19.7, TPP: 12.5 },
      undecided: 27.2,
      useInModel: true,
      url: "https://www.my-formosa.com.tw/DOC_222574.htm",
      note: "2025年12月政黨支持／傾向訊號；納入全國擺動，但仍受時間衰減與poll cap限制。"
    }
  ],
  researchNotes: [
    "公開民調只有在題目、候選人組合與數值可比較時才納入計算；人物好感、黨內初選偏好、只公布局部分區差距等資料保留展示但不混算。",
    "圖表的月度線是歷史回推（backcast）：每個月只使用該月底以前已存在、且符合模型條件的資料重新計算，不代表本站當月曾公開發布該數字。",
    "2028總票數使用2024總統大選全國有效票13,947,506作固定基準換算，只用來比較情境份額，不是2028投票率或有效票總量預測。",
    "議員席次為低信心proxy：先用全國政黨民意擺動調整2022實際席次，再正規化回910席；多席次選區、地方派系、候選人數與配票仍可能造成很大偏差。"
  ]
};

if (window.ELECTION_DATA) {
  window.ELECTION_DATA.asOf = window.SITE_RESEARCH.asOf;
  window.ELECTION_DATA.candidateNotice = "資料更新至 2026-08-30。2026 地方選舉候選人仍可能調整；本站以已提名、已宣布參選或主要公開對決組合建模，正式名單以中選會公告為準。";
}
