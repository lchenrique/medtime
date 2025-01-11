import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { login } from './login'
import { register } from './register'
import { profile } from './profile'
import fcmToken from './fcm-token'
import tauriEnabled from './tauri-enabled'

export const authRoutes: FastifyPluginAsyncZod = async (app) => {
  // Registra as rotas
  await app.register(login, { prefix: '/login' })
  await app.register(register, { prefix: '/register' })
  await app.register(profile, { prefix: '/profile' })
  await app.register(fcmToken, { prefix: '/fcm-token' })
  await app.register(tauriEnabled, { prefix: '/tauri-enabled' })
}
