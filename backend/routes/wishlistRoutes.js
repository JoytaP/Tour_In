const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');
const { validateWishlistAdd } = require('../middleware/validation');

// Rotas protegidas por JWT
router.post('/add', requireAuth, validateWishlistAdd, ctrl.add);
router.get('/mine', requireAuth, ctrl.getMine);
router.delete('/:wishlistId', requireAuth, ctrl.remove);

module.exports = router;
