// 頁面加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 導航按鈕切換功能
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按鈕的active類別
            navButtons.forEach(btn => btn.classList.remove('active'));
            
            // 隱藏所有區塊
            sections.forEach(section => section.classList.remove('active'));
            
            // 啟用當前按鈕
            this.classList.add('active');
            
            // 顯示對應區塊
            const targetId = this.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            // 滾動到頁面頂部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    // 卡片懸停效果
    const cards = document.querySelectorAll('.card, .project-card, .social-card, .ai-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 進度條動畫
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-in-out';
            bar.style.width = width;
        }, 300);
    });
    
    // 聯繫按鈕點擊效果
    const contactButtons = document.querySelectorAll('.btn-outline, .btn-link');
    contactButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            }
        });
    });
    
    // 技能標籤點擊效果
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    // 頁面滾動效果
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.style.transform = 'translateY(0)';
            header.style.boxShadow = 'none';
        } else if (currentScroll > lastScroll) {
            // 向下滾動
            header.style.transform = 'translateY(-100%)';
        } else {
            // 向上滾動
            header.style.transform = 'translateY(0)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        
        lastScroll = currentScroll;
    });
    
    // 初始化
    console.log('ecjojo個人網站已加載完成！');
    
    // 添加點擊任何地方關閉可能的下拉選單（如果未來有）
    document.addEventListener('click', function(e) {
        // 可以在這裡添加更多互動邏輯
    });
});