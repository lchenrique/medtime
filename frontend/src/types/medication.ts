export interface Medication {
  id: string
  name: string
  description: string
  startDate: string
  duration: number
  interval: number
  totalQuantity: number
  remainingQuantity: number
  unit: string
  dosageQuantity: number
  dosage: string
  time: string
  instructions: string
  status: 'pending' | 'taken' | 'late'
  timeUntil: string
  reminders: {
    id: string
    scheduledFor: string
    taken: boolean
    takenAt: string | null
    skipped: boolean
    skippedReason: string | null
    time: string
  }[]
} 