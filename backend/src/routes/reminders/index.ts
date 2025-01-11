import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { create } from './create'

export const reminderRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate)
  await app.register(create)
} 