const PortfolioItem = require('../models/PortfolioItem');

exports.getPortfolioPage = async (req, res) => {
    try {
        const portfolioItems = await PortfolioItem.find();
        res.render('portfolio', { user: req.user, portfolioItems });
    } catch (error) {
        res.status(500).send('Failed to load portfolio');
    }
};

exports.createItem = async (req, res) => {
    try {
        const { title, description } = req.body;
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        if (images.length < 3) return res.status(400).send('At least three images required');

        const newItem = new PortfolioItem({ title, description, images, createdBy: req.user.id });
        await newItem.save();
        res.redirect('/portfolio');
    } catch (error) {
        res.status(500).send('Failed to create item');
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await PortfolioItem.findById(id);
        if (!item) return res.status(404).send('Item not found');

        if (req.user.role !== 'admin' && req.user.id !== item.createdBy.toString())
            return res.status(403).send('Permission denied');

        await item.remove();
        res.redirect('/portfolio');
    } catch (error) {
        res.status(500).send('Failed to delete item');
    }
};
