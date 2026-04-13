const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- 1. HELPER: Converter Endereço em Latitude/Longitude (Geocoding) ---
async function getCoordinates(address) {
    try {
        // Usa a API do OpenStreetMap para descobrir a lat/lon do endereço
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
        
        // O Header User-Agent é obrigatório para a API do Nominatim não bloquear
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

// --- 2. REGISTRAR EMPRESA ---
exports.register = async (req, res) => {
    try {
        const { name, cnpj, category, phone, address, website, description, email, password } = req.body;
        
        // Processa fotos (se houver)
        let photoPaths = [];
        if (req.files && req.files.length > 0) {
            photoPaths = req.files.map(file => file.path);
        }

        // Verifica se e-mail já existe
        db.get(`SELECT id FROM users WHERE email = ?`, [email], async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (row) return res.status(400).json({ message: 'E-mail já cadastrado.' });

            const hashedPassword = await bcrypt.hash(password, 10);

            // AQUI ACONTECE A MÁGICA: Converte endereço em coordenadas
            const coords = await getCoordinates(address);

            // Query de inserção (incluindo lat e lon)
            const query = `
                INSERT INTO users (name, email, password, role, cnpj, category, phone, address, website, description, photos, lat, lon)
                VALUES (?, ?, ?, 'company', ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                name, email, hashedPassword, cnpj, category, phone, address, website, description, 
                JSON.stringify(photoPaths), // Salva array de fotos como texto JSON
                coords.lat, coords.lon      // Salva as coordenadas calculadas
            ];

            db.run(query, params, function(err) {
                if (err) {
                    if(err.message.includes('no such column')) {
                        return res.status(500).json({ error: "ERRO: Colunas lat/lon não existem. Apague o arquivo database.sqlite e reinicie o servidor." });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({ message: 'Empresa cadastrada e localizada no mapa!', id: this.lastID });
            });
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};

// --- 3. LOGIN ---
exports.login = (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ? AND role = 'company'`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ message: 'Empresa não encontrada.' });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(401).json({ message: 'Senha incorreta.' });

        const token = jwt.sign({ userId: user.id, role: user.role, name: user.name }, 'SEU_SEGREDO_JWT', { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    });
};

// --- 4. BUSCAR EMPRESAS (NOVO ENDPOINT) ---
exports.search = (req, res) => {
    const term = req.query.q || '';
    
    // Busca apenas empresas que tenham coordenadas (lat/lon) preenchidas
    let sql = `SELECT id, name, category, address, description, photos, lat, lon FROM users WHERE role = 'company' AND lat IS NOT NULL`;
    const params = [];

    // Se tiver termo de busca, filtra por nome ou categoria
    if (term) {
        sql += ` AND (name LIKE ? OR category LIKE ? OR description LIKE ?)`;
        params.push(`%${term}%`, `%${term}%`, `%${term}%`);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};