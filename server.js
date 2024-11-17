const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');  // Подключаем маршруты авторизации
const portfolioRoutes = require('./routes/portfolio');

const app = express();

// Middleware
app.use(bodyParser.json());  // Обработка JSON запросов

// Подключаем маршруты
app.use('/auth', authRoutes);  // Убедись, что у тебя есть '/auth'
app.use('/portfolio', portfolioRoutes);  // Для портфолио

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));

// Запуск сервера
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
