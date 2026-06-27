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

    // ── Força de senha (mesma regex do backend) ──────────────────────────────
    const PWD_REGEX   = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%*?&^$\-_+=<>|]).{8,}$/;
    const compPwdInput = document.getElementById('comp-password');
    const compPwdRules = document.getElementById('pwd-rules-company');

    function checkCompPwdRules(pwd) {
        const rules = {
            'cr-len':     pwd.length >= 8,
            'cr-upper':   /[A-Z]/.test(pwd),
            'cr-lower':   /[a-z]/.test(pwd),
            'cr-num':     /\d/.test(pwd),
            'cr-special': /[@#!%*?&^$\-_+=<>|]/.test(pwd),
        };
        Object.entries(rules).forEach(([id, ok]) => {
            const li = document.getElementById(id);
            if (li) li.classList.toggle('ok', ok);
        });
        return Object.values(rules).every(Boolean);
    }

    if (compPwdInput && compPwdRules) {
        compPwdInput.addEventListener('focus', () => compPwdRules.classList.add('visible'));
        compPwdInput.addEventListener('input', () => checkCompPwdRules(compPwdInput.value));
    }

    // ── Submit ────────────────────────────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFeedback();

        const password        = getValue('comp-password');
        const confirmPassword = getValue('comp-confirm-password');

        if (!PWD_REGEX.test(password)) {
            if (compPwdRules) compPwdRules.classList.add('visible');
            checkCompPwdRules(password);
            setFeedback('❌ A senha não atende aos requisitos de segurança. Veja os critérios abaixo.', true);
            return;
        }
        if (password !== confirmPassword) {
            setFeedback('❌ As senhas não coincidem.', true);
            return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
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
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
                return;
            }

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
            setTimeout(() => window.location.href = 'company_dashboard.html', 1200);

        } catch (err) {
            console.error('Erro no cadastro:', err);
            setFeedback('❌ Erro de conexão. Verifique se o servidor está rodando.', true);
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
    });
});
