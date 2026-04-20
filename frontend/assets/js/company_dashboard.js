document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    // ── Helpers ──
    const openModal  = (id) => document.getElementById(id).classList.add('open');
    const closeModal = (id) => document.getElementById(id).classList.remove('open');

    // Fecha modal clicando fora
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // ── Carrega perfil ──
    let companyData = null;
    try {
        const res = await fetch(`${API_URL}/companies/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) { logout(); return; }
        companyData = await res.json();

        document.getElementById('company-name').innerText = companyData.name;
        document.getElementById('stat-category').innerText =
            companyData.category ? capitalize(companyData.category) : '—';

        // Preenche form de edição
        document.getElementById('edit-name').value        = companyData.name || '';
        document.getElementById('edit-phone').value       = companyData.phone || '';
        document.getElementById('edit-address').value     = companyData.address || '';
        document.getElementById('edit-website').value     = companyData.website || '';
        document.getElementById('edit-description').value = companyData.description || '';
        setSelectValue('edit-category', companyData.category);

    } catch (e) {
        console.error(e);
        alert('Erro ao carregar dados da empresa.');
        return;
    }

    // ── Carrega eventos ──
    await loadEvents();

    // ── Botões de abrir modal ──
    document.getElementById('new-event-btn').addEventListener('click', () => openModal('event-modal'));
    document.getElementById('new-event-btn-2').addEventListener('click', () => openModal('event-modal'));
    document.getElementById('edit-profile-btn').addEventListener('click', () => openModal('edit-modal'));
    document.getElementById('edit-profile-link').addEventListener('click', (e) => { e.preventDefault(); openModal('edit-modal'); });

    // ── Fechar modais ──
    document.getElementById('cancel-event-btn').addEventListener('click', () => closeModal('event-modal'));
    document.getElementById('cancel-edit-btn').addEventListener('click', () => closeModal('edit-modal'));

    // ── Copiar link ──
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        const link = `${window.location.origin}/pages/explore.html?company=${companyData?.id}`;
        navigator.clipboard.writeText(link)
            .then(() => showToast('Link copiado para a área de transferência!'))
            .catch(() => showToast('Não foi possível copiar o link.'));
    });

    // ── Logout ──
    const logoutHandler = () => logout();
    document.getElementById('logout-btn').addEventListener('click', logoutHandler);
    document.getElementById('logout-btn-2').addEventListener('click', logoutHandler);

    // ── Formulário: Criar Evento ──
    document.getElementById('event-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Criando...';

        const body = {
            title:       document.getElementById('ev-title').value,
            description: document.getElementById('ev-description').value,
            date:        document.getElementById('ev-date').value,
            category:    document.getElementById('ev-category').value,
            location:    document.getElementById('ev-location').value,
            image_url:   document.getElementById('ev-image').value || null,
        };

        try {
            const res = await fetch(`${API_URL}/companies/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Evento criado com sucesso! 🎉');
                closeModal('event-modal');
                e.target.reset();
                await loadEvents();
            } else {
                alert(data.message || 'Erro ao criar evento.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Criar Evento';
        }
    });

    // ── Formulário: Editar Perfil ──
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = e.target.querySelector('[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Salvando...';

        const body = {
            name:        document.getElementById('edit-name').value,
            phone:       document.getElementById('edit-phone').value,
            address:     document.getElementById('edit-address').value,
            website:     document.getElementById('edit-website').value,
            description: document.getElementById('edit-description').value,
            category:    document.getElementById('edit-category').value,
        };

        try {
            const res = await fetch(`${API_URL}/companies/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                showToast('Perfil atualizado com sucesso! ✅');
                closeModal('edit-modal');
                // Atualiza nome no cabeçalho
                document.getElementById('company-name').innerText = body.name;
                document.getElementById('stat-category').innerText = capitalize(body.category);
            } else {
                alert(data.message || 'Erro ao salvar.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de conexão.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Salvar Alterações';
        }
    });

    // ════════════════════════════════════════
    // ── Funções auxiliares ──
    // ════════════════════════════════════════

    async function loadEvents() {
        const list = document.getElementById('events-list');
        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Carregando...</p>';

        try {
            const res = await fetch(`${API_URL}/companies/events`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const events = await res.json();

            document.getElementById('stat-events').innerText = events.length;
            const now = new Date();
            const upcoming = events.filter(ev => new Date(ev.date) >= now);
            document.getElementById('stat-upcoming').innerText = upcoming.length;

            if (!events.length) {
                list.innerHTML = `
                    <div class="empty-state">
                        <span>📅</span>
                        Nenhum evento ainda. Crie o primeiro!
                    </div>`;
                return;
            }

            list.innerHTML = events.map(ev => {
                const evDate = new Date(ev.date);
                const isPast = evDate < now;
                const dateStr = evDate.toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                return `
                <div class="event-item-mini" data-id="${ev.id}">
                    <div style="flex:1;">
                        <strong style="display:block;color:#fff;">${escapeHtml(ev.title)}</strong>
                        <small style="color:var(--text-muted);">${dateStr}${ev.location ? ' · ' + escapeHtml(ev.location) : ''}</small>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                        <span class="badge-status ${isPast ? 'status-past' : 'status-active'}">
                            ${isPast ? 'Encerrado' : 'Ativo'}
                        </span>
                        <button class="delete-btn" data-id="${ev.id}" title="Excluir evento">🗑️</button>
                    </div>
                </div>`;
            }).join('');

            // Delegação de evento para os botões de delete
            list.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    if (!confirm('Tem certeza que deseja excluir este evento?')) return;
                    await deleteEvent(btn.dataset.id);
                });
            });

        } catch (err) {
            console.error(err);
            list.innerHTML = '<p style="color:#ff4d4d;text-align:center;">Erro ao carregar eventos.</p>';
        }
    }

    async function deleteEvent(eventId) {
        try {
            const res = await fetch(`${API_URL}/companies/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Evento excluído.');
                await loadEvents();
            } else {
                const d = await res.json();
                alert(d.message || 'Erro ao excluir.');
            }
        } catch (err) {
            alert('Erro de conexão.');
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('company');
        window.location.href = 'login.html';
    }

    function capitalize(str) {
        if (!str) return '';
        const map = {
            restaurant: 'Restaurante', hotel: 'Hotel', tourism: 'Turismo',
            culture: 'Cultura', nightlife: 'Vida Noturna', sports: 'Esportes', other: 'Outro',
            show: 'Show', gastronomy: 'Gastronomia', theater: 'Teatro'
        };
        return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
    }

    function setSelectValue(id, value) {
        const sel = document.getElementById(id);
        if (!sel || !value) return;
        for (let opt of sel.options) {
            if (opt.value === value) { opt.selected = true; break; }
        }
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function showToast(msg) {
        let toast = document.getElementById('_toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = '_toast';
            toast.style.cssText = `
                position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
                background:#00f2ff;color:#000;padding:12px 24px;border-radius:100px;
                font-weight:700;font-size:.9rem;z-index:9999;
                animation:fadeUp 0.3s ease both;`;
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.display = 'block';
        clearTimeout(toast._t);
        toast._t = setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
});
