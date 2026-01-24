import { z } from 'zod';

export const registerUserSchema = z.object({
    cedula: z.string().length(10).describe('Ecuadorian ID number').default('1712345678'),
    nombres: z.string().min(2).default('Juan'),
    apellidos: z.string().min(2).default('Perez'),
    email: z.string().email().describe('University email address').default('juan.perez@uide.edu.ec'),
    password: z.string().min(6).describe('Minimum 6 characters').default('password123'),
    facultad: z.string().optional().default('Ingeniería'),
    carrera: z.string().optional().default('Software'),
    rol: z.enum(['ADMIN', 'CAPITAN', 'ESTUDIANTE']).default('ESTUDIANTE')
});

export const loginUserSchema = z.object({
    email: z.string().email().default('estudiante@uide.edu.ec'),
    password: z.string().default('password123')
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
