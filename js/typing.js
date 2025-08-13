document.addEventListener('DOMContentLoaded', () => {
  const text = "";
  const el = document.getElementById("cta-text");
  const bubble = document.getElementById("bubble");
  let i = 0, typing = false, t;

  bubble.addEventListener("mouseenter", () => {
    clearTimeout(t);
    el.textContent = "";
    i = 0;
    typing = true;
    bubble.classList.add("show-text");
    type();
  });

  bubble.addEventListener("mouseleave", () => {
    clearTimeout(t);
    typing = false;
    el.textContent = "";
    bubble.classList.remove("show-text");
  });

  function type() {
    if (typing && i < text.length) {
      el.textContent += text.charAt(i++);
      t = setTimeout(type, 60);
    }
  }
});

document.querySelectorAll('.bubble').forEach(bub => {
  const textBox = bub.querySelector('.bubble_typebox span');
  const text = "Contact me on X";
  let i = 0;
  let typing = false;
  let typingTimeout;

  bub.addEventListener("mouseenter", () => {
    clearTimeout(typingTimeout);
    textBox.textContent = "";
    i = 0;
    typing = true;
    type();
  });

  bub.addEventListener("mouseleave", () => {
    clearTimeout(typingTimeout);
    typing = false;
    textBox.textContent = "";
  });

  function type() {
    if (typing && i < text.length) {
      textBox.textContent += text.charAt(i++);
      typingTimeout = setTimeout(type, 70);
    }
  }
});
