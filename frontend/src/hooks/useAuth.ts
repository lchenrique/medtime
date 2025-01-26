import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { postAuthLogin as loginUser, getAuthProfile } from '@/api/generated/auth/auth'
import type { PostAuthLoginBody as LoginCredentials, GetAuthProfile200 as User } from '@/api/model'
import { useUserStore } from '@/stores/user'
import { storage } from '@/lib/storage'

export function useAuth() {
  const { setUser } = useUserStore()

  const loadUser = async () => {
    try {
      const token = await storage.get('token')
      if (token) {
        const user = await getAuthProfile()
        setUser(user)
        
        // Inicia cliente Tauri se habilitado
        if (user.tauriEnabled) {
          await TauriNotificationClient.getInstance().init()
        }
        return user
      }
      return null
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error)
      await storage.remove('token')
      setUser(null)
      throw error
    }
  }

  const login = async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials)
    
    if (response.token) {
      await storage.set('token', response.token)
      
      // Carrega o perfil completo após o login
      const user = await getAuthProfile()
      setUser(user)
      
      // Inicia cliente Tauri se habilitado
      if (user.tauriEnabled) {
        await TauriNotificationClient.getInstance().init()
      }
    }
    
    return response
  }

  const logout = async () => {
    await storage.remove('token')
    setUser(null)
    TauriNotificationClient.getInstance().disconnect()
  }

  const isAuthenticated = async () => {
    const token = await storage.get('token')
    return !!token
  }

  return { login, logout, isAuthenticated, loadUser }
} 