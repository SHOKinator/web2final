const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Настройка Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, // Ваш email
        pass: process.env.EMAIL_PASSWORD, // Пароль приложения
    },
});

// Регистрация пользователя
exports.register = async (req, res) => {
    const { username, email, password, firstName, lastName, age, gender, role, is2FAEnabled } = req.body;

    try {
        // Проверяем наличие пользователя
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Пользователь с таким email уже существует');
        }

        // Преобразование значения is2FAEnabled в Boolean
        const is2FAEnabledBoolean = is2FAEnabled === 'on';

        // Создаем нового пользователя
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName,
            age,
            gender,
            role,
            is2FAEnabled: is2FAEnabledBoolean
        });

        let qrCodeDataURL = null;

        if (is2FAEnabledBoolean) {
            // Генерация секрета для 2FA
            const secret = speakeasy.generateSecret({
                name: `MyApp (${email})`, // Уникальное название
            });
            user.twoFactorSecret = secret.base32;

            // Генерация QR-кода для аутентификатора
            qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
            user.qrCode = qrCodeDataURL; // Сохранение QR-кода в БД
        }

        await user.save();

        // Отправляем приветственное письмо
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Добро пожаловать!',
            html: `
                <h1>Привет, ${firstName}!</h1>
                <p>Добро пожаловать на платформу!</p>
                ${is2FAEnabledBoolean ? `
                    <p>Для включения 2FA отсканируйте QR-код в вашем аутентификаторе:</p>
                    <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 200px;"/>
                ` : ''}
            `,
        });

        res.status(201).send('Регистрация прошла успешно');
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка регистрации');
    }
};

// Логин пользователя
exports.login = async (req, res) => {
    const { email, password, twoFactorCode } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Неверный email или пароль');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send('Неверный email или пароль');
        }

        if (user.is2FAEnabled) {
            if (!twoFactorCode) {
                return res.status(400).send('Введите код 2FA');
            }

            const isCodeValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
            });

            if (!isCodeValid) {
                return res.status(400).send('Неверный код 2FA');
            }
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, { httpOnly: true });

        res.redirect('/portfolio'); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка входа');
    }
};

// Настройка 2FA (для существующего пользователя)
exports.setup2FA = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('Пользователь не найден');
        }

        if (user.is2FAEnabled) {
            return res.status(400).send('2FA уже включен');
        }

        // Генерация секрета
        const secret = speakeasy.generateSecret();
        user.twoFactorSecret = secret.base32;
        user.is2FAEnabled = true;

        // Генерация QR-кода
        const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
        user.qrCode = qrCodeDataURL;

        await user.save();

        res.status(200).json({ message: '2FA включен', qrCode: qrCodeDataURL });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка настройки 2FA');
    }
};
