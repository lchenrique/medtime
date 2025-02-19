import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { FastifyRequest } from 'fastify'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const paramsSchema = z.object({
  id: z.string()
})

export const deleteMedication: FastifyPluginAsyncZod = async (app) => {
  app.delete('/:id', {
    schema: {
      tags: ['medications'],
      description: 'Deleta uma medicação e seus lembretes',
      params: paramsSchema,
      response: {
        200: z.object({
          message: z.string()
        }),
        404: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request: FastifyRequest, reply) => {
    const { id } = request.params as z.infer<typeof paramsSchema>
    const { id: userId } = request.user

    try {
      // Verifica se a medicação existe e pertence ao usuário
      const medication = await prisma.medication.findFirst({
        where: {
          id,
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

      // Deleta os lembretes primeiro (por causa da foreign key)
      await prisma.reminder.deleteMany({
        where: { medicationId: id }
      })

      // Deleta a medicação
      await prisma.medication.delete({
        where: { id }
      })

      return {
        message: 'Medicação deletada com sucesso'
      }
    } catch (error) {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao deletar medicação'
      })
    }
  })
} 