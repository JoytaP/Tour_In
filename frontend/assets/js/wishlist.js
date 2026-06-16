// ═══════════════════════════════════════════════════════
// Tour.In — Wishlist (v3)
// Todas as chamadas usam Bearer token JWT.
// Suporta lugares, eventos e estabelecimentos OSM.
// ═══════════════════════════════════════════════════════

const WISHLIST_API = (typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api') + '/wishlist';

// ── Helper: headers com token ─────────────────────────────────────────────────
function wishlistHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ── Salvar na wishlist ────────────────────────────────────────────────────────
// placeId  → id de places no banco
// eventId  → id de events no banco
// osmPlace → { name, lat, lon, type } para estabelecimentos do OpenStreetMap
async function saveToWishlist(placeId, eventId = null, osmPlace = null) {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Faça login para salvar na wishlist!', 'info');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }

    // Se for um lugar OSM (sem id no banco), precisamos registrá-lo primeiro
    if (osmPlace && !placeId && !eventId) {
        try {
            // Insere o lugar no banco de dados via API de places
            const insertRes = await fetch(`${typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api'}/places`, {
                method: 'POST',
                headers: wishlistHeaders(),
                body: JSON.stringify({
                    name:        osmPlace.name,
                    description: osmPlace.description || osmPlace.type || '',
                    category:    osmPlace.category || 'tourism',
                    address:     osmPlace.address || '',
                    lat:         osmPlace.lat,
                    lon:         osmPlace.lon
                })
            });
            if (insertRes.ok) {
                const inserted = await insertRes.json();
                placeId = inserted.id || inserted.place?.id;
            }
        } catch (err) {
            console.warn('Não foi possível registrar lugar OSM, salvando só na wishlist sem id de lugar:', err);
        }
        // Se ainda sem placeId, não tem como salvar com FK — informa o usuário
        if (!placeId) {
            showToast('Não foi possível salvar este estabelecimento.', 'error');
            return;
        }
    }

    try {
        const response = await fetch(`${WISHLIST_API}/add`, {
            method: 'POST',
            headers: wishlistHeaders(),
            body: JSON.stringify({
                place_id: placeId || null,
                event_id: eventId || null
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(eventId ? '❤️ Evento salvo na Wishlist!' : '❤️ Local salvo na Wishlist!');
            _refreshWishlistCount();
        } else if (data.error?.includes('já salvo')) {
            showToast('Já está na sua Wishlist!', 'info');
        } else {
            showToast(data.error || 'Erro ao salvar.', 'error');
        }
    } catch (error) {
        console.error('Erro wishlist:', error);
        showToast('Erro de conexão.', 'error');
    }
}

// ── Carregar wishlist na dashboard ───────────────────────────────────────────
async function loadWishlistOnDashboard() {
    const container = document.getElementById('home-wishlist');
    if (!container) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // Usa /mine com Bearer token — não expõe userId na URL
        const response = await fetch(`${WISHLIST_API}/mine`, {
            headers: wishlistHeaders()
        });

        if (response.status === 401) {
            container.innerHTML = `<p style="color:var(--text-muted);">Sessão expirada. <a href="login.html">Faça login novamente.</a></p>`;
            return;
        }

        const items = await response.json();

        if (!Array.isArray(items) || items.length === 0) {
            container.innerHTML = `
                <p style="color:var(--text-muted);font-size:.95rem;">
                    Você ainda não salvou nenhum lugar ou evento.
                    <a href="explore.html" style="color:var(--accent-primary);">Comece a explorar!</a>
                </p>`;
            return;
        }

        const catIcons = {
            gastronomy:'🍽️', culture:'🎭', nature:'🌿', nightlife:'🎉',
            tourism:'🏛️', sports:'⚽', music:'🎵', education:'📚',
            restaurant:'🍽️', cafe:'☕', bar:'🍺', museum:'🏛️',
            park:'🌳', hotel:'🏨', attraction:'⭐'
        };

        container.innerHTML = items.map(item => {
            const isEvent  = item.type === 'event';
            const icon     = catIcons[item.category] || (isEvent ? '🎉' : '📍');
            const subtitle = item.event_date
                ? `📅 ${new Date(item.event_date).toLocaleDateString('pt-BR')}`
                : (item.address ? `📍 ${item.address.split(',')[0]}` : item.category || '');
            const desc = item.description
                ? item.description.slice(0, 75) + (item.description.length > 75 ? '…' : '')
                : subtitle;

            return `
            <div class="wishlist-card" role="article" aria-label="${item.name}">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
                    <span style="font-size:1.6rem;">${icon}</span>
                    <span class="wishlist-badge${isEvent ? ' event' : ''}">${isEvent ? '🎉 Evento' : '📍 Local'}</span>
                </div>
                <h3 style="color:var(--text-main);margin-bottom:6px;font-size:.95rem;font-weight:700;">${item.name}</h3>
                <p style="color:var(--text-muted);margin-bottom:16px;font-size:.82rem;line-height:1.4;">${desc}</p>
                <div style="display:flex;gap:8px;">
                    <button class="btn small" style="flex:1;padding:8px;font-size:.78rem;background:rgba(255,255,255,.05);"
                        onclick="goToWishlistItem('${item.type}')">
                        📍 Ver
                    </button>
                    <button class="btn small"
                        style="padding:8px;font-size:.78rem;background:rgba(235,87,87,.1);border-color:rgba(235,87,87,.3);color:#eb5757;"
                        onclick="removeFromWishlist(${item.wishlist_id})"
                        aria-label="Remover da wishlist">
                        🗑️
                    </button>
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        console.error('Erro ao carregar wishlist:', error);
        container.innerHTML = `<p style="color:var(--text-muted);">Erro ao carregar sua wishlist.</p>`;
    }
}

// ── Navegar para item ─────────────────────────────────────────────────────────
window.goToWishlistItem = (type) => {
    window.location.href = type === 'event' ? 'events.html' : 'explore.html';
};

// ── Remover da wishlist ───────────────────────────────────────────────────────
async function removeFromWishlist(wishlistId) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${WISHLIST_API}/${wishlistId}`, {
            method: 'DELETE',
            headers: wishlistHeaders()
        });

        const data = await response.json();
        if (data.success) {
            showToast('Removido da wishlist');
            loadWishlistOnDashboard();
            _refreshWishlistCount();
        } else {
            showToast(data.error || 'Erro ao remover.', 'error');
        }
    } catch (error) {
        console.error('Erro ao remover:', error);
        showToast('Erro de conexão.', 'error');
    }
}

// ── Atualiza contador no stat card ────────────────────────────────────────────
async function _refreshWishlistCount() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch(`${WISHLIST_API}/mine`, { headers: wishlistHeaders() });
        if (!res.ok) return;
        const items = await res.json();
        const el = document.getElementById('stat-places');
        if (el) el.textContent = Array.isArray(items) ? items.length : 0;
    } catch {}
}

// ── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;

    const bg    = { success: 'var(--accent-primary)', info: 'var(--bg-card)', error: '#eb5757' };
    const color = { success: '#000',                  info: 'var(--text-main)', error: '#fff' };

    Object.assign(toast.style, {
        position: 'fixed', bottom: '30px', right: '30px',
        background: bg[type]    || bg.success,
        color:      color[type] || color.success,
        padding: '14px 22px', borderRadius: '14px',
        fontWeight: '700', fontSize: '0.9rem', zIndex: '9999',
        backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)', animation: 'fadeUp 0.3s ease both'
    });

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// ── Expõe globalmente ─────────────────────────────────────────────────────────
window.saveToWishlist     = saveToWishlist;
window.removeFromWishlist = removeFromWishlist;
window.showToast          = showToast;

// ── Inicializa wishlist na dashboard ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // No dashboard.html, a wishlist é renderizada pelo dashboard.js — não duplicar
    if (document.getElementById('home-wishlist') && typeof renderWishlistOnDash === 'function') return;
    loadWishlistOnDashboard();
});
