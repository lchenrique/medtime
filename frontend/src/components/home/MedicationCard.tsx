import { Medication } from '@/types/medication'
import { cn } from '@/lib/utils'
import { Check, ChevronRight, Pill, Infinity } from 'lucide-react'
import { IonItem, IonLabel, IonButton, IonIcon } from '@ionic/react'

interface MedicationCardProps {
  medication: Medication
  onClick: (medication: Medication) => void
  onTake?: (medicationId: string) => void
  showTakeButton?: boolean
  isLate?: boolean
  showStock?: boolean
  variant?: 'home' | 'list'
}

export function MedicationCard({
  medication,
  onClick,
  onTake,
  showTakeButton = false,
  isLate = false,
  showStock = false,
  variant = 'home'
}: MedicationCardProps) {
  const handleTake = (e: React.MouseEvent) => {
    e.stopPropagation()
    onTake?.(medication.id)
  }

  const canTakeMedication = () => {
    if (!medication.reminders[0]) return false
    const utcDate = new Date(medication.reminders[0].scheduledFor)
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
    return localDate <= new Date()
  }

  const getStockStatus = () => {
    if (medication.remainingQuantity <= medication.dosageQuantity) return { color: 'red', label: 'Crítico' }
    if (medication.remainingQuantity <= medication.dosageQuantity * 3) return { color: 'orange', label: 'Baixo' }
    return { color: 'violet', label: 'Normal' }
  }

  return (
    <div
      onClick={() => onClick(medication)}
      className="pl-3 py-2"
    >
      <div className="flex items-center bg-card hover:bg-primary/5 rounded-lg gap-3 w-full justify-between border p-3">

        <div className='flex items-center gap-3'>
          <div slot="start" className={cn(
            "shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            isLate
              ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400"
              : "bg-primary/10 dark:bg-primary/5 text-primary"
          )}>
            {medication.duration === null ? (
              <Infinity className="w-6 h-6" />
            ) : (
              <Pill className="w-6 h-6" />
            )}
          </div>
          <IonLabel>
            <h2 className="font-medium text-foreground">
              {medication.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {variant === 'list'
                ? `A cada ${medication.interval}h • ${medication.dosageQuantity} ${medication.unit}`
                : medication.timeUntil
                  ? isLate
                    ? `Atrasado ${medication.timeUntil}`
                    : `Em ${medication.timeUntil}`
                  : `${medication.dosageQuantity} ${medication.unit}`}
            </p>
          </IonLabel>
        </div>



        <div slot="end" className="flex items-center gap-2">
          {showTakeButton && onTake && variant === 'home' && (
            <button
              onClick={handleTake}
              disabled={!canTakeMedication()}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shrink-0",
                !canTakeMedication() && "opacity-50 cursor-not-allowed",
                isLate
                  ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/70"
                  : "bg-gray-100 dark:bg-gray-950/50 text-primary  dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-950/70"
              )}
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Tomar</span>
            </button>
          )}

          {showStock && variant === 'list' && (
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium",
              getStockStatus().color === 'red' && "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400",
              getStockStatus().color === 'orange' && "bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400",
              getStockStatus().color === 'violet' && "bg-gray-100 dark:bg-gray-950/50 text-primary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-950/70"
            )}>
              {medication.remainingQuantity}/{medication.totalQuantity}
            </div>
          )}

          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

    </div>
  )
}
