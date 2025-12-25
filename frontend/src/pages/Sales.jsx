import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { ShoppingCart, Plus, Minus, Trash2, Search, Calculator, User } from 'lucide-react'
import { savePendingSale } from '../services/offlineService'
import { createSale } from '../services/salesService'
import { fetchProducts } from '../services/productsService'
import { fetchServices } from '../services/servicesService'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

const Sales = () => {
    const [cart, setCart] = useState([])
    const [products, setProducts] = useState([])
    const [services, setServices] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [discount, setDiscount] = useState(0)
    const [customer, setCustomer] = useState('Consumidor Final')
    const { showSuccess, showError, showLoading, dismiss } = useToast()
    const { user } = useAuth()

    useEffect(() => {
        const loadData = async () => {
            try {
                const [productsData, servicesData] = await Promise.all([
                    fetchProducts(),
                    fetchServices()
                ])
                setProducts(productsData || [])
                setServices(servicesData || [])
            } catch (err) {
                console.error(err)
                showError('Erro ao carregar dados')
            }
        }
        loadData()
    }, [])

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const total = subtotal - discount

    const addToCart = (item) => {
        const existing = cart.find(i => i.id === item.id)
        if (existing) {
            setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
        } else {
            setCart([...cart, { ...item, quantity: 1 }])
        }
    }

    const removeFromCart = (id) => setCart(cart.filter(i => i.id !== id))

    const updateQuantity = (id, delta) => {
        setCart(cart.map(i => {
            if (i.id === id) {
                const newQty = Math.max(1, i.quantity + delta)
                return { ...i, quantity: newQty }
            }
            return i
        }))
    }

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showError('Carrinho está vazio')
            return
        }

        const saleData = {
            items: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.price
            })),
            payment_method: 'CASH',
            discount: discount || 0
        }

        const toastId = showLoading('Processando venda...')

        if (!navigator.onLine) {
            await savePendingSale(saleData)
            dismiss(toastId)
            showInfo('Venda guardada localmente. Será sincronizada quando houver internet.')
        } else {
            try {
                await createSale(saleData)
                dismiss(toastId)
                showSuccess('Venda concluída com sucesso!')
            } catch (err) {
                console.error(err)
                await savePendingSale(saleData)
                dismiss(toastId)
                showError('Erro ao processar. Venda guardada localmente.')
            }
        }

        setCart([])
        setDiscount(0)
        setCustomer('Consumidor Final')
    }

    return (
        <Layout>
            <div className="row g-4">
                <div className="col-md-7">
                    <div className="premium-card p-4 mb-4">
                        <div className="input-group mb-4">
                            <span className="input-group-text bg-white border-end-0">
                                <Search size={18} className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control border-start-0"
                                placeholder="Pesquisar produtos ou serviços..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <h6 className="fw-bold mb-3">Produtos</h6>
                        <div className="row g-2 mb-4">
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                                <div key={product.id} className="col-6 col-lg-4">
                                    <div className="card h-100 border-0 shadow-sm p-3 cp" onClick={() => addToCart(product)}>
                                        <span className="text-muted small mb-1">{product.category}</span>
                                        <h6 className="fw-bold mb-2">{product.name}</h6>
                                        <span className="fw-bold text-primary">Kz {product.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <h6 className="fw-bold mb-3">Serviços</h6>
                        <div className="row g-2">
                            {services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(service => (
                                <div key={service.id} className="col-6 col-lg-4">
                                    <div className="card h-100 border-0 shadow-sm p-3 cp bg-light" onClick={() => addToCart(service)}>
                                        <span className="text-muted small mb-1">{service.type}</span>
                                        <h6 className="fw-bold mb-2">{service.name}</h6>
                                        <span className="fw-bold text-success">Kz {service.price.toLocaleString()} / {service.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-md-5">
                    <div className="premium-card p-4 sticky-top" style={{ top: '20px' }}>
                        <div className="d-flex align-items-center mb-4">
                            <ShoppingCart className="me-2 text-primary" size={24} />
                            <h5 className="fw-bold m-0">Carrinho</h5>
                        </div>

                        <div className="mb-4">
                            <label className="form-label small fw-bold">Cliente</label>
                            <div className="input-group input-group-sm">
                                <span className="input-group-text bg-white"><User size={14} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={customer}
                                    onChange={(e) => setCustomer(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="cart-items mb-4" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {cart.length === 0 ? (
                                <p className="text-muted text-center py-5">O carrinho está vazio</p>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                                        <div style={{ flex: 1 }}>
                                            <h6 className="mb-0 small fw-bold">{item.name}</h6>
                                            <span className="text-muted small">Kz {item.price.toLocaleString()}</span>
                                        </div>
                                        <div className="d-flex align-items-center mx-3">
                                            <button className="btn btn-sm btn-light p-1" onClick={() => updateQuantity(item.id, -1)}><Minus size={14} /></button>
                                            <span className="mx-2 small fw-bold">{item.quantity}</span>
                                            <button className="btn btn-sm btn-light p-1" onClick={() => updateQuantity(item.id, 1)}><Plus size={14} /></button>
                                        </div>
                                        <div className="text-end" style={{ width: '80px' }}>
                                            <p className="mb-0 small fw-bold">Kz {(item.price * item.quantity).toLocaleString()}</p>
                                            <button className="btn btn-link text-danger p-0" onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="bg-light p-3 rounded-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Subtotal</span>
                                <span className="fw-bold small">Kz {subtotal.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="text-muted small">Desconto</span>
                                <input
                                    type="number"
                                    className="form-control form-control-sm text-end border-0 bg-transparent p-0 fw-bold"
                                    style={{ width: '100px' }}
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                />
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">TOTAL</span>
                                <h4 className="fw-bold text-primary mb-0">Kz {total.toLocaleString()}</h4>
                            </div>
                        </div>

                        <button
                            className="btn btn-premium w-100 mt-4 py-3 d-flex align-items-center justify-content-center"
                            disabled={cart.length === 0}
                            onClick={handleCheckout}
                        >
                            <Calculator className="me-2" size={20} />
                            Finalizar Venda (Kwanza)
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Sales
