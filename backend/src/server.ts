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

import routes from '@/routes';
import { env } from './env'
import { ReminderWorker } from './workers/reminder.worker'
import { authenticate } from './middlewares/auth'
import { websocketRoutes } from './routes/notifications/websocket'
import { TelegramService } from './services/telegram.service'

const __dirname = path.dirname(__filename);

// Tipos do Fastify
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

function buildApp() {
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

  // Configurar compiladores Zod
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // Decorador de autenticação
  app.decorate('authenticate', authenticate)

  return app
}

function start() {
  const app = buildApp()

  // Plugins
  app.register(cors, {
    origin: [
      env.FRONTEND_URL,
      env.API_URL
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Sec-WebSocket-Protocol', 'ngrok-skip-browser-warning'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // 24 horas
  })

  // Registra o plugin WebSocket
  app.register(websocket)

  // Swagger
  app.register(fastifySwagger, {
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

  app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  })

  // Rotas
  app.register(routes)

  // Registra as rotas WebSocket
  app.register(websocketRoutes)

  // Inicia o worker de lembretes e o bot do Telegram
  ReminderWorker.start()
  TelegramService.initialize()

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

  // Start
  app.listen({ 
    port: env.PORT,
    host: '0.0.0.0'
  }, (err) => {
    if (err) {
      app.log.error(err)
      process.exit(1)
    }
    console.log(`🚀 Server running at http://0.0.0.0:${env.PORT}`)
    console.log(`📚 Documentation available at http://0.0.0.0:${env.PORT}/docs`)
    console.log(`🤖 Telegram bot initialized`)
  })
}

start()