import { useGetMedicationsId } from '@/api/generated/medications/medications'
import { MedicationDetails } from './MedicationDetails'
import type { Medication } from '@/types/medication'

export function Medication({ id }: { id: string }) {
  const { data } = useGetMedicationsId(id)

  if (!data) return null

  const medicationWithReminders: Medication = {
    id: data.id,
    name: data.name,
    description: data.description || '',
    startDate: data.startDate,
    duration: data.duration,
    interval: data.interval,
    dosage: `${data.dosageQuantity} ${data.unit}`,
    time: new Date(data.startDate).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }),
    instructions: data.description || '',
    status: 'pending',
    timeUntil: '',
    reminders: data.reminders || [],
    unit: data.unit,
    totalQuantity: data.totalQuantity,
    remainingQuantity: data.remainingQuantity,
    dosageQuantity: data.dosageQuantity,
    userId: data.userId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  }

  return (
    <MedicationDetails 
      medication={medicationWithReminders}
    />
  )
} 