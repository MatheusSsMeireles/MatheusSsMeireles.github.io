document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // Modal
    const modal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const btnCloseFinal = document.getElementById('btn-close-final');
    
    // Etapas (Divs)
    const stepInput = document.getElementById('step-input');
    const stepConfirm = document.getElementById('step-confirm');
    const stepSuccess = document.getElementById('step-success');
    
    // Formulário e Botões
    const contactForm = document.getElementById('contact-form');
    const btnEdit = document.getElementById('btn-edit');
    const btnConfirmSend = document.getElementById('btn-confirm-send');

    // --- SCROLL HEADER ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // --- MENU MOBILE ---
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

    // --- FUNÇÕES DE MODAL ---
    
    // Função para mostrar apenas a etapa desejada
    const showStep = (stepName) => {
        // Esconde tudo primeiro
        stepInput.style.display = 'none';
        stepConfirm.style.display = 'none';
        stepSuccess.style.display = 'none';

        // Mostra a específica
        if (stepName === 'input') stepInput.style.display = 'block';
        if (stepName === 'confirm') stepConfirm.style.display = 'block';
        if (stepName === 'success') stepSuccess.style.display = 'block';
    };

    const openModal = () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        contactForm.reset(); 
        showStep('input'); // Sempre começa no input limpo
        
        // Reseta o botão de confirmar caso tenha ficado como "Enviando..."
        btnConfirmSend.textContent = 'Confirmar';
        btnConfirmSend.disabled = false;
        btnEdit.disabled = false;
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

    // --- FLUXO DE ETAPAS ---

    // 1. DO INPUT PARA REVISÃO (Sem enviar nada)
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede recarregamento

        // Pega os valores
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const date = document.getElementById('schedule-date').value;
        const time = document.getElementById('schedule-time').value;

        // Formata Data
        let dateDisplay = 'Não selecionado';
        if (date) {
            const [year, month, day] = date.split('-');
            dateDisplay = `${day}/${month}/${year}`;
        }
        
        // Preenche a tela de revisão
        document.getElementById('review-name').textContent = name;
        document.getElementById('review-email').textContent = email;
        document.getElementById('review-phone').textContent = phone;
        document.getElementById('review-message').textContent = message;
        document.getElementById('review-date').textContent = dateDisplay;
        document.getElementById('review-time').textContent = time || 'Não selecionado';

        // MUDA DE TELA INSTANTANEAMENTE
        showStep('confirm');
    });

    // 2. DA REVISÃO VOLTA PARA O INPUT (Editar)
    btnEdit.addEventListener('click', () => {
        showStep('input');
    });

    // 3. CONFIRMAR ENVIO (Aqui sim envia para o Webhook)
    btnConfirmSend.addEventListener('click', async () => {
        
        // Muda estado do botão apenas agora
        const originalText = btnConfirmSend.textContent;
        btnConfirmSend.textContent = 'Enviando...';
        btnConfirmSend.disabled = true;
        btnEdit.disabled = true; // Trava o editar também

        // Prepara dados
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
                showStep('success'); // Sucesso!
            } else {
                throw new Error('Erro no servidor');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao conectar. Tente novamente.');
            
            // Se der erro, volta o botão ao normal para tentar de novo
            btnConfirmSend.textContent = originalText;
            btnConfirmSend.disabled = false;
            btnEdit.disabled = false;
        }
    });
});
