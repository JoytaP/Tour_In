const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const ctrl = require('../controllers/companyController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// ── Públicas ──
router.post('/register', upload.array('photos', 10), ctrl.register);
router.post('/login', ctrl.login);
router.get('/search', ctrl.search);

// ── Protegidas ──
router.get('/profile', auth, ctrl.getProfile);
router.put('/profile', auth, upload.array('photos', 10), ctrl.updateProfile);
router.delete('/profile/photo', auth, ctrl.removePhoto);

router.get('/events', auth, ctrl.getMyEvents);
router.post('/events', auth, upload.single('image'), ctrl.createEvent);
router.delete('/events/:eventId', auth, ctrl.deleteEvent);

module.exports = router;
