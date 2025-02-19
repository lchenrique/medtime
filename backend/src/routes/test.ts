import { FastifyInstance } from 'fastify'
import { sendNotification } from '@/services/notification.service'
import { prisma } from '@/lib/prisma'

export default async function testRoutes(app: FastifyInstance) {
  app.post('/test-fcm', async (request, reply) => {
    try {
      console.log('🔍 Buscando usuário com token FCM...')
      // Busca o primeiro usuário que tem token FCM
      const user = await prisma.user.findFirst({
        where: {
          fcmToken: { not: null }
        },
        select: {
          id: true,
          fcmToken: true
        }
      })

      if (!user) {
        console.log('❌ Nenhum usuário com token FCM encontrado')
        return reply.status(404).send({ error: 'Nenhum usuário com token FCM encontrado' })
      }

      console.log('✅ Usuário encontrado:', { id: user.id, tokenLength: user.fcmToken?.length })

      // Envia notificação de teste
      console.log('📤 Enviando notificação de teste...')
      await sendNotification({
        userId: user.id,
        title: 'Teste FCM',
        body: 'Esta é uma notificação de teste do FCM',
        data: {
          type: 'REMINDER',
          medicationId: 'teste-123',
          dosage: '1 comprimido',
          timestamp: new Date().toISOString()
        }
      })

      console.log('✅ Notificação enviada com sucesso')
      return { success: true, message: 'Notificação enviada com sucesso' }
    } catch (error) {
      console.error('❌ Erro detalhado ao enviar notificação de teste:', error)
      return reply.status(500).send({ error: 'Erro ao enviar notificação' })
    }
  })
} 