import { supabase } from '../lib/supabase'

export const fetchBranches = async () => {
    const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name')

    if (error) throw error
    return data
}

export const createBranch = async (branchData) => {
    const { data, error } = await supabase
        .from('branches')
        .insert([branchData])
        .select()

    if (error) throw error
    return data[0]
}

export const updateBranch = async (id, branchData) => {
    const { data, error } = await supabase
        .from('branches')
        .update(branchData)
        .eq('id', id)
        .select()

    if (error) throw error
    return data[0]
}

export const deleteBranch = async (id) => {
    const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
