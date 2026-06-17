const User = require('../models/User');
const bcrypt = require('bcrypt');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    const itineraryCount = await User.countItineraries(req.user.userId);

    let preferences = [];
    try { preferences = JSON.parse(user.preferences || '[]'); } catch (e) { preferences = []; }

    res.json({ success: true, ...user, preferences, itinerary_count: itineraryCount });
});

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, bio, city, phone, preferences } = req.body;

    const prefsString = Array.isArray(preferences)
        ? JSON.stringify(preferences)
        : (preferences || '[]');

    const updatedUser = await User.update(req.user.userId, {
        name, bio, city, phone, preferences: prefsString,
    });

    res.json({ success: true, message: 'Perfil atualizado.', user: updatedUser });
});

// PUT /api/users/change-password
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new AppError('Senha atual incorreta.', 400);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(req.user.userId, hashedPassword);

    res.json({ success: true, message: 'Senha alterada com sucesso.' });
});

// DELETE /api/users/account
exports.deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw new AppError('Informe sua senha para confirmar a exclusão.', 400);

    const user = await User.findByEmail(req.user.email);
    if (!user) throw new AppError('Usuário não encontrado.', 404);

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new AppError('Senha incorreta. Conta não excluída.', 401);

    await User.delete(req.user.userId);
    res.json({ success: true, message: 'Conta excluída com sucesso.' });
});
