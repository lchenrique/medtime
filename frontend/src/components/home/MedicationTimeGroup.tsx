import { GetMedications200Item } from '@/api/model'
import { ReminderStatus } from '@/pages/Home'
import { MedicationCard } from './MedicationCard'
import { Medication } from '@/types/medication'

interface MedicationTimeGroupProps {
  time: string
  medications: (GetMedications200Item & {
    status?: ReminderStatus
    timeUntil?: string
    instructions?: string
  })[]
  onMedicationClick: (medication: GetMedications200Item & { status?: ReminderStatus, timeUntil?: string, isRecurring?: boolean }) => void
}

export function MedicationTimeGroup({ time, medications, onMedicationClick }: MedicationTimeGroupProps) {
  return (
    <div className="space-y-3">
      {/* Horário */}
      <div className="px-4">
        <span className="text-lg font-medium text-gray-900">{time}</span>
      </div>

      {/* Lista de medicamentos */}
      <div className="space-y-2">
        {medications.map(medication => {
          // Converte para o formato esperado pelo MedicationCard
          const medicationForCard: Medication = {
            id: medication.id,
            name: medication.name,
            description: medication.description || '',
            startDate: medication.startDate,
            duration: medication.duration,
            interval: medication.interval,
            dosage: `${medication.dosageQuantity} ${medication.unit}`,
            time: time,
            instructions: medication.description || '',
            status: medication.status || 'pending',
            timeUntil: medication.timeUntil || '',
            isRecurring: medication.isRecurring,
            reminders: medication.reminders.map(r => ({
              ...r,
              time: new Date(r.scheduledFor).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'UTC'
              })
            })),
            unit: medication.unit,
            totalQuantity: medication.totalQuantity,
            remainingQuantity: medication.remainingQuantity,
            dosageQuantity: medication.dosageQuantity,
            userId: '',
            createdAt: '',
            updatedAt: ''
          }

          return (
            <MedicationCard
              key={medication.id}
              medication={medicationForCard}
              onClick={() => onMedicationClick(medication)}
              isLate={medication.status === 'late'}
              showTakeButton
              variant="home"
            />
          )
        })}
      </div>
    </div>
  )
}