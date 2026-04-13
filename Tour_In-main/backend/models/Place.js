const db = require('../config/database');

const Place = {
    findAll: (category) => {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM places`;
            let params = [];
            if (category && category !== 'all') {
                query += ` WHERE category = ?`;
                params.push(category);
            }
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },
    create: (place) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO places (name, description, category, address, owner_id) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [place.name, place.description, place.category || 'general', place.address, place.owner_id], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...place });
            });
        });
    }
};

module.exports = Place;