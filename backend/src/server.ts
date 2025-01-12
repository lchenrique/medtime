import 'dotenv/config'
import Fastify, { FastifyRequest, FastifyReply } from 'fastify'
import cors from '@fastify/cors'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { jsonSchemaTransform, serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import websocket from '@fastify/websocket'

import { authRoutes } from './routes/auth'
import { medicationRoutes } from './routes/medications'
import { notificationRoutes } from './routes/notifications'
import { reminderRoutes } from './routes/reminders'
import { env } from './config/env'
import { ReminderWorker } from './workers/reminder.worker'
import { authenticate } from './middlewares/auth'
import { websocketRoutes } from './routes/notifications/websocket'

// Tipos do Fastify
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true
      },
    },
  },
  disableRequestLogging: false,
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true
}).withTypeProvider<ZodTypeProvider>()

// Plugins
await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Sec-WebSocket-Protocol'],
  exposedHeaders: ['Authorization'],
})

// Registra o plugin WebSocket
await app.register(websocket)

// Configurar compiladores Zod
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Decorador de autenticação
app.decorate('authenticate', authenticate)

// Swagger
await app.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'MedTime API',
      description: 'API do sistema MedTime para gestão de medicamentos e lembretes',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token de autenticação'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  transform: jsonSchemaTransform,
  hideUntagged: true
})

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs'
})

// Rotas
app.register(authRoutes, { prefix: '/auth' })
app.register(medicationRoutes, { prefix: '/medications' })
app.register(notificationRoutes, { prefix: '/notifications' })
app.register(reminderRoutes, { prefix: '/reminders' })

// Registra as rotas WebSocket
await app.register(websocketRoutes)

// Inicia o worker de lembretes
ReminderWorker.start()

// Start
try {
  await app.listen({ port: env.PORT })
  console.log(`🚀 Server running at http://localhost:${env.PORT}`)
  console.log(`📚 Documentation available at http://localhost:${env.PORT}/docs`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}

app.ready(() => {
  const swagger = app.swagger()
  try {
    writeFileSync(
      path.resolve(__dirname, '../swagger.json'),
      JSON.stringify(swagger, null, 2)
    )
  } catch (err) {
    console.error('Error writing swagger.json:', err)
  }
})