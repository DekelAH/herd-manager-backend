import swaggerJsdoc from 'swagger-jsdoc'
import { env } from './env.js'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Herd Manager API',
      version: '1.0.0',
      description: 'API for managing sheep herds — CRUD, matching, breeding stats'
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/*.routes.ts', './dist/modules/**/*.routes.js']
}

export const swaggerSpec = swaggerJsdoc(options)
