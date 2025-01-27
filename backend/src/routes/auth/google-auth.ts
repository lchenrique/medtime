import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { supabase } from '../../lib/supabase'
import { env } from '../../env'

export const googleAuth: FastifyPluginAsyncZod = async (app) => {
  // Inicia o fluxo de login
  app.get('/login', async (request, reply) => {
    const redirectUrl = `${env.API_URL}/auth/google/callback`
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) throw error
    return reply.redirect(data.url)
  })

  // Callback do Google
  app.get('/callback', async (request, reply) => {
    const { code } = request.query as { code: string }
    
    try {
      console.log('Recebido código do Google:', code)
      
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) throw error
      if (!user) throw new Error('Usuário não encontrado')

      console.log('Usuário autenticado:', user.email)

      // Verifica se já existe um usuário com este email
      const existingUser = await prisma.user.findFirst({
        where: { email: user.email! }
      })

      let prismaUser
      if (existingUser) {
        // Se existir, atualiza o ID do Supabase para este usuário
        prismaUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            id: user.id // Atualiza para o novo ID do Supabase
          }
        })
        console.log('Conta existente sincronizada:', prismaUser.email)
      } else {
        // Se não existir, cria um novo usuário
        prismaUser = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata.name || user.email!.split('@')[0],
            timezone: 'America/Sao_Paulo',
            whatsappEnabled: false,
            telegramEnabled: false,
            tauriEnabled: false,
            isDiabetic: false,
            hasHeartCondition: false,
            hasHypertension: false
          }
        })
        console.log('Novo usuário criado:', prismaUser.email)
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      console.log('Token gerado:', session?.access_token ? 'Sim' : 'Não')

      // Redireciona para o frontend com o token
      const redirectUrl = `${env.FRONTEND_URL}/auth/callback?token=${session!.access_token}`
      console.log('Redirecionando para:', redirectUrl)
      
      return reply.redirect(redirectUrl)
    } catch (err: any) {
      // Em caso de erro, redireciona para o frontend com o erro
      return reply.redirect(`${env.FRONTEND_URL}/auth/callback?error=${encodeURIComponent(err.message)}`)
    }
  })
} 