// Script de migração — adiciona colunas faltantes sem destruir dados existentes
const path   = require('path');
const sqlite3 = require('../backend/node_modules/sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'tourin.db');
const db = new sqlite3.Database(dbPath, err => {
    if (err) return console.error('Erro ao conectar:', err.message);
    console.log('Conectado ao banco. Aplicando migrações...');
});

const migrations = [
    // Colunas de empresa na tabela users
    'ALTER TABLE users ADD COLUMN cnpj TEXT',
    'ALTER TABLE users ADD COLUMN category TEXT',
    'ALTER TABLE users ADD COLUMN address TEXT',
    'ALTER TABLE users ADD COLUMN website TEXT',
    'ALTER TABLE users ADD COLUMN description TEXT',
    'ALTER TABLE users ADD COLUMN photos TEXT',
    'ALTER TABLE users ADD COLUMN lat REAL',
    'ALTER TABLE users ADD COLUMN lon REAL',
    // Novas colunas
    'ALTER TABLE users ADD COLUMN operating_hours TEXT',
    'ALTER TABLE users ADD COLUMN profile_views INTEGER DEFAULT 0',
];

db.serialize(() => {
    migrations.forEach(sql => {
        db.run(sql, err => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Erro:', err.message, '|', sql);
            } else {
                console.log('OK (ou já existia):', sql.split('ADD COLUMN')[1]?.trim() || sql);
            }
        });
    });
    db.close(() => console.log('Migrações concluídas!'));
});
