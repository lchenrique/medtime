import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'
import { medicationSchema } from '../../schemas/medication'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string()
})

export const get: FastifyPluginAsyncZod = async (app) => {
  app.get('/:id', {
    schema: {
      tags: ['medications'],
      description: 'Obtém uma medicação específica',
      params: paramsSchema,
      response: {
        200: medicationSchema,
        404: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        }),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest, reply) => {
    try {
      const { id } = request.params as z.infer<typeof paramsSchema>
      const { id: userId } = request.user

      const medication = await prisma.medication.findFirst({
        where: {
          id,
          userId
        },
        include: {
          reminders: true
        }
      })

      if (!medication) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Medicação não encontrada'
        })
      }

      return {
        id: medication.id,
        name: medication.name,
        description: medication.description,
        startDate: medication.startDate.toISOString(),
        duration: medication.duration,
        interval: medication.interval,
        userId: medication.userId,
        createdAt: medication.createdAt.toISOString(),
        updatedAt: medication.updatedAt.toISOString(),
        totalQuantity: medication.totalQuantity,
        remainingQuantity: medication.remainingQuantity,
        unit: medication.unit,
        dosageQuantity: medication.dosageQuantity,
        reminders: medication.reminders.map(reminder => ({
          id: reminder.id,
          scheduledFor: reminder.scheduledFor.toISOString(),
          taken: reminder.taken,
          takenAt: reminder.takenAt?.toISOString() || null,
          skipped: reminder.skipped,
          skippedReason: reminder.skippedReason,
          createdAt: reminder.createdAt.toISOString(),
          updatedAt: reminder.updatedAt.toISOString()
        }))
      }
    } catch (error) {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao buscar medicação'
      })
    }
  })
} 