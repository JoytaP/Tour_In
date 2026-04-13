// tour-in/backend/middleware/validation.js

// Validações simples para os endpoints. Em um projeto real, use o 'express-validator'.

exports.validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
        return res.status(400).json({ message: 'Dados de registro incompletos ou senha muito curta (mínimo 6 caracteres).' });
    }
    next();
};

exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }
    next();
};

exports.validateCompanyRegistration = (req, res, next) => {
    const { name, email, phone, address, category } = req.body;
    if (!name || !email || !phone || !address || !category) {
        return res.status(400).json({ message: 'Campos obrigatórios do cadastro de empresa estão incompletos.' });
    }
    next();
};