export interface Medication {
  id: string
  name: string
  description: string
  startDate: string
  duration: number
  interval: number
  dosage: string
  time: string
  instructions: string
  status?: 'pending' | 'taken'
  timeUntil?: string
  reminders: {
    id: string
    scheduledFor: string
    taken: boolean
    takenAt: string | null
    skipped: boolean
    skippedReason: string | null
    createdAt: string
    updatedAt: string
  }[]
  userId: string
  createdAt: string
  updatedAt: string
  totalQuantity: number
  remainingQuantity: number
  unit: string
  dosageQuantity: number
} 