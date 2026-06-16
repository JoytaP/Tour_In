const db = require('../config/database');
const AppError = require('../utils/AppError');

const Review = {
    create: async ({ userId, placeId, eventId, rating, comment }) => {
        if (!placeId && !eventId) {
            throw new AppError('Informe place_id ou event_id.', 400);
        }
        if (rating < 1 || rating > 5) {
            throw new AppError('A nota deve ser entre 1 e 5.', 400);
        }
        const result = await db.runAsync(
            `INSERT INTO reviews (user_id, place_id, event_id, rating, comment) VALUES (?,?,?,?,?)`,
            [userId, placeId || null, eventId || null, rating, comment || null]
        );
        return { id: result.lastID, userId, placeId, eventId, rating, comment };
    },

    findByPlace: (placeId) =>
        db.allAsync(
            `SELECT r.*, u.name AS user_name
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             WHERE r.place_id = ?
             ORDER BY r.created_at DESC`,
            [placeId]
        ),

    findByEvent: (eventId) =>
        db.allAsync(
            `SELECT r.*, u.name AS user_name
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             WHERE r.event_id = ?
             ORDER BY r.created_at DESC`,
            [eventId]
        ),

    findExisting: (userId, placeId, eventId) => {
        const condition = placeId ? `place_id = ?` : `event_id = ?`;
        const param = placeId || eventId;
        return db.getAsync(`SELECT id FROM reviews WHERE user_id = ? AND ${condition}`, [userId, param]);
    },

    update: async (id, userId, { rating, comment }) => {
        const result = await db.runAsync(
            `UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?`,
            [rating, comment, id, userId]
        );
        return result.changes;
    },

    delete: async (id, userId) => {
        const result = await db.runAsync(`DELETE FROM reviews WHERE id = ? AND user_id = ?`, [id, userId]);
        return result.changes;
    },
};

module.exports = Review;
