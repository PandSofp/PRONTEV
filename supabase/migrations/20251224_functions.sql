-- PRONTEV - Database Functions
-- Phase 1: Business Logic Functions
-- Generated: 2025-12-24

-- ============================================
-- FUNCTION: Create Sale with Items (Atomic Transaction)
-- ============================================

CREATE OR REPLACE FUNCTION public.create_sale_with_items(
    p_branch_id UUID,
    p_user_id UUID,
    p_customer_name VARCHAR DEFAULT NULL,
    p_customer_contact VARCHAR DEFAULT NULL,
    p_total_amount DECIMAL,
    p_discount DECIMAL DEFAULT 0,
    p_tax DECIMAL DEFAULT 0,
    p_final_amount DECIMAL,
    p_payment_method VARCHAR,
    p_notes TEXT DEFAULT NULL,
    p_is_offline BOOLEAN DEFAULT FALSE,
    p_offline_id VARCHAR DEFAULT NULL,
    p_items JSONB
)
RETURNS TABLE(sale_id UUID, invoice_number VARCHAR) AS $$
DECLARE
    v_sale_id UUID;
    v_invoice_number VARCHAR;
    v_item JSONB;
    v_product_id UUID;
    v_service_id UUID;
    v_item_name VARCHAR;
BEGIN
    -- Generate invoice number (format: INV-YYYYMMDD-NNNNNN)
    SELECT 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('invoice_seq')::TEXT, 6, '0')
    INTO v_invoice_number;
    
    -- Insert sale
    INSERT INTO public.sales (
        invoice_number, branch_id, user_id,
        customer_name, customer_contact,
        total_amount, discount, tax, final_amount,
        payment_method, notes,
        is_offline, offline_id,
        status, sale_date
    ) VALUES (
        v_invoice_number, p_branch_id, p_user_id,
        p_customer_name, p_customer_contact,
        p_total_amount, p_discount, p_tax, p_final_amount,
        p_payment_method, p_notes,
        p_is_offline, p_offline_id,
        'completed', NOW()
    ) RETURNING id INTO v_sale_id;
    
    -- Insert sale items and update stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Extract item data
        v_product_id := NULLIF(v_item->>'product_id', '')::UUID;
        v_service_id := NULLIF(v_item->>'service_id', '')::UUID;
        v_item_name := v_item->>'item_name';
        
        -- Insert sale item
        INSERT INTO public.sale_items (
            sale_id, product_id, service_id, item_name,
            quantity, unit_price, discount, subtotal
        ) VALUES (
            v_sale_id,
            v_product_id,
            v_service_id,
            v_item_name,
            (v_item->>'quantity')::INTEGER,
            (v_item->>'unit_price')::DECIMAL,
            COALESCE((v_item->>'discount')::DECIMAL, 0),
            (v_item->>'subtotal')::DECIMAL
        );
        
        -- Update product stock if it's a product sale
        IF v_product_id IS NOT NULL THEN
            UPDATE public.products
            SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER
            WHERE id = v_product_id;
            
            -- Check if stock went below minimum
            IF (SELECT stock_quantity FROM public.products WHERE id = v_product_id) < 
               (SELECT min_stock_level FROM public.products WHERE id = v_product_id) THEN
                -- Here you could trigger a notification
                RAISE NOTICE 'Product % is below minimum stock level', v_item_name;
            END IF;
        END IF;
    END LOOP;
    
    -- Log sync if offline sale
    IF p_is_offline THEN
        INSERT INTO public.sync_logs (branch_id, sale_id, sync_status, message)
        VALUES (p_branch_id, v_sale_id, 'success', 'Offline sale synced successfully');
    END IF;
    
    -- Return sale info
    RETURN QUERY SELECT v_sale_id, v_invoice_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get Branch Sales Summary
-- ============================================

CREATE OR REPLACE FUNCTION public.get_branch_sales_summary(
    p_branch_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE(
    total_sales BIGINT,
    total_revenue DECIMAL,
    average_ticket DECIMAL,
    total_discount DECIMAL,
    top_payment_method VARCHAR,
    sales_by_day JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_sales,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as average_ticket,
        COALESCE(SUM(discount), 0) as total_discount,
        (
            SELECT payment_method 
            FROM public.sales 
            WHERE branch_id = p_branch_id
            AND sale_date BETWEEN p_start_date AND p_end_date
            GROUP BY payment_method 
            ORDER BY COUNT(*) DESC 
            LIMIT 1
        ) as top_payment_method,
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'date', DATE(sale_date),
                    'total', SUM(final_amount),
                    'count', COUNT(*)
                )
            )
            FROM public.sales
            WHERE branch_id = p_branch_id
            AND sale_date BETWEEN p_start_date AND p_end_date
            GROUP BY DATE(sale_date)
            ORDER BY DATE(sale_date)
        ) as sales_by_day
    FROM public.sales
    WHERE branch_id = p_branch_id
    AND sale_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get Low Stock Products
-- ============================================

CREATE OR REPLACE FUNCTION public.get_low_stock_products(
    p_branch_id UUID
)
RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR,
    sku VARCHAR,
    current_stock INTEGER,
    min_stock INTEGER,
    stock_status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        p.sku,
        p.stock_quantity as current_stock,
        p.min_stock_level as min_stock,
        CASE
            WHEN p.stock_quantity = 0 THEN 'OUT_OF_STOCK'
            WHEN p.stock_quantity <= p.min_stock_level THEN 'LOW_STOCK'
            ELSE 'NORMAL'
        END as stock_status
    FROM public.products p
    WHERE p.branch_id = p_branch_id
    AND p.deleted_at IS NULL
    AND p.is_active = TRUE
    AND p.stock_quantity <= p.min_stock_level
    ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Get Top Selling Products
-- ============================================

CREATE OR REPLACE FUNCTION public.get_top_selling_products(
    p_branch_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW(),
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    product_id UUID,
    product_name VARCHAR,
    total_quantity BIGINT,
    total_revenue DECIMAL,
    sale_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        SUM(si.quantity)::BIGINT as total_quantity,
        SUM(si.subtotal) as total_revenue,
        COUNT(DISTINCT s.id)::BIGINT as sale_count
    FROM public.sale_items si
    JOIN public.products p ON si.product_id = p.id
    JOIN public.sales s ON si.sale_id = s.id
    WHERE s.branch_id = p_branch_id
    AND s.sale_date BETWEEN p_start_date AND p_end_date
    AND si.product_id IS NOT NULL
    GROUP BY p.id, p.name
    ORDER BY total_quantity DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCTION: Search Products
-- ============================================

CREATE OR REPLACE FUNCTION public.search_products(
    p_branch_id UUID,
    p_search_term VARCHAR,
    p_category_id UUID DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    name VARCHAR,
    sku VARCHAR,
    price DECIMAL,
    stock_quantity INTEGER,
    category_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.name,
        p.sku,
        p.price,
        p.stock_quantity,
        c.name as category_name
    FROM public.products p
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE p.branch_id = p_branch_id
    AND p.deleted_at IS NULL
    AND p.is_active = TRUE
    AND (
        p.name ILIKE '%' || p_search_term || '%'
        OR p.sku ILIKE '%' || p_search_term || '%'
    )
    AND (p_category_id IS NULL OR p.category_id = p_category_id)
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION public.create_sale_with_items IS 'Creates a complete sale with items in a single atomic transaction, updates stock, and handles offline sync';

COMMENT ON FUNCTION public.get_branch_sales_summary IS 'Returns comprehensive sales summary for a branch within a date range';

COMMENT ON FUNCTION public.get_low_stock_products IS 'Returns products that are at or below minimum stock level';

COMMENT ON FUNCTION public.get_top_selling_products IS 'Returns top selling products by quantity within a date range';

COMMENT ON FUNCTION public.search_products IS 'Full-text search for products by name or SKU';