import { z } from 'zod'

// Schema base do usuário
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  fcmToken: z.string().nullable(),
  tauriEnabled: z.boolean(),
  capacitorEnabled: z.boolean(),
  whatsappEnabled: z.boolean(),
  whatsappNumber: z.string().nullable(),
  telegramEnabled: z.boolean(),
  telegramChatId: z.string().nullable(),
  // Campos de saúde
  isDiabetic: z.boolean(),
  hasHeartCondition: z.boolean(),
  hasHypertension: z.boolean(),
  allergies: z.string().nullable(),
  observations: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Schema para registro
export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

// Schema para login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

// Schema de resposta do usuário
export const userResponseSchema = userSchema

// Schema de atualização do perfil
export const updateProfileSchema = z.object({
  name: z.string().optional(),
  fcmToken: z.string().nullable().optional(),
  tauriEnabled: z.boolean().optional().transform(val => val === true),
  capacitorEnabled: z.boolean().optional().transform(val => val === true),
  whatsappEnabled: z.boolean().optional(),
  whatsappNumber: z.string().nullable().optional(),
  telegramEnabled: z.boolean().optional(),
  telegramChatId: z.string().nullable().optional(),
  // Campos de saúde
  isDiabetic: z.boolean().optional(),
  hasHeartCondition: z.boolean().optional(),
  hasHypertension: z.boolean().optional(),
  allergies: z.string().nullable().optional(),
  observations: z.string().nullable().optional(),
})

// Schema de resposta de autenticação
export const authResponseSchema = z.object({
  user: userSchema,
  token: z.string()
})

// Schema de erro
export const errorResponseSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  code: z.string(),
  message: z.string()
})

// Tipos gerados dos schemas
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type User = z.infer<typeof userSchema>
export type UserResponse = z.infer<typeof userResponseSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>
export type ErrorResponse = z.infer<typeof errorResponseSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
