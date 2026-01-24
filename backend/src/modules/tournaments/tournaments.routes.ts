import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { campeonatoResponseSchema, createCampeonatoSchema, createTorneoSchema } from './tournaments.schemas.js';
import { createCampeonatoHandler, createTorneoHandler, getCampeonatosHandler, deleteCampeonatoHandler, deleteTorneoHandler } from './tournaments.controller.js';
import { verifyRole } from '../auth/auth.middleware.js';
import { z } from 'zod';

export async function tournamentRoutes(app: FastifyInstance) {
    // Public routes
    app.withTypeProvider<ZodTypeProvider>().get('/campeonatos', {
        schema: {
            tags: ['Torneos'],
            summary: 'List all championships and tournaments',
            response: {
                200: z.array(campeonatoResponseSchema)
            }
        }
    }, getCampeonatosHandler);

    // Private routes (Reviewers/Admins)
    app.register(async (privateApp) => {
        privateApp.addHook('onRequest', async (request) => {
            try {
                await request.jwtVerify();
            } catch (err) {
                throw err;
            }
        });


        // Admin only routes
        privateApp.register(async (adminApp) => {
            adminApp.addHook('preHandler', verifyRole(['ADMIN']));

            adminApp.withTypeProvider<ZodTypeProvider>().post('/campeonatos', {
                schema: {
                    tags: ['Torneos'],
                    summary: 'Create a new championship',
                    security: [{ bearerAuth: [] }],
                    body: createCampeonatoSchema,
                    response: {
                        201: campeonatoResponseSchema
                    }
                }
            }, createCampeonatoHandler);

            adminApp.withTypeProvider<ZodTypeProvider>().post('/torneos', {
                schema: {
                    tags: ['Torneos'],
                    summary: 'Add a tournament to a championship',
                    security: [{ bearerAuth: [] }],
                    body: createTorneoSchema,
                    response: {
                        201: z.object({ id: z.number(), disciplina: z.string() })
                    }
                }
            }, createTorneoHandler);

            adminApp.withTypeProvider<ZodTypeProvider>().delete('/campeonatos/:id', {
                schema: {
                    tags: ['Torneos'],
                    summary: 'Delete a championship',
                    security: [{ bearerAuth: [] }],
                    params: z.object({ id: z.string() }),
                    response: {
                        204: z.null()
                    }
                }
            }, deleteCampeonatoHandler);

            adminApp.withTypeProvider<ZodTypeProvider>().delete('/torneos/:id', {
                schema: {
                    tags: ['Torneos'],
                    summary: 'Delete a tournament',
                    security: [{ bearerAuth: [] }],
                    params: z.object({ id: z.string() }),
                    response: {
                        204: z.null()
                    }
                }
            }, deleteTorneoHandler);
        });
    });
}
