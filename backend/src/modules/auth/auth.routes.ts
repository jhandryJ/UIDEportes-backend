import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { loginResponseSchema, loginUserSchema, registerUserSchema, requestVerificationSchema, checkVerificationSchema } from './auth.schemas.js';
import { loginUserHandler, registerUserHandler, deleteUserHandler, requestVerificationHandler, checkVerificationHandler } from './auth.controller.js';
import { z } from 'zod';

export async function authRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/request-verification', {
        schema: {
            tags: ['Auth'],
            summary: 'Solicitar código de verificación',
            body: requestVerificationSchema,
            response: {
                200: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ message: z.string() })
            }
        }
    }, requestVerificationHandler);

    app.withTypeProvider<ZodTypeProvider>().post('/check-verification', {
        schema: {
            tags: ['Auth'],
            summary: 'Validar código de verificación',
            body: checkVerificationSchema,
            response: {
                200: z.object({ success: z.boolean(), message: z.string() }),
                400: z.object({ success: z.boolean(), message: z.string() }),
                500: z.object({ message: z.string() })
            }
        }
    }, checkVerificationHandler);

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

    app.withTypeProvider<ZodTypeProvider>().delete('/users/:id', {
        onRequest: [async (request) => await request.jwtVerify()],
        schema: {
            tags: ['Auth'], // Or 'Users' if I update app.ts, but 'Auth' requested implies context
            summary: 'Delete a user (Admin only)',
            description: 'Elimina un usuario por su ID. Requiere ser ADMIN.',
            params: z.object({
                id: z.string().describe('User ID')
            }),
            security: [{ bearerAuth: [] }],
            response: {
                204: z.null().describe('User deleted successfully'),
                403: z.object({ message: z.string() }),
                404: z.object({ message: z.string() })
            }
        }
    }, deleteUserHandler);
}
