const db = require('../config/database');
const Review = require('../models/Review');

// ── GET /api/events ──────────────────────────────────────────────────────────
exports.getAll = (req, res) => {
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
    db.all(q, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// ── GET /api/events/:id ──────────────────────────────────────────────────────
exports.getOne = (req, res) => {
    db.get(
        `SELECT e.*,
         ROUND(AVG(r.rating),1) AS avg_rating,
         COUNT(r.id) AS review_count
         FROM events e
         LEFT JOIN reviews r ON r.event_id = e.id
         WHERE e.id = ?
         GROUP BY e.id`,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ message: 'Evento não encontrado.' });
            res.json(row);
        }
    );
};

// ── GET /api/events/:id/reviews ──────────────────────────────────────────────
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.findByEvent(req.params.id);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── POST /api/events/:id/reviews ─────────────────────────────────────────────
exports.addReview = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const userId = req.user.userId;

        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ message: 'Nota deve ser entre 1 e 5.' });

        const existing = await Review.findExisting(userId, null, eventId);
        if (existing) {
            await Review.update(existing.id, userId, { rating, comment });
            return res.json({ message: 'Avaliação atualizada!' });
        }

        const review = await Review.create({ userId, eventId, rating, comment });
        res.status(201).json({ message: 'Avaliação enviada!', review });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── DELETE /api/events/:id/reviews/:reviewId ─────────────────────────────────
exports.deleteReview = async (req, res) => {
    try {
        const changes = await Review.delete(req.params.reviewId, req.user.userId);
        if (!changes) return res.status(404).json({ message: 'Avaliação não encontrada.' });
        res.json({ message: 'Avaliação removida.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── POST /api/events/seed (dev only) ─────────────────────────────────────────
exports.seedDatabase = (req, res) => {
    res.json({ message: 'Seed desativado. Use o banco já populado.' });
};
