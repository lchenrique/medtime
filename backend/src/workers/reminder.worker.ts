import { prisma } from '../lib/prisma'
import { sendMedicationReminder } from '../services/notification.service'
import { addMinutes, addDays } from 'date-fns'
import { sendWebSocketNotification } from '../routes/notifications/websocket'
import { TelegramService } from '../services/telegram.service'
import { WhatsAppService } from '../services/whatsapp.service'
import { generateRecurringReminders } from '../services/medication.service'

export class ReminderWorker {
  private static readonly NOTIFICATION_WINDOW = 5 // 5 minutos para frente
  private static readonly PAST_WINDOW = 30 // 30 minutos para trás
  private static readonly CHECK_INTERVAL = 1 // 1 minuto
  private static readonly CLEANUP_INTERVAL = 24 * 60 // 24 horas
  private static isRunning = false

  static async start() {
    if (this.isRunning) return
    this.isRunning = true

    console.log('🚀 Iniciando ReminderWorker')

    // Inicia o loop de verificação de lembretes
    setInterval(() => this.checkReminders(), this.CHECK_INTERVAL * 60 * 1000)
    
    // Inicia o loop de limpeza de lembretes antigos
    setInterval(() => this.cleanupOldReminders(), this.CLEANUP_INTERVAL * 60 * 1000)
    
    // Executa a primeira verificação imediatamente
    await this.checkReminders()
    await this.cleanupOldReminders()
  }

  private static async cleanupOldReminders() {
    try {
      const now = new Date()
      const cutoffDate = addDays(now, -7) // Mantém apenas 7 dias de histórico para medicamentos contínuos

      // Primeiro busca os lembretes antigos de medicamentos contínuos
      const oldReminders = await prisma.reminder.findMany({
        where: {
          scheduledFor: {
            lt: cutoffDate
          },
          medication: {
            isRecurring: true
          }
        },
        include: {
          medication: true
        }
      })

      if (oldReminders.length > 0) {
        console.log(`🗄️ Movendo ${oldReminders.length} lembretes antigos para o histórico...`)

        // Cria registros no histórico para cada lembrete
        await prisma.medicationLog.createMany({
          data: oldReminders.map(reminder => ({
            medicationId: reminder.medicationId,
            takenAt: reminder.takenAt || reminder.scheduledFor,
            skipped: reminder.skipped,
            skippedReason: reminder.skippedReason || undefined,
            notes: `Lembrete contínuo ${reminder.id} arquivado automaticamente`
          })),
          skipDuplicates: true
        })

        // Depois de criar o histórico, apaga os lembretes antigos
        await prisma.reminder.deleteMany({
          where: {
            id: {
              in: oldReminders.map(r => r.id)
            }
          }
        })

        console.log('✅ Lembretes movidos para o histórico e removidos com sucesso')
      } else {
        console.log('ℹ️ Nenhum lembrete antigo para arquivar')
      }

      console.log('🧹 Limpeza de lembretes antigos concluída')
    } catch (error) {
      console.error('Erro ao limpar lembretes antigos:', error)
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

      // Para cada usuário, busca e processa seus lembretes
      for (const user of users) {
        const userTimezone = user.timezone || 'America/Sao_Paulo'
        
        // Busca lembretes não notificados no período
        const reminders = await prisma.reminder.findMany({
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
                interval: true,
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

        // Gera próximos lembretes para medicamentos contínuos
        const recurringMedications = await prisma.medication.findMany({
          where: {
            userId: user.id,
            isRecurring: true
          }
        })

        for (const medication of recurringMedications) {
          await generateRecurringReminders(medication.id)
        }

        if (reminders.length === 0) {
          console.log(`❌ Nenhum lembrete encontrado para o usuário ${user.id} no período`)
          continue
        }

        console.log(`✅ Usuário ${user.id}: ${reminders.length} lembretes encontrados:`)
        
        // Processa os lembretes
        for (const reminder of reminders) {
          console.log(`- ${reminder.medication.name} agendado para ${reminder.scheduledFor.toLocaleString()}`)
          await sendMedicationReminder({
            medicationId: reminder.medication.id,
            userId: reminder.medication.userId,
            scheduledFor: reminder.scheduledFor
          })
        }
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error)
    }
  }
}
