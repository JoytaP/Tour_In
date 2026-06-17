const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const { requireAuth } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/reviews', ctrl.getReviews);

router.post('/:id/reviews', requireAuth, validateReview, ctrl.addReview);
router.delete('/:id/reviews/:reviewId', requireAuth, ctrl.deleteReview);

module.exports = router;
