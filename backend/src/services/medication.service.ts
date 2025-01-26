import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { addDays, addHours, addMinutes, endOfDay, isAfter, isBefore, startOfDay } from 'date-fns'

interface CreateMedicationParams {
  name: string
  description: string | null
  startDate: Date
  duration: number
  interval: number
  userId: string
  totalQuantity: number
  remainingQuantity: number
  unit: string
  dosageQuantity: number
}

// Função auxiliar para gerar os horários dos lembretes
function generateReminders(startDate: Date, durationInDays: number, intervalHours: number): Prisma.ReminderCreateWithoutMedicationInput[] {
  const reminders: Prisma.ReminderCreateWithoutMedicationInput[] = []
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + durationInDays)

  let currentDate = new Date(startDate)
  while (currentDate < endDate) {
    reminders.push({
      scheduledFor: new Date(currentDate)
    })
    currentDate.setHours(currentDate.getHours() + intervalHours)
  }

  return reminders
}

export async function createMedicationWithReminders(params: CreateMedicationParams) {
  const { 
    name, 
    description, 
    startDate, 
    duration, 
    interval, 
    userId,
    totalQuantity,
    remainingQuantity,
    unit,
    dosageQuantity
  } = params

  // Verifica se já existe uma medicação igual
  const existingMedication = await prisma.medication.findFirst({
    where: {
      name,
      userId,
      startDate,
      duration,
      interval
    }
  })

  if (existingMedication) {
    throw new Error('Já existe uma medicação igual cadastrada')
  }

  // Cria a medicação com os lembretes
  const data: Prisma.MedicationUncheckedCreateInput = {
    name,
    description,
    startDate,
    duration,
    interval,
    userId,
    totalQuantity,
    remainingQuantity,
    unit,
    dosageQuantity,
    reminders: {
      create: generateReminders(startDate, duration, interval)
    }
  }

  return await prisma.medication.create({
    data,
    include: {
      reminders: true
    }
  })
}

// Funções para marcar status dos lembretes
export async function markReminderAsTaken(reminderId: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      medication: true
    }
  })

  if (!reminder) {
    throw new Error('Lembrete não encontrado')
  }

  // Atualiza o lembrete e cria o log em uma transação
  return await prisma.$transaction([
    // Marca o lembrete como tomado
    prisma.reminder.update({
      where: { id: reminderId },
      data: {
        taken: true,
        takenAt: new Date()
      }
    }),
    // Atualiza a quantidade restante
    prisma.medication.update({
      where: { id: reminder.medicationId },
      data: {
        remainingQuantity: {
          decrement: reminder.medication.dosageQuantity
        }
      }
    }),
    // Cria o log
    prisma.medicationLog.create({
      data: {
        medicationId: reminder.medicationId,
        takenAt: new Date(),
        skipped: false
      }
    })
  ])
}

export async function skipReminder(reminderId: string, reason: string) {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId }
  })

  if (!reminder) {
    throw new Error('Lembrete não encontrado')
  }

  // Atualiza o lembrete e cria o log em uma transação
  return await prisma.$transaction([
    prisma.reminder.update({
      where: { id: reminderId },
      data: {
        skipped: true,
        skippedReason: reason
      }
    }),
    prisma.medicationLog.create({
      data: {
        medicationId: reminder.medicationId,
        skipped: true,
        notes: reason
      }
    })
  ])
}

// Função para gerar lembretes para os próximos 30 dias
export async function generateRecurringReminders(medicationId: string) {
  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    include: {
      reminders: {
        orderBy: {
          scheduledFor: 'desc'
        },
        take: 1
      }
    }
  })

  if (!medication || !medication.isRecurring) return

  const now = new Date()
  const thirtyDaysFromNow = new Date(now)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  // Pega o último lembrete ou a data de início
  const lastScheduledDate = medication.reminders[0]
    ? new Date(medication.reminders[0].scheduledFor)
    : new Date(medication.startDate)

  // Gera novos lembretes
  const newReminders = []
  let currentDate = new Date(lastScheduledDate)

  while (currentDate <= thirtyDaysFromNow) {
    currentDate = new Date(currentDate.getTime() + medication.interval * 60 * 60 * 1000)
    
    if (currentDate <= thirtyDaysFromNow) {
      newReminders.push({
        medicationId: medication.id,
        scheduledFor: currentDate,
        taken: false,
        skipped: false
      })
    }
  }

  if (newReminders.length > 0) {
    await prisma.reminder.createMany({
      data: newReminders
    })
  }
}

// Função para verificar e gerar lembretes quando necessário
export async function checkAndGenerateReminders(userId: string) {
  const medications = await prisma.medication.findMany({
    where: {
      userId,
      isRecurring: true
    },
    include: {
      reminders: {
        where: {
          scheduledFor: {
            gte: new Date()
          }
        },
        orderBy: {
          scheduledFor: 'asc'
        }
      }
    }
  })

  // Para cada medicamento recorrente, verifica se precisa gerar mais lembretes
  for (const medication of medications) {
    // Calcula quantos lembretes são necessários para 6 dias baseado no intervalo
    const remindersNeededFor6Days = Math.ceil((6 * 24) / medication.interval)
    
    if (medication.reminders.length < remindersNeededFor6Days) {
      await generateRecurringReminders(medication.id)
    }
  }
}

interface CalculateSchedulesOptions {
  startFrom?: Date
  limit?: number
}

export function calculateNextSchedules(medication: any, options: CalculateSchedulesOptions = {}) {
  const { startFrom = new Date(), limit = 24 } = options
  const schedules: {
    id: string;
    scheduledFor: Date;
    taken: boolean;
    takenAt: Date | null;
    skipped: boolean;
    skippedReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[] = []
  
  // Se não for recorrente ou não tiver intervalo, retorna array vazio
  if (!medication.isRecurring || !medication.interval) {
    return schedules
  }

  // Pega a hora inicial do medicamento
  const startTime = new Date(medication.startDate)
  const baseHour = startTime.getHours()
  const baseMinutes = startTime.getMinutes()
  
  // Começa da data de início do medicamento se for depois da data atual
  let currentTime = isAfter(startTime, startFrom) 
    ? new Date(startTime) 
    : new Date(startFrom)
  
  currentTime.setHours(baseHour, baseMinutes, 0, 0)
  
  // Se o horário inicial já passou hoje, avança para o próximo horário
  if (isBefore(currentTime, startFrom)) {
    while (isBefore(currentTime, startFrom)) {
      currentTime = addHours(currentTime, medication.interval)
    }
  }

  // Calcula a data final (6 dias a partir de agora para manter 5 dias à frente)
  const endDate = addDays(startFrom, 6)

  // Gera os próximos horários até atingir 6 dias completos
  while (currentTime < endDate) {
    // Só adiciona horários após a data de início do medicamento
    if (!isBefore(currentTime, startTime)) {
      schedules.push({
        id: `virtual_${medication.id}_${currentTime.getTime()}`,
        scheduledFor: new Date(currentTime),
        taken: false,
        takenAt: null,
        skipped: false,
        skippedReason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    // Avança para o próximo horário baseado no intervalo
    currentTime = addHours(currentTime, medication.interval)
  }

  // Garante que temos pelo menos 18 horários (6 dias com intervalo de 8 horas)
  const minimumSlots = Math.ceil((6 * 24) / medication.interval)
  while (schedules.length < minimumSlots) {
    schedules.push({
      id: `virtual_${medication.id}_${currentTime.getTime()}`,
      scheduledFor: new Date(currentTime),
      taken: false,
      takenAt: null,
      skipped: false,
      skippedReason: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    currentTime = addHours(currentTime, medication.interval)
  }
  
  return schedules
}

// Função para buscar medicamentos com seus próximos horários
export async function getMedicationsWithSchedules(userId: string, startDate: Date, endDate: Date) {
  // Busca todos os medicamentos do usuário com reminders do dia atual
  const medications = await prisma.medication.findMany({
    where: { userId },
    include: {
      reminders: {
        where: {
          scheduledFor: {
            gte: startOfDay(startDate),
            lte: endDate
          }
        }
      }
    }
  })
  
  // Para cada medicamento, adiciona os horários calculados se for recorrente
  return medications.map(medication => {
    if (medication.isRecurring) {
      // Usa a data de início do medicamento se for depois do início do dia
      const scheduleStartDate = isAfter(medication.startDate, startOfDay(startDate)) 
        ? medication.startDate 
        : startOfDay(startDate)
      
      const schedules = calculateNextSchedules(medication, {
        startFrom: scheduleStartDate,
        limit: 100 // Limite alto para pegar todos os horários do período
      }).filter(schedule => 
        isAfter(schedule.scheduledFor, scheduleStartDate) && 
        isBefore(schedule.scheduledFor, endDate)
      )
      
      return {
        ...medication,
        reminders: [...medication.reminders, ...schedules]
      }
    }
    
    return medication
  })
}

// Função para marcar um lembrete virtual como tomado
export async function markVirtualReminderAsTaken(medicationId: string, scheduledFor: Date, taken: boolean) {
  // Busca o medicamento
  const medication = await prisma.medication.findUnique({
    where: { id: medicationId },
    include: {
      reminders: {
        where: {
          scheduledFor: {
            gte: new Date()
          }
        },
        orderBy: {
          scheduledFor: 'asc'
        }
      }
    }
  })
  
  if (!medication) {
    throw new Error('Medicamento não encontrado')
  }
  
  // Cria um registro físico do lembrete
  const reminder = await prisma.reminder.create({
    data: {
      medicationId,
      scheduledFor,
      taken,
      takenAt: taken ? new Date() : null,
      notified: true
    }
  })
  
  // Atualiza o estoque se foi marcado como tomado
  if (taken) {
    await prisma.medication.update({
      where: { id: medicationId },
      data: {
        remainingQuantity: {
          decrement: medication.dosageQuantity
        }
      }
    })
  }

  // Verifica se precisa gerar mais lembretes para manter 5 dias preenchidos
  const remindersNeededFor5Days = Math.ceil((5 * 24) / medication.interval)
  if (medication.reminders.length < remindersNeededFor5Days) {
    await generateRecurringReminders(medicationId)
  }
  
  return reminder
} 