import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const articleDir = path.join(root, 'content/articles');
const basePath = (process.env.SITE_BASE_PATH || '').replace(/^\/+|\/+$/g, '');
const base = basePath ? `/${basePath}/` : '/';
const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function parse(raw, file) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter`);
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) { const m = line.match(/^([\w-]+):\s*(.*)$/); if (m) meta[m[1]] = m[2].replace(/^['"]|['"]$/g, ''); }
  const slug = meta.slug || path.basename(file, '.md');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${file}: invalid slug`);
  if (!meta.title || !meta.date) throw new Error(`${file}: title and date are required`);
  return { ...meta, slug, body: match[2].trim() };
}
function markdown(md) {
  const blocks = md.replace(/\r/g,'').split(/\n{2,}/); const out=[]; let list='';
  const inline = s => escapeHtml(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  for (const b of blocks) { const lines=b.split('\n'); const h=b.match(/^(#{1,3})\s+(.+)$/); const li=lines.every(x=>/^[-*]\s+/.test(x));
    if (li) { const tag=list||'ul'; out.push(`<${tag}>${lines.map(x=>`<li>${inline(x.replace(/^[-*]\s+/,''))}</li>`).join('')}</${tag}>`); }
    else if (h) out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    else if (b.startsWith('> ')) out.push(`<blockquote>${inline(b.replace(/^>\s?/gm,''))}</blockquote>`);
    else if (b.startsWith('```')) out.push(`<pre><code>${escapeHtml(b.replace(/^```[^\n]*\n?|```$/g,''))}</code></pre>`);
    else if (b.trim()) out.push(`<p>${lines.map(inline).join('<br>')}</p>`);
  }
  return out.join('\n');
}
const files = (await readdir(articleDir)).filter(f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md');
const articles=[];
for (const file of files) { const article=parse(await readFile(path.join(articleDir,file),'utf8'),file); if(article.published !== 'false') articles.push(article); }
articles.sort((a,b)=>b.date.localeCompare(a.date));
const publicUrl = slug => `${base}articles/${slug}/`;
const imageUrl = cover => /^(https?:|\/)/i.test(cover) ? cover : `${base}${cover}`;
const card = a => `<a class="article-card reveal is-visible" href="${publicUrl(a.slug)}"><span class="article-cover">${a.cover ? `<img src="${escapeHtml(imageUrl(a.cover))}" alt="" loading="lazy">` : '<span class="article-placeholder" aria-hidden="true">✎</span>'}</span><span class="article-copy"><span class="article-date">${escapeHtml(a.date)}</span><h2>${escapeHtml(a.title)}</h2><p>${escapeHtml(a.excerpt || '')}</p>${a.tags?`<span class="tag-list">${a.tags.split(',').map(tag=>`<span>${escapeHtml(tag.trim())}</span>`).join('')}</span>`:''}<span class="article-read">閱讀文章 <span aria-hidden="true">↗</span></span></span></a>`;
const listPath=path.join(root,'articles/index.html'); let list=await readFile(listPath,'utf8');
list=list.replace(/<div class="container articles-list" id="article-list">[\s\S]*?<\/div>/,`<div class="container articles-list" id="article-list">${articles.length ? articles.map(card).join('\n') : '<p class="empty-state">文章整理中，稍後再來看看。<br><a class="text-link" href="https://www.patreon.com/c/ecjojoDev" target="_blank" rel="noopener noreferrer">到 Patreon 看文章與開發紀錄 ↗</a></p>'}</div>`);
await writeFile(listPath,list);
for(const a of articles){const dir=path.join(root,'articles',a.slug);await mkdir(dir,{recursive:true});const url=publicUrl(a.slug);const html=`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${escapeHtml(a.description||a.excerpt||a.title)}"><meta property="og:title" content="${escapeHtml(a.title)}｜ecjojo"><meta property="og:description" content="${escapeHtml(a.excerpt||'')}"><link rel="canonical" href="${url}"><link rel="stylesheet" href="${base}assets/site.css"><script src="${base}assets/site.js" defer></script><title>${escapeHtml(a.title)}｜ecjojo</title></head><body><header class="site-header"><div class="container header-inner"><a class="brand" href="${base}"><img class="brand-mark" src="${base}assets/lemon.svg" alt=""><span>ecjojo</span></a><nav class="desktop-nav"><a href="${base}">首頁</a><a href="${base}projects/">作品</a><a aria-current="page" href="${base}articles/">文章</a></nav><a class="text-link" href="${base}articles/">← 所有文章</a></div></header><main class="container article-page"><p class="eyebrow">文章與筆記</p><h1 class="section-title">${escapeHtml(a.title)}</h1><div class="article-byline">${escapeHtml(a.date)}${a.tags?` · ${escapeHtml(a.tags)}`:''}</div>${a.cover?`<img class="article-page-cover" src="${escapeHtml(imageUrl(a.cover))}" alt="${escapeHtml(a.title)}">`:''}<article class="prose">${markdown(a.body)}</article><nav class="article-nav"><a href="${base}articles/">← 回到文章列表</a><a href="${base}">首頁 ↗</a></nav></main><footer class="site-footer"><div class="container footer-main"><a class="brand" href="${base}"><img class="brand-mark" src="${base}assets/lemon.svg" alt=""><span>ecjojo</span></a><p class="copyright">© 2026 ecjojo</p></div></footer></body></html>`;await writeFile(path.join(dir,'index.html'),html);}
const urls=[`${base}`,`${base}projects/`,`${base}articles/`,...articles.map(a=>publicUrl(a.slug))];
await writeFile(path.join(root,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>https://ecjojo.github.io${u}</loc></url>`).join('')}</urlset>`);
await writeFile(path.join(root,'rss.xml'),`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ecjojo 文章</title><link>https://ecjojo.github.io${base}articles/</link><description>開發記錄與創作筆記</description>${articles.map(a=>`<item><title>${escapeHtml(a.title)}</title><link>https://ecjojo.github.io${publicUrl(a.slug)}</link><guid>https://ecjojo.github.io${publicUrl(a.slug)}</guid><pubDate>${new Date(`${a.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(a.excerpt||'')}</description></item>`).join('')}</channel></rss>`);
console.log(`Built ${articles.length} article(s), sitemap.xml and rss.xml (base ${base})`);
