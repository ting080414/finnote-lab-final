# FinNote Lab｜財金研究筆記庫


FinNote Lab 是一個無後端、無建置步驟的繁體中文財金研究筆記網站，初始提供四篇筆記：內生性、Fuzzy RDD、EPS Surprise、股票回購與投資。網站包含搜尋、主題分類、文章頁、段落目錄、深色模式、手機版及「如何擴充」說明。

本作業最重要的檔案是 [AGENTS.md](./AGENTS.md)：它定義了專案目的、視覺規則、檔案結構、Markdown 寫法、索引欄位、AI 修改準則、測試與發布流程。

## 目錄

```text
AGENTS.md                        AI 協作規範（必讀）
README.md                        使用方法
scripts/check_content.py         文章索引品質檢查
templates/article.md             新文章範本
docs/index.html                  GitHub Pages 首頁
docs/assets/css/styles.css       全站樣式
docs/assets/js/app.js            搜尋、分類、路由、Markdown 顯示
docs/content/catalog.json        文章索引
docs/content/articles/*.md       四篇研究概念文章
```

## 本機預覽

需要 Python 3，請在**專案根目錄**執行：

```bash
python -m http.server 8000 -d docs
```

打開 <http://localhost:8000>。請不要直接雙擊 `docs/index.html`：瀏覽器的檔案存取限制會阻止 `fetch()` 讀取索引與 Markdown。

文章/索引檢查：

```bash
python scripts/check_content.py
node --check docs/assets/js/app.js     # 選用：如電腦有安裝 Node.js
```

## 如何新增第五篇筆記

1. 先閱讀 `AGENTS.md`。
2. 複製 `templates/article.md`，儲存成 `docs/content/articles/difference-in-differences.md`。
3. 依照規範撰寫 Markdown 內容。
4. 在 `docs/content/catalog.json` 新增文章索引（範例在 AGENTS.md）。
5. 執行 `python scripts/check_content.py`，本機檢查後提交 GitHub。

網站會根據 JSON 自動產生新卡片與文章頁，**不用新增一個 HTML 檔案**。

### 之後可以對 AI 下的指令

> 先閱讀這個 repo 的 AGENTS.md，依照裡面的命名、文體、目錄結構和 QA 規範，幫我新增一篇「雙重差分 DID」的筆記。請只新增 Markdown 與更新 catalog.json，不要更改首頁的版型。完成後執行檢查並說明結果。

## 發布到 GitHub Pages

### 方式 A：直接用 GitHub 網頁上傳（沒有 Git 也可以）

1. 登入 GitHub，建立 **Public** repository，建議名稱：`finnote-lab`。
2. 解壓縮專案 ZIP；進入 GitHub repository 的 **Add file → Upload files**，將專案根目錄內的 `AGENTS.md`、`README.md`、`docs`、`scripts`、`templates` 等完整檔案與資料夾上傳。**不要只上傳 ZIP 本身**。若瀏覽器上傳資料夾不方便，使用方式 B。
3. 上傳完成後進入 **Settings → Pages**。
4. 在 **Build and deployment** 選 **Deploy from a branch**；Branch 選 `main`、Folder 選 `/docs`，按 **Save**。
5. 發布完成後在 Pages 設定中點選 **Visit site**；一般專案網址格式為 `https://你的GitHub帳號.github.io/finnote-lab/`。

### 方式 B：使用 Git 指令

先在 GitHub 建立空白 Public repository `finnote-lab`，接著於專案根目錄執行：

```bash
git init
git add .
git commit -m "Initial FinNote Lab with AGENTS.md"
git branch -M main
git remote add origin https://github.com/你的GitHub帳號/finnote-lab.git
git push -u origin main
```

再依照方式 A 的第 3–5 步開啟 Pages。


## 作業規範


| 作業要求 | 本專案完成位置 |
| --- | --- |
| 決定專案主題 | 財金研究概念筆記庫 |
| 建立 AGENTS.md | 專案根目錄 `AGENTS.md` |
| 可重複使用的規則 | Markdown 範本＋catalog schema＋QA 規則 |
| AI 開發網頁 | `docs/index.html`、`styles.css`、`app.js` |
| 至少一個正常頁面 | 首頁＋四個文章頁＋擴充說明頁 |
| GitHub 公開與網站 | 按照上述步驟由 repo 擁有者發布 |

## 備註

初始文章為概念教學整理，非投資建議；範例數字僅用於說明，不能當成真實公司數據或研究結論。日後若加入具體論文結論，需依 AGENTS.md 附上可核對來源。
