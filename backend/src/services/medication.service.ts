import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

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