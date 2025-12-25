import { supabase } from '../lib/supabase'

export const fetchSales = async () => {
    const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            sale_items (
                *,
                products (
                    id,
                    name,
                    price
                )
            )
        `)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export const fetchSale = async (id) => {
    const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            sale_items (
                *,
                products (
                    id,
                    name,
                    price
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export const fetchSalesByBranch = async (branch_id) => {
    const { data, error } = await supabase
        .from('sales')
        .select(`
            *,
            sale_items (
                *,
                products (
                    id,
                    name,
                    price
                )
            )
        `)
        .eq('branch_id', branch_id)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export const createSale = async (saleData) => {
    // Use the Supabase RPC function for atomic sale creation
    const { data, error } = await supabase
        .rpc('create_sale_with_items', {
            p_items: saleData.items,
            p_payment_method: saleData.payment_method,
            p_discount: saleData.discount || 0
        })

    if (error) throw error
    return data
}

export const deleteSale = async (id) => {
    const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
