const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const portfolioController = require('../controllers/portfolioController');
const upload = require('../middleware/multer');

const router = express.Router();

router.get('/', protect, portfolioController.getPortfolioPage);
router.post('/', protect, upload.array('images', 3), portfolioController.createItem);
router.post('/delete/:id', protect, portfolioController.deleteItem);

module.exports = router;
