import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Plus } from 'lucide-react'
import { fetchServices, createService, updateService, deleteService } from '../services/servicesService'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'

const Services = () => {
    const [items, setItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', base_price: 0 })
    const { showSuccess, showError, showLoading, dismiss } = useToast()

    const load = async () => {
        try {
            setItems(await fetchServices())
        } catch (e) {
            console.error(e)
            showError('Erro ao carregar serviços')
        }
    }

    useEffect(() => { load() }, [])

    const openAdd = () => { setEditing(null); setForm({ name: '', base_price: 0 }); setShowModal(true) }
    const openEdit = (s) => { setEditing(s); setForm({ name: s.name, base_price: s.base_price || 0 }); setShowModal(true) }

    const handleSave = async () => {
        if (!form.name) {
            showError('Nome é obrigatório')
            return
        }
        const toastId = showLoading(editing ? 'Atualizando serviço...' : 'Criando serviço...')
        try {
            if (editing) await updateService(editing.id, form)
            else await createService(form)
            dismiss(toastId)
            showSuccess(editing ? 'Serviço atualizado!' : 'Serviço criado!')
            setShowModal(false)
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError('Erro ao guardar serviço')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Eliminar serviço?')) return
        const toastId = showLoading('Eliminando serviço...')
        try {
            await deleteService(id)
            dismiss(toastId)
            showSuccess('Serviço eliminado!')
            load()
        } catch (err) {
            dismiss(toastId)
            showError('Erro ao eliminar serviço')
        }
    }

    const handleAdd = openAdd

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Gestão de Serviços</h2>
                    <p className="text-muted">Configure preços e automação de serviços</p>
                </div>
                <button className="btn btn-premium shadow-sm d-flex align-items-center" onClick={handleAdd}>
                    <Plus size={18} className="me-2" /> Adicionar Serviço
                </button>
            </div>

            <div className="premium-card p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nome do Serviço</th>
                                <th>Preço Base</th>
                                <th className="text-end">Opções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(service => (
                                <tr key={service.id}>
                                    <td><span className="fw-bold">{service.name}</span></td>
                                    <td><span className="fw-bold text-dark">Kz {service.base_price}</span></td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(service)}>Editar</button>
                                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(service.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} title={editing ? 'Editar Serviço' : 'Novo Serviço'} onClose={() => setShowModal(false)} onSave={handleSave}>
                <div className="mb-3">
                    <label className="form-label small">Nome</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="mb-3">
                    <label className="form-label small">Preço Base</label>
                    <input type="number" className="form-control" value={form.base_price} onChange={e => setForm({ ...form, base_price: Number(e.target.value) })} />
                </div>
            </Modal>
        </Layout>
    )
}

export default Services