import { Medication } from '@/types/medication'
import { MedicationCard } from './MedicationCard'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MedicationTimeGroupProps {
  time: string
  medications: Medication[]
  onMedicationClick: (medication: Medication) => void
  isLateGroup?: boolean
}

export function MedicationTimeGroup({ time, medications, onMedicationClick, isLateGroup }: MedicationTimeGroupProps) {
  return (
    <div>
      {/* Cabeçalho do horário */}
      <div className={cn(
        "sticky top-0 flex items-center gap-2 py-2.5 px-4 z-10",
        isLateGroup ? "bg-red-50" : "bg-violet-50"
      )}>
        <Clock className={cn(
          "w-4 h-4 shrink-0",
          isLateGroup ? "text-red-500" : "text-violet-500"
        )} />
        <span className={cn(
          "text-sm font-medium",
          isLateGroup ? "text-red-700" : "text-violet-700"
        )}>{time}</span>
        <div className={cn(
          "w-px h-3.5 mx-2",
          isLateGroup ? "bg-red-200" : "bg-violet-200"
        )} />
        <span className={cn(
          "text-xs",
          isLateGroup ? "text-red-500" : "text-violet-500"
        )}>
          {medications.length} {medications.length === 1 ? 'medicamento' : 'medicamentos'}
        </span>
      </div>

      {/* Lista de medicamentos */}
      <div className="divide-y divide-violet-100">
        {medications.map((medication) => (
          <MedicationCard
            key={medication.id}
            medication={medication}
            onClick={onMedicationClick}
          />
        ))}
      </div>
    </div>
  )
} 