import { z } from 'zod';

export const createTeamSchema = z.object({
    nombre: z.string().min(3).max(50),
    logoUrl: z.string().url().optional(),
    facultad: z.string().optional(),
});

export const updateTeamSchema = createTeamSchema.partial();

export const teamResponseSchema = z.object({
    id: z.number(),
    nombre: z.string(),
    logoUrl: z.string().nullable(),
    facultad: z.string().nullable(),
    capitanId: z.number(),
    capitan: z.object({
        id: z.number(),
        nombres: z.string(),
        email: z.string()
    }).optional()
});
