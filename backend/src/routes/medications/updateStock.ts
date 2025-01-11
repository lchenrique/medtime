import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

const updateStockParamsSchema = z.object({
  medicationId: z.string()
})

const updateStockBodySchema = z.object({
  remainingQuantity: z.number().min(0, 'Quantidade não pode ser negativa')
})

export const updateStock: FastifyPluginAsyncZod = async (app) => {
  app.patch('/:medicationId/stock', {
    schema: {
      tags: ['medications'],
      description: 'Atualiza o estoque de um medicamento',
      params: updateStockParamsSchema,
      body: updateStockBodySchema,
      response: {
        200: z.object({
          message: z.string(),
          remainingQuantity: z.number()
        }),
        404: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (
    request: FastifyRequest<{
      Params: z.infer<typeof updateStockParamsSchema>
      Body: z.infer<typeof updateStockBodySchema>
    }>, 
    reply
  ) => {
    const { medicationId } = request.params
    const { remainingQuantity } = request.body
    const { id: userId } = request.user

    try {
      const medication = await prisma.medication.findUnique({
        where: { id: medicationId }
      })

      if (!medication) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Medicamento não encontrado'
        })
      }

      // Verifica se o usuário tem permissão
      if (medication.userId !== userId) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Você não tem permissão para atualizar este medicamento'
        })
      }

      // Atualiza a quantidade
      await prisma.medication.update({
        where: { id: medicationId },
        data: { remainingQuantity }
      })

      return reply.send({
        message: 'Estoque atualizado com sucesso',
        remainingQuantity
      })
    } catch (error) {
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao atualizar estoque'
      })
    }
  })
} 