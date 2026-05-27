const Place = require('../models/Place');
<<<<<<< HEAD
const Review = require('../models/Review');
const multer = require('multer');
const path = require('path');

// ── GET /api/places ──────────────────────────────────────────────────────────
// Suporta ?category=gastronomy e ?lat=&lon=&q= para busca geográfica
exports.getAll = async (req, res) => {
    try {
        const { category, lat, lon, q, radius } = req.query;

        let places;
        if (lat && lon) {
            places = await Place.searchNearby(parseFloat(lat), parseFloat(lon), parseFloat(radius) || 0.05, q);
        } else {
            places = await Place.findAll(category);
        }
=======

exports.getAll = async (req, res) => {
    try {
        const category = req.query.category;
        const places = await Place.findAll(category);
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
        res.json(places);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
<<<<<<< HEAD
};

// ── GET /api/places/:id ──────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
    try {
        const place = await Place.findById(req.params.id);
        if (!place) return res.status(404).json({ message: 'Local não encontrado.' });
        res.json(place);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── POST /api/places ─────────────────────────────────────────────────────────
// Cria local (qualquer usuário autenticado pode sugerir)
exports.create = async (req, res) => {
    try {
        const { name, description, category, address, lat, lon } = req.body;
        if (!name) return res.status(400).json({ message: 'O nome é obrigatório.' });

        let image_url = null;
        if (req.file) image_url = `/uploads/${req.file.filename}`;

        const place = await Place.create({
            name, description, category, address,
            lat: lat ? parseFloat(lat) : null,
            lon: lon ? parseFloat(lon) : null,
            image_url,
            owner_id: req.user.userId
        });
        res.status(201).json({ message: 'Local cadastrado com sucesso!', place });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── DELETE /api/places/:id ───────────────────────────────────────────────────
exports.remove = async (req, res) => {
    try {
        const changes = await Place.delete(req.params.id, req.user.userId);
        if (!changes) return res.status(404).json({ message: 'Local não encontrado ou sem permissão.' });
        res.json({ message: 'Local removido.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── GET /api/places/:id/reviews ──────────────────────────────────────────────
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.findByPlace(req.params.id);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── POST /api/places/:id/reviews ─────────────────────────────────────────────
exports.addReview = async (req, res) => {
    try {
        const placeId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const userId = req.user.userId;

        if (!rating || rating < 1 || rating > 5)
            return res.status(400).json({ message: 'Nota deve ser entre 1 e 5.' });

        // Verifica se já avaliou
        const existing = await Review.findExisting(userId, placeId, null);
        if (existing) {
            // Atualiza avaliação existente
            await Review.update(existing.id, userId, { rating, comment });
            return res.json({ message: 'Avaliação atualizada!' });
        }

        const review = await Review.create({ userId, placeId, rating, comment });

        // Retorna nota média atualizada
        const place = await Place.findById(placeId);
        res.status(201).json({ message: 'Avaliação enviada!', review, avg_rating: place.avg_rating, review_count: place.review_count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ── DELETE /api/places/:id/reviews/:reviewId ─────────────────────────────────
exports.deleteReview = async (req, res) => {
    try {
        const changes = await Review.delete(req.params.reviewId, req.user.userId);
        if (!changes) return res.status(404).json({ message: 'Avaliação não encontrada.' });
        res.json({ message: 'Avaliação removida.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
=======
};
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
