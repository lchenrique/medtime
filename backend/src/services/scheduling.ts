import { Medication, Reminder } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { sendPushNotification } from '../lib/firebase'
import { addHours, addDays } from 'date-fns'

interface ScheduleNotification {
  userId: string
  medicationId: string
  scheduledFor: Date
  message: string
}

export class SchedulingService {
  async scheduleNotifications(medication: Medication) {
    const notifications = await this.generateNotificationSchedule(medication)
    const reminders = await this.saveReminders(notifications)
    await this.dispatchToChannels(reminders)
    return reminders
  }

  private async generateNotificationSchedule(medication: Medication): Promise<ScheduleNotification[]> {
    const notifications: ScheduleNotification[] = []
    const { startDate, duration, interval } = medication
    
    let currentDate = new Date(startDate)
    const endDate = addDays(startDate, duration)

    while (currentDate < endDate) {
      notifications.push({
        userId: medication.userId,
        medicationId: medication.id,
        scheduledFor: currentDate,
        message: `Hora de tomar ${medication.name} - ${medication.dosageQuantity} ${medication.unit}`
      })

      // Avança para o próximo horário baseado no intervalo (em horas)
      currentDate = addHours(currentDate, interval)
    }

    return notifications
  }

  private async saveReminders(notifications: ScheduleNotification[]): Promise<Reminder[]> {
    // Cria os lembretes em batch
    const reminders = await prisma.reminder.createMany({
      data: notifications.map(notification => ({
        medicationId: notification.medicationId,
        scheduledFor: notification.scheduledFor,
        taken: false,
        skipped: false
      })),
    })

    // Retorna os lembretes criados
    return await prisma.reminder.findMany({
      where: {
        medicationId: notifications[0].medicationId,
        scheduledFor: {
          gte: notifications[0].scheduledFor
        }
      },
      include: {
        medication: true
      }
    })
  }

  private async dispatchToChannels(reminders: Reminder[]) {
    if (!reminders.length) return

    const medication = await prisma.medication.findUnique({
      where: { id: reminders[0].medicationId },
      include: { user: true }
    })

    if (!medication || !medication.user) return

    const { user } = medication

    // Web Push via Firebase
    if (user.fcmToken) {
      for (const reminder of reminders) {
        await sendPushNotification({
          token: user.fcmToken,
          title: 'Lembrete de Medicação',
          body: `Hora de tomar ${medication.name} - ${medication.dosageQuantity} ${medication.unit}`,
          data: {
            medicationId: medication.id,
            reminderId: reminder.id,
            scheduledFor: reminder.scheduledFor.toISOString()
          }
        })
      }
    }

    // Se o usuário usa Tauri, retorna os dados para sincronização local
    if (user.tauriEnabled) {
      return reminders.map(reminder => ({
        id: reminder.id,
        scheduledFor: reminder.scheduledFor,
        medication: {
          id: medication.id,
          name: medication.name,
          dosageQuantity: medication.dosageQuantity,
          unit: medication.unit
        }
      }))
    }
  }
} 