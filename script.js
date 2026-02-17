document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DE CALENDÁRIO COM FLATPICKR (24H + FINAIS DE SEMANA) ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');
    let fpInstance = null;

    if (dateInput && timeSelect) {
        const now = new Date();
        // A data mínima permitida é EXATAMENTE 24 horas a partir de agora
        const minValidDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Função para atualizar as horas baseadas na data escolhida
        const updateTimeOptions = (selectedDate) => {
            if (!selectedDate) {
                timeSelect.options[0].text = "Escolha a data primeiro";
                return;
            }

            timeSelect.options[0].text = "Selecione o horário";

            Array.from(timeSelect.options).forEach(option => {
                if (!option.value) return; // ignora a primeira opção (placeholder)

                const optionHour = parseInt(option.value.split(':')[0], 10);

                // Verifica se a data escolhida no calendário é a mesma data do limite de 24h
                const isSameDay = selectedDate.getDate() === minValidDateTime.getDate() &&
                                  selectedDate.getMonth() === minValidDateTime.getMonth() &&
                                  selectedDate.getFullYear() === minValidDateTime.getFullYear();

                if (isSameDay) {
                    // Se for o mesmo dia limite, bloqueia horas passadas ou que não cumprem 24h
                    if (optionHour <= minValidDateTime.getHours()) {
                        option.disabled = true;
                        option.text = `${option.value} (Requer 24h)`;
                    } else {
                        option.disabled = false;
                        option.text = option.value;
                    }
                } else {
                    // Se for qualquer dia futuro além da data limite, libera tudo
                    option.disabled = false;
                    option.text = option.value;
                }
            });

            // Se o horário que estava selecionado ficou desabilitado, limpa o campo
            if (timeSelect.options[timeSelect.selectedIndex]?.disabled) {
                timeSelect.value = '';
            }
        };

        // Inicializando o calendário profissional
        fpInstance = flatpickr(dateInput, {
            locale: "pt", // Idioma Português BR
            dateFormat: "Y-m-d", // Formato interno
            altInput: true,
            altFormat: "d/m/Y", // Formato que o usuário vê (Ex: 18/02/2026)
            minDate: minValidDateTime, // Bloqueia tudo antes de 24h (fica cinza inclicável)
            disable: [
                function(date) {
                    // Retorna true para desabilitar Sábados (6) e Domingos (0)
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            onChange: function(selectedDates, dateStr, instance) {
                updateTimeOptions(selectedDates[0]);
            }
        });
    }

    // --- 2. ELEMENTOS DO LAYOUT E MODAL ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    const modal = document.getElementById('contact-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const btnCloseFinal = document.getElementById('btn-close-final');
    
    const stepInput = document.getElementById('step-input');
    const stepConfirm = document.getElementById('step-confirm');
    const stepSuccess = document.getElementById('step-success');
    
    const contactForm = document.getElementById('contact-form');
    const btnEdit = document.getElementById('btn-edit');
    const btnConfirmSend = document.getElementById('btn-confirm-send');

    // --- 3. SCROLL E MENU MOBILE ---
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

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

    // --- 4. CONTROLE DO MODAL ---
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
            
            // Reseta o calendário visual e o select
            if(fpInstance) fpInstance.clear();
            if(timeSelect) timeSelect.options[0].text = "Escolha a data primeiro";

            showStep('input');
            
            if(btnConfirmSend) {
                btnConfirmSend.textContent = 'Confirmar';
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

    // --- 5. FLUXO DE ENVIO: FORMULÁRIO -> REVISÃO ---
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            // Flatpickr armazena o valor real no input original (escondido)
            const date = document.getElementById('schedule-date').value; 
            const time = document.getElementById('schedule-time').value;

            // Trava final: impede de avançar se preencheu só um dos dois
            if ((date && !time) || (!date && time)) {
                alert("Para agendar, por favor preencha TANTO a Data quanto o Horário.");
                return;
            }

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
                
                showStep('confirm'); 
            } else {
                console.error("IDs de revisão não encontrados.");
            }
        });
    }

    if(btnEdit) {
        btnEdit.addEventListener('click', () => {
            showStep('input');
        });
    }

    // --- 6. ENVIO FINAL PARA WEBHOOK ---
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
