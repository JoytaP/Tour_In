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
