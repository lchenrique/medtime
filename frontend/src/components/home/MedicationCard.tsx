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
      className="w-full bg-white hover:bg-gray-50 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className={cn(
            "shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
            isLate 
              ? "bg-gradient-to-br from-red-600 to-red-500" 
              : "bg-gradient-to-br from-violet-600 to-violet-500"
          )}>
            {medication.duration === null ? (
              <Infinity className="w-6 h-6 text-white" />
            ) : (
              <Pill className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className='flex flex-col items-start'>
                <h3 className="font-medium text-gray-900 leading-tight truncate">
                  {medication.name}
                </h3>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {variant === 'list' 
                    ? `A cada ${medication.interval}h • ${medication.dosageQuantity} ${medication.unit}`
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
                        ? "bg-red-100 text-red-700 hover:bg-red-200" 
                        : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                    )}
                  >
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Tomar</span>
                  </button>
                )}

                {showStock && variant === 'list' && (
                  <div className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium",
                    `bg-${getStockStatus().color}-100 text-${getStockStatus().color}-700`
                  )}>
                    {medication.remainingQuantity}/{medication.totalQuantity}
                  </div>
                )}

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {medication.instructions && (
              <p className="text-sm text-gray-600 truncate mt-1">
                {medication.instructions}
              </p>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}