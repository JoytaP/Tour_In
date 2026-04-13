const db = require('../config/database');

const Event = {
    findAll: () => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM events ORDER BY date DESC`, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = Event;