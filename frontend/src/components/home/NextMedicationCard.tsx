import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Medication } from '@/types/medication'

interface NextMedicationCardProps {
  medication: Medication
  onTakeMedication: (id: string) => void
}

export function NextMedicationCard({ medication, onTakeMedication }: NextMedicationCardProps) {
  const canTakeMedication = () => {
    const utcDate = new Date(medication.reminders[0].scheduledFor)
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
    return localDate <= new Date()
  }

  return (
    <div className="bg-primary p-4 rounded-2xl space-y-4 text-primary-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-medium">Próximo Medicamento</h3>
            <p className="text-sm text-primary-foreground/80">em {medication.timeUntil}</p>
          </div>
        </div>
        <span className="text-2xl font-bold">{medication.time}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">{medication.name}</span>
          <span className="text-sm bg-primary-foreground/10 px-2 py-0.5 rounded-lg">
            {medication.dosage}
          </span>
        </div>
        <Button 
          variant="secondary"
          className="rounded-xl"
          onClick={() => onTakeMedication(medication.id)}
          disabled={!canTakeMedication()}
        >
          Tomar agora
        </Button>
      </div>
    </div>
  )
} 