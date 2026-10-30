# 2026 SCENT OF SUCCESS｜職場品味・香氛體驗之夜

活動報名網站，使用純 HTML、CSS、JavaScript 製作，適合部署到 GitHub Pages。

## GitHub Pages 網址

- https://xie6528.github.io/2026-xiang-shui-ti-yan/

## 重點

- 活動標題區塊：2026 SCENT OF SUCCESS｜職場品味・香氛體驗之夜
- 圖片：香氛品味之夜.png
- 活動內容：18:00 報到、19:00 場次一、20:00 場次二、21:00 現場交流、22:00 活動結束
- 報名表單欄位：姓名、email、單位、電話、職稱
- 表單資料需寫入 Google Sheet：2026_香水體驗
- Google Apps Script 需將「電話」欄位設定為文字格式

## 本地預覽

可在本機啟動簡單伺服器：

```bash
python -m http.server 8000
```

之後開啟 http://localhost:8000

## Google Apps Script

Google Sheet 檔名為 `2026_香水體驗`，資料工作表名稱為 `報名資料`，第一列為欄位標題。
`appscript/Code.gs` 是範本；若自行建立 Apps Script 專案，請先將 `SPREADSHEET_ID` 設為試算表 ID，再執行 `setupSheet()`。

目前 Web App 部署網址已設於 `script.js`。
