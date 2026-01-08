import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { createCampeonatoSchema, createTorneoSchema } from './tournaments.schemas.js';
import { z } from 'zod';

export async function createCampeonatoHandler(
    request: FastifyRequest<{ Body: z.infer<typeof createCampeonatoSchema> }>,
    reply: FastifyReply
) {
    const data = request.body;
    try {
        const campeonato = await prisma.campeonato.create({
            data
        });
        return reply.code(201).send(campeonato);
    } catch (e) {
        return reply.code(500).send({ message: 'Error creating championship' });
    }
}

export async function getCampeonatosHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const campeonatos = await prisma.campeonato.findMany({
        include: { torneos: true }
    });
    return reply.send(campeonatos);
}

export async function createTorneoHandler(
    request: FastifyRequest<{ Body: z.infer<typeof createTorneoSchema> }>,
    reply: FastifyReply
) {
    const data = request.body;

    // Verify admin role (middleware logic usually, but checking here for simplicity if needed)
    // For now assuming route is protected

    try {
        const torneo = await prisma.torneo.create({
            data: {
                ...data,
                genero: data.categoria // Syncing redundant field as per schema notes
            }
        });
        return reply.code(201).send(torneo);
    } catch (e) {
        return reply.code(500).send({ message: 'Error creating tournament' });
    }
}
