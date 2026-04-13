const Itinerary = require('../models/Itinerary');

// Salvar Roteiro
exports.saveItinerary = async (req, res) => {
    try {
        const { items } = req.body; // Recebe a lista de locais
        const result = await Itinerary.create(req.user.userId, items);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Listar Meus Roteiros
exports.getMyItineraries = async (req, res) => {
    try {
        const itineraries = await Itinerary.findByUser(req.user.userId);
        res.json(itineraries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- NOVA FUNÇÃO: EXCLUIR ROTEIRO ---
exports.deleteItinerary = async (req, res) => {
    try {
        const itineraryId = req.params.id; // Vem da URL (ex: /15)
        const userId = req.user.userId;    // Vem do Token de Autenticação

        const deletedCount = await Itinerary.delete(itineraryId, userId);

        if (deletedCount === 0) {
            // Se for 0, o roteiro não existe ou não pertence a este usuário
            return res.status(404).json({ message: 'Roteiro não encontrado ou acesso negado.' });
        }

        res.json({ message: 'Roteiro excluído com sucesso!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};