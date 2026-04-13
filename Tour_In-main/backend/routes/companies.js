const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const companyController = require('../controllers/companyController');

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Pasta onde as imagens serão salvas
    },
    filename: function (req, file, cb) {
        // Gera um nome único para não substituir arquivos iguais
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite 5MB
});

// --- ROTAS ---

// Rota de Cadastro (aceita até 10 fotos)
router.post('/register', upload.array('photos', 10), companyController.register);

// Rota de Login
router.post('/login', companyController.login);

// NOVA ROTA: Busca de empresas para o mapa
router.get('/search', companyController.search);

module.exports = router;