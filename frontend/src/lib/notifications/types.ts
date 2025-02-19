export type NotificationType = 'REMINDER' | 'STOCK_LOW' | 'MEDICATION_UPDATE'

export interface NotificationData {
  id: string
  title: string
  body: string
  scheduledFor?: string
  playSound?: boolean
  medicationId?: string
  dosage?: string
}

export interface NotificationPayload {
  type: 'REMINDER' | 'STOCK_LOW' | 'MEDICATION_UPDATE'
  data: NotificationData
}

// Interface base para os clientes de notificação
export interface NotificationClient {
  init(): Promise<void>
  setNavigate(navigate: (path: string) => void): void
  disconnect(): void
} 