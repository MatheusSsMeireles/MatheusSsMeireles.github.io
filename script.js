document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LÓGICA DO CALENDÁRIO COM FLATPICKR ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');
    let fpInstance = null;

    if (dateInput && timeSelect && typeof flatpickr !== 'undefined') {
        const now = new Date();
        // A data mínima é EXATAMENTE 24 horas a partir do momento atual
        const minValidDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Se daqui a 24h cair no Fim de Semana, empurra a data mínima para Segunda
        if (minValidDateTime.getDay() === 6) { // Sábado
            minValidDateTime.setDate(minValidDateTime.getDate() + 2);
        } else if (minValidDateTime.getDay() === 0) { // Domingo
            minValidDateTime.setDate(minValidDateTime.getDate() + 1);
        }

        // Formatação YYYY-MM-DD segura para o flatpickr não confundir fusos
        const formatStringDate = (dateObj) => {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const updateTimeOptions = (selectedDate) => {
            if (!selectedDate) {
                timeSelect.options[0].text = "Escolha a data primeiro";
                return;
            }

            timeSelect.options[0].text = "Selecione o horário";

            // Recalcula o tempo agora caso o usuário tenha deixado a tela aberta muito tempo
            const currentBoundary = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            
            Array.from(timeSelect.options).forEach(option => {
                if (!option.value) return; 

                const optionHour = parseInt(option.value.split(':')[0], 10);
                
                // Verifica se a data selecionada é exatamente o dia limite de 24h
                const isSameBoundaryDay = selectedDate.getDate() === currentBoundary.getDate() &&
                                          selectedDate.getMonth() === currentBoundary.getMonth() &&
                                          selectedDate.getFullYear() === currentBoundary.getFullYear();

                if (isSameBoundaryDay) {
                    // Bloqueia horas que não cumprem o prazo de 24h
                    if (optionHour <= currentBoundary.getHours()) {
                        option.disabled = true;
                        option.text = `${option.value} (Requer 24h)`;
                    } else {
                        option.disabled = false;
                        option.text = option.value;
                    }
                } else {
                    // Qualquer dia posterior é 100% liberado
                    option.disabled = false;
                    option.text = option.value;
                }
            });

            if (timeSelect.options[timeSelect.selectedIndex]?.disabled) {
                timeSelect.value = '';
            }
        };

        // Instancia o calendário profissional
        fpInstance = flatpickr(dateInput, {
            locale: "pt", 
            dateFormat: "Y-m-d", 
            altInput: true,
            altFormat: "d/m/Y", 
            minDate: formatStringDate(minValidDateTime), // Fica tudo cinza antes dessa data
            disable: [
                function(date) {
                    // Desabilita fisicamente Sábados (6) e Domingos (0)
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            onChange: function(selectedDates, dateStr, instance) {
                updateTimeOptions(selectedDates[0]);
            }
        });
    } else {
        console.error("Flatpickr não foi carregado. Verifique os links no index.html.");
    }

    // --- 2. ELEMENTOS E EVENTOS DE LAYOUT ---
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

    // --- 3. CONTROLE DE MODAL E TRANSIÇÃO ---
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

    // --- 4. FLUXO DE REVISÃO E ENVIO ---
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const date = document.getElementById('schedule-date').value; 
            const time = document.getElementById('schedule-time').value;

            // Bloqueio final de segurança
            if ((date && !time) || (!date && time)) {
                alert("Para agendar, preencha a Data e o Horário.");
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
