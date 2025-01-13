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

type ReminderStatus = 'pending' | 'late'

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

          // Filtra e ordena os lembretes
          const now = new Date()
          const toleranceTime = new Date(now.getTime() - 5 * 60 * 1000) // 5 minutos atrás

          const filteredReminders = (med.reminders || [])
            .filter(reminder => {
              if (reminder.taken || reminder.skipped) return false
              const reminderDate = new Date(reminder.scheduledFor)
              return reminderDate >= toleranceTime || isSameDay(reminderDate, today)
            })
            .sort((a, b) => {
              const dateA = new Date(a.scheduledFor)
              const dateB = new Date(b.scheduledFor)
              return dateA.getTime() - dateB.getTime()
            })

          if (filteredReminders.length === 0) return null

          // Mapeia cada lembrete para incluir o status
          const mappedReminders = filteredReminders.map(reminder => {
            const reminderDate = new Date(reminder.scheduledFor)
            const status: ReminderStatus = reminderDate < toleranceTime ? 'late' : 'pending'

            return {
              ...reminder,
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
              ),
              status
            }
          })

          // Cria o objeto do medicamento com os lembretes mapeados
          const mappedMed: Medication = {
            ...med,
            description: med.description || '',
            dosage: `${med.dosageQuantity} ${med.unit}`,
            time: mappedReminders[0].time.split(' ')[0], // Remove o sufixo (hoje), (amanhã), etc
            instructions: med.description || '',
            status: mappedReminders[0].status,
            timeUntil: calculateTimeUntil(mappedReminders[0].scheduledFor),
            reminders: mappedReminders
          }

          return mappedMed
        })
        .filter((med): med is Medication => med !== null)
        .sort((a, b) => {
          // Pega as datas completas dos próximos lembretes
          const reminderA = a.reminders[0]
          const reminderB = b.reminders[0]
          if (!reminderA || !reminderB) return 0

          const dateA = new Date(reminderA.scheduledFor)
          const dateB = new Date(reminderB.scheduledFor)

          // Compara as datas completas
          return dateA.getTime() - dateB.getTime()
        })

      // Separar medicamentos por status dos lembretes
      const lateMeds = mappedMedications.filter(med => 
        med.reminders.some(reminder => {
          const reminderDate = new Date(reminder.scheduledFor)
          return !reminder.taken && !reminder.skipped && reminderDate < toleranceTime
        })
      )

      const onTimeMeds = mappedMedications.filter(med =>
        med.reminders.some(reminder => {
          const reminderDate = new Date(reminder.scheduledFor)
          return !reminder.taken && !reminder.skipped && reminderDate >= toleranceTime
        })
      )

      // Agrupar medicamentos atrasados por horário
      const lateGroups: MedicationGroup[] = []
      lateMeds.forEach(med => {
        // Pega o primeiro lembrete atrasado
        const lateReminder = med.reminders.find(reminder => {
          const reminderDate = new Date(reminder.scheduledFor)
          return !reminder.taken && !reminder.skipped && reminderDate < toleranceTime
        })
        
        if (!lateReminder) return

        const existingGroup = lateGroups.find(group => group.time === lateReminder.time.split(' ')[0])
        if (existingGroup) {
          existingGroup.medications.push({
            ...med,
            status: 'late',
            time: lateReminder.time.split(' ')[0],
            timeUntil: calculateTimeUntil(lateReminder.scheduledFor)
          })
        } else {
          lateGroups.push({
            time: lateReminder.time.split(' ')[0],
            medications: [{
              ...med,
              status: 'late',
              time: lateReminder.time.split(' ')[0],
              timeUntil: calculateTimeUntil(lateReminder.scheduledFor)
            }]
          })
        }
      })

      // Agrupar medicamentos no horário
      const onTimeGroups: MedicationGroup[] = []
      onTimeMeds.forEach(med => {
        // Pega o próximo lembrete pendente
        const pendingReminder = med.reminders.find(reminder => {
          const reminderDate = new Date(reminder.scheduledFor)
          return !reminder.taken && !reminder.skipped && reminderDate >= toleranceTime
        })

        if (!pendingReminder) return

        const reminderDate = new Date(pendingReminder.scheduledFor)
        const reminderTime = reminderDate.toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        })

        // Se for amanhã e depois das 3:00, ignora
        if (!isSameDay(reminderDate, today)) {
          const [hours] = reminderTime.split(':').map(Number)
          if (hours > 3) return
        }

        // Cria uma chave única que combina data e hora
        const timeKey = `${reminderTime}${isSameDay(reminderDate, today) ? '' : '_tomorrow'}`
        
        const existingGroup = onTimeGroups.find(group => group.time === timeKey)
        if (existingGroup) {
          existingGroup.medications.push({
            ...med,
            status: 'pending',
            time: reminderTime,
            timeUntil: calculateTimeUntil(pendingReminder.scheduledFor)
          })
        } else {
          onTimeGroups.push({
            time: timeKey,
            medications: [{
              ...med,
              status: 'pending',
              time: reminderTime,
              timeUntil: calculateTimeUntil(pendingReminder.scheduledFor)
            }],
            timeUntil: calculateTimeUntil(pendingReminder.scheduledFor)
          })
        }
      })

      // Ordena os grupos por data/hora
      onTimeGroups.sort((a, b) => {
        const isATomorrow = a.time.includes('_tomorrow')
        const isBTomorrow = b.time.includes('_tomorrow')
        
        if (isATomorrow && !isBTomorrow) return 1
        if (!isATomorrow && isBTomorrow) return -1
        
        const timeA = a.time.split('_')[0].split(':').map(Number)
        const timeB = b.time.split('_')[0].split(':').map(Number)
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1])
      })

      // Remove o sufixo _tomorrow antes de exibir
      onTimeGroups.forEach(group => {
        group.time = group.time.split('_')[0]
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
      // Verifica se o medicamento é de hoje
      const medication = group.medications[0]
      if (!medication?.reminders[0]) return

      const reminderDate = new Date(medication.reminders[0].scheduledFor)
      const isToday = reminderDate.getDate() === now.getDate() &&
                     reminderDate.getMonth() === now.getMonth() &&
                     reminderDate.getFullYear() === now.getFullYear()

      // Se não for de hoje, verifica se é até 3:00 do próximo dia
      if (!isToday) {
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const isTomorrow = reminderDate.getDate() === tomorrow.getDate() &&
                          reminderDate.getMonth() === tomorrow.getMonth() &&
                          reminderDate.getFullYear() === tomorrow.getFullYear()

        if (!isTomorrow) return // Se não for nem hoje nem amanhã, ignora
        
        // Se for depois das 3:00, ignora
        const [hours] = group.time.split(':').map(Number)
        if (hours > 3) return
      }

      const [hours, minutes] = group.time.split(':').map(Number)
      const nextTime = new Date(now)
      nextTime.setHours(hours, minutes, 0, 0)

      // Se o horário já passou hoje, pula
      if (isToday && nextTime <= now) return

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

    // Se não encontrou nenhum medicamento para hoje, pega o primeiro de amanhã até 3:00
    if (!nextGroup) {
      const tomorrowGroup = groups.find(group => {
        const medication = group.medications[0]
        if (!medication?.reminders[0]) return false

        const reminderDate = new Date(medication.reminders[0].scheduledFor)
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const isTomorrow = reminderDate.getDate() === tomorrow.getDate() &&
                          reminderDate.getMonth() === tomorrow.getMonth() &&
                          reminderDate.getFullYear() === tomorrow.getFullYear()

        if (!isTomorrow) return false

        // Verifica se o horário é até 3:00
        const [hours] = group.time.split(':').map(Number)
        return hours <= 3
      })

      if (tomorrowGroup) {
        const medication = tomorrowGroup.medications[0]
        if (medication?.reminders[0]) {
          nextGroup = {
            ...tomorrowGroup,
            medications: tomorrowGroup.medications.map(med => ({
              ...med,
              timeUntil: calculateTimeUntil(med.reminders[0].scheduledFor)
            }))
          }
        }
      }
    }

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
  console.log(medicationGroups, "medicationGroups")

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