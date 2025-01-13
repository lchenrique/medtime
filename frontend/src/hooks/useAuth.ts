import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { postAuthLogin as loginUser } from '@/api/generated/auth/auth'
import type { PostAuthLoginBody as LoginCredentials } from '@/api/model'

export function useAuth() {
  const login = async (credentials: LoginCredentials) => {
    const response = await loginUser(credentials)
    
    if (response.token) {
      localStorage.setItem('token', response.token)
      
      // Inicia cliente Tauri se habilitado
      if (response.user.tauriEnabled) {
        await TauriNotificationClient.getInstance().init()
      }
    }
    
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    TauriNotificationClient.getInstance().disconnect()
  }

  return { login, logout }
} 