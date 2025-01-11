import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createMedication } from './create'
import { list } from './list'
import { get } from './get'
import { markAsTaken } from './markAsTaken'
import { updateStock } from './updateStock'

export const medicationRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate)

  await app.register(list)
  await app.register(createMedication)
  await app.register(get)
  await app.register(markAsTaken)
  await app.register(updateStock)
} 