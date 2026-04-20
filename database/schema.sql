-- Tabela de Usuários (unificada: inclui campos de usuário comum e de empresa)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'user' ou 'company'

    -- Campos de usuário comum
    bio TEXT,
    city TEXT,
    preferences TEXT,

    -- Campos de empresa
    cnpj TEXT,
    category TEXT,
    phone TEXT,
    address TEXT,
    website TEXT,
    description TEXT,
    photos TEXT,
    lat REAL,
    lon REAL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Locais (Places)
CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    owner_id INTEGER,
    image_url TEXT,
    FOREIGN KEY(owner_id) REFERENCES users(id)
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME,
    location TEXT,
    category TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itinerários
CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    items TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);
