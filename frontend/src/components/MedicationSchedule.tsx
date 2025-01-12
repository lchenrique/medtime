import { cn } from "@/lib/utils"
import { format, isToday, addDays, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, CalendarDays, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Medication } from "../types/medication"
import { getGetMedicationsQueryKey, useGetMedicationsId, usePutMedicationsMarkAsTaken } from "@/api/generated/medications/medications"
import { useQueryClient } from "@tanstack/react-query"

interface ScheduleDay {
  date: Date
  slots: {
    id: string
    time: string
    taken: boolean
    skipped: boolean
    scheduledFor: string
  }[]
}

interface MedicationScheduleProps {
  medication: Medication
}

export function MedicationSchedule({ medication }: MedicationScheduleProps) {
  const queryClient = useQueryClient()
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()
  const [loadingSlots, setLoadingSlots] = useState<string[]>([])
  
  // Usar o useQuery para garantir que temos os dados mais atualizados
  const { data: medicationData } = useGetMedicationsId(medication.id)

  const handleMarkAsTaken = (reminderId: string, taken: boolean) => {
    setLoadingSlots(prev => [...prev, reminderId])

    markAsTaken({ 
      data: { 
        reminderId,
        taken
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/medications/${medication.id}`] })
        queryClient.invalidateQueries({ queryKey: getGetMedicationsQueryKey() })
        setLoadingSlots(prev => prev.filter(id => id !== reminderId))
      },
      onError: () => {
        setLoadingSlots(prev => prev.filter(id => id !== reminderId))
      }
    })
  }

  // Converte os reminders em dias com slots
  const convertRemindersToSchedule = (): ScheduleDay[] => {
    if (!medicationData?.reminders) {
      return []
    }

    const days = new Map<string, ScheduleDay>()
    
    medicationData.reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.scheduledFor)
      const dateKey = format(reminderDate, 'yyyy-MM-dd')
      
      const time = reminderDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      })

      if (!days.has(dateKey)) {
        days.set(dateKey, {
          date: reminderDate,
          slots: []
        })
      }

      const day = days.get(dateKey)!
      day.slots.push({
        id: reminder.id,
        time,
        taken: reminder.taken,
        skipped: reminder.skipped,
        scheduledFor: reminder.scheduledFor
      })

      // Ordenar os slots pelo horário completo (data + hora)
      day.slots.sort((a, b) => {
        const dateA = new Date(a.scheduledFor)
        const dateB = new Date(b.scheduledFor)
        return dateA.getTime() - dateB.getTime()
      })
    })

    // Ordenar os dias
    return Array.from(days.values()).sort((a, b) => 
      a.date.getTime() - b.date.getTime()
    )
  }

  const schedule = convertRemindersToSchedule()
  
  // Ajusta a data inicial para o fuso horário local
  const startDate = new Date(medication.startDate)
  
  const [selectedDate, setSelectedDate] = useState(startDate)
  const today = new Date()

  // Encontra a primeira e última data do schedule
  const firstDate = schedule[0]?.date || startDate
  const lastDate = schedule[schedule.length - 1]?.date || startDate

  // Gera os dias do schedule incluindo o dia atual
  const getDays = () => {
    if (schedule.length === 0) {
      return [startDate]
    }

    // Ordenar as datas do schedule
    const sortedDays = schedule.map(day => day.date).sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })
    
    // Pegar 5 dias a partir da data selecionada
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    const selectedIndex = sortedDays.findIndex(date => 
      format(new Date(date), 'yyyy-MM-dd') === selectedDateStr
    )
    
    const startIndex = Math.max(0, selectedIndex - 2)
    const endIndex = Math.min(sortedDays.length, startIndex + 5)
    
    const visibleDays = sortedDays.slice(startIndex, endIndex)
    
    return visibleDays.map(date => new Date(date))
  }

  const days = getDays()

  const formatWeekDay = (date: Date) => {
    return format(date, "EEE", { locale: ptBR })
  }

  const formatMonth = (date: Date) => {
    return format(date, "MMMM yyyy", { locale: ptBR })
  }

  const handleTodayClick = () => {
    setSelectedDate(today)
  }

  const canMarkTime = (date: Date, time: string) => {
    const now = new Date()
    const reminderDateTime = new Date(date)
    const [hours, minutes] = time.split(':').map(Number)
    reminderDateTime.setHours(hours, minutes, 0, 0)

    // Não pode marcar horários futuros
    return reminderDateTime <= now
  }

  // Função para verificar se tem dias anteriores disponíveis
  const hasPreviousDays = () => {
    const firstVisibleDate = days[0]
    const previousDate = subDays(firstVisibleDate, 1)
    return schedule.some(day => 
      format(day.date, 'yyyy-MM-dd') === format(previousDate, 'yyyy-MM-dd')
    )
  }

  // Função para verificar se tem próximos dias disponíveis
  const hasNextDays = () => {
    const lastVisibleDate = days[days.length - 1]
    const nextDate = addDays(lastVisibleDate, 1)
    return schedule.some(day => 
      format(day.date, 'yyyy-MM-dd') === format(nextDate, 'yyyy-MM-dd')
    )
  }

  // Função para verificar se todos os horários do dia foram tomados
  const isAllTakenForDate = (date: Date) => {
    const currentDay = schedule.find(d => {
      const scheduleDate = new Date(d.date)
      return (
        scheduleDate.getFullYear() === date.getFullYear() &&
        scheduleDate.getMonth() === date.getMonth() &&
        scheduleDate.getDate() === date.getDate()
      )
    })

    if (!currentDay || currentDay.slots.length === 0) return false
    return currentDay.slots.every(slot => slot.taken)
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho com mês */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-medium">{formatMonth(selectedDate)}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleTodayClick}
            title="Ir para hoje"
            disabled={!schedule.some(day => format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))}
          >
            <CalendarDays className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate(date => subDays(date, 1))}
            disabled={!hasPreviousDays()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setSelectedDate(date => addDays(date, 1))}
            disabled={!hasNextDays()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dias da semana */}
      <div className="flex gap-2">
        {days.map((date) => {
          const isSelected = date.getTime() === selectedDate.getTime()
          const isCurrentDay = isToday(date)
          const allTaken = isAllTakenForDate(date)

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={cn(
                "relative w-[72px] py-3 rounded-2xl text-center transition-colors",
                "border-2 border-transparent",
                isToday(date) && "bg-primary text-white",
                date.getTime() === selectedDate.getTime() && !isToday(date) && 
                  "bg-primary/5 border-primary text-primary",
                !isSelected && !isToday(date) && "bg-white hover:bg-primary/5"
              )}
            >
              <p className={cn(
                "text-xs font-medium mb-1",
                isToday(date) && "text-white/90",
                !isToday(date) && "text-muted-foreground"
              )}>
                {formatWeekDay(date)}
              </p>
              <p className={cn(
                "text-sm font-bold",
                isToday(date) && "text-white",
                date.getTime() === selectedDate.getTime() && !isToday(date) && "text-primary"
              )}>
                {format(date, "dd")}
              </p>
              
              {/* Indicador de todos tomados */}
              {allTaken && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Card de Horários */}
      <div className="bg-white p-4 rounded-2xl">
        <div className="grid grid-cols-3 gap-2">
          {(() => {
            const currentDay = schedule.find(d => {
              const scheduleDate = new Date(d.date)
              const selected = new Date(selectedDate)
              
              // Comparar apenas ano, mês e dia
              const sameDate = 
                scheduleDate.getFullYear() === selected.getFullYear() &&
                scheduleDate.getMonth() === selected.getMonth() &&
                scheduleDate.getDate() === selected.getDate()
              
              return sameDate
            })

            if (!currentDay) {
              return <p className="col-span-3 text-center text-muted-foreground">Nenhum horário para este dia</p>
            }

            const allTaken = currentDay.slots.every(slot => slot.taken)

            return (
              <>
                {allTaken && (
                  <div className="col-span-3 bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 mb-2">
                    <Check className="w-4 h-4" />
                    <p className="text-sm font-medium">Todos os horários deste dia foram tomados!</p>
                  </div>
                )}
                {currentDay.slots.map((slot) => {
                  const canMark = canMarkTime(selectedDate, slot.time)
                  const isLoading = loadingSlots.includes(slot.id)
                  return (
                    <button
                      key={slot.id}
                      onClick={() => {
                        if (!canMark || isLoading) return
                        handleMarkAsTaken(slot.id, !slot.taken)
                      }}
                      disabled={!canMark || isLoading}
                      className={cn(
                        "relative py-2 px-4 rounded-xl text-sm font-medium text-center transition-colors",
                        !canMark && "opacity-50 cursor-not-allowed",
                        canMark && !slot.taken && !isLoading && "hover:bg-primary/5",
                        slot.taken && "bg-green-100 text-green-700",
                        isLoading && "bg-primary/5"
                      )}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Marcando...</span>
                        </div>
                      ) : (
                        <>
                          {slot.time}
                          {slot.taken && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  )
                })}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
} 