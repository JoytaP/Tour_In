const db = require('../config/database');

const User = {
    create: async (user) => {
        const q = `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
        const result = await db.runAsync(q, [user.name, user.email, user.password, user.role || 'user']);
        return { id: result.lastID, ...user };
    },

    findByEmail: (email) =>
        db.getAsync(`SELECT * FROM users WHERE email = ?`, [email]),

    findById: (id) =>
        db.getAsync(
            `SELECT id, name, email, role, bio, city, phone, preferences, created_at FROM users WHERE id = ?`,
            [id]
        ),

    update: async (id, data) => {
        const q = `UPDATE users SET name=?, bio=?, city=?, phone=?, preferences=? WHERE id=?`;
        await db.runAsync(q, [data.name, data.bio, data.city, data.phone, data.preferences, id]);
        return { id, ...data };
    },

    updatePassword: (id, hashedPassword) =>
        db.runAsync(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]),

    delete: async (id) => {
        const result = await db.runAsync(`DELETE FROM users WHERE id = ?`, [id]);
        return result.changes;
    },

    countItineraries: async (userId) => {
        const row = await db.getAsync(`SELECT COUNT(*) as total FROM itineraries WHERE user_id = ?`, [userId]);
        return row ? row.total : 0;
    },
};

module.exports = User;
