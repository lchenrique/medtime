import { Clock, Calendar, AlertCircle, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn, calculateTimeUntil } from '@/lib/utils'
import { MedicationSchedule } from '@/components/MedicationSchedule'
import { useState, useEffect, useMemo } from 'react'
import { Medication } from '@/types/medication'
import { useGetMedicationsId, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { useQueryClient } from '@tanstack/react-query'

interface MedicationDetailsProps {
  medication: Medication // Usada apenas para inicialização
}

export function MedicationDetails({ medication }: MedicationDetailsProps) {
  const queryClient = useQueryClient()
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()
  const { data: medicationData } = useGetMedicationsId(medication.id)
  const [timeUntil, setTimeUntil] = useState('')

  // Converter os dados da API para o formato do frontend
  const med = useMemo(() => {
    if (!medicationData) return medication

    return {
      ...medicationData,
      description: medicationData.description || '',
      dosage: '1 comprimido',
      time: new Date(medicationData.startDate).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'UTC'
      }),
      instructions: medicationData.description || '',
      status: 'pending' as const,
      timeUntil: calculateTimeUntil(medicationData.startDate),
      reminders: medicationData.reminders?.map(reminder => ({
        ...reminder,
        time: new Date(reminder.scheduledFor).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'UTC'
        })
      })) || []
    } satisfies Medication
  }, [medicationData, medication])

  // Pega o próximo lembrete não tomado
  const nextReminder = med.reminders.find(r => !r.taken)

  // Atualiza o tempo até a próxima dose
  useEffect(() => {
    if (!nextReminder) return

    const updateTimeUntil = () => {
      setTimeUntil(calculateTimeUntil(nextReminder.scheduledFor))
    }

    updateTimeUntil()
    const interval = setInterval(updateTimeUntil, 60000)

    return () => clearInterval(interval)
  }, [nextReminder?.scheduledFor])

  // Verifica se pode tomar o medicamento (não é horário futuro)
  const canTakeMedication = (scheduledFor: string) => {
    const utcDate = new Date(scheduledFor)
    const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
    return localDate <= new Date()
  }

  // Separa os lembretes em passados e futuros
  const now = new Date()
  const pastReminders = med.reminders
    .filter(r => {
      const utcDate = new Date(r.scheduledFor)
      const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
      return localDate < now
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduledFor)
      const dateB = new Date(b.scheduledFor)
      return dateB.getTime() - dateA.getTime()
    }) // Mais recente primeiro

  const handleMarkAsTaken = (reminderId: string) => {
    markAsTaken({ 
      data: { 
        reminderId,
        taken: true 
      }
    }, {
      onSuccess: () => {
        // Invalida a query do medicamento e da lista
        queryClient.invalidateQueries({ queryKey: [`/medications/${medication.id}`] })
        queryClient.invalidateQueries({ queryKey: ['/medications'] })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Card Principal com Próxima Dose */}
      {nextReminder && (
        <div className="bg-white p-4 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">Próxima dose</h3>
              <p className="text-sm text-muted-foreground">{timeUntil}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">
                {(() => {
                  const utcDate = new Date(nextReminder.scheduledFor)
                  const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
                  return localDate.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                })()}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-lg">
                  {med.dosage}
                </span>
              </div>
            </div>
            <Button 
              className="rounded-xl"
              onClick={() => handleMarkAsTaken(nextReminder.id)}
              disabled={!canTakeMedication(nextReminder.scheduledFor)}
            >
              Tomar agora
            </Button>
          </div>
        </div>
      )}

      {/* Agenda */}
      <MedicationSchedule
        medication={med}
      />

      {/* Informações */}
      <div className="bg-white p-4 rounded-2xl space-y-4">
        <h3 className="font-medium">Informações</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Intervalo</p>
              <p className="font-medium">A cada {med.interval} horas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duração</p>
              <p className="font-medium">{med.duration} dias</p>
            </div>
          </div>

          {med.description && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <AlertCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Instruções</p>
                <p className="font-medium">{med.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card de Estoque */}
      <div className="bg-white p-4 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">Estoque</h3>
            <p className="text-sm text-muted-foreground">Controle sua quantidade</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">Restante</span>
              <span className="text-sm font-medium">
                {med.remainingQuantity} de {med.totalQuantity} {med.unit}
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  med.remainingQuantity / med.totalQuantity <= 0.2 
                    ? "bg-red-500"
                    : med.remainingQuantity / med.totalQuantity <= 0.5
                      ? "bg-yellow-500"
                      : "bg-green-500"
                )}
                style={{ 
                  width: `${(med.remainingQuantity / med.totalQuantity) * 100}%` 
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {med.dosageQuantity} {med.unit} por dose
            </span>
            {med.remainingQuantity / med.totalQuantity <= 0.2 && (
              <span className="text-red-500 font-medium">
                Medicamento acabando!
              </span>
            )}
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {/* Adicionar modal para atualizar quantidade */}}
          >
            Atualizar Quantidade
          </Button>
        </div>
      </div>

      {/* Histórico */}
      <div className="bg-white p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Histórico</h3>
          <span className="text-sm text-muted-foreground">
            {pastReminders.length} doses registradas
          </span>
        </div>
        
        <div className="space-y-3">
          {pastReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum histórico disponível
            </p>
          ) : (
            pastReminders.map(reminder => {
              // Converte para horário local
              const scheduledUtc = new Date(reminder.scheduledFor)
              const scheduledLocal = new Date(scheduledUtc.getTime() - scheduledUtc.getTimezoneOffset() * 60000)
              
              // Se tiver horário de tomada, converte também
              const takenUtc = reminder.takenAt ? new Date(reminder.takenAt) : null
              const takenLocal = takenUtc ? new Date(takenUtc.getTime() - takenUtc.getTimezoneOffset() * 60000) : null

              return (
                <div 
                  key={reminder.id} 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      reminder.taken ? "bg-green-500" : "bg-red-500"
                    )} />
                    <div>
                      <p className="font-medium">
                        {scheduledLocal.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {scheduledLocal.toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {reminder.taken ? (
                      <div className="text-right">
                        <p className="text-green-500">Tomado</p>
                        <p className="text-muted-foreground">
                          às {takenLocal!.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ) : (
                      <span className="text-red-500">Não tomado</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
} 