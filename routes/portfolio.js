// routes/portfolio.js
const express = require('express');
const { authenticate } = require('../middleware/auth');  // Импортируем middleware для аутентификации
const authorize = require('../middleware/authorize');  // Импортируем middleware для авторизации
const Portfolio = require('../models/PortfolioItem');

const router = express.Router();

// Создание элемента в портфолио (доступно только администратору)
router.post('/create', authenticate, authorize(['admin']), async (req, res) => {
    try {
      const { title, description, images } = req.body;
      const newItem = new Portfolio({ title, description, images });
  
      await newItem.save();
      res.status(201).json({ message: 'Portfolio item created successfully', item: newItem });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating portfolio item' });
    }
  });
  

module.exports = router;
