import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const updateFcmTokenSchema = z.object({
  fcmToken: z.string()
})

const fcmToken: FastifyPluginAsyncZod = async (app) => {
  app.put('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Atualiza o token FCM do usuário',
      body: updateFcmTokenSchema,
      response: {
        200: z.object({
          success: z.boolean()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const { fcmToken } = request.body as z.infer<typeof updateFcmTokenSchema>
    const { id: userId } = request.user

    await prisma.user.update({
      where: { id: userId },
      data: { fcmToken }
    })

    return { success: true }
  })
}

export default fcmToken 