import { FastifyPluginAsync, type FastifyInstance } from 'fastify'
import { authRoutes } from './auth'
import { medicationRoutes } from './medications'
import { notificationRoutes } from './notifications'
import { whatsappWebhookRoutes } from './webhooks/whatsapp'

export default async function routes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(medicationRoutes, { prefix: '/medications' })
  await app.register(notificationRoutes, { prefix: '/notifications' })
  await app.register(whatsappWebhookRoutes, { prefix: '/webhooks/whatsapp' })
} 