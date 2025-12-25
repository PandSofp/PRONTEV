import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Plus } from 'lucide-react'
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../services/categoriesService'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema } from '../utils/validationSchemas'

const Categories = () => {
    const [items, setItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const { showSuccess, showError, showLoading, dismiss } = useToast()

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: '', description: '' }
    })

    const load = async () => {
        try {
            setItems(await fetchCategories())
        } catch (e) {
            console.error(e)
            showError('Erro ao carregar categorias')
        }
    }

    useEffect(() => { load() }, [])

    const openAdd = () => {
        setEditing(null)
        reset({ name: '', description: '' })
        setShowModal(true)
    }

    const openEdit = (item) => {
        setEditing(item)
        reset({ name: item.name, description: item.description || '' })
        setShowModal(true)
    }

    const onSubmit = async (data) => {
        const toastId = showLoading(editing ? 'Atualizando categoria...' : 'Criando categoria...')
        try {
            if (editing) await updateCategory(editing.id, data)
            else await createCategory(data)
            dismiss(toastId)
            showSuccess(editing ? 'Categoria atualizada!' : 'Categoria criada!')
            setShowModal(false)
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError('Erro ao guardar categoria')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Eliminar categoria?')) return
        const toastId = showLoading('Eliminando categoria...')
        try {
            await deleteCategory(id)
            dismiss(toastId)
            showSuccess('Categoria eliminada!')
            load()
        } catch (err) {
            dismiss(toastId)
            showError('Erro ao eliminar categoria')
        }
    }

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Categorias</h2>
                    <p className="text-muted">Gestão de categorias de produtos</p>
                </div>
                <button className="btn btn-premium shadow-sm d-flex align-items-center" onClick={openAdd}>
                    <Plus size={18} className="me-2" /> Nova Categoria
                </button>
            </div>

            <div className="premium-card p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light"><tr><th>Nome</th><th>Descrição</th><th className="text-end">Ações</th></tr></thead>
                        <tbody>
                            {items.map(c => (
                                <tr key={c.id}>
                                    <td className="fw-bold">{c.name}</td>
                                    <td className="text-muted small">{c.description}</td>
                                    <td className="text-end">
                                        <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(c)}>Editar</button>
                                        <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(c.id)}>Eliminar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal show={showModal} title={editing ? 'Editar Categoria' : 'Nova Categoria'} onClose={() => setShowModal(false)} onSave={handleSubmit(onSubmit)}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label className="form-label small">Nome</label>
                        <input
                            {...register('name')}
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label small">Descrição</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        />
                        {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                    </div>
                </form>
            </Modal>
        </Layout>
    )
}

export default Categories
