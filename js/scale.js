let scale = 1; // 初始倍率
const bigGrid = 144;
const smallGrid = 16;

window.addEventListener("wheel", (e) => {
  e.preventDefault();

  scale += e.deltaY * -0.001;
  scale = Math.min(Math.max(0.5, scale), 3); // 限制 0.5 ~ 3 倍

  document.body.style.backgroundSize = 
    `${bigGrid * scale}px ${bigGrid * scale}px,
     ${bigGrid * scale}px ${bigGrid * scale}px,
     ${smallGrid * scale}px ${smallGrid * scale}px,
     ${smallGrid * scale}px ${smallGrid * scale}px`;
}, { passive: false });