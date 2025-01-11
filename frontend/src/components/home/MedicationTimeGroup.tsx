import { Medication } from '@/types/medication'
import { MedicationCard } from './MedicationCard'
import { Card } from '../ui/card'

interface MedicationTimeGroupProps {
  time: string
  medications: Medication[]
  onMedicationClick: (medication: Medication) => void
}

export function MedicationTimeGroup({ time, medications, onMedicationClick }: MedicationTimeGroupProps) {
  return (
    <div className="relative pl-4">
      {/* Indicador de tempo */}
      <div className="absolute left-0 top-[1.125rem] w-2 h-2 rounded-full bg-primary" />
      <div className="absolute left-[3px] top-[1.375rem] bottom-0 w-0.5 bg-border" />

      {/* Horário */}
      <div className="text-base font-medium mt-4 mb-2 pl-2">{time}</div>

      {/* Lista de medicamentos */}
      <Card className="overflow-hidden divide-y divide-border">
        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onClick={onMedicationClick}
          />
        ))}
      </Card>
    </div>
  )
} 