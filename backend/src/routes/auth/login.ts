import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { loginSchema, userResponseSchema } from '@/schemas';
import { AuthController } from '@/controllers/authController';

const authController = new AuthController();



const authResponseSchema = z.object({
  user: userResponseSchema,
  token: z.string(),
});

export async function loginRoute(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        body: loginSchema,
        response: {
          200: authResponseSchema,
        },
        tags: ['auth'],
        description: 'Realiza login do usuário',
      },
    },
    authController.login
  );
} 