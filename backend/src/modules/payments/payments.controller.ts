import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { createPaymentSchema, validatePaymentSchema } from './payments.schemas.js';
import { getPaymentFilter, canModifyTeam } from '../../utils/rls-helpers.js';
import { z } from 'zod';

/**
 * Crear solicitud de pago (solo CAPITAN de su equipo)
 */
export async function createPaymentHandler(
    request: FastifyRequest<{ Body: z.infer<typeof createPaymentSchema> }>,
    reply: FastifyReply
) {
    const { equipoId, monto, comprobanteUrl, observacion } = request.body;
    const user = request.user as { id: number; rol: any };

    try {
        // Validar que el usuario es capitán del equipo
        const canModify = await canModifyTeam(user.id, user.rol, equipoId, prisma);
        if (!canModify) {
            return reply.code(403).send({
                message: 'Solo el capitán del equipo puede subir comprobantes de pago'
            });
        }

        const payment = await prisma.validacionPago.create({
            data: {
                equipoId,
                usuarioPagoId: user.id,
                monto,
                comprobanteUrl,
                observacion,
                estado: 'PENDIENTE'
            }
        });

        return reply.code(201).send(payment);
    } catch (e: any) {
        console.error('Error creating payment:', e);
        return reply.code(500).send({ message: 'Error al crear solicitud de pago' });
    }
}

/**
 * Listar pagos (con filtros RLS)
 */
export async function getPaymentsHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const user = request.user as { id: number; rol: any };

    const payments = await prisma.validacionPago.findMany({
        where: getPaymentFilter(user.id, user.rol),
        include: {
            equipo: {
                select: { id: true, nombre: true }
            },
            usuarioPago: {
                select: { id: true, nombres: true, email: true }
            },
            validadoPor: {
                select: { id: true, nombres: true }
            }
        },
        orderBy: {
            fechaSubida: 'desc'
        }
    });

    return reply.send(payments);
}

/**
 * Obtener un pago específico (con validación RLS)
 */
export async function getPaymentHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    const user = request.user as { id: number; rol: any };

    const payment = await prisma.validacionPago.findFirst({
        where: {
            id: Number(id),
            ...getPaymentFilter(user.id, user.rol)
        },
        include: {
            equipo: {
                select: { id: true, nombre: true }
            },
            usuarioPago: {
                select: { id: true, nombres: true, email: true }
            },
            validadoPor: {
                select: { id: true, nombres: true }
            }
        }
    });

    if (!payment) {
        return reply.code(404).send({
            message: 'Pago no encontrado o no tienes permiso para verlo'
        });
    }

    return reply.send(payment);
}

/**
 * Validar o rechazar pago (solo ADMIN)
 */
export async function validatePaymentHandler(
    request: FastifyRequest<{
        Params: { id: string },
        Body: z.infer<typeof validatePaymentSchema>
    }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    const { estado, observacion } = request.body;
    const user = request.user as { id: number; rol: any };

    // Solo ADMIN puede validar pagos
    if (user.rol !== 'ADMIN') {
        return reply.code(403).send({
            message: 'Solo administradores pueden validar pagos'
        });
    }

    try {
        const payment = await prisma.validacionPago.findUnique({
            where: { id: Number(id) }
        });

        if (!payment) {
            return reply.code(404).send({ message: 'Pago no encontrado' });
        }

        if (payment.estado !== 'PENDIENTE') {
            return reply.code(400).send({
                message: `Este pago ya fue ${payment.estado.toLowerCase()}`
            });
        }

        const updatedPayment = await prisma.validacionPago.update({
            where: { id: Number(id) },
            data: {
                estado,
                observacion,
                validadoPorId: user.id
            },
            include: {
                equipo: {
                    select: { id: true, nombre: true }
                },
                usuarioPago: {
                    select: { id: true, nombres: true, email: true }
                }
            }
        });

        return reply.send(updatedPayment);
    } catch (e: any) {
        console.error('Error validating payment:', e);
        return reply.code(500).send({ message: 'Error al validar pago' });
    }
}
