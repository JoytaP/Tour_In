const db = require('../config/database');

<<<<<<< HEAD
// ── Adicionar item à wishlist ─────────────────────────────────────────────────
const addToWishlist = (userId, placeId, eventId, callback) => {
    // SQLite trata NULL != NULL em constraints UNIQUE, portanto verificamos
    // manualmente para evitar duplicatas de eventos ou lugares.
    let checkQuery, checkParams;
    if (placeId) {
        checkQuery  = `SELECT id FROM wishlist WHERE user_id = ? AND place_id = ?`;
        checkParams = [userId, placeId];
    } else {
        checkQuery  = `SELECT id FROM wishlist WHERE user_id = ? AND event_id = ?`;
        checkParams = [userId, eventId];
    }

    db.get(checkQuery, checkParams, (err, existing) => {
        if (err) return callback(err);
        if (existing) {
            const duplicateErr = new Error('UNIQUE constraint failed: item já está na wishlist.');
            return callback(duplicateErr);
        }
        const query = `INSERT INTO wishlist (user_id, place_id, event_id) VALUES (?, ?, ?)`;
        db.run(query, [userId, placeId || null, eventId || null], function(err) {
            callback(err, this);
        });
    });
};

// ── Buscar wishlist completa (lugares + eventos, com coords e endereço) ────────
const getWishlistByUser = (userId, callback) => {
    const query = `
        SELECT
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
        ORDER BY w.created_at DESC
    `;
    db.all(query, [userId], callback);
};

// ── Verificar se item já está na wishlist ─────────────────────────────────────
const isInWishlist = (userId, placeId, eventId, callback) => {
    let query, params;
    if (placeId) {
        query  = `SELECT id FROM wishlist WHERE user_id = ? AND place_id = ?`;
        params = [userId, placeId];
    } else {
        query  = `SELECT id FROM wishlist WHERE user_id = ? AND event_id = ?`;
        params = [userId, eventId];
    }
    db.get(query, params, (err, row) => callback(err, !!row));
};

// ── Remover da wishlist ───────────────────────────────────────────────────────
const removeFromWishlist = (wishlistId, userId, callback) => {
    const query = `DELETE FROM wishlist WHERE id = ? AND user_id = ?`;
    db.run(query, [wishlistId, userId], function(err) {
        callback(err, this);
    });
};

// ── Contar itens na wishlist ──────────────────────────────────────────────────
const countByUser = (userId, callback) => {
    db.get(`SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ?`, [userId], callback);
};

module.exports = { addToWishlist, getWishlistByUser, isInWishlist, removeFromWishlist, countByUser };
=======
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
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
