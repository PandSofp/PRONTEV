-- PRONTEV - Seed Data
-- Phase 1: Initial Data for Testing
-- Generated: 2025-12-24

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert HQ Branch
INSERT INTO
    public.branches (
        id,
        name,
        location,
        contact,
        is_hq,
        settings
    )
VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        'Sede PRONTEV (HQ)',
        'Luanda, Angola',
        '+244 900 000 000',
        true,
        '{"timezone": "Africa/Luanda", "currency": "AOA"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Branch Luanda Sul
INSERT INTO
    public.branches (
        id,
        name,
        location,
        contact,
        is_hq,
        settings
    )
VALUES (
        '00000000-0000-0000-0000-000000000002'::UUID,
        'PRONTEV Luanda Sul',
        'Talatona, Luanda',
        '+244 900 111 111',
        false,
        '{"timezone": "Africa/Luanda", "currency": "AOA"}'::jsonb
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Categories
INSERT INTO
    public.categories (id, name, description, icon)
VALUES (
        '10000000-0000-0000-0000-000000000001'::UUID,
        'Eletrônicos',
        'Produtos eletrônicos e acessórios',
        'laptop'
    ),
    (
        '10000000-0000-0000-0000-000000000002'::UUID,
        'Papelaria',
        'Material de escritório e escolar',
        'pencil'
    ),
    (
        '10000000-0000-0000-0000-000000000003'::UUID,
        'Bebidas',
        'Bebidas e refrescos',
        'coffee'
    ),
    (
        '10000000-0000-0000-0000-000000000004'::UUID,
        'Snacks',
        'Lanches e petiscos',
        'cookie'
    ),
    (
        '10000000-0000-0000-0000-000000000005'::UUID,
        'Acessórios',
        'Acessórios diversos',
        'shopping-bag'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Services
INSERT INTO
    public.services (
        id,
        name,
        code,
        type,
        base_price,
        unit,
        description
    )
VALUES (
        '20000000-0000-0000-0000-000000000001'::UUID,
        'Navegação Internet',
        'CYBER-01',
        'CYBER',
        200.00,
        'per_hour',
        'Acesso à internet por hora'
    ),
    (
        '20000000-0000-0000-0000-000000000002'::UUID,
        'Impressão P&B',
        'PRINT-BW',
        'PRINT',
        50.00,
        'per_page',
        'Impressão preto e branco'
    ),
    (
        '20000000-0000-0000-0000-000000000003'::UUID,
        'Impressão Colorida',
        'PRINT-COLOR',
        'PRINT',
        100.00,
        'per_page',
        'Impressão a cores'
    ),
    (
        '20000000-0000-0000-0000-000000000004'::UUID,
        'Fotocópia',
        'COPY-01',
        'PRINT',
        30.00,
        'per_page',
        'Fotocópias'
    ),
    (
        '20000000-0000-0000-0000-000000000005'::UUID,
        'Plastificação A4',
        'PLAST-A4',
        'PRINT',
        500.00,
        'fixed',
        'Plastificação de documento A4'
    ),
    (
        '20000000-0000-0000-0000-000000000006'::UUID,
        'Manutenção PC',
        'MAINT-PC',
        'MAINTENANCE',
        2000.00,
        'fixed',
        'Manutenção básica de computador'
    ),
    (
        '20000000-0000-0000-0000-000000000007'::UUID,
        'Instalação Software',
        'SOFT-INST',
        'SOFTWARE',
        1500.00,
        'fixed',
        'Instalação de software'
    )
ON CONFLICT (id) DO NOTHING;

-- Note: Users will be created automatically via Supabase Auth
-- But we can prepare sample products for the HQ branch

-- Insert Sample Products for HQ
INSERT INTO
    public.products (
        name,
        sku,
        category_id,
        branch_id,
        price,
        cost_price,
        stock_quantity,
        min_stock_level,
        description
    )
VALUES
    -- Eletrônicos
    (
        'Mouse USB',
        'ELEC-001',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        1500.00,
        800.00,
        25,
        5,
        'Mouse USB óptico'
    ),
    (
        'Teclado USB',
        'ELEC-002',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        2500.00,
        1500.00,
        15,
        3,
        'Teclado USB padrão'
    ),
    (
        'Pendrive 16GB',
        'ELEC-003',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        1800.00,
        1000.00,
        30,
        10,
        'Pendrive USB 16GB'
    ),
    (
        'Fones de Ouvido',
        'ELEC-004',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000001',
        1200.00,
        600.00,
        40,
        10,
        'Fones de ouvido'
    ),

-- Papelaria
(
    'Caneta Azul',
    'PAP-001',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    100.00,
    50.00,
    100,
    20,
    'Caneta esferográfica azul'
),
(
    'Caderno A4',
    'PAP-002',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    800.00,
    400.00,
    50,
    10,
    'Caderno universitário A4'
),
(
    'Papel A4 (Resma)',
    'PAP-003',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    3000.00,
    2000.00,
    20,
    5,
    'Resma de papel A4 (500 folhas)'
),

-- Bebidas
(
    'Água 500ml',
    'BEB-001',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    200.00,
    100.00,
    100,
    20,
    'Água mineral 500ml'
),
(
    'Coca-Cola 350ml',
    'BEB-002',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    300.00,
    180.00,
    80,
    15,
    'Refrigerante Coca-Cola 350ml'
),
(
    'Café Expresso',
    'BEB-003',
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    250.00,
    120.00,
    50,
    10,
    'Café expresso'
),

-- Snacks
(
    'Salgadinho',
    'SNACK-001',
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    250.00,
    150.00,
    60,
    15,
    'Salgadinho pacote'
),
(
    'Chocolate',
    'SNACK-002',
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    350.00,
    200.00,
    40,
    10,
    'Barra de chocolate'
),
(
    'Biscoito',
    'SNACK-003',
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    200.00,
    120.00,
    70,
    15,
    'Pacote de biscoito'
)
ON CONFLICT (sku) DO NOTHING;

-- Insert Sample Products for Luanda Sul branch
INSERT INTO
    public.products (
        name,
        sku,
        category_id,
        branch_id,
        price,
        cost_price,
        stock_quantity,
        min_stock_level,
        description
    )
VALUES (
        'Mouse USB',
        'ELEC-001-LS',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        1500.00,
        800.00,
        20,
        5,
        'Mouse USB óptico'
    ),
    (
        'Pendrive 16GB',
        'ELEC-003-LS',
        '10000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        1800.00,
        1000.00,
        25,
        10,
        'Pendrive USB 16GB'
    ),
    (
        'Caneta Azul',
        'PAP-001-LS',
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        100.00,
        50.00,
        80,
        20,
        'Caneta esferográfica azul'
    ),
    (
        'Papel A4 (Resma)',
        'PAP-003-LS',
        '10000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000002',
        3000.00,
        2000.00,
        15,
        5,
        'Resma de papel A4 (500 folhas)'
    ),
    (
        'Água 500ml',
        'BEB-001-LS',
        '10000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000002',
        200.00,
        100.00,
        90,
        20,
        'Água mineral 500ml'
    ),
    (
        'Salgadinho',
        'SNACK-001-LS',
        '10000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000002',
        250.00,
        150.00,
        50,
        15,
        'Salgadinho pacote'
    )
ON CONFLICT (sku) DO NOTHING;

-- ============================================
-- INFORMATION
-- ============================================

-- Users should be created via Supabase Auth Dashboard or sign-up flow
-- Example user metadata for manual creation:
/*
{
"name": "Administrador PRONTEV",
"role": "HQ_ADMIN",
"branch_id": "00000000-0000-0000-0000-000000000001"
}
*/

-- Test credentials (use Supabase Auth to create):
-- Email: admin@prontev.com
-- Password: (set via Supabase Dashboard)
-- Metadata: {"name": "Admin PRONTEV", "role": "HQ_ADMIN", "branch_id": "00000000-0000-0000-0000-000000000001"}

-- Email: gerente.sul@prontev.com
-- Password: (set via Supabase Dashboard)
-- Metadata: {"name": "Gerente Luanda Sul", "role": "BRANCH_ADMIN", "branch_id": "00000000-0000-0000-0000-000000000002"}

-- Email: vendedor.sul@prontev.com
-- Password: (set via Supabase Dashboard)
-- Metadata: {"name": "Vendedor Luanda Sul", "role": "BRANCH_USER", "branch_id": "00000000-0000-0000-0000-000000000002"}