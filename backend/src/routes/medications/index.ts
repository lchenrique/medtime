import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { create } from './create'
import { list } from './list'
import { get } from './get'
import { updateStock } from './updateStock'
import { deleteMedication } from './delete'
import { markAsTaken } from './markAsTaken'

export const medicationRoutes: FastifyPluginAsyncZod = async (app) => {
  app.addHook('onRequest', app.authenticate)

  await app.register(list)
  await app.register(create)
  await app.register(get)
  await app.register(markAsTaken)
  await app.register(updateStock)
  await app.register(deleteMedication)
} 