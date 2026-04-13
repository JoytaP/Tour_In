document.addEventListener('DOMContentLoaded', () => {
    if (typeof L === 'undefined') return;

    // --- VARIÁVEIS DE ESTADO ---
    let map = null;
    let markersLayer = null;
    let userMarker = null;
    // Padrão inicial (Brasília):
    let userLat = -15.793889; 
    let userLng = -47.882778; 
    let hasGPS = false;

    // --- 1. INICIALIZAR MAPA ---
    function initMap() {
        map = L.map('map-interactive').setView([userLat, userLng], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);

        markersLayer = L.featureGroup().addTo(map);
        
        setTimeout(() => map.invalidateSize(), 200);

        // Tenta pegar GPS
        locateUser();
    }

    // --- 2. GEOLOCALIZAÇÃO ---
    function locateUser() {
        // Corrigido: ID agora bate com o HTML
        const badge = document.getElementById('loading-badge');
        if(badge) { badge.style.display = 'block'; badge.innerText = "Localizando..."; }

        if (!navigator.geolocation) {
            if(badge) badge.style.display = 'none';
            alert("Geolocalização não suportada pelo seu navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                hasGPS = true;

                map.setView([userLat, userLng], 15);
                
                if (userMarker) map.removeLayer(userMarker);
                userMarker = L.marker([userLat, userLng], { zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup("<b>Você está aqui</b>")
                    .openPopup();
                
                // Busca inicial baseada na posição real
                searchUnified('restaurante');
                
                if(badge) badge.style.display = 'none';
            },
            (err) => { 
                console.error(err);
                if(badge) {
                    badge.innerText = "Localização negada. Usando padrão.";
                    setTimeout(() => badge.style.display = 'none', 3000);
                }
            },
            { enableHighAccuracy: true }
        );
    }

    // --- 3. BUSCA UNIFICADA (RESTRIÇÃO GEOGRÁFICA CORRIGIDA) ---
    async function searchUnified(query) {
        const list = document.getElementById('results-list');
        list.innerHTML = '<div class="text-center p-4"><p>Pesquisando em sua região...</p></div>';
        
        markersLayer.clearLayers();

        try {
            // A. Busca no Seu Backend - Agora enviando lat/lng para filtrar no banco
            const localPromise = fetch(`${API_URL}/companies/search?q=${encodeURIComponent(query)}&lat=${userLat}&lng=${userLng}`)
                .then(res => res.json())
                .catch(() => []);

            // B. Busca no OpenStreetMap (Nominatim)
            // Ajustado: delta menor (0.02 ~ 2km) e bounded=1 para FORÇAR a região
            const delta = 0.02; 
            const viewbox = `${userLng-delta},${userLat+delta},${userLng+delta},${userLat-delta}`;
            
            // O parâmetro 'bounded=1' obriga a busca a ficar dentro do viewbox
            const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${viewbox}&bounded=1&limit=15&addressdetails=1`;
            
            const osmPromise = fetch(osmUrl)
                .then(res => res.json())
                .catch(() => []);

            const [localData, osmData] = await Promise.all([localPromise, osmPromise]);

            renderResults(localData, osmData);

        } catch (error) {
            console.error(error);
            list.innerHTML = '<p class="text-center text-error">Erro na busca.</p>';
        }
    }

    // --- 4. RENDERIZAÇÃO ---
    function renderResults(localPlaces, osmPlaces) {
        const list = document.getElementById('results-list');
        list.innerHTML = '';
        const seenIds = new Set();

        // Parceiros Tour.In
        if (Array.isArray(localPlaces)) {
            localPlaces.forEach(place => {
                let thumb = null;
                try {
                    const photos = typeof place.photos === 'string' ? JSON.parse(place.photos) : place.photos;
                    if (photos && photos.length > 0) thumb = `${API_URL}/${photos[0]}`;
                } catch(e) {}

                createCard({
                    id: 'local_' + place.id,
                    name: place.name,
                    info: `⭐ Parceiro • ${place.category || 'Destaque'}`,
                    lat: place.lat,
                    lon: place.lon,
                    isPartner: true,
                    thumb: thumb
                });
            });
        }

        // Resultados Gerais (OSM)
        if (Array.isArray(osmPlaces)) {
            osmPlaces.forEach(place => {
                if (seenIds.has(place.place_id)) return;
                seenIds.add(place.place_id);

                const name = place.name || place.display_name.split(',')[0];
                const address = place.address.suburb || place.address.city || "Próximo a você";

                createCard({
                    id: place.place_id,
                    name: name,
                    info: address,
                    lat: place.lat,
                    lon: place.lon,
                    isPartner: false,
                    thumb: null
                });
            });
        }

        if (list.children.length === 0) {
            list.innerHTML = '<div class="text-center p-4">Nenhum local encontrado nesta área.</div>';
        } else {
            // Ajusta o zoom apenas se houver muitos resultados distantes
            if (markersLayer.getBounds().isValid()) {
                map.fitBounds(markersLayer.getBounds(), { padding: [40, 40], maxZoom: 16 });
            }
        }
    }

    function createCard(data) {
        const list = document.getElementById('results-list');
        const iconEmoji = data.isPartner ? '👑' : '📍';
        const styleClass = data.isPartner ? 'border-left: 4px solid #ffcc00; background: #fffdf0;' : 'background: var(--bg-card);';

        let imgHtml = '';
        if (data.thumb) {
            const cleanThumb = data.thumb.replace(/\\/g, '/');
            imgHtml = `<div style="width:100%; height:110px; background: url('${cleanThumb}') center/cover; border-radius: 5px; margin-bottom: 8px;"></div>`;
        }

        const card = document.createElement('div');
        card.className = 'card mb-2';
        card.style = `padding: 12px; cursor: pointer; border-radius: 8px; transition: 0.2s; ${styleClass}`;
        card.innerHTML = `
            ${imgHtml}
            <div style="font-weight: 600; font-size: 0.95rem;">${iconEmoji} ${data.name}</div>
            <div class="text-secondary small mb-2">${data.info}</div>
            <div style="display: flex; gap: 8px;">
                <button class="btn small ghost" style="padding: 4px 8px; font-size: 0.75rem;" onclick="focusOnMap(${data.lat}, ${data.lon}, '${data.name}')">📍 Ver</button>
                <button class="btn small" style="padding: 4px 8px; font-size: 0.75rem;" onclick="addToItinerary('${data.id}', '${data.name}', 'place')">➕ Roteiro</button>
            </div>
        `;
        
        card.onclick = () => focusOnMap(data.lat, data.lon, data.name);
        list.appendChild(card);

        // Marcador no Mapa
        const marker = L.marker([data.lat, data.lon])
            .bindPopup(`<b>${data.name}</b><br>${data.info}`);
        markersLayer.addLayer(marker);
    }

    window.focusOnMap = (lat, lng, title) => {
        map.flyTo([lat, lng], 17);
        L.popup().setLatLng([lat, lng]).setContent(`<b>${title}</b>`).openOn(map);
        if(window.innerWidth < 768) {
            document.getElementById('map-interactive').scrollIntoView({behavior:'smooth'});
        }
    };

    window.searchNearby = (category) => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        if(event && event.target) event.target.classList.add('active');

        const mapTerms = { 
            'restaurante': 'restaurant', 
            'bar': 'pub', 
            'turismo': 'tourism', 
            'parque': 'park', 
            'hotel': 'hotel' 
        };
        const term = mapTerms[category] || category;
        document.getElementById('search-input').value = category.charAt(0).toUpperCase() + category.slice(1);
        searchUnified(term);
    };

    document.getElementById('btn-search').addEventListener('click', () => {
        const val = document.getElementById('search-input').value;
        if(val) searchUnified(val);
    });
    
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') searchUnified(e.target.value);
    });
    
    document.getElementById('btn-geo').addEventListener('click', locateUser);

    initMap();
});