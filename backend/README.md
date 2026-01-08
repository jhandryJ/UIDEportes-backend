# UIDEportes API

API REST para la plataforma de gestión de campeonatos deportivos de la Universidad Internacional del Ecuador (UIDE).

## 🚀 Tecnologías

Este proyecto utiliza un stack moderno y de alto rendimiento (2025):
-   **Runtime**: Node.js 22+ (ES Modules).
-   **Framework**: [Fastify v5](https://fastify.dev/) (High perdomance).
-   **Lenguaje**: TypeScript.
-   **ORM**: [Prisma](https://www.prisma.io/) (v6).
-   **Base de Datos**: MySQL 8.
-   **Validación**: [Zod](https://zod.dev/).
-   **Docs**: Swagger / OpenAPI (Automático).

## 📋 Requisitos Previos

-   Node.js v22 o superior.
-   MySQL 8.0 corriendo localmente o en Docker.

## 🛠️ Instalación y Configuración

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar Entorno:**
    Copia el archivo de ejemplo y configura tus credenciales de base de datos.
    ```bash
    cp .env.example .env
    ```
    Edita `.env` y ajusta `DATABASE_URL` con tu usuario y contraseña de MySQL.

3.  **Base de Datos:**
    Genera el cliente de Prisma y ejecuta las migraciones para crear las tablas.
    ```bash
    npm run prisma:generate
    npm run prisma:migrate
    ```

## ▶️ Ejecución

Para iniciar el servidor en modo desarrollo (con recarga automática):

```bash
npm run dev
```

El servidor iniciará en: `http://localhost:3000`

## 📚 Documentación API (Swagger)

La documentación interactiva se genera automáticamente basada en los esquemas de Zod.

-   **URL**: [http://localhost:3000/docs](http://localhost:3000/docs)

### Autenticación en Swagger
Para probar endpoints protegidos (candado cerrado):
1.  Usa el endpoint `POST /api/auth/login` para obtener un `accessToken`.
2.  Haz clic en el botón **Authorize** en la parte superior.
3.  Pega el token (sin prefijo `Bearer`, solo el token).
4.  ¡Listo! Tus peticiones ahora irán autenticadas.

## 📂 Estructura del Proyecto

-   `src/app.ts`: Punto de entrada y configuración de plugins.
-   `src/modules/`: Módulos funcionales (Auth, Torneos, etc.).
    -   `*.schemas.ts`: Definiciones Zod (Validación + Docs).
    -   `*.controller.ts`: Lógica de negocio.
    -   `*.routes.ts`: Definición de rutas.
-   `prisma/schema.prisma`: Modelo de datos.

## 📷 Capturas de Pantalla (Swagger)

A continuación se muestran capturas de la interfaz de documentación:

![Swagger Doc 1](./capturas/Captura%20de%20pantalla%202026-01-07%20221128.png)
![Swagger Doc 2](./capturas/Captura%20de%20pantalla%202026-01-07%20221137.png)
![Swagger Doc 3](./capturas/Captura%20de%20pantalla%202026-01-07%20221145.png)
![Swagger Doc 4](./capturas/Captura%20de%20pantalla%202026-01-07%20221154.png)
![Swagger Doc 5](./capturas/Captura%20de%20pantalla%202026-01-07%20221215.png)
![Swagger Doc 6](./capturas/Captura%20de%20pantalla%202026-01-07%20221220.png)
![Swagger Doc 7](./capturas/Captura%20de%20pantalla%202026-01-07%20221227.png)
![Swagger Doc 8](./capturas/Captura%20de%20pantalla%202026-01-07%20221234.png)
![Swagger Doc 9](./capturas/Captura%20de%20pantalla%202026-01-07%20221238.png)
![Swagger Doc 10](./capturas/Captura%20de%20pantalla%202026-01-07%20221246.png)

