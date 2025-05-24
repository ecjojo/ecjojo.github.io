function getRandomColor() {
  const colors = [
    //"#6bc1f7", // 淺藍
    //"#8cf76b", // 淺綠
    //"#f7d96b", // 淺黃
    //"#f78c6b", // 淺橘
    //"#00bfff", // 藍亮
    "#ffffff20", // 淡白（透明）
    "#999",
    "#666",


  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

const grid = document.getElementById('grid');
const cols = 60;
const rows = 80;

for (let i = 0; i < cols * rows; i++) {
  const block = document.createElement('div');
  block.classList.add('block');

  // 初始背景色透明
  block.style.backgroundColor = "transparent";

  // hover 時變色
  block.addEventListener('mouseenter', () => {
    block.style.backgroundColor = getRandomColor();
  });

  // 離開時恢復透明
block.addEventListener("mouseleave", () => {
  setTimeout(() => {
    block.style.backgroundColor = "transparent";
  }, 300); // 半秒後淡出
});



  grid.appendChild(block);
}
