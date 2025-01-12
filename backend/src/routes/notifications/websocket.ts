import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { FastifyRequest } from 'fastify'
import { WebSocket } from 'ws'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'

// Define o tipo da conexão WebSocket
type Connection = WebSocket

// Map global para conexões
const connections = new Map<string, Connection>()

export const websocketRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/ws', {
    websocket: true,
    schema: {
      tags: ['notifications'],
      description: 'Conexão WebSocket para notificações em tempo real',
      querystring: z.object({
        token: z.string()
      })
    }
  }, async (connection, request) => {
    try {
      const { token } = request.query as { token: string }
      console.log('Token recebido:', token)
      console.log('Nova conexão WebSocket recebida')

      // Verifica o token do Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token)
      
      if (error || !user) {
        console.error('Erro de autenticação:', error)
        connection.close(1008, 'Usuário não autenticado')
        return
      }

      const userId = user.id
      console.log('Verificando usuário:', userId)

      // Verifica se usuário existe e tem Tauri habilitado
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          tauriEnabled: true
        }
      })

      console.log('Usuário encontrado:', userRecord)

      if (!userRecord?.tauriEnabled) {
        console.log('Tauri não habilitado para usuário:', userId)
        connection.close(1008, 'Tauri não habilitado')
        return
      }

      console.log(`WebSocket autenticado: ${userId}`)
      
      // Armazena conexão
      connections.set(userId, connection)

      // Cleanup
      connection.on('close', () => {
        console.log(`WebSocket fechado: ${userId}`)
        connections.delete(userId)
      })

    } catch (error) {
      console.error('Erro detalhado na conexão WebSocket:', error)
      connection.close(1008, error instanceof Error ? error.message : 'Erro interno')
    }
  })
}

// Função para enviar notificação
export async function sendWebSocketNotification(userId: string, notification: { type: 'REMINDER' | 'STOCK_LOW' | 'MEDICATION_UPDATE', data: any }) {
  try {
    console.log('📤 Tentando enviar notificação:', {
      userId,
      type: notification.type,
      data: notification.data
    })

    const connection = connections.get(userId)
    if (!connection) {
      console.log('❌ Usuário não conectado ao WebSocket:', userId)
      return
    }

    console.log('✅ Enviando notificação via WebSocket')
    connection.send(JSON.stringify(notification))
    console.log('✅ Notificação enviada com sucesso')
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error)
  }
} 