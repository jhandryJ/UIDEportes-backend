import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { campeonatoResponseSchema, createCampeonatoSchema, createTorneoSchema } from './tournaments.schemas.js';
import { createCampeonatoHandler, createTorneoHandler, getCampeonatosHandler } from './tournaments.controller.js';
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

        privateApp.withTypeProvider<ZodTypeProvider>().post('/campeonatos', {
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

        privateApp.withTypeProvider<ZodTypeProvider>().post('/torneos', {
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
    });
}
