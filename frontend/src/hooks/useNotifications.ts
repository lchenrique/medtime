import { useEffect, useState } from 'react'
import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { useUserStore } from '@/stores/user'
import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification'

declare module '@tauri-apps/plugin-notification' {
  export function isPermissionGranted(): Promise<boolean>
}

export function useNotifications() {
  const [error, setError] = useState<Error | null>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const { user, updateUser } = useUserStore()

  useEffect(() => {
    async function checkPermission() {
      if (user?.tauriEnabled !== false) {
        const granted = await isPermissionGranted()
        setHasPermission(granted)
      } else {
        setHasPermission(false)
      }
    }
    checkPermission()
  }, [user?.tauriEnabled])

  return {
    hasPermission: hasPermission && user?.tauriEnabled,
    error,
    requestPermission: async () => {
      try {
        const client = TauriNotificationClient.getInstance()
        await client.init()
        const granted = await isPermissionGranted()
        setHasPermission(granted)
        if (granted) {
          await updateUser({ tauriEnabled: true })
        }
        return granted
      } catch (error) {
        setError(error as Error)
        return false
      }
    }
  }
} 