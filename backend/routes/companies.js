const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const companyController = require('../controllers/companyController');

// --- MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- ROTAS PÚBLICAS ---
router.post('/register', upload.array('photos', 10), companyController.register);
router.post('/login', companyController.login);
router.get('/search', companyController.search);

// --- ROTAS PROTEGIDAS (precisam de token) ---
router.get('/profile', auth, companyController.getProfile);
router.put('/profile', auth, upload.array('photos', 10), companyController.updateProfile);

router.get('/events', auth, companyController.getMyEvents);
router.post('/events', auth, upload.single('image'), companyController.createEvent);
router.delete('/events/:eventId', auth, companyController.deleteEvent);

module.exports = router;
