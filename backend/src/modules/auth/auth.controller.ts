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

    // @ts-ignore - types are tricky with fastify-jwt inside modules without global augmentation
    const accessToken = request.jwt.sign({
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
