import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const markAsTakenSchema = z.object({
  reminderId: z.string(),
  taken: z.boolean(), // true para marcar como tomado, false para desmarcar
})

const reminderResponseSchema = z.object({
  id: z.string(),
  scheduledFor: z.string(),
  taken: z.boolean(),
  takenAt: z.string().nullable(),
  skipped: z.boolean(),
  skippedReason: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const markAsTaken: FastifyPluginAsyncZod = async (app) => {
  app.put('/mark-as-taken', {
    schema: {
      tags: ['medications'],
      description: 'Marca ou desmarca um lembrete como tomado',
      body: z.object({
        reminderId: z.string(),
        taken: z.boolean()
      }),
      response: {
        200: reminderResponseSchema,
        404: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { reminderId, taken } = request.body
    const { id: userId } = request.user

    // Verifica se o lembrete existe e pertence ao usuário
    const reminder = await prisma.reminder.findFirst({
      where: {
        id: reminderId,
        medication: {
          userId
        }
      },
      include: {
        medication: true
      }
    })

    if (!reminder) {
      return reply.status(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: 'Lembrete não encontrado'
      })
    }

    // Atualiza o lembrete
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        taken,
        takenAt: taken ? new Date() : null,
      }
    })

    // Se marcou como tomado, atualiza a quantidade restante do medicamento
    if (taken) {
      await prisma.medication.update({
        where: { id: reminder.medication.id },
        data: {
          remainingQuantity: {
            decrement: reminder.medication.dosageQuantity
          }
        }
      })
    } else {
      // Se desmarcou, devolve a quantidade ao estoque
      await prisma.medication.update({
        where: { id: reminder.medication.id },
        data: {
          remainingQuantity: {
            increment: reminder.medication.dosageQuantity
          }
        }
      })
    }

    return {
      ...updatedReminder,
      scheduledFor: updatedReminder.scheduledFor.toISOString(),
      takenAt: updatedReminder.takenAt?.toISOString() || null,
      createdAt: updatedReminder.createdAt.toISOString(),
      updatedAt: updatedReminder.updatedAt.toISOString(),
    }
  })
} 