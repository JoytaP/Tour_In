const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
    // O campo `role` enviado pelo cliente é ignorado intencionalmente.
    // Novos usuários são sempre criados como 'user'.
    // O cadastro de empresa usa o endpoint exclusivo /api/companies/register.
    const { name, email, password } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw new AppError('E-mail já cadastrado.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role: 'user' });

    res.status(201).json({ success: true, message: 'Usuário criado com sucesso!' });
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);

    // Mensagem genérica para não revelar se o e-mail existe ou não.
    if (!user) {
        throw new AppError('Credenciais inválidas.', 401);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new AppError('Credenciais inválidas.', 401);
    }

    const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.jwtSecret,
        { expiresIn: env.jwtExpiresIn }
    );

    res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
});
