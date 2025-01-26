import { z } from 'zod'

// Enums para intervalos predefinidos com suas doses diárias
export const IntervalPresetEnum = z.enum(['6/6', '8/8', '12/12', '24/24'])

// Enum para unidades de medida
export const UnitEnum = z.string()

// Mapa de intervalos para doses diárias
const intervalToDoses = {
  '6/6': 4,   // 24h ÷ 6h = 4 doses
  '8/8': 3,   // 24h ÷ 8h = 3 doses
  '12/12': 2, // 24h ÷ 12h = 2 doses
  '24/24': 1  // 24h ÷ 24h = 1 dose
} as const

// Schema para criação de medicação com interface simplificada
export const createMedicationSimpleSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  intervalPreset: IntervalPresetEnum,
  durationInDays: z.number().int().positive(),
  startTime: z.string().datetime(), // Primeira dose
  // Novos campos para controle de estoque
  totalQuantity: z.number().positive('Quantidade total deve ser maior que zero'),
  unit: UnitEnum,
  dosageQuantity: z.number().positive('Quantidade por dose deve ser maior que zero')
})

// Função para converter o intervalo preset para horas
export function presetToHours(preset: z.infer<typeof IntervalPresetEnum>): number {
  const [interval] = preset.split('/').map(Number)
  return interval
}

// Schema para criação de medicação (interno)
export const medicationSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().nullable(),
  startDate: z.string().datetime(),
  duration: z.number().int().positive(),
  interval: z.number().positive(),
  // Novos campos para controle de estoque
  totalQuantity: z.number().positive(),
  remainingQuantity: z.number().min(0),
  unit: UnitEnum,
  dosageQuantity: z.number().positive(),
  userId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  reminders: z.array(z.object({
    id: z.string(),
    scheduledFor: z.string().datetime(),
    taken: z.boolean(),
    takenAt: z.string().datetime().nullable(),
    skipped: z.boolean(),
    skippedReason: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime()
  })).optional()
})

// Schema para criação
export const createMedicationSchema = medicationSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  reminders: true
})

// Schema para atualização
export const updateMedicationSchema = createMedicationSchema.partial()

// Tipos
export type Medication = z.infer<typeof medicationSchema>
export type CreateMedicationInput = z.infer<typeof createMedicationSchema>
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema> 