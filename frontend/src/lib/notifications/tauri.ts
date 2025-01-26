import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'
import { alarmService } from '../alarm'
import { NotificationPayload } from './types'
import { BaseNotificationClient } from './base'

export class TauriNotificationClient extends BaseNotificationClient {
  private static instance: TauriNotificationClient

  private constructor() {
    super()
  }

  static getInstance(): TauriNotificationClient {
    if (!this.instance) {
      this.instance = new TauriNotificationClient()
    }
    return this.instance
  }

  protected async requestPermission(): Promise<boolean> {
    try {
      // Verifica se estamos realmente em um ambiente Tauri
      if (!window.__TAURI__) {
        console.log('⚠️ Não estamos em um ambiente Tauri')
        return false
      }

      const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification')
      const permissionGranted = await isPermissionGranted()

      if (!permissionGranted) {
        const permission = await requestPermission()
        return permission === 'granted'
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão:', error)
      return false
    }
  }

  protected async sendPlatformNotification(notification: NotificationPayload): Promise<void> {
    try {
      console.log('📱 Enviando notificação Tauri:', notification)
      
      await sendNotification({
        title: notification.data.title,
        body: notification.data.body,
        icon: 'app-icon',
        sound: this.getNotificationSound(notification.type)
      })

      // Toca o alarme se for um lembrete
      if (notification.type === 'REMINDER') {
        console.log('🔔 Iniciando alarme para lembrete')
        alarmService.start({
          name: notification.data.title,
          dosage: notification.data.dosage || ''
        })

        if (this.navigate && notification.data.medicationId) {
          console.log('🔄 Navegando para:', `/alarm/${notification.data.medicationId}`)
          this.navigate(`/alarm/${notification.data.medicationId}`)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error)
    }
  }
}

export const tauriNotificationClient = TauriNotificationClient.getInstance(); 