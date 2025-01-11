interface NotificationPayload {
  type: 'MEDICATION_REMINDER'
  title: string
  body: string
  data: {
    medicationId: string
    scheduledFor: string
  }
}

class WebSocketService {
  private static instance: WebSocketService
  private socket: WebSocket | null = null
  private token: string | null = null

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log('WebSocket já está conectado')
      return
    }

    this.token = token
    const wsUrl = `ws://localhost:3333/ws/notifications`

    this.socket = new WebSocket(wsUrl, [token])

    this.socket.onopen = () => {
      console.log('WebSocket conectado')
    }

    this.socket.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as NotificationPayload
        console.log('Notificação recebida:', notification)
        
        // Aqui você pode disparar a notificação usando o Tauri
        // ou atualizar o estado da aplicação
      } catch (error) {
        console.error('Erro ao processar mensagem:', error)
      }
    }

    this.socket.onclose = () => {
      console.log('WebSocket desconectado')
      // Tentar reconectar em 5 segundos
      setTimeout(() => this.connect(this.token!), 5000)
    }

    this.socket.onerror = (error) => {
      console.error('Erro no WebSocket:', error)
      this.socket?.close()
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close()
      this.socket = null
      this.token = null
    }
  }
}

export const wsService = WebSocketService.getInstance() 