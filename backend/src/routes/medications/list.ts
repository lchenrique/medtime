import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { getMedicationsWithSchedules } from '../../services/medication.service'
import { endOfDay, startOfDay } from 'date-fns'
import { Medication, Reminder } from '@prisma/client'

// Schema para os parâmetros de query
const querySchema = z.object({
  period: z.enum(['today', 'all']).default('all')
})

// Schema base para reminder
const reminderSchema = z.object({
  id: z.string(),
  scheduledFor: z.string(),
  taken: z.boolean(),
  takenAt: z.string().nullable(),
  skipped: z.boolean(),
  skippedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  medicationId: z.string(),
  notified: z.boolean()
})

// Schema base para medicação
const medicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.string(),
  interval: z.number(),
  duration: z.number().nullable(),
  isRecurring: z.boolean(),
  totalQuantity: z.number(),
  remainingQuantity: z.number(),
  unit: z.string(),
  dosageQuantity: z.number(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reminders: z.array(reminderSchema)
})

// Schema para grupo de medicações
const medicationGroupSchema = z.object({
  time: z.string(),
  medications: z.array(z.object({
    medication: medicationSchema,
    reminder: reminderSchema,
    isLate: z.boolean()
  }))
})

// Schema para a resposta completa
const responseSchema = z.union([
  // Schema para period=all
  z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    startDate: z.string(),
    interval: z.number(),
    duration: z.number().nullable(),
    isRecurring: z.boolean(),
    totalQuantity: z.number(),
    remainingQuantity: z.number(),
    unit: z.string(),
    dosageQuantity: z.number(),
    userId: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    reminders: z.array(z.object({
      id: z.string(),
      scheduledFor: z.string(),
      taken: z.boolean(),
      takenAt: z.string().nullable(),
      skipped: z.boolean(),
      skippedReason: z.string().nullable(),
      createdAt: z.string(),
      updatedAt: z.string(),
      medicationId: z.string(),
      notified: z.boolean()
    }))
  })),
  // Schema para period=today
  z.object({
    medications: z.array(medicationSchema),
    groups: z.object({
      late: z.array(medicationGroupSchema),
      onTime: z.array(medicationGroupSchema)
    })
  })
])

interface MedicationWithReminders extends Medication {
  reminders: Reminder[]
}

interface GetMedicationsResult {
  medications: MedicationWithReminders[]
  groups: {
    late: Array<{
      time: string
      medications: Array<{
        medication: MedicationWithReminders
        reminder: Reminder
        isLate: boolean
      }>
    }>
    onTime: Array<{
      time: string
      medications: Array<{
        medication: MedicationWithReminders
        reminder: Reminder
        isLate: boolean
      }>
    }>
  }
}

export const list: FastifyPluginAsyncZod = async (app) => {
  app.get('/', {
    schema: {
      tags: ['medications'],
      description: 'Lista todos os medicamentos do usuário',
      querystring: querySchema,
      response: {
        200: responseSchema
      },
    },
  }, async (request, reply) => {
    const { id: userId } = request.user
    const { period } = request.query as z.infer<typeof querySchema>

    try {
      const now = new Date()
      let endDate: Date

      // Define o período de busca baseado no parâmetro
      if (period === 'today') {
        endDate = endOfDay(now)
      } else {
        endDate = new Date(now)
        endDate.setDate(endDate.getDate() + 30) // 30 dias para 'all'
      }

      const startDate = period === 'today' ? startOfDay(now) : now
      const result = await getMedicationsWithSchedules(userId, startDate, endDate) as GetMedicationsResult

      // Se period=all, retorna apenas a lista de medicamentos
      if (period === 'all') {
        const medications = result.medications.map((med: MedicationWithReminders) => ({
          id: med.id,
          name: med.name,
          description: med.description,
          startDate: med.startDate.toISOString(),
          interval: med.interval,
          duration: med.duration,
          isRecurring: med.duration === null,
          totalQuantity: med.totalQuantity,
          remainingQuantity: med.remainingQuantity,
          unit: med.unit,
          dosageQuantity: med.dosageQuantity,
          userId: med.userId,
          createdAt: med.createdAt.toISOString(),
          updatedAt: med.updatedAt.toISOString(),
          reminders: med.reminders.map((reminder: Reminder) => {
            // Se for um lembrete virtual, extrair o medicationId do ID
            const medicationId = reminder.medicationId || 
              (reminder.id.startsWith('virtual_') ? reminder.id.split('_')[1] : med.id)

            return {
              id: reminder.id,
              scheduledFor: reminder.scheduledFor.toISOString(),
              taken: reminder.taken || false,
              takenAt: reminder.takenAt?.toISOString() || null,
              skipped: reminder.skipped || false,
              skippedReason: reminder.skippedReason || null,
              createdAt: reminder.createdAt.toISOString(),
              updatedAt: reminder.updatedAt.toISOString(),
              medicationId,
              notified: reminder.notified || false
            }
          })
        }))

        console.log('Retornando medications para period=all:', JSON.stringify(medications, null, 2))
        return medications
      }

      // Se period=today, retorna com os grupos
      const groupedResponse = {
        medications: result.medications.map((med: MedicationWithReminders) => ({
          id: med.id,
          name: med.name,
          description: med.description,
          startDate: med.startDate.toISOString(),
          interval: med.interval,
          duration: med.duration,
          isRecurring: med.duration === null,
          totalQuantity: med.totalQuantity,
          remainingQuantity: med.remainingQuantity,
          unit: med.unit,
          dosageQuantity: med.dosageQuantity,
          userId: med.userId,
          createdAt: med.createdAt.toISOString(),
          updatedAt: med.updatedAt.toISOString(),
          reminders: med.reminders.map((reminder: Reminder) => ({
            id: reminder.id,
            scheduledFor: reminder.scheduledFor.toISOString(),
            taken: reminder.taken || false,
            takenAt: reminder.takenAt?.toISOString() || null,
            skipped: reminder.skipped || false,
            skippedReason: reminder.skippedReason || null,
            createdAt: reminder.createdAt.toISOString(),
            updatedAt: reminder.updatedAt.toISOString(),
            medicationId: reminder.medicationId,
            notified: reminder.notified || false
          }))
        })),
        groups: {
          late: result.groups.late.map(group => ({
            time: group.time,
            medications: group.medications.map(item => ({
              medication: {
                id: item.medication.id,
                name: item.medication.name,
                description: item.medication.description,
                startDate: item.medication.startDate.toISOString(),
                interval: item.medication.interval,
                duration: item.medication.duration,
                isRecurring: item.medication.duration === null,
                totalQuantity: item.medication.totalQuantity,
                remainingQuantity: item.medication.remainingQuantity,
                unit: item.medication.unit,
                dosageQuantity: item.medication.dosageQuantity,
                userId: item.medication.userId,
                createdAt: item.medication.createdAt.toISOString(),
                updatedAt: item.medication.updatedAt.toISOString(),
                reminders: item.medication.reminders.map(reminder => ({
                  id: reminder.id,
                  scheduledFor: reminder.scheduledFor.toISOString(),
                  taken: reminder.taken || false,
                  takenAt: reminder.takenAt?.toISOString() || null,
                  skipped: reminder.skipped || false,
                  skippedReason: reminder.skippedReason || null,
                  createdAt: reminder.createdAt.toISOString(),
                  updatedAt: reminder.updatedAt.toISOString(),
                  medicationId: reminder.medicationId,
                  notified: reminder.notified || false
                }))
              },
              reminder: {
                id: item.reminder.id,
                scheduledFor: item.reminder.scheduledFor.toISOString(),
                taken: item.reminder.taken || false,
                takenAt: item.reminder.takenAt?.toISOString() || null,
                skipped: item.reminder.skipped || false,
                skippedReason: item.reminder.skippedReason || null,
                createdAt: item.reminder.createdAt.toISOString(),
                updatedAt: item.reminder.updatedAt.toISOString(),
                medicationId: item.reminder.medicationId,
                notified: item.reminder.notified || false
              },
              isLate: item.isLate
            }))
          })),
          onTime: result.groups.onTime.map(group => ({
            time: group.time,
            medications: group.medications.map(item => ({
              medication: {
                id: item.medication.id,
                name: item.medication.name,
                description: item.medication.description,
                startDate: item.medication.startDate.toISOString(),
                interval: item.medication.interval,
                duration: item.medication.duration,
                isRecurring: item.medication.duration === null,
                totalQuantity: item.medication.totalQuantity,
                remainingQuantity: item.medication.remainingQuantity,
                unit: item.medication.unit,
                dosageQuantity: item.medication.dosageQuantity,
                userId: item.medication.userId,
                createdAt: item.medication.createdAt.toISOString(),
                updatedAt: item.medication.updatedAt.toISOString(),
                reminders: item.medication.reminders.map(reminder => ({
                  id: reminder.id,
                  scheduledFor: reminder.scheduledFor.toISOString(),
                  taken: reminder.taken || false,
                  takenAt: reminder.takenAt?.toISOString() || null,
                  skipped: reminder.skipped || false,
                  skippedReason: reminder.skippedReason || null,
                  createdAt: reminder.createdAt.toISOString(),
                  updatedAt: reminder.updatedAt.toISOString(),
                  medicationId: reminder.medicationId,
                  notified: reminder.notified || false
                }))
              },
              reminder: {
                id: item.reminder.id,
                scheduledFor: item.reminder.scheduledFor.toISOString(),
                taken: item.reminder.taken || false,
                takenAt: item.reminder.takenAt?.toISOString() || null,
                skipped: item.reminder.skipped || false,
                skippedReason: item.reminder.skippedReason || null,
                createdAt: item.reminder.createdAt.toISOString(),
                updatedAt: item.reminder.updatedAt.toISOString(),
                medicationId: item.reminder.medicationId,
                notified: item.reminder.notified || false
              },
              isLate: item.isLate
            }))
          }))
        }
      }

      return groupedResponse
    } catch (error) {
      console.error('Erro ao listar medicamentos:', error)
      throw error
    }
  })
} 