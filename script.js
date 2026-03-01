document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INICIALIZAÇÃO VISUAL (ÍCONES E ANIMAÇÕES) ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    if (typeof AOS !== 'undefined') {
        AOS.init({ once: true, offset: 50, duration: 800 });
    }

    // --- 2. SISTEMA DE TEMAS (CLARO / ESCURO / AUTO) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
            themeIcon.setAttribute('data-lucide', theme === 'light' ? 'sun' : 'moon');
            lucide.createIcons(); 
        }
    };

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = localStorage.getItem('lexsec-theme');
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDarkScheme.matches ? 'dark' : 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem('lexsec-theme', newTheme);
        });
    }

    prefersDarkScheme.addEventListener("change", (e) => {
        if (!localStorage.getItem('lexsec-theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- 3. LÓGICA DO CALENDÁRIO COM FLATPICKR ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');
    let fpInstance = null;

    if (dateInput && timeSelect && typeof flatpickr !== 'undefined') {
        const now = new Date();
        const minValidDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        if (minValidDateTime.getDay() === 6) { 
            minValidDateTime.setDate(minValidDateTime.getDate() + 2);
        } else if (minValidDateTime.getDay() === 0) { 
            minValidDateTime.setDate(minValidDateTime.getDate() + 1);
        }

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
            const currentBoundary = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            
            Array.from(timeSelect.options).forEach(option => {
                if (!option.value) return; 

                const optionHour = parseInt(option.value.split(':')[0], 10);
                const isSameBoundaryDay = selectedDate.getDate() === currentBoundary.getDate() &&
                                          selectedDate.getMonth() === currentBoundary.getMonth() &&
                                          selectedDate.getFullYear() === currentBoundary.getFullYear();

                if (isSameBoundaryDay) {
                    if (optionHour <= currentBoundary.getHours()) {
                        option.disabled = true;
                        option.text = `${option.value} (Requer 24h)`;
                    } else {
                        option.disabled = false;
                        option.text = option.value;
                    }
                } else {
                    option.disabled = false;
                    option.text = option.value;
                }
            });

            if (timeSelect.options[timeSelect.selectedIndex]?.disabled) {
                timeSelect.value = '';
            }
        };

        fpInstance = flatpickr(dateInput, {
            locale: "pt", 
            dateFormat: "Y-m-d", 
            altInput: true,
            altFormat: "d/m/Y", 
            minDate: formatStringDate(minValidDateTime),
            disable: [
                function(date) {
                    return (date.getDay() === 0 || date.getDay() === 6);
                }
            ],
            onChange: function(selectedDates) {
                updateTimeOptions(selectedDates[0]);
            }
        });
    }

    // --- 4. ELEMENTOS DA INTERFACE E EVENTOS ---
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

    // --- 5. CONTROLE DO MODAL ---
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

    // --- 6. FLUXO DE REVISÃO E ENVIO WEBHOOK ---
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); 

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            const date = document.getElementById('schedule-date').value; 
            const time = document.getElementById('schedule-time').value;

            if ((date && !time) || (!date && time)) {
                alert("Para agendar, preencha a Data e o Horário.");
                return;
            }

            let dateDisplay = 'Não selecionado';
            if (date) {
                const parts = date.split('-');
                if (parts.length === 3) {
                    dateDisplay = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
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
