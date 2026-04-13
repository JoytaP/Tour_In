document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificação de Segurança
    if (!TourIn.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Carregar Nome do Usuário
    const user = TourIn.getUser();
    if (user) {
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];
    }

    // 3. Atualizar Estatísticas Reais
    updateDashboardStats();

    async function updateDashboardStats() {
        try {
            // A. Contar Roteiros (Busca do backend)
            const response = await fetch(`${API_URL}/itineraries`, {
                headers: TourIn.getAuthHeaders()
            });

            if (response.ok) {
                const itineraries = await response.json();
                // Atualiza o número na tela
                animateValue("stat-itineraries", 0, itineraries.length, 1000);
            }

            // B. Contar Lugares Salvos (Baseado no Rascunho Local por enquanto)
            const draft = JSON.parse(localStorage.getItem('temp_itinerary')) || [];
            animateValue("stat-places", 0, draft.length, 1000);

            // C. Contar Avaliações (Mock - Como não temos tabela de reviews no backend ainda)
            // Futuramente: fetch(`${API_URL}/users/reviews`)
            animateValue("stat-reviews", 0, 0, 1000); 

        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
        }
    }

    // Efeito visual de contagem
    function animateValue(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});