const db = require('../config/database');

const createReservation = (userId, placeId, eventId, date, people, notes, callback) => {
    const q = `INSERT INTO reservations (user_id, place_id, event_id, reservation_date, people, notes)
               VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(q, [userId, placeId || null, eventId || null, date, people || 1, notes || ''], function(err) {
        callback(err, this);
    });
};

const getUserReservations = (userId, callback) => {
    const q = `
        SELECT r.*,
            COALESCE(p.name, e.title) AS name,
            COALESCE(p.address, e.location) AS location,
            COALESCE(p.category, e.category) AS category,
            CASE WHEN r.place_id IS NOT NULL THEN 'place' ELSE 'event' END AS type
        FROM reservations r
        LEFT JOIN places p ON r.place_id = p.id
        LEFT JOIN events e ON r.event_id = e.id
        WHERE r.user_id = ?
        ORDER BY r.reservation_date ASC`;
    db.all(q, [userId], callback);
};

const cancelReservation = (id, userId, callback) => {
    db.run(`UPDATE reservations SET status='cancelled' WHERE id=? AND user_id=?`, [id, userId], function(err) {
        callback(err, this);
    });
};

module.exports = { createReservation, getUserReservations, cancelReservation };
