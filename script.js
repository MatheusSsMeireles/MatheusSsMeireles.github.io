document.addEventListener('DOMContentLoaded', () => {

    // --- 1. INICIALIZAÇÃO DE ÍCONES E ANIMAÇÕES ---
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof AOS !== 'undefined') AOS.init({ once: true, duration: 800, offset: 50 });

    // --- 2. SISTEMA DE TEMAS AUTOMÁTICO E MANUAL ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;
    const fpThemeLink = document.getElementById('fp-theme');

    const updateIcon = (theme) => {
        if (themeIcon) {
            themeIcon.setAttribute('data-lucide', theme === 'light' ? 'sun' : 'moon');
            lucide.createIcons();
        }
    };

    const applyTheme = (theme) => {
        htmlElement.setAttribute('data-theme', theme);
        updateIcon(theme);
        
        if (fpThemeLink) {
            fpThemeLink.href = theme === 'light' 
                ? "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/material_blue.css"
                : "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/dark.css";
        }
    };

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('lexsec-theme');
    
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDark.matches ? 'dark' : 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('lexsec-theme', newTheme);
        });
    }

    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('lexsec-theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- 3. SCROLL DO HEADER E MENU MOBILE ---
    const header = document.getElementById('main-header');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });
    
    document.querySelectorAll('.nav-center a, .nav-right button').forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth <= 900) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('open');
            }
        });
    });

    // --- 4. CALENDÁRIO FLATPICKR (BLOQUEIO 24H E FDS) ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');

    if (dateInput && timeSelect && typeof flatpickr !== 'undefined') {
        const now = new Date();
        const minDateLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        if (minDateLimit.getDay() === 6) minDateLimit.setDate(minDateLimit.getDate() + 2);
        if (minDateLimit.getDay() === 0) minDateLimit.setDate(minDateLimit.getDate() + 1);

        flatpickr(dateInput, {
            locale: "pt",
            dateFormat: "d/m/Y", 
            minDate: minDateLimit, 
            disable: [
                function(date) { return (date.getDay() === 0 || date.getDay() === 6); }
            ],
            onChange: function(selectedDates) {
                if(selectedDates.length === 0) return;
                const selected = selectedDates[0];
                const currentNow = new Date();
                const limitTime = new Date(currentNow.getTime() + 24 * 60 * 60 * 1000);

                const isLimitDay = selected.getDate() === limitTime.getDate() && 
                                   selected.getMonth() === limitTime.getMonth();

                Array.from(timeSelect.options).forEach(opt => {
                    if (!opt.value) return;
                    const hour = parseInt(opt.value.split(':')[0], 10);
                    
                    if (isLimitDay && hour <= limitTime.getHours()) {
                        opt.disabled = true;
                        opt.textContent = `${opt.value} (Bloqueado)`;
                    } else {
                        opt.disabled = false;
                        opt.textContent = opt.value;
                    }
                });
                timeSelect.value = "";
            }
        });
    }

    // --- 5. LÓGICA DO MODAL MULTI-STEP ---
    const modal = document.getElementById('contact-modal');
    const form = document.getElementById('contact-form');
    
    const steps = { input: 'step-input', confirm: 'step-confirm', success: 'step-success' };

    const showStep = (id) => {
        Object.values(steps).forEach(s => {
            const el = document.getElementById(s);
            if(el) el.style.display = 'none';
        });
        const target = document.getElementById(id);
        if(target) target.style.display = 'block';
    };

    // Abertura do Modal garantida para TODOS os botões com a classe .open-modal-btn
    document.querySelectorAll('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if(modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                if(form) form.reset();
                if(timeSelect) timeSelect.value = "";
                showStep(steps.input);
            }
        });
    });

    const closeModal = () => {
        if(modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

    const closeModalBtn = document.getElementById('close-modal');
    const closeFinalBtn = document.getElementById('btn-close-final');
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if(closeFinalBtn) closeFinalBtn.addEventListener('click', closeModal);
    
    if(modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Passo 1 -> Passo 2 (Revisão)
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = dateInput ? dateInput.value : '';
            const time = timeSelect ? timeSelect.value : '';

            if(!date || !time) {
                alert("Por favor, preencha a Data e o Horário da consultoria.");
                return;
            }

            document.getElementById('review-name').textContent = document.getElementById('name').value;
            document.getElementById('review-phone').textContent = document.getElementById('phone').value;
            document.getElementById('review-date').textContent = date;
            document.getElementById('review-time').textContent = time;
            
            showStep(steps.confirm);
        });
    }

    const btnEdit = document.getElementById('btn-edit');
    if(btnEdit) btnEdit.addEventListener('click', () => showStep(steps.input));

    // Passo 2 -> Passo 3 (Envio Webhook POST)
    const btnConfirmSend = document.getElementById('btn-confirm-send');
    if(btnConfirmSend) {
        btnConfirmSend.addEventListener('click', async () => {
            const originalText = btnConfirmSend.textContent;
            btnConfirmSend.disabled = true;
            btnConfirmSend.textContent = "Enviando...";
            if(btnEdit) btnEdit.disabled = true;

            const payload = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                description: document.getElementById('message').value,
                schedule_date: dateInput.value,
                schedule_time: timeSelect.value,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch('https://webnflow.lexsec.shop/webhook/site', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if(response.ok) {
                    showStep(steps.success);
                } else {
                    throw new Error("Erro de servidor");
                }
            } catch (e) {
                alert("Não foi possível enviar. Verifique a conexão com a internet.");
                btnConfirmSend.disabled = false;
                btnConfirmSend.textContent = originalText;
                if(btnEdit) btnEdit.disabled = false;
            }
        });
    }
});
