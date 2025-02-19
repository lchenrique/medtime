import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'

export type FastifyZodInstance = FastifyInstance<ZodTypeProvider>

export interface TypedRequest<T = unknown> extends FastifyRequest {
  body: T
}

export interface TypedRequestParams<T = unknown, P = unknown> extends FastifyRequest {
  body: T
  params: P
} 