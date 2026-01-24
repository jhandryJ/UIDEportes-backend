import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createEnrollmentSchema, enrollmentResponseSchema, updateEnrollmentStatusSchema } from './enrollments.schemas.js';
import { enrollTeamHandler, getEnrollmentsHandler, updateEnrollmentStatusHandler } from './enrollments.controller.js';
import { verifyRole } from '../auth/auth.middleware.js';
import { z } from 'zod';

export async function enrollmentRoutes(app: FastifyInstance) {

    // Public/Shared Routes
    app.withTypeProvider<ZodTypeProvider>().get('/inscripciones', {
        schema: {
            tags: ['Inscripciones'],
            summary: 'List enrollments (filter by torneoId or equipoId)',
            querystring: z.object({
                torneoId: z.string().optional(),
                equipoId: z.string().optional()
            }),
            response: {
                200: z.array(enrollmentResponseSchema)
            }
        }
    }, getEnrollmentsHandler);

    // Private Routes
    app.register(async (privateApp) => {
        privateApp.addHook('onRequest', async (request) => {
            await request.jwtVerify();
        });

        // Captains can enroll their teams
        privateApp.withTypeProvider<ZodTypeProvider>().post('/inscripciones', {
            schema: {
                tags: ['Inscripciones'],
                summary: 'Enroll a team into a tournament',
                security: [{ bearerAuth: [] }],
                body: createEnrollmentSchema,
                response: {
                    201: z.object({
                        id: z.number(),
                        equipoId: z.number(),
                        torneoId: z.number(),
                        estado: z.string()
                    })
                }
            }
        }, enrollTeamHandler);

        // Admin only routes
        privateApp.register(async (adminApp) => {
            adminApp.addHook('preHandler', verifyRole(['ADMIN']));

            adminApp.withTypeProvider<ZodTypeProvider>().patch('/inscripciones/:id/estado', {
                schema: {
                    tags: ['Inscripciones'],
                    summary: 'Update enrollment status (Accept/Reject)',
                    security: [{ bearerAuth: [] }],
                    params: z.object({ id: z.string() }),
                    body: updateEnrollmentStatusSchema,
                    response: {
                        200: z.object({ id: z.number(), estado: z.string() })
                    }
                }
            }, updateEnrollmentStatusHandler);
        });
    });
}
