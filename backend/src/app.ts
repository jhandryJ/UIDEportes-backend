import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { z } from 'zod';

import fjwt from '@fastify/jwt';
import { authRoutes } from './modules/auth/auth.routes.js';
import { tournamentRoutes } from './modules/tournaments/tournaments.routes.js';

const app = Fastify({
    logger: true,
});

// Setup Zod validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Register Plugins
app.register(cors, {
    origin: '*', // Adjust for production
});

app.register(fjwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
});

app.register(swagger, {
    openapi: {
        info: {
            title: 'UIDEportes API',
            description: 'API for UIDE Sports Management Platform',
            version: '1.0.0',
        },
        servers: [],
        tags: [
            { name: 'Auth', description: 'Authentication related endpoints' },
            { name: 'Torneos', description: 'Championship and Tournament management' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    transform: jsonSchemaTransform,
});

app.register(swaggerUI, {
    routePrefix: '/docs',
});

// Register Modules
app.register(authRoutes, { prefix: '/api/auth' });
app.register(tournamentRoutes, { prefix: '/api' });

// Basic Routes
app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
});

// Start Server
const start = async () => {
    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running on http://localhost:3000');
        console.log('Swagger docs: http://localhost:3000/docs');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
