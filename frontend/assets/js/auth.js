document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. LÓGICA DE LOGIN
    // ==========================================
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Tenta pegar pelo ID específico, se não achar, tenta pegar pelo genérico (fallback)
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            
            const email = emailInput ? emailInput.value : null;
            const password = passwordInput ? passwordInput.value : null;

            if (!email || !password) {
                showToast('Por favor, preencha todos os campos.', true);
                return;
            }

            const btn = loginForm.querySelector('button');

            try {
                // Feedback visual
                const originalText = btn.innerText;
                btn.innerText = 'Entrando...';
                btn.disabled = true;

                const response = await fetch(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Salva o token e dados do usuário
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    // Redireciona conforme o tipo de conta
                    if (data.user.role === 'company') {
                        window.location.href = 'company_dashboard.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                } else {
                    showToast(data.message || 'Erro ao fazer login. Verifique seus dados.', true);
                }
            } catch (error) {
                console.error('Erro:', error);
                showToast('Erro de conexão com o servidor.', true);
            } finally {
                btn.innerText = 'Entrar';
                btn.disabled = false;
            }
        });
    }

    // ── Validação de força de senha (regex igual ao backend) ────────────────
    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%*?&^$\-_+=<>|]).{8,}$/;

    function checkPasswordRules(pwd, prefix) {
        const rules = {
            [`${prefix}-len`]:     pwd.length >= 8,
            [`${prefix}-upper`]:   /[A-Z]/.test(pwd),
            [`${prefix}-lower`]:   /[a-z]/.test(pwd),
            [`${prefix}-num`]:     /\d/.test(pwd),
            [`${prefix}-special`]: /[@#!%*?&^$\-_+=<>|]/.test(pwd),
        };
        Object.entries(rules).forEach(([id, ok]) => {
            const li = document.getElementById(id);
            if (li) li.classList.toggle('ok', ok);
        });
        return Object.values(rules).every(Boolean);
    }
    window._checkPasswordRules = checkPasswordRules;
    window._PWD_REGEX = PWD_REGEX;

    // Ativa checklist ao digitar na senha do usuário
    const pwdInput = document.getElementById('reg-password');
    const pwdRules = document.getElementById('pwd-rules-user');
    if (pwdInput && pwdRules) {
        pwdInput.addEventListener('focus', () => pwdRules.classList.add('visible'));
        pwdInput.addEventListener('input', () => checkPasswordRules(pwdInput.value, 'ur'));
    }

    // --- LÓGICA DE REGISTRO (USUÁRIO) ---
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', async () => {
            const name     = document.getElementById('reg-name').value.trim();
            const email    = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;
            const confirm  = document.getElementById('reg-confirm-password').value;

            if (!name || !email || !password) {
                showToast('Preencha todos os campos!', true);
                return;
            }
            if (!PWD_REGEX.test(password)) {
                if (pwdRules) pwdRules.classList.add('visible');
                checkPasswordRules(password, 'ur');
                showToast('A senha não atende aos requisitos de segurança.', true);
                return;
            }
            if (password !== confirm) {
                showToast('As senhas não conferem!', true);
                return;
            }

            try {
                btnRegister.innerText = 'Criando conta...';
                btnRegister.disabled  = true;

                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'user' })
                });
                const data = await response.json();

                if (response.ok) {
                    showToast('Conta criada! Redirecionando para o login...');
                    window.location.replace('login.html');
                } else {
                    showToast(data.message || 'Falha ao criar conta', true);
                }
            } catch (error) {
                console.error(error);
                showToast('Erro de conexão.', true);
            } finally {
                btnRegister.innerText = 'Criar Conta';
                btnRegister.disabled  = false;
            }
        });
    }

    // ==========================================
    // 3. LÓGICA DE REGISTRO (EMPRESA)
    // ==========================================
    // Verifica se estamos na página de cadastro de empresa
    if (window.location.pathname.includes('company_register.html')) {
        const companyForm = document.querySelector('form');
        
        if (companyForm) {
            companyForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const textareas = companyForm.querySelectorAll('textarea');
                // Assume que o primeiro textarea é a descrição
                const description = textareas[0] ? textareas[0].value : '';
                const category = 'general'; 

                try {
                    const btn = companyForm.querySelector('button[type="submit"]');
                    const originalText = btn.innerText;
                    btn.innerText = 'Cadastrando...';
                    btn.disabled = true;

                    const response = await fetch(`${API_URL}/companies/register`, {
                        method: 'POST',
                        headers: TourIn.getAuthHeaders(), // Precisa estar logado
                        body: JSON.stringify({ description, category })
                    });

                    if (response.ok) {
                        showToast('Empresa cadastrada com sucesso!');
                        window.location.href = 'dashboard.html';
                    } else {
                        const data = await response.json();
                        showToast(data.message || 'Erro ao cadastrar empresa', true);
                    }

                } catch (error) {
                    console.error(error);
                    showToast('Erro de conexão.', true);
                }
            });
        }
    }
});