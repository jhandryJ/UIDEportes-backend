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
                // genero is now passed explicitly in data.genero
            }
        });
        return reply.code(201).send(torneo);
    } catch (e) {
        return reply.code(500).send({ message: 'Error creating tournament' });
    }
}

export async function deleteCampeonatoHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    try {
        await prisma.campeonato.delete({
            where: { id: Number(id) }
        });
        return reply.code(204).send();
    } catch (e: any) {
        if (e.code === 'P2025') { // Record not found
            return reply.code(404).send({ message: 'Championship not found' });
        }
        // Foreign key constraint failure likely if deleting championship with existing tournaments/matches
        if (e.code === 'P2003') {
            return reply.code(409).send({ message: 'Cannot delete championship with associated tournaments' });
        }
        return reply.code(500).send({ message: 'Error deleting championship' });
    }
}

export async function deleteTorneoHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    try {
        await prisma.torneo.delete({
            where: { id: Number(id) }
        });
        return reply.code(204).send();
    } catch (e: any) {
        if (e.code === 'P2025') {
            return reply.code(404).send({ message: 'Tournament not found' });
        }
        if (e.code === 'P2003') {
            return reply.code(409).send({ message: 'Cannot delete tournament with associated matches/teams' });
        }
        return reply.code(500).send({ message: 'Error deleting tournament' });
    }
}
