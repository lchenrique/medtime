import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMedications } from '@/api/generated/medications/medications'
import { useDrawer } from '@/hooks/useDrawer'
import { calculateTimeUntil } from '@/lib/utils'
import { MedicationDetails } from './MedicationDetails'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { NextMedicationCard } from '@/components/home/NextMedicationCard'
import { MedicationTimeGroup } from '@/components/home/MedicationTimeGroup'
import { Medication } from '@/types/medication'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { sendNotification } from '@tauri-apps/plugin-notification'

export function Home() {
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const drawer = useDrawer()
  const queryClient = useQueryClient()

  const { data: medicationsData, isLoading: isLoadingMedications } = useGetMedications()

  // Atualiza o estado local quando os dados são carregados
  useEffect(() => {
    if (medicationsData) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dayAfterTomorrow = new Date(tomorrow)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

      const mappedMedications = medicationsData
        .map(med => {
          const startDateUtc = new Date(med.startDate)
          const startDateLocal = new Date(startDateUtc.getTime() - startDateUtc.getTimezoneOffset() * 60000)
          const endDate = new Date(startDateLocal)
          endDate.setDate(endDate.getDate() + med.duration)

          const filteredReminders = (med.reminders || [])
            // Filtra apenas lembretes do dia atual ou futuros que não foram tomados
            .filter(reminder => {
              const utcDate = new Date(reminder.scheduledFor)
              const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
              // Se for hoje, só mostra os que ainda não passaram ou não foram tomados
              if (localDate.toDateString() === today.toDateString()) {
                return !reminder.taken && localDate >= now
              }
              // Para dias futuros, mostra todos que não foram tomados
              return !reminder.taken && localDate <= endDate
            })
            .sort((a, b) => {
              const dateA = new Date(a.scheduledFor)
              const dateB = new Date(b.scheduledFor)
              return dateA.getTime() - dateB.getTime()
            })

          if (filteredReminders.length === 0) return null

          // Pega o próximo horário não tomado para ser o horário principal do medicamento
          const nextReminder = filteredReminders[0]
          const nextReminderUtc = new Date(nextReminder.scheduledFor)
          const nextReminderLocal = new Date(nextReminderUtc.getTime() - nextReminderUtc.getTimezoneOffset() * 60000)

          const mappedMed: Medication = {
            ...med,
            description: med.description || '',
            dosage: '1 comprimido',
            // Usa o horário do próximo lembrete como horário principal
            time: nextReminderLocal.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit'
            }),
            instructions: med.description || '',
            status: 'pending',
            timeUntil: calculateTimeUntil(nextReminder.scheduledFor),
            reminders: filteredReminders.map(reminder => {
              const utcDate = new Date(reminder.scheduledFor)
              const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
              
              return {
                ...reminder,
                taken: reminder.taken || false,
                takenAt: reminder.takenAt || null,
                skipped: reminder.skipped || false,
                skippedReason: reminder.skippedReason || null,
                time: localDate.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                }) + (
                  localDate.toDateString() === today.toDateString()
                    ? ' (hoje)'
                    : localDate.toDateString() === tomorrow.toDateString()
                      ? ' (amanhã)'
                      : ` (${localDate.toLocaleDateString('pt-BR')})`
                )
              }
            })
          }

          return mappedMed
        })
        .filter((med): med is Medication => med !== null)

      setMedications(mappedMedications)
    }
  }, [medicationsData])

  // Pega o próximo medicamento
  const getNextMedication = (meds: Medication[]) => {
    if (meds.length === 0) return null

    const now = new Date()
    let nextMed: Medication | null = null
    let smallestDiff = Infinity

    // Procura apenas horários futuros
    meds.forEach(med => {
      const nextReminder = med.reminders.find(r => {
        if (r.taken) return false
        const utcDate = new Date(r.scheduledFor)
        const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
        return localDate > now
      })

      if (nextReminder) {
        const utcDate = new Date(nextReminder.scheduledFor)
        const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
        const diffInMinutes = Math.round((localDate.getTime() - now.getTime()) / (1000 * 60))

        if (diffInMinutes > 0 && diffInMinutes < smallestDiff) {
          smallestDiff = diffInMinutes
          nextMed = {
            ...med,
            timeUntil: calculateTimeUntil(nextReminder.scheduledFor)
          }
        }
      }
    })

    return nextMed
  }

  const nextMedication = getNextMedication(medications)

  const handleMedicationClick = (medication: Medication) => {
    const originalMedication = medicationsData?.find(med => med.id === medication.id)
    
    if (originalMedication) {
      const startDate = new Date(originalMedication.startDate)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + originalMedication.duration)

      const allReminders = originalMedication.reminders.map(reminder => {
        const reminderDate = new Date(reminder.scheduledFor)
        return {
          ...reminder,
          time: reminderDate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'UTC'
          }) + ` (${reminderDate.toLocaleDateString('pt-BR')})`
        }
      }).sort((a, b) => {
        return new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
      })

      const fullMedication = {
        ...originalMedication,
        description: originalMedication.description || '',
        dosage: '1 comprimido',
        time: new Date(originalMedication.startDate).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'UTC'
        }),
        instructions: originalMedication.description || '',
        status: 'pending' as const,
        timeUntil: calculateTimeUntil(originalMedication.startDate),
        reminders: allReminders
      }

      setSelectedMedication(fullMedication)
      drawer.open({
        title: medication.name,
        content: (
          <MedicationDetails
            medication={fullMedication}
          />
        ),
        onClose: () => {
          queryClient.invalidateQueries({ queryKey: ['/medications'] })
        }
      })
    }
  }

  const handleAddMedicationClick = () => {
    drawer.open({
      title: 'Adicionar Medicamento',
      content: <AddMedicationForm onSuccess={() => drawer.close()} />
    })
  }

  const handleTakeMedication = (medicationId: string) => {
    const now = new Date()
    
    setMedications(prevMedications => {
      return prevMedications.map(med => {
        if (med.id === medicationId) {
          const nextReminder = med.reminders.find(r => {
            if (r.taken) return false
            const utcDate = new Date(r.scheduledFor)
            const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
            return localDate <= now
          })

          if (nextReminder) {
            return {
              ...med,
              reminders: med.reminders.map(reminder => {
                if (reminder.id === nextReminder.id) {
                  return {
                    ...reminder,
                    taken: true,
                    takenAt: now.toISOString(),
                  }
                }
                return reminder
              })
            }
          }
        }
        return med
      })
    })
  }

  const handleTestNotification = async () => {
    try {
      await sendNotification({
        title: "Teste Tauri",
        body: "Esta é uma notificação de teste direto do Tauri!"
      })
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
    }
  }

  if (isLoadingMedications) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-14 bg-primary/10 rounded-2xl" />
            <div className="h-40 bg-primary/5 rounded-2xl" />
            <div className="space-y-3">
              <div className="h-5 bg-primary/10 rounded-full w-1/3" />
              <div className="h-32 bg-primary/5 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      <div className="w-full">
        <div className="fixed bottom-16 z-50 right-4 flex flex-col gap-4">
          <Button
            onClick={handleTestNotification}
            size="icon"
            className="rounded-full hover:bg-primary/10"
          >
            T
          </Button>
          <Button
            onClick={handleAddMedicationClick}
            size="icon"
            className="rounded-full hover:bg-primary/10"
          >
            <PlusCircle className="w-10 h-10" />
          </Button>
        </div>

        <Card className="overflow-hidden border-none bg-card/50 backdrop-blur-sm">
          {medications.length === 0 ? (
            <div className="p-6">
              <EmptyMedicationState onAddClick={handleAddMedicationClick} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {nextMedication && (
                <div className="p-6">
                  <NextMedicationCard
                    medication={nextMedication}
                    onTakeMedication={handleTakeMedication}
                  />
                </div>
              )}

              <div className="p-6">
                {Object.entries(
                  medications.reduce((acc, med) => {
                    if (!acc[med.time]) {
                      acc[med.time] = []
                    }
                    acc[med.time].push(med)
                    return acc
                  }, {} as Record<string, Medication[]>)
                ).map(([time, meds]) => (
                  <MedicationTimeGroup
                    key={time}
                    time={time}
                    medications={meds}
                    onMedicationClick={handleMedicationClick}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 