document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const BASE =
        typeof API_URL !== 'undefined'
            ? API_URL
            : 'http://localhost:3000/api';

    // ═══════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════

    const $ = (id) => document.getElementById(id);

    const openModal = (id) => {
        $(id)?.classList.add('open');
    };

    const closeModal = (id) => {
        $(id)?.classList.remove('open');
    };

    const authHeaders = () => ({
        Authorization: `Bearer ${token}`
    });

    function showToast(msg) {

        let t = document.getElementById('_toast');

        if (!t) {

            t = document.createElement('div');

            t.id = '_toast';

            t.style.cssText = `
                position:fixed;
                bottom:30px;
                left:50%;
                transform:translateX(-50%);
                background:#00f2ff;
                color:#000;
                padding:12px 24px;
                border-radius:100px;
                font-weight:700;
                z-index:9999;
            `;

            document.body.appendChild(t);
        }

        t.textContent = msg;

        t.style.display = 'block';

        clearTimeout(t._timeout);

        t._timeout = setTimeout(() => {
            t.style.display = 'none';
        }, 3000);
    }

    function escapeHtml(str) {

        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function capitalize(str) {

        if (!str) return '—';

        const map = {
            restaurant: 'Restaurante',
            hotel: 'Hotel',
            tourism: 'Turismo',
            culture: 'Cultura',
            nightlife: 'Vida Noturna',
            sports: 'Esportes',
            other: 'Outro'
        };

        return map[str] || str;
    }

    // ═══════════════════════════════════════
    // FECHAR MODAIS
    // ═══════════════════════════════════════

    document.querySelectorAll('.modal-overlay')
        .forEach(modal => {

            modal.addEventListener('click', (e) => {

                if (e.target === modal) {
                    modal.classList.remove('open');
                }
            });
        });

    // ═══════════════════════════════════════
    // DADOS EMPRESA
    // ═══════════════════════════════════════

    let companyData = null;

    try {

        const response = await fetch(
            `${BASE}/companies/profile`,
            {
                headers: authHeaders()
            }
        );

        companyData = await response.json();

        $('company-name').textContent =
            companyData.name || 'Empresa';

        $('stat-category').textContent =
            capitalize(companyData.category);

        $('profile-views').textContent =
            companyData.profile_views || 0;

        // reviews fake temporário
        $('stat-reviews').textContent =
            '4.8⭐';

        renderPhotoGallery(
            companyData.photos || []
        );

    } catch(err) {

        console.error(err);

        alert('Erro ao carregar empresa.');
    }

    // ═══════════════════════════════════════
    // EVENTOS
    // ═══════════════════════════════════════

    await loadEvents();

    async function loadEvents() {

        const list = $('events-list');

        if (!list) return;

        list.innerHTML = `
            <p style="
                text-align:center;
                color:var(--text-muted);
                padding:20px;
            ">
                Carregando...
            </p>
        `;

        try {

            const response = await fetch(
                `${BASE}/companies/events`,
                {
                    headers: authHeaders()
                }
            );

            const events = await response.json();

            $('stat-events').textContent =
                events.length;

            const now = new Date();

            $('stat-upcoming').textContent =
                events.filter(ev =>
                    new Date(ev.date) >= now
                ).length;

            if (!events.length) {

                list.innerHTML = `
                    <div class="empty-state">

                        <span>📅</span>

                        Nenhum evento ainda.

                    </div>
                `;

                return;
            }

            list.innerHTML = events.map(ev => {

                const date =
                    new Date(ev.date);

                const formatted =
                    date.toLocaleDateString(
                        'pt-BR',
                        {
                            day:'2-digit',
                            month:'2-digit',
                            year:'numeric',
                            hour:'2-digit',
                            minute:'2-digit'
                        }
                    );

                return `

                    <div class="event-item-mini">

                        <div>

                            <strong>
                                ${escapeHtml(ev.title)}
                            </strong>

                            <p style="
                                color:var(--text-muted);
                                font-size:.85rem;
                            ">
                                ${formatted}
                            </p>

                        </div>

                        <div class="event-actions">

                            <button
                                class="edit-btn"
                                onclick="openEditEventModal(${ev.id})">

                                ✏️

                            </button>

                            <button
                                class="delete-btn"
                                onclick="deleteEvent(${ev.id})">

                                🗑️

                            </button>

                        </div>

                    </div>

                `;
            }).join('');

        } catch(err) {

            console.error(err);

            list.innerHTML = `
                <p style="
                    color:#ff4d4d;
                    text-align:center;
                ">
                    Erro ao carregar eventos.
                </p>
            `;
        }
    }

    // ═══════════════════════════════════════
    // CRIAR EVENTO
    // ═══════════════════════════════════════

    $('event-form')?.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            const formData =
                new FormData();

            formData.append(
                'title',
                $('ev-title').value
            );

            formData.append(
                'description',
                $('ev-description').value
            );

            formData.append(
                'date',
                $('ev-date').value
            );

            formData.append(
                'category',
                $('ev-category').value
            );

            formData.append(
                'location',
                $('ev-location').value
            );

            const imageFile =
                $('ev-image-file')?.files[0];

            const imageUrl =
                $('ev-image-url')?.value;

            if (imageFile) {

                formData.append(
                    'image',
                    imageFile
                );

            } else if (imageUrl) {

                formData.append(
                    'image_url',
                    imageUrl
                );
            }

            try {

                const response = await fetch(
                    `${BASE}/companies/events`,
                    {
                        method:'POST',
                        headers: authHeaders(),
                        body: formData
                    }
                );

                if (response.ok) {

                    showToast(
                        'Evento criado 🎉'
                    );

                    closeModal('event-modal');

                    e.target.reset();

                    await loadEvents();

                } else {

                    alert(
                        'Erro ao criar evento.'
                    );
                }

            } catch(err) {

                console.error(err);

                alert('Erro de conexão.');
            }
        }
    );

    // ═══════════════════════════════════════
    // EDITAR EVENTO
    // ═══════════════════════════════════════

    let currentEditEventId = null;

    window.openEditEventModal =
        async function(eventId) {

        currentEditEventId = eventId;

        try {

            const response = await fetch(
                `${BASE}/companies/events`,
                {
                    headers: authHeaders()
                }
            );

            const events =
                await response.json();

            const ev =
                events.find(
                    e => e.id == eventId
                );

            if (!ev) return;

            $('edit-event-title').value =
                ev.title || '';

            $('edit-event-description').value =
                ev.description || '';

            $('edit-event-date').value =
                ev.date || '';

            $('edit-event-image').value =
                ev.image_url || '';

            openModal('edit-event-modal');

        } catch(err) {

            console.error(err);
        }
    };

    $('edit-event-form')?.addEventListener(
        'submit',
        async (e) => {

            e.preventDefault();

            try {

                const response = await fetch(
                    `${BASE}/companies/events/${currentEditEventId}`,
                    {
                        method:'PUT',

                        headers:{
                            ...authHeaders(),
                            'Content-Type':'application/json'
                        },

                        body: JSON.stringify({

                            title:
                                $('edit-event-title').value,

                            description:
                                $('edit-event-description').value,

                            date:
                                $('edit-event-date').value,

                            image_url:
                                $('edit-event-image').value
                        })
                    }
                );

                if (response.ok) {

                    showToast(
                        'Evento atualizado ✨'
                    );

                    closeModal(
                        'edit-event-modal'
                    );

                    await loadEvents();

                } else {

                    alert(
                        'Erro ao atualizar.'
                    );
                }

            } catch(err) {

                console.error(err);

                alert('Erro de conexão.');
            }
        }
    );

    // ═══════════════════════════════════════
    // DELETAR EVENTO
    // ═══════════════════════════════════════

    window.deleteEvent =
        async function(eventId) {

        const confirmDelete =
            confirm(
                'Excluir este evento?'
            );

        if (!confirmDelete) return;

        try {

            const response = await fetch(
                `${BASE}/companies/events/${eventId}`,
                {
                    method:'DELETE',
                    headers: authHeaders()
                }
            );

            if (response.ok) {

                showToast(
                    'Evento excluído.'
                );

                await loadEvents();

            } else {

                alert(
                    'Erro ao excluir.'
                );
            }

        } catch(err) {

            console.error(err);
        }
    };

    // ═══════════════════════════════════════
    // FOTOS
    // ═══════════════════════════════════════

    function renderPhotoGallery(photos) {

        const gallery =
            $('photo-gallery');

        if (!gallery) return;

        if (!photos.length) {

            gallery.innerHTML = `
                <p style="
                    color:var(--text-muted);
                ">
                    Nenhuma foto ainda.
                </p>
            `;

            return;
        }

        gallery.innerHTML = photos.map(url => {

            const src =
                url.startsWith('/')
                    ? `http://localhost:3000${url}`
                    : url;

            return `

                <img
                    src="${src}"

                    style="
                        width:90px;
                        height:90px;
                        object-fit:cover;
                        border-radius:14px;
                    "
                >

            `;
        }).join('');
    }

    // ═══════════════════════════════════════
    // BOTÕES
    // ═══════════════════════════════════════

    $('new-event-btn')
        ?.addEventListener(
            'click',
            () => openModal('event-modal')
        );

    $('edit-profile-link')
        ?.addEventListener(
            'click',
            (e) => {

                e.preventDefault();

                openModal('edit-modal');
            }
        );

    $('logout-btn')
        ?.addEventListener(
            'click',
            logout
        );

    function logout() {

        localStorage.removeItem('token');

        localStorage.removeItem('company');

        window.location.href =
            'login.html';
    }

});