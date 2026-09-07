-- Ejecutar esto una sola vez en el SQL Editor de Neon
-- (Neon Console -> tu proyecto -> "SQL Editor")

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    security_question TEXT NOT NULL,
    security_answer_hash TEXT NOT NULL,
    armario JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);

-- Si la tabla ya existía de antes (sin estas columnas), correr esto también:
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS security_question TEXT;
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS security_answer_hash TEXT;
