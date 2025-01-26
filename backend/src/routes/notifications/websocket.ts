import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { FastifyRequest } from 'fastify'
import { WebSocket } from 'ws'
import { prisma } from '../../lib/prisma'
import { z } from 'zod'
import { supabase } from '../../lib/supabase'

// Define o tipo da conexão WebSocket
type Connection = WebSocket & { clientType: 'tauri' }

// Map global para conexões - agora armazena um array de conexões por usuário
const connections = new Map<string, Connection[]>()

export const websocketRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/ws', {
    websocket: true,
    schema: {
      tags: ['notifications'],
      description: 'Conexão WebSocket para notificações em tempo real (apenas Tauri)',
      querystring: z.object({
        token: z.string(),
        client: z.literal('tauri')
      })
    }
  }, async (connection, request) => {
    try {
      const { token, client } = request.query as { token: string, client: 'tauri' }
      console.log('Token recebido:', token)
      console.log('Cliente:', client)
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

      // Adiciona o tipo de cliente à conexão
      (connection as Connection).clientType = 'tauri'

      console.log(`WebSocket autenticado: ${userId} (tauri)`)
      
      // Armazena conexão
      if (!connections.has(userId)) {
        connections.set(userId, [])
      }
      connections.get(userId)?.push(connection as Connection)

      // Configura ping/pong para manter a conexão ativa
      const pingInterval = setInterval(() => {
        if (connection.readyState === WebSocket.OPEN) {
          connection.ping()
        }
      }, 30000) // Ping a cada 30 segundos

      // Cleanup
      connection.on('close', () => {
        console.log(`WebSocket fechado: ${userId} (tauri)`)
        clearInterval(pingInterval)
        const userConnections = connections.get(userId)
        if (userConnections) {
          const index = userConnections.indexOf(connection as Connection)
          if (index > -1) {
            userConnections.splice(index, 1)
          }
          if (userConnections.length === 0) {
            connections.delete(userId)
          }
        }
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

    const userConnections = connections.get(userId)
    if (!userConnections?.length) {
      console.log('❌ Usuário não conectado ao WebSocket:', userId)
      return
    }

    console.log('✅ Enviando notificação via WebSocket')
    // Envia para todas as conexões do usuário
    userConnections.forEach(connection => {
      connection.send(JSON.stringify(notification))
      console.log('✅ Notificação enviada com sucesso (tauri)')
    })
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error)
  }
} 