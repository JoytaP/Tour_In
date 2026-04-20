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
            return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
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
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
                return;
            }

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
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
        }
    });
});
