import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL);

// api/register.js
import { sql } from './_lib.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Corregido: 'username' en lugar de 'name'
    const existing = await sql`SELECT id FROM users WHERE email = ${email} OR username = ${username}`;
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El usuario o email ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Corregido: 'username' y 'password' coincidiendo con schema.sql
    const result = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email
    `;

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: result[0]
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
}