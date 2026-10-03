(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-nav');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
      menu.classList.toggle('is-open', open);
    });
    menu.addEventListener('click', e => {
      if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); menu.classList.remove('is-open'); }
    });
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('is-visible'));
  else {
    document.body.classList.add('has-motion');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.14, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach((el, i) => { el.style.setProperty('--reveal-delay', `${(i % 4) * 85}ms`); observer.observe(el); });
  }

  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.setProperty('--tilt-x', `${-y * 4}deg`);
        card.style.setProperty('--tilt-y', `${x * 5}deg`);
        card.style.setProperty('--shine-x', `${(x + .5) * 100}%`);
      });
      card.addEventListener('pointerleave', () => { card.style.setProperty('--tilt-x', '0deg'); card.style.setProperty('--tilt-y', '0deg'); });
    });
  }

  const root = document.querySelector('#project-list');
  if (root) fetch('../data/projects.json').then(r => r.json()).then(projects => {
    const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const renderCards = list => list.map(p => {
      const content = `<span class="project-image tilt-card"><img src="../${esc(p.image)}" alt="${esc(p.title)} 作品圖片" loading="lazy">${p.url ? '<span class="art-arrow">↗</span>' : ''}</span><span class="project-info"><span><span class="project-kind">${esc(p.kind || '')}</span><strong>${esc(p.title)}</strong>${p.description ? `<span>${esc(p.description)}</span>` : ''}</span></span>`;
      return p.url ? `<a class="project-card reveal" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${content}</a>` : `<article class="project-card reveal">${content}</article>`;
    }).join('');
    const years = [...new Set(projects.map(p => p.year).filter(Boolean))].sort((a,b) => b-a);
    root.innerHTML = years.length
      ? `${years.map(year => `<section class="year-group reveal"><h2>${esc(year)}</h2><div class="project-grid">${renderCards(projects.filter(p => String(p.year) === String(year)))}</div></section>`).join('')}${projects.some(p => !p.year) ? `<section class="year-group reveal"><div class="project-grid">${renderCards(projects.filter(p => !p.year))}</div></section>` : ''}`
      : renderCards(projects);
    const masonryGrids = years.length ? [...root.querySelectorAll('.project-grid')] : [root];
    masonryGrids.forEach(grid => grid.classList.add('is-masonry'));
    const packMasonry = grid => {
      const cards = [...grid.children].filter(el => el.classList.contains('project-card'));
      if (!cards.length) return;
      const style = getComputedStyle(grid);
      const maxColumns = Number.parseInt(style.getPropertyValue('--masonry-columns'), 10) || 3;
      const columns = Math.min(maxColumns, cards.length);
      const gap = Number.parseFloat(style.getPropertyValue('--masonry-gap')) || 0;
      const columnWidth = (grid.clientWidth - gap * (columns - 1)) / columns;
      const heights = Array(columns).fill(0);
      cards.forEach(card => {
        const column = heights.indexOf(Math.min(...heights));
        card.style.width = `${columnWidth}px`;
        card.style.left = `${column * (columnWidth + gap)}px`;
        card.style.top = `${heights[column]}px`;
        heights[column] += card.offsetHeight;
      });
      grid.style.height = `${Math.max(...heights)}px`;
    };
    let layoutFrame = 0;
    const scheduleMasonry = () => {
      if (layoutFrame) return;
      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        masonryGrids.forEach(packMasonry);
      });
    };
    const observedWidths = new WeakMap();
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(entries => entries.forEach(entry => {
        const width = Math.round(entry.contentRect.width);
        if (observedWidths.get(entry.target) !== width) {
          observedWidths.set(entry.target, width);
          scheduleMasonry();
        }
      }));
      masonryGrids.forEach(grid => resizeObserver.observe(grid));
    }
    window.addEventListener('resize', scheduleMasonry, { passive: true });
    root.querySelectorAll('.project-image img').forEach(img => {
      if (!img.complete) {
        img.addEventListener('load', scheduleMasonry, { once: true });
        img.addEventListener('error', scheduleMasonry, { once: true });
      }
    });
    if (document.fonts?.ready) document.fonts.ready.then(scheduleMasonry);
    scheduleMasonry();
    root.querySelectorAll('.reveal').forEach(el => { if (!reduced && 'IntersectionObserver' in window) new IntersectionObserver((entries,obs) => entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('is-visible');obs.disconnect();} }),{threshold:.1}).observe(el); else el.classList.add('is-visible'); });
  }).catch(() => { root.innerHTML = '<p class="empty-state">作品暫時無法載入。</p>'; });
})();
