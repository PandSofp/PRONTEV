import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

/**
 * Exemplo de formulário validado com react-hook-form + zod
 * Este componente pode ser usado como referência para implementar validações
 */

const ExampleValidatedForm = ({ schema, onSubmit, defaultValues }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues
    })

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {/* Exemplo de input */}
            <div className="mb-3">
                <label className="form-label">Nome</label>
                <input
                    {...register('name')}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                />
                {errors.name && (
                    <div className="invalid-feedback">
                        {errors.name.message}
                    </div>
                )}
            </div>

            <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
        </form>
    )
}

export default ExampleValidatedForm

/**
 * Uso:
 * 
 * import { productSchema } from '../utils/validationSchemas'
 * import ExampleValidatedForm from '../components/ExampleValidatedForm'
 * 
 * const MyPage = () => {
 *   const handleSubmit = async (data) => {
 *     // data já está validado!
 *     await createProduct(data)
 *   }
 * 
 *   return (
 *     <ExampleValidatedForm 
 *       schema={productSchema}
 *       onSubmit={handleSubmit}
 *       defaultValues={{ name: '', price: 0 }}
 *     />
 *   )
 * }
 */
