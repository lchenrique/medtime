import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'

export default async function resetRoutes(app: FastifyInstance) {
  app.post('/reset', { onRequest: [app.authenticate] }, async (request, reply) => {
    try {
      const { id: userId } = request.user

      // Limpa todos os dados do usuário em uma transação
      await prisma.$transaction(async (tx) => {
        // Remove todos os logs de medicamentos
        await tx.medicationLog.deleteMany({
          where: {
            medication: {
              userId
            }
          }
        })

        // Remove todos os lembretes
        await tx.reminder.deleteMany({
          where: {
            medication: {
              userId
            }
          }
        })

        // Remove todos os medicamentos
        await tx.medication.deleteMany({
          where: {
            userId
          }
        })
      })

      return { success: true, message: 'Banco de dados resetado com sucesso' }
    } catch (error) {
      console.error('Erro ao resetar banco:', error)
      return reply.status(500).send({ error: 'Erro ao resetar banco de dados' })
    }
  })
}
