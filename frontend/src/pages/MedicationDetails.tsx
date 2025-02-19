import { getGetMedicationsIdQueryKey, getGetMedicationsQueryKey, useDeleteMedicationsId, useGetMedicationsId, usePatchMedicationsMedicationIdStock, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { GetMedications200ItemRemindersItem } from '@/api/model'
import { GetMedicationsId200 } from '@/api/model/getMedicationsId200'
import { UpdateStockForm } from '@/components/medication-details/UpdateStock'
import { MedicationSchedule } from '@/components/MedicationSchedule'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { calculateTimeUntil, cn } from '@/lib/utils'
import { useModalStore } from '@/stores/modal-store'
import { useSheetStore } from '@/stores/sheet-store'
import { useDialogStore } from '@/stores/use-deialog'
import { useToast } from '@/stores/use-toast'
import { Medication } from '@/types/medication'
import { IonAlert } from '@ionic/react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Calendar, Clock, FileText, Loader, Loader2, Package, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface MedicationWithRecurring extends GetMedicationsId200 {
  isRecurring: boolean
}

interface MedicationDetailsProps {
  medication: Medication
}

export function MedicationDetails({ medication: initialMedication }: MedicationDetailsProps) {
  const queryClient = useQueryClient()
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()
  const { mutate: deleteMedication, isPending: isDeleting } = useDeleteMedicationsId()
  const { data: medicationData, refetch } = useGetMedicationsId(initialMedication.id)
  const [timeUntil, setTimeUntil] = useState('')
  const { open } = useDialogStore()
  const close = useModalStore(state => state.close)
  const toast = useToast(state => state.open)

  // Converter os dados da API para o formato do frontend
  const med = useMemo(() => {
    if (!medicationData) return initialMedication

    return {
      ...medicationData,
      description: medicationData.description || '',
      dosage: '1 comprimido',
      time: new Date(medicationData.startDate).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }),
      instructions: medicationData.description || '',
      status: 'pending' as const,
      timeUntil: calculateTimeUntil(medicationData.startDate),
      reminders: medicationData.reminders?.map(reminder => ({
        ...reminder,
        time: new Date(reminder.scheduledFor).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        })
      })) || [],
      isRecurring: medicationData.isRecurring
    } satisfies Medication
  }, [medicationData, initialMedication])

  // Pega o próximo lembrete não tomado
  const nextReminder = useMemo(() => {
    const now = new Date()
    return med.reminders.find((r: GetMedications200ItemRemindersItem) =>
      !r.taken && !r.skipped && new Date(r.scheduledFor) > now
    )
  }, [med.reminders])

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
    const scheduledDate = new Date(scheduledFor)
    return scheduledDate <= new Date()
  }

  // Separa os lembretes em passados e futuros
  const now = new Date()
  const pastReminders = med.reminders
    .filter((r: GetMedications200ItemRemindersItem) => new Date(r.scheduledFor) < now)
    .sort((a: GetMedications200ItemRemindersItem, b: GetMedications200ItemRemindersItem) =>
      new Date(b.scheduledFor).getTime() - new Date(a.scheduledFor).getTime()
    )

  // Pega os horários do dia atual
  const todayReminders = useMemo(() => {
    if (!med.reminders) return []

    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)

    return med.reminders
      .filter(reminder => {
        const reminderDate = new Date(reminder.scheduledFor)
        return reminderDate >= startOfToday && reminderDate <= endOfToday
      })
      .map(reminder => ({
        ...reminder,
        time: new Date(reminder.scheduledFor).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        })
      }))
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
  }, [med.reminders])

  const handleMarkAsTaken = async (reminderId: string, scheduledFor: string, taken: boolean = true) => {
    markAsTaken({
      data: {
        reminderId,
        scheduledFor,
        taken
      }
    }, {
      onSuccess: () => {
        // Invalida todas as queries relacionadas ao medicamento
        refetch()
        queryClient.invalidateQueries({ queryKey: getGetMedicationsIdQueryKey(initialMedication.id) })
      }
    })
  }

  const handleDeleteMedication = () => {
    deleteMedication({
      id: initialMedication.id,
    }, {
      onSuccess: () => {
        toast({
          title: 'Medicamento removido',
          description: 'O medicamento foi removido com sucesso.',
          type: 'success'
        })
        queryClient.invalidateQueries({ queryKey: getGetMedicationsQueryKey() })
        close()
      }
    })
  }



  if (!medicationData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin text-primary">
          <Loader2 className="w-6 h-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {/* Próxima Dose */}
      {nextReminder && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-950/50 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Próxima dose</h3>
                <p className="text-sm text-muted-foreground">{timeUntil}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMarkAsTaken(nextReminder.id, nextReminder.scheduledFor, true)}
              disabled={!canTakeMedication(nextReminder.scheduledFor)}
              className="text-primary border-primary hover:border-primary hover:bg-primary/10"
            >
              Tomar agora
            </Button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-medium text-primary">
                  {new Date(nextReminder.scheduledFor).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Sao_Paulo'
                  })}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-primary">
                    {med.dosageQuantity} {med.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agenda */}
      <div className="p-4">
        <MedicationSchedule medication={med} />
      </div>

      {/* Informações */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-medium text-foreground">Informações</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 ">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Intervalo</p>
                <p className="font-medium">{med.interval}h em {med.interval}h</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600/70 dark:text-blue-400/70">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-medium">{med.duration ?? 'Contínuo'}</p>
              </div>
            </div>
          </div>

          {med.description && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600/70 dark:text-blue-400/70">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Instruções</p>
                  <p className="font-medium">{med.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Estoque */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Estoque</h3>
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
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 ease-out",
                  med.remainingQuantity / med.totalQuantity <= 0.2
                    ? "bg-red-500"
                    : med.remainingQuantity / med.totalQuantity <= 0.5
                      ? "bg-amber-500"
                      : "bg-emerald-500"
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
            size="sm"
            className='w-full dark:bg-primary/50  dark:text-primary-foreground'
            onClick={() => {
              open({
                title: 'Atualizar Estoque',
                content: <UpdateStockForm medication={med} />,
              })
            }}
          >
            Atualizar Quantidade
          </Button>
        </div>
      </div>

      {/* Histórico */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950/50 flex items-center justify-center text-slate-600 dark:text-slate-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Histórico</h3>
              <p className="text-sm text-muted-foreground">{pastReminders.length} doses registradas</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {pastReminders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum histórico disponível
            </p>
          ) : (
            pastReminders.map((reminder: GetMedications200ItemRemindersItem) => {
              const scheduledDate = new Date(reminder.scheduledFor)
              const takenDate = reminder.takenAt ? new Date(reminder.takenAt) : null

              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      reminder.taken ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    <div>
                      <p className="font-medium">
                        {scheduledDate.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'America/Sao_Paulo'
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {scheduledDate.toLocaleDateString('pt-BR', {
                          timeZone: 'America/Sao_Paulo'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm">
                    {reminder.taken ? (
                      <div className="text-right">
                        <p className="text-emerald-500">Tomado</p>
                        <p className="text-muted-foreground">
                          às {takenDate!.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'America/Sao_Paulo'
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

      {/* Timeline do dia */}
      <div className="p-4">
        <div className="flex justify-between">
          {todayReminders.map((reminder) => (
            <div key={reminder.scheduledFor} className="text-sm text-muted-foreground">
              {reminder.time}
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      <div className="p-4">
        <Button
          variant="outline"
          size="sm"
          id="present-alert"
          disabled={isDeleting}
          // onClick={() => setShowDeleteDialog(true)}
          className="w-full text-red-600 dark:text-red-400 border-red-200 hover:border-red-300 hover:bg-red-50"
        >
          {isDeleting ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 mr-2" />
          )}
          Deletar Medicamento
        </Button>
      </div>


      <IonAlert
        trigger="present-alert"
        header="Você tem certeza?"
        message="Esta ação não pode ser desfeita. Isso excluirá permanentemente seu medicamento e todos os seus dados relacionados."
        buttons={[
          {
            text: 'Não',
            cssClass: 'alert-button-cancel',
          },
          {
            text: 'Sim, excluir',
            cssClass: 'alert-button-confirm',
            handler: () => handleDeleteMedication(),

          },
        ]}
      ></IonAlert>



    </div>
  )
} 