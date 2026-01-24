import { z } from 'zod';

export const createCampeonatoSchema = z.object({
    nombre: z.string().min(3).describe('Name of the Championship'),
    anio: z.number().int().min(2025).describe('Year of the championship'),
    fechaInicio: z.coerce.date().describe('Start date'),
    fechaFin: z.coerce.date().optional()
});

export const createTorneoSchema = z.object({
    campeonatoId: z.number().int(),
    disciplina: z.enum(['FUTBOL', 'BASKET', 'ECUAVOLEY']),
    categoria: z.enum(['ELIMINATORIA', 'FASE_GRUPOS', 'TODOS_CONTRA_TODOS']), // Ahora define el formato
    genero: z.enum(['MASCULINO', 'FEMENINO', 'MIXTO']) // Ahora define el género
});

export const campeonatoResponseSchema = createCampeonatoSchema.extend({
    id: z.number(),
    torneos: z.array(z.object({
        id: z.number(),
        disciplina: z.string(),
        categoria: z.string()
    })).optional()
});
