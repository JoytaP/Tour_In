const Place = require('../models/Place');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/places
exports.getAll = asyncHandler(async (req, res) => {
    const { category, lat, lon, q, radius } = req.query;

    let places;
    if (lat && lon) {
        places = await Place.searchNearby(parseFloat(lat), parseFloat(lon), parseFloat(radius) || 0.05, q);
    } else {
        places = await Place.findAll(category);
    }
    res.json(places);
});

// GET /api/places/:id
exports.getOne = asyncHandler(async (req, res) => {
    const place = await Place.findById(req.params.id);
    if (!place) throw new AppError('Local não encontrado.', 404);
    res.json(place);
});

// POST /api/places
exports.create = asyncHandler(async (req, res) => {
    const { name, description, category, address, lat, lon } = req.body;

    let image_url = null;
    if (req.file) image_url = `/uploads/${req.file.filename}`;

    const place = await Place.create({
        name, description, category, address,
        lat: lat ? parseFloat(lat) : null,
        lon: lon ? parseFloat(lon) : null,
        image_url,
        owner_id: req.user.userId,
    });
    res.status(201).json({ success: true, message: 'Local cadastrado com sucesso!', data: place });
});

// DELETE /api/places/:id
exports.remove = asyncHandler(async (req, res) => {
    const changes = await Place.delete(req.params.id, req.user.userId);
    if (!changes) throw new AppError('Local não encontrado ou sem permissão.', 404);
    res.json({ success: true, message: 'Local removido.' });
});

// GET /api/places/:id/reviews
exports.getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.findByPlace(req.params.id);
    res.json(reviews);
});

// POST /api/places/:id/reviews
exports.addReview = asyncHandler(async (req, res) => {
    const placeId = parseInt(req.params.id, 10);
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const existing = await Review.findExisting(userId, placeId, null);
    if (existing) {
        await Review.update(existing.id, userId, { rating, comment });
        return res.json({ success: true, message: 'Avaliação atualizada!' });
    }

    const review = await Review.create({ userId, placeId, rating, comment });
    const place = await Place.findById(placeId);

    res.status(201).json({
        success: true,
        message: 'Avaliação enviada!',
        data: review,
        avg_rating: place.avg_rating,
        review_count: place.review_count,
    });
});

// DELETE /api/places/:id/reviews/:reviewId
exports.deleteReview = asyncHandler(async (req, res) => {
    const changes = await Review.delete(req.params.reviewId, req.user.userId);
    if (!changes) throw new AppError('Avaliação não encontrada.', 404);
    res.json({ success: true, message: 'Avaliação removida.' });
});
