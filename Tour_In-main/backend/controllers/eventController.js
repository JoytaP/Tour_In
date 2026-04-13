const db = require('../config/database');

// --- GARANTIR QUE A TABELA EXISTA ---
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME,
        location TEXT,
        category TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;

db.run(createTableQuery, (err) => {
    if (err) console.error("Erro ao criar tabela de eventos:", err.message);
});

// --- LISTAR EVENTOS ---
exports.getAll = (req, res) => {
    db.all(`SELECT * FROM events ORDER BY date ASC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// --- CRIAR EVENTOS DE TESTE (AGORA COM LIMPEZA) ---
exports.seedDatabase = (req, res) => {
    // 1. Primeiro APAGA tudo o que tem na tabela (Zera o banco)
    db.run('DELETE FROM events', [], (err) => {
        if (err) return res.status(500).json({ error: "Erro ao limpar banco" });

        // 2. Lista de eventos novos e bonitos com imagens
        const dummyEvents = [
            {
                title: "Festival de Rock",
                description: "As melhores bandas de rock da cidade reunidas em um só lugar. Food trucks e cerveja artesanal.",
                date: new Date(Date.now() + 86400000 * 2).toISOString(),
                location: "Estacionamento do Mané Garrincha",
                category: "show",
                image_url: "https://festrockbrasilia.com.br/wp-content/uploads/2024/06/mertal-legends.jpg"
            },
            {
                title: "Feira de Vinhos & Queijos",
                description: "Degustação de vinhos internacionais e queijos premiados. Workshop com sommeliers.",
                date: new Date(Date.now() + 86400000 * 5).toISOString(),
                location: "Pontão do Lago Sul",
                category: "gastronomy",
                image_url: "https://shoppingspirit.pt/wp-content/uploads/2019/02/continente.jpg"
            },
            {
                title: "Espetáculo: O Lago dos Cisnes",
                description: "A companhia nacional de ballet apresenta o clássico em uma noite inesquecível.",
                date: new Date(Date.now() + 86400000 * 10).toISOString(),
                location: "Teatro Nacional",
                category: "theater",
                image_url: "https://sesies.com.br/wp-content/uploads/2019/06/Lago_post-e1560444942197-1024x707.png"
            },
            {
                title: "Campeonato Regional de Skate",
                description: "Finais do campeonato regional. Venha torcer e aproveitar o dia de sol.",
                date: new Date(Date.now() + 86400000 * 12).toISOString(),
                location: "Arena Play",
                category: "sports",
                image_url: "https://www.agenciabrasilia.df.gov.br/documents/d/guest/whatsapp-image-2025-01-06-at-17-43-07-jpeg"
            },
            {
                title: "Exposição: Arte Moderna",
                description: "Uma imersão nas obras dos artistas locais mais promissores do momento.",
                date: new Date(Date.now() + 86400000 * 1).toISOString(),
                location: "CCBB Brasília",
                category: "theater",
                image_url: "https://www.brasilianatrilha.com/wp-content/uploads/2023/05/20230507_103756-1024x577.jpg"
            }
        ];

        // 3. Insere os novos
        const stmt = db.prepare(`INSERT INTO events (title, description, date, location, category, image_url) VALUES (?, ?, ?, ?, ?, ?)`);
        
        dummyEvents.forEach(evt => {
            stmt.run(evt.title, evt.description, evt.date, evt.location, evt.category, evt.image_url);
        });

        stmt.finalize();
        res.json({ message: "Banco limpo e recriado com imagens novas!" });
    });
};