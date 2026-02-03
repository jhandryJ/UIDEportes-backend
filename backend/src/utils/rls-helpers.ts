import { Rol } from '@prisma/client';

/**
 * Helpers para construir filtros de Prisma según el contexto del usuario
 * Estos filtros implementan Row-Level Security (RLS) a nivel de aplicación
 */

/**
 * Obtiene el filtro para consultas de equipos según el rol del usuario
 * 
 * @param userId - ID del usuario autenticado
 * @param role - Rol del usuario (ADMIN, CAPITAN, ESTUDIANTE)
 * @returns Objeto de filtro para Prisma
 */
export function getTeamFilter(userId: number, role: Rol) {
    // ADMIN puede ver todos los equipos
    if (role === 'ADMIN') {
        return {};
    }

    // CAPITAN solo ve su propio equipo
    if (role === 'CAPITAN') {
        return {
            capitanId: userId
        };
    }

    // ESTUDIANTE ve equipos donde es miembro o capitán
    return {
        OR: [
            { capitanId: userId },
            {
                miembros: {
                    some: {
                        usuarioId: userId
                    }
                }
            }
        ]
    };
}

/**
 * Obtiene el filtro para consultas de torneos según el rol del usuario
 * Los torneos se filtran según los equipos del usuario
 */
export function getTournamentFilter(userId: number, role: Rol) {
    // ADMIN puede ver todos los torneos
    if (role === 'ADMIN') {
        return {};
    }

    // CAPITAN y ESTUDIANTE solo ven torneos donde participan sus equipos
    return {
        inscripciones: {
            some: {
                equipo: {
                    OR: [
                        { capitanId: userId },
                        {
                            miembros: {
                                some: {
                                    usuarioId: userId
                                }
                            }
                        }
                    ]
                }
            }
        }
    };
}

/**
 * Obtiene el filtro para consultas de pagos según el rol del usuario
 */
export function getPaymentFilter(userId: number, role: Rol) {
    // ADMIN puede ver todos los pagos
    if (role === 'ADMIN') {
        return {};
    }

    // CAPITAN ve pagos de su equipo
    if (role === 'CAPITAN') {
        return {
            equipo: {
                capitanId: userId
            }
        };
    }

    // ESTUDIANTE ve pagos de equipos donde es miembro
    return {
        equipo: {
            OR: [
                { capitanId: userId },
                {
                    miembros: {
                        some: {
                            usuarioId: userId
                        }
                    }
                }
            ]
        }
    };
}

/**
 * Obtiene el filtro para consultas de partidos según el rol del usuario
 */
export function getMatchFilter(userId: number, role: Rol) {
    // ADMIN puede ver todos los partidos
    if (role === 'ADMIN') {
        return {};
    }

    // CAPITAN y ESTUDIANTE solo ven partidos de sus equipos
    return {
        OR: [
            {
                equipoLocal: {
                    OR: [
                        { capitanId: userId },
                        {
                            miembros: {
                                some: {
                                    usuarioId: userId
                                }
                            }
                        }
                    ]
                }
            },
            {
                equipoVisitante: {
                    OR: [
                        { capitanId: userId },
                        {
                            miembros: {
                                some: {
                                    usuarioId: userId
                                }
                            }
                        }
                    ]
                }
            }
        ]
    };
}

/**
 * Obtiene el filtro para consultas de inscripciones según el rol del usuario
 */
export function getEnrollmentFilter(userId: number, role: Rol) {
    // ADMIN puede ver todas las inscripciones
    if (role === 'ADMIN') {
        return {};
    }

    // CAPITAN y ESTUDIANTE solo ven inscripciones de sus equipos
    return {
        equipo: {
            OR: [
                { capitanId: userId },
                {
                    miembros: {
                        some: {
                            usuarioId: userId
                        }
                    }
                }
            ]
        }
    };
}

/**
 * Valida si un usuario tiene permiso para acceder a un equipo específico
 * 
 * @param userId - ID del usuario
 * @param role - Rol del usuario
 * @param teamId - ID del equipo a validar
 * @param prisma - Cliente de Prisma
 * @returns true si tiene permiso, false si no
 */
export async function canAccessTeam(
    userId: number,
    role: Rol,
    teamId: number,
    prisma: any
): Promise<boolean> {
    // ADMIN puede acceder a cualquier equipo
    if (role === 'ADMIN') {
        return true;
    }

    // Buscar el equipo con el filtro RLS
    const team = await prisma.equipo.findFirst({
        where: {
            id: teamId,
            ...getTeamFilter(userId, role)
        }
    });

    return team !== null;
}

/**
 * Valida si un usuario tiene permiso para modificar un equipo específico
 * Solo ADMIN y CAPITAN del equipo pueden modificar
 */
export async function canModifyTeam(
    userId: number,
    role: Rol,
    teamId: number,
    prisma: any
): Promise<boolean> {
    // ADMIN puede modificar cualquier equipo
    if (role === 'ADMIN') {
        return true;
    }

    // Solo el CAPITAN puede modificar su equipo
    if (role === 'CAPITAN') {
        const team = await prisma.equipo.findFirst({
            where: {
                id: teamId,
                capitanId: userId
            }
        });
        return team !== null;
    }

    // ESTUDIANTE no puede modificar equipos
    return false;
}

/**
 * Valida si un usuario tiene permiso para acceder a un torneo específico
 */
export async function canAccessTournament(
    userId: number,
    role: Rol,
    tournamentId: number,
    prisma: any
): Promise<boolean> {
    // ADMIN puede acceder a cualquier torneo
    if (role === 'ADMIN') {
        return true;
    }

    // Buscar el torneo con el filtro RLS
    const tournament = await prisma.torneo.findFirst({
        where: {
            id: tournamentId,
            ...getTournamentFilter(userId, role)
        }
    });

    return tournament !== null;
}

/**
 * Obtiene información del usuario desde el request de Fastify
 * Helper para evitar repetir código
 */
export function getUserFromRequest(request: any): { id: number; rol: Rol } {
    if (!request.user) {
        throw new Error('Usuario no autenticado');
    }
    return {
        id: request.user.id,
        rol: request.user.rol
    };
}
