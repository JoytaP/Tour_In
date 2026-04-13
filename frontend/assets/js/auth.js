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
                alert('Por favor, preencha todos os campos.');
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
                    
                    // Redireciona para o Dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.message || 'Erro ao fazer login. Verifique seus dados.');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro de conexão com o servidor.');
            } finally {
                btn.innerText = 'Entrar';
                btn.disabled = false;
            }
        });
    }

    // --- LÓGICA DE REGISTRO (CORREÇÃO BLINDADA) ---
    const btnRegister = document.getElementById('btn-register');
    if (btnRegister) {
        btnRegister.addEventListener('click', async () => {
            
            // Pega os valores
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            // Validação Manual
            if (!name || !email || !password) {
                alert('Preencha todos os campos!');
                return;
            }

            if (password !== confirmPassword) {
                alert('As senhas não conferem!');
                return;
            }

            try {
                btnRegister.innerText = 'Criando conta...';
                btnRegister.disabled = true;

                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role: 'user' })
                });

                const data = await response.json();

                if (response.ok) {
                    // SUCESSO!
                    alert('Conta criada! Redirecionando para o Login...');
                    // Força a mudança de página
                    window.location.replace('login.html');
                } else {
                    alert('Erro: ' + (data.message || 'Falha ao criar conta'));
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão.');
            } finally {
                btnRegister.innerText = 'Criar Conta';
                btnRegister.disabled = false;
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
                        alert('Empresa cadastrada com sucesso!');
                        window.location.href = 'dashboard.html';
                    } else {
                        const data = await response.json();
                        alert(data.message || 'Erro ao cadastrar empresa');
                    }

                } catch (error) {
                    console.error(error);
                    alert('Erro de conexão.');
                }
            });
        }
    }
});