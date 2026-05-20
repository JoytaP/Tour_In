const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlistController');

router.post('/add', wishlistController.add);

router.get('/:userId', wishlistController.getByUser);

module.exports = router;