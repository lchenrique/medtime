import { Pill } from 'lucide-react'
import { Medication } from '@/types/medication'
import { Card } from '../ui/card'

interface MedicationCardProps {
  medication: Medication
  onClick: (medication: Medication) => void
}

export function MedicationCard({ medication, onClick }: MedicationCardProps) {
  return (
    <button
      onClick={() => onClick(medication)}
      className="w-full flex items-center gap-4 py-3 px-4 hover:bg-accent/50 transition-colors text-left rounded-lg group"
    >
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Pill className="h-5 w-5 text-primary" />
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h4 className="font-medium truncate">{medication.name}</h4>
          <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
          <span className="text-sm text-muted-foreground shrink-0">
            {medication.dosage}
          </span>
        </div>
        {medication.instructions && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {medication.instructions}
          </p>
        )}
      </div>
    </button>
  )
} 