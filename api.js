

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
      
    }

    if (!response.ok) {
        throw new Error(data.error || `Error del servidor (${response.status})`);
    }

    return data;
}

/* ---------- Registro ---------- */

export async function registerUser(user, password, securityQuestion, securityAnswer) {
    const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password, securityQuestion, securityAnswer })
    });

    return parseRespuesta(response);
}

/* ---------- Login ---------- */

export async function loginUser(user, password) {
    const response = await fetch("login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password })
    });

    const data = await parseRespuesta(response);

    const sesion = { token: data.token, user: data.user };
    guardarSesion(sesion);

    return sesion;
}

/* ---------- Recuperar contraseña ---------- */

export async function getSecurityQuestion(user) {
    const response = await fetch("/api/recover-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user })
    });

    const data = await parseRespuesta(response);
    return data.question;
}

export async function verifySecurityAnswer(user, answer) {
    const response = await fetch("/api/recover-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, answer })
    });

    return parseRespuesta(response);
}

export async function resetPasswordWithAnswer(user, answer, newPassword) {
    const response = await fetch("/api/recover-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, answer, newPassword })
    });

    return parseRespuesta(response);
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
