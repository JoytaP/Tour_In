# Tour.In — Plataforma de Descoberta de Experiências Locais

Aplicação full-stack para descoberta, avaliação e reserva de locais e eventos
turísticos, com área dedicada para empresas parceiras.

## Stack

- **Backend**: Node.js + Express
- **Banco de dados**: SQLite (arquivo único, `database/tourin.db`)
- **Frontend**: HTML/CSS/JavaScript estático (vanilla), servido pelo próprio Express
- **Autenticação**: JWT (JSON Web Tokens) + bcrypt para senhas

## Arquitetura

```
Tour_In/
├── backend/
│   ├── server.js              # Ponto de entrada — monta middlewares e rotas
│   ├── config/
│   │   ├── env.js              # Carrega e valida variáveis de ambiente
│   │   └── database.js         # Conexão SQLite + helpers async (run/get/all)
│   ├── middleware/
│   │   ├── auth.js              # requireAuth / optionalAuth / requireRole (JWT)
│   │   ├── security.js          # Helmet, rate limiting, sanitização de entrada
│   │   ├── upload.js             # Multer (upload de imagens, filtro de tipo/tamanho)
│   │   ├── validation.js          # Validação de payloads por rota
│   │   └── errorHandler.js         # Tratamento central de erros + 404
│   ├── routes/                # Definição das rotas REST (uma por recurso)
│   ├── controllers/            # Lógica de cada endpoint (async/await)
│   ├── models/                 # Acesso a dados (SQLite, queries parametrizadas)
│   ├── utils/
│   │   ├── AppError.js          # Erro operacional com status HTTP
│   │   └── asyncHandler.js        # Wrapper para capturar erros async
│   ├── uploads/                # Arquivos enviados pelos usuários (gitignored)
│   ├── .env.example             # Modelo de variáveis de ambiente
│   └── package.json
├── database/
│   ├── schema.sql               # DDL — criação das tabelas
│   ├── seed.sql                  # Dados iniciais (Brasília, DF)
│   ├── setup.js                   # Cria o banco e aplica schema + seed
│   └── migrate.js                  # Migrações incrementais (idempotentes)
├── frontend/
│   ├── index.html + pages/      # Páginas da aplicação
│   └── assets/                  # CSS, JS e imagens
└── package.json                 # Scripts de conveniência na raiz
```

### Camadas e responsabilidades

1. **Rotas** (`routes/`): declaram o caminho HTTP, middlewares (autenticação,
   validação, upload) e qual controller atende a requisição.
2. **Middlewares** (`middleware/`): autenticação/autorização, validação de
   entrada, segurança HTTP (headers, rate limiting, sanitização) e
   tratamento centralizado de erros.
3. **Controllers** (`controllers/`): orquestram a requisição — chamam
   modelos, montam a resposta. Não acessam o banco diretamente.
4. **Models** (`models/`): única camada que executa SQL, sempre com queries
   parametrizadas (`?`) — nunca concatenação de strings — prevenindo SQL
   Injection.
5. **Utils** (`utils/`): `AppError` padroniza erros com status HTTP;
   `asyncHandler` evita repetição de `try/catch` em cada controller.

## Segurança implementada

- **Senhas**: hash com `bcrypt` (nunca armazenadas em texto puro).
- **Autenticação**: JWT assinado com segredo forte (validado no boot — a
  aplicação não inicia com `JWT_SECRET` ausente ou fraco).
- **Autorização por papel**: rotas de empresa exigem `role = 'company'`
  (`requireRole`).
- **Cabeçalhos HTTP seguros**: via `helmet` (proteção contra clickjacking,
  sniffing de MIME, etc.).
- **Rate limiting**: limite geral na API e limite mais restrito em rotas de
  login/registro, mitigando força bruta.
- **Validação de entrada**: todos os endpoints de escrita validam o corpo da
  requisição antes de tocar o banco.
- **Sanitização**: remove caracteres de controle e chaves suspeitas (`$...`)
  do corpo/query/params.
- **Uploads restritos**: apenas imagens (jpeg/png/webp/gif), limite de 5MB,
  nomes de arquivo gerados pelo servidor (evita path traversal).
- **Mensagens de erro genéricas em produção**: stack traces e detalhes
  internos nunca são expostos ao cliente quando `NODE_ENV=production`.
- **`.env` fora do controle de versão**: segredos nunca são versionados
  (veja `.env.example`).

## Configuração e execução

### 1. Pré-requisitos

- Node.js 18+ e npm

### 2. Instalar dependências do backend

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e defina um `JWT_SECRET` forte e aleatório, por exemplo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Criar e popular o banco de dados

A partir da raiz do projeto:

```bash
npm run db:setup
```

Isso cria `database/tourin.db`, aplica o `schema.sql` e, se o banco estiver
vazio, insere os dados de exemplo de `seed.sql`.

Caso já exista um banco antigo e seja necessário adicionar colunas novas,
execute:

```bash
npm run db:migrate
```

### 5. Iniciar o servidor

```bash
cd backend
npm start        # produção
npm run dev      # desenvolvimento (recarrega ao salvar)
```

O servidor estará disponível em `http://localhost:3000`, servindo tanto a
API (`/api/...`) quanto o frontend estático.

## Variáveis de ambiente (`.env`)

| Variável        | Descrição                                                | Padrão                   |
|------------------|-------------------------------------------------------------|----------------------------|
| `NODE_ENV`        | `development` ou `production`                                | `development`               |
| `PORT`            | Porta HTTP do servidor                                        | `3000`                       |
| `JWT_SECRET`      | Segredo usado para assinar tokens JWT (**obrigatório**)        | —                             |
| `JWT_EXPIRES_IN`  | Validade do token                                              | `24h`                          |
| `DB_PATH`         | Caminho do arquivo SQLite, relativo a `backend/`                | `../database/tourin.db`        |
| `API_URL`         | URL pública da API                                              | `http://localhost:3000`         |
| `CORS_ORIGIN`     | Origens permitidas (separadas por vírgula) ou `*`                | `*`                               |

## Principais endpoints da API

| Recurso     | Rota base           | Observações                                       |
|---------------|------------------------|--------------------------------------------------------|
| Autenticação   | `/api/auth`             | Registro e login de usuários comuns                       |
| Empresas       | `/api/companies`         | Registro, login, perfil e eventos da empresa               |
| Usuários       | `/api/users`              | Perfil, troca de senha, exclusão de conta                   |
| Locais         | `/api/places`             | CRUD de locais + avaliações                                  |
| Eventos        | `/api/events`              | Listagem + avaliações                                         |
| Roteiros       | `/api/itineraries`          | Criar, listar e excluir roteiros do usuário                    |
| Wishlist       | `/api/wishlist`              | Adicionar, listar (`/mine`) e remover itens                     |
| Reservas       | `/api/reservations`           | Criar, listar (`/mine`) e cancelar reservas                      |
| Healthcheck    | `/api/health`                   | Status simples do servidor                                        |

Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`,
obtido em `/api/auth/login` ou `/api/companies/login`.

## Frontend

O frontend é servido como arquivos estáticos pelo próprio Express
(`backend/server.js`). A URL base da API (`API_URL`, em
`frontend/assets/js/main.js`) é resolvida dinamicamente a partir da origem da
página — não é necessário alterar nada ao mudar de domínio/porta em
produção, desde que o frontend continue sendo servido pelo mesmo backend.
