import { LocalNotifications, ActionPerformed } from '@capacitor/local-notifications'
import { PushNotifications, PushNotificationSchema, ActionPerformed as PushActionPerformed } from '@capacitor/push-notifications'
import { App } from '@capacitor/app'
import { alarmService } from '../alarm'
import { NotificationPayload } from './types'
import { BaseNotificationClient } from './base'
import { registerFCMToken } from '../firebase'
import { putAuthFcmToken } from '@/api/generated/auth/auth'

export class CapacitorNotificationClient extends BaseNotificationClient {
  private static instance: CapacitorNotificationClient

  private constructor() {
    super()
    this.setupListeners()
  }

  static getInstance(): CapacitorNotificationClient {
    if (!this.instance) {
      this.instance = new CapacitorNotificationClient()
    }
    return this.instance
  }

  private async setupListeners() {
    try {
      // Ignora setup de listeners se estiver na web
      if (!this.isCapacitor) {
        console.log('ℹ️ Ignorando setup de listeners no ambiente web')
        return
      }

      // Cria canal de notificação para Android
      await PushNotifications.createChannel({
        id: 'reminders',
        name: 'Lembretes de Medicamentos',
        description: 'Notificações para lembretes de medicamentos',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        sound: 'notification_19_270138'
      })

      // Registra para receber FCM
      await PushNotifications.register()

      // Listener para quando recebe a notificação FCM (mesmo em background)
      PushNotifications.addListener('pushNotificationReceived', async (notification) => {
        console.log('🔔 FCM recebido:', notification)
        
        if (notification.data?.type === 'REMINDER') {
          try {
            // Inicia o alarme
            alarmService.start({
              name: notification.title || '',
              dosage: notification.data.dosage || ''
            })

            if (this.navigate && notification.data.medicationId) {
              this.navigate(`/alarm/${notification.data.medicationId}`)
            }
          } catch (error) {
            console.error('❌ Erro ao processar notificação:', error)
          }
        }
      })

      // Listener para quando usuário clica na notificação FCM
      PushNotifications.addListener('pushNotificationActionPerformed', async (notification: PushActionPerformed) => {
        console.log('🔔 FCM clicado:', notification)
        
        // Se for um lembrete, inicia o alarme
        if (notification.notification.data?.type === 'REMINDER') {
          try {
            // Verifica se tem os dados necessários
            if (!notification.notification.title || !notification.notification.data.dosage) {
              console.error('❌ Dados incompletos para iniciar alarme:', notification)
              return
            }

            // Traz o app para o primeiro plano antes de iniciar o alarme
            try {
              // Força o app a vir para o primeiro plano
              await App.exitApp()
              await new Promise(resolve => setTimeout(resolve, 100))
              await App.minimizeApp()
            } catch (error) {
              console.error('❌ Erro ao trazer app para primeiro plano:', error)
            }

            // Inicia o alarme
            alarmService.start({
              name: notification.notification.title,
              dosage: notification.notification.data.dosage
            })

            if (this.navigate) {
              console.log('🔄 Navegando para:', `/alarm/${notification.notification.data.medicationId}`)
              this.navigate(`/alarm/${notification.notification.data.medicationId}`)
            }
          } catch (error) {
            console.error('❌ Erro ao processar clique no FCM:', error)
          }
        }
      })

      console.log('✅ Listeners configurados com sucesso')
    } catch (error) {
      console.error('❌ Erro ao configurar listeners:', error)
    }
  }

  public async requestPermission(): Promise<boolean> {
    try {
      // Verifica permissões do FCM
      const permissionStatus = await PushNotifications.checkPermissions()
      
      if (permissionStatus.receive === 'granted') {
        console.log('✅ Permissão FCM já concedida')
        
        // Registra token FCM e envia para o backend
        const token = await registerFCMToken()
        if (token) {
          await putAuthFcmToken({ fcmToken: token })
          console.log('✅ Token FCM registrado:', token)
        }
        
        return true
      }

      // Solicita permissão
      console.log('🔔 Solicitando permissão FCM...')
      const permissionResult = await PushNotifications.requestPermissions()
      
      const granted = permissionResult.receive === 'granted'
      console.log(granted ? '✅ Permissão FCM concedida' : '❌ Permissão FCM negada')
      
      if (granted) {
        // Registra token FCM e envia para o backend
        const token = await registerFCMToken()
        if (token) {
          await putAuthFcmToken({ fcmToken: token })
          console.log('✅ Token FCM registrado:', token)
        }
      }
      
      return granted
    } catch (error) {
      console.error('❌ Erro ao solicitar permissão FCM:', error)
      return false
    }
  }

  protected async sendPlatformNotification(notification: NotificationPayload): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: notification.data.title,
          body: notification.data.body,
          id: parseInt(notification.data.id),
          schedule: { 
            allowWhileIdle: true,
            repeats: true,
            every: 'minute'
          },
          sound: this.getNotificationSound(notification.type),
          actionTypeId: notification.type === 'REMINDER' ? 'REMINDER_ACTION' : undefined,
          extra: {
            type: notification.type,
            medicationId: notification.data.medicationId,
            dosage: notification.data.dosage
          },
          ongoing: true // Mantém a notificação até ser explicitamente cancelada
        }]
      })

      // Se for um lembrete, também inicia o alarme sonoro
      if (notification.type === 'REMINDER') {
        alarmService.start({
          name: notification.data.title,
          dosage: notification.data.dosage || ''
        })
      }
    } catch (error) {
      console.error('❌ Erro ao enviar notificação:', error)
      throw error
    }
  }
}

export const capacitorNotificationClient = CapacitorNotificationClient.getInstance(); 