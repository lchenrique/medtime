import { useEffect } from 'react'
import { useUserStore } from '@/stores/user'
import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { wsService } from '@/lib/notifications/websocket'

export function NotificationManager() {
  const { user } = useUserStore()

  useEffect(() => {
    if (!user?.tauriEnabled) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Inicializa o cliente Tauri
    const client = TauriNotificationClient.getInstance()
    client.initializeWithSync()

    // Conecta ao WebSocket
    wsService.connect(token)

    return () => {
      wsService.disconnect()
    }
  }, [user?.tauriEnabled])

  return null
} 