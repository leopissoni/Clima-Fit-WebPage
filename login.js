// api/login.js
// POST { email, password } -> devuelve { token, email } si es correcto

import bcrypt from 'bcryptjs';
import { sql, signToken } from './_lib.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    try {
        const filas = await sql`
            SELECT id, email, password_hash FROM usuarios WHERE email = ${emailNormalizado}
        `;

        if (filas.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const usuario = filas[0];
        const coincide = await bcrypt.compare(password, usuario.password_hash);

        if (!coincide) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const token = signToken({ userId: usuario.id, email: usuario.email });

        return res.status(200).json({ token, email: usuario.email });

    } catch (error) {
        console.error('Error en /api/login:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}
