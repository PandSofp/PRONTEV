import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { Plus, Image as ImageIcon } from 'lucide-react'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/productsService'
import Modal from '../components/Modal'
import { useToast } from '../context/ToastContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema } from '../utils/validationSchemas'
import ImageUpload from '../components/ImageUpload'

const Products = () => {
    const [items, setItems] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)
    const { showSuccess, showError, showLoading, dismiss } = useToast()

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: { name: '', price: 0 }
    })

    const load = async () => {
        try {
            setItems(await fetchProducts())
        } catch (e) {
            console.error(e)
            showError('Erro ao carregar produtos')
        }
    }

    useEffect(() => { load() }, [])

    const openAdd = () => {
        setEditing(null)
        setImageUrl(null)
        reset({ name: '', price: 0 })
        setShowModal(true)
    }

    const openEdit = (p) => {
        setEditing(p)
        setImageUrl(p.image_url || null)
        reset({ name: p.name, price: p.price || 0 })
        setShowModal(true)
    }

    const onSubmit = async (data) => {
        const toastId = showLoading(editing ? 'Atualizando produto...' : 'Criando produto...')
        try {
            // Adiciona image_url ao payload
            const productData = { ...data, image_url: imageUrl }

            if (editing) await updateProduct(editing.id, productData)
            else await createProduct(productData)

            dismiss(toastId)
            showSuccess(editing ? 'Produto atualizado!' : 'Produto criado!')
            setShowModal(false)
            setImageUrl(null)
            load()
        } catch (err) {
            dismiss(toastId)
            console.error(err)
            showError('Erro ao guardar produto')
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Eliminar produto?')) return
        const toastId = showLoading('Eliminando produto...')
        try {
            await deleteProduct(id)
            dismiss(toastId)
            showSuccess('Produto eliminado!')
            load()
        } catch (err) {
            dismiss(toastId)
            showError('Erro ao eliminar produto')
        }
    }

    return (
        <Layout>
            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-0">Produtos</h2>
                    <p className="text-muted">Gestão de produtos e stock</p>
                </div>
                <button className="btn btn-premium shadow-sm d-flex align-items-center" onClick={openAdd}>
                    <Plus size={18} className="me-2" /> Novo Produto
                </button>
            </div>

            <div className="premium-card p-4">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Produto</th>
                                <th>Preço</th>
                                <th className="text-end">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {c.image_url ? (
                                                <img
                                                    src={c.image_url}
                                                    alt={c.name}
                                                    style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                                    className="rounded-3 me-3 border"
                                                />
                                            ) : (
                                                <div
                                                    className="bg-light rounded-3 me-3 d-flex align-items-center justify-content-center border"
                                                    style={{ width: '50px', height: '50px', minWidth: '50px' }}
                                                >
                                                    <ImageIcon size={24} className="text-muted" />
                                                </div>
                                            )}
                                            <span className="fw-bold">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">Kz {c.price?.toLocaleString()}</td>
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

            <Modal show={showModal} title={editing ? 'Editar Produto' : 'Novo Produto'} onClose={() => setShowModal(false)} onSave={handleSubmit(onSubmit)}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ImageUpload
                        currentImage={imageUrl}
                        onImageChange={setImageUrl}
                    />

                    <div className="mb-3">
                        <label className="form-label small">Nome</label>
                        <input
                            {...register('name')}
                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        />
                        {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                    </div>
                    <div className="mb-3">
                        <label className="form-label small">Preço</label>
                        <input
                            type="number"
                            {...register('price', { valueAsNumber: true })}
                            className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                        />
                        {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
                    </div>
                </form>
            </Modal>
        </Layout>
    )
}

export default Products
