import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware para verificar JWT y extraer información del usuario
 * Este middleware debe aplicarse a todas las rutas protegidas
 */
export async function verifyJWT(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        // Verificar el token JWT usando el plugin @fastify/jwt
        await request.jwtVerify();

        // El payload del JWT ya está disponible en request.user
        // Asegurarse de que tiene la estructura esperada
        if (!request.user || typeof request.user !== 'object') {
            return reply.status(401).send({
                error: 'Token inválido',
                message: 'El token no contiene información de usuario válida'
            });
        }

        // Validar que el token tenga los campos requeridos
        const user = request.user as any;
        if (!user.id || !user.rol) {
            return reply.status(401).send({
                error: 'Token incompleto',
                message: 'El token no contiene todos los campos requeridos (id, rol)'
            });
        }

    } catch (err) {
        return reply.status(401).send({
            error: 'No autorizado',
            message: 'Token JWT inválido o expirado'
        });
    }
}

/**
 * Middleware para requerir roles específicos
 * Uso: preHandler: [verifyJWT, requireRole(['ADMIN'])]
 * 
 * @param allowedRoles - Array de roles permitidos
 */
export function requireRole(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        // Asegurarse de que verifyJWT se ejecutó primero
        if (!request.user) {
            return reply.status(401).send({
                error: 'No autorizado',
                message: 'Debe autenticarse primero'
            });
        }

        const userRole = request.user.rol as string;

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!allowedRoles.includes(userRole)) {
            return reply.status(403).send({
                error: 'Acceso denegado',
                message: `Esta acción requiere uno de los siguientes roles: ${allowedRoles.join(', ')}. Tu rol actual es: ${userRole}`
            });
        }
    };
}

/**
 * Middleware para aplicar Row-Level Security
 * Este middleware NO bloquea la request, solo marca que RLS debe aplicarse
 * Los filtros reales se aplican en los handlers usando rls-helpers.ts
 */
export async function applyRLS(
    request: FastifyRequest,
    reply: FastifyReply
) {
    // Asegurarse de que verifyJWT se ejecutó primero
    if (!request.user) {
        return reply.status(401).send({
            error: 'No autorizado',
            message: 'Debe autenticarse primero para acceder a este recurso'
        });
    }

    // Marcar que RLS está activo (opcional, para debugging)
    (request as any).rlsEnabled = true;
}

/**
 * Middleware para validar que un usuario solo puede modificar sus propios datos
 * Uso: preHandler: [verifyJWT, requireSelfOrAdmin]
 */
export async function requireSelfOrAdmin(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.status(401).send({
            error: 'No autorizado',
            message: 'Debe autenticarse primero'
        });
    }

    // Obtener el ID del usuario de los parámetros de la ruta
    const params = request.params as any;
    const targetUserId = parseInt(params.id || params.userId);

    // ADMIN puede modificar cualquier usuario
    if (request.user.rol === 'ADMIN') {
        return;
    }

    // Usuarios normales solo pueden modificar sus propios datos
    if (request.user.id !== targetUserId) {
        return reply.status(403).send({
            error: 'Acceso denegado',
            message: 'Solo puedes modificar tus propios datos'
        });
    }
}

/**
 * Middleware para validar que un usuario es capitán del equipo que intenta modificar
 */
export async function requireTeamCaptain(
    request: FastifyRequest,
    reply: FastifyReply
) {
    if (!request.user) {
        return reply.status(401).send({
            error: 'No autorizado',
            message: 'Debe autenticarse primero'
        });
    }

    // ADMIN puede modificar cualquier equipo
    if (request.user.rol === 'ADMIN') {
        return;
    }

    // Para CAPITAN, validar en el handler usando Prisma
    // Este middleware solo marca que la validación es necesaria
    (request as any).requireCaptainValidation = true;
}
