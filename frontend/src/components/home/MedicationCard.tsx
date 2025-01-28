import { Medication } from '@/types/medication'
import { cn } from '@/lib/utils'
import { Check, ChevronRight, Pill, Infinity } from 'lucide-react'

interface MedicationCardProps {
  medication: Medication
  onClick: (medication: Medication) => void
  onTake?: (medicationId: string) => void
  showTakeButton?: boolean
  isLate?: boolean
  showStock?: boolean // Nova prop para controlar exibição do estoque
  variant?: 'home' | 'list' // Nova prop para controlar o estilo
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
    <button
      onClick={() => onClick(medication)}
      className="w-full bg-background hover:bg-muted/50 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={cn(
            "shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
            isLate 
              ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400" 
              : "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
          )}>
            {medication.duration === null ? (
              <Infinity className="w-6 h-6" />
            ) : (
              <Pill className="w-6 h-6" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className='flex flex-col items-start'>
                <h3 className="font-medium text-foreground leading-tight truncate">
                  {medication.name}
                </h3>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {variant === 'list' 
                    ? `A cada ${medication.interval}h • ${medication.dosageQuantity} ${medication.unit}`
                    : medication.timeUntil 
                      ? isLate
                        ? `Atrasado ${medication.timeUntil}`
                        : `Em ${medication.timeUntil}`
                      : `${medication.dosageQuantity} ${medication.unit}`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {showTakeButton && onTake && variant === 'home' && (
                  <button
                    onClick={handleTake}
                    disabled={!canTakeMedication()}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shrink-0",
                      !canTakeMedication() && "opacity-50 cursor-not-allowed",
                      isLate 
                        ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/70" 
                        : "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-950/70"
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
                    getStockStatus().color === 'violet' && "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                  )}>
                    {medication.remainingQuantity}/{medication.totalQuantity}
                  </div>
                )}

                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}