# Tour.In - Plataforma de Descoberta de Experiências Locais

Este projeto está dividido em três partes: `frontend` (aplicação web estática), `backend` (API Node.js/Express) e `database` (SQLite).

## Pré-requisitos

1. Node.js e npm
2. VS Code (recomendado) com as extensões listadas abaixo

## 1. Extensões necessárias no VS Code

| Extensão | Autor | Finalidade |
|---|---|---|
| REST Client **ou** Thunder Client | Huachao Mao | Testar os endpoints da API diretamente no VS Code |
| SQLite Viewer | Florian Klampfer | Visualizar os dados do banco `.db` sem ferramentas externas |
| Live Server | Ritwick Dey | Abrir o frontend com reload automático no navegador |
| ESLint | Microsoft | Detectar erros no código JavaScript do backend |

## 2. Configuração do Banco de Dados (SQLite)

O projeto utiliza **SQLite** — o banco de dados já vem como arquivo no repositório (`database/tourin.db`), sem necessidade de instalar nenhum serviço externo.

Caso precise recriar o banco do zero, execute os scripts na seguinte ordem:

```bash
node database/setup.js
```

Ou manualmente, via sua interface SQLite:

```sql
-- Execute na ordem:
-- 1. database/schema.sql
-- 2. database/seed.sql
```

## 3. Configuração e Execução do Backend (API)

1. Navegue até o diretório `backend`:

    ```bash
    cd Tour_In/backend
    ```

2. Instale as dependências:

    ```bash
    npm install
    ```

3. Verifique o arquivo `.env` (já incluso no projeto). O conteúdo esperado é:

    ```env
    PORT=3000
    SECRET_KEY=sua_chave_secreta_aqui
    ```

4. Inicie a API:

    ```bash
    npm run dev
    ```

    A API estará disponível em `http://localhost:3000`.

## 4. Configuração do Frontend

O frontend é uma aplicação estática com HTML, CSS e JavaScript puro.

1. Navegue até o diretório `frontend`:

    ```bash
    cd Tour_In/frontend
    ```
<<<<<<< HEAD

2. Abra o arquivo `index.html` com a extensão **Live Server** no VS Code (clique com o botão direito → *Open with Live Server*).

3. **Para o Mapa**: Substitua `YOUR_API_KEY` no arquivo `frontend/pages/explore.html` pela sua chave da API do Google Maps.

## Estrutura do Projeto

```
Tour_In/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── database/
│   ├── schema.sql
│   ├── seed.sql
│   ├── setup.js
│   └── tourin.db
└── frontend/
    ├── assets/
    │   ├── css/
    │   ├── img/
    │   └── js/
    ├── pages/
    └── index.html
```
=======
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
>>>>>>> 56af7e7312c6bad941715f189f61b3f7d1f00567
