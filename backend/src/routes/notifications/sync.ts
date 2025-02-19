import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { startOfDay, subMinutes } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'

const syncQuerySchema = z.object({
  lastSync: z.string().datetime().optional()
})

export const syncNotifications: FastifyPluginAsync = async (app) => {
  app.get('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['notifications'],
      description: 'Sincroniza notificações locais para cliente Tauri',
      querystring: syncQuerySchema,
      response: {
        200: z.array(z.object({
          id: z.string(),
          scheduledFor: z.string(),
          medication: z.object({
            id: z.string(),
            name: z.string(),
            dosageQuantity: z.number(),
            unit: z.string()
          })
        }))
      }
    }
  }, async (request) => {
    const { lastSync } = syncQuerySchema.parse(request.query)
    const { id: userId } = request.user

    // Busca o usuário para verificar se tem Tauri habilitado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        tauriEnabled: true,
        timezone: true,
        updatedAt: true // Para saber quando Tauri foi ativado
      }
    })

    if (!user?.tauriEnabled) {
      return []
    }

    // Usa o timezone do usuário
    const userTimezone = user.timezone || 'America/Sao_Paulo'
    const now = new Date()
    const userNow = toZonedTime(now, userTimezone)
    const todayStart = startOfDay(userNow)
    const toleranceLimit = subMinutes(userNow, 30)

    // Busca lembretes desde o início do dia atual
    const reminders = await prisma.reminder.findMany({
      where: {
        medication: { userId },
        scheduledFor: { 
          gte: todayStart
        },
        taken: false,
        skipped: false,
        // Só retorna lembretes criados/atualizados após a última ativação do Tauri
        OR: [
          { updatedAt: { gt: user.updatedAt } },
          { createdAt: { gt: user.updatedAt } }
        ]
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            dosageQuantity: true,
            unit: true
          }
        }
      },
      orderBy: {
        scheduledFor: 'asc'
      },
      take: 50
    })

    // Converte as datas para o timezone do usuário para comparação
    const remindersInUserTz = reminders.map(r => ({
      ...r,
      scheduledFor: toZonedTime(r.scheduledFor, userTimezone)
    }))

    // Separa os lembretes usando datas no timezone do usuário
    const oldReminders = remindersInUserTz.filter(r => r.scheduledFor <= toleranceLimit)
    const recentReminders = remindersInUserTz.filter(r => r.scheduledFor > toleranceLimit && r.scheduledFor <= userNow)
    const futureReminders = remindersInUserTz.filter(r => r.scheduledFor > userNow)

    // Registra no log e remove apenas os lembretes muito antigos
    if (oldReminders.length > 0) {
      await prisma.$transaction(async (tx) => {
        // Cria logs para lembretes muito antigos
        await tx.medicationLog.createMany({
          data: oldReminders.map(reminder => ({
            medicationId: reminder.medicationId,
            notes: 'Notificação não entregue - Tempo excedido'
          }))
        })

        // Remove apenas os lembretes muito antigos
        await tx.reminder.deleteMany({
          where: {
            id: {
              in: oldReminders.map(r => r.id)
            }
          }
        })
      })
    }

    // Retorna lembretes recentes e futuros
    return [...recentReminders, ...futureReminders].map(reminder => ({
      id: reminder.id,
      scheduledFor: reminder.scheduledFor.toISOString(),
      medication: reminder.medication
    }))
  })
} 