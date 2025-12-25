import { supabase } from '../lib/supabase'

export const fetchUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')

    if (error) throw error
    return data
}

export const createUser = async (userData) => {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
            name: userData.name,
            role: userData.role,
            branch_id: userData.branch_id
        }
    })

    if (authError) {
        // If admin API is not available, use regular signup
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
                data: {
                    name: userData.name,
                    role: userData.role,
                    branch_id: userData.branch_id
                }
            }
        })

        if (signUpError) throw signUpError
        return signUpData.user
    }

    return authData.user
}

export const updateUser = async (id, userData) => {
    const { data, error } = await supabase
        .from('users')
        .update({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            branch_id: userData.branch_id
        })
        .eq('id', id)
        .select()

    if (error) throw error
    return data[0]
}

export const deleteUser = async (id) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}
