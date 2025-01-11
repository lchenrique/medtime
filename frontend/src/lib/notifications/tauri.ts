import { isPermissionGranted, requestPermission, sendNotification, Schedule } from '@tauri-apps/plugin-notification'
import { AXIOS_INSTANCE } from '@/api/axios-client'

interface Medication {
  id: string
  name: string
  dosageQuantity: number
  unit: string
}

interface Reminder {
  id: string
  scheduledFor: string
  medication: Medication
}

export class TauriNotificationClient {
  private static instance: TauriNotificationClient
  private syncInterval?: number

  private constructor() {}

  static getInstance(): TauriNotificationClient {
    if (!TauriNotificationClient.instance) {
      TauriNotificationClient.instance = new TauriNotificationClient()
    }
    return TauriNotificationClient.instance
  }

  async init() {
    console.log('Iniciando cliente Tauri...')
    const permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      return permission === 'granted'
    }
    
    return permissionGranted
  }

  async initializeWithSync() {
    console.log('Inicializando com sync...')
    const permissionGranted = await this.init()
    
    if (permissionGranted) {
      // Quando inicializa, força buscar todas as notificações
      localStorage.removeItem('lastNotificationSync')
      // Faz a primeira sincronização
      await this.syncNotifications()
      // Inicia o intervalo para próximas sincronizações
      this.startPeriodicSync()
    }

    return permissionGranted
  }

  async syncNotifications() {
    try {
      console.log('Sincronizando notificações...')
      const lastSync = localStorage.getItem('lastNotificationSync')
      console.log('Última sincronização:', lastSync)
      
      const response = await AXIOS_INSTANCE.get<Reminder[]>('/notifications/sync', {
        params: { lastSync }
      })

      console.log('Notificações recebidas:', response.data)

      // Agenda todas as notificações recebidas
      for (const reminder of response.data) {
        await this.scheduleNotification(reminder)
      }

      // Salva o momento da sincronização
      localStorage.setItem('lastNotificationSync', new Date().toISOString())
      console.log('Sincronização concluída')
    } catch (error) {
      console.error('Erro ao sincronizar notificações:', error)
    }
  }

  private startPeriodicSync() {
    console.log('Iniciando sincronização periódica...')
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    // Sincroniza a cada 5 minutos para garantir que não perca nenhuma notificação
    this.syncInterval = setInterval(() => {
      this.syncNotifications()
    }, 5 * 60 * 1000) // 5 minutos
  }

  private async scheduleNotification(reminder: Reminder) {
    const scheduledTime = new Date(reminder.scheduledFor)
    const now = new Date()

    if (scheduledTime > now) {
      console.log('Agendando notificação para:', scheduledTime)
      await sendNotification({
        title: 'Lembrete de Medicação',
        body: `Hora de tomar ${reminder.medication.name} - ${reminder.medication.dosageQuantity} ${reminder.medication.unit}`,
        schedule: Schedule.at(scheduledTime, false, true),
        icon: 'icons/icon.png'
      })
      console.log('Notificação agendada com sucesso')
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
  }
} 