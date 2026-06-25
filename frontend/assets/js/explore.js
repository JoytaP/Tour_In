document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined') return;

    // ── Estado ──────────────────────────────────────────────────────────────
    let map, markersLayer, userMarker, nearbyLayer;
    let userLat = -15.7942, userLng = -47.8825; // Brasília padrão
    let allPlaces = []; // cache de locais do banco

    // ── Lê parâmetro de categoria da URL (vindo do dashboard) ────────────────
    const urlParams = new URLSearchParams(window.location.search);
    const urlCat = urlParams.get('cat');
    if (urlCat) {
        document.addEventListener('mapReady', () => searchNearby(urlCat), { once: true });
    }

    // ── 1. Inicializa o mapa ─────────────────────────────────────────────────
    function initMap() {
        map = L.map('map-interactive').setView([userLat, userLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        markersLayer = L.featureGroup().addTo(map);
        nearbyLayer = L.featureGroup().addTo(map);
        setTimeout(() => map.invalidateSize(), 200);
        locateUser();
    }

    // ── 2. Geolocalização ────────────────────────────────────────────────────
    function locateUser() {
        const badge = document.getElementById('loading-badge');
        if (badge) { badge.style.display = 'block'; badge.innerText = 'Localizando...'; }

        if (!navigator.geolocation) {
            if (badge) badge.style.display = 'none';
            loadAndRender('');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                map.setView([userLat, userLng], 15);

                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker([userLat, userLng], { zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup('<b>Você está aqui</b>').openPopup();

                if (badge) badge.style.display = 'none';
                loadAndRender('');
                loadNearbyEstablishments();
                document.dispatchEvent(new Event('mapReady'));
            },
            (err) => {
                console.warn('GPS negado:', err.message);
                if (badge) { badge.innerText = 'Usando localização padrão (BSB).'; setTimeout(() => badge.style.display = 'none', 3000); }
                loadAndRender('');
                loadNearbyEstablishments();
                document.dispatchEvent(new Event('mapReady'));
            },
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }

    // ── 3. Carrega locais do banco + OSM e renderiza ──────────────────────────
    async function loadAndRender(query) {
        const list = document.getElementById('results-list');
        list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">Buscando locais...</div>';
        markersLayer.clearLayers();

        const [dbPlaces, osmPlaces, dbEvents] = await Promise.all([
            fetchDBPlaces(query),
            fetchOSMPlaces(query),
            fetchDBEvents(query)
        ]);

        allPlaces = dbPlaces;
        renderResults(dbPlaces, osmPlaces);
        renderEventsOnMap(dbEvents);
    }

    // ── Busca eventos no banco ────────────────────────────────────────────────
    async function fetchDBEvents(query) {
        try {
            const params = new URLSearchParams({ q: query || '' });
            const res = await fetch(`${API_URL}/events?${params}`);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data.events || data) ? (data.events || data) : [];
        } catch (e) { return []; }
    }

    // ── Exibe eventos no mapa com marcador diferenciado ───────────────────────
    function renderEventsOnMap(events) {
        if (!events || !events.length) return;
        const eventIcon = L.divIcon({
            html: '<div style="font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5));">🎉</div>',
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        events.forEach(ev => {
            if (!ev.lat && !ev.lon) return; // skip if no coords
            const marker = L.marker([ev.lat, ev.lon], { icon: eventIcon }).addTo(markersLayer);
            const date = ev.date ? new Date(ev.date).toLocaleDateString('pt-BR') : '';
            marker.bindPopup(`
                <div style="min-width:200px;">
                    <b style="color:#222;">${ev.title}</b><br>
                    <span style="color:#666;font-size:.8rem;">${ev.category || 'Evento'} • ${date}</span><br>
                    <span style="font-size:.8rem;">${ev.location || ''}</span><br>
                    <div style="margin-top:8px;display:flex;gap:6px;">
                      <button onclick="saveToWishlist(null, ${ev.id})"
                        style="flex:1;padding:5px;background:#ffeef0;border:1px solid #ffb3b3;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;">
                        ❤️ Salvar
                      </button>
                      <button onclick="openReservationModal(${ev.id}, 'event', '${(ev.title||'').replace(/'/g,'')}')"
                        style="flex:1;padding:5px;background:#e8f8ff;border:1px solid #b3e5f5;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;">
                        📅 Reservar
                      </button>
                    </div>
                </div>
            `);
        });
    }

    // ── 4. Busca locais no banco (com coordenadas do usuário) ─────────────────
    async function fetchDBPlaces(query) {
        try {
            const params = new URLSearchParams({ lat: userLat, lon: userLng, radius: 50, q: query });
            const res = await fetch(`${API_URL}/places?${params}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    }

    // ── 5. Busca no OpenStreetMap (Nominatim) ─────────────────────────────────
    async function fetchOSMPlaces(query) {
        if (!query) return [];
        try {
            const delta = 0.08;
            const viewbox = `${userLng-delta},${userLat+delta},${userLng+delta},${userLat-delta}`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&limit=12&addressdetails=1`;
            const res = await fetch(url);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    }

    // ── 5b. Estabelecimentos próximos via Overpass API ────────────────────────
    async function loadNearbyEstablishments(radiusMeters = 1500) {
        nearbyLayer.clearLayers();
        const badge = document.getElementById('loading-badge');
        if (badge) { badge.style.display = 'block'; badge.innerText = 'Carregando estabelecimentos próximos...'; }

        // Tipos de estabelecimento que queremos mostrar
        const amenities = ['restaurant','cafe','bar','fast_food','pub','nightclub','food_court'];
        const tourisms  = ['museum','gallery','artwork','viewpoint','attraction','hotel'];
        const leisures  = ['park','garden','stadium','swimming_pool'];

        const amenityFilter = amenities.map(a => `node["amenity"="${a}"](around:${radiusMeters},${userLat},${userLng});`).join('\n');
        const tourismFilter  = tourisms.map(t  => `node["tourism"="${t}"](around:${radiusMeters},${userLat},${userLng});`).join('\n');
        const leisureFilter  = leisures.map(l  => `node["leisure"="${l}"](around:${radiusMeters},${userLat},${userLng});`).join('\n');

        const overpassQuery = `
[out:json][timeout:15];
(
  ${amenityFilter}
  ${tourismFilter}
  ${leisureFilter}
);
out body 60;`;

        try {
            const res = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                body: overpassQuery
            });
            if (!res.ok) throw new Error('Overpass error');
            const data = await res.json();
            const elements = data.elements || [];

            // Ícone e cor por tipo
            const typeMap = {
                restaurant:'🍽️', cafe:'☕', bar:'🍺', fast_food:'🍔', pub:'🍻',
                nightclub:'🎶', food_court:'🍱',
                museum:'🏛️', gallery:'🖼️', artwork:'🎨', viewpoint:'👁️',
                attraction:'⭐', hotel:'🏨',
                park:'🌳', garden:'🌸', stadium:'🏟️', swimming_pool:'🏊'
            };
            const colorMap = {
                restaurant:'#f2994a', cafe:'#a07850', bar:'#e57373', fast_food:'#ff9800',
                pub:'#c49a6c', nightclub:'#ab47bc', food_court:'#f06292',
                museum:'#5c6bc0', gallery:'#7c4dff', artwork:'#ec407a', viewpoint:'#26c6da',
                attraction:'#ffd54f', hotel:'#42a5f5',
                park:'#66bb6a', garden:'#aed581', stadium:'#26a69a', swimming_pool:'#29b6f6'
            };

            let addedNames = new Set();
            elements.forEach(el => {
                const name = el.tags?.name;
                if (!name || addedNames.has(name)) return;
                addedNames.add(name);

                const type = el.tags?.amenity || el.tags?.tourism || el.tags?.leisure || 'place';
                const icon = typeMap[type] || '📍';
                const color = colorMap[type] || '#90a4ae';

                const divIcon = L.divIcon({
                    html: `<div style="background:${color};border:2px solid #fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.35);">${icon}</div>`,
                    className: '', iconSize: [28,28], iconAnchor: [14,14]
                });

                const addr = [el.tags?.['addr:street'], el.tags?.['addr:housenumber']].filter(Boolean).join(' ');

                // Serializa dados do lugar para passar no onclick (sem aspas no JSON)
                const osmData = JSON.stringify({
                    name:     name,
                    type:     type,
                    category: type,
                    address:  addr || '',
                    lat:      el.lat,
                    lon:      el.lon
                }).replace(/"/g, '&quot;');

                const popupContent = `
                    <div style="min-width:180px;">
                        <b style="color:#222;">${escapeHtml(name)}</b><br>
                        <span style="color:#666;font-size:.78rem;">${type}</span>
                        ${addr ? `<br><span style="font-size:.75rem;color:#888;">${escapeHtml(addr)}</span>` : ''}
                        ${el.tags?.opening_hours ? `<br><span style="font-size:.73rem;color:#777;">🕐 ${escapeHtml(el.tags.opening_hours)}</span>` : ''}
                        ${el.tags?.website ? `<br><a href="${escapeHtml(el.tags.website)}" target="_blank" style="font-size:.73rem;color:#2563eb;">🌐 Site</a>` : ''}
                        <div style="margin-top:8px;display:flex;gap:6px;">
                            <button onclick="saveOSMToWishlist('${escapeHtml(name)}','${type}','${addr}',${el.lat},${el.lon})"
                                style="flex:1;padding:5px 8px;background:#ffeef0;border:1px solid #ffb3b3;border-radius:8px;cursor:pointer;font-size:.75rem;font-weight:700;">
                                ❤️ Wishlist
                            </button>
                            <button onclick="addToItinerary(null,'${escapeHtml(name)}','place')"
                                style="flex:1;padding:5px 8px;background:#e8f8ff;border:1px solid #b3e5f5;border-radius:8px;cursor:pointer;font-size:.75rem;font-weight:700;">
                                📋 Roteiro
                            </button>
                        </div>
                    </div>`;

                L.marker([el.lat, el.lon], { icon: divIcon })
                    .addTo(nearbyLayer)
                    .bindPopup(popupContent);
            });

            // Atualiza badge com contagem
            if (badge) {
                const count = addedNames.size;
                if (count > 0) {
                    badge.innerText = `📍 ${count} estabelecimentos próximos`;
                    badge.style.display = 'block';
                    setTimeout(() => badge.style.display = 'none', 4000);
                } else {
                    badge.style.display = 'none';
                }
            }

            // Atualiza contador na sidebar
            const nearbyCount = document.getElementById('nearby-count');
            if (nearbyCount) nearbyCount.textContent = addedNames.size;

        } catch(e) {
            console.warn('Overpass falhou:', e.message);
            if (badge) badge.style.display = 'none';
        }
    }

    // Expõe para filtros na sidebar
    window.toggleNearby = (show) => {
        if (show) nearbyLayer.addTo(map);
        else map.removeLayer(nearbyLayer);
    };

    // ── 6. Renderiza resultado ────────────────────────────────────────────────
    function renderResults(dbPlaces, osmPlaces) {
        const list = document.getElementById('results-list');
        list.innerHTML = '';

        // ─ Parceiros / Locais cadastrados no banco ─
        if (dbPlaces.length) {
            const header = document.createElement('p');
            header.style.cssText = 'font-size:.7rem;font-weight:800;text-transform:uppercase;color:var(--accent-primary);margin:0 0 12px;padding:0 4px;';
            header.textContent = `📍 Locais cadastrados (${dbPlaces.length})`;
            list.appendChild(header);

            dbPlaces.forEach(place => {
                if (!place.lat || !place.lon) return;
                createDBCard(place);
                createDBMarker(place);
            });
        }

        // ─ Resultados OSM ─
        if (osmPlaces.length) {
            const header = document.createElement('p');
            header.style.cssText = 'font-size:.7rem;font-weight:800;text-transform:uppercase;color:var(--text-muted);margin:12px 0 12px;padding:0 4px;';
            header.textContent = `🗺️ Outros locais (${osmPlaces.length})`;
            list.appendChild(header);
            osmPlaces.forEach(place => createOSMCard(place));
        }

        if (!list.children.length) {
            list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">Nenhum local encontrado nesta área.</div>';
            return;
        }

        if (markersLayer.getLayers().length > 0 && markersLayer.getBounds().isValid()) {
            map.fitBounds(markersLayer.getBounds(), { padding: [50, 50], maxZoom: 16 });
        }
    }

    // ── 7. Card para local do banco ───────────────────────────────────────────
    function createDBCard(place) {
        const list = document.getElementById('results-list');
        const stars = renderStars(place.avg_rating);
        const catLabel = { gastronomy:'🍽️',culture:'🎭',nature:'🌳',nightlife:'🎉',tourism:'🗺️' }[place.category] || '📍';

        const card = document.createElement('div');
        card.style.cssText = `
            padding:14px;cursor:pointer;border-radius:16px;margin-bottom:10px;
            background:rgba(0,242,255,0.04);border:1px solid rgba(0,242,255,0.2);
            transition:0.2s;`;
        card.onmouseenter = () => card.style.borderColor = 'var(--accent-primary)';
        card.onmouseleave = () => card.style.borderColor = 'rgba(0,242,255,0.2)';

        let imgHtml = '';
        if (place.image_url) {
            const src = place.image_url.startsWith('/') ? `${(typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api').replace(/\/api$/, '')}${place.image_url}` : place.image_url;
            imgHtml = `<img src="${src}" style="width:100%;height:100px;object-fit:cover;border-radius:10px;margin-bottom:10px;" onerror="this.style.display='none'">`;
        }

        card.innerHTML = `
            ${imgHtml}
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;">
                    <div style="font-weight:700;font-size:.95rem;color:#fff;margin-bottom:4px;">
                        ${catLabel} ${escapeHtml(place.name)}
                    </div>
                    <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:6px;">${escapeHtml(place.address || '')}</div>
                    <div style="display:flex;align-items:center;gap:6px;font-size:.8rem;">
                        ${stars}
                        <span style="color:var(--text-muted);">${place.avg_rating ? place.avg_rating.toFixed(1) : 'Sem avaliações'} (${place.review_count || 0})</span>
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:10px;">
                <button onclick="focusOnMap(${place.lat},${place.lon},'${escapeHtml(place.name)}')"
                    style="flex:1;padding:7px;background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);border-radius:10px;color:#fff;font-size:.75rem;cursor:pointer;">
                    📍 Ver no mapa
                </button>
                <button onclick="openReviewModal(${place.id},'place','${escapeHtml(place.name)}')"
                    style="flex:1;padding:7px;background:rgba(0,242,255,0.1);border:1px solid rgba(0,242,255,0.3);border-radius:10px;color:var(--accent-primary);font-size:.75rem;cursor:pointer;font-weight:700;">
                    ⭐ Avaliar
                </button>
                <button onclick="event.stopPropagation(); saveToWishlist(${place.id})"
                    style="padding:7px 10px;background:rgba(255,100,100,0.12);border:1px solid rgba(255,100,100,0.3);border-radius:10px;color:#ff6464;font-size:.75rem;cursor:pointer;font-weight:700;"
                    aria-label="Salvar ${escapeHtml(place.name)} na wishlist"
                    title="Salvar na Wishlist">
                    ❤️
                </button>
                <button onclick="event.stopPropagation(); openReservationModal(${place.id}, 'place', '${escapeHtml(place.name)}')"
                    style="padding:7px 10px;background:rgba(0,242,255,0.1);border:1px solid rgba(0,242,255,0.3);border-radius:10px;color:var(--accent-primary);font-size:.75rem;cursor:pointer;font-weight:700;"
                    aria-label="Reservar ${escapeHtml(place.name)}"
                    title="Fazer Reserva">
                    📅
                </button>
            </div>`;

        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            focusOnMap(place.lat, place.lon, place.name);
        });
        list.appendChild(card);
    }

    // ── 8. Marcador do banco com popup rico ───────────────────────────────────
    function createDBMarker(place) {
        const catColors = { gastronomy:'#ff9f43',culture:'#a29bfe',nature:'#55efc4',nightlife:'#fd79a8',tourism:'#74b9ff' };
        const color = catColors[place.category] || '#00f2ff';

        const icon = L.divIcon({
            html: `<div style="
                width:38px;height:38px;border-radius:50%;
                background:${color};
                border:3px solid #fff;
                box-shadow:0 2px 8px rgba(0,0,0,0.4);
                display:flex;align-items:center;justify-content:center;
                font-size:16px;">
                ${{ gastronomy:'🍽️',culture:'🎭',nature:'🌳',nightlife:'🎉',tourism:'🗺️' }[place.category] || '📍'}
            </div>`,
            className: '',
            iconSize: [38, 38],
            iconAnchor: [19, 38]
        });

        const stars = renderStars(place.avg_rating);
        const popup = `
            <div style="min-width:200px;">
                <b style="font-size:.95rem;">${escapeHtml(place.name)}</b><br>
                <span style="font-size:.8rem;color:#888;">${escapeHtml(place.category || '')}</span><br>
                <div style="margin:6px 0;">${stars} <span style="font-size:.8rem;">${place.avg_rating ? place.avg_rating.toFixed(1) : '—'} (${place.review_count || 0})</span></div>
                ${place.address ? `<div style="font-size:.78rem;color:#888;margin-bottom:6px;">${escapeHtml(place.address)}</div>` : ''}
                <button onclick="openReviewModal(${place.id},'place','${escapeHtml(place.name)}')"
                    style="width:100%;padding:6px;background:#00f2ff;border:none;border-radius:8px;color:#000;font-weight:700;font-size:.8rem;cursor:pointer;">
                    ⭐ Avaliar este local
                </button>
            </div>`;

        const marker = L.marker([place.lat, place.lon], { icon }).bindPopup(popup);
        markersLayer.addLayer(marker);
    }

    // ── 9. Card OSM genérico ──────────────────────────────────────────────────
    function createOSMCard(place) {
        const list = document.getElementById('results-list');
        const name = place.name || place.display_name.split(',')[0];
        const info = place.address?.suburb || place.address?.city || 'Próximo a você';

        const card = document.createElement('div');
        card.style.cssText = `
            padding:12px;cursor:pointer;border-radius:14px;margin-bottom:8px;
            background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);transition:0.2s;`;
        card.innerHTML = `
            <div style="font-weight:600;font-size:.9rem;color:#fff;margin-bottom:2px;">📍 ${escapeHtml(name)}</div>
            <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:8px;">${escapeHtml(info)}</div>
            <button onclick="focusOnMap(${place.lat},${place.lon},'${escapeHtml(name)}')"
                style="padding:5px 12px;background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);border-radius:8px;color:#fff;font-size:.72rem;cursor:pointer;">
                📍 Ver no mapa
            </button>`;

        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return;
            focusOnMap(place.lat, place.lon, name);
        });
        list.appendChild(card);

        const marker = L.marker([place.lat, place.lon])
            .bindPopup(`<b>${escapeHtml(name)}</b><br><span style="font-size:.8rem;">${escapeHtml(info)}</span>`);
        markersLayer.addLayer(marker);
    }

    // ── 10. Modal de avaliação ────────────────────────────────────────────────
    window.openReviewModal = async (targetId, type, name) => {
        const token = localStorage.getItem('token');
        if (!token) {
            showToast('Faça login para avaliar este local.', true);
            window.location.href = 'login.html';
            return;
        }

        // Carrega avaliações existentes
        const endpoint = type === 'place'
            ? `${API_URL}/places/${targetId}/reviews`
            : `${API_URL}/events/${targetId}/reviews`;

        let reviews = [];
        try { reviews = await (await fetch(endpoint)).json(); } catch(e) {}

        // Cria ou atualiza modal
        let modal = document.getElementById('review-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'review-modal';
            modal.style.cssText = `
                position:fixed;inset:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);
                z-index:9999;display:flex;align-items:center;justify-content:center;`;
            document.body.appendChild(modal);
        }

        const reviewsHtml = reviews.length
            ? reviews.map(r => `
                <div style="padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:12px;margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                        <strong style="font-size:.85rem;">${escapeHtml(r.user_name)}</strong>
                        <span>${renderStars(r.rating)}</span>
                    </div>
                    ${r.comment ? `<p style="font-size:.82rem;color:var(--text-muted);margin:0;">${escapeHtml(r.comment)}</p>` : ''}
                    <small style="color:var(--text-muted);font-size:.72rem;">${new Date(r.created_at).toLocaleDateString('pt-BR')}</small>
                </div>`).join('')
            : '<p style="color:var(--text-muted);text-align:center;font-size:.85rem;">Seja o primeiro a avaliar!</p>';

        modal.innerHTML = `
            <div style="background:#111;border:1px solid var(--glass-border);border-radius:28px;padding:32px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                    <h3 style="font-weight:800;margin:0;">${escapeHtml(name)}</h3>
                    <button onclick="document.getElementById('review-modal').remove()"
                        style="background:none;border:none;color:#fff;font-size:1.3rem;cursor:pointer;line-height:1;">✕</button>
                </div>

                <h4 style="font-size:.8rem;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;font-weight:800;">Avaliações (${reviews.length})</h4>
                <div id="reviews-list-modal" style="max-height:200px;overflow-y:auto;margin-bottom:20px;">
                    ${reviewsHtml}
                </div>

                <div style="border-top:1px solid var(--glass-border);padding-top:20px;">
                    <h4 style="font-size:.8rem;text-transform:uppercase;color:var(--text-muted);margin-bottom:14px;font-weight:800;">Deixe sua avaliação</h4>
                    <div style="display:flex;gap:6px;margin-bottom:14px;" id="star-selector">
                        ${[1,2,3,4,5].map(n =>
                            `<button type="button" data-star="${n}" onclick="selectStar(${n})"
                                style="font-size:1.6rem;background:none;border:none;cursor:pointer;opacity:.4;transition:.15s;">⭐</button>`
                        ).join('')}
                    </div>
                    <textarea id="review-comment" placeholder="Conte sua experiência... (opcional)"
                        style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid var(--glass-border);
                               border-radius:14px;color:#fff;font-family:inherit;font-size:.9rem;resize:vertical;min-height:80px;box-sizing:border-box;"></textarea>
                    <button id="submit-review-btn" onclick="submitReview(${targetId},'${type}')"
                        style="width:100%;margin-top:12px;padding:14px;background:var(--accent-primary);border:none;border-radius:14px;
                               color:#000;font-weight:800;font-size:.95rem;cursor:pointer;">
                        Enviar Avaliação
                    </button>
                </div>
            </div>`;

        // Fecha clicando fora
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    };

    let selectedRating = 0;
    window.selectStar = (n) => {
        selectedRating = n;
        document.querySelectorAll('#star-selector button').forEach((btn, i) => {
            btn.style.opacity = i < n ? '1' : '0.3';
            btn.style.transform = i < n ? 'scale(1.15)' : 'scale(1)';
        });
    };

    window.submitReview = async (targetId, type) => {
        const token = localStorage.getItem('token');
        if (!selectedRating) { showToast('Selecione uma nota de 1 a 5 estrelas.', true); return; }
        const comment = document.getElementById('review-comment')?.value;

        const endpoint = type === 'place'
            ? `${API_URL}/places/${targetId}/reviews`
            : `${API_URL}/events/${targetId}/reviews`;

        const btn = document.getElementById('submit-review-btn');
        btn.textContent = 'Enviando...'; btn.disabled = true;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ rating: selectedRating, comment })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(data.message || 'Avaliação enviada! ⭐');
                document.getElementById('review-modal')?.remove();
                selectedRating = 0;
                // Recarrega os marcadores para atualizar notas
                await loadAndRender(document.getElementById('search-input')?.value || '');
            } else {
                showToast(data.message || 'Erro ao enviar avaliação.', true);
                btn.textContent = 'Enviar Avaliação'; btn.disabled = false;
            }
        } catch(e) {
            showToast('Erro de conexão.', true);
            btn.textContent = 'Enviar Avaliação'; btn.disabled = false;
        }
    };

    // ── Controles de busca ────────────────────────────────────────────────────
    window.focusOnMap = (lat, lon, title) => {
        map.flyTo([lat, lon], 17);
        L.popup().setLatLng([lat, lon]).setContent(`<b>${title}</b>`).openOn(map);
    };

    window.searchNearby = (category) => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        if (event?.target) event.target.classList.add('active');
        const input = document.getElementById('search-input');
        if (input) input.value = category;
        loadAndRender(category);
    };

    document.getElementById('btn-search')?.addEventListener('click', () => {
        const val = document.getElementById('search-input')?.value || '';
        loadAndRender(val);
    });

    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') loadAndRender(e.target.value);
    });

    document.getElementById('btn-geo')?.addEventListener('click', () => {
        locateUser();
        loadNearbyEstablishments();
    });

    // ── Helpers ───────────────────────────────────────────────────────────────
    function renderStars(avg) {
        if (!avg) return '<span style="color:#555;">☆☆☆☆☆</span>';
        const full = Math.round(avg);
        return [1,2,3,4,5].map(n =>
            `<span style="color:${n <= full ? '#ffd32a' : '#555'};font-size:.9rem;">★</span>`
        ).join('');
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function showToast(msg) {
        let t = document.getElementById('_toast');
        if (!t) {
            t = document.createElement('div'); t.id = '_toast';
            t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
                background:#00f2ff;color:#000;padding:12px 24px;border-radius:100px;
                font-weight:700;z-index:99999;`;
            document.body.appendChild(t);
        }
        t.textContent = msg; t.style.display = 'block';
        clearTimeout(t._t); t._t = setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    initMap();
});

// ── saveOSMToWishlist: registra lugar OSM no banco e salva na wishlist ─────────
// Exposto globalmente para uso nos popups do Leaflet
window.saveOSMToWishlist = async (name, type, address, lat, lon) => {
    const token = localStorage.getItem('token');
    if (!token) {
        showToast('Faça login para salvar na wishlist!', true);
        window.location.href = 'pages/login.html';
        return;
    }

    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
    const BASE    = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api';

    // Mapa de tipos OSM → categoria do sistema
    const catMap = {
        restaurant:'gastronomy', cafe:'gastronomy', bar:'nightlife', fast_food:'gastronomy',
        pub:'nightlife', nightclub:'nightlife', food_court:'gastronomy',
        museum:'culture', gallery:'culture', artwork:'culture',
        viewpoint:'tourism', attraction:'tourism', hotel:'tourism',
        park:'nature', garden:'nature', stadium:'sports', swimming_pool:'sports'
    };

    try {
        // 1. Registra o lugar no banco (owner = usuário logado)
        const placeRes = await fetch(`${BASE}/places`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                name,
                description: type,
                category: catMap[type] || 'tourism',
                address,
                lat,
                lon
            })
        });

        let placeId = null;
        if (placeRes.ok) {
            // Resposta do POST /api/places: { success, message, data: { id, ... } }
            const pd = await placeRes.json();
            placeId = pd.data?.id ?? pd.place?.id ?? pd.id ?? null;
        } else {
            // Cadastro falhou — tenta encontrar pelo nome + coordenadas
            const search = await fetch(
                `${BASE}/places?lat=${lat}&lon=${lon}&q=${encodeURIComponent(name)}`,
                { headers }
            );
            if (search.ok) {
                const places = await search.json();
                const found = Array.isArray(places)
                    ? places.find(p => p.name === name)
                    : null;
                if (found) placeId = found.id;
            }
        }

        if (!placeId) {
            showToast('Nao foi possivel registrar o local.', true);
            return;
        }

        // 2. Salva na wishlist
        const wlRes = await fetch(`${BASE}/wishlist/add`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ place_id: placeId })
        });
        const wlData = await wlRes.json();

        // Toast de feedback
        let t = document.getElementById('_toast');
        if (!t) {
            t = document.createElement('div'); t.id = '_toast';
            t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:100px;font-weight:700;z-index:99999;`;
            document.body.appendChild(t);
        }
        if (wlData.success) {
            t.style.background = '#00f2ff'; t.style.color = '#000';
            t.textContent = '❤️ Salvo na wishlist!';
        } else if (wlData.error?.includes('já salvo')) {
            t.style.background = '#333'; t.style.color = '#fff';
            t.textContent = 'Já está na sua wishlist!';
        } else {
            t.style.background = '#eb5757'; t.style.color = '#fff';
            t.textContent = wlData.error || 'Erro ao salvar.';
        }
        t.style.display = 'block';
        clearTimeout(t._t); t._t = setTimeout(() => { t.style.display = 'none'; }, 3000);

    } catch (err) {
        console.error('saveOSMToWishlist erro:', err);
    }
};
