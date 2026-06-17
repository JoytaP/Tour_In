const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { requireAuth, requireRole } = require('../middleware/auth');
const { validateCompanyRegistration, validateLogin, validateEventCreate } = require('../middleware/validation');
const ctrl = require('../controllers/companyController');

// ── Públicas ──
router.post('/register', upload.array('photos', 10), validateCompanyRegistration, ctrl.register);
router.post('/login', validateLogin, ctrl.login);
router.get('/search', ctrl.search);

// ── Protegidas (somente empresas) ──
router.get('/profile', requireAuth, requireRole('company'), ctrl.getProfile);
router.put('/profile', requireAuth, requireRole('company'), upload.array('photos', 10), ctrl.updateProfile);
router.delete('/profile/photo', requireAuth, requireRole('company'), ctrl.removePhoto);

router.get('/events', requireAuth, requireRole('company'), ctrl.getMyEvents);
router.post('/events', requireAuth, requireRole('company'), upload.single('image'), validateEventCreate, ctrl.createEvent);
router.put('/events/:eventId', requireAuth, requireRole('company'), upload.single('image'), ctrl.updateEvent);
router.delete('/events/:eventId', requireAuth, requireRole('company'), ctrl.deleteEvent);

router.get('/reviews', requireAuth, requireRole('company'), ctrl.getCompanyReviews);
router.put('/hours', requireAuth, requireRole('company'), ctrl.updateHours);
router.post('/:companyId/views', ctrl.incrementViews);

module.exports = router;
