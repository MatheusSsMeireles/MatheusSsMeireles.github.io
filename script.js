document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    // 1. Efeito de Scroll no Header
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            // Mantém fixo se não for a página index
            if (window.location.pathname.includes('index') || window.location.pathname === '/') {
                header.classList.remove('scrolled');
            }
        }
    });

    // 2. Menu Mobile Responsivo
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animação simples do ícone (opcional)
        const spans = menuToggle.querySelectorAll('span');
        menuToggle.classList.toggle('open');
        if(menuToggle.classList.contains('open')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // 3. Fechar menu ao clicar em links (Mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('open');
            // Reseta ícone hambúrguer
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
});
