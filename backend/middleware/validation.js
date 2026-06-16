// backend/middleware/validation.js
// Validações de entrada para os principais endpoints da API.
// Mantém a aplicação sem dependências externas pesadas de validação,
// mas centraliza e padroniza as regras (evitando checagens
// espalhadas e inconsistentes pelos controllers).

const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(v) {
    return typeof v === 'string' && v.trim().length > 0;
}

// ── Autenticação de usuário ──────────────────────────────────────────────
exports.validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    if (!isNonEmptyString(name) || name.trim().length < 2) {
        return next(new AppError('Nome é obrigatório e deve ter ao menos 2 caracteres.', 400));
    }
    if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email)) {
        return next(new AppError('Informe um e-mail válido.', 400));
    }
    if (!isNonEmptyString(password) || password.length < 6) {
        return next(new AppError('A senha deve ter ao menos 6 caracteres.', 400));
    }

    // Normaliza e-mail (evita duplicidade por caixa alta/baixa)
    req.body.email = email.trim().toLowerCase();
    req.body.name = name.trim();
    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return next(new AppError('E-mail e senha são obrigatórios.', 400));
    }
    req.body.email = email.trim().toLowerCase();
    next();
};

// ── Empresas ────────────────────────────────────────────────────────────
exports.validateCompanyRegistration = (req, res, next) => {
    const { name, email, password, phone, address, category } = req.body;

    if (!isNonEmptyString(name)) return next(new AppError('Nome da empresa é obrigatório.', 400));
    if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email)) {
        return next(new AppError('Informe um e-mail válido.', 400));
    }
    if (!isNonEmptyString(password) || password.length < 6) {
        return next(new AppError('A senha deve ter ao menos 6 caracteres.', 400));
    }
    if (!isNonEmptyString(phone)) return next(new AppError('Telefone é obrigatório.', 400));
    if (!isNonEmptyString(address)) return next(new AppError('Endereço é obrigatório.', 400));
    if (!isNonEmptyString(category)) return next(new AppError('Categoria é obrigatória.', 400));

    req.body.email = email.trim().toLowerCase();
    next();
};

// ── Locais (places) ────────────────────────────────────────────────────
exports.validatePlaceCreate = (req, res, next) => {
    const { name, lat, lon } = req.body;
    if (!isNonEmptyString(name)) return next(new AppError('O nome do local é obrigatório.', 400));
    if (lat !== undefined && lat !== '' && Number.isNaN(parseFloat(lat))) {
        return next(new AppError('Latitude inválida.', 400));
    }
    if (lon !== undefined && lon !== '' && Number.isNaN(parseFloat(lon))) {
        return next(new AppError('Longitude inválida.', 400));
    }
    next();
};

// ── Avaliações (reviews) ───────────────────────────────────────────────
exports.validateReview = (req, res, next) => {
    const rating = Number(req.body.rating);
    if (!rating || rating < 1 || rating > 5) {
        return next(new AppError('A nota deve ser um número entre 1 e 5.', 400));
    }
    req.body.rating = rating;
    if (req.body.comment && typeof req.body.comment === 'string') {
        req.body.comment = req.body.comment.trim().slice(0, 1000);
    }
    next();
};

// ── Eventos ─────────────────────────────────────────────────────────────
exports.validateEventCreate = (req, res, next) => {
    const { title, date } = req.body;
    if (!isNonEmptyString(title)) return next(new AppError('O título do evento é obrigatório.', 400));
    if (!isNonEmptyString(date) || Number.isNaN(Date.parse(date))) {
        return next(new AppError('Informe uma data válida para o evento.', 400));
    }
    next();
};

// ── Reservas ────────────────────────────────────────────────────────────
exports.validateReservation = (req, res, next) => {
    const { place_id, event_id, reservation_date, people } = req.body;
    if (!place_id && !event_id) {
        return next(new AppError('Informe place_id ou event_id.', 400));
    }
    if (!isNonEmptyString(reservation_date) || Number.isNaN(Date.parse(reservation_date))) {
        return next(new AppError('Data da reserva inválida.', 400));
    }
    if (people !== undefined && (Number.isNaN(Number(people)) || Number(people) < 1)) {
        return next(new AppError('Número de pessoas inválido.', 400));
    }
    next();
};

// ── Wishlist ────────────────────────────────────────────────────────────
exports.validateWishlistAdd = (req, res, next) => {
    const { place_id, event_id } = req.body;
    if (!place_id && !event_id) {
        return next(new AppError('Envie place_id ou event_id.', 400));
    }
    next();
};

// ── Troca de senha ─────────────────────────────────────────────────────
exports.validatePasswordChange = (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    if (!isNonEmptyString(currentPassword)) {
        return next(new AppError('Informe a senha atual.', 400));
    }
    if (!isNonEmptyString(newPassword) || newPassword.length < 6) {
        return next(new AppError('A nova senha deve ter ao menos 6 caracteres.', 400));
    }
    next();
};
