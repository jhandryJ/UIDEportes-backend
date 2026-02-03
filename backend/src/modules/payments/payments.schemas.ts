import { z } from 'zod';

export const createPaymentSchema = z.object({
    equipoId: z.number().positive(),
    monto: z.number().positive(),
    comprobanteUrl: z.string().url(),
    observacion: z.string().optional()
});

export const validatePaymentSchema = z.object({
    estado: z.enum(['VALIDADO', 'RECHAZADO']),
    observacion: z.string().optional()
});

export const paymentResponseSchema = z.object({
    id: z.number(),
    equipoId: z.number(),
    usuarioPagoId: z.number(),
    monto: z.number(),
    comprobanteUrl: z.string(),
    estado: z.enum(['PENDIENTE', 'VALIDADO', 'RECHAZADO']),
    fechaSubida: z.date(),
    validadoPorId: z.number().nullable(),
    observacion: z.string().nullable()
});
