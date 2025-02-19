import { FastifyInstance } from 'fastify'
import { authRoutes } from './auth'
import { medicationRoutes } from './medications'
import { notificationRoutes } from './notifications'
import { whatsappWebhookRoutes } from './webhooks/whatsapp'
import { healthRoutes } from './health'

export default async function routes(app: FastifyInstance) {
  app.register(authRoutes, { prefix: '/auth' })
  app.register(medicationRoutes, { prefix: '/medications' })
  app.register(notificationRoutes, { prefix: '/notifications' })
  app.register(whatsappWebhookRoutes, { prefix: '/webhooks/whatsapp' })
  app.register(healthRoutes, { prefix: '/health' })
} 