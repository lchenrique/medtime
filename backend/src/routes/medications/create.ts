import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'

const UnitEnum = z.enum(['comprimidos', 'ml', 'gotas', 'doses'])

// Schema para criação de medicamento
const createMedicationSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().nullable(),
  startTime: z.string().datetime(),
  intervalPreset: z.enum(['6/6', '8/8', '12/12', '24/24']),
  durationInDays: z.coerce.number().min(0),
  totalQuantity: z.coerce.number().positive(),
  unit: UnitEnum,
  dosageQuantity: z.coerce.number().positive()
})

type CreateMedicationBody = z.infer<typeof createMedicationSchema>

// Função para gerar lembretes
function generateReminders(
  medicationId: string,
  startDate: Date,
  duration: number,
  interval: number
) {
  const reminders = []
  const currentDate = new Date(startDate)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + duration)

  // Ajusta para considerar apenas a data, sem a hora
  const baseHour = currentDate.getHours()
  const baseMinutes = currentDate.getMinutes()

  let reminderTime = new Date(currentDate)

  while (reminderTime < endDate) {
    reminders.push({
      medicationId,
      scheduledFor: new Date(reminderTime),
      taken: false,
      skipped: false
    })

    // Avança para o próximo horário
    reminderTime = new Date(reminderTime.getTime() + interval * 60 * 60 * 1000)
  }

  return reminders
}

export const create: FastifyPluginAsyncZod = async (app) => {
  app.post('/', {
    schema: {
      tags: ['medications'],
      description: 'Cria um novo medicamento',
      body: createMedicationSchema,
      response: {
        201: z.object({
          id: z.string(),
          name: z.string(),
          description: z.string().nullable(),
          startDate: z.string(),
          duration: z.number().nullable(),
          interval: z.number(),
          isRecurring: z.boolean(),
          totalQuantity: z.number(),
          remainingQuantity: z.number(),
          unit: z.string(),
          dosageQuantity: z.number(),
          userId: z.string(),
          createdAt: z.string(),
          updatedAt: z.string(),
          reminders: z.array(z.object({
            id: z.string(),
            scheduledFor: z.string(),
            taken: z.boolean(),
            takenAt: z.string().nullable(),
            skipped: z.boolean(),
            skippedReason: z.string().nullable(),
            createdAt: z.string(),
            updatedAt: z.string()
          }))
        }),
        400: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { id: userId } = request.user
    const data = request.body as CreateMedicationBody

    try {
      // Extrai o intervalo do preset (ex: '6/6' -> 6)
      const interval = parseInt(data.intervalPreset.split('/')[0])
      
      // Um medicamento é recorrente se não tiver duração definida
      const isRecurring = data.durationInDays === 0
      
      // Se não for recorrente, usa a duração especificada ou 30 dias
      const duration = isRecurring ? null : (data.durationInDays || 30)
      
      // Cria o medicamento
      const medication = await prisma.medication.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startTime),
          duration,
          interval,
          isRecurring,
          totalQuantity: data.totalQuantity,
          remainingQuantity: data.totalQuantity,
          unit: data.unit,
          dosageQuantity: data.dosageQuantity,
          userId,
        }
      })

      // Gera os lembretes físicos para os próximos 7 dias
      const reminders = generateReminders(
        medication.id,
        new Date(data.startTime),
        isRecurring ? 7 : duration!, // Se for recorrente, gera para 7 dias
        interval
      )

      await prisma.reminder.createMany({
        data: reminders
      })

      // Busca o medicamento com os lembretes
      const medicationWithReminders = await prisma.medication.findUnique({
        where: { id: medication.id },
        include: {
          reminders: true
        }
      })

      if (!medicationWithReminders) {
        throw new Error('Erro ao buscar medicamento após criação')
      }

      return reply.status(201).send({
        ...medicationWithReminders,
        startDate: medicationWithReminders.startDate.toISOString(),
        createdAt: medicationWithReminders.createdAt.toISOString(),
        updatedAt: medicationWithReminders.updatedAt.toISOString(),
        reminders: medicationWithReminders.reminders.map(reminder => ({
          ...reminder,
          scheduledFor: reminder.scheduledFor.toISOString(),
          takenAt: reminder.takenAt?.toISOString() || null,
          createdAt: reminder.createdAt.toISOString(),
          updatedAt: reminder.updatedAt.toISOString()
        }))
      })
    } catch (error) {
      console.error('Erro detalhado:', error)
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Erro ao criar medicamento'
      })
    }
  })
} 