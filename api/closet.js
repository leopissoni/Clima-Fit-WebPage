// api/closet.js
// GET  -> devuelve el armario guardado del usuario autenticado
// POST { armario } -> guarda/reemplaza el armario del usuario autenticado

import { sql, getUserFromRequest } from './_lib.js';

export default async function handler(req, res) {
    const usuario = getUserFromRequest(req);

    if (!usuario) {
        return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.method === 'GET') {
        try {
            const filas = await sql`
                SELECT armario FROM usuarios WHERE id = ${usuario.userId}
            `;

            if (filas.length === 0) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            return res.status(200).json({ armario: filas[0].armario || {} });

        } catch (error) {
            console.error('Error en GET /api/closet:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    if (req.method === 'POST') {
        const { armario } = req.body || {};

        if (!armario || typeof armario !== 'object') {
            return res.status(400).json({ error: 'Falta el armario a guardar' });
        }

        try {
            await sql`
                UPDATE usuarios
                SET armario = ${JSON.stringify(armario)}::jsonb
                WHERE id = ${usuario.userId}
            `;

            return res.status(200).json({ message: 'Armario guardado' });

        } catch (error) {
            console.error('Error en POST /api/closet:', error);
            return res.status(500).json({ error: 'Error del servidor' });
        }
    }

    return res.status(405).json({ error: 'Método no permitido' });
}
