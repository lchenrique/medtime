import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMedications, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { useDrawer } from '@/hooks/useDrawer'
import { calculateTimeUntil } from '@/lib/utils'
import { MedicationDetails } from './MedicationDetails'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { NextMedicationCard } from '@/components/home/NextMedicationCard'
import { MedicationCard } from '@/components/home/MedicationCard'
import { MedicationTimeGroup } from '@/components/home/MedicationTimeGroup'
import { FloatingAddButton } from '@/components/home/FloatingAddButton'
import { Medication } from '@/types/medication'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { Bell, Search, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

type MedicationGroup = {
  time: string
  medications: Medication[]
  timeUntil?: string
}

export function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [medicationGroups, setMedicationGroups] = useState<MedicationGroup[]>([])
  const [lateGroups, setLateGroups] = useState<MedicationGroup[]>([])
  const drawer = useDrawer()
  const queryClient = useQueryClient()
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()

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

      // Tolerância de 10 minutos para medicamentos passados
      const toleranceTime = new Date(now.getTime() - 10 * 60 * 1000)

      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: 'numeric',
          day: 'numeric'
        }).format(date)
      }

      const isSameDay = (date1: Date, date2: Date) => {
        return formatDate(date1) === formatDate(date2)
      }

      const mappedMedications = medicationsData
        .map(med => {
          const startDate = new Date(med.startDate)
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + med.duration)

          const filteredReminders = (med.reminders || [])
            .filter(reminder => {
              const reminderDate = new Date(reminder.scheduledFor)
              // Se for hoje, mostra todos que não foram tomados
              if (isSameDay(reminderDate, today)) {
                return !reminder.taken
              }
              // Para dias futuros, mostra todos que não foram tomados e dentro do período
              return !reminder.taken && reminderDate <= endDate
            })
            .sort((a, b) => {
              const dateA = new Date(a.scheduledFor)
              const dateB = new Date(b.scheduledFor)
              return dateA.getTime() - dateB.getTime()
            })

          if (filteredReminders.length === 0) return null

          const nextReminder = filteredReminders[0]
          const nextReminderDate = new Date(nextReminder.scheduledFor)

          // Se o próximo lembrete já foi tomado, pula este medicamento
          if (nextReminder.taken) return null

          const mappedMed: Medication = {
            ...med,
            description: med.description || '',
            dosage: `${med.dosageQuantity} ${med.unit}`,
            time: nextReminderDate.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'America/Sao_Paulo'
            }),
            instructions: med.description || '',
            status: nextReminderDate < toleranceTime ? 'late' : 'pending',
            timeUntil: calculateTimeUntil(nextReminder.scheduledFor),
            reminders: filteredReminders.map(reminder => {
              const reminderDate = new Date(reminder.scheduledFor)
              
              return {
                ...reminder,
                taken: reminder.taken || false,
                takenAt: reminder.takenAt || null,
                skipped: reminder.skipped || false,
                skippedReason: reminder.skippedReason || null,
                time: reminderDate.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  timeZone: 'America/Sao_Paulo'
                }) + (
                  isSameDay(reminderDate, today)
                    ? ' (hoje)'
                    : isSameDay(reminderDate, tomorrow)
                      ? ' (amanhã)'
                      : ` (${formatDate(reminderDate)})`
                )
              }
            })
          }

          return mappedMed
        })
        .filter((med): med is Medication => med !== null)
        .sort((a, b) => {
          const timeA = a.time.split(':').map(Number)
          const timeB = b.time.split(':').map(Number)
          return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
        })

      // Separar medicamentos atrasados e no horário
      const lateMeds = mappedMedications.filter(med => med.status === 'late')
      const onTimeMeds = mappedMedications.filter(med => med.status === 'pending')

      // Agrupar medicamentos atrasados por horário
      const lateGroups: MedicationGroup[] = []
      lateMeds.forEach(med => {
        const existingGroup = lateGroups.find(group => group.time === med.time)
        if (existingGroup) {
          existingGroup.medications.push(med)
        } else {
          lateGroups.push({
            time: med.time,
            medications: [med]
          })
        }
      })

      // Agrupar medicamentos no horário
      const onTimeGroups: MedicationGroup[] = []
      onTimeMeds.forEach(med => {
        const existingGroup = onTimeGroups.find(group => group.time === med.time)
        if (existingGroup) {
          existingGroup.medications.push(med)
        } else {
          onTimeGroups.push({
            time: med.time,
            medications: [med]
          })
        }
      })

      setMedicationGroups(onTimeGroups)
      setLateGroups(lateGroups)
    }
  }, [medicationsData])
  

  // Pega o próximo medicamento
  const getNextMedicationGroup = (groups: MedicationGroup[]): MedicationGroup | null => {
    if (groups.length === 0) return null

    const now = new Date()
    let nextGroup: MedicationGroup | null = null
    let smallestDiff = Infinity

    groups.forEach(group => {
      const [hours, minutes] = group.time.split(':').map(Number)
      const nextTime = new Date(now)
      nextTime.setHours(hours, minutes, 0, 0)

      if (nextTime <= now) {
        nextTime.setDate(nextTime.getDate() + 1)
      }

      const diffInMinutes = Math.round((nextTime.getTime() - now.getTime()) / (1000 * 60))

      if (diffInMinutes > 0 && diffInMinutes < smallestDiff) {
        smallestDiff = diffInMinutes
        nextGroup = {
          ...group,
          medications: group.medications.map(med => ({
            ...med,
            timeUntil: calculateTimeUntil(nextTime.toISOString())
          }))
        }
      }
    })

    return nextGroup
  }

  const nextMedicationGroup = getNextMedicationGroup(medicationGroups)

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
    const medication = medicationGroups
      .flatMap(g => g.medications)
      .find(m => m.id === medicationId)

    if (!medication) return

    const nextReminder = medication.reminders.find(r => {
      if (r.taken) return false
      const utcDate = new Date(r.scheduledFor)
      const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
      return localDate <= now
    })

    if (!nextReminder) return

    markAsTaken({ 
      data: { 
        reminderId: nextReminder.id,
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

  // Filtra os grupos de medicamentos baseado no termo de busca
  const filteredGroups = medicationGroups
    .map(group => ({
      ...group,
      medications: group.medications
        .filter(med => {
          // Verifica se o próximo lembrete não foi tomado
          const nextReminder = med.reminders[0]
          if (!nextReminder || nextReminder.taken) return false

          // Aplica o filtro de busca
          return med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${med.dosageQuantity} ${med.unit}`.toLowerCase().includes(searchTerm.toLowerCase())
        })
    }))
    .filter(group => group.medications.length > 0)

  // Filtra os grupos atrasados baseado no termo de busca
  const filteredLateGroups = lateGroups
    .map(group => ({
      ...group,
      medications: group.medications
        .filter(med => {
          // Verifica se o próximo lembrete não foi tomado
          const nextReminder = med.reminders[0]
          if (!nextReminder || nextReminder.taken) return false

          // Aplica o filtro de busca
          return med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            med.instructions?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${med.dosageQuantity} ${med.unit}`.toLowerCase().includes(searchTerm.toLowerCase())
        })
    }))
    .filter(group => group.medications.length > 0)

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
    <div className="min-h-screen bg-violet-50">
      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-violet-950">Meus Medicamentos</h1>
              <p className="text-sm text-violet-500">Mantenha sua saúde em dia</p>
            </div>
            <div className="relative">
              <Bell className="w-6 h-6 text-violet-500" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] text-primary-foreground flex items-center justify-center">
                {medicationGroups.reduce((total, group) => total + group.medications.length, 0) + 
                 lateGroups.reduce((total, group) => total + group.medications.length, 0)}
              </span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <Input
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-violet-100 placeholder:text-violet-300 focus-visible:ring-violet-500"
            />
          </div>
        </div>

        {nextMedicationGroup && nextMedicationGroup.medications && (
          <NextMedicationCard 
            medication={nextMedicationGroup.medications[0]}
            onTakeMedication={handleTakeMedication}
          />
        )}

        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid grid-cols-2 gap-4 p-1 pb-2 bg-transparent">
            <TabsTrigger 
              value="current" 
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-violet-100 bg-white transition-colors data-[state=active]:border-violet-500 data-[state=active]:bg-violet-50 shadow-sm",
                "hover:bg-violet-50/50"
              )}
            >
              <span className="text-sm font-medium text-violet-950">Horários</span>
              {medicationGroups.length > 0 && (
                <span className="bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full text-xs">
                  {medicationGroups.reduce((total, group) => total + group.medications.length, 0)}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="late" 
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-red-100 bg-white transition-colors data-[state=active]:border-red-500 data-[state=active]:bg-red-50 shadow-sm",
                "hover:bg-red-50/50"
              )}
            >
              <span className="text-sm font-medium text-violet-950">Atrasados</span>
              {lateGroups.length > 0 && (
                <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs">
                  {lateGroups.reduce((total, group) => total + group.medications.length, 0)}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="mt-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {filteredGroups.map(group => (
                <MedicationTimeGroup
                  key={group.time}
                  time={group.time}
                  medications={group.medications}
                  onMedicationClick={handleMedicationClick}
                />
              ))}

              {filteredGroups.length === 0 && searchTerm && (
                <div className="p-12 text-center">
                  <p className="text-sm text-violet-400">
                    Nenhum medicamento encontrado para "{searchTerm}"
                  </p>
                </div>
              )}

              {medicationGroups.length === 0 && !searchTerm && (
                <EmptyMedicationState onAddClick={handleAddMedicationClick} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="late" className="mt-6">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
              {filteredLateGroups.length > 0 ? (
                <>
                  <div className="p-4 bg-red-50 border-b border-red-100">
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-5 h-5" />
                      <p className="text-sm font-medium">
                        Medicamentos que precisam ser tomados
                      </p>
                    </div>
                  </div>
                  {filteredLateGroups.map(group => (
                    <MedicationTimeGroup
                      key={group.time}
                      time={group.time}
                      medications={group.medications}
                      onMedicationClick={handleMedicationClick}
                      isLateGroup
                    />
                  ))}
                </>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-violet-400">
                    Nenhum medicamento atrasado
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <FloatingAddButton onClick={handleAddMedicationClick} />
      </div>
    </div>
  ) 
} 