// tour-in/backend/models/Review.js

// Importações e métodos para criar, buscar e calcular média de avaliações.
const db = require('../config/database');

class Review {
    static async create({ userId, placeId, rating, comment }) {
        const query = `
            INSERT INTO reviews (user_id, place_id, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [userId, placeId, rating, comment];
        const { rows } = await db.query(query, values);
        return rows[0];
    }
}

module.exports = Review;