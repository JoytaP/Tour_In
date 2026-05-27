const model = require('../models/reservationModel');

exports.create = (req, res) => {
    // user_id pode vir do body (compatibilidade) ou do token JWT
    const user_id = req.body.user_id || (req.user && req.user.userId);
    const { place_id, event_id, reservation_date, people, notes } = req.body;
    if (!user_id || (!place_id && !event_id) || !reservation_date) {
        return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
    }
    model.createReservation(user_id, place_id, event_id, reservation_date, people, notes, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.lastID });
    });
};

exports.getByUser = (req, res) => {
    model.getUserReservations(req.params.userId, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

exports.cancel = (req, res) => {
    const { user_id } = req.body;
    model.cancelReservation(req.params.id, user_id, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
};
