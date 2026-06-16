const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { validatePlaceCreate, validateReview } = require('../middleware/validation');
const ctrl = require('../controllers/placeController');

// ── Públicas ──
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getOne);
router.get('/:id/reviews', ctrl.getReviews);

// ── Protegidas ──
router.post('/', requireAuth, upload.single('image'), validatePlaceCreate, ctrl.create);
router.delete('/:id', requireAuth, ctrl.remove);

router.post('/:id/reviews', requireAuth, validateReview, ctrl.addReview);
router.delete('/:id/reviews/:reviewId', requireAuth, ctrl.deleteReview);

module.exports = router;
