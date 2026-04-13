# Tour.In - Plataforma de Descoberta de Experiências Locais

Este projeto está dividido em duas partes: `frontend` (aplicação web estática) e `backend` (API Node.js/Express).

## Pré-requisitos

1.  Node.js e npm (ou yarn)
2.  PostgreSQL (Recomendado)

## 1. Configuração do Banco de Dados (PostgreSQL)

1.  Crie um novo banco de dados (ex: `tourin_db`).
2.  Crie um usuário e senha (ex: `tourin_user` / `sua_senha`).
3.  Execute os scripts SQL na seguinte ordem:

    ```bash
    # Na sua interface de gerenciamento (pgAdmin, psql, etc.)
    \i database/schema.sql
    \i database/seed.sql
    ```
    * **Observação**: O script `schema.sql` requer as extensões `uuid-ossp` e `jsonb_ops`.

## 2. Configuração e Execução do Backend (API)

1.  Navegue até o diretório `backend`:
    ```bash
    cd tour-in/backend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Crie o arquivo `.env` com suas credenciais de banco de dados:
    ```bash
    # Exemplo de conteúdo do arquivo .env:
    PORT=3000
    SECRET_KEY=sua_chave_secreta_muito_forte_aqui
    
    DB_HOST=localhost
    DB_USER=tourin_user
    DB_PASSWORD=sua_senha
    DB_DATABASE=tourin_db
    DB_PORT=5432
    ```
4.  Inicie a API:
    ```bash
    npm run dev
    # ou 'npm start' para produção
    ```
    A API estará rodando em `http://localhost:3000`.

## 3. Configuração do Frontend

O frontend é uma aplicação estática. Basta abrir os arquivos HTML diretamente no navegador.

1.  Navegue até o diretório `frontend`:
    ```bash
    cd tour-in/frontend
    ```
2.  Abra `index.html` no seu navegador.
3.  **Para o Mapa**: É necessário substituir `YOUR_API_KEY` no arquivo `frontend/pages/explore.html` pela sua chave da API do Google Maps (ou configurar uma alternativa como Leaflet no `maps-integration.js`).