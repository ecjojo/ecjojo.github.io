document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('.canvas');
  const nodes = Array.from(document.querySelectorAll('.bubble'));
  if (!canvas || nodes.length === 0) return;

  // 指標狀態
  const pointer = { active:false, x:0, y:0 };
  canvas.addEventListener('pointerenter', e => { pointer.active = true; });
  canvas.addEventListener('pointerleave', e => { pointer.active = false; });
  canvas.addEventListener('pointermove', e => {
    const c = canvas.getBoundingClientRect();
    pointer.x = e.clientX - c.left;
    pointer.y = e.clientY - c.top;
  }, { passive:true });

  // 初始化泡泡
  const bubbles = nodes.map(el => {
    const rect = el.getBoundingClientRect();
    const crect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const r = Math.min(w, h) / 2;

    if (!el.style.left) el.style.left = (rect.left - crect.left) + 'px';
    if (!el.style.top)  el.style.top  = (rect.top  - crect.top)  + 'px';

    return {
      el,
      r,
      x: parseFloat(el.style.left) + r,
      y: parseFloat(el.style.top)  + r,
      vx: 0,
      vy: 0,
      dragging: false,
      pointerId: null,
      lastPX: 0,
      lastPY: 0,
      moved: false,
      startX: 0,
      startY: 0,
      isEvade: el.classList.contains('evade')
    };
  });

  // 初始化固定點 (point)
  const points = Array.from(document.querySelectorAll('.point')).map(el => {
    const rect = el.getBoundingClientRect();
    const crect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const r = Math.min(w, h) / 2;
    return {
      el,
      r,
      x: (rect.left - crect.left) + w/2,
      y: (rect.top  - crect.top)  + h/2
    };
  });

  const cfg = {
    dt: 1 / 60,
    fric: 0.98,
    wallRest: 0.8,
    ballRest: 0.9,
    pad: 0,
    // 懼怕參數
    evadeRadius: 30,
    evadeForce: 0.7,
    evadeKick: 2,
    evadeNoClickMS: 260
  };

  // 拖曳與懼怕邏輯（略，與原版相同）
  const DRAG_TOL = 5;
  bubbles.forEach(b => {
    const el = b.el;
    el.style.zIndex = '1';

    if (b.isEvade){
      el.addEventListener('pointerover', e => {
        const kick = cfg.evadeKick;
        const c = canvas.getBoundingClientRect();
        const dirx = Math.sign(b.x - (e.clientX - c.left)) || (Math.random() < .5 ? -1 : 1);
        const diry = Math.sign(b.y - (e.clientY - c.top))  || (Math.random() < .5 ? -1 : 1);
        b.vx += dirx * kick; b.vy += diry * kick;
        el.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); }, { capture:true, once:true });
      });
      el.addEventListener('dragstart', e => e.preventDefault());
      return;
    }

    el.addEventListener('pointerdown', e => {
      b.dragging = true;
      b.pointerId = e.pointerId;
      b.startX = e.clientX;
      b.startY = e.clientY;
      b.lastPX = e.clientX;
      b.lastPY = e.clientY;
      b.moved = false;
      el.setPointerCapture(e.pointerId);
      el.classList.add('dragging');
      e.preventDefault();
    });

    el.addEventListener('pointermove', e => {
      if (!b.dragging || e.pointerId !== b.pointerId) return;
      const dx = e.clientX - b.lastPX;
      const dy = e.clientY - b.lastPY;
      b.lastPX = e.clientX;
      b.lastPY = e.clientY;

      const totalDX = e.clientX - b.startX;
      const totalDY = e.clientY - b.startY;
      if (!b.moved && (Math.abs(totalDX) > DRAG_TOL || Math.abs(totalDY) > DRAG_TOL)) b.moved = true;

      const c = canvas.getBoundingClientRect();
      b.x = clamp(b.x + dx, b.r + cfg.pad, c.width  - b.r - cfg.pad);
      b.y = clamp(b.y + dy, b.r + cfg.pad, c.height - b.r - cfg.pad);

      b.vx = dx; b.vy = dy;
      e.preventDefault();
    });

    function endDrag(e){
      if (!b.dragging || (e && e.pointerId !== b.pointerId)) return;
      if (b.moved){
        el.addEventListener('click', ev => { ev.preventDefault(); ev.stopPropagation(); }, { capture:true, once:true });
      }
      b.dragging = false;
      b.pointerId = null;
      b.moved = false;
      el.classList.remove('dragging');
      try { el.releasePointerCapture(e.pointerId); } catch(_) {}
    }

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('dragstart', e => e.preventDefault());
  });

  function clamp(v, min, max){ return v < min ? min : v > max ? max : v; }

  function loop(){
    stepPhysics();
    render();
    requestAnimationFrame(loop);
  }

  function stepPhysics(){
    const c = canvas.getBoundingClientRect();

    for (const b of bubbles){
      if (!b.dragging){
        b.vx *= cfg.fric; b.vy *= cfg.fric;
        b.x += b.vx; b.y += b.vy;
      }

      // 懼怕規則
      if (b.isEvade && pointer.active){
        const nx = b.x - pointer.x;
        const ny = b.y - pointer.y;
        const d2 = nx*nx + ny*ny;
        if (d2 > 0){
          const d = Math.sqrt(d2);
          if (d < cfg.evadeRadius){
            const ux = nx / d; const uy = ny / d;
            const strength = (1 - d / cfg.evadeRadius) * cfg.evadeForce;
            b.vx += ux * strength * 3;
            b.vy += uy * strength * 3;

            if (d < b.r + 8){
              const kick = cfg.evadeKick * 1.5;
              b.x = clamp(b.x + ux * kick, b.r + cfg.pad, c.width  - b.r - cfg.pad);
              b.y = clamp(b.y + uy * kick, b.r + cfg.pad, c.height - b.r - cfg.pad);
            }
          }
        }
      }

      // 撞牆
      if (b.x - b.r < cfg.pad){ b.x = b.r + cfg.pad; b.vx = Math.abs(b.vx) * cfg.wallRest; }
      if (b.x + b.r > c.width - cfg.pad){ b.x = c.width - b.r - cfg.pad; b.vx = -Math.abs(b.vx) * cfg.wallRest; }
      if (b.y - b.r < cfg.pad){ b.y = b.r + cfg.pad; b.vy = Math.abs(b.vy) * cfg.wallRest; }
      if (b.y + b.r > c.height - cfg.pad){ b.y = c.height - b.r - cfg.pad; b.vy = -Math.abs(b.vy) * cfg.wallRest; }
    }

    // 泡泡互撞
    for (let i = 0; i < bubbles.length; i++){
      for (let j = i + 1; j < bubbles.length; j++){
        const a = bubbles[i], b = bubbles[j];
        const nx = b.x - a.x; const ny = b.y - a.y;
        const dist2 = nx*nx + ny*ny; const minD = a.r + b.r;
        if (dist2 > 0){
          const dist = Math.sqrt(dist2);
          if (dist < minD){
            const ux = nx / dist; const uy = ny / dist;
            const pen = minD - dist; const k = pen / 2;
            if (!a.dragging){ a.x -= ux * k; a.y -= uy * k; }
            if (!b.dragging){ b.x += ux * k; b.y += uy * k; }

            const avn = a.vx*ux + a.vy*uy; const bvn = b.vx*ux + b.vy*uy;
            const avn2 = bvn * cfg.ballRest; const bvn2 = avn * cfg.ballRest;
            const atx = a.vx - avn*ux; const aty = a.vy - avn*uy;
            const btx = b.vx - bvn*ux; const bty = b.vy - bvn*uy;
            if (!a.dragging){ a.vx = atx + avn2*ux; a.vy = aty + avn2*uy; }
            if (!b.dragging){ b.vx = btx + bvn2*ux; b.vy = bty + bvn2*uy; }
          }
        }
      }
    }

    // 泡泡 vs 固定 point 撞擊
    for (const b of bubbles){
      for (const p of points){
        const nx = b.x - p.x;
        const ny = b.y - p.y;
        const dist2 = nx*nx + ny*ny;
        const minD = b.r + p.r;
        if (dist2 > 0){
          const dist = Math.sqrt(dist2);
          if (dist < minD){
            const ux = nx / dist;
            const uy = ny / dist;
            const pen = minD - dist;
            b.x += ux * pen;
            b.y += uy * pen;

            const vn = b.vx*ux + b.vy*uy;
            const tx = b.vx - vn*ux;
            const ty = b.vy - vn*uy;
            b.vx = tx - vn*ux * cfg.ballRest;
            b.vy = ty - vn*uy * cfg.ballRest;
          }
        }
      }
    }
  }

  function render(){
    for (const b of bubbles){
      b.el.style.left = (b.x - b.r) + 'px';
      b.el.style.top  = (b.y - b.r) + 'px';
    }
  }

  placeNonOverlapping();
  function placeNonOverlapping(){
    const c = canvas.getBoundingClientRect();
    const placed = [];
    for (const b of bubbles){
      let tries = 0; let ok = false;
      while (!ok && tries < 500){
        const x = Math.random() * (c.width - 2*b.r - 2*cfg.pad) + b.r + cfg.pad;
        const y = Math.random() * (c.height - 2*b.r - 2*cfg.pad) + b.r + cfg.pad;
        ok = placed.every(p => {
          const dx = p.x - x; const dy = p.y - y;
          return Math.sqrt(dx*dx + dy*dy) >= p.r + b.r + 12;
        });
        if (ok){ b.x = x; b.y = y; placed.push({x, y, r:b.r}); b.vx = 0; b.vy = 0; }
        tries++;
      }
    }
    render();
  }

  requestAnimationFrame(loop);
});
