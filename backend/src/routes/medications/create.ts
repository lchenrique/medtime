import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { SchedulingService } from '../../services/scheduling'

// Definir o schema para o intervalo
const intervalPresetSchema = z.enum(['6/6', '8/8', '12/12', '24/24'])

// Schema para criação de medicamento
const createMedicationSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  startTime: z.string().datetime(), // Espera uma string ISO
  intervalPreset: intervalPresetSchema,
  durationInDays: z.number().int().positive(),
  totalQuantity: z.number().positive(),
  unit: z.string(),
  dosageQuantity: z.number().positive(),
})

// Schema para a resposta
const medicationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.string(),
  interval: z.number(),
  duration: z.number(),
  totalQuantity: z.number(),
  remainingQuantity: z.number(),
  unit: z.string(),
  dosageQuantity: z.number(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const createMedication: FastifyPluginAsyncZod = async (app) => {
  app.post('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['medications'],
      description: 'Cria uma nova medicação',
      body: createMedicationSchema,
      response: {
        201: medicationResponseSchema,
        400: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string(),
        }),
      },
    },
  }, async (request, reply) => {
    const { id: userId } = request.user
    const data = request.body

    try {
      console.log('Dados recebidos:', data)

      const medication = await prisma.medication.create({
        data: {
          name: data.name,
          description: data.description,
          startDate: new Date(data.startTime),
          interval: parseInt(data.intervalPreset.split('/')[0]),
          duration: data.durationInDays,
          totalQuantity: data.totalQuantity,
          remainingQuantity: data.totalQuantity,
          unit: data.unit,
          dosageQuantity: data.dosageQuantity,
          userId,
        },
      })

      console.log('Medicamento criado:', medication)

      // Agenda notificações usando o SchedulingService
      const schedulingService = new SchedulingService()
      await schedulingService.scheduleNotifications(medication)

      const response = {
        ...medication,
        startDate: medication.startDate.toISOString(),
        createdAt: medication.createdAt.toISOString(),
        updatedAt: medication.updatedAt.toISOString(),
      }

      console.log('Resposta final:', response)

      return reply.status(201).send(response)
    } catch (error) {
      console.error('Erro detalhado:', error)
      
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Erro ao criar medicamento',
      })
    }
  })
} 