require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // ADICIONADO: Para manipular pastas

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const placeRoutes = require('./routes/places');
const companyRoutes = require('./routes/companies');
const eventRoutes = require('./routes/events');
const itineraryRoutes = require('./routes/itineraries');

const app = express();

// --- CONFIGURAÇÃO DA PASTA DE UPLOADS (NOVO) ---
// Verifica se a pasta 'uploads' existe, se não, cria ela.
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log('Pasta "uploads" criada com sucesso.');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- IMPORTANTE: SERVIR ARQUIVOS ESTÁTICOS (FOTOS) ---
// Permite acessar as fotos via URL (ex: http://localhost:3000/uploads/foto1.jpg)
app.use('/uploads', express.static(uploadDir));

// Servir arquivos do Frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Rota padrão para SPA (Se acessar uma rota desconhecida, manda o index.html)
app.get('*', (req, res) => {
  // Se for uma requisição de API que deu erro (404), não retorna o HTML
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return res.status(404).json({ message: 'Não encontrado' });
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));