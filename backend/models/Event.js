const db = require('../config/database');

const Event = {
    findAll: (query = '') => {
        return new Promise((resolve, reject) => {
            const q = query
                ? `SELECT * FROM events WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR location LIKE ? ORDER BY date ASC`
                : `SELECT * FROM events ORDER BY date ASC`;
            const params = query ? [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`] : [];
            db.all(q, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = Event;
