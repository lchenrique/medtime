import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { reminderSchema, createReminderSchema } from '../../schemas/reminder'
import { TypedRequest } from '../../types/fastify'
import { z } from 'zod'

export const create: FastifyPluginAsyncZod = async (app) => {
  app.post('/:medicationId/reminders', {
    schema: {
      tags: ['reminders'],
      description: 'Cria um novo lembrete para uma medicação',
      params: z.object({
        medicationId: z.string()
      }),
      body: createReminderSchema,
      response: {
        201: reminderSchema,
        404: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request: TypedRequest<z.infer<typeof createReminderSchema>>, reply) => {
    const { medicationId } = request.params as { medicationId: string }
    const { id: userId } = request.user
    const reminderData = request.body

    // Verifica se a medicação existe e pertence ao usuário
    const medication = await prisma.medication.findFirst({
      where: {
        id: medicationId,
        userId
      }
    })

    if (!medication) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Medicação não encontrada'
      })
    }

    const reminder = await prisma.reminder.create({
      data: {
        ...reminderData,
        medicationId
      }
    })

    return reply.status(201).send(reminder)
  })
} 