import { useEffect } from 'react'
import { useUserStore } from '@/stores/user'
import { TauriNotificationClient } from '@/lib/notifications/tauri'

export function NotificationManager() {
  const { user } = useUserStore()

  useEffect(() => {
    if (user?.tauriEnabled) {
      const client = TauriNotificationClient.getInstance()
      client.init()
        .then(() => console.log('Notificações Tauri inicializadas'))
        .catch(err => console.error('Erro ao inicializar notificações:', err))
    }
  }, [user?.tauriEnabled])

  return null
} 