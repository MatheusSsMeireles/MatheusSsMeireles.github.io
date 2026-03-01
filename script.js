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
        
        // Atualiza o tema do Calendário Flatpickr
        if (fpThemeLink) {
            fpThemeLink.href = theme === 'light' 
                ? "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/material_blue.css"
                : "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/dark.css";
        }
    };

    // Lê a preferência do sistema operacional do cliente
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Verifica se já havia uma escolha salva, senão, usa a do sistema
    const savedTheme = localStorage.getItem('lexsec-theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme(prefersDark.matches ? 'dark' : 'light');
    }

    // Clique no botão para alternar
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('lexsec-theme', newTheme);
        });
    }

    // Escuta se o cliente mudar o tema do celular/PC em tempo real
    prefersDark.addEventListener('change', (e) => {
        if (!localStorage.getItem('lexsec-theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- 3. CONTROLE DE SCROLL DO HEADER ---
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
    });

    // --- 4. LÓGICA DO CALENDÁRIO FLATPICKR (BLOQUEIO 24H) ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');

    if (dateInput && timeSelect && typeof flatpickr !== 'undefined') {
        const now = new Date();
        const minDateLimit = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Pula fins de semana na data mínima inicial
        if (minDateLimit.getDay() === 6) minDateLimit.setDate(minDateLimit.getDate() + 2);
        if (minDateLimit.getDay() === 0) minDateLimit.setDate(minDateLimit.getDate() + 1);

        flatpickr(dateInput, {
            locale: "pt",
            dateFormat: "d/m/Y", // Formato brasileiro
            minDate: minDateLimit, // Bloqueia fisicamente as 24h anteriores
            disable: [
                function(date) { return (date.getDay() === 0 || date.getDay() === 6); } // FDS off
            ],
            onChange: function(selectedDates, dateStr) {
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

    // --- 5. LÓGICA DO MODAL (MULTI-STEP) E WEBHOOK ---
    const modal = document.getElementById('contact-modal');
    const form = document.getElementById('contact-form');
    
    const steps = { input: 'step-input', confirm: 'step-confirm', success: 'step-success' };

    const showStep = (id) => {
        Object.values(steps).forEach(s => document.getElementById(s).style.display = 'none');
        document.getElementById(id).style.display = 'block';
    };

    document.querySelectorAll('.open-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            if(form) form.reset();
            if(timeSelect) timeSelect.value = "";
            showStep(steps.input);
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    };

    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-close-final').addEventListener('click', closeModal);

    // Passo 1 -> Passo 2 (Revisão)
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const date = dateInput.value;
            const time = timeSelect.value;

            if(!date || !time) {
                alert("Por favor, preencha a Data e o Horário do agendamento.");
                return;
            }

            document.getElementById('review-name').textContent = document.getElementById('name').value;
            document.getElementById('review-phone').textContent = document.getElementById('phone').value;
            document.getElementById('review-date').textContent = date;
            document.getElementById('review-time').textContent = time;
            
            showStep(steps.confirm);
        });
    }

    document.getElementById('btn-edit').addEventListener('click', () => showStep(steps.input));

    // Passo 2 -> Passo 3 (Envio Webhook POST)
    document.getElementById('btn-confirm-send').addEventListener('click', async () => {
        const btn = document.getElementById('btn-confirm-send');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Enviando...";
        document.getElementById('btn-edit').disabled = true;

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
                throw new Error("Erro de resposta do servidor");
            }
        } catch (e) {
            alert("Não foi possível enviar a solicitação. Verifique a conexão.");
            btn.disabled = false;
            btn.textContent = originalText;
            document.getElementById('btn-edit').disabled = false;
        }
    });
});
