# AGENTS.md — FinNote Lab 專案開發規範

> **本文件是未來 AI 協作的唯一專案級開發規範。** 每次新增或修改網站內容前，必須先讀完本文件，並遵守「完成條件」。除非使用者明確要求，勿擅自改變資訊架構、視覺系統或技術選型。

## 1. 專案目標

FinNote Lab 是給財金研究者的繁體中文概念筆記網站，透過短篇、易讀、有例子的筆記解釋財務指標、公司理財、實證研究方法。

**真正的交付價值**：不只是把現有頁面完成，而是設計一套能反覆新增筆記的規範。新增一篇文章不需要手工複製 HTML，也不應修改網站主要版型。

**對象**：修習財金、經濟或計量課程、剛開始閱讀學術論文的學生。

**寫作語言**：台灣繁體中文。專有名詞第一次出現時採「中文（English）」；後續可用中文或學界常用縮寫。

## 2. 技術選擇與不可更動原則

- 靜態 HTML + CSS + 原生 JavaScript + Markdown + JSON 索引，**不使用 React/Vue、建置工具、後端及 API Key**。
- 網站可直接部署 GitHub Pages：`main` 分支的 `/docs` 資料夾；首頁入口為 `docs/index.html`。
- 全部資源用 `./` 形式的**相對路徑**，確保 GitHub Pages 子路徑可運作。
- 除 Google Fonts 的選用字型外，網站閱讀內容與互動不依賴 CDN；字型載入失敗仍必須可讀。
- Markdown 文章是內容單一來源；HTML 頁面不應硬寫個別文章內容。
- 不可將個資、密碼、API Key、非公開資料或未經授權的論文全文放入公開專案。

## 3. 資料夾結構

```text
finnote-lab/
├─ AGENTS.md                       ← AI 先讀這份規範
├─ README.md                       ← 人類使用說明與部署指引
├─ docs/                           ← GitHub Pages 網站根目錄
│  ├─ index.html                    ← 首頁 HTML 外殼
│  ├─ .nojekyll                     ← 不需 Jekyll 處理
│  ├─ assets/
│  │  ├─ css/styles.css             ← 全站視覺與響應式樣式
│  │  └─ js/app.js                  ← 路由、搜尋、篩選、Markdown 顯示
│  └─ content/
│     ├─ catalog.json              ← 全站唯一文章索引
│     └─ articles/<slug>.md         ← 個別文章
├─ templates/article.md            ← 新文章範本（不會發布成卡片）
└─ scripts/check_content.py        ← 索引與檔案檢查工具
```

## 4. 視覺與頁面結構

### 風格

- 關鍵字：**研究筆記、清爽、理性、有溫度、方便閱讀**。
- 以奶油白底、深墨綠、淺綠點綴；深色模式使用既有 CSS variables。
- 使用 `styles.css` 既有元件，不任意加入新字體、顏色或完整第二套版型。
- 手機、平板、桌機都必須可用。內文不可以超出畫面，表格容許水平捲動。
- 優先確保文字可讀性、對比、鍵盤操作、標題層級與按鈕無障礙標籤。

### 固定資訊架構

1. **首頁**：品牌介紹、知識庫統計、搜尋、分類篩選、文章卡片。
2. **文章頁**：返回首頁連結、主題、標題、摘要、更新時間、閱讀時間、內文、段落目錄、下一篇閱讀。
3. **規則介紹頁**：向使用者說明如何依規範擴充網站。

## 5. 新增文章的標準流程（最重要）

### A. 建立 Markdown 文件

檔案位置：`docs/content/articles/<slug>.md`

- `slug` 一律使用 **小寫英文與連字號**，如 `difference-in-differences.md`。
- 複製 `templates/article.md`，不要在 Markdown 開頭加入 YAML Front Matter；標題與描述由索引提供。
- 文章至少包含三個 `##` 二級標題：定義或核心問題、例子/機制、限制/延伸。
- 每篇建議 400–900 個中文字，避免只有名詞定義，應該有例子、比較或研究思考。
- 可用的 Markdown：`##`/`###`/`####` 標題、粗體、斜體、行內程式碼、程式碼區塊、項目列表、數字列表、引用、簡單表格、`https` 連結。
- **目前不支援**直接嵌入 HTML、LaTeX 數學渲染、圖片語法、註腳與複雜巢狀 Markdown；不要假設這些語法可用。公式請先用純文字或 code block 表達。

### B. 註冊至 `docs/content/catalog.json`

每篇必須新增**一個**物件，欄位固定如下：

```json
{
  "slug": "difference-in-differences",
  "title": "DID 是什麼？",
  "category": "因果推論",
  "summary": "用政策前後與處理、對照組的比較，理解雙重差分設計。",
  "tags": ["DID", "平行趨勢", "因果推論"],
  "updated": "2026-11-15",
  "minutes": 6,
  "file": "content/articles/difference-in-differences.md"
}
```

**規則：**

- `slug` 全站不可重複，且必須與 `<slug>.md` 完全一致。
- `title` 要能讓讀者一眼理解；`summary` 一句話、約 25–65 字，不可空白。
- `category` 預設只能使用：`因果推論`、`財務指標`、`公司理財`。需要新分類時，先確認有必要，再更新本文件與樣式。
- `tags` 需 2–4 個相關字詞，混合學界英文縮寫與中文皆可。
- `updated` 使用實際修改日 `YYYY-MM-DD`，不可虛構發表或更新時間。
- `minutes` 為正整數，代表估計閱讀分鐘數。
- `file` 只能寫 `content/articles/<slug>.md`，不得使用外部網址或上層目錄。
- 索引的文章排列就是首頁順序與「下一篇」順序；新增文章放在概念順序合理的位置。
- 新增 Markdown 後一定要同步更新 catalog；**不需修改 `index.html` 或 `app.js` 才讓文章出現**。

### C. 內容正確性規範

- 清楚區分：相關性 vs. 因果關係、研究假設 vs. 實證結果、舉例數字 vs. 真實數據。
- 引用論文或統計數字時需標示可核對的出處，**不可自行編造研究結果、作者、期刊或樣本數**。
- 對有爭議的方法或結論，說明適用條件與限制，不把單篇研究推論成普遍事實。
- 來源不夠清楚時明示「待查證」，必要時向使用者詢問，不要裝作已驗證。
- 不複製有版權的完整學術文章內容；應自己整理並適當附來源。

## 6. AI 修改程式的規則

- **修改前**確認需求屬於「內容新增」、「內容修訂」、「UI 調整」或「功能變更」，優先用最小範圍修改。
- 新增/修訂概念筆記，只修改 `.md`、`catalog.json`，無必要不可動 `app.js`、`styles.css`。
- 若新增新功能，需維持既有 hash 路由（`#/`、`#/notes/<slug>`、`#/guide`），不得破壞舊連結。
- 將文字插入 HTML 前必須跳脫或淨化內容，防止不可信 Markdown 插入腳本。
- 避免沒必要的第三方套件；修改視覺時需同時檢查手機斷點和深色模式。
- 不可把測試檔、開發用草稿或敏感資料直接混入 `/docs/content/articles/`。

## 7. 每次修改後必做 QA

1. 執行 `python scripts/check_content.py`，確認 JSON、路徑、日期、標題與 slug 正確。
2. 在專案根目錄執行 `python -m http.server 8000 -d docs`，用瀏覽器開 `http://localhost:8000`。
3. 檢查首頁卡片是否出現、標題與摘要正確、搜尋與分類有效。
4. 點進新增文章，檢查文章、目錄、下一篇導覽；在手機寬度檢查是否溢出。
5. 檢查深色模式切換與鍵盤使用情況；確認無瀏覽器 console error。
6. 若修改任何 JS，執行 `node --check docs/assets/js/app.js`。
7. 沒有完成檢查不得宣稱功能正常或已部署。

## 8. GitHub 與完成條件

- 專案必須上傳 GitHub；`AGENTS.md` 與 `README.md` 必須留在 repo 根目錄。
- GitHub Pages 設定：`Settings → Pages → Deploy from a branch → main /docs`。
- 交付時需提供 repository URL 和可實際開啟的 Pages URL（沒有部署前不可虛構網址）。
- **完成定義**：首頁和文章頁正常、內容規格可被下一個 AI 重複使用、上述檢查通過、使用者完成 GitHub Pages 發布。

## 9. 接到「幫我新增一篇 X 筆記」時，AI 應採取的行動

1. 先讀這份 `AGENTS.md` 和 `catalog.json`，檢查有無相同主題。
2. 以 `templates/article.md` 為基礎撰寫 `docs/content/articles/<slug>.md`。
3. 在 `catalog.json` 新增正確且唯一的索引物件。
4. 執行自動檢查與瀏覽器檢查，修正問題。
5. 回報新增檔案、內容重點、檢查結果、是否已部署。

**本規範的中心思想：寫一次規則，讓未來的新增工作可以持續複用。**
