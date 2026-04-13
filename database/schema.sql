-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user', -- 'user' ou 'company'
    bio TEXT,
    city TEXT,
    phone TEXT,
    preferences TEXT, -- Armazenado como JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Locais (Places)
CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- 'gastronomy', 'culture', 'nature', 'nightlife'
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
    items TEXT, -- JSON string com IDs de places/events
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);