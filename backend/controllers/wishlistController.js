const wishlistModel = require('../models/wishlistModel');

// POST /api/wishlist/add  — requer token JWT
exports.add = (req, res) => {
    const userId  = req.user.userId;           // vem do middleware auth
    const { place_id, event_id } = req.body;

    if (!userId || (!place_id && !event_id)) {
        return res.status(400).json({ error: 'Envie place_id ou event_id.' });
    }

    wishlistModel.addToWishlist(userId, place_id || null, event_id || null, (err) => {
        if (err) {
            if (err.message && err.message.includes('UNIQUE')) {
                return res.status(400).json({ error: 'Item já salvo na wishlist.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, message: 'Salvo na wishlist com sucesso!' });
    });
};

// GET /api/wishlist  — requer token JWT (retorna wishlist do próprio usuário)
exports.getMine = (req, res) => {
    wishlistModel.getWishlistByUser(req.user.userId, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// GET /api/wishlist/:userId  — compatibilidade com chamadas legacy (sem token)
exports.getByUser = (req, res) => {
    wishlistModel.getWishlistByUser(req.params.userId, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// DELETE /api/wishlist/:wishlistId  — requer token JWT
exports.remove = (req, res) => {
    const userId     = req.user.userId;
    const wishlistId = req.params.wishlistId;

    wishlistModel.removeFromWishlist(wishlistId, userId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result && result.changes === 0)
            return res.status(404).json({ error: 'Item não encontrado ou não pertence a você.' });
        res.json({ success: true });
    });
};
