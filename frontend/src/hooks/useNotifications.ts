import { useEffect, useState } from 'react'
import { useUserStore } from '@/stores/user'
import { Capacitor } from '@capacitor/core'
import { capacitorNotificationClient } from '@/lib/notifications/capacitor'
import { tauriNotificationClient } from '@/lib/notifications/tauri'

export function useNotifications() {
  const { user } = useUserStore()
  const [hasPermission, setHasPermission] = useState(false)
  const isCapacitor = Capacitor.isNativePlatform()
  const isTauri = Boolean(window && 'Tauri' in window)

  useEffect(() => {
    async function initializeClient() {
      try {
        const client = isCapacitor ? capacitorNotificationClient : tauriNotificationClient
        await client.init()
        setHasPermission(true)
      } catch (error) {
        console.error('❌ Erro ao inicializar cliente:', error)
        setHasPermission(false)
      }
    }

    if ((isCapacitor && user?.capacitorEnabled) || (isTauri && user?.tauriEnabled)) {
      initializeClient()
    }
  }, [user?.capacitorEnabled, user?.tauriEnabled, isCapacitor, isTauri])

  const requestPermission = async () => {
    const client = isCapacitor ? capacitorNotificationClient : tauriNotificationClient
    await client.init()
    setHasPermission(true)
  }

  return { hasPermission, requestPermission }
} 