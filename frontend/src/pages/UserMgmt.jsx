import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Users, UserPlus, Shield, Mail, Building } from 'lucide-react'
import { fetchUsers, createUser, updateUser, deleteUser } from '../services/usersService'
import { useToast } from '../context/ToastContext'

const UserMgmt = () => {
    const [users, setUsers] = useState([])
    const { showSuccess, showError, showLoading, dismiss } = useToast()

    const load = async () => {
        try {
            const data = await fetchUsers()
            setUsers(data)
        } catch (err) {
            console.error(err)
            showError('Erro ao carregar utilizadores')
        }
    }

    useEffect(() => { load() }, [])

    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'BRANCH_USER', branch_id: 1 })

    const handleAdd = () => { setEditing(null); setForm({ name: '', email: '', password: '', role: 'BRANCH_USER', branch_id: 1 }); setShowModal(true) }

    const handleDelete = async (id) => {
        if (!confirm('Eliminar utilizador?')) return
        const toastId = showLoading('Eliminando utilizador...')
        try {
            await deleteUser(id)
            dismiss(toastId)
            showSuccess('Utilizador eliminado com sucesso!')
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError('Erro ao eliminar utilizador')
        }
    }

    const openEdit = (u) => { setEditing(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, branch_id: u.branch_id || 1 }); setShowModal(true) }

    const handleSave = async () => {
        if (!form.name || !form.email) {
            showError('Nome e email são obrigatórios')
            return
        }
        const toastId = showLoading(editing ? 'Atualizando utilizador...' : 'Criando utilizador...')
        try {
            if (editing) await updateUser(editing.id, form)
            else await createUser(form)
            dismiss(toastId)
            showSuccess(editing ? 'Utilizador atualizado com sucesso!' : 'Utilizador criado com sucesso!')
            setShowModal(false)
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError(err.message || 'Erro ao guardar utilizador')
        }
    }

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Gestão de Utilizadores</h2>
                    <p className="text-muted">Controle acessos e permissões por filial</p>
                </div>
                <button className="btn btn-premium shadow-sm d-flex align-items-center" onClick={handleAdd}>
                    <UserPlus size={18} className="me-2" /> Novo Utilizador
                </button>
            </div>

            <div className="premium-card p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Nome</th>
                                <th>Contacto</th>
                                <th>Papel / Permissão</th>
                                <th>Filial Designada</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-circle me-3">
                                                <Shield size={18} />
                                            </div>
                                            <span className="fw-bold">{user.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="small d-flex align-items-center text-muted">
                                            <Mail size={12} className="me-1" /> {user.email}
                                        </div>
                                    </td>
                                    <td><span className="badge bg-secondary">{user.role}</span></td>
                                    <td>
                                        <div className="small d-flex align-items-center">
                                            <Building size={12} className="me-1 text-muted" /> {user.branch_id || ''}
                                        </div>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(user)}>Editar</button>
                                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(user.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal show={showModal} title={editing ? 'Editar Utilizador' : 'Novo Utilizador'} onClose={() => setShowModal(false)} onSave={handleSave}>
                <div className="mb-2">
                    <label className="form-label small">Nome</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="mb-2">
                    <label className="form-label small">Email</label>
                    <input className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="mb-2">
                    <label className="form-label small">Password</label>
                    <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                </div>
                <div className="row">
                    <div className="col-6 mb-2">
                        <label className="form-label small">Role</label>
                        <select className="form-select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                            <option value="HQ_ADMIN">HQ_ADMIN</option>
                            <option value="BRANCH_ADMIN">BRANCH_ADMIN</option>
                            <option value="BRANCH_USER">BRANCH_USER</option>
                        </select>
                    </div>
                    <div className="col-6 mb-2">
                        <label className="form-label small">Branch ID</label>
                        <input className="form-control" type="number" value={form.branch_id} onChange={e => setForm({ ...form, branch_id: Number(e.target.value) })} />
                    </div>
                </div>
            </Modal>
        </Layout>
    )
}

export default UserMgmt