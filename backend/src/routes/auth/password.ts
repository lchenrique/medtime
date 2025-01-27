import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcrypt'
import { z } from 'zod'

export const password: FastifyPluginAsyncZod = async (app) => {
  app.put('/change', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Altera a senha do usuário autenticado',
      body: z.object({
        currentPassword: z.string().min(6),
        newPassword: z.string().min(6)
      }),
      response: {
        204: z.null(),
        401: z.object({
          code: z.string(),
          message: z.string()
        }),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request, reply) => {
    const { id: userId } = request.user
    const { currentPassword, newPassword } = request.body as { currentPassword: string; newPassword: string }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId }
    })

    const validPassword = await bcrypt.compare(currentPassword, user.hashedPassword)

    if (!validPassword) {
      return reply.status(401).send({
        code: 'INVALID_PASSWORD',
        message: 'Senha atual inválida'
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: userId },
      data: { hashedPassword }
    })

    return reply.status(204).send()
  })

  app.post('/reset-request', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Solicita redefinição de senha',
      body: z.object({
        email: z.string().email()
      }),
      response: {
        204: z.null(),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { email } = request.body as { email: string }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (user) {
      // TODO: Implementar envio de email com token de redefinição
      // Por enquanto apenas simula o envio
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: crypto.randomUUID(),
          resetTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60) // 1 hora
        }
      })
    }

    // Sempre retorna 204 para não expor informação sobre existência do email
    return reply.status(204).send()
  })

  app.post('/reset', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Redefine a senha usando o token de redefinição',
      body: z.object({
        token: z.string().uuid(),
        password: z.string().min(6)
      }),
      response: {
        204: z.null(),
        400: z.object({
          code: z.string(),
          message: z.string()
        }),
        500: z.object({
          statusCode: z.number(),
          error: z.string(),
          message: z.string()
        })
      }
    }
  }, async (request, reply) => {
    const { token, password } = request.body as { token: string; password: string }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return reply.status(400).send({
        code: 'INVALID_TOKEN',
        message: 'Token inválido ou expirado'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null
      }
    })

    return reply.status(204).send()
  })
}
