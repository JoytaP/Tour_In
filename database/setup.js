const path = require('path');
<<<<<<< HEAD
=======
// AJUSTE: Aponta para o node_modules dentro da pasta backend
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
const sqlite3 = require('../backend/node_modules/sqlite3').verbose();
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'tourin.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');
<<<<<<< HEAD
const seedPath = path.resolve(__dirname, 'seed.sql');
=======
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado ao banco de dados SQLite.');
});

<<<<<<< HEAD
db.serialize(() => {
    // 1. Cria/atualiza tabelas
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
        if (err) return console.error('Erro ao executar schema:', err);
        console.log('Tabelas criadas/verificadas com sucesso.');

        // 2. Insere seed somente se não houver lugares
        db.get('SELECT COUNT(*) as count FROM places', [], (err, row) => {
            if (!err && row && row.count === 0) {
                console.log('Inserindo dados de Brasília...');
                const seed = fs.readFileSync(seedPath, 'utf8');
                db.exec(seed, (err2) => {
                    if (err2) console.error('Erro no seed:', err2.message);
                    else console.log('Dados de Brasília inseridos com sucesso!');
                    db.close();
                });
            } else {
                console.log(`Banco já contém ${row?.count || '?'} lugares. Seed ignorado.`);
                db.close();
            }
        });
    });
});
=======
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
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
