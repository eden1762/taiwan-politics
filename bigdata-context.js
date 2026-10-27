// Factual, separately sourced contextual indicators, intentionally NOT candidate vote intention.
// Different question types, populations and sampling frames must not be pooled together.
window.POLL_CONTEXT_DATA = {
  asOf: "2026-10-27",
  indicators: [
    {
      id:"taipei-person-favorability-20261022",
      label:"台北市受訪者對政治人物好感度（10/27發布）",period:"2026-10-20～2026-10-22",fieldEnd:"2026-10-22",
      scope:"全國調查中的台北市子樣本（樣本數未公開）",questionType:"人物好感度（非市長投票意向）",
      sampling:"市話＋手機 CATI；城市子樣本數未公布",pollster:"台灣民心調查／畢肯市場研究",
      values:{"蔣萬安":39.7,"沈伯洋":56.1},
      url:"https://www.businesstoday.com.tw/article/category/183027/post/202610270025/",
      note:"來源為全國調查的台北交叉分組；不借用全國1075樣本或±3%誤差，人物好感度不等於候選人得票支持度，且不納模型。"
    },
    {
      id:"national-election-perception-20261022",
      label:"受訪者對22縣市選舉席次的看法（10/27發布）",period:"2026-10-20～2026-10-22",fieldEnd:"2026-10-22",
      scope:"全國22縣市設籍20歲以上民眾",questionType:"選舉結果看法（非個別候選人投票意向）",
      sampling:"市話＋手機 CATI",pollster:"台灣民心調查／畢肯市場研究",n:1075,moe:3,
      values:{"認為民進黨至少取得11席":38.1,"認為國民黨至少取得11席":28.7},
      url:"https://www.businesstoday.com.tw/article/category/183027/post/202610270025/",
      note:"僅記錄受訪者對未來席次的想法，數值是回答比例，並非本站的勝選預測或機率，不納模型。"
    },
    {
      id:"national-party-favorability-20261022",
      label:"全國政黨好感度（2026年10月）", period:"2026-10-20～2026-10-22", fieldEnd:"2026-10-22",
      scope:"全國22縣市設籍20歲以上民眾", questionType:"政黨好感度（非投票意向）",
      sampling:"市話696份＋手機379份，CATI", pollster:"台灣民心調查／畢肯市場研究", n:1075,moe:3.0,
      values:{"民進黨":49.0,"國民黨":27.9,"民眾黨":26.3},
      url:"https://www.fountmedia.io/article/438427",
      note:"10/27發布。好感度各黨分別回答，不互斥且不應正規化為100%；不納入選舉模型。"
    },

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
