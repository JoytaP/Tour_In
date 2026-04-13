document.addEventListener('DOMContentLoaded', () => {
    // 1. Proteção: Verifica se está logado
    if (!TourIn.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // --- LÓGICA DAS ABAS (TABS) ---
    const tabs = document.querySelectorAll('.tab-btn');
    const panels = document.querySelectorAll('.settings-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove a classe 'active' de todas as abas e painéis
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Adiciona a classe 'active' no botão clicado
            tab.classList.add('active');

            // Mostra o painel correspondente
            const targetId = tab.getAttribute('data-target');
            const targetPanel = document.getElementById(`panel-${targetId}`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // --- FUNCIONALIDADE 1: MUDAR SENHA (API) ---
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmNewPassword = document.getElementById('confirm-new-password').value;

            // Validações
            if (newPassword !== confirmNewPassword) {
                alert('A nova senha e a confirmação não coincidem.');
                return;
            }
            if (newPassword.length < 6) {
                alert('A senha deve ter no mínimo 6 caracteres.');
                return;
            }

            const btn = passwordForm.querySelector('button');
            const originalText = btn.innerText;

            try {
                btn.innerText = 'Atualizando...';
                btn.disabled = true;

                // Chama a API real
                const response = await fetch(`${API_URL}/users/change-password`, {
                    method: 'PUT',
                    headers: TourIn.getAuthHeaders(),
                    body: JSON.stringify({ currentPassword, newPassword })
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Sucesso! Senha alterada. Por favor, faça login novamente.');
                    TourIn.logout(); // Desloga por segurança
                } else {
                    alert('Erro: ' + (data.message || 'Senha atual incorreta.'));
                }

            } catch (error) {
                console.error(error);
                alert('Erro de conexão com o servidor.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // --- FUNCIONALIDADE 2: NOTIFICAÇÕES (Salvar Localmente) ---
    const notifForm = document.getElementById('notifications-form');
    const marketingCheckbox = document.getElementById('notif-marketing');

    if (notifForm && marketingCheckbox) {
        // Carrega a preferência salva anteriormente (se existir)
        const savedPref = localStorage.getItem('pref_marketing_email');
        if (savedPref !== null) {
            // Converte string 'true'/'false' para booleano
            marketingCheckbox.checked = (savedPref === 'true');
        }

        notifForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Salva a nova escolha
            localStorage.setItem('pref_marketing_email', marketingCheckbox.checked);
            
            // Feedback visual
            const btn = notifForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Salvo!';
            btn.classList.add('btn-success'); // Opcional, se tiver estilo de sucesso
            setTimeout(() => {
                btn.innerText = originalText;
                btn.classList.remove('btn-success');
            }, 2000);
        });
    }

    // --- FUNCIONALIDADE 3: PRIVACIDADE (Salvar Localmente) ---
    const privacyForm = document.getElementById('privacy-form');
    const privacySelect = document.getElementById('privacy-select');

    if (privacyForm && privacySelect) {
        // Carrega a preferência salva
        const savedPrivacy = localStorage.getItem('pref_profile_privacy');
        if (savedPrivacy) {
            privacySelect.value = savedPrivacy;
        }

        privacyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Salva a nova escolha
            localStorage.setItem('pref_profile_privacy', privacySelect.value);
            
            alert(`Privacidade definida como: ${privacySelect.options[privacySelect.selectedIndex].text}`);
        });
    }
});