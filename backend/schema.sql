-- PRONTEV Database Schema (PostgreSQL)

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Branches
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    contact VARCHAR(50),
    is_hq BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (
        role IN (
            'HQ_ADMIN',
            'BRANCH_ADMIN',
            'BRANCH_USER'
        )
    ),
    branch_id INTEGER REFERENCES branches (id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES branches (id) ON DELETE CASCADE,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- CYBER, PRINT, MAINTENANCE, etc.
    base_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50), -- per_page, per_unit, fixed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches (id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15, 2) DEFAULT 0.00,
    final_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50),
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_offline BOOLEAN DEFAULT FALSE,
    offline_id VARCHAR(255) UNIQUE, -- ID from IndexedDB
    sync_date TIMESTAMP
);

-- Sale Items
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales (id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products (id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services (id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL
);

-- Sync Log
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches (id),
    sync_status VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data Seed
INSERT INTO
    branches (
        name,
        location,
        contact,
        is_hq
    )
VALUES (
        'Sede PRONTEV',
        'Luanda, Angola',
        '+244 900 000 000',
        TRUE
    ) ON CONFLICT DO NOTHING;

INSERT INTO
    users (
        name,
        email,
        password_hash,
        role,
        branch_id
    )
VALUES (
        'Administrador PRONTEV',
        'admin@prontev.com',
        '$2b$10$hpn9Tw1EOu1kPDsuQ9VHk.otnjVF4wHRrT00GO5tejw4diY8Aym1W',
        'HQ_ADMIN',
        1
    ) ON CONFLICT DO NOTHING;