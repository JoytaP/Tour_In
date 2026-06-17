const db = require('../config/database');
const Review = require('../models/Review');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/events
exports.getAll = asyncHandler(async (req, res) => {
    const { category, q: search } = req.query;
    let q = `SELECT e.*,
             ROUND(AVG(r.rating),1) AS avg_rating,
             COUNT(r.id) AS review_count
             FROM events e
             LEFT JOIN reviews r ON r.event_id = e.id`;
    const params = [];
    const conditions = [];
    if (category && category !== 'all') {
        conditions.push('e.category = ?');
        params.push(category);
    }
    if (search) {
        conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (conditions.length) q += ' WHERE ' + conditions.join(' AND ');
    q += ` GROUP BY e.id ORDER BY e.date ASC`;

    const rows = await db.allAsync(q, params);
    res.json(rows);
});

// GET /api/events/:id
exports.getOne = asyncHandler(async (req, res) => {
    const row = await db.getAsync(
        `SELECT e.*,
         ROUND(AVG(r.rating),1) AS avg_rating,
         COUNT(r.id) AS review_count
         FROM events e
         LEFT JOIN reviews r ON r.event_id = e.id
         WHERE e.id = ?
         GROUP BY e.id`,
        [req.params.id]
    );
    if (!row) throw new AppError('Evento não encontrado.', 404);
    res.json(row);
});

// GET /api/events/:id/reviews
exports.getReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.findByEvent(req.params.id);
    res.json(reviews);
});

// POST /api/events/:id/reviews
exports.addReview = asyncHandler(async (req, res) => {
    const eventId = parseInt(req.params.id, 10);
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    const existing = await Review.findExisting(userId, null, eventId);
    if (existing) {
        await Review.update(existing.id, userId, { rating, comment });
        return res.json({ success: true, message: 'Avaliação atualizada!' });
    }

    const review = await Review.create({ userId, eventId, rating, comment });
    res.status(201).json({ success: true, message: 'Avaliação enviada!', data: review });
});

// DELETE /api/events/:id/reviews/:reviewId
exports.deleteReview = asyncHandler(async (req, res) => {
    const changes = await Review.delete(req.params.reviewId, req.user.userId);
    if (!changes) throw new AppError('Avaliação não encontrada.', 404);
    res.json({ success: true, message: 'Avaliação removida.' });
});
