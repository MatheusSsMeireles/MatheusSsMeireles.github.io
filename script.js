document.addEventListener('DOMContentLoaded', () => {
    // --- 0. BLOQUEIO VISUAL BÁSICO DE DATA ---
    // Impede o usuário de clicar em dias no passado no calendário nativo
    const dateInput = document.getElementById('schedule-date');
    if (dateInput) {
        const hoje = new Date();
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        const ano = amanha.getFullYear();
        const mes = String(amanha.getMonth() + 1).padStart(2, '0');
        const dia = String(amanha.getDate()).padStart(2, '0');
        dateInput.min = `${ano}-${mes}-${dia}`;
    }

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
    
    // Formulário e Botões
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
    const showStep = (stepName) => {
        if(stepInput) stepInput.style.display = 'none';
        if(stepConfirm) stepConfirm.style.display = 'none';
        if(stepSuccess) stepSuccess.style.display = 'none';

        if (stepName === 'input' && stepInput) stepInput.style.display = 'block';
        if (stepName === 'confirm' && stepConfirm) stepConfirm.style.display = 'block';
        if (stepName === 'success' && stepSuccess) stepSuccess.style.display = 'block';
    };

    const openModal = () => {
        if(modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if(contactForm) contactForm.reset(); 
            showStep('input');
            
            if(btnConfirmSend) {
                btnConfirmSend.textContent = 'Confirmar Envio';
                btnConfirmSend.disabled = false;
            }
            if(btnEdit) btnEdit.disabled = false;
        }
    };

    const closeModal = () => {
        if(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    openModalBtns.forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    }));

    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(btnCloseFinal) btnCloseFinal.addEventListener('click', closeModal);
    
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // --- 4. FLUXO DE ENVIO E VALIDAÇÕES RIGOROSAS ---
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const date = document.getElementById('schedule-date').value;
            const time = document.getElementById('schedule-time').value;

            // VALIDAÇÕES DE DATA E HORA
            if (date || time) {
                // 1. Exige que ambos sejam preenchidos se um deles for preenchido
                if (!date || !time) {
                    alert("Por favor, preencha tanto a data quanto o horário para agendar a reunião.");
                    return; // Bloqueia o avanço
                }

                const selectedDateTime = new Date(`${date}T${time}`);
                const now = new Date();
                
                // 2. Validação de antecedência mínima de 24 horas
                const minValidTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                if (selectedDateTime < minValidTime) {
                    alert("A reunião deve ser agendada com pelo menos 24 horas de antecedência.");
                    return; // Bloqueia o avanço
                }

                // 3. Validação de Finais de Semana (Segunda a Sexta apenas)
                const dayOfWeek = selectedDateTime.getDay();
                if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 = Dom, 6 = Sáb
                    alert("Os agendamentos estão disponíveis apenas de segunda a sexta-feira.");
                    return; // Bloqueia o avanço
                }

                // 4. Validação de Horário Comercial (08:00 às 11:00 e 14:00 às 17:00)
                const hour = parseInt(time.split(':')[0], 10);
                const minutes = parseInt(time.split(':')[1], 10);
                const timeInMinutes = (hour * 60) + minutes;

                const morningStart = 8 * 60;   // 08:00
                const morningEnd = 11 * 60;    // 11:00
                const afternoonStart = 14 * 60; // 14:00
                const afternoonEnd = 17 * 60;   // 17:00

                const isMorning = timeInMinutes >= morningStart && timeInMinutes <= morningEnd;
                const isAfternoon = timeInMinutes >= afternoonStart && timeInMinutes <= afternoonEnd;

                if (!isMorning && !isAfternoon) {
                    alert("Por favor, escolha um horário válido:\nManhã: das 08:00 às 11:00\nTarde: das 14:00 às 17:00");
                    return; // Bloqueia o avanço
                }
            }

            // Se passou em todas as validações, prepara os dados para exibição
            let dateDisplay = 'Não selecionado';
            if (date) {
                const [year, month, day] = date.split('-');
                dateDisplay = `${day}/${month}/${year}`;
            }
            
            const nameDisplay = document.getElementById('review-name');
            if(nameDisplay) {
                nameDisplay.textContent = name;
                document.getElementById('review-email').textContent = email;
                document.getElementById('review-phone').textContent = phone;
                document.getElementById('review-message').textContent = message;
                document.getElementById('review-date').textContent = dateDisplay;
                document.getElementById('review-time').textContent = time || 'Não selecionado';
                
                showStep('confirm'); // Avança para a etapa de revisão
            } else {
                console.error("IDs de revisão não encontrados no HTML.");
            }
        });
    }

    if(btnEdit) {
        btnEdit.addEventListener('click', () => {
            showStep('input');
        });
    }

    if(btnConfirmSend) {
        btnConfirmSend.addEventListener('click', async () => {
            const originalText = btnConfirmSend.textContent;
            btnConfirmSend.textContent = 'Enviando...';
            btnConfirmSend.disabled = true;
            if(btnEdit) btnEdit.disabled = true;

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
                    showStep('success'); 
                } else {
                    throw new Error('Erro servidor');
                }
            } catch (error) {
                alert('Erro ao enviar. Tente novamente.');
                console.error(error);
                btnConfirmSend.textContent = originalText;
                btnConfirmSend.disabled = false;
                if(btnEdit) btnEdit.disabled = false;
            }
        });
    }
});
