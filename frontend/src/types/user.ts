export interface User {
  id: string
  email: string
  name: string
  whatsappEnabled: boolean
  whatsappNumber: string | null
  telegramEnabled: boolean
  telegramChatId: string | null
  tauriEnabled?: boolean
  fcmToken?: string | null
  timezone?: string
  createdAt: string
  updatedAt: string
} 