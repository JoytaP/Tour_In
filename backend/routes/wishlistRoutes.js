const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/wishlistController');
const auth    = require('../middleware/auth');

// Rotas protegidas por JWT
router.post('/add',         auth, ctrl.add);       // POST   /api/wishlist/add
router.get('/mine',         auth, ctrl.getMine);   // GET    /api/wishlist/mine
router.delete('/:wishlistId', auth, ctrl.remove);  // DELETE /api/wishlist/:id

// Rota legacy sem token (leitura pública por userId — mantida para compatibilidade)
router.get('/:userId', ctrl.getByUser);            // GET    /api/wishlist/:userId

module.exports = router;
