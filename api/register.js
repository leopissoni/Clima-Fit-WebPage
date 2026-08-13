// api/register.js
// POST { email, password } -> crea el usuario en Neon

import bcrypt from 'bcryptjs';
import { sql } from './_lib.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    try {
        const existentes = await sql`
            SELECT id FROM usuarios WHERE email = ${emailNormalizado}
        `;

        if (existentes.length > 0) {
            return res.status(409).json({ error: 'Ese usuario ya existe' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await sql`
            INSERT INTO usuarios (email, password_hash, armario)
            VALUES (${emailNormalizado}, ${passwordHash}, '{}'::jsonb)
        `;

        return res.status(201).json({ message: 'Usuario creado correctamente' });

    } catch (error) {
        console.error('Error en /api/register:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}
