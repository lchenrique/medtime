import TelegramBot from 'node-telegram-bot-api'
import { env } from '../env'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { prisma } from '../lib/prisma'

export class TelegramService {
  private static bot: TelegramBot
  private static readonly LOGO = `
    🟣 <b>MedTime</b> 🟣
     ⌚️ 💊
  Sistema de Lembretes
  `

  static initialize() {
    if (!this.bot) {
      this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: true })
      this.setupCommands()
      this.setupCallbacks()
    }
  }

  private static setupCommands() {
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id
      await this.bot.sendMessage(chatId, 
        `${this.LOGO}\n` +
        `👋 Olá! Bem-vindo ao bot do MedTime!\n\n` +
        `Seu Chat ID é: <code>${chatId}</code>\n\n` +
        `Guarde este número para configurar as notificações no MedTime.\n\n` +
        `Com este bot você receberá:\n` +
        `✅ Lembretes de medicamentos\n` +
        `✅ Alertas de estoque baixo\n` +
        `✅ Notificações em tempo real`, 
        { parse_mode: 'HTML' }
      )
    })
  }

  private static setupCallbacks() {
    this.bot.on('callback_query', async (callbackQuery) => {
      try {
        const [action, reminderId] = callbackQuery.data?.split(':') || []
        
        if (action === 'taken' && reminderId) {
          // Verifica se o reminder já foi tomado
          const reminder = await prisma.reminder.findFirst({
            where: {
              id: reminderId,
              taken: false
            },
            include: {
              medication: true
            }
          })

          if (!reminder) {
            await this.bot.answerCallbackQuery(callbackQuery.id, {
              text: '❌ Este medicamento já foi marcado como tomado!'
            })
            return
          }

          // Atualiza o reminder como tomado
          await prisma.reminder.update({
            where: { id: reminderId },
            data: { 
              taken: true,
              takenAt: new Date()
            }
          })

          // Atualiza o estoque do medicamento
          await prisma.medication.update({
            where: { id: reminder.medicationId },
            data: {
              remainingQuantity: {
                decrement: reminder.medication.dosageQuantity
              }
            }
          })

          // Extrai o nome do medicamento da mensagem original
          const messageText = callbackQuery.message?.text || ''
          const medicationNameMatch = messageText.match(/💊 (.*)\n/)
          const medicationName = medicationNameMatch ? medicationNameMatch[1] : reminder.medication.name

          // Atualiza a mensagem para mostrar que foi tomado
          await this.bot.editMessageText(
            `✅ ${medicationName} marcado como tomado às ${new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'America/Sao_Paulo'
            })}`,
            {
              chat_id: callbackQuery.message?.chat.id,
              message_id: callbackQuery.message?.message_id,
              parse_mode: 'HTML'
            }
          )

          // Responde ao callback
          await this.bot.answerCallbackQuery(callbackQuery.id, {
            text: '✅ Medicamento marcado como tomado!'
          })
        }
      } catch (error) {
        console.error('Erro ao processar callback:', error)
        await this.bot.answerCallbackQuery(callbackQuery.id, {
          text: '❌ Erro ao marcar medicamento como tomado'
        })
      }
    })
  }

  static async sendMessage(chatId: string, message: string) {
    try {
      this.initialize()
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML'
      })
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem no Telegram:', error)
      return false
    }
  }

  static async sendMedicationReminder(
    chatId: string, 
    medicationName: string, 
    dosage: string,
    scheduledFor: Date,
    remainingQuantity: number,
    reminderId: string,
    description?: string
  ) {
    // Formata a hora no formato HH:mm
    const formattedTime = format(scheduledFor, "HH:mm", { locale: ptBR })
    // Formata a data no formato dd/MM
    const formattedDate = format(scheduledFor, "dd/MM", { locale: ptBR })
    
    let message = `🔔 Hora do seu medicamento!\n\n` +
      `💊 ${medicationName}\n` +
      `📝 Dose: ${dosage}\n` +
      `🕐 Horário: ${formattedTime} do dia ${formattedDate}`

    if (description) {
      message += `\n📋 Observações: ${description}`
    }

    if (remainingQuantity <= 5) {
      message += `\n\n⚠️ Atenção: Estoque baixo! Considere comprar mais.`
    }

    try {
      this.initialize()
      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Marcar como Tomado', callback_data: `taken:${reminderId}` }]
          ]
        }
      })
      return true
    } catch (error) {
      console.error('Erro ao enviar mensagem no Telegram:', error)
      return false
    }
  }
} 