import { FastifyRequest, FastifyReply } from 'fastify';

export function verifyRole(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();
            const user = request.user as { rol: string };

            if (!allowedRoles.includes(user.rol)) {
                return reply.code(403).send({
                    message: 'Forbidden: Insufficient permissions',
                    requiredRole: allowedRoles,
                    userRole: user.rol
                });
            }
        } catch (err) {
            return reply.send(err);
        }
    };
}
