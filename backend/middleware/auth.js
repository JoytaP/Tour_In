// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Middleware de autenticação obrigatória.
 * Exige um header "Authorization: Bearer <token>" válido.
 */
function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new AppError('Token de autenticação não fornecido.', 401);
        }

        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof AppError) return next(error);
        return next(new AppError('Sessão inválida ou expirada. Faça login novamente.', 401));
    }
}

/**
 * Middleware de autenticação opcional.
 * Se um token válido for enviado, popula req.user; caso contrário,
 * segue a requisição normalmente (sem bloquear).
 * Usado em rotas públicas que se comportam de forma diferente
 * para usuários autenticados (ex.: reservas anônimas vs. logadas).
 */
function optionalAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (header && header.startsWith('Bearer ')) {
            const token = header.split(' ')[1];
            req.user = jwt.verify(token, env.jwtSecret);
        }
    } catch (e) {
        // Token inválido em rota opcional: ignora e segue sem usuário autenticado.
    }
    next();
}

/**
 * Middleware de autorização por papel (role).
 * Uso: router.get('/x', requireAuth, requireRole('company'), ctrl.x)
 */
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('Acesso não autorizado para este perfil.', 403));
        }
        next();
    };
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.optionalAuth = optionalAuth;
module.exports.requireRole = requireRole;
