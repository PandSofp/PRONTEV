import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Wrench,
    Users,
    Building2,
    LogOut,
    ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user, signOut } = useAuth()

    // Fallback role or extract from metadata
    const role = user?.user_metadata?.role || 'BRANCH_USER'
    const userName = user?.user_metadata?.name || user?.email

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['HQ_ADMIN', 'BRANCH_ADMIN', 'BRANCH_USER'] },
        { name: 'Vendas', path: '/sales', icon: ShoppingCart, roles: ['HQ_ADMIN', 'BRANCH_ADMIN', 'BRANCH_USER'] },
        { name: 'Stock', path: '/inventory', icon: Package, roles: ['HQ_ADMIN', 'BRANCH_ADMIN', 'BRANCH_USER'] },
        { name: 'Serviços', path: '/services', icon: Wrench, roles: ['HQ_ADMIN', 'BRANCH_ADMIN', 'BRANCH_USER'] },
        { name: 'Produtos', path: '/products', icon: Package, roles: ['HQ_ADMIN', 'BRANCH_ADMIN'] },
        { name: 'Categorias', path: '/categories', icon: Package, roles: ['HQ_ADMIN', 'BRANCH_ADMIN'] },
        { name: 'Filiais', path: '/branches', icon: Building2, roles: ['HQ_ADMIN'] },
        { name: 'Utilizadores', path: '/users', icon: Users, roles: ['HQ_ADMIN'] },
    ]

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <div className="sidebar d-flex flex-column p-4">
            <div className="mb-5">
                <h3 className="fw-bold tracking-tight">PRONTEV</h3>
                <p className="small text-secondary m-0">{userName}</p>
                <span className="badge bg-primary mt-2" style={{ fontSize: '10px' }}>{role}</span>
            </div>

            <nav className="flex-grow-1">
                <ul className="list-unstyled">
                    {menuItems.filter(item => item.roles.includes(role)).map((item) => (
                        <li key={item.path} className="mb-2">
                            <Link
                                to={item.path}
                                className={`nav-link d-flex align-items-center p-3 rounded-4 transition-all ${location.pathname === item.path ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:bg-gray-800'
                                    }`}
                            >
                                <item.icon size={20} className="me-3" />
                                <span className="flex-grow-1">{item.name}</span>
                                {location.pathname === item.path && <ChevronRight size={16} />}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mt-auto">
                <button
                    onClick={handleLogout}
                    className="btn btn-link text-danger text-decoration-none p-0 d-flex align-items-center"
                >
                    <LogOut size={20} className="me-3" />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar
