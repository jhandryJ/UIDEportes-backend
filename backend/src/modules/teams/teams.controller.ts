import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../../utils/prisma.js';
import { createTeamSchema, updateTeamSchema } from './teams.schemas.js';
import { z } from 'zod';

export async function createTeamHandler(
    request: FastifyRequest<{ Body: z.infer<typeof createTeamSchema> }>,
    reply: FastifyReply
) {
    const { nombre, logoUrl, facultad } = request.body;
    const user = request.user as { id: number };

    try {
        // Check if user is already a captain
        const existingTeam = await prisma.equipo.findUnique({
            where: { capitanId: user.id }
        });

        if (existingTeam) {
            return reply.code(409).send({ message: 'User is already a captain of a team' });
        }

        const team = await prisma.equipo.create({
            data: {
                nombre,
                logoUrl,
                facultad,
                capitanId: user.id
            }
        });

        // Also add the captain as a member of the team
        await prisma.miembroEquipo.create({
            data: {
                equipoId: team.id,
                usuarioId: user.id
            }
        });

        return reply.code(201).send(team);
    } catch (e: any) {
        if (e.code === 'P2002') { // Unique constraint (e.g. capitanId again)
            return reply.code(409).send({ message: 'User already has a team or team name conflict' });
        }
        return reply.code(500).send({ message: 'Error creating team' });
    }
}

export async function getTeamsHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const teams = await prisma.equipo.findMany({
        include: {
            capitan: {
                select: { id: true, nombres: true, email: true }
            }
        }
    });
    return reply.send(teams);
}

export async function getTeamHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    const team = await prisma.equipo.findUnique({
        where: { id: Number(id) },
        include: {
            capitan: {
                select: { id: true, nombres: true, email: true }
            },
            miembros: {
                include: {
                    usuario: {
                        select: { id: true, nombres: true, email: true }
                    }
                }
            }
        }
    });

    if (!team) {
        return reply.code(404).send({ message: 'Team not found' });
    }

    return reply.send(team);
}

export async function updateTeamHandler(
    request: FastifyRequest<{ Params: { id: string }, Body: z.infer<typeof updateTeamSchema> }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    const user = request.user as { id: number, rol: string };

    try {
        const team = await prisma.equipo.findUnique({ where: { id: Number(id) } });
        if (!team) return reply.code(404).send({ message: 'Team not found' });

        // Authorization: Only Captain or Admin
        if (team.capitanId !== user.id && user.rol !== 'ADMIN') {
            return reply.code(403).send({ message: 'Forbidden' });
        }

        const updatedTeam = await prisma.equipo.update({
            where: { id: Number(id) },
            data: request.body
        });

        return reply.send(updatedTeam);
    } catch (e) {
        return reply.code(500).send({ message: 'Error updating team' });
    }
}
