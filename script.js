document.addEventListener('DOMContentLoaded', () => {
    // Inicialização
    lucide.createIcons();
    AOS.init({ once: true, duration: 800 });

    // Tema
    const themeToggle = document.getElementById('theme-toggle');
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('lexsec-theme', theme);
        // Atualiza o tema do Flatpickr
        const fpTheme = document.getElementById('fp-theme');
        fpTheme.href = theme === 'light' 
            ? "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/material_blue.css"
            : "https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/themes/dark.css";
    };

    const savedTheme = localStorage.getItem('lexsec-theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    // --- AGENDAMENTO E MODAL ---
    const dateInput = document.getElementById('schedule-date');
    const timeSelect = document.getElementById('schedule-time');
    const modal = document.getElementById('contact-modal');
    const form = document.getElementById('contact-form');

    // Regra de 24h exatas
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + 24);

    const fp = flatpickr(dateInput, {
        locale: "pt",
        dateFormat: "d/m/Y",
        minDate: minDate,
        disable: [date => (date.getDay() === 0 || date.getDay() === 6)], // FDS bloqueado
        onChange: function(selectedDates) {
            const selected = selectedDates[0];
            const now = new Date();
            const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            // Verifica se o dia escolhido é o limite das 24h
            const isBoundaryDay = selected.getDate() === tomorrow.getDate() && 
                                  selected.getMonth() === tomorrow.getMonth();

            Array.from(timeSelect.options).forEach(opt => {
                if (!opt.value) return;
                const hour = parseInt(opt.value);
                
                // Se for o dia limite, bloqueia horas que não completam 24h
                if (isBoundaryDay && hour <= now.getHours()) {
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

    // Navegação Modal
    const steps = { input: 'step-input', confirm: 'step-confirm', success: 'step-success' };
    const showStep = (id) => {
        Object.values(steps).forEach(s => document.getElementById(s).style.display = 'none');
        document.getElementById(id).style.display = 'block';
    };

    document.querySelectorAll('.open-modal-btn').forEach(btn => btn.addEventListener('click', () => {
        modal.classList.add('active');
        showStep(steps.input);
    }));

    document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('active'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = dateInput.value;
        const time = timeSelect.value;

        if(!date || !time) {
            alert("Por favor, preencha data e hora.");
            return;
        }

        document.getElementById('review-name').textContent = document.getElementById('name').value;
        document.getElementById('review-date').textContent = date;
        document.getElementById('review-time').textContent = time;
        showStep(steps.confirm);
    });

    document.getElementById('btn-edit').addEventListener('click', () => showStep(steps.input));

    document.getElementById('btn-confirm-send').addEventListener('click', async () => {
        const btn = document.getElementById('btn-confirm-send');
        btn.disabled = true;
        btn.textContent = "Enviando...";

        const payload = {
            nome: document.getElementById('name').value,
            email: document.getElementById('email').value,
            whatsapp: document.getElementById('phone').value,
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
            showStep(steps.success);
        } catch (e) {
            alert("Erro ao enviar. Verifique sua conexão.");
            btn.disabled = false;
            btn.textContent = "Confirmar Envio";
        }
    });

    document.getElementById('btn-close-final').addEventListener('click', () => modal.classList.remove('active'));
});
