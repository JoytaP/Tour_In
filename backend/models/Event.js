const db = require('../config/database');

const Event = {
<<<<<<< HEAD
    findAll: (query = '') => {
        return new Promise((resolve, reject) => {
            const q = query
                ? `SELECT * FROM events WHERE title LIKE ? OR description LIKE ? OR category LIKE ? OR location LIKE ? ORDER BY date ASC`
                : `SELECT * FROM events ORDER BY date ASC`;
            const params = query ? [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`] : [];
            db.all(q, params, (err, rows) => {
=======
    findAll: () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM events ORDER BY date DESC`, [], (err, rows) => {
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

<<<<<<< HEAD
module.exports = Event;
=======
module.exports = Event;
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
