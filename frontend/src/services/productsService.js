import { supabase } from '../lib/supabase'

export const fetchProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (
                id,
                name
            )
        `)
        .order('name')

    if (error) throw error
    return data
}

export const fetchProduct = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            categories (
                id,
                name
            )
        `)
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export const createProduct = async (productData) => {
    const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()

    if (error) throw error
    return data[0]
}

export const updateProduct = async (id, productData) => {
    const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()

    if (error) throw error
    return data[0]
}

export const deleteProduct = async (id) => {
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
