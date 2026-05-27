<<<<<<< HEAD
// ═══════════════════════════════════════════════════════
// Tour.In — Cadastro de Empresa
// Usa o token retornado diretamente pelo /register,
// sem segundo round-trip de login.
// ═══════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('company-register-form');
    if (!form) return;

    const getValue = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

    // ── Feedback visual inline ────────────────────────────────────────────────
    function setFeedback(msg, isError = false) {
        let el = document.getElementById('register-feedback');
        if (!el) {
            el = document.createElement('div');
            el.id = 'register-feedback';
            el.style.cssText = `margin-top:16px;padding:14px 18px;border-radius:14px;font-weight:600;font-size:.9rem;text-align:center;`;
            form.appendChild(el);
        }
        el.style.background = isError ? 'rgba(235,87,87,.15)' : 'rgba(0,242,255,.12)';
        el.style.border      = isError ? '1px solid rgba(235,87,87,.4)' : '1px solid rgba(0,242,255,.3)';
        el.style.color       = isError ? '#eb5757' : 'var(--accent-primary)';
        el.textContent = msg;
        el.style.display = 'block';
    }

    function clearFeedback() {
        const el = document.getElementById('register-feedback');
        if (el) el.style.display = 'none';
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFeedback();

        const password        = getValue('comp-password');
        const confirmPassword = getValue('comp-confirm-password');

        if (password !== confirmPassword) {
            setFeedback('❌ As senhas não coincidem.', true);
            return;
        }
        if (password.length < 6) {
            setFeedback('❌ A senha deve ter pelo menos 6 caracteres.', true);
=======
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('company-register-form');

    const getValue = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const password = getValue('comp-password');
        const confirmPassword = getValue('comp-confirm-password');

        if (password !== confirmPassword) {
            alert('As senhas não coincidem');
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
            return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
<<<<<<< HEAD
        const originalText = submitBtn?.textContent || 'Cadastrar';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Cadastrando...'; }

        // ── Monta FormData ────────────────────────────────────────────────────
        const formData = new FormData();
        ['comp-name','comp-cnpj','comp-category','comp-phone',
         'comp-address','comp-website','comp-desc','comp-email'].forEach(id => {
            const key = id.replace('comp-', '').replace('desc','description');
            formData.append(key, getValue(id));
        });
        formData.append('password', password);

        const fileInput = document.getElementById('comp-photos');
        if (fileInput?.files?.length > 0) {
            Array.from(fileInput.files).forEach(f => formData.append('photos', f));
        }

        try {
            setFeedback('⏳ Enviando dados para o servidor...');

            // ── POST /api/companies/register ──────────────────────────────────
            const BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api';
            const res  = await fetch(`${BASE}/companies/register`, { method: 'POST', body: formData });
            const data = await res.json();

            if (!res.ok) {
                setFeedback(data.message || 'Erro ao cadastrar empresa.', true);
=======
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Cadastrando...'; }

        const formData = new FormData();
        formData.append('name', getValue('comp-name'));
        formData.append('cnpj', getValue('comp-cnpj'));
        formData.append('category', getValue('comp-category'));
        formData.append('phone', getValue('comp-phone'));
        formData.append('address', getValue('comp-address'));
        formData.append('website', getValue('comp-website'));
        formData.append('description', getValue('comp-desc'));
        formData.append('email', getValue('comp-email'));
        formData.append('password', password);

        const fileInput = document.getElementById('comp-photos');
        if (fileInput && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append('photos', fileInput.files[i]);
            }
        }

        try {
            // 1. Cadastra a empresa
            const registerResponse = await fetch(`${API_URL}/companies/register`, {
                method: 'POST',
                body: formData
            });

            const registerData = await registerResponse.json();

            if (!registerResponse.ok) {
                alert(registerData.message || 'Erro ao cadastrar');
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
                return;
            }

<<<<<<< HEAD
            // ── Sucesso: backend já devolve token + user no register ──────────
            const { token, user } = data;

            if (!token || !user) {
                setFeedback('Cadastro realizado! Faça login para continuar.');
                setTimeout(() => window.location.href = 'login.html', 1800);
                return;
            }

            // Persiste sessão — usa a mesma chave 'token' e 'user' que o resto
            // do sistema espera; também salva 'company' para o company_dashboard
            localStorage.setItem('token',   token);
            localStorage.setItem('user',    JSON.stringify(user));
            localStorage.setItem('company', JSON.stringify(user));

            setFeedback('✅ Empresa cadastrada! Redirecionando para o dashboard...');

            // Pequena pausa para o usuário ver a mensagem
            setTimeout(() => window.location.href = 'company_dasboard.html', 1200);

        } catch (err) {
            console.error('Erro no cadastro:', err);
            setFeedback('❌ Erro de conexão. Verifique se o servidor está rodando.', true);
=======
            // 2. Faz login automático com as credenciais recém criadas
            const loginResponse = await fetch(`${API_URL}/companies/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: getValue('comp-email'), password })
            });

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
                // Salva token e dados da empresa
                localStorage.setItem('token', loginData.token);
                localStorage.setItem('company', JSON.stringify(loginData.user));
                // Redireciona direto para o dashboard
                window.location.href = 'company_dasboard.html';
            } else {
                // Cadastro ok mas login falhou — manda para página de login com prefill
                alert('Empresa cadastrada! Faça login para continuar.');
                sessionStorage.setItem('company_prefill', JSON.stringify({
                    email: getValue('comp-email'),
                    password
                }));
                window.location.href = 'login.html';
            }

        } catch (error) {
            console.error(error);
            alert('Erro de conexão com o servidor');
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
    });
});
