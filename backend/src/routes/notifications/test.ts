import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { addSeconds } from 'date-fns'

const testSchema = z.object({
  seconds: z.number().int().min(5).default(10),
  title: z.string().default('Teste de Notificação'),
  body: z.string().default('Esta é uma notificação de teste!')
})

export const testRoutes: FastifyPluginAsync = async (app) => {
  // Rota de teste para notificações
  app.post('/test', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['notifications'],
      description: 'Rota de teste para enviar notificação',
      body: testSchema,
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const { seconds, title, body } = testSchema.parse(request.body)
    const { id: userId } = request.user

    // Verifica se usuário tem Tauri habilitado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tauriEnabled: true }
    })

    if (!user?.tauriEnabled) {
      return { success: false, message: 'Tauri não habilitado' }
    }

    // Calcula a data agendada
    const scheduledFor = addSeconds(new Date(), seconds)

    // Cria um reminder de teste
    const reminder = await prisma.reminder.create({
      data: {
        scheduledFor,
        taken: false,
        skipped: false,
        medication: {
          create: {
            name: title,
            description: body,
            startDate: new Date(),
            interval: 24,
            duration: 1,
            totalQuantity: 1,
            remainingQuantity: 1,
            unit: 'comprimido',
            dosageQuantity: 1,
            userId
          }
        }
      },
      include: {
        medication: true
      }
    })

    // O ReminderWorker irá verificar este lembrete e enviar a notificação
    // quando chegar o momento agendado (scheduledFor)
    return { 
      success: true, 
      message: `Notificação agendada para ${scheduledFor.toLocaleTimeString()}`,
      scheduledFor: scheduledFor.toISOString()
    }
  })

  // Rota para resetar o banco
  app.post('/reset', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['notifications'],
      description: 'Reseta o banco de dados removendo todos os lembretes e medicamentos',
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const { id: userId } = request.user

    // Remove todos os lembretes e medicamentos do usuário
    await prisma.$transaction([
      // Primeiro deleta os logs
      prisma.medicationLog.deleteMany({
        where: {
          medication: {
            userId
          }
        }
      }),
      // Depois os lembretes
      prisma.reminder.deleteMany({
        where: {
          medication: {
            userId
          }
        }
      }),
      // Por fim os medicamentos
      prisma.medication.deleteMany({
        where: {
          userId
        }
      })
    ])

    return { 
      success: true, 
      message: 'Banco resetado com sucesso'
    }
  })
} 