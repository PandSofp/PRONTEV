-- PRONTEV - Row Level Security (RLS) Policies
-- Phase 1: Security Configuration
-- Generated: 2025-12-24

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION FOR USER CONTEXT
-- ============================================

-- Get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS VARCHAR AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's branch_id
CREATE OR REPLACE FUNCTION public.get_current_user_branch()
RETURNS UUID AS $$
    SELECT branch_id FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is HQ Admin
CREATE OR REPLACE FUNCTION public.is_hq_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'HQ_ADMIN'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role IN ('HQ_ADMIN', 'BRANCH_ADMIN')
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- CATEGORIES POLICIES
-- ============================================

-- Anyone authenticated can view categories
CREATE POLICY "categories_select_policy" ON public.categories FOR
SELECT TO authenticated USING (true);

-- Only admins can manage categories
CREATE POLICY "categories_insert_policy" ON public.categories FOR INSERT TO authenticated
WITH
    CHECK (public.is_admin ());

CREATE POLICY "categories_update_policy" ON public.categories
FOR UPDATE
    TO authenticated USING (public.is_admin ())
WITH
    CHECK (public.is_admin ());

CREATE POLICY "categories_delete_policy" ON public.categories FOR DELETE TO authenticated USING (public.is_admin ());

-- ============================================
-- BRANCHES POLICIES
-- ============================================

-- Users can see their own branch or all if HQ Admin
CREATE POLICY "branches_select_policy" ON public.branches FOR
SELECT TO authenticated USING (
        public.is_hq_admin ()
        OR id = public.get_current_user_branch ()
    );

-- Only HQ Admin can manage branches
CREATE POLICY "branches_insert_policy" ON public.branches FOR INSERT TO authenticated
WITH
    CHECK (public.is_hq_admin ());

CREATE POLICY "branches_update_policy" ON public.branches
FOR UPDATE
    TO authenticated USING (public.is_hq_admin ())
WITH
    CHECK (public.is_hq_admin ());

CREATE POLICY "branches_delete_policy" ON public.branches FOR DELETE TO authenticated USING (public.is_hq_admin ());

-- ============================================
-- USERS POLICIES
-- ============================================

-- Users can see their own profile, admins can see their branch users, HQ can see all
CREATE POLICY "users_select_policy" ON public.users FOR
SELECT TO authenticated USING (
        id = auth.uid ()
        OR public.is_hq_admin ()
        OR (
            public.is_admin ()
            AND branch_id = public.get_current_user_branch ()
        )
    );

-- Only admins can create users in their branch, HQ can create anywhere
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT TO authenticated
WITH
    CHECK (
        public.is_hq_admin ()
        OR (
            public.is_admin ()
            AND branch_id = public.get_current_user_branch ()
        )
    );

-- Users can update their own profile, admins can update their branch users
CREATE POLICY "users_update_policy" ON public.users
FOR UPDATE
    TO authenticated USING (
        id = auth.uid ()
        OR public.is_hq_admin ()
        OR (
            public.is_admin ()
            AND branch_id = public.get_current_user_branch ()
        )
    )
WITH
    CHECK (
        id = auth.uid ()
        OR public.is_hq_admin ()
        OR (
            public.is_admin ()
            AND branch_id = public.get_current_user_branch ()
        )
    );

-- Only HQ Admin can delete users
CREATE POLICY "users_delete_policy" ON public.users FOR DELETE TO authenticated USING (public.is_hq_admin ());

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

-- Users can see products from their branch, HQ can see all
CREATE POLICY "products_select_policy" ON public.products FOR
SELECT TO authenticated USING (
        public.is_hq_admin ()
        OR branch_id = public.get_current_user_branch ()
    );

-- Admins can create products in their branch, HQ can create anywhere
CREATE POLICY "products_insert_policy" ON public.products FOR INSERT TO authenticated
WITH
    CHECK (
        public.is_admin ()
        AND (
            public.is_hq_admin ()
            OR branch_id = public.get_current_user_branch ()
        )
    );

-- Admins can update products in their branch
CREATE POLICY "products_update_policy" ON public.products
FOR UPDATE
    TO authenticated USING (
        public.is_admin ()
        AND (
            public.is_hq_admin ()
            OR branch_id = public.get_current_user_branch ()
        )
    )
WITH
    CHECK (
        public.is_admin ()
        AND (
            public.is_hq_admin ()
            OR branch_id = public.get_current_user_branch ()
        )
    );

-- Admins can soft delete products (set deleted_at)
CREATE POLICY "products_delete_policy" ON public.products FOR DELETE TO authenticated USING (
    public.is_admin ()
    AND (
        public.is_hq_admin ()
        OR branch_id = public.get_current_user_branch ()
    )
);

-- ============================================
-- SERVICES POLICIES
-- ============================================

-- Everyone can view services (they're global)
CREATE POLICY "services_select_policy" ON public.services FOR
SELECT TO authenticated USING (true);

-- Only admins can manage services
CREATE POLICY "services_insert_policy" ON public.services FOR INSERT TO authenticated
WITH
    CHECK (public.is_admin ());

CREATE POLICY "services_update_policy" ON public.services
FOR UPDATE
    TO authenticated USING (public.is_admin ())
WITH
    CHECK (public.is_admin ());

CREATE POLICY "services_delete_policy" ON public.services FOR DELETE TO authenticated USING (public.is_admin ());

-- ============================================
-- SALES POLICIES
-- ============================================

-- Users can see sales from their branch, HQ can see all
CREATE POLICY "sales_select_policy" ON public.sales FOR
SELECT TO authenticated USING (
        public.is_hq_admin ()
        OR branch_id = public.get_current_user_branch ()
    );

-- Users can create sales in their branch
CREATE POLICY "sales_insert_policy" ON public.sales FOR INSERT TO authenticated
WITH
    CHECK (
        public.is_hq_admin ()
        OR branch_id = public.get_current_user_branch ()
    );

-- Only admins can update sales (corrections)
CREATE POLICY "sales_update_policy" ON public.sales
FOR UPDATE
    TO authenticated USING (
        public.is_admin ()
        AND (
            public.is_hq_admin ()
            OR branch_id = public.get_current_user_branch ()
        )
    )
WITH
    CHECK (
        public.is_admin ()
        AND (
            public.is_hq_admin ()
            OR branch_id = public.get_current_user_branch ()
        )
    );

-- Only HQ Admin can delete sales
CREATE POLICY "sales_delete_policy" ON public.sales FOR DELETE TO authenticated USING (public.is_hq_admin ());

-- ============================================
-- SALE ITEMS POLICIES
-- ============================================

-- Users can see sale items from sales they can access
CREATE POLICY "sale_items_select_policy" ON public.sale_items FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.sales
            WHERE
                sales.id = sale_items.sale_id
                AND (
                    public.is_hq_admin ()
                    OR sales.branch_id = public.get_current_user_branch ()
                )
        )
    );

-- Sale items are created with their parent sale
CREATE POLICY "sale_items_insert_policy" ON public.sale_items FOR INSERT TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.sales
            WHERE
                sales.id = sale_items.sale_id
                AND (
                    public.is_hq_admin ()
                    OR sales.branch_id = public.get_current_user_branch ()
                )
        )
    );

-- Only admins can update sale items
CREATE POLICY "sale_items_update_policy" ON public.sale_items
FOR UPDATE
    TO authenticated USING (
        public.is_admin ()
        AND EXISTS (
            SELECT 1
            FROM public.sales
            WHERE
                sales.id = sale_items.sale_id
                AND (
                    public.is_hq_admin ()
                    OR sales.branch_id = public.get_current_user_branch ()
                )
        )
    )
WITH
    CHECK (
        public.is_admin ()
        AND EXISTS (
            SELECT 1
            FROM public.sales
            WHERE
                sales.id = sale_items.sale_id
                AND (
                    public.is_hq_admin ()
                    OR sales.branch_id = public.get_current_user_branch ()
                )
        )
    );

-- Only HQ Admin can delete sale items
CREATE POLICY "sale_items_delete_policy" ON public.sale_items FOR DELETE TO authenticated USING (public.is_hq_admin ());

-- ============================================
-- SYNC LOGS POLICIES
-- ============================================

-- Users can see sync logs from their branch
CREATE POLICY "sync_logs_select_policy" ON public.sync_logs FOR
SELECT TO authenticated USING (
        public.is_hq_admin ()
        OR branch_id = public.get_current_user_branch ()
    );

-- Anyone can insert sync logs (created by system)
CREATE POLICY "sync_logs_insert_policy" ON public.sync_logs FOR INSERT TO authenticated
WITH
    CHECK (true);

-- Only HQ Admin can delete sync logs
CREATE POLICY "sync_logs_delete_policy" ON public.sync_logs FOR DELETE TO authenticated USING (public.is_hq_admin ());