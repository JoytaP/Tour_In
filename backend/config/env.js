// backend/config/env.js
// Carrega e valida variáveis de ambiente. Falha rápido caso algo essencial
// esteja ausente, evitando comportamentos inseguros em produção
// (ex.: JWT_SECRET padrão "fraco" sendo usado silenciosamente).

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const required = ['JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(
        `[CONFIG] Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}.\n` +
        `Copie o arquivo .env.example para .env e preencha os valores.`
    );
    process.exit(1);
}

if (process.env.JWT_SECRET.length < 16) {
    console.error('[CONFIG] JWT_SECRET muito curto. Use pelo menos 16 caracteres aleatórios.');
    process.exit(1);
}

const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    dbPath: process.env.DB_PATH
        ? path.resolve(__dirname, '..', process.env.DB_PATH)
        : path.resolve(__dirname, '../../database/tourin.db'),
    apiUrl: process.env.API_URL || 'http://localhost:3000',
    corsOrigin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : '*',
    isProduction: (process.env.NODE_ENV || 'development') === 'production',
};

module.exports = env;
