import axios from 'axios'

const API_URL = '/api/auth'

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password })
    if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        localStorage.setItem('role', response.data.user.role)
        localStorage.setItem('branch_id', response.data.user.branch_id)
        setAuthToken(response.data.token)
    }
    return response.data
}

export const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    localStorage.removeItem('branch_id')
    setAuthToken(null)
}

export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
        delete axios.defaults.headers.common['Authorization']
    }
}
