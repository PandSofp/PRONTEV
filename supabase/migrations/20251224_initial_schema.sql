-- PRONTEV - Supabase Migration Schema
-- Phase 1: Initial Setup with Enterprise Features
-- Generated: 2025-12-24

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- For text search

-- ============================================
-- CORE TABLES
-- ============================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Branches Table
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    location TEXT,
    contact VARCHAR(50),
    is_hq BOOLEAN DEFAULT FALSE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (
        role IN (
            'HQ_ADMIN',
            'BRANCH_ADMIN',
            'BRANCH_USER'
        )
    ) NOT NULL,
    branch_id UUID REFERENCES public.branches (id) ON DELETE SET NULL,
    avatar_url TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
    branch_id UUID REFERENCES public.branches (id) ON DELETE CASCADE,
    price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(15, 2) DEFAULT 0.00,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    images TEXT [] DEFAULT '{}',
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Services Table
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    type VARCHAR(100), -- CYBER, PRINT, MAINTENANCE, etc.
    base_price DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(50), -- per_page, per_unit, fixed, hourly
    description TEXT,
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    branch_id UUID REFERENCES public.branches (id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_contact VARCHAR(100),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(15, 2) DEFAULT 0.00,
    tax DECIMAL(15, 2) DEFAULT 0.00,
    final_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    payment_method VARCHAR(50), -- CASH, CARD, TRANSFER, MULTICAIXA
    status VARCHAR(50) DEFAULT 'completed',
    sale_date TIMESTAMPTZ DEFAULT NOW(),
    is_offline BOOLEAN DEFAULT FALSE,
    offline_id VARCHAR(255) UNIQUE,
    sync_date TIMESTAMPTZ,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sale Items Table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    sale_id UUID REFERENCES public.sales (id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products (id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services (id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL, -- Store name in case product/service is deleted
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    discount DECIMAL(15, 2) DEFAULT 0.00,
    subtotal DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT product_or_service_check CHECK (
        (
            product_id IS NOT NULL
            AND service_id IS NULL
        )
        OR (
            product_id IS NULL
            AND service_id IS NOT NULL
        )
    )
);

-- Sync Logs Table
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    branch_id UUID REFERENCES public.branches (id),
    sale_id UUID REFERENCES public.sales (id),
    sync_status VARCHAR(50), -- pending, success, failed
    message TEXT,
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions Table (for custom session management if needed)
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES public.users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_branch ON public.products (branch_id);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category_id);

CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products (sku);

CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin (name gin_trgm_ops);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_branch ON public.sales (branch_id);

CREATE INDEX IF NOT EXISTS idx_sales_user ON public.sales (user_id);

CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales (sale_date DESC);

CREATE INDEX IF NOT EXISTS idx_sales_invoice ON public.sales (invoice_number);

CREATE INDEX IF NOT EXISTS idx_sales_offline_id ON public.sales (offline_id)
WHERE
    offline_id IS NOT NULL;

-- Sale items indexes
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items (sale_id);

CREATE INDEX IF NOT EXISTS idx_sale_items_product ON public.sale_items (product_id);

CREATE INDEX IF NOT EXISTS idx_sale_items_service ON public.sale_items (service_id);

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_branch ON public.users (branch_id);

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- ============================================
-- SEQUENCES
-- ============================================

-- Sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1;

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;

CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON public.branches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;

CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON public.sales;

CREATE TRIGGER update_sales_updated_at 
    BEFORE UPDATE ON public.sales
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create user profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, name, role, branch_id, metadata)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'BRANCH_USER'),
        (NEW.raw_user_meta_data->>'branch_id')::UUID,
        COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update last_login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET last_login = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE public.categories IS 'Product categories for organization';

COMMENT ON TABLE public.branches IS 'Physical branches/locations of the business';

COMMENT ON TABLE public.users IS 'User profiles extending Supabase auth.users';

COMMENT ON TABLE public.products IS 'Products available for sale';

COMMENT ON TABLE public.services IS 'Services offered (cyber cafe, printing, etc)';

COMMENT ON TABLE public.sales IS 'Sales transactions';

COMMENT ON TABLE public.sale_items IS 'Individual items within a sale';

COMMENT ON TABLE public.sync_logs IS 'Logs for offline sync operations';