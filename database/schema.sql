<<<<<<< HEAD
-- ════════════════════════════════════════════════════════
-- Tour.In — Schema Unificado
-- ════════════════════════════════════════════════════════

-- Tabela de Usuários (usuários comuns + empresas)
=======
-- Tabela de Usuários (unificada: inclui campos de usuário comum e de empresa)
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
<<<<<<< HEAD
    role TEXT DEFAULT 'user',       -- 'user' | 'company'
=======
    role TEXT DEFAULT 'user', -- 'user' ou 'company'
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c

    -- Campos de usuário comum
    bio TEXT,
    city TEXT,
<<<<<<< HEAD
    phone TEXT,
    preferences TEXT,               -- JSON array ex: ["gastronomy","nature"]
=======
    preferences TEXT,
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c

    -- Campos de empresa
    cnpj TEXT,
    category TEXT,
<<<<<<< HEAD
    address TEXT,
    website TEXT,
    description TEXT,
    photos TEXT,                    -- JSON array de paths
=======
    phone TEXT,
    address TEXT,
    website TEXT,
    description TEXT,
    photos TEXT,
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
    lat REAL,
    lon REAL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

<<<<<<< HEAD
-- Locais cadastrados (alimentam o mapa)
=======
-- Tabela de Locais (Places)
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
<<<<<<< HEAD
    category TEXT,                  -- 'gastronomy'|'culture'|'nature'|'nightlife'|'tourism'
    address TEXT,
    lat REAL,
    lon REAL,
    image_url TEXT,
    owner_id INTEGER,               -- FK usuário que cadastrou
    FOREIGN KEY(owner_id) REFERENCES users(id)
);

-- Eventos
=======
    category TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    owner_id INTEGER,
    image_url TEXT,
    FOREIGN KEY(owner_id) REFERENCES users(id)
);

-- Tabela de Eventos
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date DATETIME,
    location TEXT,
    category TEXT,
<<<<<<< HEAD
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
=======
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itinerários
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
CREATE TABLE IF NOT EXISTS itineraries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
<<<<<<< HEAD
    items TEXT,                     -- JSON com IDs de places/events
=======
    items TEXT,
>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

<<<<<<< HEAD
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
=======
-- Tabela de Wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL,
    place_id INTEGER NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, place_id),

    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(place_id) REFERENCES places(id)
);

>>>>>>> fb3469b4621353d6d966287860108b85af1cb28c
