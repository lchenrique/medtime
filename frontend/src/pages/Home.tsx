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
import { Bell, Search, AlertCircle, Clock, Plus, Moon, Sun, MoreVertical, Settings } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom'

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
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const { data: medications, isLoading } = useGetMedications()

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

  const handleSearch = () => {
    drawer.open({
      title: 'Pesquisar',
      content: (
        <div className="p-4">
          <Input 
            placeholder="Pesquisar medicamento..." 
            className="w-full"
            autoFocus
          />
        </div>
      )
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin text-violet-600">
          <Loader2 className="w-6 h-6" />
        </div>
      </div>
    )
  }

  const hasNoMedications = !medications || medications.length === 0
  const hasNoRemindersToday = !lateGroups.length && !onTimeGroups.length

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Principal */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-normal text-foreground">MedTime</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleAddMedicationClick}
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleSearch}
                className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {!hasNoRemindersToday && (
            <div className="mt-3 px-4 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
              <p className="text-sm text-violet-600 dark:text-violet-400">
                {onTimeGroups.reduce((total, group) => total + group.medications.length, 0)} medicamentos pendentes • {lateGroups.reduce((total, group) => total + group.medications.length, 0)} atrasados
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 relative isolate">
        <div className="max-w-2xl mx-auto">
          {hasNoRemindersToday ? (
            <EmptyMedicationState onAddClick={handleAddMedicationClick} />
          ) : (
            <div className="divide-y divide-border">
              {/* Medicamentos Atrasados */}
              {lateGroups.length > 0 && (
                <div>
                  <div className="sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur-md border-y">
                    <div className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Atrasados</span>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {lateGroups.map((group) => (
                      <div key={group.hour}>
                        <div className="sticky top-[7rem] z-30 bg-background/95 backdrop-blur-md px-4 py-2 border-y">
                          <span className="text-base font-medium text-foreground">
                            {group.hour}
                          </span>
                        </div>
                        
                        <div className="divide-y divide-border">
                          {group.medications.map((medication) => (
                            <MedicationCard
                              key={medication.id}
                              medication={medication}
                              onClick={() => handleMedicationClick(medication)}
                              isLate={true}
                              showTakeButton
                              onTake={handleTakeMedication}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicamentos Pendentes */}
              {onTimeGroups.length > 0 && (
                <div>
                  <div className="sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur-md border-y">
                    <div className="flex items-center gap-2 px-4 py-2 text-violet-600 dark:text-violet-400">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm font-medium">Pendentes</span>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {onTimeGroups.map((group) => (
                      <div key={group.hour}>
                        <div className="sticky top-[7rem] z-30 bg-background/95 backdrop-blur-md px-4 py-2 border-y">
                          <span className="text-base font-medium text-foreground">
                            {group.hour}
                          </span>
                        </div>
                        
                        <div className="divide-y divide-border">
                          {group.medications.map((medication) => (
                            <MedicationCard
                              key={medication.id}
                              medication={medication}
                              onClick={() => handleMedicationClick(medication)}
                              isLate={false}
                              showTakeButton
                              onTake={handleTakeMedication}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
