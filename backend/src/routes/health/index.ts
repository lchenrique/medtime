import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function healthRoutes(app: FastifyInstance) {
  app.get('/', {
    schema: {
      tags: ['Health'],
      summary: 'Verifica o status da API',
      response: {
        200: z.object({
          status: z.string(),
          timestamp: z.string(),
          uptime: z.number(),
        })
      }
    }
  }, async () => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  })
} 