import { GetMedications200Item, GetMedications200ItemRemindersItem } from '@/api/generated/medications/medications'

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

export type Medication = GetMedications200Item & {
  description: string
  dosage: string
  instructions: string
  status?: ReminderStatus
  time?: string
  timeUntil?: string
  reminders: GetMedications200ItemRemindersItem[]
} 