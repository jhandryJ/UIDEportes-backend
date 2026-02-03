import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createPaymentSchema, validatePaymentSchema, paymentResponseSchema } from './payments.schemas.js';
import {
    createPaymentHandler,
    getPaymentsHandler,
    getPaymentHandler,
    validatePaymentHandler
} from './payments.controller.js';
import { z } from 'zod';

export async function paymentRoutes(app: FastifyInstance) {
    // Todas las rutas de pagos requieren autenticación
    app.register(async (privateApp) => {
        privateApp.addHook('onRequest', async (request) => {
            await request.jwtVerify();
        });

        // Listar pagos (con filtros RLS)
        privateApp.withTypeProvider<ZodTypeProvider>().get('/pagos', {
            schema: {
                tags: ['Pagos'],
                summary: 'Listar pagos según permisos del usuario',
                description: 'ADMIN ve todos, CAPITAN ve pagos de su equipo, ESTUDIANTE ve pagos de sus equipos',
                security: [{ bearerAuth: [] }],
                response: {
                    200: z.array(paymentResponseSchema.extend({
                        equipo: z.object({
                            id: z.number(),
                            nombre: z.string()
                        }),
                        usuarioPago: z.object({
                            id: z.number(),
                            nombres: z.string(),
                            email: z.string()
                        }),
                        validadoPor: z.object({
                            id: z.number(),
                            nombres: z.string()
                        }).nullable()
                    }))
                }
            }
        }, getPaymentsHandler);

        // Obtener un pago específico
        privateApp.withTypeProvider<ZodTypeProvider>().get('/pagos/:id', {
            schema: {
                tags: ['Pagos'],
                summary: 'Obtener detalles de un pago',
                security: [{ bearerAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: paymentResponseSchema.extend({
                        equipo: z.object({
                            id: z.number(),
                            nombre: z.string()
                        }),
                        usuarioPago: z.object({
                            id: z.number(),
                            nombres: z.string(),
                            email: z.string()
                        }),
                        validadoPor: z.object({
                            id: z.number(),
                            nombres: z.string()
                        }).nullable()
                    }),
                    404: z.object({ message: z.string() })
                }
            }
        }, getPaymentHandler);

        // Crear solicitud de pago (solo CAPITAN)
        privateApp.withTypeProvider<ZodTypeProvider>().post('/pagos', {
            schema: {
                tags: ['Pagos'],
                summary: 'Crear solicitud de pago',
                description: 'Solo el capitán del equipo puede subir comprobantes de pago',
                security: [{ bearerAuth: [] }],
                body: createPaymentSchema,
                response: {
                    201: paymentResponseSchema,
                    403: z.object({ message: z.string() })
                }
            }
        }, createPaymentHandler);

        // Validar/Rechazar pago (solo ADMIN)
        privateApp.withTypeProvider<ZodTypeProvider>().put('/pagos/:id/validar', {
            schema: {
                tags: ['Pagos'],
                summary: 'Validar o rechazar pago',
                description: 'Solo administradores pueden validar o rechazar pagos',
                security: [{ bearerAuth: [] }],
                params: z.object({ id: z.string() }),
                body: validatePaymentSchema,
                response: {
                    200: paymentResponseSchema.extend({
                        equipo: z.object({
                            id: z.number(),
                            nombre: z.string()
                        }),
                        usuarioPago: z.object({
                            id: z.number(),
                            nombres: z.string(),
                            email: z.string()
                        })
                    }),
                    400: z.object({ message: z.string() }),
                    403: z.object({ message: z.string() }),
                    404: z.object({ message: z.string() })
                }
            }
        }, validatePaymentHandler);
    });
}
