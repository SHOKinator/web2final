const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); 

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/setup-2fa', protect, authController.setup2FA);

module.exports = router;
