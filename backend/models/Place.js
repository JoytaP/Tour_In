const db = require('../config/database');

const Place = {
    findAll: (category) => {
        return new Promise((resolve, reject) => {
<<<<<<< HEAD
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
            db.all(q, params, (err, rows) => {
=======
            let query = `SELECT * FROM places`;
            let params = [];
            if (category && category !== 'all') {
                query += ` WHERE category = ?`;
                params.push(category);
            }
            db.all(query, params, (err, rows) => {
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
<<<<<<< HEAD

    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT p.*,
                 ROUND(AVG(r.rating),1) AS avg_rating,
                 COUNT(r.id) AS review_count
                 FROM places p
                 LEFT JOIN reviews r ON r.place_id = p.id
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    searchNearby: (lat, lon, radius, query) => {
        // Aproximação simples por bounding box (±radius graus ≈ ±111km * radius)
        const delta = radius || 0.05; // ~5km
        return new Promise((resolve, reject) => {
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
            db.all(q, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    create: (place) => {
        return new Promise((resolve, reject) => {
            const q = `INSERT INTO places (name, description, category, address, lat, lon, image_url, owner_id)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(q, [
                place.name, place.description, place.category || 'general',
                place.address, place.lat, place.lon, place.image_url, place.owner_id
            ], function(err) {
=======
    create: (place) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO places (name, description, category, address, owner_id) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [place.name, place.description, place.category || 'general', place.address, place.owner_id], function(err) {
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
                if (err) reject(err);
                else resolve({ id: this.lastID, ...place });
            });
        });
<<<<<<< HEAD
    },

    delete: (id, ownerId) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM places WHERE id = ? AND owner_id = ?`, [id, ownerId], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    }
};

module.exports = Place;
=======
    }
};

module.exports = Place;
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
