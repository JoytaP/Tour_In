const wishlistModel = require('../models/wishlistModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/wishlist/add — requer token JWT
exports.add = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { place_id, event_id } = req.body;

    try {
        await wishlistModel.addToWishlist(userId, place_id || null, event_id || null);
    } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
            throw new AppError('Item já salvo na wishlist.', 400);
        }
        throw err;
    }

    res.json({ success: true, message: 'Salvo na wishlist com sucesso!' });
});

// GET /api/wishlist/mine — requer token JWT
exports.getMine = asyncHandler(async (req, res) => {
    const rows = await wishlistModel.getWishlistByUser(req.user.userId);
    res.json(rows);
});

// GET /api/wishlist/:userId — compatibilidade legacy.
// Agora restringe: só retorna dados se o userId solicitado for o do próprio
// usuário autenticado, evitando exposição da wishlist de terceiros.
exports.getByUser = asyncHandler(async (req, res) => {
    if (!req.user || String(req.user.userId) !== String(req.params.userId)) {
        throw new AppError('Acesso não autorizado.', 403);
    }
    const rows = await wishlistModel.getWishlistByUser(req.params.userId);
    res.json(rows);
});

// DELETE /api/wishlist/:wishlistId — requer token JWT
exports.remove = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const wishlistId = req.params.wishlistId;

    const result = await wishlistModel.removeFromWishlist(wishlistId, userId);
    if (result.changes === 0) {
        throw new AppError('Item não encontrado ou não pertence a você.', 404);
    }
    res.json({ success: true });
});
