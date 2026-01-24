import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcryptjs';
import { prisma } from '../../utils/prisma.js';
import { loginUserSchema, registerUserSchema } from './auth.schemas.js';
import { z } from 'zod';

export async function registerUserHandler(
    request: FastifyRequest<{ Body: z.infer<typeof registerUserSchema> }>,
    reply: FastifyReply
) {
    const { password, ...userData } = request.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.usuario.create({
            data: {
                ...userData,
                password: hashedPassword,
            },
        });

        return reply.code(201).send({
            id: user.id,
            email: user.email,
            nombres: user.nombres,
            rol: user.rol
        });
    } catch (e: any) {
        if (e.code === 'P2002') { // Unique constraint violation
            return reply.code(409).send({ message: 'User with this email or cedula already exists' });
        }
        return reply.code(500).send({ message: 'Internal Server Error' });
    }
}

export async function loginUserHandler(
    request: FastifyRequest<{ Body: z.infer<typeof loginUserSchema> }>,
    reply: FastifyReply
) {
    const { email, password } = request.body;

    const user = await prisma.usuario.findUnique({
        where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.code(401).send({ message: 'Invalid email or password' });
    }

    const accessToken = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        rol: user.rol,
    });

    return {
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            nombres: user.nombres,
            rol: user.rol,
        },
    };
}

export async function deleteUserHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    const { id } = request.params;
    const adminUser = request.user as { rol: string };

    // Verify admin role (assuming middleware does it, but double check usually good or rely on route config)
    if (adminUser.rol !== 'ADMIN') {
        return reply.code(403).send({ message: 'Forbidden. Only admins can delete users.' });
    }

    try {
        await prisma.usuario.delete({
            where: { id: Number(id) }
        });
        return reply.code(204).send();
    } catch (e: any) {
        if (e.code === 'P2025') {
            return reply.code(404).send({ message: 'User not found' });
        }
        return reply.code(500).send({ message: 'Error deleting user' });
    }
}
