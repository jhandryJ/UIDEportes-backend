import { z } from 'zod';

export const registerUserSchema = z.object({
    cedula: z.string().length(10).describe('Ecuadorian ID number'),
    nombres: z.string().min(2),
    apellidos: z.string().min(2),
    email: z.string().email().describe('University email address'),
    password: z.string().min(6).describe('Minimum 6 characters'),
    facultad: z.string().optional(),
    carrera: z.string().optional(),
    rol: z.enum(['ADMIN', 'CAPITAN', 'ESTUDIANTE']).default('ESTUDIANTE')
});

export const loginUserSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const loginResponseSchema = z.object({
    accessToken: z.string().describe('JWT Access Token'),
    user: z.object({
        id: z.number(),
        email: z.string(),
        nombres: z.string(),
        rol: z.string()
    })
});
