import { FastifyInstance } from 'fastify'
import { prisma } from '../../lib/prisma'
import { sendNotification } from '../../services/notification.service'
import { WhatsAppService } from '../../services/whatsapp.service'

export default async function testRoutes(app: FastifyInstance) {
  app.post('/test-fcm', async (request, reply) => {
    try {
      // Busca o primeiro usuário que tem token FCM
      const user = await prisma.user.findFirst({
        where: {
          fcmToken: { not: null }
        }
      })

      if (!user) {
        return reply.status(404).send({ error: 'Nenhum usuário com token FCM encontrado' })
      }

      // Envia notificação de teste
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

      return { success: true, message: 'Notificação enviada com sucesso' }
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error)
      return reply.status(500).send({ error: 'Erro ao enviar notificação' })
    }
  })

  app.post('/test-whatsapp', async (request, reply) => {
    try {
      // Busca o primeiro usuário com WhatsApp habilitado
      const user = await prisma.user.findFirst({
        where: {
          whatsappEnabled: true,
          whatsappNumber: { not: null }
        }
      })

      if (!user) {
        return reply.status(404).send({ error: 'Nenhum usuário com WhatsApp habilitado encontrado' })
      }

      // Envia notificação de teste via WhatsApp
      console.log('Enviando mensagem WhatsApp usando template:', 'medicin_tempolate ')
      await WhatsAppService.sendMedicationReminder(
        user.whatsappNumber!,
        'Medicamento Teste',
        1,
        new Date(),
        10,
        'teste-123',
        'Descrição do medicamento teste',
        'medicin_tempolate'
      )

      return { success: true, message: 'Mensagem WhatsApp enviada com sucesso' }
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error)
      return reply.status(500).send({ 
        error: 'Erro ao enviar mensagem WhatsApp',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }
  })
}
