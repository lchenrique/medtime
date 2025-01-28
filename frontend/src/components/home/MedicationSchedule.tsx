import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { Medication } from '@/types/medication'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MedicationScheduleProps {
  medication: Medication
}

export function MedicationSchedule({ medication }: MedicationScheduleProps) {
  const queryClient = useQueryClient()
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()

  const handleMarkAsTaken = (reminderId: string, scheduledFor: string) => {
    const previousData = queryClient.getQueryData([`/medications/${medication.id}`])

    queryClient.setQueryData([`/medications/${medication.id}`], (old: any) => ({
      ...old,
      reminders: old.reminders.map((reminder: any) => 
        reminder.id === reminderId 
          ? { ...reminder, taken: true }
          : reminder
      )
    }))

    markAsTaken({ 
      data: { 
        reminderId,
        scheduledFor,
        taken: true 
      }
    }, {
      onError: () => {
        queryClient.setQueryData([`/medications/${medication.id}`], previousData)
        toast.error('Não foi possível marcar como tomado', {
          position: 'bottom-left',
          className: 'bg-white dark:bg-gray-800'
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/medications'] })
      }
    })
  }

  // Filtra apenas os lembretes futuros e não tomados/pulados
  const futureReminders = medication.reminders
    .filter(reminder => {
      const scheduledFor = new Date(reminder.scheduledFor)
      return !reminder.taken && !reminder.skipped && scheduledFor >= new Date()
    })
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())

  return (
    <div className="space-y-4">
      {futureReminders.map((reminder) => (
        <div 
          key={reminder.id}
          className={cn(
            "p-4 rounded-lg border",
            reminder.taken && "bg-muted"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {new Date(reminder.scheduledFor).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'America/Sao_Paulo'
                })}
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarkAsTaken(reminder.id, reminder.scheduledFor)}
              disabled={reminder.taken}
              className={cn(
                "gap-2",
                reminder.taken && "opacity-50 cursor-not-allowed"
              )}
            >
              <Check className="w-4 h-4" />
              {reminder.taken ? 'Tomado' : 'Marcar como tomado'}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
} 