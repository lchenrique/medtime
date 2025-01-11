import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'
import { getVersion } from '@tauri-apps/api/app'

// Setup para PWA
export async function setupPWANotifications() {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações desktop')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // Registra o service worker
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
      
      // Configuração básica de notificações
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        const options: NotificationOptions = {
          body: typeof event.data === 'string' ? event.data : 'Nova notificação',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'medtime-notification',
          requireInteraction: true
        }

        registration.showNotification('MedTime', options)
      })

      return true
    }
    
    return false
  } catch (error) {
    console.error('Erro ao configurar notificações:', error)
    return false
  }
}

// Setup para Tauri
export async function setupTauriNotifications() {
  let permissionGranted = await isPermissionGranted()
  
  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }

  return permissionGranted
}

export async function showTauriNotification(title: string, body: string) {
  await sendNotification({ title, body })
} 