import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { DollarSign, ShoppingBag, Wrench, Users, TrendingUp, AlertTriangle } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { SalesTrendChart, TopProductsChart } from '../components/Charts'

const Dashboard = () => {
    const { user } = useAuth()
    const { showError } = useToast()
    const [loading, setLoading] = useState(true)

    const role = user?.user_metadata?.role || 'HQ_ADMIN'
    const isHQ = role === 'HQ_ADMIN'

    useEffect(() => {
        // Aqui podes buscar dados reais do Supabase
        const loadDashboardData = async () => {
            try {
                // Placeholder para futuras queries
                setLoading(false)
            } catch (err) {
                console.error(err)
                showError('Erro ao carregar dados do dashboard')
                setLoading(false)
            }
        }
        loadDashboardData()
    }, [])

    const stats = isHQ ? [
        { title: 'Receita Global', value: 'Kz 18.500.000,00', icon: DollarSign, color: 'text-primary' },
        { title: 'Vendas Totais', value: '450', icon: ShoppingBag, color: 'text-success' },
        { title: 'Serviços Prestados', value: '312', icon: Wrench, color: 'text-warning' },
        { title: 'Total Filiais', value: '3', icon: TrendingUp, color: 'text-info' },
    ] : [
        { title: 'Vendas Hoje', value: 'Kz 45.000,00', icon: DollarSign, color: 'text-primary' },
        { title: 'Produtos Vendidos', value: '12', icon: ShoppingBag, color: 'text-success' },
        { title: 'Serviços Realizados', value: '8', icon: Wrench, color: 'text-warning' },
        { title: 'Novos Clientes', value: '3', icon: Users, color: 'text-info' },
    ]

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Painel {isHQ ? 'Global da Sede' : 'Operacional'}</h2>
                    <p className="text-muted">{isHQ ? 'Visão estratégica de todas as unidades' : 'Visão geral do desempenho da sua filial'}</p>
                </div>

                {/* Charts Section */}
                <div className="row g-4 mb-5">
                    <div className="col-md-8">
                        <div className="premium-card p-4">
                            <h5 className="fw-bold mb-4">Tendência de Vendas (Última Semana)</h5>
                            <SalesTrendChart />
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="premium-card p-4">
                            <h5 className="fw-bold mb-4">Produtos Mais Vendidos</h5>
                            <TopProductsChart />
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    {isHQ && <button className="btn btn-outline-primary border-2 fw-bold">Ver Ranking Filiais</button>}
                    <button className="btn btn-premium shadow-sm">Gerar Relatório</button>
                </div>
            </div>

            <div className="row g-4 mb-5">
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-md-3">
                        <div className="premium-card p-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div className={`p-2 rounded-3 bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                                    <stat.icon className={stat.color} size={24} />
                                </div>
                                {isHQ && idx === 0 && <span className="badge bg-success bg-opacity-10 text-success small">+12%</span>}
                            </div>
                            <h4 className="fw-bold mb-1">{stat.value}</h4>
                            <p className="text-muted small mb-0">{stat.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row g-4">
                {isHQ ? (
                    <div className="col-md-12">
                        <div className="premium-card p-4">
                            <h5 className="fw-bold mb-4">Desempenho por Filial</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Filial</th>
                                            <th>Gerente</th>
                                            <th>Vendas (Mês)</th>
                                            <th>Serviços</th>
                                            <th>Receita</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'Sede - Luanda Sul', manager: 'Afonso Manuel', sales: 156, services: 98, revenue: 'Kz 8.4M', status: 'Excelente' },
                                            { name: 'Filial Kilamba', manager: 'Carlos Pande', sales: 94, services: 45, revenue: 'Kz 3.2M', status: 'Bom' },
                                            { name: 'Filial Talatona', manager: 'Maria Santos', sales: 120, services: 70, revenue: 'Kz 5.1M', status: 'Estável' },
                                        ].map((f, i) => (
                                            <tr key={i}>
                                                <td className="fw-bold text-primary">{f.name}</td>
                                                <td className="small">{f.manager}</td>
                                                <td>{f.sales}</td>
                                                <td>{f.services}</td>
                                                <td className="fw-bold">{f.revenue}</td>
                                                <td><span className={`badge rounded-pill ${f.status === 'Excelente' ? 'bg-success' : 'bg-primary'}`}>{f.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="col-md-8">
                            <div className="premium-card p-4 h-100">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold m-0">Vendas Recentes</h5>
                                    <button className="btn btn-sm btn-light">Ver Tudo</button>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>ID</th>
                                                <th>Cliente</th>
                                                <th>Produtos/Serviços</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>#1001</td>
                                                <td>Cliente Final</td>
                                                <td>Impressão (5p), Coca-Cola</td>
                                                <td className="fw-semibold text-primary">Kz 2.500,00</td>
                                                <td><span className="badge bg-success bg-opacity-10 text-success">Concluído</span></td>
                                            </tr>
                                            <tr>
                                                <td>#1002</td>
                                                <td>Afonso Manuel</td>
                                                <td>Manutenção PC</td>
                                                <td className="fw-semibold text-primary">Kz 15.000,00</td>
                                                <td><span className="badge bg-warning bg-opacity-10 text-warning">Pendente</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="premium-card p-4 h-100">
                                <h5 className="fw-bold mb-4">Alertas de Stock</h5>
                                <div className="d-flex align-items-center p-3 bg-warning bg-opacity-10 rounded-4 mb-3">
                                    <AlertTriangle className="text-warning me-3" size={24} />
                                    <div>
                                        <p className="mb-0 small fw-bold">Caderno A4 80 Pag</p>
                                        <p className="mb-0 text-muted small">5 unidades restantes</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center p-3 bg-danger bg-opacity-10 rounded-4">
                                    <AlertTriangle className="text-danger me-3" size={24} />
                                    <div>
                                        <p className="mb-0 small fw-bold">Arroz 1kg</p>
                                        <p className="mb-0 text-muted small">Esgotado</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Layout>
    )
}

export default Dashboard
