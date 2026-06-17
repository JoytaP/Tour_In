const db = require('../config/database');

const Place = {
    findAll: (category) => {
        let q = `SELECT p.*,
            ROUND(AVG(r.rating),1) AS avg_rating,
            COUNT(r.id) AS review_count
            FROM places p
            LEFT JOIN reviews r ON r.place_id = p.id`;
        const params = [];
        if (category && category !== 'all') {
            q += ` WHERE p.category = ?`;
            params.push(category);
        }
        q += ` GROUP BY p.id ORDER BY avg_rating DESC NULLS LAST`;
        return db.allAsync(q, params);
    },

    findById: (id) =>
        db.getAsync(
            `SELECT p.*,
             ROUND(AVG(r.rating),1) AS avg_rating,
             COUNT(r.id) AS review_count
             FROM places p
             LEFT JOIN reviews r ON r.place_id = p.id
             WHERE p.id = ?
             GROUP BY p.id`,
            [id]
        ),

    searchNearby: (lat, lon, radius, query) => {
        const delta = radius || 0.05; // ~5km
        let q = `SELECT p.*,
            ROUND(AVG(r.rating),1) AS avg_rating,
            COUNT(r.id) AS review_count
            FROM places p
            LEFT JOIN reviews r ON r.place_id = p.id
            WHERE p.lat BETWEEN ? AND ?
              AND p.lon BETWEEN ? AND ?`;
        const params = [lat - delta, lat + delta, lon - delta, lon + delta];
        if (query) {
            q += ` AND (p.name LIKE ? OR p.category LIKE ? OR p.description LIKE ?)`;
            params.push(`%${query}%`, `%${query}%`, `%${query}%`);
        }
        q += ` GROUP BY p.id ORDER BY avg_rating DESC NULLS LAST LIMIT 30`;
        return db.allAsync(q, params);
    },

    create: async (place) => {
        const q = `INSERT INTO places (name, description, category, address, lat, lon, image_url, owner_id)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const result = await db.runAsync(q, [
            place.name, place.description, place.category || 'general',
            place.address, place.lat, place.lon, place.image_url, place.owner_id,
        ]);
        return { id: result.lastID, ...place };
    },

    delete: async (id, ownerId) => {
        const result = await db.runAsync(`DELETE FROM places WHERE id = ? AND owner_id = ?`, [id, ownerId]);
        return result.changes;
    },
};

module.exports = Place;
