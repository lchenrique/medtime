import { FastifyPluginAsync } from 'fastify'
import { syncNotifications } from './sync'
import { testNotification } from './test'

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  await app.register(syncNotifications, { prefix: '/sync' })
  await app.register(testNotification, { prefix: '/test' })
} 