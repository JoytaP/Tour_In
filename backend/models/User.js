const db = require('../config/database');

const User = {
    create: (user) => {
        return new Promise((resolve, reject) => {
            const q = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
            db.run(q, [user.name, user.email, user.password, user.role || 'user'], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...user });
            });
        });
    },
    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    findById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT id, name, email, role, bio, city, phone, preferences, created_at FROM users WHERE id = ?`,
                [id],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },
    update: (id, data) => {
        return new Promise((resolve, reject) => {
            const q = `UPDATE users SET name=?, bio=?, city=?, phone=?, preferences=? WHERE id=?`;
            db.run(q, [data.name, data.bio, data.city, data.phone, data.preferences, id], function(err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    },
    updatePassword: (id, hashedPassword) => {
        return new Promise((resolve, reject) => {
            db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id], function(err) {
                if (err) reject(err);
                else resolve(true);
            });
        });
    },
    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
        });
    },
    countItineraries: (userId) => {
        return new Promise((resolve, reject) => {
            db.get(`SELECT COUNT(*) as total FROM itineraries WHERE user_id = ?`, [userId], (err, row) => {
                if (err) reject(err);
                else resolve(row ? row.total : 0);
            });
        });
    }
};

module.exports = User;
