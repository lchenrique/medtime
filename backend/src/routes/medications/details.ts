import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string()
})

export const details: FastifyPluginAsyncZod = async (app) => {
  app.get('/:id/details', {
    schema: {
      tags: ['medications'],
      description: 'Obtém os detalhes de uma medicação com seus lembretes',
      params: paramsSchema,
      response: {
        200: z.object({
          medication: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().nullable(),
            interval: z.number(),
            startDate: z.string().datetime(),
            duration: z.number()
          }),
          reminders: z.array(z.object({
            id: z.string(),
            scheduledFor: z.string().datetime(),
            taken: z.boolean(),
            takenAt: z.string().datetime().nullable(),
            skipped: z.boolean(),
            skippedReason: z.string().nullable()
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
        medication,
        reminders: medication.reminders
      }
    } catch (error) {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao buscar detalhes da medicação'
      })
    }
  })
} 