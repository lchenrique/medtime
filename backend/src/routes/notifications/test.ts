import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { addSeconds } from 'date-fns'

const testSchema = z.object({
  seconds: z.number().int().min(5).default(10),
  title: z.string().default('Teste de Notificação'),
  body: z.string().default('Esta é uma notificação de teste!')
})

export const testNotification: FastifyPluginAsync = async (app) => {
  app.post('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['notifications'],
      description: 'Cria uma notificação de teste',
      body: testSchema,
      response: {
        200: z.object({
          success: z.boolean(),
          scheduledFor: z.string(),
          reminder: z.object({
            id: z.string(),
            scheduledFor: z.string(),
            medication: z.object({
              id: z.string(),
              name: z.string(),
              dosageQuantity: z.number(),
              unit: z.string()
            })
          })
        })
      }
    }
  }, async (request) => {
    const { id: userId } = request.user
    const { seconds, title, body } = testSchema.parse(request.body)

    // Cria um medicamento de teste
    const medication = await prisma.medication.create({
      data: {
        name: title,
        description: body,
        startDate: new Date(),
        interval: 24,
        duration: 1,
        totalQuantity: 1,
        remainingQuantity: 1,
        unit: 'comprimido',
        dosageQuantity: 1,
        userId
      }
    })

    // Cria um lembrete para alguns segundos no futuro
    const scheduledFor = addSeconds(new Date(), seconds)
    const reminder = await prisma.reminder.create({
      data: {
        medicationId: medication.id,
        scheduledFor,
        taken: false,
        skipped: false
      }
    })

    return {
      success: true,
      scheduledFor: scheduledFor.toISOString(),
      reminder: {
        id: reminder.id,
        scheduledFor: reminder.scheduledFor.toISOString(),
        medication: {
          id: medication.id,
          name: medication.name,
          dosageQuantity: medication.dosageQuantity,
          unit: medication.unit
        }
      }
    }
  })
} 