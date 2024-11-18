const mongoose = require('mongoose');

const portfolioItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    images: [{ type: String }], // Ссылки на изображения
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('PortfolioItem', portfolioItemSchema);
