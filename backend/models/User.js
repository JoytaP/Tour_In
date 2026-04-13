const db = require('../config/database');

const User = {
    create: (user) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
            db.run(query, [user.name, user.email, user.password, user.role || 'user'], function(err) {
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
            db.get(`SELECT id, name, email, role, bio, city, phone, preferences FROM users WHERE id = ?`, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    update: (id, data) => {
        return new Promise((resolve, reject) => {
            const query = `UPDATE users SET name=?, bio=?, city=?, phone=?, preferences=? WHERE id=?`;
            db.run(query, [data.name, data.bio, data.city, data.phone, data.preferences, id], function(err) {
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
    }
};

module.exports = User;