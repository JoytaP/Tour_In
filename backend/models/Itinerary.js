const db = require('../config/database');

const Itinerary = {
    create: async (userId, items) => {
        const date = new Date().toLocaleDateString('pt-BR');
        const name = `Roteiro de ${date}`;
        const result = await db.runAsync(
            `INSERT INTO itineraries (user_id, items, name) VALUES (?, ?, ?)`,
            [userId, JSON.stringify(items), name]
        );
        return { id: result.lastID, name };
    },

    findByUser: (userId) =>
        db.allAsync(`SELECT * FROM itineraries WHERE user_id = ? ORDER BY created_at DESC`, [userId]),

    delete: async (id, userId) => {
        const result = await db.runAsync(`DELETE FROM itineraries WHERE id = ? AND user_id = ?`, [id, userId]);
        return result.changes;
    },
};

module.exports = Itinerary;
