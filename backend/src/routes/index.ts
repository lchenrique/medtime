import { FastifyPluginAsync } from 'fastify'
import { authRoutes } from './auth'
import { medicationRoutes } from './medications'
import { notificationRoutes } from './notifications'
import { whatsappWebhookRoutes } from './webhooks/whatsapp'

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(medicationRoutes, { prefix: '/medications' })
  await app.register(notificationRoutes, { prefix: '/notifications' })
  await app.register(whatsappWebhookRoutes, { prefix: '/webhooks/whatsapp' })
} 