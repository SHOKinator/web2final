const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.EMAIL_PASSWORD, 
    },
});


exports.register = async (req, res) => {
    const { username, email, password, firstName, lastName, age, gender, role, is2FAEnabled } = req.body;

    try {
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Пользователь с таким email уже существует');
        }

       
        const is2FAEnabledBoolean = is2FAEnabled === 'on';

        
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
            
            const secret = speakeasy.generateSecret({
                name: `MyApp (${email})`,
            });
            user.twoFactorSecret = secret.base32;

            
            qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
            user.qrCode = qrCodeDataURL;
        }

        await user.save();

        
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Welcome!',
            html: `
                <h1>Привет, ${firstName}!</h1>
                <p>Welcome to the platform!</p>
                ${is2FAEnabledBoolean ? `
                    <p>Scan the QR-code for authentication:</p>
                    <img src="${qrCodeDataURL}" alt="QR Code" style="max-width: 200px;"/>
                ` : ''}
            `,
        });

        res.status(201).send('Registration successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registration');
    }
};

exports.login = async (req, res) => {
    const { email, password, twoFactorCode } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Wrong email or password');
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send('Wrong email or password');
        }

        if (user.is2FAEnabled) {
            if (!twoFactorCode) {
                return res.status(400).send('Enter the code 2FA');
            }

            const isCodeValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: twoFactorCode,
            });

            if (!isCodeValid) {
                return res.status(400).send('Wrong code 2FA');
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
        res.status(500).send('Error login');
    }
};


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

       
        const secret = speakeasy.generateSecret();
        user.twoFactorSecret = secret.base32;
        user.is2FAEnabled = true;

       
        const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url);
        user.qrCode = qrCodeDataURL;

        await user.save();

        res.status(200).json({ message: '2FA включен', qrCode: qrCodeDataURL });
    } catch (error) {
        console.error(error);
        res.status(500).send('Ошибка настройки 2FA');
    }
};
