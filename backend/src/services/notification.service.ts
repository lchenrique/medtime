import { prisma } from '../lib/prisma'
import { messaging } from '../lib/firebase'
import { wsService } from './websocket.service'
import { TelegramService } from './telegram.service'
import { WhatsAppService } from './whatsapp.service'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface NotificationData {
  title: string
  body: string
  type?: string
  medicationId?: string
  dosage?: string
  data?: Record<string, string>
}

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

async function sendPushNotification(token: string, data: NotificationData) {
  try {
    const type = data.type ?? 'REMINDER'
    const medicationId = data.medicationId ?? ''
    const dosage = data.dosage ?? ''

    console.log('📱 Enviando FCM para token:', token)
    
    const message = {
      token,
      notification: {
        title: data.title,
        body: data.body,
      },
      data: {
        type,
        medicationId,
        dosage,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        foreground: 'false',
        userInteraction: 'true',
        content_available: 'true'
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'reminders',
          priority: 'max' as const,
          visibility: 'public' as const,
          defaultSound: true,
          defaultVibrateTimings: true
        },
        directBootOk: true
      }
    }

    console.log('📨 Mensagem FCM:', message)
    
    const response = await messaging.send(message)
    console.log('✅ FCM enviado com sucesso:', response)
    
    return response
  } catch (error) {
    console.error('❌ Erro ao enviar FCM:', error)
    throw error
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
      const success = await sendPushNotification(user.fcmToken, {
        title,
        body,
        data: {
          ...data,
          type: 'REMINDER',
          medicationId: data?.medicationId || '',
          dosage: data?.dosage || ''
        }
      })
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
      try {
        await WhatsAppService.sendMedicationReminder(
          user.whatsappNumber,
          title,
          1, // dosage
          new Date(), // scheduledFor
          0, // remainingQuantity
          data?.medicationId || '', // reminderId
          body // description
        )
      } catch (error) {
        console.error('Erro ao enviar WhatsApp notification:', error)
      }
    }

    // Envia notificação via Telegram se habilitado
    if (user.telegramEnabled && user.telegramChatId) {
      const telegramMessage = `<b>${title}</b>\n\n${body}`
      await TelegramService.sendMessage(user.telegramChatId, telegramMessage)
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
      include: {
        user: {
          select: {
            id: true,
            fcmToken: true,
            whatsappEnabled: true,
            whatsappNumber: true,
            telegramEnabled: true,
            telegramChatId: true
          }
        }
      }
    })

    if (!medication) {
      throw new Error('Medicamento não encontrado')
    }

    const formattedTime = format(scheduledFor, 'HH:mm', { locale: ptBR })
    const title = 'Hora do Medicamento'
    const body = `${medication.name} - ${medication.dosageQuantity} ${medication.unit} às ${formattedTime}`

    await sendNotification({
      userId,
      title,
      body,
      data: {
        medicationId,
        timestamp: scheduledFor.toISOString()
      }
    })

    // Envia notificação específica via WhatsApp se habilitado
    if (medication.user.whatsappEnabled && medication.user.whatsappNumber) {
      try {
        await WhatsAppService.sendMedicationReminder(
          medication.user.whatsappNumber,
          medication.name,
          medication.dosageQuantity, // dosage como number
          scheduledFor,
          medication.remainingQuantity,
          medicationId,
          medication.description || ""
        )
      } catch (error) {
        console.error('Erro ao enviar WhatsApp notification:', error)
      }
    }

    // Envia notificação específica via Telegram se habilitado
    if (medication.user.telegramEnabled && medication.user.telegramChatId) {
      await TelegramService.sendMedicationReminder(
        medication.user.telegramChatId,
        medication.name,
        `${medication.dosageQuantity} ${medication.unit}`,
        scheduledFor,
        medication.remainingQuantity,
        medicationId,
        medication.description || undefined
      )
    }

  } catch (error) {
    console.error('Erro ao enviar lembrete de medicamento:', error)
    throw error
  }
}

export { sendNotification, sendMedicationReminder } 