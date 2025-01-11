import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

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
      description: 'Lista todas as medicações do usuário',
      response: {
        200: z.array(medicationListSchema),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
  }, async (request) => {
    const { id: userId } = request.user

    const medications = await prisma.medication.findMany({
      where: { userId },
      include: {
        reminders: {
          orderBy: { scheduledFor: 'asc' },
        },
      },
    })

    // Converter todas as datas para string ISO
    return medications.map(med => ({
      ...med,
      startDate: med.startDate.toISOString(),
      createdAt: med.createdAt.toISOString(),
      updatedAt: med.updatedAt.toISOString(),
      reminders: med.reminders.map(rem => ({
        ...rem,
        scheduledFor: rem.scheduledFor.toISOString(),
        takenAt: rem.takenAt?.toISOString() || null,
        createdAt: rem.createdAt.toISOString(),
        updatedAt: rem.updatedAt.toISOString(),
      })),
    }))
  })
} 