document.addEventListener('DOMContentLoaded', async () => {
    const eventsContainer = document.getElementById('events-list');
    const searchInput = document.getElementById('event-search');
    const categorySelect = document.getElementById('event-category');
    const filterChips = document.querySelectorAll('.filter-chip');

    let allEvents = []; // Armazena todos os eventos para filtrar localmente

    // --- 1. CARREGAR EVENTOS DO SERVIDOR ---
    async function loadEvents() {
        if(eventsContainer) {
            eventsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner"></div><p>Carregando eventos...</p></div>';
        }

        try {
            // Tenta buscar do Backend
            const response = await fetch(`${API_URL}/events`);
            
            if (!response.ok) {
                // Se der erro (ex: backend desligado), lança exceção para cair no catch
                throw new Error('Falha na API');
            }

            allEvents = await response.json();
            renderEvents(allEvents);

        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
            
            // FALLBACK: Se não tiver backend rodando ou der erro, mostra mensagem amigável
            if(eventsContainer) {
                eventsContainer.innerHTML = `
                    <div class="col-12 text-center" style="padding: 40px;">
                        <h3>Ops! Não conseguimos carregar a agenda. 😕</h3>
                        <p class="text-secondary">Verifique sua conexão ou tente novamente mais tarde.</p>
                        <button class="btn secondary small mt-3" onclick="location.reload()">Tentar Novamente</button>
                    </div>`;
            }
        }
    }

    // --- 2. RENDERIZAR NA TELA ---
    function renderEvents(events) {
        if (!eventsContainer) return;
        eventsContainer.innerHTML = '';

        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="col-12 text-center" style="padding: 40px; background: var(--bg-card); border-radius: 10px;">
                    <p class="text-secondary">Nenhum evento encontrado com esses filtros.</p>
                    <button class="btn small ghost mt-2" onclick="clearFilters()">Limpar Busca</button>
                </div>`;
            return;
        }

        events.forEach(event => {
            // Formatar Data e Hora
            const dateObj = new Date(event.date); // Supondo formato ISO do banco
            const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' });

            // Imagem (Placeholder se vier vazio)
            const imgUrl = event.image_url 
                ? (event.image_url.startsWith('http') ? event.image_url : `${API_URL}/${event.image_url}`)
                : 'https://placehold.co/600x400/2a2a2a/FFF?text=Evento';

            // Card HTML
            const card = document.createElement('div');
            card.className = 'card place-card event-card';
            card.innerHTML = `
                <div style="position: relative; height: 180px; margin: -20px -20px 15px -20px;">
                    <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius) var(--radius) 0 0;" alt="${event.title}">
                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: bold;">
                        ${event.category || 'Geral'}
                    </div>
                </div>
                
                <h3 class="place-title" style="margin-bottom: 5px;">${event.title}</h3>
                
                <div style="display: flex; gap: 10px; font-size: 0.9rem; color: var(--primary); margin-bottom: 10px; font-weight: 500;">
                    <span>📅 ${dateStr}</span>
                    <span>⏰ ${timeStr}</span>
                </div>
                
                <p class="place-address text-secondary" style="font-size: 0.85rem; margin-bottom: 10px;">
                    📍 ${event.location || 'Local a definir'}
                </p>
                
                <p class="search-result-description text-secondary" style="font-size: 0.9rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${event.description || 'Sem descrição disponível.'}
                </p>

                <div style="margin-top: auto; padding-top: 15px;">
                    <button class="btn small w-100" onclick="addToItinerary('${event.id}', '${event.title}', 'event')">
                        ➕ Adicionar ao Roteiro
                    </button>
                </div>
            `;
            eventsContainer.appendChild(card);
        });
    }

    // --- 3. FILTRAGEM ---
    function filterEvents() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;

        const filtered = allEvents.filter(event => {
            // Filtro por Texto (Título ou Descrição)
            const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                                  (event.description && event.description.toLowerCase().includes(searchTerm));
            
            // Filtro por Categoria
            // O backend pode retornar categorias em inglês ou português, então ajustamos a lógica se necessário
            const matchesCategory = selectedCategory === 'all' || 
                                    (event.category && event.category.toLowerCase().includes(selectedCategory));

            return matchesSearch && matchesCategory;
        });

        renderEvents(filtered);
    }

    // Eventos dos Inputs
    searchInput.addEventListener('input', filterEvents);
    categorySelect.addEventListener('change', filterEvents);

    // Eventos dos Chips (Tags rápidas)
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Atualiza visual
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            // Atualiza o select e filtra
            const cat = chip.dataset.cat;
            categorySelect.value = cat;
            filterEvents();
        });
    });

    // Função global para limpar filtros (usada no botão "Limpar Busca")
    window.clearFilters = () => {
        searchInput.value = '';
        categorySelect.value = 'all';
        filterChips.forEach(c => c.classList.remove('active'));
        document.querySelector('.filter-chip[data-cat="all"]').classList.add('active');
        renderEvents(allEvents);
    };

    // Iniciar
    loadEvents();
});