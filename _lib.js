// api/_lib.js
// Módulo interno compartido por los endpoints: conexión a Neon + JWT.
// (No es un endpoint en sí mismo, por eso el guion bajo adelante.)

import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

if (!process.env.DATABASE_URL) {
    throw new Error('Falta la variable de entorno DATABASE_URL');
}

if (!process.env.JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
}

/* ---------- Conexión a Neon ---------- */

export const sql = neon(process.env.DATABASE_URL);

/* ---------- JWT (reemplaza la sesión de Firebase Auth) ---------- */

export function signToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Devuelve el payload decodificado o null si el token es inválido/ausente
export function getUserFromRequest(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}
