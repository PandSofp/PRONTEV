-- ==========================================================
-- PRONTEV: Base de Dados Completa e Consultas
-- ==========================================================

-- 0. CRIAR BASE DE DADOS
-- Execute estas linhas primeiro se ainda não criou a base de dados:
-- CREATE DATABASE prontev;
-- \c prontev; (Se estiver usando psql)

-- ----------------------------------------------------------
-- 1. ESTRUTURA (SCHEMA)
-- ----------------------------------------------------------

-- Categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sucursais (Lojas)
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location TEXT,
    contact VARCHAR(50),
    is_hq BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usuários e Níveis de Acesso
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

-- Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories (id) ON DELETE SET NULL,
    branch_id INTEGER REFERENCES branches (id) ON DELETE CASCADE,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Serviços (Impressões, Manutenção, etc.)
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100), -- CYBER, PRINT, MAINTENANCE, etc.
    base_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50), -- per_page, per_unit, fixed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendas
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
    offline_id VARCHAR(255) UNIQUE, -- ID do IndexedDB (PWA)
    sync_date TIMESTAMP
);

-- Itens da Venda (Produtos/Serviços Vendidos)
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales (id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products (id) ON DELETE SET NULL,
    service_id INTEGER REFERENCES services (id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL
);

-- Log de Sincronização
CREATE TABLE sync_logs (
    id SERIAL PRIMARY KEY,
    branch_id INTEGER REFERENCES branches (id),
    sync_status VARCHAR(50),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 2. DADOS INICIAIS (SEED DATA)
-- ----------------------------------------------------------

-- Inserir Sucursal Principal (Sede)
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
    )
ON CONFLICT DO NOTHING;

-- Inserir Usuário Administrador (Email: admin@prontev.com | Senha: admin123)
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
        (
            SELECT id
            FROM branches
            WHERE
                is_hq = TRUE
            LIMIT 1
        )
    )
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------
-- 3. CONSULTAS FREQUENTES (QUERIES)
-- ----------------------------------------------------------

-- Ver todos os usuários e onde trabalham
SELECT u.name, u.email, u.role, b.name as sucursal
FROM users u
    LEFT JOIN branches b ON u.branch_id = b.id;

-- Verificar stock de produtos por sucursal
SELECT p.name, p.stock_quantity, b.name as sucursal
FROM products p
    JOIN branches b ON p.branch_id = b.id
WHERE
    p.stock_quantity < 10;
-- Alerta de stock baixo

-- Resumo financeiro por sucursal
SELECT b.name as sucursal, SUM(s.final_amount) as vendas_totais
FROM sales s
    JOIN branches b ON s.branch_id = b.id
GROUP BY
    b.name;

-- Itens mais vendidos (Serviços)
SELECT sv.name, SUM(si.quantity) as total_vendido
FROM sale_items si
    JOIN services sv ON si.service_id = sv.id
GROUP BY
    sv.name
ORDER BY total_vendido DESC;