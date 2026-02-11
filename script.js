document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS GERAIS ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    // --- ELEMENTOS DO MODAL ---
    const modal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const btnCloseFinal = document.getElementById('btn-close-final'); // Botão fechar na tela de sucesso
    
    // Etapas (Steps)
    const stepInput = document.getElementById('step-input');
    const stepConfirm = document.getElementById('step-confirm');
    const stepSuccess = document.getElementById('step-success');
    
    // Formulário e Botões de Ação
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

    // --- 3. LÓGICA DO MODAL (ABRIR/FECHAR) ---
    
    // Função para resetar o modal ao estado inicial
    const resetModal = () => {
        contactForm.reset();
        showStep('input');
        // Limpa validações visuais nativas se houver
    };

    const openModal = () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetModal();
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
    btnCloseFinal.addEventListener('click', closeModal); // Fecha ao clicar no botão final

    // Fecha ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // --- 4. NAVEGAÇÃO ENTRE ETAPAS ---

    // Função auxiliar para trocar de tela
    const showStep = (stepName) => {
        stepInput.classList.add('step-hidden');
        stepConfirm.classList.add('step-hidden');
        stepSuccess.classList.add('step-hidden');

        if (stepName === 'input') stepInput.classList.remove('step-hidden');
        if (stepName === 'confirm') stepConfirm.classList.remove('step-hidden');
        if (stepName === 'success') stepSuccess.classList.remove('step-hidden');
    };

    // Ação 1: Usuário clica em "Revisar e Enviar" (Submit do Form)
    // Isso valida os campos HTML5 (required) e troca para tela de confirmação
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede recarregamento e envio imediato

        // Coleta dados para exibir na revisão
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const date = document.getElementById('schedule-date').value;
        const time = document.getElementById('schedule-time').value;

        // Formata data para PT-BR (se preenchida)
        let dateDisplay = 'Não selecionado';
        if (date) {
            const [year, month, day] = date.split('-');
            dateDisplay = `${day}/${month}/${year}`;
        }
        
        // Preenche o quadro de revisão
        document.getElementById('review-name').textContent = name;
        document.getElementById('review-email').textContent = email;
        document.getElementById('review-phone').textContent = phone;
        document.getElementById('review-message').textContent = message;
        document.getElementById('review-date').textContent = dateDisplay;
        document.getElementById('review-time').textContent = time || 'Não selecionado';

        // Troca para tela de confirmação
        showStep('confirm');
    });

    // Ação 2: Usuário clica em "Editar"
    btnEdit.addEventListener('click', () => {
        showStep('input'); // Volta para o form com os dados mantidos
    });

    // Ação 3: Usuário clica em "Confirmar Envio" (Envio Real para Webhook)
    btnConfirmSend.addEventListener('click', async () => {
        
        // Feedback Visual (Loading)
        const originalBtnText = btnConfirmSend.textContent;
        btnConfirmSend.textContent = 'Enviando...';
        btnConfirmSend.disabled = true;
        btnEdit.disabled = true;

        // Prepara Payload
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
                // Sucesso: Vai para tela final
                showStep('success');
            } else {
                throw new Error('Erro no servidor');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Houve um erro ao enviar. Por favor, tente novamente ou entre em contato pelo telefone.');
            // Em caso de erro, volta para a tela de revisão para tentar de novo
            btnConfirmSend.textContent = originalBtnText;
            btnConfirmSend.disabled = false;
            btnEdit.disabled = false;
        }
    });
});
