const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const ctrl = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/reviews', ctrl.getReviews);

router.post('/:id/reviews',             auth, ctrl.addReview);
router.delete('/:id/reviews/:reviewId', auth, ctrl.deleteReview);

module.exports = router;
=======
const eventController = require('../controllers/eventController');

// Rota para pegar todos os eventos (Frontend usa essa)
router.get('/', eventController.getAll);

// Rota MÁGICA para criar dados de teste (Execute uma vez pelo Postman ou Navegador)
// POST http://localhost:3000/api/events/seed
router.get('/seed', eventController.seedDatabase);

module.exports = router;
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
