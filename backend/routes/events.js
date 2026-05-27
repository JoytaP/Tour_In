const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/eventController');
const auth = require('../middleware/auth');

router.get('/',    ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/reviews', ctrl.getReviews);

router.post('/:id/reviews',             auth, ctrl.addReview);
router.delete('/:id/reviews/:reviewId', auth, ctrl.deleteReview);

module.exports = router;
