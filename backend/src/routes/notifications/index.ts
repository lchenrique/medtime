import { FastifyPluginAsync } from 'fastify'
import { websocketRoutes } from './websocket'
import testRoutes from './test'
import resetRoutes from './reset'

export const notificationRoutes: FastifyPluginAsync = async (app) => {
  // Registra as rotas de WebSocket
  await app.register(websocketRoutes, { prefix: '/ws' })

  // Registra as rotas de teste
  await app.register(testRoutes, { prefix: '/test' })

  // Registra a rota de reset
  await app.register(resetRoutes)
} 