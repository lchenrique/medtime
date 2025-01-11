import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { supabase } from '../../lib/supabase'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6)
})

const authResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    createdAt: z.date(),
    updatedAt: z.date()
  })
})

export const register: FastifyPluginAsyncZod = async (app) => {
  app.post('/', {
    schema: {
      tags: ['auth'],
      summary: 'Registro',
      description: 'Registra um novo usuário.',
      body: registerSchema,
      response: {
        201: authResponseSchema,
        400: z.object({
          statusCode: z.number(),
          error: z.string(),
          code: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { name, email, password } = request.body as z.infer<typeof registerSchema>

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })

      if (authError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          code: 'REGISTRATION_ERROR',
          message: authError.message
        })
      }

      if (!authData.user) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          code: 'REGISTRATION_ERROR',
          message: 'Erro ao criar usuário'
        })
      }

      const user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          name: name,
          timezone: 'America/Sao_Paulo'
        }
      })

      if (!authData.session?.access_token) {
        return reply.status(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          code: 'TOKEN_NOT_GENERATED',
          message: 'Erro ao gerar token de acesso'
        })
      }

      return reply.status(201).send({
        token: authData.session.access_token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    } catch (error) {
      console.error('Erro ao registrar usuário:', error)
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        code: 'REGISTRATION_ERROR',
        message: 'Erro ao registrar usuário'
      })
    }
  })
}
