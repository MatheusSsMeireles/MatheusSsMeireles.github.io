document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const modal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    // --- 1. EFEITO SCROLL NO HEADER ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 2. MENU MOBILE ---
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });

    // Fechar menu ao clicar em link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });

    // --- 3. LÓGICA DO MODAL ---
    openModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Bloqueia scroll do fundo
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Libera scroll
        formStatus.textContent = ''; // Limpa mensagens anteriores
    };

    closeModalBtn.addEventListener('click', closeModal);

    // Fecha ao clicar fora do modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- 4. ENVIO DO FORMULÁRIO (WEBHOOK) ---
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Feedback visual de carregamento
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        formStatus.textContent = '';
        formStatus.style.color = 'var(--text-muted)';

        // Coleta de Dados
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            description: document.getElementById('message').value,
            schedule_date: document.getElementById('schedule-date').value || 'Não informado',
            schedule_time: document.getElementById('schedule-time').value || 'Não informado',
            timestamp: new Date().toISOString()
        };

        const webhookUrl = 'https://webnflow.lexsec.shop/webhook/site';

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                formStatus.textContent = 'Recebemos sua solicitação! Entraremos em contato em breve.';
                formStatus.style.color = '#64FFDA'; // Verde Ciano
                contactForm.reset();
                setTimeout(() => {
                    closeModal();
                    submitBtn.textContent = originalBtnText;
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                throw new Error('Erro no servidor');
            }
        } catch (error) {
            console.error('Erro:', error);
            formStatus.textContent = 'Houve um erro ao enviar. Por favor, tente novamente ou contate-nos por telefone.';
            formStatus.style.color = '#ff6b6b'; // Vermelho erro
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
});
