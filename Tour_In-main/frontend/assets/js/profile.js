document.addEventListener('DOMContentLoaded', async () => {
    // 1. Proteção de Rota
    if (!TourIn.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Elementos da Tela
    const nameInput = document.getElementById('edit-name');
    const cityInput = document.getElementById('edit-city');
    const phoneInput = document.getElementById('edit-phone');
    const bioInput = document.getElementById('edit-bio');
    const displayName = document.getElementById('display-name'); // O H3 que mostra o nome grande
    const profileForm = document.getElementById('profile-form'); // Se tiver ID no form
    // Se o form não tiver ID, pegamos pelo seletor:
    const form = profileForm || document.querySelector('form');

    // 3. Função para Carregar Dados do Backend
    async function loadProfile() {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
                headers: TourIn.getAuthHeaders()
            });
            
            if (response.ok) {
                const user = await response.json();
                
                // Preenche os campos
                if (nameInput) nameInput.value = user.name || '';
                if (cityInput) cityInput.value = user.city || '';
                if (phoneInput) phoneInput.value = user.phone || '';
                if (bioInput) bioInput.value = user.bio || '';
                
                // Atualiza o nome de exibição no topo
                if (displayName) displayName.textContent = user.name;
                
                // Atualiza iniciais
                const initials = document.getElementById('profile-initials');
                if (initials && user.name) initials.textContent = user.name.charAt(0).toUpperCase();
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    // Carrega dados ao abrir
    loadProfile();

    // 4. Salvar Alterações
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = form.querySelector('button');
            const originalText = btn.innerText;
            
            try {
                btn.innerText = 'Salvando...';
                btn.disabled = true;

                const updatedData = {
                    name: nameInput ? nameInput.value : undefined,
                    city: cityInput ? cityInput.value : undefined,
                    phone: phoneInput ? phoneInput.value : undefined,
                    bio: bioInput ? bioInput.value : undefined,
                    // Preferências podem ser adicionadas aqui se houver checkboxes
                };

                const response = await fetch(`${API_URL}/users/profile`, {
                    method: 'PUT',
                    headers: TourIn.getAuthHeaders(),
                    body: JSON.stringify(updatedData)
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // Atualiza o usuário no LocalStorage para refletir a mudança de nome no header
                    const currentUser = TourIn.getUser();
                    if (currentUser && result.user) {
                        currentUser.name = result.user.name;
                        localStorage.setItem('user', JSON.stringify(currentUser));
                    }
                    
                    alert('Perfil atualizado com sucesso!');
                    location.reload(); // Recarrega para atualizar tudo visualmente
                } else {
                    alert('Erro ao atualizar perfil.');
                }
            } catch (error) {
                console.error(error);
                alert('Erro de conexão.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});