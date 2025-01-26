import { NotificationPayload, NotificationClient } from './types'
import { Capacitor } from '@capacitor/core'
import type { CapacitorNotificationClient } from './capacitor'
import type { TauriNotificationClient } from './tauri'
import { useUserStore } from '@/stores/user'

export abstract class BaseNotificationClient implements NotificationClient {
  protected initialized = false
  protected ws: WebSocket | null = null
  protected notificationTimeouts = new Map<string, number>()
  protected navigate: ((path: string) => void) | null = null
  protected isCapacitor = Capacitor.isNativePlatform()
  protected isTauri = Boolean(window && '__TAURI__' in window)
  protected isWeb = !this.isCapacitor && !this.isTauri

  // Verifica se as notificações estão habilitadas nas configurações
  protected isNotificationsEnabled(): boolean {
    try {
      const user = useUserStore.getState().user
      
      if (!user) {
        return false
      }
      
      if (this.constructor.name === 'CapacitorNotificationClient') {
        return Boolean(user.capacitorEnabled)
      }
      
      if (this.constructor.name === 'TauriNotificationClient') {
        return Boolean(user.tauriEnabled)
      }
      
      return false
    } catch (error) {
      console.error('❌ Erro ao verificar configurações de notificação:', error)
      return false
    }
  }

  // Verifica se este cliente deve ser inicializado no ambiente atual
  protected shouldInitialize(): boolean {
    const clientName = this.constructor.name
    
    // Primeiro verifica se as notificações estão habilitadas
    if (!this.isNotificationsEnabled()) {
      return false
    }
    
    if (clientName === 'CapacitorNotificationClient') {
      // Capacitor só inicializa em ambiente nativo Capacitor
      return this.isCapacitor
    }
    
    if (clientName === 'TauriNotificationClient') {
      // Tauri só inicializa em ambiente Tauri
      return this.isTauri
    }
    
    return false
  }

  setNavigate(navigate: (path: string) => void) {
    this.navigate = navigate
  }

  // Método abstrato que cada cliente deve implementar
  protected abstract sendPlatformNotification(notification: NotificationPayload): Promise<void>

  async init(): Promise<void> {
    if (this.initialized) {
      console.log('⚠️ Cliente já inicializado')
      return
    }

    // Verifica se este cliente deve ser inicializado neste ambiente
    if (!this.shouldInitialize()) {
      const env = this.isCapacitor ? 'Capacitor' : this.isTauri ? 'Tauri' : 'Web'
      console.log(`ℹ️ Cliente ${this.constructor.name} não será inicializado no ambiente ${env}`)
      return
    }

    console.log(`🚀 Iniciando cliente ${this.constructor.name}...`)
    
    try {
      await this.requestPermission()
      this.initialized = true
      console.log('✅ Cliente inicializado')

      // Apenas inicia WebSocket se for cliente Tauri
      if (this.constructor.name === 'TauriNotificationClient') {
        const token = localStorage.getItem('token')
        if (token) {
          await this.connect(token)
        }
      }

    } catch (error) {
      console.error('❌ Erro ao inicializar cliente:', error)
      this.initialized = false
      throw error
    }
  }

  // Método abstrato que cada cliente deve implementar
  protected abstract requestPermission(): Promise<boolean>

  protected async connect(token: string) {
    // Apenas conecta se for cliente Tauri
    if (this.constructor.name !== 'TauriNotificationClient') {
      return
    }

    // Verifica se as notificações ainda estão habilitadas
    if (!this.isNotificationsEnabled()) {
      console.log('⚠️ Notificações desabilitadas, não conectando WebSocket')
      this.disconnect() // Desconecta se já estiver conectado
      return
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('⚠️ WebSocket já está conectado')
      return
    }

    try {
      const baseUrl = import.meta.env.VITE_WS_URL.replace(/\/$/, '')
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}${baseUrl.replace(/^(wss?:)/, '')}/notifications/ws?token=${token}&client=tauri`
      
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

  protected async scheduleNotification(notification: NotificationPayload) {
    try {
      const scheduledFor = notification.data.scheduledFor

      if (!scheduledFor) {
        console.log('📨 Enviando notificação imediatamente')
        await this.sendPlatformNotification(notification)
        return
      }

      const scheduledTime = new Date(scheduledFor).getTime()
      const now = new Date().getTime()
      const delay = Math.max(0, scheduledTime - now)

      if (delay <= 0) {
        console.log('📨 Enviando notificação atrasada')
        await this.sendPlatformNotification(notification)
        return
      }

      console.log(`⏰ Agendando notificação para ${new Date(scheduledTime).toLocaleString()}`)
      const timeoutId = window.setTimeout(async () => {
        try {
          await this.sendPlatformNotification(notification)
          console.log('✅ Notificação agendada enviada com sucesso')
          this.notificationTimeouts.delete(notification.data.id)
        } catch (error) {
          console.error('❌ Erro ao enviar notificação agendada:', error)
        }
      }, delay)

      this.notificationTimeouts.set(notification.data.id, timeoutId)

    } catch (error) {
      console.error('❌ Erro ao agendar notificação:', error)
    }
  }

  protected async handleMessage(event: MessageEvent) {
    try {
      console.log('📨 Mensagem WebSocket recebida:', event.data)
      
      const notification = JSON.parse(event.data) as NotificationPayload
      console.log('📨 Notificação parseada:', notification)

      await this.scheduleNotification(notification)
    } catch (error) {
      console.error('❌ Erro ao processar mensagem WebSocket:', error)
    }
  }

  protected handleClose = (event: CloseEvent) => {
    // Apenas reconecta se for cliente Tauri
    if (this.constructor.name !== 'TauriNotificationClient') {
      return
    }

    console.log('🔸 WebSocket fechado:', event.code, event.reason)
    
    // Só tenta reconectar se as notificações estiverem habilitadas
    if (!this.isNotificationsEnabled()) {
      console.log('⚠️ Notificações desabilitadas, não tentando reconexão')
      return
    }
    
    // Tenta reconectar imediatamente e continua tentando
    const attemptReconnect = (attempt = 1) => {
      // Verifica novamente antes de cada tentativa
      if (!this.isNotificationsEnabled()) {
        console.log('⚠️ Notificações desabilitadas, parando tentativas de reconexão')
        return
      }

      console.log(`🔄 Tentativa de reconexão #${attempt}...`)
      const token = localStorage.getItem('token')
      if (token) {
        this.connect(token).catch(() => {
          // Verifica mais uma vez antes de agendar próxima tentativa
          if (!this.isNotificationsEnabled()) {
            console.log('⚠️ Notificações desabilitadas, parando tentativas de reconexão')
            return
          }
          
          const delay = Math.min(1000 * Math.pow(1.5, attempt), 10000)
          console.log(`⏳ Próxima tentativa em ${delay/1000} segundos`)
          setTimeout(() => attemptReconnect(attempt + 1), delay)
        })
      }
    }

    // Inicia tentativas de reconexão imediatamente
    attemptReconnect()
  }

  disconnect() {
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

  // Método utilitário para obter o som correto baseado no tipo de notificação
  protected getNotificationSound(type: NotificationPayload['type']): string {
    return type === 'REMINDER' ? 'notification-19-270138.mp3' : 'notification-1-270124.mp3'
  }
} 