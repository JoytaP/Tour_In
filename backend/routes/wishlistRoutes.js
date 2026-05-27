const express = require('express');
<<<<<<< HEAD
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
=======
const router = express.Router();

const wishlistController = require('../controllers/wishlistController');

router.post('/add', wishlistController.add);

router.get('/:userId', wishlistController.getByUser);

module.exports = router;
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
