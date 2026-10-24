// Factual, separately sourced contextual indicators, intentionally NOT candidate vote intention.
// Different question types, populations and sampling frames must not be pooled together.
window.POLL_CONTEXT_DATA = {
  asOf: "2026-10-24",
  indicators: [
    {
      id: "national-party-favorability-20261002",
      label: "全國政黨喜好度", period: "2026-09-29～2026-10-02", fieldEnd:"2026-10-02", scope:"全國22縣市",
      questionType:"政黨喜好度（喜歡比例）", sampling:"市話＋手機 CATI",
      pollster:"趨勢民意調查（美麗島電子報委託）",
      values: {"民進黨":43.1,"國民黨":26.5,"民眾黨":21.0},
      url:"https://www.my-formosa.com.tw/DOC_229724.htm",
      note:"喜好度不是政黨支持度、議員投票意向或預測；不納入選舉模型。"
    },
    {
      id: "taipei-party-support-20261019",
      label:"台北市政黨傾向", period:"2026-10-18～2026-10-19", fieldEnd:"2026-10-19", scope:"設籍台北市20歲以上民眾",
      questionType:"政黨傾向（支持比例）", sampling:"市話 CATI",
      pollster:"山水民意研究（震傳媒委託）", n:1074, moe:2.99,
      values: {"民進黨":35.9,"國民黨":25.4,"民眾黨":9.4},
      url:"https://www.zmedia.com.tw/Document/PoolDetail/44791",
      note:"這是台北市人口的政黨傾向，不是全國政黨支持，也不是台北市長候選人投票意向；不納入選舉模型。"
    }
  ]
};
