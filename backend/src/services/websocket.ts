import { WebSocket } from 'ws'

interface NotificationPayload {
  type: 'REMINDER'
  data: {
    id: string
    scheduledFor: string
    medication: {
      id: string
      name: string
      dosageQuantity: number
      unit: string
    }
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

  addConnection(userId: string, socket: WebSocket) {
    this.connections.set(userId, socket)
    console.log(`WebSocket connection added for user ${userId}`)
  }

  removeConnection(userId: string) {
    this.connections.delete(userId)
    console.log(`WebSocket connection removed for user ${userId}`)
  }

  sendNotification(userId: string, notification: NotificationPayload) {
    const socket = this.connections.get(userId)
    if (socket) {
      socket.send(JSON.stringify(notification))
      console.log(`Notification sent to user ${userId}:`, notification)
    }
  }

  hasConnection(userId: string): boolean {
    return this.connections.has(userId)
  }
}

export const wsService = WebSocketService.getInstance() 