const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { validatePasswordChange } = require('../middleware/validation');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, userController.updateProfile);
router.put('/change-password', requireAuth, validatePasswordChange, userController.changePassword);
router.delete('/account', requireAuth, userController.deleteAccount);

module.exports = router;
