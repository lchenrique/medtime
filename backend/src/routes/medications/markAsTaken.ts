import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { markVirtualReminderAsTaken } from '../../services/medication.service'

const markAsTakenSchema = z.object({
  reminderId: z.string(),
  scheduledFor: z.string().datetime(),
  taken: z.boolean()
})

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string()
})

export async function markAsTaken(app: FastifyInstance) {
  app.put('/mark-as-taken', {
    schema: {
      body: markAsTakenSchema,
      response: {
        200: z.object({
          id: z.string(),
          scheduledFor: z.string(),
          taken: z.boolean(),
          takenAt: z.string().nullable(),
          skipped: z.boolean(),
          skippedReason: z.string().nullable(),
          createdAt: z.string(),
          updatedAt: z.string()
        }),
        404: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        }),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { reminderId, scheduledFor, taken } = markAsTakenSchema.parse(request.body)
      
      // Verifica se é um lembrete virtual
      if (reminderId.startsWith('virtual_')) {
        const medicationId = reminderId.split('_')[1]
        
        // Busca o medicamento
        const medication = await prisma.medication.findUnique({
          where: { id: medicationId },
          include: {
            user: true
          }
        })
        
        if (!medication) {
          return reply.status(404).send({
            statusCode: 404,
            error: 'Not Found',
            message: 'Medicamento não encontrado'
          })
        }
        
        // Verifica se o usuário tem permissão
        if (medication.userId !== request.user.id) {
          return reply.status(403).send({
            statusCode: 403,
            error: 'Forbidden',
            message: 'Você não tem permissão para marcar este medicamento'
          })
        }
        
        // Marca o lembrete virtual como tomado
        const reminder = await markVirtualReminderAsTaken(medicationId, new Date(scheduledFor), taken)
        
        return {
          ...reminder,
          scheduledFor: reminder.scheduledFor.toISOString(),
          takenAt: reminder.takenAt?.toISOString() || null,
          createdAt: reminder.createdAt.toISOString(),
          updatedAt: reminder.updatedAt.toISOString()
        }
      }
      
      // Busca o lembrete físico
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
        include: {
          medication: {
            include: {
              user: true
            }
          }
        }
      })
      
      if (!reminder) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Lembrete não encontrado'
        })
      }
      
      // Verifica se o usuário tem permissão
      if (reminder.medication.userId !== request.user.id) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Você não tem permissão para marcar este medicamento'
        })
      }
      
      // Atualiza o lembrete
      const [updatedReminder] = await prisma.$transaction([
        prisma.reminder.update({
          where: { id: reminderId },
          data: {
            taken,
            takenAt: taken ? new Date() : null
          }
        }),
        prisma.medication.update({
          where: { id: reminder.medicationId },
          data: {
            remainingQuantity: {
              [taken ? 'decrement' : 'increment']: reminder.medication.dosageQuantity
            }
          }
        })
      ])
      
      return {
        ...updatedReminder,
        scheduledFor: updatedReminder.scheduledFor.toISOString(),
        takenAt: updatedReminder.takenAt?.toISOString() || null,
        createdAt: updatedReminder.createdAt.toISOString(),
        updatedAt: updatedReminder.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Erro ao marcar medicamento:', error)
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao marcar medicamento'
      })
    }
  })
} 