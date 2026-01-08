import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginResponseSchema, loginUserSchema, registerUserSchema } from './auth.schemas.js';
import { loginUserHandler, registerUserHandler } from './auth.controller.js';
import { z } from 'zod';

export async function authRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/register', {
        schema: {
            tags: ['Auth'],
            summary: 'Register a new user',
            body: registerUserSchema,
            response: {
                201: z.object({
                    id: z.number(),
                    email: z.string(),
                    nombres: z.string(),
                    rol: z.string()
                }),
                409: z.object({ message: z.string() })
            }
        }
    }, registerUserHandler);

    app.withTypeProvider<ZodTypeProvider>().post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'User Login',
            body: loginUserSchema,
            response: {
                200: loginResponseSchema,
                401: z.object({ message: z.string() })
            }
        }
    }, loginUserHandler);
}
