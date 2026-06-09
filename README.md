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

## 4. Extensões necessárias no VS Code
O projeto é um Node.js + Express no backend e HTML/CSS/JS puro no frontend. As extensões essenciais são:
1. REST Client (ou Thunder Client)
Para testar os casos de teste da API diretamente no VS Code, sem precisar do Postman.

Nome: REST Client (de Huachao Mao) ou Thunder Client

2. SQLite Viewer
O banco de dados do projeto é um arquivo .db (SQLite). Essa extensão permite visualizar os dados sem instalar nada extra.

Nome: SQLite Viewer (de Florian Klampfer)

3. Live Server
Para abrir o frontend (HTML estático) com reload automático no navegador.

Nome: Live Server (de Ritwick Dey)

4. ESLint (recomendada)
O projeto usa JavaScript puro, então ajuda a pegar erros no código do backend.

Nome: ESLint
