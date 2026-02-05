import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
});

export async function generateVerificationCode(email: string) {
    // 1. Generar código de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();

    // 2. Definir expiración (15 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // 3. Guardar o actualizar en BD
    // Upsert: Si ya existe código para ese email, lo actualiza. Si no, lo crea.
    await prisma.codigoVerificacion.upsert({
        where: { email },
        update: {
            codigo: code,
            expiresAt,
            intentos: 0,
            createdAt: new Date()
        },
        create: {
            email,
            codigo: code,
            expiresAt
        }
    });

    // 4. Enviar correo
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Código de Verificación - UIDEportes',
            text: `Tu código de verificación es: ${code}. Expira en 15 minutos.`,
            html: `<b>Tu código de verificación es: ${code}</b><br>Expira en 15 minutos.`
        });
        console.log(`[EMAIL] Enviando código ${code} a ${email}`);
        return { success: true, message: 'Código enviado a tu correo' };
    } catch (error) {
        console.error('Error enviando correo:', error);
        // Fallback para desarrollo si falla el envío real
        console.log(`[EMAIL MOCK] Falló envío real. Código: ${code}`);
        return { success: true, message: 'Código generado (Revisar consola del servidor si no llegó el correo)' };
    }
}

export async function validateVerificationCode(email: string, code: string) {
    // 1. Buscar el registro del código
    const record = await prisma.codigoVerificacion.findUnique({
        where: { email }
    });

    if (!record) {
        return { success: false, message: 'No se encontró una solicitud de verificación para este correo' };
    }

    // 2. Validar expiración
    if (new Date() > record.expiresAt) {
        return { success: false, message: 'El código ha expirado. Solicita uno nuevo.' };
    }

    // 3. Validar intentos (Rate limiting básico)
    if (record.intentos >= 3) {
        return { success: false, message: 'Demasiados intentos fallidos. Solicita un nuevo código.' };
    }

    // 4. Validar coincidencia
    if (record.codigo !== code) {
        // Incrementar contador de intentos fallidos
        await prisma.codigoVerificacion.update({
            where: { email },
            data: { intentos: record.intentos + 1 }
        });
        return { success: false, message: 'Código incorrecto' };
    }

    // 5. ¡Éxito! (Opcional: borrar el código usado para que no se re-use)
    await prisma.codigoVerificacion.delete({
        where: { email }
    });

    return { success: true, message: 'Código verificado correctamente' };
}
