import { AuthController } from '@/controllers/authController';
import { registerSchema, userResponseSchema } from '@/schemas';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const authController = new AuthController();


const authResponseSchema = z.object({
  user: userResponseSchema,
  token: z.string(),
});

export async function registerRoute(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        body: registerSchema,
        response: {
          201: authResponseSchema,
        },
        tags: ['auth'],
        description: 'Registra um novo usuário',
      },
    },
    authController.register
  );
}