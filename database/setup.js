const path = require('path');
const sqlite3 = require('../backend/node_modules/sqlite3').verbose();
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'tourin.db');
const schemaPath = path.resolve(__dirname, 'schema.sql');
const seedPath = path.resolve(__dirname, 'seed.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err.message);
    console.log('Conectado ao banco de dados SQLite.');
});

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
