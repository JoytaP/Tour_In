const db = require('../config/database');

const Company = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO companies 
                (user_id, name, cnpj, category, phone, address, website, description, photos)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.run(
                query,
                [
                    data.user_id,
                    data.name,
                    data.cnpj,
                    data.category,
                    data.phone,
                    data.address,
                    data.website,
                    data.description,
                    JSON.stringify(data.photos || [])
                ],
                function (err) {
                    if (err) {
                        console.error('Erro SQL Company:', err);
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, ...data });
                    }
                }
            );
        });
    },

    findByUserId: (userId) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM companies WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    }
};

module.exports = Company;