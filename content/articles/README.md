# 文章

每篇文章使用一個 Markdown 檔案，檔名作為預設網址 slug。必要欄位：

```markdown
---
title: 文章標題
slug: article-slug
date: 2026-10-03
excerpt: 顯示在文章列表的摘要
cover: assets/portfolio/03-webp.webp
tags: 開發, 遊戲
published: true
---

文章內容使用 Markdown。
```

在本機執行 `node scripts/dev-server.mjs` 後，可前往 `/admin-local` 編輯與儲存。完成後執行 `node scripts/build.mjs` 產生 GitHub Pages 使用的文章頁、sitemap 與 RSS。網站沒有接資料庫、付費 API 或自動部署。
