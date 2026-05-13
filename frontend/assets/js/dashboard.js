document.addEventListener('DOMContentLoaded', async () => {
    if (!TourIn.isAuthenticated()) { window.location.href = 'login.html'; return; }

    // ── Nome do usuário ──
    const user = TourIn.getUser();
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) userNameEl.textContent = user.name ? user.name.split(' ')[0] : 'Viajante';

    // ── Carrega estatísticas reais ──
    try {
        const res = await fetch(`${API_URL}/users/profile`, { headers: TourIn.getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            animateValue('stat-itineraries', 0, data.itinerary_count || 0, 900);

            // Preferências no dashboard
            const prefs = Array.isArray(data.preferences) ? data.preferences : [];
            const prefEl = document.getElementById('user-preferences');
            if (prefEl) {
                const labels = { gastronomy: '🍽️ Gastronomia', nightlife: '🎉 Noite', culture: '🎭 Cultura', nature: '🌳 Natureza' };
                prefEl.innerHTML = prefs.length
                    ? prefs.map(p => `<span class="pref-badge">${labels[p] || p}</span>`).join('')
                    : '<span style="color:var(--text-muted);font-size:.85rem;">Nenhuma preferência definida. <a href="profile.html">Configurar</a></span>';
            }
        }
    } catch (err) {
        console.error('Erro ao carregar stats:', err);
    }

    // Itinerários salvos localmente
    const draft = JSON.parse(localStorage.getItem('temp_itinerary') || '[]');
    animateValue('stat-places', 0, draft.length, 900);
    animateValue('stat-reviews', 0, 0, 900);

    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (ts) => {
            if (!startTimestamp) startTimestamp = ts;
            const progress = Math.min((ts - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }
});
