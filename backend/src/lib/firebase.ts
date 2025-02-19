import { initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { env } from '../env'

// Inicializa o Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
  })
})

// Exporta a instância do Firebase Messaging
export const messaging = getMessaging(app)

// Função para enviar notificação push
export async function sendPushNotification({
  token,
  title,
  body,
  data = {},
}: {
  token: string
  title: string
  body: string
  data?: Record<string, string>
}) {
  try {
    const message = {
      notification: {
        title,
        body,
      },
      data,
      token,
    }

    const response = await messaging.send(message)
    return { success: true, messageId: response }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error)
    return { success: false, error }
  }
} 