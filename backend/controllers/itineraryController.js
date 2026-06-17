const Itinerary = require('../models/Itinerary');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/itineraries
exports.saveItinerary = asyncHandler(async (req, res) => {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
        throw new AppError('Informe ao menos um item para o roteiro.', 400);
    }
    const result = await Itinerary.create(req.user.userId, items);
    res.status(201).json({ success: true, data: result });
});

// GET /api/itineraries
exports.getMyItineraries = asyncHandler(async (req, res) => {
    const itineraries = await Itinerary.findByUser(req.user.userId);
    res.json(itineraries);
});

// DELETE /api/itineraries/:id
exports.deleteItinerary = asyncHandler(async (req, res) => {
    const deletedCount = await Itinerary.delete(req.params.id, req.user.userId);
    if (deletedCount === 0) {
        throw new AppError('Roteiro não encontrado ou acesso negado.', 404);
    }
    res.json({ success: true, message: 'Roteiro excluído com sucesso!' });
});
