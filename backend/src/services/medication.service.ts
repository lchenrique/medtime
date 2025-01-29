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
export async function markReminderAsTaken(reminderId: string, scheduledFor: Date, taken: boolean) {
  console.log('Marcando medicamento como tomado:', { reminderId, scheduledFor, taken })
  
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      medication: true
    }
  })

  if (!reminder) {
    throw new Error('Lembrete não encontrado')
  }

  // Atualiza o lembrete e o estoque em uma transação
  const [updatedReminder] = await prisma.$transaction([
    // Atualiza o lembrete
    prisma.reminder.update({
      where: { id: reminderId },
      data: {
        taken,
        takenAt: taken ? new Date() : null,
        notified: true
      }
    }),
    // Atualiza a quantidade restante
    prisma.medication.update({
      where: { id: reminder.medicationId },
      data: {
        remainingQuantity: {
          [taken ? 'decrement' : 'increment']: reminder.medication.dosageQuantity
        }
      }
    })
  ])

  // Se for medicamento contínuo, verifica se precisa gerar mais lembretes
  if (reminder.medication.isRecurring) {
    const remindersNeededFor5Days = Math.ceil((5 * 24) / reminder.medication.interval)
    const futureReminders = await prisma.reminder.count({
      where: {
        medicationId: reminder.medicationId,
        scheduledFor: {
          gte: new Date()
        }
      }
    })

    if (futureReminders < remindersNeededFor5Days) {
      console.log('Gerando mais lembretes...')
      await generateRecurringReminders(reminder.medicationId)
      console.log('Lembretes gerados')
    }
  }

  return updatedReminder
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
  const thirtyDaysFromNow = addDays(now, 30)

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

  // Mantém a hora e minuto originais
  const baseHour = medication.startDate.getHours()
  const baseMinutes = medication.startDate.getMinutes()
  currentDate.setHours(baseHour, baseMinutes, 0, 0)

  while (currentDate <= thirtyDaysFromNow) {
    // Avança para o próximo horário usando addHours para manter consistência
    currentDate = addHours(currentDate, medication.interval)
    
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
          scheduledFor: new Date(currentDate),
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
      if (reminder.taken || reminder.skipped) return

      const scheduledFor = new Date(reminder.scheduledFor)
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

  // Agrupa os medicamentos por horário
  const groupedMedications = groupMedicationsByTime(medications)

  return {
    medications,
    groups: groupedMedications
  }
}

// Função para limpar reminders antigos
export async function cleanupOldReminders() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

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
      console.log(`🗄️ Movendo ${takenOrSkippedReminders.length} lembretes tomados/pulados para o histórico...`)
      
      await prisma.medicationLog.createMany({
        data: takenOrSkippedReminders.map(reminder => ({
          medicationId: reminder.medicationId,
          takenAt: reminder.takenAt || reminder.scheduledFor,
          skipped: reminder.skipped,
          skippedReason: reminder.skippedReason || undefined,
          notes: reminder.medication.isRecurring 
            ? `Lembrete contínuo ${reminder.id} arquivado`
            : `Lembrete ${reminder.id} arquivado`
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

      console.log('✅ Lembretes tomados/pulados movidos para o histórico')
    }

    // Depois, busca e move para histórico os lembretes não tomados/pulados de medicamentos contínuos
    const oldContinuousReminders = await prisma.reminder.findMany({
      where: {
        taken: false,
        skipped: false,
        scheduledFor: {
          lt: thirtyDaysAgo
        },
        medication: {
          isRecurring: true
        }
      },
      include: {
        medication: true
      }
    })

    if (oldContinuousReminders.length > 0) {
      console.log(`🗄️ Movendo ${oldContinuousReminders.length} lembretes contínuos antigos para o histórico...`)
      
      await prisma.medicationLog.createMany({
        data: oldContinuousReminders.map(reminder => ({
          medicationId: reminder.medicationId,
          takenAt: reminder.scheduledFor,
          skipped: true,
          skippedReason: 'Lembrete expirado',
          notes: `Lembrete contínuo ${reminder.id} expirado e arquivado automaticamente`
        })),
        skipDuplicates: true
      })

      // Deleta os lembretes antigos
      await prisma.reminder.deleteMany({
        where: {
          id: {
            in: oldContinuousReminders.map(r => r.id)
          }
        }
      })

      console.log('✅ Lembretes contínuos antigos movidos para o histórico')
    }

    // Por fim, limpa registros do histórico mais antigos que 3 meses
    const deletedLogs = await prisma.medicationLog.deleteMany({
      where: {
        takenAt: {
          lt: threeMonthsAgo
        }
      }
    })

    console.log(`🧹 Limpeza de histórico antigo concluída. ${deletedLogs.count} registros removidos.`)
  } catch (error) {
    console.error('Erro ao limpar reminders antigos:', error)
  }
} 