document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Modal & Steps
    const modal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const btnCloseFinal = document.getElementById('btn-close-final');
    
    const stepInput = document.getElementById('step-input');
    const stepConfirm = document.getElementById('step-confirm');
    const stepSuccess = document.getElementById('step-success');
    
    // Form & Buttons
    const contactForm = document.getElementById('contact-form');
    const btnEdit = document.getElementById('btn-edit');
    const btnConfirmSend = document.getElementById('btn-confirm-send');

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
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });

    // --- 3. LÓGICA DO MODAL (STEP BY STEP) ---

    // Função Robusta para trocar de tela
    const showStep = (stepName) => {
        // Esconde TODOS primeiro via JS direto
        stepInput.style.display = 'none';
        stepConfirm.style.display = 'none';
        stepSuccess.style.display = 'none';

        // Mostra apenas o solicitado
        if (stepName === 'input') stepInput.style.display = 'block';
        if (stepName === 'confirm') stepConfirm.style.display = 'block';
        if (stepName === 'success') stepSuccess.style.display = 'block';
    };

    const openModal = () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        contactForm.reset(); // Limpa form anterior
        showStep('input');   // Garante que comece no passo 1
    };

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    openModalBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    }));

    closeModalBtn.addEventListener('click', closeModal);
    btnCloseFinal.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- 4. FLUXO DE ENVIO ---

    // Passo 1 -> Passo 2 (Revisão)
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Coleta dados
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const date = document.getElementById('schedule-date').value;
        const time = document.getElementById('schedule-time').value;

        let dateDisplay = 'Não selecionado';
        if (date) {
            const [year, month, day] = date.split('-');
            dateDisplay = `${day}/${month}/${year}`;
        }
        
        // Preenche Revisão
        document.getElementById('review-name').textContent = name;
        document.getElementById('review-email').textContent = email;
        document.getElementById('review-phone').textContent = phone;
        document.getElementById('review-message').textContent = message;
        document.getElementById('review-date').textContent = dateDisplay;
        document.getElementById('review-time').textContent = time || 'Não selecionado';

        showStep('confirm');
    });

    // Voltar para Editar
    btnEdit.addEventListener('click', () => {
        showStep('input');
    });

    // Passo 2 -> Passo 3 (Envio Real)
    btnConfirmSend.addEventListener('click', async () => {
        const originalText = btnConfirmSend.textContent;
        btnConfirmSend.textContent = 'Enviando...';
        btnConfirmSend.disabled = true;
        btnEdit.disabled = true;

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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showStep('success'); // Sucesso
            } else {
                throw new Error('Erro servidor');
            }
        } catch (error) {
            alert('Erro ao enviar. Tente novamente.');
            console.error(error);
        } finally {
            // Reseta botões caso o usuário feche e abra de novo ou dê erro
            btnConfirmSend.textContent = originalText;
            btnConfirmSend.disabled = false;
            btnEdit.disabled = false;
        }
    });
});
