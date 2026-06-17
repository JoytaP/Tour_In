const db = require('../config/database');

const addToWishlist = (userId, placeId, eventId) =>
    db.runAsync(
        `INSERT INTO wishlist (user_id, place_id, event_id) VALUES (?, ?, ?)`,
        [userId, placeId || null, eventId || null]
    );

const getWishlistByUser = (userId) =>
    db.allAsync(
        `SELECT
            w.id            AS wishlist_id,
            w.place_id,
            w.event_id,
            w.created_at,
            COALESCE(p.name,  e.title)       AS name,
            COALESCE(p.description, e.description) AS description,
            COALESCE(p.category,    e.category)    AS category,
            COALESCE(p.image_url,   e.image_url)   AS image_url,
            COALESCE(p.address,     e.location)    AS address,
            COALESCE(p.lat,         e.lat)         AS lat,
            COALESCE(p.lon,         e.lon)         AS lon,
            CASE WHEN w.place_id IS NOT NULL THEN 'place' ELSE 'event' END AS type,
            e.date          AS event_date
        FROM wishlist w
        LEFT JOIN places p ON w.place_id = p.id
        LEFT JOIN events e ON w.event_id = e.id
        WHERE w.user_id = ?
        ORDER BY w.created_at DESC`,
        [userId]
    );

const isInWishlist = (userId, placeId, eventId) => {
    if (placeId) {
        return db.getAsync(`SELECT id FROM wishlist WHERE user_id = ? AND place_id = ?`, [userId, placeId]);
    }
    return db.getAsync(`SELECT id FROM wishlist WHERE user_id = ? AND event_id = ?`, [userId, eventId]);
};

const removeFromWishlist = (wishlistId, userId) =>
    db.runAsync(`DELETE FROM wishlist WHERE id = ? AND user_id = ?`, [wishlistId, userId]);

const countByUser = (userId) =>
    db.getAsync(`SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ?`, [userId]);

module.exports = { addToWishlist, getWishlistByUser, isInWishlist, removeFromWishlist, countByUser };
