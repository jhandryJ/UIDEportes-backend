import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createTeamSchema, teamResponseSchema, updateTeamSchema } from './teams.schemas.js';
import { createTeamHandler, getTeamHandler, getTeamsHandler, updateTeamHandler } from './teams.controller.js';
import { z } from 'zod';

export async function teamRoutes(app: FastifyInstance) {

    // Public Routes
    app.withTypeProvider<ZodTypeProvider>().get('/equipos', {
        schema: {
            tags: ['Equipos'],
            summary: 'List all teams',
            response: {
                200: z.array(teamResponseSchema)
            }
        }
    }, getTeamsHandler);

    app.withTypeProvider<ZodTypeProvider>().get('/equipos/:id', {
        schema: {
            tags: ['Equipos'],
            summary: 'Get team details',
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

    // Private Routes
    app.register(async (privateApp) => {
        privateApp.addHook('onRequest', async (request) => {
            await request.jwtVerify();
        });

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
