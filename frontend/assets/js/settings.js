document.addEventListener('DOMContentLoaded', () => {
    if (!TourIn.isAuthenticated()) { window.location.href = 'login.html'; return; }

    // ── Abas ──
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panel = document.getElementById(`panel-${tab.getAttribute('data-target')}`);
            if (panel) panel.classList.add('active');
        });
    });

    // ── Mudar senha ──
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword     = document.getElementById('current-password').value;
            const newPassword         = document.getElementById('new-password').value;
            const confirmNewPassword  = document.getElementById('confirm-new-password').value;

            const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%*?&^$\-_+=<>|]).{8,}$/;
            if (!PWD_REGEX.test(newPassword)) {
                showToast('A nova senha deve ter mín. 8 caracteres, maiúscula, minúscula, número e caractere especial.', true);
                return;
            }
            if (newPassword !== confirmNewPassword) { showToast('As senhas não coincidem.', true); return; }

            const btn = passwordForm.querySelector('button');
            btn.textContent = 'Atualizando...'; btn.disabled = true;
            try {
                const res = await fetch(`${API_URL}/users/change-password`, {
                    method: 'PUT',
                    headers: TourIn.getAuthHeaders(),
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await res.json();
                if (res.ok) {
                    showToast('Senha alterada! Faça login novamente.');
                    TourIn.logout();
                } else {
                    showToast(data.message || 'Erro ao alterar senha.', true);
                }
            } catch (err) {
                showToast('Erro de conexão.', true);
            } finally {
                btn.textContent = 'Atualizar Senha'; btn.disabled = false;
            }
        });
    }

    // ── Notificações ──
    const notifForm = document.getElementById('notifications-form');
    const marketingCb = document.getElementById('notif-marketing');
    if (notifForm && marketingCb) {
        const saved = localStorage.getItem('pref_marketing_email');
        if (saved !== null) marketingCb.checked = (saved === 'true');
        notifForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('pref_marketing_email', marketingCb.checked);
            showToast('Preferências salvas!');
        });
    }

    // ── Privacidade ──
    const privacyForm = document.getElementById('privacy-form');
    const privacySelect = document.getElementById('privacy-select');
    if (privacyForm && privacySelect) {
        const savedP = localStorage.getItem('pref_profile_privacy');
        if (savedP) privacySelect.value = savedP;
        privacyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('pref_profile_privacy', privacySelect.value);
            showToast('Privacidade salva!');
        });
    }

    // ── Excluir Conta ──
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            // Modal de confirmação inline
            const password = prompt(
                '⚠️ Esta ação é irreversível.\n\nDigite sua senha para confirmar a exclusão da sua conta:'
            );
            if (password === null) return; // Cancelou
            if (!password.trim()) { showToast('A senha é obrigatória.', true); return; }

            confirmDelete(password);
        });
    }

    async function confirmDelete(password) {
        try {
            const res = await fetch(`${API_URL}/users/account`, {
                method: 'DELETE',
                headers: TourIn.getAuthHeaders(),
                body: JSON.stringify({ password })
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Conta excluída com sucesso. Até logo!');
                TourIn.logout();
            } else {
                showToast(data.message || 'Não foi possível excluir a conta.', true);
            }
        } catch (err) {
            showToast('Erro de conexão.', true);
        }
    }

    // ── Toast ──
    function showToast(msg) {
        let t = document.getElementById('_toast');
        if (!t) {
            t = document.createElement('div');
            t.id = '_toast';
            t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
                background:#00f2ff;color:#000;padding:12px 24px;border-radius:100px;
                font-weight:700;font-size:.9rem;z-index:9999;`;
            document.body.appendChild(t);
        }
        t.textContent = msg; t.style.display = 'block';
        clearTimeout(t._t);
        t._t = setTimeout(() => { t.style.display = 'none'; }, 3000);
    }
});
