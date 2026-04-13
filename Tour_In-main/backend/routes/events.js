const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Rota para pegar todos os eventos (Frontend usa essa)
router.get('/', eventController.getAll);

// Rota MÁGICA para criar dados de teste (Execute uma vez pelo Postman ou Navegador)
// POST http://localhost:3000/api/events/seed
router.get('/seed', eventController.seedDatabase);

module.exports = router;