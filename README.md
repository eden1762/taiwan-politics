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

## 2026 地方選舉期間自動暫停對外服務

- 台灣時間 **2026-11-13 00:00** 起至 **2026-12-02 00:00** 前，`proxy.js` 攔截全部路徑（含 HTML、JS、CSS、既有資料檔與帶查詢字串的 URL），回傳無快取的 HTTP 503 暫停頁面。
- 不仰賴瀏覽器時鐘、前端顯示或 Vercel Cron；`Date.now()` 使用伺服器時間，指定時間自動恢復。
- 法規依據：《公職人員選舉罷免法》第 53 條（https://law.cec.gov.tw/LawContent.aspx?id=GL000292）；本站自訂提前 15 日封站，並非聲稱法律要求封站 15 日或選後 3 日。
- 本攔截僅涵蓋這個 Vercel 專案網域／相同部署的站台路徑，不會讓 GitHub 公開原始碼、先前另行部署的舊網址、搜尋引擎快取、第三方鏡像或用戶離線快取消失。若須限制 GitHub 來源，應另行檢視公開儲存庫權限。
- 2026-10-24 新增可追溯 9 份地方候選人支持度民調（臺北／新北／桃園／臺中／臺南／基隆），僅按原報導記錄原始支持度、調查日期、樣本、誤差及來源。網站既有演算法依新資料重算；未據此宣稱投票結果。
- 若需測試封站時間邏輯，可用 `node --input-type=module -e "import {isElectionBlackout} from './proxy.js'; console.log(isElectionBlackout(Date.parse('2026-11-13T00:00:00+08:00')))"`，應印出 `true`；2026-12-02 00:00 應為 `false`。
