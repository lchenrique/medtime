import { prisma } from '../lib/prisma'
import { sendMedicationReminder } from '../services/notification.service'
import { addMinutes } from 'date-fns'
import { sendWebSocketNotification } from '../routes/notifications/websocket'
import { TelegramService } from '../services/telegram.service'
import { WhatsAppService } from '../services/whatsapp.service'
import { calculateNextSchedules, cleanupOldReminders } from '../services/medication.service'

export class ReminderWorker {
  private static isRunning = false
  private static readonly CHECK_INTERVAL = 30000 // 30 segundos
  private static readonly NOTIFICATION_WINDOW = 2 // 2 minutos para frente
  private static readonly PAST_WINDOW = 2 // 2 minutos para trás
  private static readonly MAX_RETRIES = 3 // máximo de tentativas
  private static readonly RETRY_DELAY = 3000 // 3 segundos entre tentativas
  private static readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000 // 24 horas
  private static notificationRetries = new Map<string, number>()

  static async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🔔 Iniciando worker de lembretes...')
    
    // Executa imediatamente e depois a cada intervalo
    await this.checkReminders()
    setInterval(() => this.checkReminders(), this.CHECK_INTERVAL)

    // Executa limpeza uma vez por dia
    await cleanupOldReminders()
    setInterval(() => cleanupOldReminders(), this.CLEANUP_INTERVAL)
  }

  private static async sendNotification(reminder: any, isVirtual = false) {
    const retryCount = this.notificationRetries.get(reminder.id) || 0
    let atLeastOneSuccess = false
    
    try {
      // Verifica se é um lembrete de teste (duração = 1 dia)
      const isTestReminder = reminder.medication.duration === 1

      // Só verifica estoque se não for teste e não for recorrente
      if (!isTestReminder && !reminder.medication.isRecurring && reminder.medication.remainingQuantity < reminder.medication.dosageQuantity) {
        console.log(`Estoque insuficiente para ${reminder.medication.name}`)
        return
      }

      // Envia via WebSocket se usuário usa Tauri
      if (reminder.medication.user.tauriEnabled) {
        try {
          console.log(`Tentativa ${retryCount + 1} de enviar notificação para ${reminder.medication.name}`)
          await sendWebSocketNotification(reminder.medication.userId, {
            type: 'REMINDER',
            data: {
              title: `Hora do Medicamento: ${reminder.medication.name}`,
              body: `Tome ${reminder.medication.dosageQuantity} ${reminder.medication.unit}`,
              id: isVirtual ? `virtual_${reminder.id}` : reminder.id,
              scheduledFor: reminder.scheduledFor.toISOString(),
              medicationId: reminder.medication.id,
              dosage: `${reminder.medication.dosageQuantity} ${reminder.medication.unit}`,
              isVirtual
            }
          })
          atLeastOneSuccess = true
        } catch (error) {
          console.error('Erro ao enviar via WebSocket:', error)
        }
      }

      // Envia via Telegram se habilitado
      if (reminder.medication.user.telegramEnabled && reminder.medication.user.telegramChatId) {
        try {
          console.log(`Enviando notificação via Telegram para ${reminder.medication.name}`)
          await TelegramService.sendMedicationReminder(
            reminder.medication.user.telegramChatId,
            reminder.medication.name,
            `${reminder.medication.dosageQuantity} ${reminder.medication.unit}`,
            reminder.scheduledFor,
            reminder.medication.remainingQuantity,
            isVirtual ? `virtual_${reminder.id}` : reminder.id,
            reminder.medication.description
          )
          atLeastOneSuccess = true
        } catch (error) {
          console.error('Erro ao enviar via Telegram:', error)
        }
      }

      // Envia via WhatsApp se habilitado
      if (reminder.medication.user.whatsappEnabled && reminder.medication.user.whatsappNumber) {
        try {
          console.log(`Enviando notificação via WhatsApp para ${reminder.medication.name}`)
          await WhatsAppService.sendMedicationReminder(
            reminder.medication.user.whatsappNumber,
            reminder.medication.name,
            reminder.medication.dosageQuantity,
            reminder.scheduledFor,
            reminder.medication.remainingQuantity,
            isVirtual ? `virtual_${reminder.id}` : reminder.id,
            reminder.medication.description
          )
          atLeastOneSuccess = true
        } catch (error) {
          console.error('Erro ao enviar via WhatsApp:', error)
        }
      }

      // Envia via FCM se tiver token configurado (independente dos outros canais)
      if (reminder.medication.user.fcmToken) {
        try {
          console.log(`Enviando notificação via FCM para ${reminder.medication.name}`)
          await sendMedicationReminder({
            medicationId: reminder.medication.id,
            scheduledFor: reminder.scheduledFor,
            userId: reminder.medication.userId
          })
          atLeastOneSuccess = true
        } catch (error) {
          console.error('Erro ao enviar via FCM:', error)
        }
      }
      
      // Se pelo menos um canal funcionou e não for virtual, marca como notificado
      if (atLeastOneSuccess && !isVirtual) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { notified: true }
        })
        
        this.notificationRetries.delete(reminder.id)
        console.log('✅ Lembrete marcado como notificado:', reminder.id)
      } else if (!atLeastOneSuccess) {
        throw new Error('Nenhum canal de notificação funcionou')
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error)
      
      // Se ainda não atingiu o máximo de tentativas, agenda retry
      if (retryCount < this.MAX_RETRIES) {
        this.notificationRetries.set(reminder.id, retryCount + 1)
        setTimeout(() => this.sendNotification(reminder, isVirtual), this.RETRY_DELAY)
        console.log(`Agendando retry ${retryCount + 1} para ${reminder.medication.name}`)
      } else {
        console.error(`Desistindo após ${retryCount} tentativas para ${reminder.medication.name}`)
        this.notificationRetries.delete(reminder.id)
      }
    }
  }

  private static async checkReminders() {
    try {
      const now = new Date()
      const windowStart = addMinutes(now, -this.PAST_WINDOW)
      const windowEnd = addMinutes(now, this.NOTIFICATION_WINDOW)

      console.log('🔍 Buscando lembretes:')
      console.log('- Horário atual (UTC):', now.toISOString())
      console.log('- Janela de início (UTC):', windowStart.toISOString())
      console.log('- Janela de fim (UTC):', windowEnd.toISOString())

      // Busca todos os usuários com seus timezones
      const users = await prisma.user.findMany({
        select: {
          id: true,
          timezone: true
        }
      })

      // Para cada usuário, busca seus lembretes considerando seu timezone
      for (const user of users) {
        const userTimezone = user.timezone || 'America/Sao_Paulo'
        
        // Busca lembretes físicos não tomados/pulados que estão próximos do horário
        const physicalReminders = await prisma.reminder.findMany({
          where: {
            taken: false,
            skipped: false,
            notified: false,
            medication: {
              userId: user.id
            },
            scheduledFor: {
              gte: windowStart,
              lte: windowEnd
            }
          },
          include: {
            medication: {
              select: {
                id: true,
                userId: true,
                name: true,
                remainingQuantity: true,
                dosageQuantity: true,
                unit: true,
                description: true,
                duration: true,
                isRecurring: true,
                user: {
                  select: {
                    tauriEnabled: true,
                    telegramEnabled: true,
                    telegramChatId: true,
                    whatsappEnabled: true,
                    whatsappNumber: true,
                    fcmToken: true,
                    timezone: true
                  }
                }
              }
            }
          }
        })

        // Para medicamentos não recorrentes, usa os lembretes físicos
        const nonRecurringReminders = physicalReminders.filter(r => !r.medication.isRecurring)

        // Para medicamentos recorrentes, busca apenas os que não têm lembrete físico no período
        const recurringMedications = await prisma.medication.findMany({
          where: {
            userId: user.id,
            isRecurring: true,
            AND: {
              id: {
                notIn: physicalReminders.map(r => r.medication.id)
              }
            }
          },
          include: {
            user: {
              select: {
                tauriEnabled: true,
                telegramEnabled: true,
                telegramChatId: true,
                whatsappEnabled: true,
                whatsappNumber: true,
                fcmToken: true,
                timezone: true
              }
            }
          }
        })

        // Gera lembretes virtuais apenas para medicamentos recorrentes sem lembrete físico
        const virtualReminders = []
        for (const medication of recurringMedications) {
          const schedules = calculateNextSchedules(medication, { 
            startFrom: windowStart,
            limit: 1,
            timezone: userTimezone
          })
          
          for (const schedule of schedules) {
            if (schedule.scheduledFor >= windowStart && schedule.scheduledFor <= windowEnd) {
              virtualReminders.push({
                id: `${medication.id}_${schedule.scheduledFor.getTime()}`,
                scheduledFor: schedule.scheduledFor,
                medication
              })
            }
          }
        }

        if (nonRecurringReminders.length === 0 && virtualReminders.length === 0) {
          console.log(`❌ Nenhum lembrete encontrado para o usuário ${user.id} no período`)
          continue
        }

        console.log(`✅ Usuário ${user.id}: ${nonRecurringReminders.length} lembretes não recorrentes e ${virtualReminders.length} virtuais:`)
        
        // Processa lembretes não recorrentes
        for (const reminder of nonRecurringReminders) {
          console.log(`- ${reminder.medication.name} agendado para ${reminder.scheduledFor.toLocaleString()} (não recorrente)`)
          await this.sendNotification(reminder, false)
        }

        // Processa lembretes virtuais (apenas recorrentes sem lembrete físico)
        for (const reminder of virtualReminders) {
          console.log(`- ${reminder.medication.name} agendado para ${reminder.scheduledFor.toLocaleString()} (virtual/recorrente)`)
          await this.sendNotification(reminder, true)
        }
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error)
    }
  }
}
