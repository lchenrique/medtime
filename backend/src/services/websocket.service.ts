import { WebSocket } from 'ws'

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
  private connections: Map<string, WebSocket> = new Map()

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  addConnection(userId: string, ws: WebSocket) {
    this.connections.set(userId, ws)
    console.log(`WebSocket conectado para usuário ${userId}`)
  }

  removeConnection(userId: string) {
    this.connections.delete(userId)
    console.log(`WebSocket desconectado para usuário ${userId}`)
  }

  hasConnection(userId: string): boolean {
    return this.connections.has(userId)
  }

  sendNotification(userId: string, notification: NotificationPayload) {
    const ws = this.connections.get(userId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(notification))
      console.log(`Notificação enviada via WebSocket para usuário ${userId}`)
      return true
    }
    return false
  }
}

export const wsService = WebSocketService.getInstance() 