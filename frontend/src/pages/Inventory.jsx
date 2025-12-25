import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { Package, Search, Plus, Filter, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { fetchProducts } from '../services/productsService'
import { useToast } from '../context/ToastContext'

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const { showError, showInfo } = useToast()

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts()
                setProducts(data || [])
            } catch (err) {
                console.error(err)
                showError('Erro ao carregar produtos')
            } finally {
                setLoading(false)
            }
        }
        loadProducts()
    }, [])

    const categories = ['Todas', 'Alimentação', 'Material Escolar', 'Produtos Digitais', 'Bens não perecíveis']

    const getStatusBadge = (stock) => {
        if (stock === 0) return <span className="badge bg-danger bg-opacity-10 text-danger">Esgotado</span>
        if (stock < 10) return <span className="badge bg-warning bg-opacity-10 text-warning">Stock Baixo</span>
        return <span className="badge bg-success bg-opacity-10 text-success">Em Stock</span>
    }

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Gestão de Stock</h2>
                    <p className="text-muted">Controle total dos seus produtos e categorias</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary d-flex align-items-center rounded-3">
                        <Filter size={18} className="me-2" /> Filtrar
                    </button>
                    <button className="btn btn-premium shadow-sm d-flex align-items-center">
                        <Plus size={18} className="me-2" /> Novo Produto
                    </button>
                </div>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-3">
                    <div className="premium-card p-4 text-center">
                        <p className="text-muted small mb-1">Total Produtos</p>
                        <h3 className="fw-bold mb-0">124</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="premium-card p-4 text-center border-warning">
                        <p className="text-muted small mb-1 text-warning">Stock Baixo</p>
                        <h3 className="fw-bold mb-0 text-warning">5</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="premium-card p-4 text-center">
                        <p className="text-muted small mb-1">Valor Total</p>
                        <h3 className="fw-bold mb-0 text-primary">Kz 4.5M</h3>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="premium-card p-4 text-center">
                        <p className="text-muted small mb-1">Saídas (Mês)</p>
                        <h3 className="fw-bold mb-0 text-success">15% <ArrowUpRight size={18} /></h3>
                    </div>
                </div>
            </div>

            <div className="premium-card p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                    <div className="input-group" style={{ maxWidth: '400px' }}>
                        <span className="input-group-text bg-white border-end-0"><Search size={18} className="text-muted" /></span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Pesquisar no stock..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="d-flex gap-2">
                        {categories.map(cat => (
                            <button key={cat} className={`btn btn-sm ${cat === 'Todas' ? 'btn-primary' : 'btn-light'} rounded-pill px-3`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th>Stock</th>
                                <th>Estado</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-light p-2 rounded-3 me-3">
                                                <Package size={20} className="text-primary" />
                                            </div>
                                            <span className="fw-bold">{product.name}</span>
                                        </div>
                                    </td>
                                    <td><span className="text-muted small">{product.category}</span></td>
                                    <td><span className="fw-semibold">Kz {product.price.toLocaleString()}</span></td>
                                    <td><span className="fw-bold">{product.stock}</span></td>
                                    <td>{getStatusBadge(product.status)}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-light me-2"><Edit2 size={16} /></button>
                                        <button className="btn btn-sm btn-light text-danger"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    )
}

export default Inventory
