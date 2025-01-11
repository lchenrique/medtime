import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'

const updateTauriEnabledSchema = z.object({
  enabled: z.boolean()
})

const tauriEnabled: FastifyPluginAsync = async (app) => {
  app.put('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Atualiza status do cliente Tauri',
      body: updateTauriEnabledSchema,
      response: {
        200: z.object({
          success: z.boolean()
        })
      }
    }
  }, async (request) => {
    const { enabled } = updateTauriEnabledSchema.parse(request.body)
    const { id: userId } = request.user

    await prisma.user.update({
      where: { id: userId },
      data: { tauriEnabled: enabled }
    })

    return { success: true }
  })
}

export default tauriEnabled 