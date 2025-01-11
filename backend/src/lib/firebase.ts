import { initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const credentialsPath = join(__dirname, '../config/credentials/firebase-admin.json')
const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'))

// Inicializa o Firebase Admin
const app = initializeApp({
  credential: cert(credentials)
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