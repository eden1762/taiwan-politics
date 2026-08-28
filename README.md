# 台灣公民與主權地圖

純靜態 HTML + CSS + JavaScript 專案，部署於 Vercel。沒有 build step、框架或重複資料層。

## 頁面

- `index.html`：入口首頁
- `mayor-2026.html`：2026 縣市長選舉
- `council-2026.html`：2026 縣市議員政黨總票結構
- `president-2028.html`：2028 總統假設情境
- `method.html`：票數預測公式、參數與論文來源
- `sovereignty.html`：主權活動與公民資訊

## 共用資料／程式

- `election-data.js`：選舉基準、民調、候選人、模型參數、歷史預測
- `data.js`：既有主權活動／組織資料
- `app.js`：共用運算與各頁 renderer；依 `body[data-page]` 只初始化當前頁
- `styles.css`：全站共用樣式
- `vercel.json`：Vercel clean URLs 與安全 headers

## 模型 v2

核心是逆總變異加權民調、時間衰減、來源品質係數與歷史結構先驗。2026 縣市長先驗使用 2022 同類地方選舉 + 2024 總統縣市結構。模型參數集中於 `election-data.js > model`，避免 magic numbers 散落在程式內。

每次正式更新前，先把當前摘要寫入 `election-data.js > history`，再更新資料日期、民調或參數，保留歷次預測紀錄。
