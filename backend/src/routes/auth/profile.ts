import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { prisma } from '../../lib/prisma'
import { errorResponseSchema, userResponseSchema, updateProfileSchema } from '../../schemas/auth'
import { z } from 'zod'
import type { Prisma } from '@prisma/client'

export const profile: FastifyPluginAsyncZod = async (app) => {
  app.get('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Obtém o perfil do usuário autenticado',
      response: {
        200: userResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const { id: userId } = request.user

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true,
        tauriEnabled: true,
        capacitorEnabled: true,
        whatsappEnabled: true,
        whatsappNumber: true,
        telegramEnabled: true,
        telegramChatId: true,
        isDiabetic: true,
        hasHeartCondition: true,
        hasHypertension: true,
        allergies: true,
        observations: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  })

  app.put('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Atualiza o perfil do usuário autenticado',
      body: updateProfileSchema,
      response: {
        200: userResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const { id: userId } = request.user
    const updateData = request.body as Prisma.UserUpdateInput

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        fcmToken: true,
        tauriEnabled: true,
        capacitorEnabled: true,
        whatsappEnabled: true,
        whatsappNumber: true,
        telegramEnabled: true,
        telegramChatId: true,
        isDiabetic: true,
        hasHeartCondition: true,
        hasHypertension: true,
        allergies: true,
        observations: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  })

  app.patch('/', {
    onRequest: [app.authenticate],
    schema: {
      tags: ['auth'],
      description: 'Atualiza o perfil do usuário autenticado',
      body: updateProfileSchema,
      response: {
        200: userResponseSchema,
        401: errorResponseSchema,
        500: errorResponseSchema
      },
      security: [{ bearerAuth: [] }]
    }
  }, async (request) => {
    const { id: userId } = request.user
    const data = updateProfileSchema.parse(request.body) as Prisma.UserUpdateInput

    console.log('Dados recebidos para atualização:', data)

    try {
      // Se tauriEnabled estiver definido como false, garantimos que será false no banco
      const updateData: Prisma.UserUpdateInput = {
        ...data,
        tauriEnabled: data.tauriEnabled
      }

      console.log('Dados que serão atualizados:', updateData)

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          fcmToken: true,
          tauriEnabled: true,
          capacitorEnabled: true,
          whatsappEnabled: true,
          whatsappNumber: true,
          telegramEnabled: true,
          telegramChatId: true,
          isDiabetic: true,
          hasHeartCondition: true,
          hasHypertension: true,
          allergies: true,
          observations: true,
          createdAt: true,
          updatedAt: true
        }
      })

      console.log('Usuário após atualização:', user)

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  })
}
