import { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization
    console.log('Auth Header:', authHeader) // Debug

    if (!authHeader) {
      throw new Error('Token não fornecido')
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('Token extraído:', token) // Debug

    const { data: { user }, error } = await supabase.auth.getUser(token)
    console.log('Resposta Supabase:', { user, error }) // Debug

    if (error || !user) {
      throw error || new Error('Usuário não encontrado')
    }

    // Adiciona o usuário ao request
    request.user = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name || '',
    }
  } catch (error) {
    console.error('Erro de autenticação:', error) // Debug
    reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: error instanceof Error ? error.message : 'Token inválido ou expirado'
    })
  }
} 