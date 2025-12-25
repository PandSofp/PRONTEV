import { supabase } from '../lib/supabase'

export const fetchCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

    if (error) throw error
    return data
}

export const createCategory = async (categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()

    if (error) throw error
    return data[0]
}

export const updateCategory = async (id, categoryData) => {
    const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()

    if (error) throw error
    return data[0]
}

export const deleteCategory = async (id) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
