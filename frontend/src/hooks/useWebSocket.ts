import { useEffect } from 'react'
import { useUserStore } from '@/stores/user'
import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { useQueryClient } from '@tanstack/react-query'

export function useWebSocket() {
  const { user } = useUserStore()
  const queryClient = useQueryClient()
  
  useEffect(() => {
    if (!user?.tauriEnabled) return
    
    const token = localStorage.getItem('token')
    if (!token) return

    // Inicia cliente Tauri
    const client = TauriNotificationClient.getInstance()
    client.init()
      .then(() => console.log('Cliente Tauri inicializado'))
      .catch(err => console.error('Erro ao inicializar cliente:', err))

    // Listener para atualizações de medicamentos
    const handleMedicationUpdate = (event: CustomEvent) => {
      queryClient.invalidateQueries({ queryKey: ['medications'] })
    }

    window.addEventListener('medication-update', handleMedicationUpdate as EventListener)

    return () => {
      client.disconnect()
      window.removeEventListener('medication-update', handleMedicationUpdate as EventListener)
    }
  }, [user?.tauriEnabled])
} 