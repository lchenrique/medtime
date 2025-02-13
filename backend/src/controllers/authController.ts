import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/authService';
import { RegisterInput, LoginInput, userResponseSchema } from '../schemas/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
const prisma = new PrismaClient();
const authService = new AuthService(prisma);

type UserOutput = z.infer<typeof userResponseSchema>

export class AuthController {
  async register(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.register(request.body);
      const token = await reply.jwtSign({ 
        id: user.id,
        email: user.email,
      });

      return reply.code(201).send({ 
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          fcmToken: user.fcmToken,
          tauriEnabled: user.tauriEnabled,
          capacitorEnabled: user.capacitorEnabled,
          whatsappEnabled: user.whatsappEnabled,
          whatsappNumber: user.whatsappNumber,
          telegramEnabled: user.telegramEnabled,
          telegramChatId: user.telegramChatId,
          isDiabetic: user.isDiabetic,
          hasHeartCondition: user.hasHeartCondition,
          hasHypertension: user.hasHypertension,
          allergies: user.allergies,
          observations: user.observations,
          createdAt: user.createdAt.toString(),
          updatedAt: user.updatedAt.toString(),
        } as UserOutput, 
        token 
      }); 
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(400).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }

  async login(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
  ) {
    try {
      const result = await authService.login(request.body);
      const token = await reply.jwtSign({
        id: result.user.id,
        email: result.user.email
      });
      
      return reply.send({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          fcmToken: result.user.fcmToken,
          tauriEnabled: result.user.tauriEnabled,
          capacitorEnabled: result.user.capacitorEnabled,
          whatsappEnabled: result.user.whatsappEnabled,
          whatsappNumber: result.user.whatsappNumber,
          telegramEnabled: result.user.telegramEnabled,
          telegramChatId: result.user.telegramChatId,
          isDiabetic: result.user.isDiabetic,
          hasHeartCondition: result.user.hasHeartCondition,
          hasHypertension: result.user.hasHypertension,
          allergies: result.user.allergies,
          observations: result.user.observations,
          createdAt: result.user.createdAt.toString(),
          updatedAt: result.user.updatedAt.toString(),
        } as UserOutput,
        token
      });
    } catch (error) {
      if (error instanceof Error) {
        return reply.code(401).send({ error: error.message });
      }
      return reply.code(500).send({ error: 'Erro interno do servidor' });
    }
  }
}