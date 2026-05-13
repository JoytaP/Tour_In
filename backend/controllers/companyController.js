const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ─── HELPER: Geocoding ───────────────────────────────────────────────────────
async function getCoordinates(address) {
    if (!address) return { lat: null, lon: null };
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const res = await fetch(url, { headers: { 'User-Agent': 'TourInApp/1.0' } });
        const data = await res.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (e) { console.error('Geocoding falhou:', e.message); }
    return { lat: null, lon: null };
}

// ─── 1. REGISTRAR ─────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
    try {
        const { name, cnpj, category, phone, address, website, description, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios.' });

        db.get(`SELECT id FROM users WHERE email = ?`, [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ message: 'E-mail já cadastrado.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const coords = await getCoordinates(address);

            // Fotos enviadas via multipart
            let photos = [];
            if (req.files && req.files.length > 0) {
                photos = req.files.map(f => `/uploads/${f.filename}`);
            }

            const q = `INSERT INTO users
                (name, email, password, role, cnpj, category, phone, address, website, description, photos, lat, lon)
                VALUES (?, ?, ?, 'company', ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(q, [name, email, hashedPassword, cnpj, category, phone,
                       address, website, description, JSON.stringify(photos), coords.lat, coords.lon],
                function(err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.status(201).json({ message: 'Empresa cadastrada com sucesso!', id: this.lastID });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

// ─── 2. LOGIN ─────────────────────────────────────────────────────────────────
exports.login = (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND role = 'company'`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Empresa não encontrada.' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Senha incorreta.' });

        const token = jwt.sign(
            { userId: user.id, role: user.role, name: user.name, email: user.email },
            process.env.JWT_SECRET || 'SEU_SEGREDO_JWT',
            { expiresIn: '24h' }
        );
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, category: user.category } });
    });
};

// ─── 3. PERFIL (GET) ──────────────────────────────────────────────────────────
exports.getProfile = (req, res) => {
    db.get(
        `SELECT id, name, email, category, phone, address, website, description, photos, lat, lon, cnpj, created_at
         FROM users WHERE id = ? AND role = 'company'`,
        [req.user.userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ message: 'Empresa não encontrada.' });
            try { row.photos = JSON.parse(row.photos || '[]'); } catch(e) { row.photos = []; }
            res.json(row);
        }
    );
};

// ─── 4. ATUALIZAR PERFIL ──────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { name, phone, address, website, description, category } = req.body;

    const updateFields = [];
    const params = [];

    if (name)        { updateFields.push('name = ?');        params.push(name); }
    if (phone)       { updateFields.push('phone = ?');       params.push(phone); }
    if (website)     { updateFields.push('website = ?');     params.push(website); }
    if (description) { updateFields.push('description = ?'); params.push(description); }
    if (category)    { updateFields.push('category = ?');    params.push(category); }

    if (address) {
        updateFields.push('address = ?');
        params.push(address);
        const coords = await getCoordinates(address);
        if (coords.lat) {
            updateFields.push('lat = ?'); params.push(coords.lat);
            updateFields.push('lon = ?'); params.push(coords.lon);
        }
    }

    // Novas fotos enviadas
    if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(f => `/uploads/${f.filename}`);
        // Busca fotos existentes e mescla
        db.get(`SELECT photos FROM users WHERE id = ?`, [userId], (err, row) => {
            let existing = [];
            try { existing = JSON.parse(row?.photos || '[]'); } catch(e) {}
            const merged = [...existing, ...newPhotos];
            updateFields.push('photos = ?');
            params.push(JSON.stringify(merged));
            runUpdate();
        });
        return;
    }
    runUpdate();

    function runUpdate() {
        if (!updateFields.length) return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
        params.push(userId);
        db.run(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role = 'company'`, params, function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Perfil atualizado com sucesso!' });
        });
    }
};

// ─── 5. REMOVER FOTO DO PERFIL ────────────────────────────────────────────────
exports.removePhoto = (req, res) => {
    const userId = req.user.userId;
    const { photoUrl } = req.body;

    db.get(`SELECT photos FROM users WHERE id = ?`, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        let photos = [];
        try { photos = JSON.parse(row?.photos || '[]'); } catch(e) {}
        const updated = photos.filter(p => p !== photoUrl);
        db.run(`UPDATE users SET photos = ? WHERE id = ?`, [JSON.stringify(updated), userId], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Foto removida.', photos: updated });
        });
    });
};

// ─── 6. CRIAR EVENTO ──────────────────────────────────────────────────────────
exports.createEvent = (req, res) => {
    const companyId = req.user.userId;
    const { title, description, date, location, category } = req.body;

    if (!title || !date) return res.status(400).json({ message: 'Título e data são obrigatórios.' });

    let image_url = req.body.image_url || null;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    db.run(
        `INSERT INTO events (title, description, date, location, category, image_url, company_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, date, location, category, image_url, companyId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                message: 'Evento criado com sucesso!',
                event: { id: this.lastID, title, description, date, location, category, image_url }
            });
        }
    );
};

// ─── 7. LISTAR EVENTOS DA EMPRESA ─────────────────────────────────────────────
exports.getMyEvents = (req, res) => {
    db.all(`SELECT * FROM events WHERE company_id = ? ORDER BY date ASC`, [req.user.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// ─── 8. DELETAR EVENTO ────────────────────────────────────────────────────────
exports.deleteEvent = (req, res) => {
    db.run(
        `DELETE FROM events WHERE id = ? AND company_id = ?`,
        [req.params.eventId, req.user.userId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Evento não encontrado.' });
            res.json({ message: 'Evento excluído.' });
        }
    );
};

// ─── 9. BUSCAR EMPRESAS (público) ─────────────────────────────────────────────
exports.search = (req, res) => {
    const term = req.query.q || '';
    let sql = `SELECT id, name, category, address, description, photos, lat, lon FROM users WHERE role = 'company' AND lat IS NOT NULL`;
    const params = [];
    if (term) {
        sql += ` AND (name LIKE ? OR category LIKE ? OR description LIKE ?)`;
        params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        rows.forEach(r => { try { r.photos = JSON.parse(r.photos || '[]'); } catch(e) { r.photos = []; } });
        res.json(rows);
    });
};
