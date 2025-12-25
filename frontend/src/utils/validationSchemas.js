import { z } from 'zod'

// Product validation schema
export const productSchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    price: z.number()
        .positive('Preço deve ser maior que zero')
        .or(z.string().transform(Number)),
    category_id: z.string().or(z.number()).optional(),
    stock: z.number()
        .int('Stock deve ser um número inteiro')
        .min(0, 'Stock não pode ser negativo')
        .or(z.string().transform(Number))
        .optional(),
    description: z.string().max(500, 'Descrição muito longa').optional(),
})

// Category validation schema
export const categorySchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(50, 'Nome muito longo'),
    description: z.string()
        .max(200, 'Descrição muito longa')
        .optional(),
})

// User validation schema
export const userSchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    email: z.string()
        .email('Email inválido'),
    password: z.string()
        .min(6, 'Password deve ter pelo menos 6 caracteres')
        .optional()
        .or(z.literal('')),
    role: z.enum(['HQ_ADMIN', 'BRANCH_ADMIN', 'BRANCH_USER'], {
        errorMap: () => ({ message: 'Role inválido' })
    }),
    branch_id: z.number()
        .int('Branch ID inválido')
        .positive('Branch ID deve ser maior que zero')
        .or(z.string().transform(Number)),
})

// Branch validation schema
export const branchSchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    location: z.string()
        .min(3, 'Localização deve ter pelo menos 3 caracteres')
        .max(200, 'Localização muito longa')
        .optional(),
    is_hq: z.boolean().optional(),
})

// Service validation schema
export const serviceSchema = z.object({
    name: z.string()
        .min(3, 'Nome deve ter pelo menos 3 caracteres')
        .max(100, 'Nome muito longo'),
    base_price: z.number()
        .positive('Preço deve ser maior que zero')
        .or(z.string().transform(Number)),
    description: z.string()
        .max(500, 'Descrição muito longa')
        .optional(),
})
