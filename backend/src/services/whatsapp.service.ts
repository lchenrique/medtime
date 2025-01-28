import { env } from '../env'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export class WhatsAppService {
  private static readonly API_URL = 'https://graph.facebook.com/v17.0'
  static readonly LOGO = `🟣 MedTime 🟣
⌚️ 💊
Sistema de Lembretes`

  private static formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    return phone.replace(/\D/g, '')
  }

  static async sendMessage(to: string, message: string, buttons?: { id: string, title: string }[]) {
    try {
      const formattedPhone = this.formatPhoneNumber(to)
      console.log('Enviando mensagem WhatsApp para:', formattedPhone)
      console.log('Mensagem:', message)

      const body: any = {
        messaging_product: 'whatsapp',
        to: formattedPhone,
        type: buttons ? 'interactive' : 'text',
      }

      if (buttons) {
        body.interactive = {
          type: 'button',
          body: {
            text: message
          },
          action: {
            buttons: buttons.map(button => ({
              type: 'reply',
              reply: {
                id: button.id,
                title: button.title
              }
            }))
          }
        }
      } else {
        body.text = {
          body: message
        }
      }

      const response = await fetch(
        `${this.API_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      )

      const responseData = await response.json()
      
      if (!response.ok) {
        // Verifica se é erro de token expirado
        if (responseData.error?.code === 190) {
          console.error('\n⚠️ TOKEN DO WHATSAPP EXPIRADO!')
          console.error('Por favor, gere um novo token em:')
          console.error('https://developers.facebook.com/apps/ > WhatsApp > Configuração\n')
        }

        console.error('WhatsApp API error:', responseData)
        throw new Error(`WhatsApp API error: ${JSON.stringify(responseData)}`)
      }

      console.log('WhatsApp API response:', responseData)
      return responseData
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      throw error
    }
  }

  static async sendMedicationReminder(
    to: string,
    medicationName: string,
    dosage: number,
    scheduledFor: Date,
    remainingQuantity: number,
    reminderId: string,
    description?: string,
    templateName?: string,
  ) {
    // Formata a hora no formato HH:mm
    const formattedTime = format(scheduledFor, "HH:mm", { locale: ptBR })
    // Formata a data no formato dd/MM
    const formattedDate = format(scheduledFor, "dd/MM", { locale: ptBR })

    // Sempre usa mensagem padrão
    let message = `🔔 Hora do seu medicamento!\n\n` +
      `💊 ${medicationName}\n` +
      `📝 Dose: ${dosage} unidade(s)\n` +
      `🕐 Horário: ${formattedTime} do dia ${formattedDate}`

    if (description) {
      message += `\n📋 Observações: ${description}`
    }

    if (remainingQuantity <= 5) {
      message += `\n\n⚠️ Atenção: Estoque baixo! Considere comprar mais.`
    }

    return this.sendMessage(to, message, [
      { id: `medication_taken:${reminderId}`, title: 'Medicamento tomado ✅' }
    ])
  }
}
