import { FastifyPluginAsync } from 'fastify'
import { loginRoute } from './login'
import { registerRoute } from './register'
import { profile } from './profile'
import fcmToken from './fcm-token'
import tauriEnabled from './tauri-enabled'
import { logout } from './logout'

export const authRoutes: FastifyPluginAsync = async (app) => {
  // Registra as rotas
  await app.register(loginRoute, { prefix: '/login' })
  await app.register(registerRoute, { prefix: '/register' })
  await app.register(profile, { prefix: '/profile' })
  await app.register(fcmToken, { prefix: '/fcm-token' })
  await app.register(tauriEnabled, { prefix: '/tauri-enabled' })
  await app.register(logout, { prefix: '/logout' })
}
