document.addEventListener('DOMContentLoaded', () => {
    // --- 1. INICIALIZAÇÕES ---
    lucide.createIcons();
    AOS.init({ once: true, duration: 800 });

    // --- 2. SISTEMA DE TEMA (SISTEMA + MANUAL) ---
    const themeToggle = document.getElementById('theme-toggle');
    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lexsec-theme', theme);
        // Atualiza ícones do Flatpickr baseado no tema
        const fpTheme = document.getElementById('flatpickr-theme');
        if (theme === 'light') {
            fpTheme.href = "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/material_blue.css";
        } else {
            fpTheme.href = "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/dark.css";
        }
    };

    const savedTheme = localStorage.getItem('lexsec-theme') || getSystemTheme();
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // --- 3. CONTROLE DO MODAL ---
    const modal = document.getElementById('contact-modal');
    const openBtns = document.querySelectorAll('.open-modal-btn');
    const closeBtn = document.getElementById('close-modal');
    const steps = { input: 'step-input', confirm: 'step-confirm', success: 'step-success' };

    const switchStep = (stepId) => {
        Object.values(steps).forEach(id => document.getElementById(id).style.display = 'none');
        document.getElementById(stepId).style.display = 'block';
    };

    openBtns.forEach(btn => btn.addEventListener('click', () => {
        modal.classList.add('active');
        switchStep(steps.input);
    }));

    closeBtn.addEventListener('click', () => modal.classList.remove('active'));

    // --- 4. FLATPICKR (BLOQUEIOS 24H E HORÁRIO COMERCIAL) ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');

    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1); // Mínimo 24h à frente

    const fp = flatpickr(dateInput, {
        locale: "pt",
        minDate: "today",
        disable: [
            function(date) { return (date.getDay() === 0 || date.getDay() === 6); }
        ],
        onChange: function(selectedDates) {
            const selected = selectedDates[0];
            const now = new Date();
            const isTomorrow = selected.getDate() === minDate.getDate();

            // Desabilita horários menores que 24h se for amanhã
            Array.from(timeSelect.options).forEach(opt => {
                if (!opt.value) return;
                const hour = parseInt(opt.value);
                if (isTomorrow && hour <= now.getHours()) {
                    opt.disabled = true;
                    opt.text = `${opt.value} (Bloqueado)`;
                } else {
                    opt.disabled = false;
                    opt.text = opt.value;
                }
            });
        }
    });

    // --- 5. ENVIO E WEBHOOK ---
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('review-name').innerText = document.getElementById('name').value;
        document.getElementById('review-email').innerText = document.getElementById('email').value;
        document.getElementById('review-date').innerText = dateInput.value;
        document.getElementById('review-time').innerText = timeSelect.value;
        switchStep(steps.confirm);
    });

    document.getElementById('btn-confirm-send').addEventListener('click', async () => {
        const payload = {
            nome: document.getElementById('name').value,
            email: document.getElementById('email').value,
            telefone: document.getElementById('phone').value,
            mensagem: document.getElementById('message').value,
            data: dateInput.value,
            hora: timeSelect.value
        };

        try {
            await fetch('https://webnflow.lexsec.shop/webhook/site', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: { 'Content-Type': 'application/json' }
            });
            switchStep(steps.success);
        } catch (error) {
            alert("Erro ao enviar. Tente novamente.");
        }
    });

    document.getElementById('btn-edit').addEventListener('click', () => switchStep(steps.input));
    document.getElementById('btn-close-final').addEventListener('click', () => modal.classList.remove('active'));
});
