# 台灣公民與主權地圖｜Taiwan Civic & Sovereignty Map

Vercel-ready 靜態網站：2026 縣市長／縣市議員、2028 總統情境預測，以及公開主權活動資訊。

## 架構

- 不需要 build / dist / React / Next.js。
- `index.html`：五個主目錄與頁面骨架。
- `styles.css`：全站樣式。
- `app.js`：模型計算、表格、Leaflet 地圖、互動。
- `election-data.js`：選舉基準、候選人、民調、模型參數、歷史預測。
- `data.js`：原本主權／公民活動公開資料；不與選舉資料混在一起。
- `vercel.json`：Vercel 靜態站設定。

## 五個主目錄

1. 2026縣市長選舉
2. 2026縣市議員選舉
3. 2028總統大選
4. 票數預測公式
5. 主權活動資訊

## 更新選舉資料

只改 `election-data.js`：

1. 新增／修正 `mayorPolls`、`councilPolls` 或 `president.polls`。
2. 更新前先把目前摘要寫入 `history`，保留歷史預測。
3. 候選人正式登記後更新 `mayorRaces`。
4. 模型參數集中在 `model`，不要把權重散落到 UI 程式。

重要：民調未決定比例不直接分配；票數是依基準有效票量換算的「條件式票數」，不是投票率預測。

## 地圖

- 底圖：OpenStreetMap / Leaflet。
- 縣市界：`ronnywang/twgeojson` 的簡化縣市 GeoJSON，前端按需載入，避免把大型邊界檔複製進 repository。

## Vercel

Framework Preset 選 `Other`，Build Command 留空，Output Directory 留空或 `.`，即可部署。
