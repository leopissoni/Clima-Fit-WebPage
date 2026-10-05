import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL);


export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { user, password, securityQuestion, securityAnswer } = req.body || {};

    if (!user || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (!securityQuestion || !securityAnswer) {
        return res.status(400).json({ error: 'La pregunta de seguridad y su respuesta son obligatorias' });
    }

    const userNormalizado = String(user).trim().toLowerCase();
    const respuestaNormalizada = String(securityAnswer).trim().toLowerCase();

    try {
        const existentes = await sql`
            SELECT id FROM usuarios WHERE user = ${userNormalizado}
        `;

        if (existentes.length > 0) {
            return res.status(409).json({ error: 'Ese usuario ya existe' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const securityAnswerHash = await bcrypt.hash(respuestaNormalizada, 10);

        await sql`
            INSERT INTO usuarios (user, password_hash, security_question, security_answer_hash, armario)
            VALUES (${userNormalizado}, ${passwordHash}, ${securityQuestion}, ${securityAnswerHash}, '{}'::jsonb)
        `;

        return res.status(201).json({ message: 'Usuario creado correctamente' });

    } catch (error) {
        console.error('Error en /api/register:', error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
}
