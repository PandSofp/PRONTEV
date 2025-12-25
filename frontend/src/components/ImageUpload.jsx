import React, { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../context/ToastContext'

const ImageUpload = ({ currentImage, onImageChange, productId }) => {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(currentImage || null)
    const { showError, showSuccess, showLoading, dismiss } = useToast()

    const uploadImage = async (file) => {
        if (!file) return

        // Validações
        if (!file.type.startsWith('image/')) {
            showError('Por favor, selecione apenas imagens')
            return
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB
            showError('Imagem muito grande. Máximo 5MB')
            return
        }

        const toastId = showLoading('Fazendo upload da imagem...')
        setUploading(true)

        try {
            // Gerar nome único
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `products/${fileName}`

            // Upload para Supabase Storage
            const { data, error } = await supabase.storage
                .from('products')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error

            // Obter URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            onImageChange(publicUrl)
            dismiss(toastId)
            showSuccess('Imagem carregada com sucesso!')
        } catch (error) {
            console.error('Erro no upload:', error)
            dismiss(toastId)
            showError('Erro ao fazer upload da imagem')
        } finally {
            setUploading(false)
        }
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (file) {
            // Preview local imediato
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result)
            }
            reader.readAsDataURL(file)

            // Upload para Supabase
            uploadImage(file)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        onImageChange(null)
        showSuccess('Imagem removida')
    }

    return (
        <div className="mb-3">
            <label className="form-label small fw-bold">Imagem do Produto</label>

            {preview ? (
                <div className="position-relative" style={{ maxWidth: '300px' }}>
                    <img
                        src={preview}
                        alt="Preview"
                        className="img-fluid rounded-3 border"
                        style={{ maxHeight: '200px', objectFit: 'cover', width: '100%' }}
                    />
                    <button
                        type="button"
                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2 rounded-circle p-2"
                        onClick={handleRemove}
                        disabled={uploading}
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className="border-2 border-dashed rounded-3 p-4 text-center bg-light"
                    style={{ borderStyle: 'dashed', borderColor: '#dee2e6' }}
                >
                    <input
                        type="file"
                        id="image-upload"
                        className="d-none"
                        accept="image/*"
                        onChange={handleFileSelect}
                        disabled={uploading}
                    />
                    <label
                        htmlFor="image-upload"
                        className="d-flex flex-column align-items-center justify-content-center cp m-0"
                        style={{ minHeight: '150px' }}
                    >
                        <ImageIcon size={48} className="text-muted mb-3" />
                        <p className="fw-bold mb-1">
                            {uploading ? 'Fazendo upload...' : 'Clique para fazer upload'}
                        </p>
                        <p className="text-muted small mb-0">PNG, JPG até 5MB</p>
                    </label>
                </div>
            )}

            <small className="text-muted d-block mt-2">
                Recomendado: 800x800px para melhor qualidade
            </small>
        </div>
    )
}

export default ImageUpload
