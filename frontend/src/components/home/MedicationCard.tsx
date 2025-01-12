import { Pill, ChevronRight } from 'lucide-react'
import { Medication } from '@/types/medication'

interface MedicationCardProps {
  medication: Medication
  onClick: (medication: Medication) => void
}

export function MedicationCard({ medication, onClick }: MedicationCardProps) {
  return (
    <button
      onClick={() => onClick(medication)}
      className="w-full text-left hover:bg-violet-50/50 transition-colors"
    >
      <div className="flex items-center gap-3 py-4 px-4">
        <div className="p-2 bg-violet-100 rounded-xl shrink-0">
          <Pill className="w-4 h-4 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-violet-900 truncate">{medication.name}</h3>
            {medication.timeUntil?.includes('atraso') && (
              <span className="text-xs font-medium text-red-500 truncate shrink-0">
                Em atraso
              </span>
            )}
          </div>
          <div className="text-sm text-violet-300 truncate mt-0.5">
            {medication.dosageQuantity} {medication.unit} - {medication.instructions}
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-violet-300 shrink-0" />
      </div>
    </button>
  )
} 