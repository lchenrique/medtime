import { prisma } from '../lib/prisma'
import { messaging } from '../config/firebase-admin'
import axios from 'axios'
import { env } from '../config/env'
import { wsService } from './websocket.service'

interface SendNotificationParams {
  userId: string
  title: string
  body: string
  data?: Record<string, string>
}

interface MedicationReminderParams {
  medicationId: string
  scheduledFor: Date
  userId: string
}

async function sendPushNotification(token: string, title: string, body: string, data: Record<string, string> = {}) {
  try {
    console.log('Tentando enviar notificação push para token:', token)
    
    // Se for um token Tauri, envia via SSE
    if (token.startsWith('tauri-')) {
      console.log('Token Tauri detectado, enviando via SSE')
      // Emite o evento para o cliente Tauri específico
      const sseClients = global.sseClients || new Map()
      const client = sseClients.get(token)
      
      if (client) {
        client.write(`data: ${JSON.stringify({
          title,
          message: body,
          data
        })}\n\n`)
        console.log('Notificação enviada via SSE')
        return true
      } else {
        console.log('Cliente SSE não encontrado para o token:', token)
        return false
      }
    }

    // Se não for Tauri, usa o Firebase
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        url: data.medicationId ? `/medications/${data.medicationId}` : '/',
        timestamp: new Date().toISOString()
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'medication_reminders',
          priority: 'max' as const,
          defaultSound: true,
          defaultVibrateTimings: true,
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            'mutable-content': 1,
            'content-available': 1
          }
        }
      },
      webpush: {
        notification: {
          requireInteraction: true,
          actions: [
            {
              action: 'open',
              title: 'Abrir'
            }
          ]
        },
        fcmOptions: {
          link: data.medicationId ? `/medications/${data.medicationId}` : '/'
        }
      }
    }

    console.log('Mensagem a ser enviada:', JSON.stringify(message, null, 2))
    const response = await messaging.send(message)
    console.log('Push notification enviada com sucesso:', response)
    return true
  } catch (error) {
    console.error('Erro detalhado ao enviar push notification:', error)
    return false
  }
}

async function sendWhatsAppNotification(phoneNumber: string, message: string) {
  try {
    // Aqui você implementaria a integração com a API do WhatsApp Business
    // Este é apenas um exemplo usando uma API fictícia
    await axios.post(`${env.WHATSAPP_API_URL}/messages`, {
      phone: phoneNumber,
      message,
    }, {
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_API_KEY}`
      }
    })
    console.log('WhatsApp notification enviada com sucesso')
  } catch (error) {
    console.error('Erro ao enviar WhatsApp notification:', error)
  }
}

async function sendTelegramNotification(chatId: string, message: string) {
  try {
    await axios.post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML'
    })
    console.log('Telegram notification enviada com sucesso')
  } catch (error) {
    console.error('Erro ao enviar Telegram notification:', error)
  }
}

async function sendNotification({ userId, title, body, data }: SendNotificationParams) {
  try {
    console.log('Buscando usuário:', userId)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fcmToken: true,
        whatsappEnabled: true,
        whatsappNumber: true,
        telegramEnabled: true,
        telegramChatId: true
      }
    })

    console.log('Dados do usuário:', user)

    if (!user) {
      console.log('Usuário não encontrado')
      return
    }

    // Envia notificação push se o token estiver disponível
    if (user.fcmToken) {
      console.log('Enviando push notification...')
      const success = await sendPushNotification(user.fcmToken, title, body, data)
      console.log('Push notification enviada:', success)
    } else {
      console.log('Usuário não tem token FCM')
    }

    // Envia via WebSocket como canal adicional, se disponível
    if (wsService.hasConnection(userId)) {
      wsService.sendNotification(userId, {
        type: 'MEDICATION_REMINDER',
        title,
        body,
        data: {
          medicationId: data?.medicationId || '',
          scheduledFor: data?.timestamp || new Date().toISOString()
        }
      })
    }

    // Envia notificação via WhatsApp se habilitado
    if (user.whatsappEnabled && user.whatsappNumber) {
      const whatsappMessage = `*${title}*\n\n${body}`
      await sendWhatsAppNotification(user.whatsappNumber, whatsappMessage)
    }

    // Envia notificação via Telegram se habilitado
    if (user.telegramEnabled && user.telegramChatId) {
      const telegramMessage = `<b>${title}</b>\n\n${body}`
      await sendTelegramNotification(user.telegramChatId, telegramMessage)
    }
  } catch (error) {
    console.error('Erro detalhado ao enviar notificação:', error)
    throw error
  }
}

async function sendMedicationReminder({ medicationId, scheduledFor, userId }: MedicationReminderParams) {
  try {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      select: { name: true }
    })

    if (!medication) return

    const time = scheduledFor.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })

    await sendNotification({
      userId,
      title: 'Hora do Medicamento',
      body: `Está na hora de tomar ${medication.name} (${time})`,
      data: {
        type: 'MEDICATION_REMINDER',
        medicationId,
        timestamp: scheduledFor.toISOString()
      }
    })
  } catch (error) {
    console.error('Erro ao enviar lembrete:', error)
  }
}

export {
  sendNotification,
  sendMedicationReminder
} 