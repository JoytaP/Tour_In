const wishlistModel = require('../models/wishlistModel');

exports.add = (req, res) => {

    const { user_id, place_id } = req.body;

    wishlistModel.addToWishlist(
        user_id,
        place_id,
        function(err) {

            if (err) {

                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({
                        error: 'Lugar já salvo'
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true
            });
        }
    );
};

exports.getByUser = (req, res) => {

    const userId = req.params.userId;

    wishlistModel.getWishlistByUser(
        userId,
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
};