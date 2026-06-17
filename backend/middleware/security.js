// backend/middleware/security.js
// Concentra as camadas de segurança de nível HTTP da aplicação, implementadas
// sem dependências externas adicionais (apenas módulos nativos do Node),
// para manter a lista de dependências do projeto original:
//  - Cabeçalhos de segurança (equivalentes ao essencial do "helmet")
//  - Rate limiting em memória (login/registro e API geral)
//  - Sanitização básica de entrada

const env = require('../config/env');

// ── Cabeçalhos de segurança HTTP ───────────────────────────────────────────
// Conjunto mínimo e amplamente recomendado de cabeçalhos, equivalente ao que
// o helmet aplica por padrão, sem precisar da dependência externa.
function securityHeaders(req, res, next) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0'); // obsoleto; CSP é a proteção moderna
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.removeHeader('X-Powered-By');
    if (env.isProduction) {
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    }
    next();
}

// ── Rate limiting em memória ────────────────────────────────────────────────
// Implementação simples baseada em janela fixa por IP. Adequada para uma
// instância única; em ambientes com múltiplas instâncias, recomenda-se
// substituir por um store compartilhado (ex.: Redis).
function createRateLimiter({ windowMs, max, message }) {
    const hits = new Map(); // ip -> { count, resetAt }

    // Limpeza periódica para não acumular memória indefinidamente.
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of hits.entries()) {
            if (entry.resetAt <= now) hits.delete(key);
        }
    }, windowMs).unref();

    return (req, res, next) => {
        const key = req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();

        let entry = hits.get(key);
        if (!entry || entry.resetAt <= now) {
            entry = { count: 0, resetAt: now + windowMs };
            hits.set(key, entry);
        }

        entry.count += 1;

        res.setHeader('RateLimit-Limit', String(max));
        res.setHeader('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
        res.setHeader('RateLimit-Reset', String(Math.ceil((entry.resetAt - now) / 1000)));

        if (entry.count > max) {
            return res.status(429).json(
                message || { success: false, message: 'Muitas requisições. Tente novamente mais tarde.' }
            );
        }
        next();
    };
}

// Limite geral: protege toda a API contra abuso/DoS simples.
const apiLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 300,
    message: { success: false, message: 'Muitas requisições. Tente novamente em alguns minutos.' },
});

// Limite restrito para rotas sensíveis de autenticação (login/registro),
// mitigando ataques de força bruta de senha.
const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

/**
 * Sanitização simples de strings em body/query/params: remove caracteres de
 * controle e chaves de objeto suspeitas (ex.: "$where", "a.b") — relevante
 * caso o projeto evolua para um banco NoSQL, e inofensivo para SQLite.
 * A proteção primária contra SQL Injection vem do uso de queries
 * parametrizadas (?, params) em todos os models.
 */
function sanitizeInput(req, res, next) {
    const clean = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
                continue;
            }
            if (typeof obj[key] === 'string') {
                // eslint-disable-next-line no-control-regex
                obj[key] = obj[key].replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
            } else if (typeof obj[key] === 'object') {
                clean(obj[key]);
            }
        }
    };
    clean(req.body);
    clean(req.query);
    clean(req.params);
    next();
}

module.exports = { securityHeaders, apiLimiter, authLimiter, sanitizeInput };
