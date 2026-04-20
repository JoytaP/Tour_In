const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- HELPER: Geocoding ---
async function getCoordinates(address) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        const response = await fetch(url, { headers: { 'User-Agent': 'TourInApp/1.0' } });
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: data[0].lat, lon: data[0].lon };
        }
    } catch (error) {
        console.error("Erro ao geolocalizar endereço:", error);
    }
    return { lat: null, lon: null };
}

// --- 1. REGISTRAR EMPRESA ---
exports.register = async (req, res) => {
    try {
        const { name, cnpj, category, phone, address, website, description, email, password } = req.body;

        let photoPaths = [];
        if (req.files && req.files.length > 0) {
            photoPaths = req.files.map(file => `/uploads/${file.filename}`);
        }

        db.get(`SELECT id FROM users WHERE email = ?`, [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ message: 'E-mail já cadastrado.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const coords = await getCoordinates(address);

            const query = `
                INSERT INTO users (name, email, password, role, cnpj, category, phone, address, website, description, photos, lat, lon)
                VALUES (?, ?, ?, 'company', ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                name, email, hashedPassword, cnpj, category, phone,
                address, website, description,
                JSON.stringify(photoPaths),
                coords.lat, coords.lon
            ];

            db.run(query, params, function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: 'Empresa cadastrada com sucesso!', id: this.lastID });
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

// --- 2. LOGIN ---
exports.login = (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ? AND role = 'company'`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Empresa não encontrada.' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ message: 'Senha incorreta.' });

        const token = jwt.sign(
            { userId: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'SEU_SEGREDO_JWT',
            { expiresIn: '24h' }
        );
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, category: user.category }
        });
    });
};

// --- 3. PERFIL DA EMPRESA (autenticado) ---
exports.getProfile = (req, res) => {
    const userId = req.user.userId;

    db.get(
        `SELECT id, name, email, category, phone, address, website, description, photos, lat, lon, cnpj, created_at
         FROM users WHERE id = ? AND role = 'company'`,
        [userId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ message: 'Empresa não encontrada.' });

            // Parse photos JSON
            try { row.photos = JSON.parse(row.photos || '[]'); } catch(e) { row.photos = []; }
            res.json(row);
        }
    );
};

// --- 4. EDITAR PERFIL DA EMPRESA ---
exports.updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const { name, phone, address, website, description, category } = req.body;

    let updateFields = [];
    let params = [];

    if (name)        { updateFields.push('name = ?');        params.push(name); }
    if (phone)       { updateFields.push('phone = ?');       params.push(phone); }
    if (address)     { updateFields.push('address = ?');     params.push(address); }
    if (website)     { updateFields.push('website = ?');     params.push(website); }
    if (description) { updateFields.push('description = ?'); params.push(description); }
    if (category)    { updateFields.push('category = ?');    params.push(category); }

    // Se o endereço mudou, recalcula coordenadas
    if (address) {
        const coords = await getCoordinates(address);
        if (coords.lat) {
            updateFields.push('lat = ?', 'lon = ?');
            params.push(coords.lat, coords.lon);
        }
    }

    // Fotos novas (upload)
    if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(f => `/uploads/${f.filename}`);
        // Busca fotos existentes e adiciona as novas
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
        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'Nenhum campo para atualizar.' });
        }
        params.push(userId);
        db.run(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role = 'company'`,
            params,
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: 'Perfil atualizado com sucesso!' });
            }
        );
    }
};

// --- 5. CRIAR EVENTO (empresa autenticada) ---
exports.createEvent = (req, res) => {
    const companyId = req.user.userId;
    const { title, description, date, location, category } = req.body;

    if (!title || !date) {
        return res.status(400).json({ message: 'Título e data são obrigatórios.' });
    }

    let image_url = null;
    if (req.file) {
        image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
        image_url = req.body.image_url;
    }

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

// --- 6. LISTAR EVENTOS DA EMPRESA ---
exports.getMyEvents = (req, res) => {
    const companyId = req.user.userId;

    db.all(
        `SELECT * FROM events WHERE company_id = ? ORDER BY date ASC`,
        [companyId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
};

// --- 7. DELETAR EVENTO ---
exports.deleteEvent = (req, res) => {
    const companyId = req.user.userId;
    const eventId = req.params.eventId;

    db.run(
        `DELETE FROM events WHERE id = ? AND company_id = ?`,
        [eventId, companyId],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ message: 'Evento não encontrado ou sem permissão.' });
            res.json({ message: 'Evento deletado com sucesso.' });
        }
    );
};

// --- 8. BUSCAR EMPRESAS (mapa público) ---
exports.search = (req, res) => {
    const term = req.query.q || '';

    let sql = `SELECT id, name, category, address, description, photos, lat, lon
               FROM users WHERE role = 'company' AND lat IS NOT NULL`;
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
