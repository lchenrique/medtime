import { addDays, addHours, endOfDay, isAfter, isBefore, startOfDay } from 'date-fns'

interface CalculateSchedulesOptions {
  startFrom?: Date
  limit?: number
}

interface Medication {
  id: string
  startTime: string
  interval: string
  isRecurring: boolean
}

interface Schedule {
  id: string
  scheduledFor: Date
  taken: boolean
  takenAt: Date | null
  skipped: boolean
  skippedReason: string | null
  createdAt: Date
  updatedAt: Date
}

export function calculateNextSchedules(medication: Medication, options: CalculateSchedulesOptions = {}): Schedule[] {
  const { startFrom = new Date(), limit = 5 } = options
  const schedules: Schedule[] = []
  
  // Se não for recorrente, retorna array vazio
  if (!medication.isRecurring) {
    return schedules
  }

  // Extrai o intervalo em horas do formato "X/X"
  const interval = parseInt(medication.interval.split('/')[0])
  
  // Calcula os próximos horários a partir da data inicial
  let currentDate = startOfDay(startFrom)
  let currentTime = new Date(medication.startTime)
  
  // Ajusta o horário inicial para a data atual
  currentTime.setFullYear(currentDate.getFullYear())
  currentTime.setMonth(currentDate.getMonth())
  currentTime.setDate(currentDate.getDate())
  
  // Se o horário inicial já passou, avança para o próximo
  while (isBefore(currentTime, startFrom)) {
    currentTime = addHours(currentTime, interval)
  }
  
  // Gera os próximos horários até atingir o limite
  while (schedules.length < limit) {
    // Se passou da meia noite, avança para o próximo dia
    if (isAfter(currentTime, endOfDay(currentDate))) {
      currentDate = addDays(currentDate, 1)
      currentTime = new Date(medication.startTime)
      currentTime.setFullYear(currentDate.getFullYear())
      currentTime.setMonth(currentDate.getMonth())
      currentTime.setDate(currentDate.getDate())
    }
    
    schedules.push({
      id: `${medication.id}_${currentTime.getTime()}`,
      scheduledFor: currentTime,
      taken: false,
      takenAt: null,
      skipped: false,
      skippedReason: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    currentTime = addHours(currentTime, interval)
  }
  
  return schedules
} 