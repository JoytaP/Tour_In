// ═══════════════════════════════════════════════════════
// Tour.In — Dashboard Principal (v3)
// ═══════════════════════════════════════════════════════

// Reaproveita a configuração central definida em main.js (carregado antes deste arquivo)
const API_URL_DASH = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api';

// ── Extrai userId do token JWT (sem depender de user.id no localStorage) ──────
function getUserIdFromToken() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || null;
    } catch { return null; }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!TourIn.isAuthenticated()) { window.location.href = 'login.html'; return; }

    const user   = TourIn.getUser();
    const userId = getUserIdFromToken() || user?.id || user?.userId;

    // ── Nome do usuário ──────────────────────────────────────────────────────
    const userNameEl = document.getElementById('user-name');
    if (userNameEl && user) userNameEl.textContent = user.name ? user.name.split(' ')[0] : 'Viajante';

    // ── Carrega tudo em paralelo ─────────────────────────────────────────────
    const [profileData, reservations, wishlist, events] = await Promise.all([
        fetchProfile(),
        fetchReservations(userId),
        fetchWishlist(),
        fetchUpcomingEvents()
    ]);

    // ── Stats animados ───────────────────────────────────────────────────────
    if (profileData) {
        animateValue('stat-itineraries', 0, profileData.itinerary_count || 0, 900);
        renderPreferences(profileData.preferences || []);
    }
    const activeRes = Array.isArray(reservations) ? reservations.filter(r => r.status !== 'cancelled').length : 0;
    animateValue('stat-reviews', 0, activeRes, 900);
    animateValue('stat-places', 0, Array.isArray(wishlist) ? wishlist.length : 0, 900);

    // ── Ranking dinâmico ─────────────────────────────────────────────────────
    const totalActivity = (profileData?.itinerary_count || 0) + activeRes + (Array.isArray(wishlist) ? wishlist.length : 0);
    renderRanking(totalActivity);

    // ── Seções ───────────────────────────────────────────────────────────────
    renderUpcomingEvents(events);
    renderWishlistOnDash(wishlist);
    renderRecentReservations(reservations, userId);
    initMiniMap();
    initCategoryExplorer();
});

// ── API helpers ──────────────────────────────────────────────────────────────
async function fetchProfile() {
    try {
        const res = await fetch(`${API_URL_DASH}/users/profile`, { headers: TourIn.getAuthHeaders() });
        return res.ok ? await res.json() : null;
    } catch { return null; }
}

async function fetchReservations(userId) {
    const token = localStorage.getItem('token');
    if (!userId || !token) return [];
    try {
        const res = await fetch(`${API_URL_DASH}/reservations/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

async function fetchWishlist() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
        const res = await fetch(`${API_URL_DASH}/wishlist/mine`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? await res.json() : [];
    } catch { return []; }
}

async function fetchUpcomingEvents() {
    try {
        const res = await fetch(`${API_URL_DASH}/events?limit=6`);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : (data.events || []);
    } catch { return []; }
}

// ── Preferências ─────────────────────────────────────────────────────────────
function renderPreferences(prefs) {
    const prefEl = document.getElementById('user-preferences');
    if (!prefEl) return;
    const labels = { gastronomy:'🍽️ Gastronomia', nightlife:'🎉 Noite', culture:'🎭 Cultura', nature:'🌳 Natureza', sports:'⚽ Esportes', tourism:'🏛️ Turismo', music:'🎵 Música' };
    prefEl.innerHTML = prefs.length
        ? prefs.map(p => `<span class="pref-badge">${labels[p] || p}</span>`).join('')
        : '<span style="color:var(--text-muted);font-size:.85rem;">Nenhuma preferência. <a href="profile.html">Configurar</a></span>';
}

// ── Ranking ──────────────────────────────────────────────────────────────────
function renderRanking(total) {
    const el = document.getElementById('stat-ranking');
    if (!el) return;
    let level = 'Nível 1', badge = '🌱';
    if (total >= 5)  { level = 'Nível 2'; badge = '🗺️'; }
    if (total >= 10) { level = 'Nível 3'; badge = '⭐'; }
    if (total >= 20) { level = 'Nível 4'; badge = '🏆'; }
    if (total >= 50) { level = 'Explorador'; badge = '🚀'; }
    el.innerHTML = `${badge} ${level}`;
}

// ── Eventos Próximos ─────────────────────────────────────────────────────────
function renderUpcomingEvents(events) {
    const container = document.getElementById('upcoming-events');
    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:.9rem;">Nenhum evento próximo. <a href="events.html" style="color:var(--accent-primary);">Ver todos</a></p>`;
        return;
    }

    const catIcons = { gastronomy:'🍽️', culture:'🎭', music:'🎵', sports:'⚽', nature:'🌿', nightlife:'🎉', education:'📚', tourism:'🏛️' };

    container.innerHTML = events.slice(0, 6).map(ev => {
        const date = ev.date ? new Date(ev.date).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' }) : '';
        const icon = catIcons[ev.category] || '📅';
        return `
        <div class="event-dash-card" onclick="window.location.href='events.html'" title="${ev.title}">
            <div class="event-dash-icon">${icon}</div>
            <div class="event-dash-info">
                <div class="event-dash-title">${ev.title}</div>
                <div class="event-dash-meta">${date} • ${ev.location ? ev.location.split(',')[0] : 'Brasília'}</div>
            </div>
            <button class="event-dash-save" onclick="event.stopPropagation(); dashSaveEvent(${ev.id})" title="Salvar na wishlist">❤️</button>
        </div>`;
    }).join('');
}

window.dashSaveEvent = async (eventId) => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
        const res  = await fetch(`${API_URL_DASH}/wishlist/add`, { method:'POST', headers, body: JSON.stringify({ event_id: eventId }) });
        const data = await res.json();
        dashToast(data.success ? '❤️ Evento salvo na wishlist!' : (data.error?.includes('já salvo') ? 'Já está na wishlist!' : 'Erro ao salvar.'));
        if (data.success) {
            const wl = await fetchWishlist();
            animateValue('stat-places', 0, Array.isArray(wl) ? wl.length : 0, 600);
            renderWishlistOnDash(wl);
        }
    } catch { dashToast('Erro de conexão.', 'error'); }
};

// ── Wishlist no Dashboard ─────────────────────────────────────────────────────
function renderWishlistOnDash(items) {
    const container = document.getElementById('home-wishlist');
    if (!container) return;

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
                    onclick="window.location.href='${isEvent ? 'events.html' : 'explore.html'}'">
                    📍 Ver
                </button>
                <button class="btn small"
                    style="padding:8px;font-size:.78rem;background:rgba(235,87,87,.1);border-color:rgba(235,87,87,.3);color:#eb5757;"
                    onclick="dashRemoveWishlist(${item.wishlist_id})"
                    aria-label="Remover da wishlist">
                    🗑️
                </button>
            </div>
        </div>`;
    }).join('');
}

window.dashRemoveWishlist = async (wishlistId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res  = await fetch(`${API_URL_DASH}/wishlist/${wishlistId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            dashToast('Removido da wishlist');
            const wl = await fetchWishlist();
            animateValue('stat-places', 0, Array.isArray(wl) ? wl.length : 0, 600);
            renderWishlistOnDash(wl);
        } else {
            dashToast(data.error || 'Erro ao remover.', 'error');
        }
    } catch { dashToast('Erro de conexão.', 'error'); }
};

// ── Reservas no Dashboard ─────────────────────────────────────────────────────
function renderRecentReservations(reservations, userId) {
    const container = document.getElementById('home-reservations');
    if (!container) return;

    if (!Array.isArray(reservations) || reservations.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:.9rem;">Você não tem reservas ainda. <a href="explore.html" style="color:var(--accent-primary);">Fazer reserva</a></p>`;
        return;
    }

    const active = reservations.filter(r => r.status !== 'cancelled');
    if (active.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);font-size:.9rem;">Nenhuma reserva ativa. <a href="explore.html" style="color:var(--accent-primary);">Fazer reserva</a></p>`;
        return;
    }

    const statusLabel = { pending:'⏳ Pendente', confirmed:'✅ Confirmada', cancelled:'❌ Cancelada' };
    const statusColor = { pending:'#f2c94c', confirmed:'#27ae60', cancelled:'#eb5757' };

    container.innerHTML = active.slice(0, 4).map(r => {
        const name = r.name || r.place_name || r.event_title || 'Reserva';
        const date = r.reservation_date ? new Date(r.reservation_date).toLocaleDateString('pt-BR') : '';
        const st   = r.status || 'pending';
        return `
        <div class="reservation-card">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div style="flex:1;min-width:0;">
                    <div style="font-weight:700;font-size:.95rem;color:var(--text-main);margin-bottom:5px;">${name}</div>
                    <div style="font-size:.8rem;color:var(--text-muted);">📅 ${date} • 👥 ${r.people || 1} pessoa(s)</div>
                    ${r.location ? `<div style="font-size:.78rem;color:var(--text-muted);margin-top:3px;">📍 ${r.location}</div>` : ''}
                    ${r.notes    ? `<div style="font-size:.78rem;color:var(--text-muted);margin-top:3px;">📝 ${r.notes}</div>` : ''}
                </div>
                <span style="font-size:.75rem;font-weight:700;color:${statusColor[st]};background:${statusColor[st]}22;padding:4px 10px;border-radius:20px;white-space:nowrap;flex-shrink:0;">${statusLabel[st]||st}</span>
            </div>
            <button onclick="dashCancelReservation(${r.id}, ${userId})"
                style="margin-top:12px;padding:7px 14px;background:rgba(255,70,70,.1);border:1px solid rgba(255,70,70,.3);border-radius:10px;color:#ff4646;cursor:pointer;font-size:.8rem;font-weight:700;">
                🚫 Cancelar
            </button>
        </div>`;
    }).join('');
}

window.dashCancelReservation = async (reservationId, userId) => {
    if (!confirm('Cancelar esta reserva?')) return;
    const token = localStorage.getItem('token');
    try {
        const res  = await fetch(`${API_URL_DASH}/reservations/${reservationId}/cancel`, {
            method: 'PATCH',
            headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ user_id: userId })
        });
        const data = await res.json();
        if (data.success) {
            dashToast('Reserva cancelada.');
            const reservations = await fetchReservations(userId);
            const activeRes = reservations.filter(r => r.status !== 'cancelled').length;
            animateValue('stat-reviews', 0, activeRes, 600);
            renderRecentReservations(reservations, userId);
        }
    } catch { dashToast('Erro de conexão.', 'error'); }
};

// ── Mini Mapa ────────────────────────────────────────────────────────────────
function initMiniMap() {
    const container = document.getElementById('mini-map');
    if (!container || typeof L === 'undefined') return;

    const map = L.map('mini-map', { zoomControl: false, attributionControl: false }).setView([-15.7942, -47.8825], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude: lat, longitude: lng } = pos.coords;
            map.setView([lat, lng], 14);
            L.marker([lat, lng]).addTo(map).bindPopup('<b>Você está aqui</b>');
            loadNearbyOnMiniMap(map, lat, lng);
        }, () => loadNearbyOnMiniMap(map, -15.7942, -47.8825));
    } else {
        loadNearbyOnMiniMap(map, -15.7942, -47.8825);
    }

    setTimeout(() => map.invalidateSize(), 300);
}

async function loadNearbyOnMiniMap(map, lat, lng) {
    try {
        const res = await fetch(`${API_URL_DASH}/places?lat=${lat}&lon=${lng}&radius=10`);
        if (!res.ok) return;
        const places = await res.json();
        if (!Array.isArray(places)) return;
        const catColors = { gastronomy:'#f2994a', culture:'#9b51e0', nature:'#27ae60', nightlife:'#eb5757', tourism:'#2d9cdb' };
        places.slice(0, 8).forEach(p => {
            if (!p.lat || !p.lon) return;
            const color = catColors[p.category] || '#00f2ff';
            const icon  = L.divIcon({
                html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.4);"></div>`,
                className: '', iconSize: [12,12], iconAnchor: [6,6]
            });
            L.marker([p.lat, p.lon], { icon }).addTo(map).bindPopup(`<b>${p.name}</b><br><span style="font-size:.75rem;">${p.category}</span>`);
        });
    } catch {}
}

// ── Explorar por Categoria ────────────────────────────────────────────────────
function initCategoryExplorer() {
    document.querySelectorAll('[data-cat-explore]').forEach(btn => {
        btn.addEventListener('click', () => {
            window.location.href = `explore.html?cat=${encodeURIComponent(btn.dataset.catExplore)}`;
        });
    });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTs = null;
    const step = (ts) => {
        if (!startTs) startTs = ts;
        const progress = Math.min((ts - startTs) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function dashToast(msg, type = 'success') {
    let t = document.getElementById('_dash_toast');
    if (!t) {
        t = document.createElement('div'); t.id = '_dash_toast';
        Object.assign(t.style, { position:'fixed', bottom:'30px', right:'30px', padding:'14px 22px',
            borderRadius:'14px', fontWeight:'700', fontSize:'.9rem', zIndex:'9999',
            backdropFilter:'blur(12px)', border:'1px solid var(--glass-border)',
            boxShadow:'0 8px 30px rgba(0,0,0,.3)', transition:'opacity .3s' });
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = type === 'success' ? 'var(--accent-primary)' : '#eb5757';
    t.style.color      = type === 'success' ? '#000' : '#fff';
    t.style.opacity    = '1';
    clearTimeout(t._t);
    t._t = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}
