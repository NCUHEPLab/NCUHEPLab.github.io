# 高能物理實驗室網站

將此資料夾內的檔案上傳至 GitHub Pages 儲存庫根目錄，保持 assets 資料夾結構。GitHub 儲存庫 Settings → Pages 選擇 Deploy from a branch，指定分支與根目錄後儲存。

## 修改內容

- `content.js` 儲存中文與英文文案，請同步修改兩個語言區塊。
- 三個選單依序對應研究方向、People（團隊成員與活動剪影獨立頁）、聯絡我們。首頁為 index.html，成員與活動剪影為 people.html。
- `LAB_SETTINGS.email` 填入真實電子郵件後，聯絡連結會自動出現。
- `members`、地址目前為待填資料，請在正式公開前替換。
- `assets/slide-01.svg` 至 `slide-05.svg` 為自製抽象探測器示意圖，不是實驗照片。替換成照片時，請同步修改 index.html 和 app.js 中的圖片路徑、替代文字與 content.js 的 galleryNote。

## 功能

中英切換及語言記憶、手機選單、輪播上下一張與暫停、減少動態效果偏好、點擊才載入的 YouTube 嵌入及外連、響應式排版、鍵盤焦點與跳至主內容。

## 參考

參考 Shibuya Lab 的日期式消息與圖文研究專案組織方式 https://shibuyalab.github.io/ 。內容與圖像未複製自該網站。
EIC 影片出處 https://www.jlab.org/eic 。影片授權與嵌入可用性由來源平台管理。

## 驗證

已檢查 JavaScript 語法、雙語欄位對齊、本地資源與跨頁導覽錨點。首頁輪播有五張圖片。尚未以瀏覽器驗證版面與外部影片播放。YouTube 在直接以 file:// 開啟時可能無法播放，請使用頁面的外連，或部署 GitHub Pages 後測試嵌入播放。

## 配色

主色 `#4C6AAC`，輔色 `#CA561F`。可在 style.css 最上方的 :root 調整。主色用於標題與導覽，輔色用於按鈕邊線及標記，小字採較深的橘色以保持可讀性。五張抽象探測器示意圖同步使用藍橘配色。

## Featured Project 與 Videos 多項輪播

在 `content.js` 最後的 `window.LAB_SETTINGS` 編輯兩個清單。

- `featuredProjects` 每筆包含照片路徑 `src`、項目標題 `title`、說明 `description`、照片說明 `caption`，也可提供替代文字 `alt`。按左右鍵時，整組圖文會一起切換。
- `videos` 每筆包含影片連結 `url`、標題 `title`、說明 `description`。按左右鍵時，影片與文字一起切換，前一支播放器會被移除。
- 複製清單內的一筆物件即可新增項目。文字可使用 `{ "zh": "中文", "en": "English" }` 或單一字串。
- 照片放入 `assets`，例如 `assets/cms.jpg`。目前四個研究項目皆使用示意圖，請替換為實際研究照片。
- 兩區各自使用左右按鈕手動循環，顯示目前項目／總數。只有一筆時隱藏按鈕。
- 空的研究項目清單會隱藏照片並清空項目說明，空的影片清單顯示待更新訊息。無效影片網址會略過。
- 現有首頁五張背景輪播與 People 頁維持原有設定。

預設提供四個研究項目及三支外部影片。這些外部影片作為初始示範，可自行替換。

影片來源

- EIC 介紹 https://www.jlab.org/eic
- sPHENIX 公開講座 https://www.bnl.gov/video/index.php?v=1040
- EIC 公開講座 https://www.bnl.gov/video/index.php?v=1042

已從官方網頁確認影片嵌入連結，尚未在瀏覽器實測播放。嵌入限制由 YouTube 與發布者決定，每支影片也提供外連。

## Logo

首頁與 People 頁共用 `assets/chip-logo.png`，為提供的原始透明 PNG。CSS 僅調整顯示框以略去周圍透明空間，桌面為 56px、手機為 44px。

## 首頁五組輪播文案

已依新上傳的 app(1).js 與 content(1).js 更新。中英文各有五筆 `heroSlides`，依序為實驗室介紹、CMS、sPHENIX、ePIC、Muography，對應 slide-01.svg 至 slide-05.svg。每筆可修改 src、eyebrow、title、intro、button、link。圖片、文字和按鈕隨輪播同步切換，中英切換保留目前頁次。現有 index.html 不需修改。五組按鈕目前皆連至 #research。
