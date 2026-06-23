const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// ─── HELPER: Geocoding ───────────────────────────────────────────────────────
async function getCoordinates(address) {
    if (!address) return { lat: null, lon: null };
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'TourInApp/1.0' } });
        const data = await response.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    } catch (e) {
        console.error('Geocoding falhou:', e.message);
    }
    return { lat: null, lon: null };
}

function signCompanyToken(payload) {
    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// ─── 1. REGISTRAR + retorna token diretamente ─────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
    const { name, cnpj, category, phone, address, website, description, email, password } = req.body;

    const existing = await db.getAsync(`SELECT id FROM users WHERE email = ?`, [email]);
    if (existing) throw new AppError('E-mail já cadastrado.', 400);

    if (cnpj) {
        const existingCnpj = await db.getAsync(`SELECT id FROM users WHERE cnpj = ?`, [cnpj]);
        if (existingCnpj) throw new AppError('CNPJ já cadastrado.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const coords = await getCoordinates(address);

    let photos = [];
    if (req.files && req.files.length > 0) {
        photos = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const q = `INSERT INTO users
        (name, email, password, role, cnpj, category, phone, address, website, description, photos, lat, lon)
        VALUES (?, ?, ?, 'company', ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const result = await db.runAsync(q, [
        name, email, hashedPassword, cnpj || null, category || null, phone || null,
        address || null, website || null, description || null,
        JSON.stringify(photos), coords.lat, coords.lon,
    ]);

    const newId = result.lastID;
    const token = signCompanyToken({ userId: newId, role: 'company', name, email });

    res.status(201).json({
        success: true,
        message: 'Empresa cadastrada com sucesso!',
        token,
        user: { id: newId, name, email, category: category || null, role: 'company' },
    });
});

// ─── 2. LOGIN ─────────────────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await db.getAsync(`SELECT * FROM users WHERE email = ? AND role = 'company'`, [email]);
    if (!user) throw new AppError('Credenciais inválidas.', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new AppError('Credenciais inválidas.', 401);

    const token = signCompanyToken({ userId: user.id, role: user.role, name: user.name, email: user.email });
    res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, category: user.category, role: user.role },
    });
});

// ─── 3. PERFIL (GET) ──────────────────────────────────────────────────────────
exports.getProfile = asyncHandler(async (req, res) => {
    const row = await db.getAsync(
        `SELECT id, name, email, category, phone, address, website, description, photos, lat, lon, cnpj, operating_hours, profile_views, created_at
         FROM users WHERE id = ? AND role = 'company'`,
        [req.user.userId]
    );
    if (!row) throw new AppError('Empresa não encontrada.', 404);
    try { row.photos = JSON.parse(row.photos || '[]'); } catch (e) { row.photos = []; }
    try { row.operating_hours = JSON.parse(row.operating_hours || '{}'); } catch (e) { row.operating_hours = {}; }
    res.json(row);
});

// ─── 4. ATUALIZAR PERFIL ──────────────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { name, phone, address, website, description, category } = req.body;

    const updateFields = [];
    const params = [];

    if (name) { updateFields.push('name = ?'); params.push(name); }
    if (phone) { updateFields.push('phone = ?'); params.push(phone); }
    if (website) { updateFields.push('website = ?'); params.push(website); }
    if (description) { updateFields.push('description = ?'); params.push(description); }
    if (category) { updateFields.push('category = ?'); params.push(category); }

    if (address) {
        updateFields.push('address = ?');
        params.push(address);
        const coords = await getCoordinates(address);
        if (coords.lat) {
            updateFields.push('lat = ?'); params.push(coords.lat);
            updateFields.push('lon = ?'); params.push(coords.lon);
        }
    }

    if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map((f) => `/uploads/${f.filename}`);
        const row = await db.getAsync(`SELECT photos FROM users WHERE id = ?`, [userId]);
        let existingPhotos = [];
        try { existingPhotos = JSON.parse(row?.photos || '[]'); } catch (e) { /* noop */ }
        const merged = [...existingPhotos, ...newPhotos];
        updateFields.push('photos = ?');
        params.push(JSON.stringify(merged));
    }

    if (!updateFields.length) throw new AppError('Nenhum campo para atualizar.', 400);

    params.push(userId);
    await db.runAsync(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role = 'company'`, params);
    res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
});

// ─── 5. REMOVER FOTO DO PERFIL ────────────────────────────────────────────────
exports.removePhoto = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { photoUrl } = req.body;

    const row = await db.getAsync(`SELECT photos FROM users WHERE id = ?`, [userId]);
    let photos = [];
    try { photos = JSON.parse(row?.photos || '[]'); } catch (e) { /* noop */ }
    const updated = photos.filter((p) => p !== photoUrl);

    await db.runAsync(`UPDATE users SET photos = ? WHERE id = ?`, [JSON.stringify(updated), userId]);
    res.json({ success: true, message: 'Foto removida.', photos: updated });
});

// ─── 6. CRIAR EVENTO ──────────────────────────────────────────────────────────
exports.createEvent = asyncHandler(async (req, res) => {
    const companyId = req.user.userId;
    const { title, description, date, location, category } = req.body;

    let image_url = req.body.image_url || null;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    const result = await db.runAsync(
        `INSERT INTO events (title, description, date, location, category, image_url, company_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, date, location, category, image_url, companyId]
    );

    res.status(201).json({
        success: true,
        message: 'Evento criado com sucesso!',
        event: { id: result.lastID, title, description, date, location, category, image_url },
    });
});

// ─── 7. LISTAR EVENTOS DA EMPRESA ─────────────────────────────────────────────
exports.getMyEvents = asyncHandler(async (req, res) => {
    const rows = await db.allAsync(`SELECT * FROM events WHERE company_id = ? ORDER BY date ASC`, [req.user.userId]);
    res.json(rows);
});

// ─── 7b. ATUALIZAR EVENTO ────────────────────────────────────────────────────
exports.updateEvent = asyncHandler(async (req, res) => {
    const companyId = req.user.userId;
    const eventId   = req.params.eventId;
    const { title, description, date, location, category } = req.body;

    const existing = await db.getAsync(
        `SELECT id FROM events WHERE id = ? AND company_id = ?`,
        [eventId, companyId]
    );
    if (!existing) throw new AppError('Evento não encontrado.', 404);

    const fields = [];
    const params = [];

    if (title)       { fields.push('title = ?');       params.push(title); }
    if (description) { fields.push('description = ?'); params.push(description); }
    if (date)        { fields.push('date = ?');        params.push(date); }
    if (location)    { fields.push('location = ?');    params.push(location); }
    if (category)    { fields.push('category = ?');    params.push(category); }

    // imagem: upload de arquivo tem prioridade, depois URL texto
    if (req.file) {
        fields.push('image_url = ?');
        params.push(`/uploads/${req.file.filename}`);
    } else if (req.body.image_url !== undefined) {
        fields.push('image_url = ?');
        params.push(req.body.image_url);
    }

    if (!fields.length) throw new AppError('Nenhum campo para atualizar.', 400);

    params.push(eventId, companyId);
    await db.runAsync(
        `UPDATE events SET ${fields.join(', ')} WHERE id = ? AND company_id = ?`,
        params
    );
    res.json({ success: true, message: 'Evento atualizado com sucesso!' });
});

// ─── 8. DELETAR EVENTO ────────────────────────────────────────────────────────
exports.deleteEvent = asyncHandler(async (req, res) => {
    const result = await db.runAsync(
        `DELETE FROM events WHERE id = ? AND company_id = ?`,
        [req.params.eventId, req.user.userId]
    );
    if (result.changes === 0) throw new AppError('Evento não encontrado.', 404);
    res.json({ success: true, message: 'Evento excluído.' });
});

// ─── 9a. AVALIAÇÕES DA EMPRESA ────────────────────────────────────────────────
exports.getCompanyReviews = asyncHandler(async (req, res) => {
    const companyId = req.user.userId;
    // Reviews dos eventos da empresa
    const rows = await db.allAsync(
        `SELECT r.*, u.name as user_name, e.title as event_title
         FROM reviews r
         JOIN users u ON u.id = r.user_id
         LEFT JOIN events e ON e.id = r.event_id
         WHERE e.company_id = ?
         ORDER BY r.created_at DESC
         LIMIT 20`,
        [companyId]
    );
    // Calcular média
    const avg = rows.length
        ? (rows.reduce((s, r) => s + r.rating, 0) / rows.length).toFixed(1)
        : null;
    res.json({ reviews: rows, avg_rating: avg });
});

// ─── 9b. ATUALIZAR HORÁRIOS ───────────────────────────────────────────────────
exports.updateHours = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { hours } = req.body; // objeto { segunda: "08:00-22:00", ... }
    if (!hours || typeof hours !== 'object') throw new AppError('Horários inválidos.', 400);
    await db.runAsync(
        `UPDATE users SET operating_hours = ? WHERE id = ? AND role = 'company'`,
        [JSON.stringify(hours), userId]
    );
    res.json({ success: true, message: 'Horários atualizados!' });
});

// ─── 9c. INCREMENTAR VISUALIZAÇÕES ───────────────────────────────────────────
exports.incrementViews = asyncHandler(async (req, res) => {
    const { companyId } = req.params;
    await db.runAsync(
        `UPDATE users SET profile_views = COALESCE(profile_views, 0) + 1 WHERE id = ? AND role = 'company'`,
        [companyId]
    );
    res.json({ success: true });
});

// ─── 9. BUSCAR EMPRESAS (público) ─────────────────────────────────────────────
exports.search = asyncHandler(async (req, res) => {
    const term = req.query.q || '';
    let sql = `SELECT id, name, category, address, description, photos, lat, lon FROM users WHERE role = 'company' AND lat IS NOT NULL`;
    const params = [];
    if (term) {
        sql += ` AND (name LIKE ? OR category LIKE ? OR description LIKE ?)`;
        params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }
    const rows = await db.allAsync(sql, params);
    rows.forEach((r) => { try { r.photos = JSON.parse(r.photos || '[]'); } catch (e) { r.photos = []; } });
    res.json(rows);
});
