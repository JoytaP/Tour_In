document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/companies/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('company', JSON.stringify(data.user));

                window.location.href = 'company_dashboard.html';
            } else {
                alert(data.message || 'Erro no login');
            }

        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor');
        }
    });

    // auto-preenchimento pós cadastro
    const prefill = sessionStorage.getItem('company_prefill');
    if (prefill) {
        const data = JSON.parse(prefill);
        document.getElementById('email').value = data.email || '';
        document.getElementById('password').value = data.password || '';
    }
});