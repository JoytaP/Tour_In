document.addEventListener('DOMContentLoaded', async () => {
    if (!TourIn.isAuthenticated()) { window.location.href = 'login.html'; return; }

    // ── Elementos ──
    const nameInput     = document.getElementById('edit-name');
    const cityInput     = document.getElementById('edit-city');
    const phoneInput    = document.getElementById('edit-phone');
    const bioInput      = document.getElementById('edit-bio');
    const displayName   = document.getElementById('display-name');
    const displayEmail  = document.getElementById('display-email');
    const joinDate      = document.getElementById('join-date');
    const itineraryCount = document.getElementById('itinerary-count');
    const initials      = document.getElementById('profile-initials');
    const prefCheckboxes = document.querySelectorAll('input[name="pref"]');
    const form          = document.getElementById('profile-edit-form');

    // ── Carregar perfil do backend ──
    async function loadProfile() {
        try {
            const res = await fetch(`${API_URL}/users/profile`, {
                headers: TourIn.getAuthHeaders()
            });
            if (!res.ok) throw new Error('Falha ao carregar perfil');
            const user = await res.json();

            // Sidebar
            if (displayName)  displayName.textContent  = user.name || '';
            if (displayEmail) displayEmail.textContent = user.email || '';
            if (initials && user.name) initials.textContent = user.name.charAt(0).toUpperCase();
            if (joinDate && user.created_at) {
                const d = new Date(user.created_at);
                joinDate.textContent = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            }
            if (itineraryCount) itineraryCount.textContent = user.itinerary_count ?? 0;

            // Form fields
            if (nameInput)  nameInput.value  = user.name  || '';
            if (cityInput)  cityInput.value  = user.city  || '';
            if (phoneInput) phoneInput.value = user.phone || '';
            if (bioInput)   bioInput.value   = user.bio   || '';

            // Preferências
            const prefs = Array.isArray(user.preferences) ? user.preferences : [];
            prefCheckboxes.forEach(cb => {
                cb.checked = prefs.includes(cb.value);
            });

        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
        }
    }

    loadProfile();

    // ── Salvar alterações ──
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('[type="submit"]');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Salvando...';

            // Coleta preferências marcadas
            const selectedPrefs = [...prefCheckboxes]
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            const payload = {
                name:        nameInput  ? nameInput.value  : undefined,
                city:        cityInput  ? cityInput.value  : undefined,
                phone:       phoneInput ? phoneInput.value : undefined,
                bio:         bioInput   ? bioInput.value   : undefined,
                preferences: selectedPrefs
            };

            try {
                const res = await fetch(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: TourIn.getAuthHeaders(),
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    // Atualiza localStorage
                    const stored = TourIn.getUser();
                    if (stored) {
                        stored.name = payload.name;
                        localStorage.setItem('user', JSON.stringify(stored));
                    }
                    showToast('Perfil atualizado com sucesso! ✅');
                    loadProfile();
                } else {
                    showToast(data.message || 'Erro ao atualizar perfil.', true);
                }
            } catch (err) {
                console.error(err);
                showToast('Erro de conexão.', true);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
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
        t.textContent = msg;
        t.style.display = 'block';
        clearTimeout(t._t);
        t._t = setTimeout(() => { t.style.display = 'none'; }, 3000);
    }
});
