// backend/config/database.js
const sqlite3 = require('sqlite3').verbose();
const env = require('./env');

const db = new sqlite3.Database(env.dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
        console.error('Caminho tentado:', env.dbPath);
        process.exit(1);
    } else {
        console.log(`Conectado ao banco de dados SQLite (${env.dbPath}).`);
        // Garante integridade referencial (chaves estrangeiras) no SQLite,
        // que vêm desativadas por padrão.
        db.run('PRAGMA foreign_keys = ON');

        // ── Migration automática ────────────────────────────────────────────
        // Adiciona colunas novas sem apagar dados existentes.
        // Não usa "IF NOT EXISTS" pois versões antigas do SQLite (< 3.37)
        // não suportam essa sintaxe no ALTER TABLE.
        const addColumn = (col, def) => {
            db.run(`ALTER TABLE users ADD COLUMN ${col} ${def}`, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error(`[Migration] Falha ao adicionar ${col}:`, err.message);
                }
            });
        };

        db.serialize(() => {
            addColumn('operating_hours', 'TEXT');
            addColumn('profile_views', 'INTEGER DEFAULT 0');
        });
        // ───────────────────────────────────────────────────────────────────
    }
});

// ─────────────────────────────────────────────────────────────────────────
// Helpers promisificados — permitem usar async/await de forma consistente
// em toda a camada de modelos, eliminando o "callback hell" do código
// original e centralizando o tratamento de erros.
// ─────────────────────────────────────────────────────────────────────────

db.runAsync = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this.lastID, changes: this.changes });
        });
    });

db.getAsync = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });

db.allAsync = (sql, params = []) =>
    new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });

module.exports = db;
