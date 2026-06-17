const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { validateReservation } = require('../middleware/validation');

// Criação aceita usuário autenticado OU anônimo (compatibilidade legacy do front).
router.post('/create', optionalAuth, validateReservation, ctrl.create);

// Listagem e cancelamento exigem o usuário autenticado dono da reserva.
router.get('/mine', requireAuth, ctrl.getMine);
router.patch('/:id/cancel', requireAuth, ctrl.cancel);

// Rota legacy mantida para compatibilidade com chamadas antigas do front
// (sem token), porém agora reforça que userId precisa corresponder ao token
// quando presente — ver controller.
router.get('/:userId', optionalAuth, ctrl.getByUser);

module.exports = router;
