import { useEffect, useState, useRef } from 'react'
import { TauriNotificationClient } from '../lib/notifications/tauri'

export function useTauriNotifications() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    const client = TauriNotificationClient.getInstance()

    async function initializeNotifications() {
      try {
        // Se já inicializou, não faz nada
        if (initialized.current) return

        // Apenas verifica permissões
        const permission = await client.init()
        setHasPermission(permission)

        if (permission) {
          initialized.current = true
          setIsInitialized(true)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Erro ao inicializar notificações'))
        setIsInitialized(false)
      }
    }

    // Inicializa apenas uma vez
    if (!isInitialized) {
      initializeNotifications()
    }

    // Cleanup - apenas reseta os estados
    return () => {
      initialized.current = false
      setIsInitialized(false)
    }
  }, [isInitialized])

  return {
    isInitialized,
    hasPermission,
    error,
    requestPermission: async () => {
      const client = TauriNotificationClient.getInstance()
      const permission = await client.init()
      setHasPermission(permission)
      return permission
    }
  }
} 