const db = require('../config/database');

const addToWishlist = (userId, placeId, callback) => {

    const query = `
        INSERT INTO wishlist (user_id, place_id)
        VALUES (?, ?)
    `;

    db.run(query, [userId, placeId], callback);
};

const getWishlistByUser = (userId, callback) => {

    const query = `
        SELECT places.*
        FROM wishlist
        JOIN places
            ON wishlist.place_id = places.id
        WHERE wishlist.user_id = ?
    `;

    db.all(query, [userId], callback);
};

module.exports = {
    addToWishlist,
    getWishlistByUser
};