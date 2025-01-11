import { useEffect, useState } from 'react'
import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { useUserStore } from '@/stores/user'
import { isPermissionGranted } from '@tauri-apps/plugin-notification'

export function useNotifications() {
  const [error, setError] = useState<Error | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const { user, updateUser } = useUserStore()

  useEffect(() => {
    if (user?.tauriEnabled !== false) {
      isPermissionGranted().then(setHasPermission)
    } else {
      setHasPermission(false)
    }
  }, [user?.tauriEnabled])

  return {
    hasPermission: hasPermission && user?.tauriEnabled,
    error,
    requestPermission: async () => {
      try {
        const client = TauriNotificationClient.getInstance()
        const permission = await client.init()
        setHasPermission(permission)
        if (permission) {
          await updateUser({ tauriEnabled: true })
        }
        return permission
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao solicitar permissão'))
        return false
      }
    }
  }
} 