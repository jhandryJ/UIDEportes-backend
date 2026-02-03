# UIDEportes API

API REST para la plataforma de gestión de campeonatos deportivos de la Universidad Internacional del Ecuador (UIDE).

## 🎯 Características Principales

- ✅ **Row-Level Security (RLS)**: Seguridad a nivel de fila implementada en todas las consultas
- ✅ **Agente MCP**: Servidor Model Context Protocol para integración con Claude Desktop
- ✅ **Autenticación JWT**: Sistema de autenticación seguro con tokens
- ✅ **Defensa en Profundidad**: 5 capas de seguridad para proteger datos sensibles
- ✅ **API REST Completa**: CRUD para equipos, torneos, partidos y pagos
- ✅ **Documentación Automática**: Swagger/OpenAPI generado automáticamente

---

## 🚀 Tecnologías

Este proyecto utiliza un stack moderno y de alto rendimiento:

- **Runtime**: Node.js 22+ (ES Modules)
- **Framework**: [Fastify v5](https://fastify.dev/) (High performance)
- **Lenguaje**: TypeScript
- **ORM**: [Prisma](https://www.prisma.io/) (v6)
- **Base de Datos**: MySQL 8
- **Validación**: [Zod](https://zod.dev/)
- **Autenticación**: [@fastify/jwt](https://github.com/fastify/fastify-jwt)
- **MCP**: [@modelcontextprotocol/sdk](https://modelcontextprotocol.io/)
- **Docs**: Swagger / OpenAPI (Automático)

---

## 🔒 Seguridad: Row-Level Security (RLS)

### ¿Qué es RLS?

Row-Level Security es una estrategia de seguridad que filtra los datos **antes** de que lleguen al usuario, asegurando que cada usuario solo vea los datos que le pertenecen.

### Implementación

El proyecto implementa **Defensa en Profundidad** con 5 capas de seguridad:

1. **Autenticación JWT**: Verifica la identidad del usuario
2. **Middleware de Autorización**: Valida roles y permisos
3. **Filtros RLS**: Aplica filtros dinámicos según el usuario
4. **Validación en Controladores**: Doble verificación de acceso
5. **Sanitización de Entrada**: Previene inyecciones SQL

### Ejemplo de RLS

```typescript
// Usuario ESTUDIANTE solo ve sus equipos
const teams = await prisma.equipo.findMany({
  where: {
    OR: [
      { capitanId: userId },
      { miembros: { some: { usuarioId: userId } } }
    ]
  }
});

// Usuario ADMIN ve todos los equipos
const teams = await prisma.equipo.findMany(); // Sin filtros
```

---

## 🤖 Agente MCP (Model Context Protocol)

### ¿Qué es MCP?

MCP es un protocolo que permite a Claude Desktop interactuar de forma segura con tu base de datos a través de herramientas predefinidas.

### Herramientas Disponibles

El servidor MCP incluye 4 herramientas seguras:

1. **`query_my_teams`**: Consulta los equipos del usuario (con RLS)
2. **`query_tournaments`**: Lista torneos disponibles
3. **`query_matches`**: Consulta partidos
4. **`query_team_stats`**: Estadísticas de equipos (con validación RLS)

### Configuración

El agente MCP se configura mediante variables de entorno:

```bash
MCP_USER_ID=4          # ID del usuario
MCP_USER_ROLE=ESTUDIANTE  # Rol: ESTUDIANTE, CAPITAN, ADMIN
```

**Importante**: Estas variables son **fijas** y no pueden ser modificadas por el agente, garantizando que Claude no pueda bypassear RLS.

---

## 📋 Requisitos Previos

- Node.js v22 o superior
- MySQL 8.0 corriendo localmente o en Docker
- (Opcional) Claude Desktop para probar el agente MCP

---

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita `.env` y configura:

```env
DATABASE_URL="mysql://root:password@localhost:3306/UIDEportes_2"
PORT=3000
JWT_SECRET="tu-secreto-super-seguro-aqui"
```

### 3. Configurar Base de Datos

```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate
```

### 4. Compilar TypeScript

```bash
npm run build
```

---

## ▶️ Ejecución

### Modo Desarrollo

```bash
npm run dev
```

El servidor iniciará en: `http://localhost:3000`

### Modo Producción

```bash
npm run build
npm start
```

---

## 📚 Documentación API (Swagger)

La documentación interactiva se genera automáticamente:

- **URL**: [http://localhost:3000/docs](http://localhost:3000/docs)

### Autenticación en Swagger

1. Usa `POST /api/auth/login` para obtener un `accessToken`
2. Click en **Authorize** en la parte superior
3. Pega el token (sin prefijo `Bearer`)
4. ¡Listo! Ahora puedes probar endpoints protegidos

---

## 🧪 Probar Row-Level Security

### Opción 1: API REST

```bash
# 1. Registrar usuario
POST http://localhost:3000/api/auth/register
{
  "cedula": "1234567890",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@uide.edu.ec",
  "password": "password123",
  "rol": "ESTUDIANTE"
}

# 2. Login
POST http://localhost:3000/api/auth/login
{
  "email": "juan@uide.edu.ec",
  "password": "password123"
}

# 3. Consultar equipos (con token)
GET http://localhost:3000/api/equipos
Authorization: Bearer <tu-token>
```

### Opción 2: MCP Inspector

```bash
# Configurar usuario
$env:DATABASE_URL="mysql://root:password@localhost:3306/UIDEportes_2"
$env:MCP_USER_ID="4"
$env:MCP_USER_ROLE="ESTUDIANTE"

# Iniciar inspector
npx @modelcontextprotocol/inspector node dist/mcp/mcp-server.js
```

Abre `http://localhost:5173` y ejecuta `query_my_teams`

### Opción 3: Claude Desktop

1. Configura Claude Desktop (ver documentación interna)
2. Pregunta: "¿Cuáles son mis equipos?"
3. Claude solo verá los equipos del usuario configurado

---

## 📂 Estructura del Proyecto

```
backend/
├── src/
│   ├── app.ts                 # Configuración principal de Fastify
│   ├── server.ts              # Punto de entrada
│   ├── modules/
│   │   ├── auth/              # Autenticación y registro
│   │   ├── teams/             # Gestión de equipos (con RLS)
│   │   ├── tournaments/       # Gestión de torneos
│   │   ├── matches/           # Gestión de partidos
│   │   └── payments/          # Gestión de pagos (con RLS)
│   ├── utils/
│   │   ├── middleware.ts      # Middleware JWT y autorización
│   │   └── rls-helpers.ts     # Funciones de filtrado RLS
│   └── mcp/
│       └── mcp-server.ts      # Servidor MCP con herramientas seguras
├── prisma/
│   └── schema.prisma          # Modelo de datos
├── .env.example               # Ejemplo de variables de entorno
├── .gitignore                 # Archivos ignorados por Git
├── package.json               # Dependencias y scripts
├── tsconfig.json              # Configuración de TypeScript
└── README.md                  # Este archivo
```

---

## 🔐 Roles y Permisos

### ESTUDIANTE
- ✅ Ver equipos donde es miembro o capitán
- ✅ Ver torneos públicos
- ❌ No puede ver equipos de otros

### CAPITAN
- ✅ Ver y gestionar su equipo
- ✅ Ver torneos y partidos
- ❌ No puede ver otros equipos

### ADMIN
- ✅ Ver todos los equipos
- ✅ Gestionar torneos y partidos
- ✅ Validar pagos
- ✅ Acceso completo al sistema

---

## 🧑‍💻 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor en modo desarrollo

# Producción
npm run build            # Compila TypeScript a JavaScript
npm start                # Inicia servidor compilado

# Base de Datos
npm run prisma:generate  # Genera cliente de Prisma
npm run prisma:migrate   # Ejecuta migraciones
npm run prisma:studio    # Abre Prisma Studio (GUI)

# Utilidades
npm run lint             # Ejecuta linter
npm test                 # Ejecuta tests (si están configurados)
```

---

## 🎓 Casos de Uso

### 1. Estudiante Consulta Sus Equipos

```typescript
// Juan (ESTUDIANTE, ID: 4) hace login
const token = await login("juan@uide.edu.ec", "password123");

// Consulta sus equipos
const teams = await fetch("/api/equipos", {
  headers: { Authorization: `Bearer ${token}` }
});

// Resultado: Solo ve "Tigres FC" (su equipo)
```

### 2. Capitán Gestiona Su Equipo

```typescript
// María (CAPITAN, ID: 5) hace login
const token = await login("maria@uide.edu.ec", "password123");

// Consulta su equipo
const teams = await fetch("/api/equipos", {
  headers: { Authorization: `Bearer ${token}` }
});

// Resultado: Solo ve "Lobos UIDE" (su equipo)
```

### 3. Admin Ve Todos los Equipos

```typescript
// Admin hace login
const token = await login("admin@uide.edu.ec", "admin123");

// Consulta todos los equipos
const teams = await fetch("/api/equipos", {
  headers: { Authorization: `Bearer ${token}` }
});

// Resultado: Ve TODOS los equipos (sin filtros RLS)
```

---

## 🚨 Seguridad y Mejores Prácticas

### Variables de Entorno

- ✅ **NUNCA** subas el archivo `.env` al repositorio
- ✅ Usa `.env.example` como plantilla
- ✅ Cambia `JWT_SECRET` en producción
- ✅ Usa servicios de secrets management (AWS Secrets Manager, etc.)

### Tokens JWT

- ✅ Los tokens expiran automáticamente
- ✅ Usa HTTPS en producción
- ✅ No almacenes tokens en localStorage (usa httpOnly cookies)

### Base de Datos

- ✅ Usa conexiones SSL en producción
- ✅ Limita permisos del usuario de BD
- ✅ Haz backups regulares

---

## 📞 Soporte y Contribución

### Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Abre un issue en el repositorio
2. Describe el problema claramente
3. Incluye pasos para reproducirlo

### Contribuir

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz commit: `git commit -m "feat: nueva funcionalidad"`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es parte del trabajo académico de la Universidad Internacional del Ecuador (UIDE).

---

## 👨‍💻 Autor

Jhandry Jaramillo - UIDE 2026

---

