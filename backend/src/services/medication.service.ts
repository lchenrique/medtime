import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { addDays, addHours, addMinutes, endOfDay, isAfter, isBefore, startOfDay, getHours, getMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

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
  const endDate = addDays(startDate, durationInDays)

  // Pega a hora e minuto base do horário inicial
  const baseHour = startDate.getHours()
  const baseMinutes = startDate.getMinutes()

  let currentDate = new Date(startDate)
  while (currentDate < endDate) {
    // Garante que estamos usando a hora e minuto base
    currentDate.setMinutes(baseMinutes)
    currentDate.setSeconds(0)
    currentDate.setMilliseconds(0)

    reminders.push({
      scheduledFor: new Date(currentDate)
    })

    // Avança para o próximo horário mantendo os minutos originais
    currentDate = addHours(currentDate, intervalHours)
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
  let lastScheduledDate = medication.reminders[0]
    ? new Date(medication.reminders[0].scheduledFor)
    : new Date(medication.startDate)

  // Se o último lembrete é muito antigo, começa do agora
  if (lastScheduledDate < now) {
    lastScheduledDate = now
  }

  // Gera novos lembretes
  const newReminders = []
  let currentDate = new Date(lastScheduledDate)

  // Intervalo em milissegundos
  const intervalMs = medication.interval * 60 * 60 * 1000

  while (currentDate <= thirtyDaysFromNow) {
    // Avança para o próximo horário
    currentDate = new Date(currentDate.getTime() + intervalMs)
    
    if (currentDate <= thirtyDaysFromNow) {
      // Verifica se já existe um lembrete neste horário
      const existingReminder = await prisma.reminder.findFirst({
        where: {
          medicationId: medication.id,
          scheduledFor: currentDate
        }
      })

      // Só cria se não existir
      if (!existingReminder) {
        newReminders.push({
          medicationId: medication.id,
          scheduledFor: currentDate,
          taken: false,
          skipped: false,
          notified: false
        })
      }
    }
  }

  if (newReminders.length > 0) {
    console.log(`Gerando ${newReminders.length} novos lembretes para ${medication.name}`)
    await prisma.reminder.createMany({
      data: newReminders,
      skipDuplicates: true // Garante que não haverá duplicatas
    })
  }

  return newReminders
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
  timezone?: string
}

export function calculateNextSchedules(medication: any, options: CalculateSchedulesOptions = {}) {
  const { startFrom = new Date(), limit = 24, timezone = 'America/Sao_Paulo' } = options
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

  // Converte as datas para o timezone do usuário
  const userStartFrom = toZonedTime(startFrom, timezone)
  const userStartTime = toZonedTime(medication.startDate, timezone)
  
  // Pega a hora e minuto base do medicamento
  const baseHour = getHours(userStartTime)
  const baseMinutes = getMinutes(userStartTime)
  
  // Começa da data de início do medicamento se for depois da data atual
  let currentTime = isAfter(userStartTime, userStartFrom) 
    ? new Date(userStartTime) 
    : new Date(userStartFrom)
  
  // Ajusta para a hora/minuto base
  currentTime.setHours(baseHour, baseMinutes, 0, 0)
  
  // Se o horário inicial já passou hoje, avança para o próximo horário
  if (isBefore(currentTime, userStartFrom)) {
    while (isBefore(currentTime, userStartFrom)) {
      currentTime = addHours(currentTime, medication.interval)
    }
  }

  // Calcula a data final (6 dias a partir de agora para manter 5 dias à frente)
  const endDate = addDays(userStartFrom, 6)

  // Gera os próximos horários até atingir 6 dias completos
  while (currentTime < endDate) {
    // Só adiciona horários após a data de início do medicamento
    if (!isBefore(currentTime, userStartTime)) {
      // Garante que mantemos os minutos originais
      currentTime.setMinutes(baseMinutes)
      currentTime.setSeconds(0)
      currentTime.setMilliseconds(0)
      
      // Converte para UTC antes de salvar
      const utcScheduledFor = toZonedTime(currentTime, 'UTC')
      
      schedules.push({
        id: `virtual_${medication.id}_${utcScheduledFor.getTime()}`,
        scheduledFor: utcScheduledFor,
        taken: false,
        takenAt: null,
        skipped: false,
        skippedReason: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    
    // Avança para o próximo horário usando addHours para manter consistência
    currentTime = addHours(currentTime, medication.interval)
  }

  return schedules
}

interface MedicationGroup {
  time: string
  medications: Array<{
    medication: any
    reminder: any
    isLate: boolean
  }>
}

// Função auxiliar para agrupar medicamentos por horário
function groupMedicationsByTime(medications: any[]): { late: MedicationGroup[], onTime: MedicationGroup[] } {
  const now = new Date()
  const groups: { [key: string]: any[] } = {}
  const lateGroups: { [key: string]: any[] } = {}

  medications.forEach(med => {
    med.reminders.forEach((reminder: any) => {
      const scheduledFor = new Date(reminder.scheduledFor)
      if (reminder.taken || reminder.skipped) return

      const timeKey = scheduledFor.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })

      const isLate = scheduledFor < now

      const groupData = {
        medication: med,
        reminder,
        isLate
      }

      if (isLate) {
        lateGroups[timeKey] = lateGroups[timeKey] || []
        lateGroups[timeKey].push(groupData)
      } else {
        groups[timeKey] = groups[timeKey] || []
        groups[timeKey].push(groupData)
      }
    })
  })

  const sortedLate = Object.entries(lateGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, medications]) => ({ time, medications }))

  const sortedOnTime = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, medications]) => ({ time, medications }))

  return {
    late: sortedLate,
    onTime: sortedOnTime
  }
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
          },
          OR: [
            { taken: false },
            { skipped: false }
          ]
        },
        orderBy: {
          scheduledFor: 'asc'
        }
      }
    }
  })
  
  // Para cada medicamento, adiciona os horários calculados se for recorrente
  const medicationsWithSchedules = medications.map(medication => {
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

  // Agrupa os medicamentos por horário
  const groupedMedications = groupMedicationsByTime(medicationsWithSchedules)

  return {
    medications: medicationsWithSchedules,
    groups: groupedMedications
  }
}

// Função para marcar um lembrete virtual como tomado
export async function markVirtualReminderAsTaken(reminderId: string, scheduledFor: Date, taken: boolean) {
  console.log('Marcando medicamento como tomado:', { reminderId, scheduledFor, taken })
  
  // Primeiro tenta buscar o reminder se for um ID direto
  let medicationId = reminderId;
  if (!reminderId.includes('_')) {
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId }
    });
    
    if (reminder) {
      medicationId = reminder.medicationId;
    }
  } else {
    // Se for um ID virtual, extrai o ID do medicamento
    const [, id] = reminderId.split('_');
    medicationId = id;
  }
  
  console.log('ID do medicamento:', medicationId);
  
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
  
  console.log('Medicamento encontrado:', medication)
  
  if (!medication) {
    console.error('Medicamento não encontrado com ID:', medicationId)
    throw new Error(`Medicamento não encontrado com ID: ${medicationId}`)
  }

  let reminder;

  // Tratamento diferente para medicamentos recorrentes e não recorrentes
  if (medication.isRecurring) {
    // Para medicamentos recorrentes, verifica se já existe um reminder para este horário
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        medicationId,
        scheduledFor: {
          gte: startOfDay(scheduledFor),
          lte: endOfDay(scheduledFor)
        }
      }
    });

    if (existingReminder) {
      // Atualiza o reminder existente
      console.log('Atualizando reminder existente (recorrente):', existingReminder.id);
      reminder = await prisma.reminder.update({
        where: { id: existingReminder.id },
        data: {
          taken,
          takenAt: taken ? new Date() : null,
          notified: true
        }
      });
    } else {
      // Cria um novo reminder apenas se não existir
      console.log('Criando novo registro do lembrete (recorrente)...')
      reminder = await prisma.reminder.create({
        data: {
          medicationId,
          scheduledFor,
          taken,
          takenAt: taken ? new Date() : null,
          notified: true
        }
      });
    }
  } else {
    // Para medicamentos não recorrentes, busca o reminder exato pelo horário
    const existingReminder = await prisma.reminder.findFirst({
      where: {
        medicationId,
        scheduledFor: scheduledFor // Busca pelo horário exato
      }
    });

    if (!existingReminder) {
      throw new Error('Lembrete não encontrado para este medicamento não recorrente');
    }

    // Atualiza o reminder existente
    console.log('Atualizando reminder não recorrente:', existingReminder.id);
    reminder = await prisma.reminder.update({
      where: { id: existingReminder.id },
      data: {
        taken,
        takenAt: taken ? new Date() : null,
        notified: true
      }
    });
  }
  
  console.log('Lembrete processado:', reminder)
  
  // Atualiza o estoque se foi marcado como tomado
  if (taken) {
    console.log('Atualizando estoque...')
    await prisma.medication.update({
      where: { id: medicationId },
      data: {
        remainingQuantity: {
          decrement: medication.dosageQuantity
        }
      }
    })
    console.log('Estoque atualizado')
  }

  // Verifica se precisa gerar mais lembretes APENAS para medicamentos recorrentes
  if (medication.isRecurring) {
    const remindersNeededFor5Days = Math.ceil((5 * 24) / medication.interval)
    if (medication.reminders.length < remindersNeededFor5Days) {
      console.log('Gerando mais lembretes...')
      await generateRecurringReminders(medicationId)
      console.log('Lembretes gerados')
    }
  }
  
  return reminder
}

// Função para limpar reminders antigos
export async function cleanupOldReminders() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  try {
    // Primeiro, move reminders tomados/pulados para o histórico
    const takenOrSkippedReminders = await prisma.reminder.findMany({
      where: {
        OR: [
          { taken: true },
          { skipped: true }
        ],
        scheduledFor: {
          lt: thirtyDaysAgo
        }
      },
      include: {
        medication: true
      }
    })

    // Cria registros de histórico para cada reminder
    if (takenOrSkippedReminders.length > 0) {
      await prisma.medicationLog.createMany({
        data: takenOrSkippedReminders.map(reminder => ({
          medicationId: reminder.medicationId,
          takenAt: reminder.takenAt || reminder.scheduledFor, // Usa scheduledFor como fallback
          skipped: reminder.skipped,
          skippedReason: reminder.skippedReason || undefined,
          notes: `Reminder ${reminder.id} movido para histórico`
        })),
        skipDuplicates: true
      })

      // Deleta os reminders que foram movidos para o histórico
      await prisma.reminder.deleteMany({
        where: {
          id: {
            in: takenOrSkippedReminders.map(r => r.id)
          }
        }
      })
    }

    // Depois, limpa reminders não tomados/pulados mais antigos que 30 dias
    await prisma.reminder.deleteMany({
      where: {
        taken: false,
        skipped: false,
        scheduledFor: {
          lt: thirtyDaysAgo
        }
      }
    })

    // Limpa registros do histórico mais antigos que 6 meses
    await prisma.medicationLog.deleteMany({
      where: {
        takenAt: {
          lt: sixMonthsAgo
        }
      }
    })

    console.log('Limpeza de reminders e histórico antigos concluída')
  } catch (error) {
    console.error('Erro ao limpar reminders antigos:', error)
  }
} 