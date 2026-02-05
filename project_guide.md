# Guía del Proyecto: UIDEportes Backend

Esta guía proporciona una visión general técnica y funcional del proyecto `UIDEportes-backend`.

## 1. Visión General
El proyecto es una API REST para la gestión de campeonatos deportivos universitarios. Permite administrar:
- **Torneos y Campeonatos:** Organización de eventos deportivos (Fútbol, Basket, Ecuavoley).
- **Equipos y Jugadores:** Inscripción de equipos, capitanes y miembros.
- **Partidos:** Programación, resultados y estadísticas.
- **Pagos:** Validación de comprobantes de pago para inscripciones.

## 2. Tecnologías Clave (Tech Stack)
El proyecto utiliza un stack moderno y tipado:
- **Backend Framework:** [Fastify](https://fastify.dev/) (Rápido y eficiente, alternativa a Express).
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) (JavaScript con tipos estáticos).
- **ORM (Base de Datos):** [Prisma](https://www.prisma.io/) (Interactúa con la BD de forma segura y tipada).
- **Validación:** [Zod](https://zod.dev/) (Valida los datos que entran a la API).
- **Documentación:** Swagger (UI disponible en `/docs`).
- **Autenticación:** JWT (@fastify/jwt) para manejo de sesiones seguras.

## 3. Arquitectura del Proyecto
La estructura de carpetas en `src` es modular. Cada funcionalidad principal tiene su propia carpeta en `src/modules`.

### Estructura de un Módulo (Ej. `src/modules/auth`)
- **`*.routes.ts`**: Define las rutas (endpoints) de la API (ej. `POST /login`).
- **`*.controller.ts`**: Contiene la lógica de negocio (qué hacer cuando se llama a la ruta).
- **`*.schemas.ts`**: Define la forma de los datos esperados usando Zod (ej. email requerido, password mín 6 caracteres).
- **`*.middleware.ts`**: (Opcional) Código que se ejecuta antes del controlador (ej. verificar si es admin).

### Flujo de una Petición
1. **Cliente** envía petición HTTP (ej. `GET /api/torneos`).
2. **Fastify** recibe la petición y valida los datos con **Zod**.
3. **Route** dirige la petición al **Controller** adecuado.
4. **Controller** llama a **Prisma** para consultar/modificar la base de datos.
5. **Prisma** ejecuta la consulta SQL y devuelve los datos.
6. **Controller** envía la respuesta JSON al cliente.

## 4. Seguridad y Roles (Feature Destacada)
El sistema implementa un modelo de seguridad robusto:

1.  **Roles de Usuario:**
    -   `ADMIN`: Acceso total.
    -   `CAPITAN`: Gestiona su equipo y ve información relevante a él.
    -   `ESTUDIANTE`: Solo ve información pública o de los equipos donde juega.

2.  **Row-Level Security (RLS) a Nivel de Aplicación:**
    En [src/utils/rls-helpers.ts](file:///c:/Users/HP/OneDrive/Escritorio/UIDE/4ciclo/P.%20Middleware%20y%20Seguridad%20de%20BD/UIDEportes-backend/backend/src/utils/rls-helpers.ts), hay funciones inteligentes que filtran los datos *automáticamente* según quien pregunta.
    *Ejemplo:* Si un `CAPITAN` consulta "mis equipos", el sistema inyecta un filtro `WHERE capitanId = X` para que solo vea los suyos.

## 5. Integración con IA (MCP Server)
El proyecto incluye un servidor **MCP (Model Context Protocol)** en [src/mcp/mcp-server.ts](file:///c:/Users/HP/OneDrive/Escritorio/UIDE/4ciclo/P.%20Middleware%20y%20Seguridad%20de%20BD/UIDEportes-backend/backend/src/mcp/mcp-server.ts).
- **¿Qué es?** Permite que una Inteligencia Artificial (como Claude o Gemini) se "conecte" a la base de datos de manera segura.
- **¿Cómo funciona?** La IA puede usar "herramientas" predefinidas (`query_my_teams`, `query_match_stats`) para responder preguntas en lenguaje natural sobre los datos deportivos, respetando siempre los permisos del usuario.

## 6. Base de Datos (Esquema Resumido)
- **Campeonato** tiene muchos **Torneos** (Ej. "Copa 2025" -> "Futbol Masculino").
- **Equipos** tienen un **Capitán** y muchos **Miembros**.
- **Partidos** vinculan dos equipos, una cancha y un árbitro.
- **ValidacionPago** permite a los capitanes subir comprobantes que los admins aprueban.

## 7. Comandos Principales ([package.json](file:///c:/Users/HP/OneDrive/Escritorio/UIDE/4ciclo/P.%20Middleware%20y%20Seguridad%20de%20BD/UIDEportes-backend/backend/package.json))
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run prisma:generate`: Actualiza el cliente de Prisma tras cambios en la BD.
- `npm run prisma:migrate`: Aplica cambios a la estructura de la base de datos MySQL.
