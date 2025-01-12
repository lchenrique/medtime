import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { testRoutes } from './test'
import { websocketRoutes } from './websocket'

export const notificationRoutes: FastifyPluginAsyncZod = async (app) => {
  await app.register(testRoutes)
  await app.register(websocketRoutes)

  app.post('/:reminderId/notified', {
    schema: {
      tags: ['notifications'],
      description: 'Marca um lembrete como notificado',
      params: z.object({
        reminderId: z.string()
      })
    }
  }, async (request) => {
    const { reminderId } = request.params

    // Atualiza o lembrete para marcar que foi notificado
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { notified: true }
    })

    return { success: true }
  })
} 