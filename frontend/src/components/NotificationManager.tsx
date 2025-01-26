import { Capacitor } from '@capacitor/core'
import { capacitorNotificationClient } from '@/lib/notifications/capacitor'
import { tauriNotificationClient } from '@/lib/notifications/tauri'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function NotificationManager() {
  const navigate = useNavigate()
  const isCapacitor = Capacitor.isNativePlatform()
  const isTauri = Boolean(window && 'Tauri' in window)

  useEffect(() => {
    const client = isCapacitor ? capacitorNotificationClient : tauriNotificationClient
    client.setNavigate(navigate)
    client.init()

    return () => {
      client.disconnect()
    }
  }, [navigate])

  return null
} 