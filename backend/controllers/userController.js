const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        // Conta itinerários
        const itineraryCount = await User.countItineraries(req.user.userId);

        // Parse preferences
        let preferences = [];
        try { preferences = JSON.parse(user.preferences || '[]'); } catch(e) {}

        res.json({ ...user, preferences, itinerary_count: itineraryCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, bio, city, phone, preferences } = req.body;
        
        // Serializa preferências como JSON string
        const prefsString = Array.isArray(preferences)
            ? JSON.stringify(preferences)
            : (preferences || '[]');

        const updatedUser = await User.update(req.user.userId, {
            name, bio, city, phone, preferences: prefsString
        });
        res.json({ message: 'Perfil atualizado', user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/users/change-password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByEmail(req.user.email);

        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ message: 'Senha atual incorreta' });

        if (!newPassword || newPassword.length < 6)
            return res.status(400).json({ message: 'A nova senha deve ter ao menos 6 caracteres' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updatePassword(req.user.userId, hashedPassword);

        res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /api/users/account
exports.deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) return res.status(400).json({ message: 'Informe sua senha para confirmar.' });

        const user = await User.findByEmail(req.user.email);
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Senha incorreta. Conta não excluída.' });

        await User.delete(req.user.userId);
        res.json({ message: 'Conta excluída com sucesso.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
