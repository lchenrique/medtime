import { prisma } from '../lib/prisma'
import { sendMedicationReminder } from '../services/notification.service'
import { addMinutes } from 'date-fns'

export class ReminderWorker {
  private static isRunning = false
  private static readonly CHECK_INTERVAL = 60000 // 1 minuto
  private static readonly NOTIFICATION_WINDOW = 5 // minutos antes do horário

  static async start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('🔔 Iniciando worker de lembretes...')
    
    // Executa imediatamente e depois a cada intervalo
    await this.checkReminders()
    setInterval(() => this.checkReminders(), this.CHECK_INTERVAL)
  }

  private static async checkReminders() {
    try {
      const now = new Date()
      const windowStart = now
      const windowEnd = addMinutes(now, this.NOTIFICATION_WINDOW)

      // Busca lembretes não tomados/pulados que estão próximos do horário
      const upcomingReminders = await prisma.reminder.findMany({
        where: {
          taken: false,
          skipped: false,
          scheduledFor: {
            gte: windowStart,
            lte: windowEnd
          }
        },
        include: {
          medication: {
            select: {
              userId: true,
              name: true,
              remainingQuantity: true,
              dosageQuantity: true,
              unit: true
            }
          }
        }
      })

      console.log(`Encontrados ${upcomingReminders.length} lembretes para notificar`)

      // Processa cada lembrete
      for (const reminder of upcomingReminders) {
        // Verifica se já tem estoque suficiente
        if (reminder.medication.remainingQuantity < reminder.medication.dosageQuantity) {
          console.log(`Estoque insuficiente para ${reminder.medication.name}`)
          continue
        }

        // Envia a notificação
        await sendMedicationReminder({
          medicationId: reminder.medicationId,
          scheduledFor: reminder.scheduledFor,
          userId: reminder.medication.userId
        })
      }
    } catch (error) {
      console.error('Erro ao verificar lembretes:', error)
    }
  }
} 