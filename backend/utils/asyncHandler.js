// backend/utils/asyncHandler.js
// Envolve funções de controller assíncronas, capturando erros
// rejeitados e enviando-os para o middleware de erro central
// (em vez de exigir try/catch repetido em cada controller).

module.exports = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
