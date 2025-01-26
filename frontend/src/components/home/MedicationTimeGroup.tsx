import { GetMedications200Item } from '@/api/model'
import { ReminderStatus } from '@/pages/Home'
import { MedicationCard } from './MedicationCard'
import { Medication } from '@/types/medication'
import { cn } from '@/lib/utils'

interface MedicationTimeGroupProps {
  time: string
  medications: (GetMedications200Item & {
    status?: ReminderStatus
    timeUntil?: string
    instructions?: string
  })[]
  onMedicationClick: (medication: GetMedications200Item & { status?: ReminderStatus, timeUntil?: string }) => void
}

export function MedicationTimeGroup({ time, medications, onMedicationClick }: MedicationTimeGroupProps) {
  return (
    <div className="relative">
      {/* Horário */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 py-2 px-4 border-b">
        <span className="text-base font-medium text-gray-900">{time}</span>
      </div>

      {/* Lista de medicamentos */}
      <div className="divide-y divide-gray-100">
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