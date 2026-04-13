const path = require('path');
// AJUSTE: Aponta para o node_modules dentro da pasta backend
const sqlite3 = require('../backend/node_modules/sqlite3').verbose();
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'tourin.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado ao banco de dados SQLite.');
});

const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Erro ao executar schema:', err);
    } else {
        console.log('Tabelas criadas com sucesso.');
        
        // Seed básico para teste
        const checkSeed = "SELECT count(*) as count FROM events";
        db.get(checkSeed, [], (err, row) => {
            if (!err && row && row.count === 0) {
                console.log('Inserindo dados iniciais...');
                db.run(`INSERT INTO events (title, description, date, location, category) VALUES 
                ('Feira da Torre', 'Artesanato e comida típica', '2024-12-20 09:00:00', 'Torre de TV', 'culture'),
                ('Festival de Jazz', 'Música ao vivo no parque', '2024-12-21 18:00:00', 'Parque da Cidade', 'culture')`);
            }
        });
    }
});