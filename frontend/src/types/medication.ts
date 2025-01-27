import type { GetMedications200Item } from '@/api/model'

export interface Reminder {
  id: string // Pode ser um ID real ou virtual (virtual_medicationId_timestamp)
  scheduledFor: string
  taken: boolean
  takenAt: string | null
  skipped: boolean
  skippedReason: string | null
  createdAt: string
  updatedAt: string
  time: string
  isVirtual?: boolean // Indica se é um lembrete virtual
}

export type ReminderStatus = 'pending' | 'taken' | 'skipped' | 'late'

export type ApiMedication = GetMedications200Item
export type ApiReminder = ApiMedication['reminders'][number]

export type Medication = ApiMedication & {
  description?: string | null
  dosage?: string | null
  instructions?: string | null
  status?: ReminderStatus
  time?: string
  timeUntil?: string
  isRecurring?: boolean
} 