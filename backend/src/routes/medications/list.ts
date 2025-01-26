import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { getMedicationsWithSchedules } from '../../services/medication.service'

// Schema para o reminder na listagem
const reminderSchema = z.object({
  id: z.string(),
  scheduledFor: z.string(),
  taken: z.boolean(),
  takenAt: z.string().nullable(),
  skipped: z.boolean(),
  skippedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

// Schema para a medicação na listagem
const medicationListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.string(),
  interval: z.number(),
  duration: z.number(),
  totalQuantity: z.number(),
  remainingQuantity: z.number(),
  unit: z.string(),
  dosageQuantity: z.number(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  reminders: z.array(reminderSchema),
})

export const list: FastifyPluginAsyncZod = async (app) => {
  app.get('/', {
    schema: {
      tags: ['medications'],
      description: 'Lista todos os medicamentos do usuário',
      response: {
        200: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          startDate: z.string(),
          duration: z.number().nullable(),
          interval: z.number(),
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
            updatedAt: z.string()
          }))
        }))
      },
    },
  }, async (request, reply) => {
    const { id: userId } = request.user

    try {
      const now = new Date()
      const thirtyDaysFromNow = new Date(now)
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const medications = await getMedicationsWithSchedules(userId, now, thirtyDaysFromNow)

      return medications.map(med => ({
        ...med,
        startDate: med.startDate.toISOString(),
        createdAt: med.createdAt.toISOString(),
        updatedAt: med.updatedAt.toISOString(),
        reminders: med.reminders.map(reminder => ({
          ...reminder,
          scheduledFor: reminder.scheduledFor.toISOString(),
          takenAt: reminder.takenAt?.toISOString() || null,
          createdAt: reminder.createdAt.toISOString(),
          updatedAt: reminder.updatedAt.toISOString()
        }))
      }))
    } catch (error) {
      console.error('Erro ao listar medicamentos:', error)
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao listar medicamentos'
      })
    }
  })
} 