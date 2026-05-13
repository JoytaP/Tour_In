document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api';

    // ── Helpers ──
    const $  = id => document.getElementById(id);
    const openModal  = id => $(id).classList.add('open');
    const closeModal = id => $(id).classList.remove('open');
    const authHeaders = () => ({ Authorization: `Bearer ${token}` });

    // Fecha modal clicando fora
    document.querySelectorAll('.modal-overlay').forEach(o =>
        o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); })
    );

    // ── Carrega perfil ──
    let companyData = null;
    try {
        const res = await fetch(`${BASE}/companies/profile`, { headers: authHeaders() });
        if (res.status === 401) { logout(); return; }
        companyData = await res.json();

        $('company-name').textContent      = companyData.name;
        $('stat-category').textContent     = capitalize(companyData.category);

        // Preenche form edição
        setValue('edit-name', companyData.name);
        setValue('edit-phone', companyData.phone);
        setValue('edit-address', companyData.address);
        setValue('edit-website', companyData.website);
        setValue('edit-description', companyData.description);
        setSelectValue('edit-category', companyData.category);

        // Galeria de fotos
        renderPhotoGallery(companyData.photos || []);

    } catch(e) {
        console.error(e);
        alert('Erro ao carregar dados da empresa.');
        return;
    }

    await loadEvents();

    // ── Botões ──
    $('new-event-btn')?.addEventListener('click', () => openModal('event-modal'));
    $('new-event-btn-2')?.addEventListener('click', () => openModal('event-modal'));
    $('edit-profile-btn')?.addEventListener('click', () => openModal('edit-modal'));
    $('edit-profile-link')?.addEventListener('click', e => { e.preventDefault(); openModal('edit-modal'); });
    $('cancel-event-btn')?.addEventListener('click', () => closeModal('event-modal'));
    $('cancel-edit-btn')?.addEventListener('click', () => closeModal('edit-modal'));

    $('copy-link-btn')?.addEventListener('click', () => {
        const link = `${window.location.origin}/pages/explore.html?company=${companyData?.id}`;
        navigator.clipboard.writeText(link)
            .then(() => showToast('Link copiado! 🔗'))
            .catch(() => showToast('Não foi possível copiar.'));
    });

    const logoutH = () => logout();
    $('logout-btn')?.addEventListener('click', logoutH);
    $('logout-btn-2')?.addEventListener('click', logoutH);

    // ── Formulário: Criar Evento (com suporte a imagem) ──
    $('event-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('[type="submit"]');
        btn.disabled = true; btn.textContent = 'Criando...';

        const formData = new FormData();
        formData.append('title',       $('ev-title').value);
        formData.append('description', $('ev-description').value);
        formData.append('date',        $('ev-date').value);
        formData.append('category',    $('ev-category').value);
        formData.append('location',    $('ev-location').value);

        const imageFile = $('ev-image-file')?.files[0];
        const imageUrl  = $('ev-image-url')?.value;
        if (imageFile) formData.append('image', imageFile);
        else if (imageUrl) formData.append('image_url', imageUrl);

        try {
            const res = await fetch(`${BASE}/companies/events`, {
                method: 'POST',
                headers: authHeaders(),
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Evento criado! 🎉');
                closeModal('event-modal');
                e.target.reset();
                await loadEvents();
            } else {
                alert(data.message || 'Erro ao criar evento.');
            }
        } catch(err) { alert('Erro de conexão.'); }
        finally { btn.disabled = false; btn.textContent = 'Criar Evento'; }
    });

    // ── Formulário: Editar Perfil (com novas fotos) ──
    $('edit-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('[type="submit"]');
        btn.disabled = true; btn.textContent = 'Salvando...';

        const formData = new FormData();
        ['edit-name','edit-phone','edit-address','edit-website','edit-description','edit-category'].forEach(id => {
            const el = $(id);
            if (el && el.value) formData.append(id.replace('edit-',''), el.value);
        });

        const photoFiles = $('edit-photos')?.files;
        if (photoFiles) for (const f of photoFiles) formData.append('photos', f);

        try {
            const res = await fetch(`${BASE}/companies/profile`, {
                method: 'PUT',
                headers: authHeaders(),
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Perfil atualizado! ✅');
                closeModal('edit-modal');
                $('company-name').textContent = $('edit-name')?.value || companyData.name;
                $('stat-category').textContent = capitalize($('edit-category')?.value || companyData.category);
                // Recarrega fotos
                const profile = await (await fetch(`${BASE}/companies/profile`, { headers: authHeaders() })).json();
                renderPhotoGallery(profile.photos || []);
            } else {
                alert(data.message || 'Erro ao salvar.');
            }
        } catch(err) { alert('Erro de conexão.'); }
        finally { btn.disabled = false; btn.textContent = 'Salvar Alterações'; }
    });

    // ═══════════════════════════════════════════════════════
    // Funções auxiliares
    // ═══════════════════════════════════════════════════════

    async function loadEvents() {
        const list = $('events-list');
        if (!list) return;
        list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">Carregando...</p>';

        try {
            const res = await fetch(`${BASE}/companies/events`, { headers: authHeaders() });
            const events = await res.json();

            $('stat-events').textContent = events.length;
            const now = new Date();
            $('stat-upcoming').textContent = events.filter(ev => new Date(ev.date) >= now).length;

            if (!events.length) {
                list.innerHTML = `<div class="empty-state"><span>📅</span>Nenhum evento ainda. Crie o primeiro!</div>`;
                return;
            }
            list.innerHTML = events.map(ev => {
                const evDate = new Date(ev.date);
                const isPast = evDate < now;
                const dateStr = evDate.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' });
                const thumb = ev.image_url
                    ? `<img src="${ev.image_url.startsWith('/') ? 'http://localhost:3000' + ev.image_url : ev.image_url}"
                            style="width:48px;height:48px;border-radius:12px;object-fit:cover;margin-right:12px;"
                            onerror="this.style.display='none'">`
                    : '';
                return `<div class="event-item-mini" data-id="${ev.id}">
                    ${thumb}
                    <div style="flex:1;">
                        <strong style="display:block;color:#fff;">${escapeHtml(ev.title)}</strong>
                        <small style="color:var(--text-muted);">${dateStr}${ev.location ? ' · ' + escapeHtml(ev.location) : ''}</small>
                    </div>
                    <div style="display:flex;align-items:center;gap:8px;">
                        <span class="badge-status ${isPast ? 'status-past' : 'status-active'}">${isPast ? 'Encerrado' : 'Ativo'}</span>
                        <button class="delete-btn" data-id="${ev.id}" title="Excluir">🗑️</button>
                    </div>
                </div>`;
            }).join('');

            list.querySelectorAll('.delete-btn').forEach(btn =>
                btn.addEventListener('click', async () => {
                    if (!confirm('Excluir este evento?')) return;
                    await deleteEvent(btn.dataset.id);
                })
            );
        } catch(err) {
            list.innerHTML = '<p style="color:#ff4d4d;text-align:center;">Erro ao carregar eventos.</p>';
        }
    }

    async function deleteEvent(eventId) {
        const res = await fetch(`${BASE}/companies/events/${eventId}`, {
            method: 'DELETE', headers: authHeaders()
        });
        if (res.ok) { showToast('Evento excluído.'); await loadEvents(); }
        else { const d = await res.json(); alert(d.message || 'Erro ao excluir.'); }
    }

    function renderPhotoGallery(photos) {
        const gallery = $('photo-gallery');
        if (!gallery) return;
        if (!photos.length) {
            gallery.innerHTML = '<p style="color:var(--text-muted);font-size:.85rem;">Nenhuma foto ainda.</p>';
            return;
        }
        gallery.innerHTML = photos.map(url => {
            const src = url.startsWith('/') ? `http://localhost:3000${url}` : url;
            return `<div style="position:relative;display:inline-block;">
                <img src="${src}" style="width:80px;height:80px;object-fit:cover;border-radius:12px;border:1px solid var(--glass-border);"
                     onerror="this.parentElement.style.display='none'">
                <button onclick="removePhoto('${url}')"
                    style="position:absolute;top:-6px;right:-6px;background:#ff4d4d;border:none;color:#fff;border-radius:50%;width:20px;height:20px;font-size:.7rem;cursor:pointer;line-height:20px;">✕</button>
            </div>`;
        }).join('');
    }

    window.removePhoto = async (photoUrl) => {
        if (!confirm('Remover esta foto?')) return;
        const res = await fetch(`${BASE}/companies/profile/photo`, {
            method: 'DELETE',
            headers: { ...authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ photoUrl })
        });
        const data = await res.json();
        if (res.ok) { showToast('Foto removida.'); renderPhotoGallery(data.photos || []); }
        else alert(data.message || 'Erro ao remover foto.');
    };

    function logout() {
        localStorage.removeItem('token'); localStorage.removeItem('company');
        window.location.href = 'login.html';
    }

    function showToast(msg) {
        let t = document.getElementById('_toast');
        if (!t) {
            t = document.createElement('div'); t.id = '_toast';
            t.style.cssText = `position:fixed;bottom:30px;left:50%;transform:translateX(-50%);
                background:#00f2ff;color:#000;padding:12px 24px;border-radius:100px;
                font-weight:700;font-size:.9rem;z-index:9999;`;
            document.body.appendChild(t);
        }
        t.textContent = msg; t.style.display = 'block';
        clearTimeout(t._t); t._t = setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    function capitalize(str) {
        if (!str) return '—';
        const map = { restaurant:'Restaurante',hotel:'Hotel',tourism:'Turismo',culture:'Cultura',nightlife:'Vida Noturna',sports:'Esportes',other:'Outro' };
        return map[str] || str.charAt(0).toUpperCase() + str.slice(1);
    }
    function setValue(id, val) { const el = $(id); if (el) el.value = val || ''; }
    function setSelectValue(id, val) {
        const sel = $(id); if (!sel || !val) return;
        for (const opt of sel.options) if (opt.value === val) { opt.selected = true; break; }
    }
    function escapeHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
});
