import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Building2, Plus, MapPin } from 'lucide-react'
import { fetchBranches, createBranch, updateBranch, deleteBranch } from '../services/branchesService'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'

const BranchMgmt = () => {
    const [branches, setBranches] = useState([])
    const { showSuccess, showError, showLoading, dismiss } = useToast()

    const load = async () => {
        try {
            const data = await fetchBranches()
            setBranches(data)
        } catch (err) {
            console.error(err)
            showError('Erro ao carregar filiais')
        }
    }

    useEffect(() => { load() }, [])

    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', location: '' })

    const handleAdd = () => { setEditing(null); setForm({ name: '', location: '' }); setShowModal(true) }

    const handleDelete = async (id) => {
        if (!confirm('Eliminar esta filial?')) return
        const toastId = showLoading('Eliminando filial...')
        try {
            await deleteBranch(id)
            dismiss(toastId)
            showSuccess('Filial eliminada!')
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError('Erro ao eliminar filial')
        }
    }

    const openEdit = (b) => { setEditing(b); setForm({ name: b.name, location: b.location || '' }); setShowModal(true) }

    const handleSave = async () => {
        if (!form.name) {
            showError('Nome é obrigatório')
            return
        }
        const toastId = showLoading(editing ? 'Atualizando filial...' : 'Criando filial...')
        try {
            if (editing) await updateBranch(editing.id, form)
            else await createBranch(form)
            dismiss(toastId)
            showSuccess(editing ? 'Filial atualizada!' : 'Filial criada!')
            setShowModal(false)
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError('Erro ao guardar filial')
        }
    }

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Gestão de Filiais</h2>
                    <p className="text-muted">Painel de controle central da empresa</p>
                </div>
                <button className="btn btn-premium shadow-sm d-flex align-items-center" onClick={handleAdd}>
                    <Plus size={18} className="me-2" /> Registar Nova Filial
                </button>
            </div>

            <div className="row g-4">
                {branches.map(branch => (
                    <div key={branch.id} className="col-md-4">
                        <div className="premium-card p-4 h-100 position-relative">
                            {branch.is_hq && (
                                <span className="badge bg-primary position-absolute top-0 end-0 m-3">SEDE</span>
                            )}
                            <div className="bg-light p-3 rounded-4 d-inline-block mb-4">
                                <Building2 size={32} className="text-primary" />
                            </div>
                            <h4 className="fw-bold mb-2">{branch.name}</h4>
                            <p className="text-muted small d-flex align-items-center mb-4">
                                <MapPin size={14} className="me-1" /> {branch.location}
                            </p>

                            <div className="d-flex gap-2">
                                <button className="btn btn-primary w-100 btn-sm py-2 rounded-3" onClick={() => openEdit(branch)}>Editar</button>
                                <button className="btn btn-outline-danger text-dark btn-sm rounded-3" onClick={() => handleDelete(branch.id)}>Eliminar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Modal show={showModal} title={editing ? 'Editar Filial' : 'Nova Filial'} onClose={() => setShowModal(false)} onSave={handleSave}>
                <div className="mb-3">
                    <label className="form-label small">Nome</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="mb-3">
                    <label className="form-label small">Localização</label>
                    <input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
            </Modal>
        </Layout>
    )
}

export default BranchMgmt
