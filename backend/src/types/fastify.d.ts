import { FastifyRequest, FastifyReply } from 'fastify'
import { JWT } from '@fastify/jwt'

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    jwt: JWT
  }

  interface FastifyRequest {
    user: {
      id: string
      email: string
      name: string
    }
  }
}

// Tipos auxiliares para requisições tipadas
export interface TypedRequest<T = unknown> extends FastifyRequest {
  body: T
}

export interface TypedRequestParams<T = unknown, P = unknown> extends FastifyRequest {
  body: T
  params: P
} 