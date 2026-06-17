// backend/middleware/errorHandler.js
const env = require('../config/env');
const AppError = require('../utils/AppError');

// Middleware 404 — deve ser registrado após todas as rotas de API.
function notFound(req, res, next) {
    next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// Middleware central de tratamento de erros.
// Garante que NUNCA vazamos stack traces ou detalhes internos
// para o cliente em produção, mas loga tudo no servidor.
function errorHandler(err, req, res, next) {
    let { statusCode, message } = err;

    if (!statusCode) statusCode = 500;

    // Erros de JSON malformado enviados pelo express.json()
    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Corpo da requisição inválido (JSON malformado).';
    }

    // Erros do multer (upload de arquivos)
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Arquivo muito grande. O limite é de 5MB por imagem.';
        } else {
            message = 'Erro no upload do arquivo: ' + err.message;
        }
    }

    if (statusCode === 500) {
        console.error('[ERROR]', err);
        if (env.isProduction) {
            message = 'Erro interno do servidor.';
        }
    } else {
        console.warn(`[WARN] ${statusCode} - ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: message || 'Erro interno do servidor.',
    });
}

module.exports = { notFound, errorHandler };
