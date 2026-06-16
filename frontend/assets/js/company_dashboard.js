document.addEventListener('DOMContentLoaded', async () => {

    // ════════════════════════════════════════════════════════
    // CONFIG
    // ════════════════════════════════════════════════════════
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    const BASE = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:3000/api';

    const $ = id => document.getElementById(id);
    const authH = () => ({ Authorization: `Bearer ${token}` });
    const authJSON = () => ({ ...authH(), 'Content-Type': 'application/json' });

    let companyData = null;
    let currentEditEventId = null;

    // ════════════════════════════════════════════════════════
    // TOAST
    // ════════════════════════════════════════════════════════
    function toast(msg, isError = false) {
        const t = $('_toast');
        t.textContent = msg;
        t.style.background = isError ? '#ff4d4d' : '#00f264';
        t.style.color = isError ? '#fff' : '#000';
        t.style.display = 'block';
        clearTimeout(t._tid);
        t._tid = setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    function escHtml(s) {
        return String(s || '')
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function fmtDate(iso) {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('pt-BR', {
            day:'2-digit', month:'2-digit', year:'numeric',
            hour:'2-digit', minute:'2-digit'
        });
    }

    function categoryLabel(cat) {
        const m = {
            restaurant:'Restaurante', hotel:'Hotel', tourism:'Turismo',
            culture:'Cultura', nightlife:'Vida Noturna', sports:'Esportes',
            show:'Shows & Música', theater:'Teatro & Arte',
            gastronomy:'Gastronomia', fair:'Feiras & Bazar', other:'Outro'
        };
        return m[cat] || cat || '—';
    }

    // ════════════════════════════════════════════════════════
    // MODAL HELPERS
    // ════════════════════════════════════════════════════════
    window.closeModal = id => $(`${id}`)?.classList.remove('open');
    const openModal  = id => $(`${id}`)?.classList.add('open');

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // ════════════════════════════════════════════════════════
    // CARREGAR PERFIL DA EMPRESA
    // ════════════════════════════════════════════════════════
    async function loadCompanyProfile() {
        try {
            const res = await fetch(`${BASE}/companies/profile`, { headers: authH() });
            if (!res.ok) throw new Error('Não autorizado');
            companyData = await res.json();

            $('company-name').textContent = companyData.name || 'Empresa';
            $('profile-views').textContent = companyData.profile_views ?? 0;

            // Pre-fill editar perfil
            if ($('ep-name')) $('ep-name').value = companyData.name || '';
            if ($('ep-phone')) $('ep-phone').value = companyData.phone || '';
            if ($('ep-address')) $('ep-address').value = companyData.address || '';
            if ($('ep-website')) $('ep-website').value = companyData.website || '';
            if ($('ep-description')) $('ep-description').value = companyData.description || '';
            if ($('ep-category')) $('ep-category').value = companyData.category || '';

            // Horários
            const h = companyData.operating_hours || {};
            const dayMap = { seg: h.segunda, ter: h.terca, qua: h.quarta, qui: h.quinta, sex: h.sexta, sab: h.sabado, dom: h.domingo };
            Object.entries(dayMap).forEach(([k, v]) => { if ($(`h-${k}`) && v) $(`h-${k}`).value = v; });

            renderPhotoGallery(companyData.photos || []);

        } catch (err) {
            console.error(err);
            toast('Erro ao carregar empresa.', true);
            if (err.message === 'Não autorizado') {
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            }
        }
    }

    // ════════════════════════════════════════════════════════
    // EVENTOS
    // ════════════════════════════════════════════════════════
    async function loadEvents() {
        const list = $('events-list');
        if (!list) return;
        list.innerHTML = '<div class="empty-state"><span>⏳</span>Carregando eventos...</div>';

        try {
            const res = await fetch(`${BASE}/companies/events`, { headers: authH() });
            if (!res.ok) throw new Error('Erro');
            const events = await res.json();

            $('stat-events').textContent = events.length;
            const now = new Date();
            $('stat-upcoming').textContent = events.filter(e => new Date(e.date) >= now).length;

            if (!events.length) {
                list.innerHTML = '<div class="empty-state"><span>📅</span>Nenhum evento criado ainda.<br><small>Clique em "+ Novo Evento" para começar.</small></div>';
                return;
            }

            list.innerHTML = events.map(ev => {
                const isPast = new Date(ev.date) < now;
                const imgSrc = ev.image_url
                    ? (ev.image_url.startsWith('http') ? ev.image_url : `http://localhost:3000${ev.image_url}`)
                    : 'https://placehold.co/56x56/1a1a2e/888?text=📅';

                return `
                <div class="event-item-mini">
                    <img class="event-item-thumb" src="${escHtml(imgSrc)}" alt="${escHtml(ev.title)}"
                         onerror="this.src='https://placehold.co/56x56/1a1a2e/888?text=📅'">
                    <div class="event-item-info">
                        <strong>${escHtml(ev.title)}</strong>
                        <span>${fmtDate(ev.date)}${ev.location ? ' · ' + escHtml(ev.location) : ''}</span>
                    </div>
                    <span class="event-badge ${isPast ? 'badge-past' : 'badge-upcoming'}">
                        ${isPast ? 'Passado' : 'Próximo'}
                    </span>
                    <div class="event-actions">
                        <button class="edit-btn" title="Editar" onclick="openEditEventModal(${ev.id})">✏️</button>
                        <button class="delete-btn" title="Excluir" onclick="deleteEvent(${ev.id})">🗑️</button>
                    </div>
                </div>`;
            }).join('');

        } catch (err) {
            console.error(err);
            list.innerHTML = '<div class="empty-state"><span>⚠️</span>Erro ao carregar eventos.<br><button class="btn" onclick="loadEvents()" style="margin-top:12px;">Tentar novamente</button></div>';
        }
    }

    // ── Criar evento ──────────────────────────────────────
    $('event-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('[type=submit]');
        btn.disabled = true; btn.textContent = 'Criando...';

        const fd = new FormData();
        fd.append('title',       $('ev-title').value);
        fd.append('description', $('ev-description').value);
        fd.append('date',        $('ev-date').value);
        fd.append('category',    $('ev-category').value);
        fd.append('location',    $('ev-location').value);

        const file = $('ev-image-file')?.files[0];
        const url  = $('ev-image-url')?.value;
        if (file) fd.append('image', file);
        else if (url) fd.append('image_url', url);

        try {
            const res = await fetch(`${BASE}/companies/events`, { method:'POST', headers: authH(), body: fd });
            const data = await res.json();
            if (res.ok) {
                toast('Evento criado! 🎉');
                closeModal('event-modal');
                e.target.reset();
                $('ev-image-preview').style.display = 'none';
                await loadEvents();
            } else {
                toast(data.message || 'Erro ao criar evento.', true);
            }
        } catch (err) {
            toast('Erro de conexão.', true);
        } finally {
            btn.disabled = false; btn.textContent = '✨ Criar Evento';
        }
    });

    // ── Editar evento ─────────────────────────────────────
    window.openEditEventModal = async function(eventId) {
        currentEditEventId = eventId;
        try {
            const res = await fetch(`${BASE}/companies/events`, { headers: authH() });
            const events = await res.json();
            const ev = events.find(e => e.id == eventId);
            if (!ev) return;

            $('edit-event-title').value    = ev.title || '';
            $('edit-event-description').value = ev.description || '';
            $('edit-event-location').value = ev.location || '';
            $('edit-event-image').value    = ev.image_url || '';
            $('edit-event-category').value = ev.category || '';

            // Formato para datetime-local: "YYYY-MM-DDTHH:MM"
            if (ev.date) {
                const d = new Date(ev.date);
                const pad = n => String(n).padStart(2,'0');
                $('edit-event-date').value =
                    `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
            }

            if (ev.image_url) {
                const preview = $('edit-ev-image-preview');
                const src = ev.image_url.startsWith('http') ? ev.image_url : `http://localhost:3000${ev.image_url}`;
                preview.src = src;
                preview.style.display = 'block';
            }

            openModal('edit-event-modal');
        } catch (err) {
            toast('Erro ao abrir evento.', true);
        }
    };

    $('edit-event-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('[type=submit]');
        btn.disabled = true; btn.textContent = 'Salvando...';

        const file = $('edit-ev-image-file')?.files[0];

        let res;
        if (file) {
            // Enviar como FormData quando há arquivo
            const fd = new FormData();
            fd.append('title',       $('edit-event-title').value);
            fd.append('description', $('edit-event-description').value);
            fd.append('date',        $('edit-event-date').value);
            fd.append('location',    $('edit-event-location').value);
            fd.append('category',    $('edit-event-category').value);
            fd.append('image',       file);
            res = await fetch(`${BASE}/companies/events/${currentEditEventId}`, {
                method: 'PUT', headers: authH(), body: fd
            });
        } else {
            res = await fetch(`${BASE}/companies/events/${currentEditEventId}`, {
                method: 'PUT',
                headers: authJSON(),
                body: JSON.stringify({
                    title:       $('edit-event-title').value,
                    description: $('edit-event-description').value,
                    date:        $('edit-event-date').value,
                    location:    $('edit-event-location').value,
                    category:    $('edit-event-category').value,
                    image_url:   $('edit-event-image').value || undefined,
                })
            });
        }

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
            toast('Evento atualizado! ✨');
            closeModal('edit-event-modal');
            await loadEvents();
        } else {
            toast(data.message || 'Erro ao atualizar.', true);
        }
        btn.disabled = false; btn.textContent = '💾 Salvar';
    });

    // ── Deletar evento ────────────────────────────────────
    window.deleteEvent = async function(eventId) {
        if (!confirm('Excluir este evento? Esta ação não pode ser desfeita.')) return;
        try {
            const res = await fetch(`${BASE}/companies/events/${eventId}`, { method:'DELETE', headers: authH() });
            if (res.ok) { toast('Evento excluído.'); await loadEvents(); }
            else        { toast('Erro ao excluir.', true); }
        } catch { toast('Erro de conexão.', true); }
    };

    // ════════════════════════════════════════════════════════
    // AVALIAÇÕES
    // ════════════════════════════════════════════════════════
    async function loadReviews() {
        const container = $('reviews-container');
        if (!container) return;
        try {
            const res = await fetch(`${BASE}/companies/reviews`, { headers: authH() });
            if (!res.ok) throw new Error();
            const { reviews, avg_rating } = await res.json();

            if (avg_rating) $('stat-reviews').textContent = `${avg_rating}⭐`;
            else $('stat-reviews').textContent = '—';

            if (!reviews.length) {
                container.innerHTML = '<div class="review-empty">Nenhuma avaliação ainda.</div>';
                return;
            }

            const stars = n => '⭐'.repeat(Math.max(0, Math.min(5, n)));
            container.innerHTML = reviews.slice(0, 5).map(r => `
                <div class="review-card">
                    <strong>${escHtml(r.user_name || 'Usuário')}</strong>
                    ${r.event_title ? `<small style="color:var(--text-muted);"> · ${escHtml(r.event_title)}</small>` : ''}
                    <div class="review-stars">${stars(r.rating)}</div>
                    ${r.comment ? `<p>${escHtml(r.comment)}</p>` : ''}
                </div>`).join('');

        } catch {
            container.innerHTML = '<div class="review-empty">Erro ao carregar avaliações.</div>';
        }
    }

    // ════════════════════════════════════════════════════════
    // HORÁRIOS
    // ════════════════════════════════════════════════════════
    $('save-hours-btn')?.addEventListener('click', async () => {
        const hours = {
            segunda: $('h-seg').value,
            terca:   $('h-ter').value,
            quarta:  $('h-qua').value,
            quinta:  $('h-qui').value,
            sexta:   $('h-sex').value,
            sabado:  $('h-sab').value,
            domingo: $('h-dom').value,
        };
        // Remover entradas vazias
        Object.keys(hours).forEach(k => { if (!hours[k]) delete hours[k]; });

        try {
            const res = await fetch(`${BASE}/companies/hours`, {
                method: 'PUT', headers: authJSON(), body: JSON.stringify({ hours })
            });
            if (res.ok) toast('Horários salvos! 🕒');
            else        toast('Erro ao salvar horários.', true);
        } catch { toast('Erro de conexão.', true); }
    });

    // ════════════════════════════════════════════════════════
    // GALERIA DE FOTOS
    // ════════════════════════════════════════════════════════
    function renderPhotoGallery(photos) {
        const gallery = $('photo-gallery');
        if (!gallery) return;
        if (!photos.length) {
            gallery.innerHTML = '<p style="color:var(--text-muted);">Nenhuma foto ainda.</p>';
            return;
        }
        gallery.innerHTML = photos.map((url, i) => {
            const src = url.startsWith('/') ? `http://localhost:3000${url}` : url;
            return `
            <div class="photo-wrap">
                <img src="${escHtml(src)}" alt="Foto ${i+1}">
                <button class="photo-remove" onclick="removePhoto('${escHtml(url)}')" title="Remover">×</button>
            </div>`;
        }).join('');
    }

    window.removePhoto = async function(photoUrl) {
        if (!confirm('Remover esta foto?')) return;
        try {
            const res = await fetch(`${BASE}/companies/profile/photo`, {
                method: 'DELETE', headers: authJSON(), body: JSON.stringify({ photoUrl })
            });
            const data = await res.json();
            if (res.ok) {
                toast('Foto removida.');
                renderPhotoGallery(data.photos || []);
            } else {
                toast('Erro ao remover foto.', true);
            }
        } catch { toast('Erro de conexão.', true); }
    };

    // Upload de fotos
    const photoInput = $('photo-file-input');
    const addPhotosAction = async () => photoInput?.click();

    $('add-photos-btn')?.addEventListener('click', addPhotosAction);
    $('qa-add-photos')?.addEventListener('click', addPhotosAction);

    photoInput?.addEventListener('change', async () => {
        const files = photoInput.files;
        if (!files.length) return;

        const fd = new FormData();
        Array.from(files).forEach(f => fd.append('photos', f));

        toast('Enviando fotos...');
        try {
            const res = await fetch(`${BASE}/companies/profile`, {
                method: 'PUT', headers: authH(), body: fd
            });
            if (res.ok) {
                toast('Fotos adicionadas! 📸');
                // Recarregar perfil para pegar novas fotos
                const profileRes = await fetch(`${BASE}/companies/profile`, { headers: authH() });
                const profile = await profileRes.json();
                renderPhotoGallery(profile.photos || []);
            } else {
                toast('Erro ao enviar fotos.', true);
            }
        } catch { toast('Erro de conexão.', true); }

        photoInput.value = '';
    });

    // ════════════════════════════════════════════════════════
    // EDITAR PERFIL
    // ════════════════════════════════════════════════════════
    $('edit-profile-form')?.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('[type=submit]');
        btn.disabled = true; btn.textContent = 'Salvando...';

        const fd = new FormData();
        const fields = { name:'ep-name', phone:'ep-phone', address:'ep-address', website:'ep-website', description:'ep-description', category:'ep-category' };
        Object.entries(fields).forEach(([key, id]) => {
            const v = $(id)?.value?.trim();
            if (v) fd.append(key, v);
        });

        try {
            const res = await fetch(`${BASE}/companies/profile`, { method:'PUT', headers: authH(), body: fd });
            const data = await res.json();
            if (res.ok) {
                toast('Perfil atualizado! ✨');
                closeModal('edit-modal');
                // Atualizar nome no header
                if ($('ep-name').value) $('company-name').textContent = $('ep-name').value;
            } else {
                toast(data.message || 'Erro ao atualizar perfil.', true);
            }
        } catch { toast('Erro de conexão.', true); }
        btn.disabled = false; btn.textContent = '💾 Salvar Perfil';
    });

    // ════════════════════════════════════════════════════════
    // IMAGE PREVIEWS
    // ════════════════════════════════════════════════════════
    function setupImagePreview(fileInputId, previewId) {
        $(fileInputId)?.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = e => {
                const prev = $(previewId);
                prev.src = e.target.result;
                prev.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }
    setupImagePreview('ev-image-file', 'ev-image-preview');
    setupImagePreview('edit-ev-image-file', 'edit-ev-image-preview');

    // ════════════════════════════════════════════════════════
    // BOTÕES DE AÇÃO RÁPIDA
    // ════════════════════════════════════════════════════════
    $('new-event-btn')?.addEventListener('click', () => openModal('event-modal'));
    $('qa-new-event')?.addEventListener('click', () => openModal('event-modal'));

    $('edit-profile-link')?.addEventListener('click', e => { e.preventDefault(); openModal('edit-modal'); });
    $('qa-edit-profile')?.addEventListener('click', () => openModal('edit-modal'));

    $('qa-copy-link')?.addEventListener('click', () => {
        if (!companyData) return;
        const link = `${window.location.origin}/pages/explore.html?company=${companyData.id}`;
        navigator.clipboard.writeText(link).then(() => {
            toast('Link copiado! 🔗');
        }).catch(() => {
            toast('Não foi possível copiar.', true);
        });
    });

    // ════════════════════════════════════════════════════════
    // LOGOUT
    // ════════════════════════════════════════════════════════
    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('company');
        window.location.href = 'login.html';
    }
    $('logout-btn')?.addEventListener('click', logout);
    $('logout-btn2')?.addEventListener('click', logout);

    // ════════════════════════════════════════════════════════
    // INIT
    // ════════════════════════════════════════════════════════
    await loadCompanyProfile();
    await loadEvents();
    await loadReviews();
});
