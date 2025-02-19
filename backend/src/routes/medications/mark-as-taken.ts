import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { markReminderAsTaken } from '../../services/medication.service'

const markAsTakenSchema = z.object({
  reminderId: z.string(),
  scheduledFor: z.string().datetime(),
  taken: z.boolean()
})

type MarkAsTakenBody = z.infer<typeof markAsTakenSchema>

export const markAsTaken: FastifyPluginAsyncZod = async (app) => {
  app.put('/', {
    schema: {
      tags: ['medications'],
      description: 'Marca ou desmarca um medicamento como tomado',
      body: markAsTakenSchema,
      response: {
        200: z.object({
          id: z.string(),
          scheduledFor: z.string(),
          taken: z.boolean(),
          takenAt: z.string().nullable(),
          skipped: z.boolean(),
          skippedReason: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string()
        }),
        400: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { reminderId, scheduledFor, taken } = request.body as MarkAsTakenBody

    try {
      const reminder = await markReminderAsTaken(
        reminderId,
        new Date(scheduledFor),
        taken
      )

      return {
        ...reminder,
        scheduledFor: reminder.scheduledFor.toISOString(),
        takenAt: reminder.takenAt?.toISOString() || null,
        createdAt: reminder.createdAt.toISOString(),
        updatedAt: reminder.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Erro ao marcar medicamento como tomado:', error)
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error instanceof Error ? error.message : 'Erro ao marcar medicamento como tomado'
      })
    }
  })
} 