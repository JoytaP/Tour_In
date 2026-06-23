-- ════════════════════════════════════════════════════════
-- Tour.In — Schema Unificado
-- ════════════════════════════════════════════════════════

-- Tabela de Usuários (usuários comuns + empresas)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',       -- 'user' | 'company'

    -- Campos de usuário comum
    bio TEXT,
    city TEXT,
    phone TEXT,
    preferences TEXT,               -- JSON array ex: ["gastronomy","nature"]

    -- Campos de empresa
    cnpj TEXT UNIQUE,               -- unicidade de CNPJ garantida no banco
    category TEXT,
    address TEXT,
    website TEXT,
    description TEXT,
    photos TEXT,                    -- JSON array de paths
    operating_hours TEXT,           -- JSON objeto com horários por dia
    profile_views INTEGER DEFAULT 0,-- contador de visualizações do perfil
    lat REAL,
    lon REAL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Locais cadastrados (alimentam o mapa)
CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,                  -- 'gastronomy'|'culture'|'nature'|'nightlife'|'tourism'
    address TEXT,
    lat REAL,
    lon REAL,
    image_url TEXT,
    owner_id INTEGER,               -- FK usuário que cadastrou
    FOREIGN KEY(owner_id) REFERENCES users(id)
);

-- Eventos
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME,
    location TEXT,
    category TEXT,
    lat REAL,
    lon REAL,
    image_url TEXT,
    company_id INTEGER,             -- FK empresa criadora (opcional)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(company_id) REFERENCES users(id)
);

-- Avaliações (de locais OU de eventos)
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    place_id INTEGER,               -- preenchido se for avaliação de local
    event_id INTEGER,               -- preenchido se for avaliação de evento
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)  REFERENCES users(id),
    FOREIGN KEY(place_id) REFERENCES places(id),
    FOREIGN KEY(event_id) REFERENCES events(id)
);

-- Itinerários
CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    items TEXT,                     -- JSON com IDs de places/events
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Wishlist (lugares e eventos salvos pelo usuário)
CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    place_id INTEGER,               -- preenchido se for um lugar
    event_id INTEGER,               -- preenchido se for um evento
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, place_id, event_id),
    FOREIGN KEY(user_id)  REFERENCES users(id),
    FOREIGN KEY(place_id) REFERENCES places(id),
    FOREIGN KEY(event_id) REFERENCES events(id)
);

-- Reservas (lugares e eventos)
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    place_id INTEGER,                   -- preenchido se for reserva de lugar
    event_id INTEGER,                   -- preenchido se for reserva de evento
    reservation_date TEXT NOT NULL,     -- data/hora da visita desejada
    people INTEGER DEFAULT 1,           -- número de pessoas
    notes TEXT,                         -- observações do usuário
    status TEXT DEFAULT 'pending',      -- 'pending' | 'confirmed' | 'cancelled'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id)  REFERENCES users(id),
    FOREIGN KEY(place_id) REFERENCES places(id),
    FOREIGN KEY(event_id) REFERENCES events(id)
);
