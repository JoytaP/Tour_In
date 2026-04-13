const db = require('../config/database');

const Itinerary = {
    // Cria um novo roteiro
    create: (userId, items) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO itineraries (user_id, items, name) VALUES (?, ?, ?)`;
            
            // Gera um nome automático (ex: Roteiro de 25/12/2024)
            const date = new Date().toLocaleDateString('pt-BR');
            const name = `Roteiro de ${date}`;
            
            // O banco salva os itens como texto (JSON String)
            db.run(query, [userId, JSON.stringify(items), name], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID });
            });
        });
    },

    // Busca roteiros de um usuário específico
    findByUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM itineraries WHERE user_id = ? ORDER BY created_at DESC`, [userId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // --- NOVA FUNÇÃO: DELETAR ---
    delete: (id, userId) => {
        return new Promise((resolve, reject) => {
            // A query verifica o ID do roteiro E o ID do dono para segurança
            const query = `DELETE FROM itineraries WHERE id = ? AND user_id = ?`;
            db.run(query, [id, userId], function(err) {
                if (err) reject(err);
                // this.changes retorna o número de linhas apagadas (1 se deu certo, 0 se não achou)
                else resolve(this.changes); 
            });
        });
    }
};

module.exports = Itinerary;