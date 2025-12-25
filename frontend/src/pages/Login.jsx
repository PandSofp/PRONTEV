import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Lock, Mail, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { signIn } = useAuth()
    const { showSuccess, showError } = useToast()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const { error } = await signIn({ email, password })
            if (error) throw error
            showSuccess('Login realizado com sucesso!')
            navigate('/')
        } catch (err) {
            console.error(err)
            const errorMsg = err.message || 'Falha na autenticação'
            setError(errorMsg)
            showError(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-5">
                        <div className="premium-card p-5">
                            <div className="text-center mb-4">
                                <div className="bg-primary d-inline-block p-3 rounded-circle mb-3 shadow-sm">
                                    <LogIn color="white" size={32} />
                                </div>
                                <h2 className="fw-bold">PRONTEV</h2>
                                <p className="text-muted">Gestão Comercial Inteligente</p>
                            </div>

                            {error && <div className="alert alert-danger py-2 small">{error}</div>}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small fw-semibold">E-mail</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Mail size={18} className="text-muted" />
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control border-start-0"
                                            placeholder="seu@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold">Palavra-passe</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0">
                                            <Lock size={18} className="text-muted" />
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control border-start-0"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-premium w-100 py-2 d-flex align-items-center justify-content-center"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin me-2" size={20} /> : 'Entrar no Sistema'}
                                </button>
                            </form>

                            <div className="mt-5 text-center">
                                <p className="text-muted small">
                                    © {new Date().getFullYear()} — <span className="fw-bold text-dark">PandSoft</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
