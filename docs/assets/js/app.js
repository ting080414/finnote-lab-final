/* FinNote Lab — no build step, no framework, relative paths for GitHub Pages. */
(() => {
  'use strict';

  const main = document.getElementById('main-content');
  const breadcrumb = document.getElementById('top-breadcrumb');
  const sideCategories = document.getElementById('side-categories');
  const sidebar = document.getElementById('sidebar');
  const menuButton = document.getElementById('menu-button');
  const themeButton = document.getElementById('theme-button');
  const state = { notes: [], category: '全部', query: '', viewToken: 0 };
  const categoryStyles = { '因果推論': '', '財務指標': 'blue', '公司理財': 'orange' };
  const articleCache = new Map();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function safeSlug(value) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value); }
  function encodeNoteUrl(note) { return `#/notes/${note.slug}`; }
  function icon(category) { return category === '因果推論' ? '⌁' : category === '財務指標' ? '◈' : '▣'; }
  function getCategories() { return [...new Set(state.notes.map(n => n.category))]; }

  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    themeButton.textContent = value === 'dark' ? '☀' : '☾';
    themeButton.setAttribute('aria-label', value === 'dark' ? '切換淺色模式' : '切換深色模式');
    try { localStorage.setItem('finnote-theme', value); } catch (_) { /* Private mode is fine */ }
  }
  try { setTheme(localStorage.getItem('finnote-theme') === 'dark' ? 'dark' : 'light'); }
  catch (_) { setTheme('light'); }
  themeButton.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
  }
  menuButton.addEventListener('click', () => {
    const open = sidebar.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSidebar(); });
  sidebar.addEventListener('click', e => { if (e.target.closest('a,button')) closeSidebar(); });

  function setBreadcrumb(label) {
    breadcrumb.innerHTML = `WORKSPACE <span>/</span> ${escapeHtml(label)}`;
  }
  function refreshSideNav(isHome) {
    document.getElementById('nav-home').classList.toggle('is-active', isHome);
    document.getElementById('nav-start').classList.toggle('is-active', !isHome && location.hash.includes('endogeneity'));
    const entries = sideCategories.querySelectorAll('[data-category]');
    entries.forEach(node => node.classList.toggle('is-active', isHome && node.dataset.category === state.category));
  }
  function buildSideCategories() {
    document.getElementById('nav-total').textContent = String(state.notes.length).padStart(2, '0');
    sideCategories.innerHTML = getCategories().map(category => {
      const count = state.notes.filter(note => note.category === category).length;
      return `<button type="button" class="cat-link" data-category="${escapeHtml(category)}"><span class="cat-dot" aria-hidden="true"></span>${escapeHtml(category)}<span class="cat-count">${count}</span></button>`;
    }).join('');
    sideCategories.addEventListener('click', e => {
      const button = e.target.closest('[data-category]');
      if (!button) return;
      state.category = button.dataset.category;
      state.query = '';
      if (location.hash !== '#/') location.hash = '#/';
      else renderHome();
    });
  }

  function card(note, index) {
    const cls = categoryStyles[note.category] || '';
    return `<a class="note-card" href="${encodeNoteUrl(note)}" aria-label="閱讀：${escapeHtml(note.title)}">
      <div class="card-top"><span class="category-pill ${cls}">${escapeHtml(note.category)}</span><span class="card-index">${String(index + 1).padStart(2, '0')}</span></div>
      <h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(note.summary)}</p>
      <div class="card-bottom"><span class="card-tags">${note.tags.slice(0, 2).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</span><span class="card-open" aria-hidden="true">↗</span></div>
    </a>`;
  }
  function renderCards() {
    const query = state.query.trim().toLocaleLowerCase();
    const filtered = state.notes.filter(note => {
      const matchesCategory = state.category === '全部' || note.category === state.category;
      const haystack = [note.title, note.summary, note.category, ...note.tags].join(' ').toLocaleLowerCase();
      return matchesCategory && (!query || haystack.includes(query));
    });
    const result = document.getElementById('note-results');
    const count = document.getElementById('result-count');
    if (!result || !count) return;
    count.textContent = `${filtered.length} 篇筆記`;
    result.innerHTML = filtered.length
      ? filtered.map(note => card(note, state.notes.indexOf(note))).join('')
      : `<div class="empty-state" style="grid-column:1/-1">沒有找到符合的筆記。試試其他關鍵字或分類。</div>`;
    document.querySelectorAll('.filter-chip').forEach(button => {
      const selected = button.dataset.filter === state.category;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    refreshSideNav(true);
  }
  function renderHome() {
    state.viewToken++;
    setBreadcrumb('總覽');
    const cat = getCategories();
    main.innerHTML = `<section class="hero" aria-label="網站介紹">
      <div class="hero-copy"><span class="eyebrow">YOUR PERSONAL RESEARCH SPACE</span>
        <h1>把複雜的論文，<br>變成<em>看得懂的筆記。</em></h1>
        <p>從財金名詞、實證方法到研究設計，用自己的節奏整理每一個重要概念。這是一個可以持續擴充的知識庫。</p>
        <div class="hero-actions"><a class="btn btn-primary" href="#/notes/endogeneity">開始閱讀 <span aria-hidden="true">↗</span></a><a class="btn btn-secondary" href="#/guide">網站如何擴充？ <span aria-hidden="true">→</span></a></div>
      </div><div class="hero-art" aria-hidden="true"><div class="diagram-card"><div class="diagram-header"><span>RESEARCH LOG / 01</span><span class="diagram-number">2026</span></div><div class="diagram-equation">X <span>→</span> Y <span>?</span></div><div class="diagram-rule"></div><div class="diagram-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="diagram-caption">FROM QUESTIONS TO INSIGHTS</div><span class="diagram-sticker">✦ Keep exploring</span></div></div>
      </section>
      <section class="stats-row" aria-label="筆記統計"><div class="stat"><div class="stat-mark" aria-hidden="true">▤</div><strong>${state.notes.length.toString().padStart(2,'0')}</strong><span>篇研究筆記</span></div><div class="stat"><div class="stat-mark" aria-hidden="true">◷</div><strong>${cat.length.toString().padStart(2,'0')}</strong><span>個主題分類</span></div><div class="stat"><div class="stat-mark" aria-hidden="true">✧</div><strong>∞</strong><span>持續擴充</span></div></section>
      <section aria-labelledby="library-heading"><div class="section-head"><div><span class="eyebrow">KNOWLEDGE LIBRARY</span><h2 id="library-heading">探索研究筆記</h2><p>每一篇筆記，都是理解下一篇論文的起點。</p></div><span class="small-note">CURATED NOTES · VOL. 01</span></div>
      <div class="search-row"><label class="search-field"><span aria-hidden="true">⌕</span><input id="note-search" type="search" aria-label="搜尋筆記" placeholder="搜尋標題、摘要或標籤…" value="${escapeHtml(state.query)}"></label><span id="result-count" class="search-count"></span></div>
      <div class="filter-row" id="filters" aria-label="篩選分類">${['全部', ...cat].map(c => `<button type="button" class="filter-chip" data-filter="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div>
      <div class="article-grid" id="note-results"></div></section>
      <section class="learn-path"><div><span class="eyebrow">THE LEARNING PATH</span><h3>不知道該從哪篇開始？</h3><p>先掌握「內生性」，再一路理解 Fuzzy RDD 和 EPS 門檻。</p></div><a href="#/notes/endogeneity">跟著閱讀路線走 →</a></section>`;
    document.getElementById('note-search').addEventListener('input', e => { state.query = e.target.value; renderCards(); });
    document.getElementById('filters').addEventListener('click', e => {
      const button = e.target.closest('[data-filter]');
      if (!button) return;
      state.category = button.dataset.filter;
      renderCards();
    });
    renderCards();
  }

  function formatInline(text) {
    const stash = [];
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, (_all, code) => {
      const key = `FINNOTETOKEN${stash.length}END`;
      stash.push(`<code>${code}</code>`);
      return key;
    });
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
      (_all, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    stash.forEach((html, index) => { s = s.replace(`FINNOTETOKEN${index}END`, html); });
    return s;
  }
  function isTableSeparator(s) { return /^\s*\|?[\s:|-]+\|?\s*$/.test(s) && /-{3,}/.test(s); }
  function tableCells(line) { return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(v => v.trim()); }
  function isBlockStart(lines, i) {
    const text = lines[i] || '';
    return /^#{2,4}\s|^```|^>\s?|^[-*]\s|^\d+\.\s/.test(text) || (text.includes('|') && isTableSeparator(lines[i+1] || ''));
  }
  function markdownToHtml(md) {
    const lines = md.replace(/\r\n?/g, '\n').split('\n');
    const html = [];
    const headings = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      if (/^```/.test(line)) {
        i++; const code = [];
        while (i < lines.length && !/^```/.test(lines[i])) code.push(lines[i++]);
        if (i < lines.length) i++;
        html.push(`<pre><code>${escapeHtml(code.join('\n'))}</code></pre>`);
        continue;
      }
      const heading = line.match(/^(#{2,4})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        const text = heading[2].trim();
        const id = `section-${headings.length+1}`;
        headings.push({ id, text, level });
        html.push(`<h${level} id="${id}">${formatInline(text)}</h${level}>`);
        i++; continue;
      }
      if (line.includes('|') && isTableSeparator(lines[i + 1] || '')) {
        const head = tableCells(line);
        i += 2;
        const rows = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(tableCells(lines[i++]));
        html.push(`<div class="table-wrap"><table><thead><tr>${head.map(x => `<th>${formatInline(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${head.map((_h,j) => `<td>${formatInline(row[j]||'')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      if (/^>\s?/.test(line)) {
        const q = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) q.push(lines[i++].replace(/^>\s?/, ''));
        html.push(`<blockquote><p>${formatInline(q.join(' '))}</p></blockquote>`);
        continue;
      }
      if (/^[-*]\s/.test(line) || /^\d+\.\s/.test(line)) {
        const ordered = /^\d+\.\s/.test(line);
        const regex = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;
        const items = [];
        while (i < lines.length && regex.test(lines[i])) items.push(lines[i++].replace(regex, ''));
        const type = ordered ? 'ol' : 'ul';
        html.push(`<${type}>${items.map(item => `<li>${formatInline(item)}</li>`).join('')}</${type}>`);
        continue;
      }
      const paragraph = [line.trim()]; i++;
      while (i < lines.length && lines[i].trim() && !isBlockStart(lines, i)) paragraph.push(lines[i++].trim());
      html.push(`<p>${formatInline(paragraph.join(' '))}</p>`);
    }
    return { html: html.join('\n'), headings };
  }

  async function loadArticle(note) {
    if (articleCache.has(note.slug)) return articleCache.get(note.slug);
    const response = await fetch(`./${note.file}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`無法載入 ${note.file}`);
    const text = await response.text();
    articleCache.set(note.slug, text);
    return text;
  }
  async function renderNote(slug) {
    const note = state.notes.find(n => n.slug === slug);
    if (!note) { renderNotFound(); return; }
    const view = ++state.viewToken;
    setBreadcrumb(note.title);
    refreshSideNav(false);
    main.innerHTML = '<div class="loading-state">正在開啟筆記…</div>';
    try {
      const md = await loadArticle(note);
      if (view !== state.viewToken) return;
      const parsed = markdownToHtml(md);
      const next = state.notes[(state.notes.indexOf(note)+1)%state.notes.length];
      main.innerHTML = `<div class="note-crumb"><a href="#/">所有筆記</a><span>/</span>${escapeHtml(note.category)}</div>
        <header class="note-heading"><span class="category-pill ${categoryStyles[note.category] || ''}">${escapeHtml(note.category)}</span><h1>${escapeHtml(note.title)}</h1><p>${escapeHtml(note.summary)}</p></header>
        <div class="note-meta"><span>◷ 約 ${note.minutes} 分鐘閱讀</span><span>▤ 更新於 ${escapeHtml(note.updated)}</span><span>${note.tags.map(tag => `#${escapeHtml(tag)}`).join('　')}</span></div>
        <div class="note-layout"><article class="note-article" aria-label="筆記內容">${parsed.html}</article>
          <nav class="note-toc" aria-label="本篇目錄"><h3>ON THIS PAGE</h3>${parsed.headings.filter(h => h.level <= 3).map(h => `<button type="button" class="${h.level === 3 ? 'toc-sub' : ''}" data-scroll="${h.id}">${escapeHtml(h.text)}</button>`).join('')}</nav></div>
        <a class="note-next" href="${encodeNoteUrl(next)}"><span><small>CONTINUE READING</small><strong>${escapeHtml(next.title)}</strong></span><span class="arrow" aria-hidden="true">↗</span></a>`;
      main.querySelector('.note-toc').addEventListener('click', e => {
        const b = e.target.closest('[data-scroll]');
        if (b) document.getElementById(b.dataset.scroll)?.scrollIntoView({behavior:'smooth', block:'start'});
      });
    } catch (err) {
      if (view !== state.viewToken) return;
      main.innerHTML = `<div class="error-state"><strong>筆記載入失敗</strong><p>${escapeHtml(err.message)}</p><p>請透過本機伺服器或 GitHub Pages 開啟網站，而非直接雙擊 HTML 檔。</p><a href="#/">返回首頁</a></div>`;
    }
  }
  function renderGuide() {
    state.viewToken++;
    setBreadcrumb('專案規則');
    refreshSideNav(false);
    main.innerHTML = `<div class="guide"><span class="eyebrow">BUILD ON A SYSTEM, NOT A ONE-TIME PAGE</span><h1>一個網站，也是一套可重複使用的規則。</h1>
      <p>這次專案的重點不只是呈現四篇筆記，而是讓下一次 AI 讀完 <code>AGENTS.md</code> 後，就知道該如何正確新增第五篇、第六篇……</p>
      <div class="guide-list">
        <div class="guide-step"><span>01</span><div><h3>先閱讀 AGENTS.md</h3><p>理解專案目的、視覺風格、檔案命名與修改前的檢查清單。</p></div></div>
        <div class="guide-step"><span>02</span><div><h3>使用固定的 Markdown 範本</h3><p>在 <code>docs/content/articles/</code> 建立一篇新文章，至少包含概念、例子、注意事項。</p></div></div>
        <div class="guide-step"><span>03</span><div><h3>在 catalog.json 註冊</h3><p>新增標題、分類、摘要、標籤、閱讀時間、日期及檔案路徑，首頁卡片就會自動出現。</p></div></div>
        <div class="guide-step"><span>04</span><div><h3>驗證、提交、發布</h3><p>執行 <code>python scripts/check_content.py</code> 檢查資料，再推送到 GitHub，GitHub Pages 就會更新。</p></div></div>
      </div><div class="guide-footer">想看 AI 需要遵守的完整規格？請打開專案根目錄的 <strong>AGENTS.md</strong>。它是給未來共同開發這個網站的 AI 所讀的操作手冊。</div>
      <p style="margin-top:25px"><a class="btn btn-primary" href="#/">← 回到筆記首頁</a></p></div>`;
  }
  function renderNotFound() {
    state.viewToken++;
    setBreadcrumb('找不到頁面');
    main.innerHTML = '<div class="empty-state"><h2>這篇筆記不存在</h2><p>可能是連結輸入錯誤，或文章尚未加入索引。</p><a class="btn btn-primary" href="#/">返回所有筆記 →</a></div>';
  }
  function router() {
    closeSidebar();
    window.scrollTo(0, 0);
    const hash = location.hash || '#/';
    if (hash === '#/' || hash === '#') renderHome();
    else if (hash === '#/guide') renderGuide();
    else if (/^#\/notes\/[a-z0-9-]+$/.test(hash)) renderNote(hash.split('/')[2]);
    else renderNotFound();
  }
  async function init() {
    try {
      const response = await fetch('./content/catalog.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('索引檔案讀取失敗');
      const notes = await response.json();
      if (!Array.isArray(notes) || !notes.length || notes.some(note => !safeSlug(note.slug))) throw new Error('索引格式不正確');
      state.notes = notes;
      buildSideCategories();
      window.addEventListener('hashchange', router);
      router();
    } catch (err) {
      main.innerHTML = `<div class="error-state"><strong>網站無法讀取筆記</strong><p>${escapeHtml(err.message)}</p><p>請執行 <code>python -m http.server 8000 -d docs</code>，或將專案部署至 GitHub Pages。</p></div>`;
    }
  }
  init();
})();
