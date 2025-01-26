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
        200: z.object({
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
        }),
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
          reminders: {
            orderBy: {
              scheduledFor: 'asc'
            }
          }
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
        isRecurring: medication.duration === null,
        totalQuantity: medication.totalQuantity,
        remainingQuantity: medication.remainingQuantity,
        unit: medication.unit,
        dosageQuantity: medication.dosageQuantity,
        userId: medication.userId,
        createdAt: medication.createdAt.toISOString(),
        updatedAt: medication.updatedAt.toISOString(),
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
      console.error('Erro ao buscar medicação:', error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao buscar medicação'
      })
    }
  })
} 