import { GetMedications200Item } from "../api/model/getMedications200Item"
import { GetMedications200ItemRemindersItem } from "../api/model/getMedications200ItemRemindersItem"

export type ReminderStatus = "pending" | "taken" | "skipped"

export type Medication = GetMedications200Item & {
  description: string
  dosage: string
  instructions: string
  status?: ReminderStatus
  time?: string
  timeUntil?: string
}

export type ApiMedication = Omit<GetMedications200Item, 'duration'> & {
  duration: number | null
}

export type MedicationReminder = GetMedications200ItemRemindersItem & {
  time: string
} 