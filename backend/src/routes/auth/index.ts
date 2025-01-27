import { FastifyPluginAsync } from 'fastify'
import { login } from './login'
import { register } from './register'
import { profile } from './profile'
import fcmToken from './fcm-token'
import tauriEnabled from './tauri-enabled'
import { googleAuth } from './google-auth'
import { logout } from './logout'

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Registra as rotas
  await app.register(login, { prefix: '/login' })
  await app.register(register, { prefix: '/register' })
  await app.register(profile, { prefix: '/profile' })
  await app.register(fcmToken, { prefix: '/fcm-token' })
  await app.register(tauriEnabled, { prefix: '/tauri-enabled' })
  await app.register(googleAuth, { prefix: '/google' })
  await app.register(logout, { prefix: '/logout' })
}
