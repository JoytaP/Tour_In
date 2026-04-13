const Place = require('../models/Place');

exports.getAll = async (req, res) => {
    try {
        const category = req.query.category;
        const places = await Place.findAll(category);
        res.json(places);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};