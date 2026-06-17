const RESERVATION_API = (typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api') + '/reservations';

// =========================
// MODAL DE RESERVA
// =========================
function openReservationModal(entityId, entityType, entityName) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        alert('Faça login para fazer uma reserva!');
        window.location.href = 'login.html';
        return;
    }

    const existing = document.getElementById('reservation-modal');
    if (existing) existing.remove();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 16);

    const modal = document.createElement('div');
    modal.id = 'reservation-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title');
    modal.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.75);z-index:10000;
        display:flex;align-items:center;justify-content:center;
        backdrop-filter:blur(6px);animation:fadeIn .2s ease;
    `;

    modal.innerHTML = `
      <div style="background:var(--bg-card);border:1px solid var(--glass-border);border-radius:24px;
                  padding:36px;max-width:440px;width:90%;box-shadow:0 25px 60px rgba(0,0,0,.5);">
        <h2 id="modal-title" style="color:var(--text-main);margin-bottom:8px;font-size:1.4rem;">📅 Reservar</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;font-size:.9rem;">${entityName}</p>

        <label style="display:block;color:var(--text-muted);font-size:.85rem;margin-bottom:6px;">Data e Hora da Visita *</label>
        <input id="res-date" type="datetime-local" min="${minDate}"
          style="width:100%;padding:12px;background:var(--bg-secondary);border:1px solid var(--glass-border);
                 border-radius:12px;color:var(--text-main);font-size:.95rem;margin-bottom:16px;box-sizing:border-box;"
          required aria-label="Data e hora da visita">

        <label style="display:block;color:var(--text-muted);font-size:.85rem;margin-bottom:6px;">Número de Pessoas</label>
        <input id="res-people" type="number" min="1" max="20" value="1"
          style="width:100%;padding:12px;background:var(--bg-secondary);border:1px solid var(--glass-border);
                 border-radius:12px;color:var(--text-main);font-size:.95rem;margin-bottom:16px;box-sizing:border-box;"
          aria-label="Número de pessoas">

        <label style="display:block;color:var(--text-muted);font-size:.85rem;margin-bottom:6px;">Observações (opcional)</label>
        <textarea id="res-notes" rows="3" placeholder="Ex: Preciso de cadeirante, aniversário, etc."
          style="width:100%;padding:12px;background:var(--bg-secondary);border:1px solid var(--glass-border);
                 border-radius:12px;color:var(--text-main);font-size:.9rem;resize:none;margin-bottom:24px;box-sizing:border-box;"
          aria-label="Observações"></textarea>

        <div style="display:flex;gap:12px;">
          <button onclick="submitReservation('${entityType}', ${entityId})"
            style="flex:1;padding:14px;background:var(--accent-primary);border:none;border-radius:14px;
                   color:#000;font-weight:800;font-size:1rem;cursor:pointer;">
            Confirmar Reserva
          </button>
          <button onclick="document.getElementById('reservation-modal').remove()"
            style="padding:14px 20px;background:var(--bg-secondary);border:1px solid var(--glass-border);
                   border-radius:14px;color:var(--text-muted);cursor:pointer;font-weight:600;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
    document.getElementById('res-date').focus();
}

// =========================
// ENVIAR RESERVA
// =========================
async function submitReservation(entityType, entityId) {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const date = document.getElementById('res-date').value;
    const people = parseInt(document.getElementById('res-people').value);
    const notes = document.getElementById('res-notes').value;

    if (!date) {
        document.getElementById('res-date').focus();
        alert('Selecione a data e hora da visita.');
        return;
    }

    // user.id pode estar ausente em tokens antigos — usa também user.userId
    const userId = user?.id || user?.userId || null;

    try {
        const body = {
            user_id: userId,
            reservation_date: date,
            people,
            notes,
            place_id: entityType === 'place' ? entityId : null,
            event_id: entityType === 'event' ? entityId : null
        };

        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${RESERVATION_API}/create`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById('reservation-modal').remove();
            showToast('✅ Reserva realizada com sucesso!');
            // Recarrega reservas na dashboard se existir
            if (typeof loadReservationsOnDashboard === 'function') loadReservationsOnDashboard();
        } else {
            alert(data.error || 'Erro ao fazer reserva.');
        }
    } catch (err) {
        console.error(err);
        alert('Erro de conexão.');
    }
}

// =========================
// CARREGAR RESERVAS NA DASHBOARD
// =========================
async function loadReservationsOnDashboard() {
    const container = document.getElementById('home-reservations');
    if (!container) return;

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch(`${RESERVATION_API}/${user.id}`);
        const items = await response.json();
        const active = items.filter(r => r.status !== 'cancelled');

        if (!active.length) {
            container.innerHTML = `
                <p style="color:var(--text-muted);font-size:.95rem;">
                    Nenhuma reserva ativa. 
                    <a href="explore.html" style="color:var(--accent-primary);">Explore lugares</a> para reservar!
                </p>`;
            return;
        }

        container.innerHTML = active.map(r => {
            const date = new Date(r.reservation_date).toLocaleString('pt-BR', {
                dateStyle: 'short', timeStyle: 'short'
            });
            const statusColor = r.status === 'confirmed' ? '#00f2ff' : '#f2c94c';
            const statusLabel = r.status === 'confirmed' ? 'Confirmada' : 'Pendente';
            return `
            <div class="reservation-card" role="article">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                    <div>
                        <h3 style="color:var(--text-main);margin-bottom:6px;">${r.name}</h3>
                        <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:4px;">📅 ${date}</p>
                        <p style="color:var(--text-muted);font-size:.85rem;margin-bottom:4px;">👥 ${r.people} pessoa${r.people > 1 ? 's' : ''}</p>
                        ${r.location ? `<p style="color:var(--text-muted);font-size:.8rem;">📍 ${r.location}</p>` : ''}
                    </div>
                    <span style="padding:4px 10px;background:rgba(${r.status === 'confirmed' ? '0,242,255' : '242,201,76'},.15);
                                 border:1px solid ${statusColor};border-radius:20px;font-size:.75rem;
                                 color:${statusColor};white-space:nowrap;font-weight:700;">${statusLabel}</span>
                </div>
                <button onclick="cancelReservation(${r.id})"
                    style="margin-top:14px;padding:8px 16px;background:rgba(255,70,70,.1);
                           border:1px solid rgba(255,70,70,.3);border-radius:10px;color:#ff4646;
                           cursor:pointer;font-size:.8rem;font-weight:700;"
                    aria-label="Cancelar reserva em ${r.name}">
                    🚫 Cancelar
                </button>
            </div>`;
        }).join('');
    } catch (err) {
        container.innerHTML = `<p style="color:var(--text-muted);">Erro ao carregar reservas.</p>`;
    }
}

// =========================
// CANCELAR RESERVA
// =========================
async function cancelReservation(reservationId) {
    if (!confirm('Cancelar esta reserva?')) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${RESERVATION_API}/${reservationId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ user_id: user?.id })
        });
        const data = await response.json();
        if (data.success) {
            showToast('Reserva cancelada.');
            loadReservationsOnDashboard();
        }
    } catch (err) { console.error(err); }
}

// Toast (reutiliza do wishlist.js se já existir, senão define)
if (typeof showToast === 'undefined') {
    function showToast(message) {
        const t = document.createElement('div');
        t.textContent = message;
        t.setAttribute('role', 'status');
        Object.assign(t.style, {
            position:'fixed',bottom:'30px',right:'30px',
            background:'var(--accent-primary)',color:'#000',
            padding:'14px 22px',borderRadius:'14px',fontWeight:'700',
            zIndex:'9999',fontSize:'.9rem'
        });
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // No dashboard.html, as reservas são renderizadas pelo dashboard.js — não duplicar
    if (document.getElementById('home-reservations') && typeof renderRecentReservations === 'function') return;
    loadReservationsOnDashboard();
});
