import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const logout: FastifyPluginAsyncZod = async (app) => {
  app.post('/', {
    schema: {
      tags: ['auth'],
      summary: 'Logout',
      description: 'Encerra a sessão do usuário.',
      response: {
        200: z.object({
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
  }, async (request, reply) => {
    try {
      // Substituir com a nova lógica de logout

      return {
        message: 'Logout realizado com sucesso'
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao fazer logout'
      })
    }
  })
} 