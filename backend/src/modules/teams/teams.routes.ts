import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createTeamSchema, teamResponseSchema, updateTeamSchema } from './teams.schemas.js';
import { createTeamHandler, getTeamHandler, getTeamsHandler, updateTeamHandler } from './teams.controller.js';
import { z } from 'zod';

export async function teamRoutes(app: FastifyInstance) {

    // Private Routes - Requieren autenticación para aplicar RLS
    app.register(async (privateApp) => {
        privateApp.addHook('onRequest', async (request) => {
            await request.jwtVerify();
        });

        // GET /equipos - Con RLS aplicado
        privateApp.withTypeProvider<ZodTypeProvider>().get('/equipos', {
            schema: {
                tags: ['Equipos'],
                summary: 'List all teams (with RLS)',
                security: [{ bearerAuth: [] }],
                response: {
                    200: z.array(teamResponseSchema)
                }
            }
        }, getTeamsHandler);

        // GET /equipos/:id - Con RLS aplicado
        privateApp.withTypeProvider<ZodTypeProvider>().get('/equipos/:id', {
            schema: {
                tags: ['Equipos'],
                summary: 'Get team details (with RLS)',
                security: [{ bearerAuth: [] }],
                params: z.object({ id: z.string() }),
                response: {
                    200: teamResponseSchema.extend({
                        miembros: z.array(z.object({
                            usuario: z.object({
                                id: z.number(),
                                nombres: z.string(),
                                email: z.string()
                            })
                        })).optional()
                    })
                }
            }
        }, getTeamHandler);

        // POST /equipos
        privateApp.withTypeProvider<ZodTypeProvider>().post('/equipos', {
            schema: {
                tags: ['Equipos'],
                summary: 'Create a new team',
                security: [{ bearerAuth: [] }],
                body: createTeamSchema,
                response: {
                    201: teamResponseSchema
                }
            }
        }, createTeamHandler);

        // PUT /equipos/:id
        privateApp.withTypeProvider<ZodTypeProvider>().put('/equipos/:id', {
            schema: {
                tags: ['Equipos'],
                summary: 'Update team details',
                security: [{ bearerAuth: [] }],
                params: z.object({ id: z.string() }),
                body: updateTeamSchema,
                response: {
                    200: teamResponseSchema
                }
            }
        }, updateTeamHandler);
    });
}
