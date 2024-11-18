require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Подключение к базе данных
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes'); // Маршруты для авторизации
const portfolioRoutes = require('./routes/portfolioRoutes'); // Маршруты для портфолио

// Инициализация приложения
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Установка движка EJS
app.set('view engine', 'ejs');
app.set('views', './views');

// Подключение к базе данных
connectDB();

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/portfolio', portfolioRoutes);

// Рендер страниц
app.get('/', (req, res) => res.redirect('/register'));
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
