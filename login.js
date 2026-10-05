

import bcrypt from 'bcryptjs';
import { sql, signToken } from './_lib.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { user, password } = req.body || {};

    if (!user || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const userNormalizado = String(user).trim().toLowerCase();

    try {
        const filas = await sql`
            SELECT id, user, password_hash FROM usuarios WHERE user = ${userNormalizado}
        `;

        if (filas.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const usuario = filas[0];
        const coincide = await bcrypt.compare(password, usuario.password_hash);

        if (!coincide) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const token = signToken({ userId: usuario.id, user: usuario.user });

        return res.status(200).json({ token, user: usuario.user });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}
