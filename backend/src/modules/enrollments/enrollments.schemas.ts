import { z } from 'zod';

export const createEnrollmentSchema = z.object({
    equipoId: z.number().int(),
    torneoId: z.number().int()
});

export const updateEnrollmentStatusSchema = z.object({
    estado: z.enum(['INSCRITO', 'ACEPTADO', 'RECHAZADO'])
});

export const enrollmentResponseSchema = z.object({
    id: z.number(),
    equipoId: z.number(),
    torneoId: z.number(),
    estado: z.string(),
    equipo: z.object({
        nombre: z.string()
    }).optional(),
    torneo: z.object({
        disciplina: z.string(),
        categoria: z.string() // format
    }).optional()
});
