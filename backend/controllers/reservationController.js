const model = require('../models/reservationModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/reservations/create
// Aceita usuário autenticado (via token) ou anônimo com user_id no corpo,
// mantido por compatibilidade com fluxos legados do frontend.
exports.create = asyncHandler(async (req, res) => {
    const user_id = (req.user && req.user.userId) || req.body.user_id;
    const { place_id, event_id, reservation_date, people, notes } = req.body;

    if (!user_id) {
        throw new AppError('Usuário não identificado para a reserva.', 400);
    }

    const result = await model.createReservation(user_id, place_id, event_id, reservation_date, people, notes);
    res.status(201).json({ success: true, id: result.lastID });
});

// GET /api/reservations/mine — requer token
exports.getMine = asyncHandler(async (req, res) => {
    const rows = await model.getUserReservations(req.user.userId);
    res.json(rows);
});

// GET /api/reservations/:userId — legacy.
// Restringe a consulta ao próprio usuário autenticado quando há token,
// evitando que qualquer pessoa veja reservas de outro userId pela URL.
exports.getByUser = asyncHandler(async (req, res) => {
    if (req.user && String(req.user.userId) !== String(req.params.userId)) {
        throw new AppError('Acesso não autorizado.', 403);
    }
    const rows = await model.getUserReservations(req.params.userId);
    res.json(rows);
});

// PATCH /api/reservations/:id/cancel — requer token
exports.cancel = asyncHandler(async (req, res) => {
    const result = await model.cancelReservation(req.params.id, req.user.userId);
    if (result.changes === 0) {
        throw new AppError('Reserva não encontrada ou não pertence a você.', 404);
    }
    res.json({ success: true });
});
