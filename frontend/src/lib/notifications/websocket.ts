import { sendNotification } from '@tauri-apps/plugin-notification'

interface NotificationPayload {
  type: 'REMINDER' | 'STOCK_LOW' | 'MEDICATION_UPDATE'
  data: any
  scheduledFor?: string
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private notificationTimeouts: Map<string, number> = new Map()

  private async scheduleNotification(notification: NotificationPayload) {
    try {
      if (!notification.scheduledFor) {
        console.log('📨 Enviando notificação imediatamente')
        await sendNotification({
          title: notification.data.title,
          body: notification.data.body,
          icon: 'app-icon',
          sound: 'default'
        })
        return
      }

      const scheduledTime = new Date(notification.scheduledFor).getTime()
      const now = new Date().getTime()
      const delay = Math.max(0, scheduledTime - now)

      // Se já passou do tempo, envia imediatamente
      if (delay <= 0) {
        console.log('📨 Enviando notificação atrasada')
        await sendNotification({
          title: notification.data.title,
          body: notification.data.body,
          icon: 'app-icon',
          sound: 'default'
        })
        return
      }

      // Agenda para o tempo correto
      console.log(`⏰ Agendando notificação para ${new Date(scheduledTime).toLocaleString()}`)
      const timeoutId = window.setTimeout(async () => {
        try {
          await sendNotification({
            title: notification.data.title,
            body: notification.data.body,
            icon: 'app-icon',
            sound: 'default'
          })
          console.log('✅ Notificação agendada enviada com sucesso')
          this.notificationTimeouts.delete(notification.data.id)
        } catch (error) {
          console.error('❌ Erro ao enviar notificação agendada:', error)
        }
      }, delay)

      // Armazena o timeout para poder cancelar se necessário
      this.notificationTimeouts.set(notification.data.id, timeoutId)

    } catch (error) {
      console.error('❌ Erro ao agendar notificação:', error)
    }
  }

  handleMessage = async (event: MessageEvent) => {
    try {
      const notification = JSON.parse(event.data) as NotificationPayload
      console.log('📨 Notificação recebida:', notification)
      
      // Agenda a notificação
      await this.scheduleNotification(notification)

    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error)
    }
  }

  handleClose = (event: CloseEvent) => {
    console.log('🔸 WebSocket fechado:', event.code, event.reason)
    
    // Se o servidor fechou porque Tauri não está habilitado, não tenta reconectar
    if (event.code === 1008) {
      console.log('❌ Tauri não habilitado, não irá reconectar')
      return
    }

    // Tenta reconectar após 5 segundos
    setTimeout(() => {
      console.log('🔄 Tentando reconectar...')
      this.connect(localStorage.getItem('token') || '')
    }, 5000)
  }

  async connect(token: string) {
    try {
      const baseUrl = import.meta.env.VITE_WS_URL.replace(/\/$/, '')
      const wsUrl = `${baseUrl}/notifications/ws?token=${token}`
      
      console.log('🔄 Conectando WebSocket:', wsUrl)
      
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('🟢 WebSocket conectado')
      }

      this.ws.onerror = (error) => {
        console.error('🔴 Erro WebSocket:', error)
      }

      this.ws.onclose = this.handleClose
      this.ws.onmessage = this.handleMessage

    } catch (error) {
      console.error('❌ Erro ao inicializar WebSocket:', error)
    }
  }

  disconnect() {
    // Limpa todos os timeouts pendentes
    this.notificationTimeouts.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
    this.notificationTimeouts.clear()

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
} 