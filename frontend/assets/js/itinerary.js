document.addEventListener('DOMContentLoaded', async () => {
    if (!TourIn.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const draftAlert = document.getElementById('draft-alert');
    const itinerariesList = document.getElementById('itineraries-list');

    // --- 1. GERENCIAR RASCUNHO (Mantido igual) ---
    function checkDraft() {
        const draft = JSON.parse(localStorage.getItem('temp_itinerary')) || [];
        
        if (draft.length > 0 && draftAlert) {
            draftAlert.style.display = 'block';
            document.getElementById('draft-count').innerText = draft.length;
            
            const names = draft.map(i => `• ${i.title}`).join('<br>');
            document.getElementById('draft-items-list').innerHTML = names;

            document.getElementById('btn-save-itinerary').onclick = saveItinerary;
            document.getElementById('btn-clear-draft').onclick = () => {
                if(confirm('Descartar rascunho?')) {
                    localStorage.removeItem('temp_itinerary');
                    location.reload();
                }
            };
        }
    }

    async function saveItinerary() {
        const draft = JSON.parse(localStorage.getItem('temp_itinerary'));
        const btn = document.getElementById('btn-save-itinerary');
        
        try {
            btn.innerText = 'Salvando...';
            btn.disabled = true;

            const response = await fetch(`${API_URL}/itineraries`, {
                method: 'POST',
                headers: TourIn.getAuthHeaders(),
                body: JSON.stringify({ items: draft })
            });

            if (response.ok) {
                alert('Roteiro salvo com sucesso!');
                localStorage.removeItem('temp_itinerary');
                location.reload();
            } else {
                alert('Erro ao salvar.');
            }
        } catch (error) {
            alert('Erro de conexão.');
        }
    }

    // --- 2. LISTAR ROTEIROS (Com funcionalidade de Excluir) ---
    async function loadItineraries() {
        try {
            const response = await fetch(`${API_URL}/itineraries`, {
                headers: TourIn.getAuthHeaders()
            });

            if (response.ok) {
                const itineraries = await response.json();
                renderItineraries(itineraries);
            } else {
                itinerariesList.innerHTML = '<p class="text-center">Erro ao carregar roteiros.</p>';
            }
        } catch (error) {
            itinerariesList.innerHTML = '<p class="text-center">Erro de conexão.</p>';
        }
    }

    function renderItineraries(itineraries) {
        itinerariesList.innerHTML = '';

        if (itineraries.length === 0) {
            itinerariesList.innerHTML = `
                <div class="col-12 text-center" style="padding: 40px; border: 1px dashed var(--border); border-radius: 10px;">
                    <h3>Nenhum roteiro salvo</h3>
                    <p class="text-secondary">Explore e adicione itens para criar seu primeiro roteiro.</p>
                </div>`;
            return;
        }

        itineraries.forEach(itin => {
            let items = [];
            try {
                items = (typeof itin.items === 'string') ? JSON.parse(itin.items) : itin.items;
            } catch (e) { items = []; }

            const date = new Date(itin.created_at).toLocaleDateString('pt-BR');

            const card = document.createElement('div');
            card.className = 'card';
            
            // Layout do Card com Botão de Lixeira
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div>
                        <h3 style="font-size: 1.2rem; margin:0;">${itin.name || 'Meu Roteiro'}</h3>
                        <span class="text-secondary small">Criado em: ${date}</span>
                    </div>
                    <button class="btn small ghost" style="color: var(--error); border-color: var(--error); padding: 5px 10px;" onclick="deleteItinerary(${itin.id})">
                        🗑️
                    </button>
                </div>
                
                <div style="background: var(--bg-body); padding: 10px; border-radius: 5px; margin-bottom: 15px;">
                    <strong>${items.length} paradas:</strong>
                    <ul style="padding-left: 20px; margin: 5px 0 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                        ${items.slice(0, 3).map(i => `<li>${i.title}</li>`).join('')}
                        ${items.length > 3 ? `<li>e mais ${items.length - 3}...</li>` : ''}
                    </ul>
                </div>
                
                <div style="display:flex; gap: 10px;">
                    <button class="btn ghost small w-100">👁️ Detalhes</button>
                    <button class="btn small w-100">📍 Navegar</button>
                </div>
            `;
            itinerariesList.appendChild(card);
        });
    }

    // --- 3. FUNÇÃO DE EXCLUIR ROTEIRO ---
    window.deleteItinerary = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este roteiro permanentemente?')) return;

        try {
            // Nota: Esta chamada requer que o backend tenha a rota DELETE /api/itineraries/:id implementada.
            // Se o backend atual não tiver, retornará 404.
            const response = await fetch(`${API_URL}/itineraries/${id}`, { // Supondo rota /:id
                method: 'DELETE', // Alterado para método DELETE
                // Se a rota for via query params ou body, ajuste aqui. Assumindo REST padrão.
                headers: TourIn.getAuthHeaders()
            });

            // Se o backend não suportar DELETE ainda, podemos simular removendo do DOM para teste:
            // if (response.status === 404) { alert('Backend não suporta exclusão ainda.'); return; }

            if (response.ok) {
                alert('Roteiro excluído.');
                loadItineraries(); // Recarrega lista
            } else {
                alert('Erro ao excluir roteiro. Verifique o backend.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão ao tentar excluir.');
        }
    };

    // Inicialização
    checkDraft();
    loadItineraries();
});