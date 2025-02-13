import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tipo base para o usuário
interface BaseUser {
  id: string;
}

// Tipo para o usuário autenticado
interface AuthUser extends BaseUser {
  name: string;
  email: string;
}

// Declare module para estender o tipo do FastifyRequest
declare module 'fastify' {
  interface FastifyRequest {
    user: BaseUser;
  }
}

// Declare module para estender o tipo do JWT
declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: BaseUser;
  }
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();

    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    if (!user) {
      reply.code(401).send({ error: 'Não autorizado' });
      return;
    }

    request.user = {
      id: user.id,
    };
  } catch (err) {
    reply.code(401).send({ error: 'Não autorizado' });
    return;
  }
}



