#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { PrismaClient } from '@prisma/client';
import { getTeamFilter, getTournamentFilter, getMatchFilter } from '../utils/rls-helpers.js';
import { generateVerificationCode, validateVerificationCode } from '../modules/auth/auth.service.js';

// Inicializar Prisma
const prisma = new PrismaClient();

// Obtener configuración del usuario desde variables de entorno
const MCP_USER_ID = parseInt(process.env.MCP_USER_ID || '1');
const MCP_USER_ROLE = (process.env.MCP_USER_ROLE || 'ESTUDIANTE') as 'ADMIN' | 'CAPITAN' | 'ESTUDIANTE';

console.error(`[MCP Server] Iniciando servidor para Usuario ID: ${MCP_USER_ID}, Rol: ${MCP_USER_ROLE}`);

// Crear servidor MCP
const server = new Server(
    {
        name: 'uideportes-mcp-server',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Definir herramientas disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'query_my_teams',
                description: 'Consulta los equipos del usuario autenticado. Respeta Row-Level Security.',
                inputSchema: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            },
            {
                name: 'query_tournaments',
                description: 'Consulta torneos disponibles para el usuario. Filtra según los equipos del usuario.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        disciplina: {
                            type: 'string',
                            description: 'Filtrar por disciplina (opcional): Futbol, Basket, Ecuavoley',
                        },
                    },
                },
            },
            {
                name: 'query_matches',
                description: 'Consulta partidos del usuario. Solo muestra partidos de equipos donde participa.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        torneoId: {
                            type: 'number',
                            description: 'Filtrar por ID de torneo (opcional)',
                        },
                    },
                },
            },
            {
                name: 'query_team_stats',
                description: 'Obtiene estadísticas de un equipo específico. Valida que el usuario pertenezca al equipo.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        equipoId: {
                            type: 'number',
                            description: 'ID del equipo',
                        },
                    },
                    required: ['equipoId'],
                },
            },
            {
                name: 'request_verification_code',
                description: 'Genera y "envía" (simulado) un código de verificación al correo indicado. Útil para registrarse.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            description: 'Correo electrónico',
                        },
                    },
                    required: ['email'],
                },
            },
            {
                name: 'validate_verification_code',
                description: 'Valida el código de verificación recibido por correo.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            description: 'Correo electrónico',
                        },
                        code: {
                            type: 'string',
                            description: 'Código de 6 dígitos recibido',
                        },
                    },
                    required: ['email', 'code'],
                },
            },
        ],
    };
});

// Implementar handlers de herramientas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case 'query_my_teams': {
                // Aplicar filtro RLS
                const filter = getTeamFilter(MCP_USER_ID, MCP_USER_ROLE);

                const teams = await prisma.equipo.findMany({
                    where: filter,
                    include: {
                        capitan: {
                            select: {
                                id: true,
                                nombres: true,
                                apellidos: true,
                                email: true,
                            },
                        },
                        miembros: {
                            include: {
                                usuario: {
                                    select: {
                                        id: true,
                                        nombres: true,
                                        apellidos: true,
                                    },
                                },
                            },
                        },
                    },
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                userId: MCP_USER_ID,
                                userRole: MCP_USER_ROLE,
                                teams: teams.map(team => ({
                                    id: team.id,
                                    nombre: team.nombre,
                                    facultad: team.facultad,
                                    capitan: `${team.capitan.nombres} ${team.capitan.apellidos}`,
                                    miembros: team.miembros.length,
                                })),
                                message: `Encontrados ${teams.length} equipo(s) para el usuario`,
                            }, null, 2),
                        },
                    ],
                };
            }

            case 'query_tournaments': {
                const { disciplina } = args as { disciplina?: string };

                // Aplicar filtro RLS
                const filter = getTournamentFilter(MCP_USER_ID, MCP_USER_ROLE);

                const tournaments = await prisma.torneo.findMany({
                    where: {
                        ...filter,
                        ...(disciplina ? { disciplina } : {}),
                    },
                    include: {
                        campeonato: {
                            select: {
                                nombre: true,
                                anio: true,
                            },
                        },
                        inscripciones: {
                            include: {
                                equipo: {
                                    select: {
                                        nombre: true,
                                    },
                                },
                            },
                        },
                    },
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                userId: MCP_USER_ID,
                                userRole: MCP_USER_ROLE,
                                tournaments: tournaments.map(t => ({
                                    id: t.id,
                                    disciplina: t.disciplina,
                                    categoria: t.categoria,
                                    campeonato: t.campeonato.nombre,
                                    anio: t.campeonato.anio,
                                    equiposInscritos: t.inscripciones.length,
                                })),
                                message: `Encontrados ${tournaments.length} torneo(s)`,
                            }, null, 2),
                        },
                    ],
                };
            }

            case 'query_matches': {
                const { torneoId } = args as { torneoId?: number };

                // Aplicar filtro RLS
                const filter = getMatchFilter(MCP_USER_ID, MCP_USER_ROLE);

                const matches = await prisma.partido.findMany({
                    where: {
                        ...filter,
                        ...(torneoId ? { torneoId } : {}),
                    },
                    include: {
                        equipoLocal: {
                            select: {
                                nombre: true,
                                // logoUrl: true
                            },
                        },
                        equipoVisitante: {
                            select: {
                                nombre: true,
                                // logoUrl: true
                            },
                        },
                        cancha: {
                            select: {
                                nombre: true,
                            },
                        },
                        torneo: {
                            select: {
                                disciplina: true,
                            },
                        },
                    },
                    orderBy: {
                        fechaHora: 'asc',
                    },
                });

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                userId: MCP_USER_ID,
                                userRole: MCP_USER_ROLE,
                                matches: matches.map(m => ({
                                    id: m.id,
                                    local: m.equipoLocal?.nombre || 'TBD',
                                    visitante: m.equipoVisitante?.nombre || 'TBD',
                                    fecha: m.fechaHora,
                                    cancha: m.cancha?.nombre,
                                    estado: m.estado,
                                    marcador: `${m.marcadorLocal || 0} - ${m.marcadorVisitante || 0}`,
                                    disciplina: m.torneo.disciplina,
                                })),
                                message: `Encontrados ${matches.length} partido(s)`,
                            }, null, 2),
                        },
                    ],
                };
            }

            case 'query_team_stats': {
                const { equipoId } = args as { equipoId: number };

                if (!equipoId) {
                    throw new Error('equipoId es requerido');
                }

                // Validar acceso con RLS
                const filter = getTeamFilter(MCP_USER_ID, MCP_USER_ROLE);
                const team = await prisma.equipo.findFirst({
                    where: {
                        id: equipoId,
                        ...filter,
                    },
                    include: {
                        capitan: {
                            select: {
                                nombres: true,
                                apellidos: true,
                            },
                        },
                        miembros: {
                            include: {
                                usuario: {
                                    select: {
                                        nombres: true,
                                        apellidos: true,
                                    },
                                },
                            },
                        },
                        partidosLocal: {
                            where: {
                                estado: 'FINALIZADO',
                            },
                        },
                        partidosVisitante: {
                            where: {
                                estado: 'FINALIZADO',
                            },
                        },
                    },
                });

                if (!team) {
                    throw new Error('Equipo no encontrado o no tienes permiso para verlo');
                }

                // Calcular estadísticas
                const partidosJugados = team.partidosLocal.length + team.partidosVisitante.length;
                const victorias = team.partidosLocal.filter(p => (p.marcadorLocal || 0) > (p.marcadorVisitante || 0)).length +
                    team.partidosVisitante.filter(p => (p.marcadorVisitante || 0) > (p.marcadorLocal || 0)).length;
                const derrotas = team.partidosLocal.filter(p => (p.marcadorLocal || 0) < (p.marcadorVisitante || 0)).length +
                    team.partidosVisitante.filter(p => (p.marcadorVisitante || 0) < (p.marcadorLocal || 0)).length;
                const empates = partidosJugados - victorias - derrotas;

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: true,
                                userId: MCP_USER_ID,
                                userRole: MCP_USER_ROLE,
                                team: {
                                    id: team.id,
                                    nombre: team.nombre,
                                    facultad: team.facultad,
                                    capitan: `${team.capitan.nombres} ${team.capitan.apellidos}`,
                                    miembros: team.miembros.length,
                                    estadisticas: {
                                        partidosJugados,
                                        victorias,
                                        derrotas,
                                        empates,
                                        porcentajeVictorias: partidosJugados > 0 ? ((victorias / partidosJugados) * 100).toFixed(1) : '0',
                                    },
                                },
                                message: 'Estadísticas obtenidas exitosamente',
                            }, null, 2),
                        },
                    ],
                };
            }

            case 'request_verification_code': {
                const { email } = args as { email: string };
                if (!email) throw new Error('Email requerido');

                const result = await generateVerificationCode(email);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                success: result.success,
                                message: result.message,
                                note: "En un entorno real, el código se enviaría por correo. En este entorno de desarrollo, el código aparece en la consola del servidor backend (si está corriendo) o en la consola donde se ejecuta este MCP."
                            }, null, 2),
                        },
                    ],
                };
            }

            case 'validate_verification_code': {
                const { email, code } = args as { email: string; code: string };
                if (!email || !code) throw new Error('Email y código requeridos');

                const result = await validateVerificationCode(email, code);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }

            default:
                throw new Error(`Herramienta desconocida: ${name}`);
        }
    } catch (error: any) {
        console.error(`[MCP Server] Error en ${name}:`, error);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        success: false,
                        error: error.message,
                        userId: MCP_USER_ID,
                        userRole: MCP_USER_ROLE,
                    }, null, 2),
                },
            ],
            isError: true,
        };
    }
});

// Iniciar servidor
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP Server] Servidor MCP iniciado y listo para recibir conexiones');
}

main().catch((error) => {
    console.error('[MCP Server] Error fatal:', error);
    process.exit(1);
});
