// Configuração Global
// Em produção o frontend é servido pelo próprio backend Express, então a API
// fica sempre na mesma origem. Em desenvolvimento local (ex.: abrindo o HTML
// direto via file:// ou outra porta), cai no fallback para localhost:3000.
const API_URL = (window.location.origin && window.location.origin !== 'null' && window.location.protocol !== 'file:')
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api';

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
            showToast('Você precisa estar logado para salvar itens!', true);
            window.location.href = 'login.html';
            return;
        }
    
        // Pega itens já salvos ou cria array vazio
        let currentItinerary = JSON.parse(localStorage.getItem('temp_itinerary')) || [];
    
        // Verifica duplicatas
        const exists = currentItinerary.find(item => item.id === id);
        if (exists) {
            showToast(`"${title}" já está no seu roteiro atual!`, true);
            return;
        }
    
        // Adiciona novo item
        currentItinerary.push({ id, title, type });
        localStorage.setItem('temp_itinerary', JSON.stringify(currentItinerary));
    
                // Feedback visual com toast
        showToast(`"${title}" adicionado! (${currentItinerary.length} item(s) no rascunho)`);
        setTimeout(() => { window.location.href = 'itinerary.html'; }, 1800);
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

// ═══════════════════════════════════════════════════════════
// TOAST GLOBAL — substitui alert() em todo o frontend
// ═══════════════════════════════════════════════════════════
window.showToast = function(msg, isError = false) {
    let t = document.getElementById('_global_toast');
    if (!t) {
        t = document.createElement('div');
        t.id = '_global_toast';
        t.style.cssText = [
            'position:fixed', 'bottom:24px', 'right:24px', 'z-index:9999',
            'padding:12px 20px', 'border-radius:8px', 'font-size:0.95rem',
            'font-weight:600', 'box-shadow:0 4px 16px rgba(0,0,0,0.25)',
            'display:none', 'max-width:320px', 'word-break:break-word',
            'transition:opacity 0.3s'
        ].join(';');
        document.body.appendChild(t);
    }
    t.textContent = msg;
    const isLight = document.body.classList.contains('light-mode');
    t.style.background = isError ? '#dc2626' : (isLight ? '#16a34a' : '#00f264');
    t.style.color = isError ? '#fff' : (isLight ? '#fff' : '#000');
    t.style.display = 'block';
    clearTimeout(t._tid);
    t._tid = setTimeout(() => { t.style.display = 'none'; }, 3500);
};
