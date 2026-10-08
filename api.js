// api.js
// Módulo del FRONTEND (va en la raíz del proyecto, junto a index.html y logica.js).
// No confundir con la carpeta /api que contiene las funciones serverless
// (login.js, register.js, closet.js, _lib.js).
//
// Se encarga de:
//  - Guardar/leer la sesión (token + email) en localStorage
//  - Llamar a los endpoints /api/login, /api/register y /api/closet

const SESSION_KEY = "climafit_session";

/* ---------- Sesión local ---------- */

export function getSesionGuardada() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function guardarSesion(sesion) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sesion));
}

export function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
}

/* ---------- Helper interno ---------- */

async function parseRespuesta(response) {
    let data = {};
    try {
        data = await response.json();
    } catch {
        // El servidor no devolvió JSON (por ejemplo, un 404 de HTML plano
        // porque /api/... no existe o no se está ejecutando con Vercel).
    }

    if (!response.ok) {
        throw new Error(data.error || `Error del servidor (${response.status})`);
    }

    return data;
}

/* ---------- Registro ---------- */

export async function registerUser(email, password) {
    const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    return parseRespuesta(response);
}

/* ---------- Login ---------- */

export async function loginUser(email, password) {
    const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await parseRespuesta(response);

    const sesion = { token: data.token, email: data.email };
    guardarSesion(sesion);

    return sesion;
}

/* ---------- Armario remoto (Neon) ---------- */

export async function fetchCloset(token) {
    const response = await fetch("/api/closet", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await parseRespuesta(response);
    return data.armario || {};
}

export async function saveClosetRemote(token, armario) {
    const response = await fetch("/api/closet", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ armario })
    });

    return parseRespuesta(response);
}
