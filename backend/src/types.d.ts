import '@fastify/jwt';

declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: { id: number; email: string; rol: string };
        user: { id: number; email: string; rol: string };
    }
}
