import { useState, useEffect, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMedications, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { useDrawer } from '@/hooks/useDrawer'
import { calculateTimeUntil } from '@/lib/utils'
import { MedicationDetails } from './MedicationDetails'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { NextMedicationCard } from '@/components/home/NextMedicationCard'
import { MedicationCard } from '@/components/home/MedicationCard'
import { MedicationTimeGroup } from '@/components/home/MedicationTimeGroup'
import { Medication } from '@/types/medication'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { Bell, Search, AlertCircle, Clock, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { EmptyMedicationNowState } from '@/components/home/EmptyMedicationNowState'
import { NoResults } from '@/components/ui/NoResults'
import { StatsCard } from '@/components/home/StatsCard'
import { useUserStore } from '@/stores/user'
import { formatInTimeZone } from 'date-fns-tz'
import { GetMedications200Item, GetMedications200ItemRemindersItem } from '@/api/model'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export type ReminderStatus = 'pending' | 'taken' | 'skipped' | 'late'

export interface MedicationGroup {
  hour: string
  medications: (GetMedications200Item & {
    status?: ReminderStatus
    timeUntil?: string
    instructions?: string
  })[]
}

export function Home() {
  const { user } = useUserStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const drawer = useDrawer()
  const queryClient = useQueryClient()
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()

  const { data: medications } = useGetMedications()

  const now = new Date()
  const spTimeZone = 'America/Sao_Paulo'
  const nowInSP = formatInTimeZone(now, spTimeZone, 'yyyy-MM-dd HH:mm')
  const todayInSP = formatInTimeZone(now, spTimeZone, 'yyyy-MM-dd')

  // Separa grupos atrasados dos no horário
  const { lateGroups, onTimeGroups } = useMemo(() => {
    if (!medications) return { lateGroups: [], onTimeGroups: [] }

    console.log('=== RAW DATA FROM API ===')
    console.log('Current time:', now.toISOString())
    medications.forEach(med => {
      console.log('\nMedication:', {
        id: med.id,
        name: med.name,
        reminders: med.reminders.map(r => ({
          id: r.id,
          scheduledFor: r.scheduledFor,
          taken: r.taken,
          skipped: r.skipped
        }))
      })
    })
    console.log('=== END RAW DATA ===\n')

    const late: Record<string, MedicationGroup> = {}
    const onTime: Record<string, MedicationGroup> = {}

    console.log('Current time in SP:', nowInSP)
    console.log('Today in SP:', todayInSP)

    medications.forEach(medication => {
      console.log('\n=== Processing medication ===', {
        name: medication.name,
        totalReminders: medication.reminders.length,
        reminders: medication.reminders.map(r => ({
          scheduledFor: r.scheduledFor,
          taken: r.taken,
          skipped: r.skipped
        }))
      })
      
      // Primeiro, encontra os reminders do dia atual
      const todayReminders = medication.reminders.filter(reminder => {
        const reminderDate = parseISO(reminder.scheduledFor)
        const reminderDayInSP = formatInTimeZone(reminderDate, spTimeZone, 'yyyy-MM-dd')
        const reminderTimeInSP = formatInTimeZone(reminderDate, spTimeZone, 'HH:mm')
        const isToday = reminderDayInSP === todayInSP
        
        console.log('Checking reminder:', {
          medication: medication.name,
          scheduledFor: reminder.scheduledFor,
          reminderDayInSP,
          reminderTimeInSP,
          todayInSP,
          isToday,
          taken: reminder.taken,
          skipped: reminder.skipped
        })
        return isToday
      })

      console.log(`Found ${todayReminders.length} reminders for today`)

      // Depois, processa cada reminder do dia
      todayReminders.forEach(reminder => {
        const reminderDate = parseISO(reminder.scheduledFor)
        const reminderInSP = formatInTimeZone(reminderDate, spTimeZone, 'yyyy-MM-dd HH:mm')
        const hour = formatInTimeZone(reminderDate, spTimeZone, 'HH:mm')
        
        // Verifica se o lembrete está atrasado (antes do horário atual)
        const isLate = reminderDate < now

        // Pula apenas reminders já tomados ou pulados
        if (reminder.taken || reminder.skipped) {
          console.log('Skipping reminder (taken/skipped):', {
            medication: medication.name,
            scheduledFor: reminder.scheduledFor,
            taken: reminder.taken,
            skipped: reminder.skipped
          })
          return
        }

        console.log('Processing active reminder:', {
          medication: medication.name,
          scheduledFor: reminder.scheduledFor,
          reminderInSP,
          nowInSP,
          isLate,
          hour,
          reminderTime: reminderDate.toISOString(),
          currentTime: now.toISOString()
        })

        const targetGroups = isLate ? late : onTime

        if (!targetGroups[hour]) {
          targetGroups[hour] = {
            hour,
            medications: []
          }
        }

        // Verifica se o medicamento já não foi adicionado neste horário
        const medicationAlreadyAdded = targetGroups[hour].medications.some(
          med => med.id === medication.id
        )

        if (!medicationAlreadyAdded) {
          targetGroups[hour].medications.push({
            ...medication,
            status: isLate ? 'late' : 'pending',
            timeUntil: formatDistanceToNow(reminderDate, { 
              locale: ptBR, 
              addSuffix: true 
            }),
            instructions: medication.description || ''
          })
        }
      })
    })

    // Ordena os grupos por hora
    const sortGroups = (groups: Record<string, MedicationGroup>) => {
      return Object.values(groups).sort((a, b) => {
        const [aHours, aMinutes] = a.hour.split(':').map(Number)
        const [bHours, bMinutes] = b.hour.split(':').map(Number)
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes)
      })
    }

    const sortedLateGroups = sortGroups(late)
    const sortedOnTimeGroups = sortGroups(onTime)

    console.log('=== ATRASADOS ===')
    sortedLateGroups.forEach(group => {
      console.log(`${group.hour}:`, group.medications.map(med => ({
        name: med.name,
        status: med.status,
        timeUntil: med.timeUntil
      })))
    })

    console.log('=== PENDENTES ===')
    sortedOnTimeGroups.forEach(group => {
      console.log(`${group.hour}:`, group.medications.map(med => ({
        name: med.name,
        status: med.status,
        timeUntil: med.timeUntil
      })))
    })

    return {
      lateGroups: sortedLateGroups,
      onTimeGroups: sortedOnTimeGroups
    }
  }, [medications, nowInSP, todayInSP])

  // Encontra o próximo grupo de medicamentos
  const nextGroup = useMemo(() => {
    return onTimeGroups.find(group => {
      const [hours, minutes] = group.hour.split(':').map(Number)
      const groupTime = new Date(now)
      groupTime.setHours(hours, minutes, 0, 0)
      return groupTime >= now
    })
  }, [onTimeGroups, now])

  const handleMedicationClick = (medication: Medication) => {
    drawer.open({
      title: medication.name,
      content: <MedicationDetails medication={medication} />
    })
  }

  const handleAddMedicationClick = () => {
    drawer.open({
      title: 'Adicionar Medicamento',
      content: <AddMedicationForm onSuccess={() => drawer.close()} />
    })
  }

  const handleTakeMedication = (medicationId: string) => {
    const now = new Date()
    const medication = medications?.find(m => m.id === medicationId)

    if (!medication) return

    const nextReminder = medication.reminders.find(r => {
      if (r.taken) return false
      const reminderDate = parseISO(r.scheduledFor)
      // Adiciona uma tolerância de 5 minutos antes do horário
      const fiveMinutesBefore = new Date(reminderDate.getTime() - 5 * 60 * 1000)
      return now >= fiveMinutesBefore && now <= reminderDate
    })

    if (!nextReminder) return

    markAsTaken({ 
      data: { 
        reminderId: nextReminder.id,
        scheduledFor: nextReminder.scheduledFor,
        taken: true 
      }
    }, {
      onSuccess: () => {
        // Invalida a query do medicamento e da lista
        queryClient.invalidateQueries({ queryKey: [`/medications/${medicationId}`] })
        queryClient.invalidateQueries({ queryKey: ['/medications'] })
      }
    })
  }

  if (!medications) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Bom dia'
    if (hour >= 12 && hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 space-y-8">
        {/* Header com saudação e informações do dia */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {user?.name?.split(' ')[0]}
            </h1>
            <span className="text-sm font-medium text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
              {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {nextGroup 
                ? "Aqui está seu próximo medicamento"
                : "Nenhum medicamento para hoje"}
            </p>
            <p className="text-sm font-medium">
              {onTimeGroups.reduce((total, group) => total + group.medications.length, 0)} para hoje • {' '}
              {lateGroups.reduce((total, group) => total + group.medications.length, 0)} atrasados
            </p>
          </div>
        </div>

        {/* Próximo medicamento */}
        {nextGroup && (
          <NextMedicationCard 
            group={nextGroup}
            onMedicationClick={handleMedicationClick}
          />
        )}

        {/* Tabs para medicamentos */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="today" className="flex-1">Para hoje</TabsTrigger>
            <TabsTrigger value="late" className="flex-1">
              Atrasados
              {lateGroups.length > 0 && (
                <span className="ml-2 bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 text-xs">
                  {lateGroups.reduce((total, group) => total + group.medications.length, 0)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            {onTimeGroups.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Medicamentos do dia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {onTimeGroups.map(group => (
                    <MedicationTimeGroup
                      key={group.hour}
                      time={group.hour}
                      medications={group.medications}
                      onMedicationClick={handleMedicationClick}
                    />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <EmptyMedicationNowState onAddClick={handleAddMedicationClick} />
            )}
          </TabsContent>

          <TabsContent value="late">
            {lateGroups.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-destructive">
                    Medicamentos atrasados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lateGroups.map(group => (
                    <MedicationTimeGroup
                      key={group.hour}
                      time={group.hour}
                      medications={group.medications}
                      onMedicationClick={handleMedicationClick}
                    />
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum medicamento atrasado
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
