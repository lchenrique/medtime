import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification'

interface NotificationPayload {
  type: 'REMINDER' | 'STOCK_LOW' | 'MEDICATION_UPDATE'
  data: {
    title: string
    body: string
    id: string
    scheduledFor?: string
  }
}

export class TauriNotificationClient {
  private static instance: TauriNotificationClient
  private initialized = false
  private ws: WebSocket | null = null
  private notificationTimeouts = new Map<string, number>()

  static getInstance(): TauriNotificationClient {
    if (!this.instance) {
      this.instance = new TauriNotificationClient()
    }
    return this.instance
  }

  async init() {
    if (this.initialized) {
      console.log('⚠️ Cliente Tauri já inicializado')
      return
    }

    console.log('🚀 Iniciando cliente Tauri...')
    
    try {
      // Primeiro solicita permissão
      const permissionGranted = await requestPermission()
      
      if (!permissionGranted) {
        throw new Error('Permissão para notificações negada')
      }

      // Marca como inicializado
      this.initialized = true
      console.log('✅ Cliente Tauri inicializado')

      // Só tenta conectar WebSocket após inicialização
      const token = localStorage.getItem('token')
      if (token) {
        await this.connect(token)
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar cliente:', error)
      this.initialized = false
      throw error
    }
  }

  private async connect(token: string) {
    if (!this.initialized) {
      console.log('❌ Cliente não está inicializado')
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket já está conectado')
      return
    }

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

      this.ws.onclose = (event) => {
        console.log('🔸 WebSocket fechado:', event.code, event.reason)
        this.handleClose(event)
      }

      this.ws.onmessage = this.handleMessage.bind(this)

    } catch (error) {
      console.error('❌ Erro ao conectar WebSocket:', error)
      throw error
    }
  }

  private async scheduleNotification(notification: NotificationPayload) {
    try {
      // Se tem scheduledFor, usa o do payload, senão usa o do data
      const scheduledFor = notification.data.scheduledFor

      if (!scheduledFor) {
        console.log('📨 Enviando notificação imediatamente')
        await sendNotification({
          title: notification.data.title,
          body: notification.data.body,
          icon: 'app-icon',
          sound: 'default'
        })
        return
      }

      const scheduledTime = new Date(scheduledFor).getTime()
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

  private handleMessage(event: MessageEvent) {
    try {
      console.log('📨 Mensagem WebSocket recebida:', event.data)
      
      const notification = JSON.parse(event.data) as NotificationPayload
      console.log('📨 Notificação parseada:', notification)

      if (notification.type === 'REMINDER') {
        console.log('🔔 Agendando notificação do tipo REMINDER')
        this.scheduleNotification(notification)
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket:', error)
    }
  }

  private handleClose = (event: CloseEvent) => {
    console.log('🔸 WebSocket fechado:', event.code, event.reason)
    
    // Se o servidor fechou porque Tauri não está habilitado
    if (event.code === 1008) {
      console.log('❌ Tauri não habilitado, não irá reconectar')
      this.disconnect() // Usa o método disconnect para limpar tudo
      return
    }

    // Se não estiver mais inicializado, não tenta reconectar
    if (!this.initialized) {
      console.log('❌ Cliente não está inicializado, não irá reconectar')
      return
    }

    // Tenta reconectar após 5 segundos apenas se ainda estiver inicializado
    console.log('⏰ Agendando reconexão em 5 segundos...')
    setTimeout(() => {
      // Verifica novamente se ainda está inicializado
      if (this.initialized && this.ws?.readyState !== WebSocket.OPEN) {
        console.log('🔄 Tentando reconectar...')
        const token = localStorage.getItem('token')
        if (token) {
          this.connect(token)
        }
      } else {
        console.log('❌ Não irá reconectar: cliente não inicializado ou já conectado')
      }
    }, 5000)
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
    
    this.initialized = false
  }
} 