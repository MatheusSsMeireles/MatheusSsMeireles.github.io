document.addEventListener('DOMContentLoaded', () => {
    
    // --- LÓGICA DE CALENDÁRIO E HORÁRIOS (24H RIGOROSO) ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');

    if (dateInput && timeSelect) {
        // 1. Configurar Data Mínima Visível
        const now = new Date();
        const minValidDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Exatas 24h

        // Se daqui 24h for Fim de Semana, empurra a data mínima inicial para Segunda-feira
        if (minValidDate.getDay() === 6) { // Sábado
            minValidDate.setDate(minValidDate.getDate() + 2);
        } else if (minValidDate.getDay() === 0) { // Domingo
            minValidDate.setDate(minValidDate.getDate() + 1);
        }

        const formatStringDate = (dateObj) => {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        // Aplica o bloqueio visual (cinza) para datas passadas/anteriores a 24h
        dateInput.min = formatStringDate(minValidDate);

        // 2. Evento ao escolher a data (Atualiza as horas disponíveis)
        dateInput.addEventListener('change', (e) => {
            if (!e.target.value) return;

            const selectedDateStr = e.target.value;
            const [year, month, day] = selectedDateStr.split('-');
            const selectedDate = new Date(year, month - 1, day);
            const dayOfWeek = selectedDate.getDay();

            // Proteção contra cliques em finais de semana futuros
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                alert('Agendamentos indisponíveis aos finais de semana. Por favor, escolha um dia útil.');
                dateInput.value = '';
                timeSelect.value = '';
                timeSelect.options[0].selected = true;
                timeSelect.options[0].text = "Escolha a data primeiro";
                return;
            }

            // Atualiza as opções do Select de Horas baseado nas 24h
            const currentNow = new Date();
            const boundaryTime = new Date(currentNow.getTime() + 24 * 60 * 60 * 1000);
            const boundaryDateStr = formatStringDate(boundaryTime);

            timeSelect.options[0].text = "Selecione o horário"; // Muda placeholder

            Array.from(timeSelect.options).forEach(option => {
                if (!option.value) return; // Pula o placeholder

                // Se o cliente escolheu exatamente a data limite (amanhã)
                if (selectedDateStr === boundaryDateStr) {
                    const optionHour = parseInt(option.value.split(':')[0], 10);
                    const boundaryHour = boundaryTime.getHours();
                    
                    // Bloqueia e deixa cinza as horas que não cumprem as 24h
                    if (optionHour <= boundaryHour) {
                        option.disabled = true;
                        option.text = `${option.value} (Apenas em 24h)`;
                    } else {
                        option.disabled = false;
                        option.text = option.value;
                    }
                } else {
                    // Para qualquer data depois de amanhã, libera todos os horários
                    option.disabled = false;
                    option.text = option.value;
                }
            });

            // Se o usuário tinha selecionado uma hora que agora ficou bloqueada, limpa
            if (timeSelect.options[timeSelect.selectedIndex]?.disabled) {
                timeSelect.value = '';
                timeSelect.options[0].selected = true;
            }
        });
    }

    // --- ELEMENTOS DO LAYOUT E MODAL ---
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

    // --- HEADER SCROLL ---
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

    // --- LÓGICA DE TRANSIÇÃO DO MODAL ---
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
            
            // Reseta a frase do select
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

    // --- FLUXO DE ENVIO ---
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const date = document.getElementById('schedule-date').value;
            const time = document.getElementById('schedule-time').value;

            // Trava final simples
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
