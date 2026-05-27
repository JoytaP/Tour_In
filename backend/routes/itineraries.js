const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const auth = require('../middleware/auth');

// Rota para CRIAR (POST /api/itineraries)
router.post('/', auth, itineraryController.saveItinerary);

// Rota para LISTAR (GET /api/itineraries)
router.get('/', auth, itineraryController.getMyItineraries);

// --- NOVA ROTA PARA DELETAR (DELETE /api/itineraries/:id) ---
router.delete('/:id', auth, itineraryController.deleteItinerary);

module.exports = router;