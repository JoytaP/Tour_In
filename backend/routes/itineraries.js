const express = require('express');
const router = express.Router();
const itineraryController = require('../controllers/itineraryController');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, itineraryController.saveItinerary);
router.get('/', requireAuth, itineraryController.getMyItineraries);
router.delete('/:id', requireAuth, itineraryController.deleteItinerary);

module.exports = router;
