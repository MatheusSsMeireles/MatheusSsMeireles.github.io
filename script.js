document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    // 1. Efeito de Sticky Header ao rolar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Remove apenas se não for uma página jurídica (que precisa do header fixo)
            if (!window.location.pathname.includes('privacy') && !window.location.pathname.includes('terms')) {
                header.classList.remove('scrolled');
            }
        }
    });

    // 2. Menu Mobile (Toggle)
    menuToggle.addEventListener('click', () => {
        const isVisible = navMenu.style.display === 'flex';
        
        if (!isVisible) {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '80px';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.backgroundColor = 'var(--secondary-slate)';
            navMenu.style.padding = '20px';
            navMenu.style.borderBottom = '2px solid var(--accent-cyan)';
        } else {
            navMenu.style.display = 'none';
        }
    });

    // 3. Smooth Scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // Fecha menu mobile ao clicar em um link
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                }
            }
        });
    });
});
