import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { supabase } from '../../lib/supabase'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    fcmToken: z.string().nullable(),
    whatsappEnabled: z.boolean(),
    whatsappNumber: z.string().nullable(),
    telegramEnabled: z.boolean(),
    telegramChatId: z.string().nullable(),
    timezone: z.string(),
    tauriEnabled: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
})

export const login: FastifyPluginAsyncZod = async (app) => {
  app.post('/', {
    schema: {
      tags: ['auth'],
      summary: 'Login',
      description: 'Autentica um usuário usando email e senha.',
      body: loginSchema,
      response: {
        200: authResponseSchema,
        401: z.object({
          statusCode: z.number(),
          error: z.string(),
          code: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { email, password } = request.body

    try {
      // 1. Tenta fazer login no Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha inválidos'
        })
      }

      // 2. Busca o usuário no banco
      const user = await prisma.user.findUniqueOrThrow({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          fcmToken: true,
          whatsappEnabled: true,
          whatsappNumber: true,
          telegramEnabled: true,
          telegramChatId: true,
          timezone: true,
          tauriEnabled: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return {
        token: authData.session?.access_token,
        user
      }
    } catch (error) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        code: 'INVALID_CREDENTIALS',
        message: 'Email ou senha inválidos'
      })
    }
  })
}