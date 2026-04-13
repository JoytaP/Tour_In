// Configuração Global
const API_URL = 'http://localhost:3000/api';

const TourIn = {
    // --- AUTENTICAÇÃO ---
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    getUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    getAuthHeaders: () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('temp_itinerary'); // Limpa rascunhos ao sair
        window.location.href = 'login.html';
    },

    // --- NOVA FUNÇÃO: ADICIONAR AO ROTEIRO (GLOBAL) ---
    addToItinerary: (id, title, type = 'event') => {
        if (!TourIn.isAuthenticated()) {
            alert('Você precisa estar logado para salvar itens!');
            window.location.href = 'login.html';
            return;
        }
    
        // Pega itens já salvos ou cria array vazio
        let currentItinerary = JSON.parse(localStorage.getItem('temp_itinerary')) || [];
    
        // Verifica duplicatas
        const exists = currentItinerary.find(item => item.id === id);
        if (exists) {
            alert(`"${title}" já está no seu roteiro atual!`);
            return;
        }
    
        // Adiciona novo item
        currentItinerary.push({ id, title, type });
        localStorage.setItem('temp_itinerary', JSON.stringify(currentItinerary));
    
        // Feedback visual
        const confirmGo = window.confirm(`"${title}" adicionado! Você tem ${currentItinerary.length} itens no rascunho.\n\nDeseja ir para a página de Roteiros para finalizar?`);
        
        if (confirmGo) {
            window.location.href = 'itinerary.html';
        }
    }
};

// --- INICIALIZAÇÃO DA UI (Ao carregar a página) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Controle da Navbar (Logado vs Não Logado)
    const isAuth = TourIn.isAuthenticated();
    const navLinks = document.querySelectorAll('.nav a, .nav button');
    
    navLinks.forEach(link => {
        // Se tiver data-auth="authenticated" (só para logados)
        if (link.dataset.auth === 'authenticated' && !isAuth) {
            link.style.display = 'none';
        }
        // Se tiver data-auth="anonymous" (só para não logados)
        if (link.dataset.auth === 'anonymous' && isAuth) {
            link.style.display = 'none';
        }
    });

    // 2. Botão de Logout Genérico
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        // Se não estiver logado, esconde o botão de sair
        if (!isAuth) {
            logoutBtn.style.display = 'none';
        } else {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                TourIn.logout();
            });
        }
    }

    // 3. Menu Responsivo (Hamburger)
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
            if (nav.style.display === 'flex') {
                nav.style.flexDirection = 'column';
                nav.style.position = 'absolute';
                nav.style.top = '70px';
                nav.style.right = '20px';
                nav.style.background = 'var(--bg-card)';
                nav.style.padding = '20px';
                nav.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                nav.style.borderRadius = 'var(--radius)';
                nav.style.zIndex = '1000';
            }
        });
    }

    // Ativa animações de entrada nos cards
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

document.querySelectorAll('.card, .itinerary-item').forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s ease-out";
    observer.observe(el);
});
});

// Expõe a função para ser usada no HTML (onclick="addToItinerary(...)")
window.TourIn = TourIn;
window.addToItinerary = TourIn.addToItinerary;

// Função para animar a aparição dos elementos
const revealElements = () => {
    const cards = document.querySelectorAll('.event-card, .place-card, .itinerary-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // Efeito Cascata (Stagger)
    });
};

// Podes chamar esta função sempre que as funções de listagem (ex: loadEvents) terminarem.