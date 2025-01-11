import { z } from 'zod'
import { IntervalPresetEnum } from './medication'

// Schema base do lembrete
export const reminderSchema = z.object({
  id: z.string(),
  medicationId: z.string(),
  time: z.string().datetime(),
  frequency: IntervalPresetEnum,
  daysOfWeek: z.array(z.number().min(1).max(7)),
  active: z.boolean(),
  lastTriggered: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

// Schema para criação
export const createReminderSchema = reminderSchema.omit({
  id: true,
  medicationId: true,
  lastTriggered: true,
  createdAt: true,
  updatedAt: true
})

// Schema para atualização
export const updateReminderSchema = createReminderSchema.partial()

// Tipos
export type Reminder = z.infer<typeof reminderSchema>
export type CreateReminderInput = z.infer<typeof createReminderSchema>
export type UpdateReminderInput = z.infer<typeof updateReminderSchema> 