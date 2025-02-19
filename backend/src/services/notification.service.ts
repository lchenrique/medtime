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
          defaultVibrateTimings: true,
          sound: 'default',
          vibrateTimingsMillis: [200, 500, 200]
        },
        directBootOk: true
      }
    }

    console.log('📨 Mensagem FCM:', message)
    
    const response = await messaging.send(message)
    console.log('✅ FCM enviado com sucesso:', response)
    
    return response
  } catch (error: any) {
    console.error('❌ Erro ao enviar FCM:', error)
    
    // Se o token for inválido, devemos removê-lo do usuário
    if (error.code === 'messaging/invalid-registration-token' || 
        error.code === 'messaging/registration-token-not-registered') {
      console.log('🔄 Token FCM inválido, removendo...')
      try {
        // Busca o usuário pelo token FCM
        const user = await prisma.user.findFirst({
          where: { fcmToken: token }
        })

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { fcmToken: null }
          })
          console.log('✅ Token FCM removido com sucesso')
        }
      } catch (dbError) {
        console.error('❌ Erro ao remover token FCM:', dbError)
      }
    }
    
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
        const scheduledFor = data?.timestamp ? new Date(data.timestamp) : new Date()
        const [medicationName] = title.includes('-') ? title.split('-') : [title]
        const dosageMatch = body.match(/(\d+)\s+(\w+)/)
        const dosageQuantity = dosageMatch ? parseInt(dosageMatch[1]) : 1

        await WhatsAppService.sendMedicationReminder(
          user.whatsappNumber,
          medicationName.trim(),
          dosageQuantity,
          scheduledFor,
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
      try {
        const scheduledFor = data?.timestamp ? new Date(data.timestamp) : new Date()
        const [medicationName] = title.includes('-') ? title.split('-') : [title]
        const dosageMatch = body.match(/(\d+)\s+(\w+)/)
        const dosage = dosageMatch ? `${dosageMatch[1]} ${dosageMatch[2]}` : '1 unidade'

        await TelegramService.sendMedicationReminder(
          user.telegramChatId,
          medicationName.trim(),
          dosage,
          scheduledFor,
          0, // remainingQuantity
          data?.medicationId || '', // reminderId
          body // description
        )
      } catch (error) {
        console.error('Erro ao enviar Telegram notification:', error)
      }
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

    // Formata a hora no formato HH:mm
    const formattedTime = format(scheduledFor, "HH:mm", { locale: ptBR })
    // Formata a data no formato dd/MM
    const formattedDate = format(scheduledFor, "dd/MM", { locale: ptBR })
    
    // Título mais descritivo
    const title = `${medication.name} - Hora do Medicamento`
    
    // Corpo da mensagem mais organizado
    const body = [
      `📝 Dose: ${medication.dosageQuantity} ${medication.unit}`,
      `⏰ Horário: ${formattedTime} do dia ${formattedDate}`,
      medication.description ? `📋 Obs: ${medication.description}` : null,
      medication.remainingQuantity <= 5 ? `⚠️ Atenção: Estoque baixo! Restam ${medication.remainingQuantity} ${medication.unit}` : null
    ].filter(Boolean).join('\n')

    // Marca o lembrete como notificado antes de enviar as notificações
    await prisma.reminder.updateMany({
      where: {
        medicationId,
        scheduledFor,
        notified: false
      },
      data: {
        notified: true
      }
    })

    // Envia todas as notificações de uma vez
    await sendNotification({
      userId,
      title,
      body,
      data: {
        medicationId,
        timestamp: scheduledFor.toISOString(),
        dosage: `${medication.dosageQuantity} ${medication.unit}`,
        description: medication.description || "",
        remainingQuantity: medication.remainingQuantity.toString()
      }
    })

  } catch (error) {
    console.error('Erro ao enviar lembrete de medicamento:', error)
    throw error
  }
}

export { sendNotification, sendMedicationReminder } 