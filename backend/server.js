// backend/server.js
const env = require('./config/env'); // valida variáveis de ambiente antes de tudo
const express = require('express');
const cors = require('cors');
const path = require('path');

const { securityHeaders, apiLimiter, authLimiter, sanitizeInput } = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const placeRoutes = require('./routes/places');
const companyRoutes = require('./routes/companies');
const eventRoutes = require('./routes/events');
const itineraryRoutes = require('./routes/itineraries');
const wishlistRoutes = require('./routes/wishlistRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// Confia no proxy (necessário para rate-limit/IP corretos atrás de proxies/load balancers)
app.set('trust proxy', 1);

// ── Segurança de cabeçalhos HTTP ──────────────────────────────────────────
app.use(securityHeaders);

// ── CORS ───────────────────────────────────────────────────────────────
app.use(cors({ origin: env.corsOrigin, credentials: true }));

// ── Parsing do corpo da requisição ────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Sanitização básica de entrada ─────────────────────────────────────────
app.use(sanitizeInput);

// ── Rate limiting geral para toda a API ───────────────────────────────────
app.use('/api', apiLimiter);

// ── Arquivos estáticos ─────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Rotas da API ───────────────────────────────────────────────────────────
// Rate limit mais restrito em rotas de autenticação (login/registro)
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/companies', authLimiter, companyRoutes);

app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reservations', reservationRoutes);

// ── Healthcheck ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', env: env.nodeEnv }));

// ── Fallback SPA para rotas de frontend ─────────────────────────────────────
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ── Tratamento de erros (sempre por último) ─────────────────────────────────
app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
    console.log(`Servidor rodando na porta ${env.port} [${env.nodeEnv}]`);
});

module.exports = app;
