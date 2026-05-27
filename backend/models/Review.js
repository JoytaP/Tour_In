const db = require('../config/database');

const Review = {
    // Cria avaliação para local ou evento
    create: ({ userId, placeId, eventId, rating, comment }) => {
        return new Promise((resolve, reject) => {
            if (!placeId && !eventId)
                return reject(new Error('Informe place_id ou event_id'));
            if (rating < 1 || rating > 5)
                return reject(new Error('Rating deve ser entre 1 e 5'));

            db.run(
                `INSERT INTO reviews (user_id, place_id, event_id, rating, comment) VALUES (?,?,?,?,?)`,
                [userId, placeId || null, eventId || null, rating, comment || null],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, userId, placeId, eventId, rating, comment });
                }
            );
        });
    },

    // Lista avaliações de um local com nome do usuário
    findByPlace: (placeId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, u.name AS user_name
                 FROM reviews r
                 JOIN users u ON u.id = r.user_id
                 WHERE r.place_id = ?
                 ORDER BY r.created_at DESC`,
                [placeId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Lista avaliações de um evento
    findByEvent: (eventId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, u.name AS user_name
                 FROM reviews r
                 JOIN users u ON u.id = r.user_id
                 WHERE r.event_id = ?
                 ORDER BY r.created_at DESC`,
                [eventId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Avaliação já existe para este usuário/local?
    findExisting: (userId, placeId, eventId) => {
        return new Promise((resolve, reject) => {
            const condition = placeId ? `place_id = ?` : `event_id = ?`;
            const param = placeId || eventId;
            db.get(
                `SELECT id FROM reviews WHERE user_id = ? AND ${condition}`,
                [userId, param],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    // Atualiza avaliação existente
    update: (id, userId, { rating, comment }) => {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ?`,
                [rating, comment, id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    },

    delete: (id, userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM reviews WHERE id = ? AND user_id = ?`,
                [id, userId],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes);
                }
            );
        });
    }
};

module.exports = Review;
