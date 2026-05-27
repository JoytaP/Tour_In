const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reservationController');
const jwt = require('jsonwebtoken');

// Middleware opcional: extrai userId do token se presente, mas não bloqueia sem token
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SEU_SEGREDO_JWT');
            req.user = decoded;
        }
    } catch (e) { /* ignora token inválido */ }
    next();
}

router.post('/create', optionalAuth, ctrl.create);
router.get('/:userId', ctrl.getByUser);
router.patch('/:id/cancel', ctrl.cancel);

module.exports = router;
