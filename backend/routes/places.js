const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/placeController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Públicas ──
router.get('/',     ctrl.getAll);
router.get('/:id',  ctrl.getOne);
router.get('/:id/reviews', ctrl.getReviews);

// ── Protegidas ──
router.post('/',     auth, upload.single('image'), ctrl.create);
router.delete('/:id', auth, ctrl.remove);

router.post('/:id/reviews',           auth, ctrl.addReview);
router.delete('/:id/reviews/:reviewId', auth, ctrl.deleteReview);

module.exports = router;
