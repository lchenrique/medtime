import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const createReminderSchema = z.object({
  time: z.string(),
  frequency: z.enum(['6/6', '8/8', '12/12', '24/24']),
  daysOfWeek: z.array(z.number()),
  active: z.boolean()
})

export const create: FastifyPluginAsyncZod = async (app) => {
  app.post('/:medicationId/reminders', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['reminders'],
      description: 'Cria um novo lembrete para uma medicação',
      params: z.object({
        medicationId: z.string()
      }),
      body: createReminderSchema,
      response: {
        201: z.object({
          id: z.string(),
          medicationId: z.string(),
          scheduledFor: z.string(),
          taken: z.boolean(),
          skipped: z.boolean()
        }),
        404: z.object({
          code: z.string(),
          message: z.string()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { medicationId } = request.params as { medicationId: string }
    const { time, frequency, daysOfWeek, active } = request.body as z.infer<typeof createReminderSchema>

    const medication = await prisma.medication.findUnique({
      where: { id: medicationId }
    })

    if (!medication) {
      return reply.status(404).send({
        code: 'MEDICATION_NOT_FOUND',
        message: 'Medicação não encontrada'
      })
    }

    const reminder = await prisma.reminder.create({
      data: {
        medicationId,
        scheduledFor: new Date(), // TODO: Calcular baseado no time e frequency
        taken: false,
        skipped: false
      }
    })

    return reply.status(201).send(reminder)
  })
} 