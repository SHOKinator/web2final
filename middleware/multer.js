const multer = require('multer');

// Настройка для хранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Папка для хранения изображений
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Имя файла с таймстампом
    }
});

// Создаем middleware для загрузки файлов (например, до 3 файлов)
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Максимальный размер файла 5 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true); // Если файл изображение, то разрешаем загрузку
        } else {
            cb(new Error('Неверный формат файла'), false);
        }
    }
});

module.exports = upload;
