import { FastifyPluginAsync } from 'fastify'
import { prisma } from '../../lib/prisma'
import { env } from '../../env'
import { WhatsAppService } from '../../services/whatsapp.service'

export const whatsappWebhookRoutes: FastifyPluginAsync = async (app) => {
  // Rota para verificação do webhook pelo WhatsApp
  app.get('/', async (request, reply) => {
    const query = request.query as any
    const mode = query['hub.mode']
    const token = query['hub.verify_token']
    const challenge = query['hub.challenge']

    if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
      return reply.status(200).send(challenge)
    }

    return reply.status(403).send('Forbidden')
  })

  // Rota para receber as notificações do WhatsApp
  app.post('/', async (request, reply) => {
    const body = request.body as any
    
    console.log('📱 Webhook do WhatsApp recebido:', JSON.stringify(body, null, 2))

    try {
      // Verifica se é uma mensagem de resposta a botão
      if (body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.interactive?.button_reply) {
        console.log('🔘 Resposta de botão detectada')
        const buttonReply = body.entry[0].changes[0].value.messages[0].interactive.button_reply
        const from = body.entry[0].changes[0].value.messages[0].from
        const normalizedNumber = from.startsWith('+') ? from : `+${from}`
        
        console.log('- ID do botão:', buttonReply.id)
        console.log('- Número do usuário:', normalizedNumber)

        // Extrai o ID do reminder do botão
        const [action, reminderId] = buttonReply.id.split(':')

        // Se o botão clicado foi o de medicamento tomado
        if (action === 'medication_taken' && reminderId) {
          console.log('✅ Botão de medicamento tomado clicado para o reminder:', reminderId)
          
          // Busca o usuário pelo número do WhatsApp
          const user = await prisma.user.findFirst({
            where: {
              whatsappNumber: normalizedNumber,
              whatsappEnabled: true
            }
          })

          console.log('👤 Usuário encontrado:', user?.id)

          if (user) {
            // Busca o lembrete específico pelo ID
            const reminder = await prisma.reminder.findFirst({
              where: {
                id: reminderId,
                medication: {
                  userId: user.id
                },
                taken: false
              },
              include: {
                medication: true
              }
            })

            console.log('🔔 Lembrete encontrado:', reminder?.id)

            if (reminder) {
              // Marca o lembrete como tomado
              await prisma.reminder.update({
                where: {
                  id: reminder.id
                },
                data: {
                  notified: true,
                  taken: true,
                  takenAt: new Date()
                }
              })

              console.log('✅ Lembrete marcado como tomado')

              // Atualiza o estoque do medicamento
              await prisma.medication.update({
                where: {
                  id: reminder.medicationId
                },
                data: {
                  remainingQuantity: {
                    decrement: reminder.medication.dosageQuantity
                  }
                }
              })

              console.log('📦 Estoque atualizado')

              // Envia mensagem de confirmação
              await WhatsAppService.sendMessage(
                normalizedNumber,
                `✅ ${reminder.medication.name} marcado como tomado às ${new Date().toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Sao_Paulo'
                })}`
              )
            } else {
              console.log('❌ Lembrete não encontrado ou já tomado:', reminderId)
              // Envia mensagem informando que já foi tomado
              await WhatsAppService.sendMessage(
                normalizedNumber,
                `❌ Este medicamento já foi marcado como tomado!`
              )
            }
          } else {
            console.log('❌ Usuário não encontrado com o número:', normalizedNumber)
          }
        }
      }

      return reply.status(200).send('OK')
    } catch (error) {
      console.error('❌ Erro processando webhook:', error)
      return reply.status(500).send('Internal Server Error')
    }
  })
} 