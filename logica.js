/* ============================================================
   CLIMAFIT — LÓGICA DE LA APLICACIÓN
   ============================================================ */

const apiKey = "bd568d71412c5915f72c032677b64d04";
let ultimoClima = null;
let currentUser = null;
let selectedImgData = null;

const CATEGORIAS = [
    "remeras",
    "pantalones",
    "bermudas",
    "camperas-livianas",
    "camperas-abrigo",
    "calzado",
    "vestidos",
    "polleras"
];

/* ============================================================
   LOGIN / REGISTRO
   ============================================================ */

function showRegister() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.remove("hidden");
    document.getElementById("recoverBox").classList.add("hidden");
}

function showLogin() {
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("recoverBox").classList.add("hidden");
    document.getElementById("loginBox").classList.remove("hidden");
}

function showRecover() {
    document.getElementById("loginBox").classList.add("hidden");
    document.getElementById("registerBox").classList.add("hidden");
    document.getElementById("recoverBox").classList.remove("hidden");
}

/* ---------- Mostrar / ocultar contraseña ---------- */

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const icon = btn.querySelector("i");
    const visible = input.type === "text";

    input.type = visible ? "password" : "text";

    if (icon) {
        icon.classList.toggle("fa-eye", visible);
        icon.classList.toggle("fa-eye-slash", !visible);
    }

    btn.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
}

/* ---------- Recuperar contraseña ---------- */

function recoverPassword() {
    const user = document.getElementById("recoverUser").value.trim();
    const newPass = document.getElementById("recoverNewPass").value;
    const newPassConfirm = document.getElementById("recoverNewPassConfirm").value;

    if (user === "" || newPass === "" || newPassConfirm === "") {
        alert("Completa todos los campos");
        return;
    }

    if (localStorage.getItem("user_" + user) === null) {
        alert("No existe ninguna cuenta con ese nombre de usuario");
        return;
    }

    if (newPass !== newPassConfirm) {
        alert("Las contraseñas no coinciden");
        return;
    }

    if (newPass.length < 4) {
        alert("La nueva contraseña debe tener al menos 4 caracteres");
        return;
    }

    localStorage.setItem("user_" + user, newPass);
    alert("Contraseña actualizada correctamente. Ya podés iniciar sesión.");

    document.getElementById("recoverUser").value = "";
    document.getElementById("recoverNewPass").value = "";
    document.getElementById("recoverNewPassConfirm").value = "";

    showLogin();
}

function register() {
    const user = document.getElementById("registerUser").value.trim();
    const pass = document.getElementById("registerPass").value;

    if (user === "" || pass === "") {
        alert("Completa todos los campos");
        return;
    }

    if (localStorage.getItem("user_" + user) !== null) {
        alert("Ese nombre de usuario ya existe");
        return;
    }

    localStorage.setItem("user_" + user, pass);
    alert("Usuario registrado correctamente");
    showLogin();
}

function login() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value;
    const savedPass = localStorage.getItem("user_" + user);

    if (savedPass !== null && savedPass === pass) {
        enterApp(user);
    } else {
        alert("Usuario o contraseña incorrectos");
    }
}

function guest() {
    enterApp("Invitado");
}

function logout() {
    currentUser = null;

    document.getElementById("app").classList.add("hidden");
    document.getElementById("auth-screen").classList.remove("hidden");

    document.getElementById("loginUser").value = "";
    document.getElementById("loginPass").value = "";

    showLogin();
}

function enterApp(user) {
    currentUser = user;

    document.getElementById("welcomeUser").innerText = "Bienvenido, " + user;
    document.getElementById("auth-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    loadCloset();
    updateClock();
    loadSavedCloset();
}

function loadSavedCloset() {
    if (currentUser === "Invitado") return;

    const saved = localStorage.getItem("closet_" + currentUser);
    if (!saved) return;

    const armario = JSON.parse(saved);

    Object.keys(armario).forEach(categoria => {
        localStorage.setItem(categoria, JSON.stringify(armario[categoria]));
    });

    loadCloset();
}

/* ============================================================
   RELOJ
   ============================================================ */

function updateClock() {
    document.getElementById("clock").innerText = new Date().toLocaleString("es-AR");
}
setInterval(updateClock, 1000);

/* ============================================================
   API CLIMA
   ============================================================ */

async function getWeather() {
    const city = document.getElementById("city").value.trim();

    if (!city) {
        alert("Ingresá una ciudad");
        return;
    }

    const btn = document.querySelector(".search button");
    btn.disabled = true;
    btn.innerText = "Cargando...";

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                alert("Ciudad no encontrada. Verificá el nombre.");
            } else if (response.status === 401) {
                alert("La clave de la API del clima no es válida o expiró. Revisá el apiKey en logica.js.");
            } else {
                alert("Error de conexión: " + response.status);
            }
            return;
        }

        const data = await response.json();
        const clima = data.list[0];

        const temp = clima.main.temp;
        const humidity = clima.main.humidity;
        const windMs = clima.wind.speed;
        const wind = Number((windMs * 3.6).toFixed(1));
        const desc = clima.weather[0].description;
        const precipitation = Math.round((clima.pop || 0) * 100);
        const weatherIcon = clima.weather[0].icon;

        let sensacion;
        if (temp <= 10 && wind > 4.8) {
            sensacion = 13.12 + 0.6215 * temp - 11.37 * Math.pow(wind, 0.16) + 0.3965 * temp * Math.pow(wind, 0.16);
        } else {
            sensacion = temp - (wind * 0.05) + (humidity * 0.015);
        }
        sensacion = parseFloat(sensacion.toFixed(1));

        ultimoClima = { temp, humidity, wind, sensacion };

        document.getElementById("weatherResult").innerHTML = `
            <div class="weather-card-modern">
                <div class="weather-header">
                    <h2>${city}</h2>
                    <img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="clima">
                </div>
                <div class="weather-temp">${temp.toFixed(1)}°C</div>
                <div class="weather-details">
                    <div>💧 Humedad<br><strong>${humidity}%</strong></div>
                    <div>🌬 Viento<br><strong>${wind} km/h</strong></div>
                    <div>🌧 Lluvia<br><strong>${precipitation}%</strong></div>
                </div>
                <div class="weather-desc">${desc}</div>
            </div>
        `;

        generateOutfits(temp, humidity, wind, sensacion);
        changeBackground(desc);

    } catch (error) {
        console.error(error);
        alert("No se pudo obtener el clima. Revisá tu conexión.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Buscar";
    }
}

function changeBackground(desc) {
    desc = desc.toLowerCase();

    const fondos = {
        lluv: "linear-gradient(135deg,#374151,#1f2937,#111827)",
        nube: "linear-gradient(135deg,#94a3b8,#64748b,#334155)",
        torment: "linear-gradient(135deg,#312e81,#1e1b4b,#111827)",
        niebla: "linear-gradient(135deg,#cbd5e1,#94a3b8,#64748b)"
    };

    const clave = Object.keys(fondos).find(k => desc.includes(k));
    document.body.style.background = clave
        ? fondos[clave]
        : "linear-gradient(135deg,#38bdf8,#0ea5e9,#0369a1)";
}

/* ============================================================
   MANIQUÍ
   ============================================================ */

function setManiquiImg(id, src) {
    const el = document.getElementById(id);
    if (!el) return;

    if (src) {
        el.src = src;
        el.classList.add("visible");
    } else {
        el.removeAttribute("src");
        el.classList.remove("visible");
    }

    actualizarMensajeManiqui();
}

function actualizarMensajeManiqui() {
    const mensaje = document.getElementById("maniquiEmpty");
    if (!mensaje) return;

    const tienePrendas = ["manualJacket", "manualTop", "manualDress", "manualBottom", "manualShoes"]
        .some(id => document.getElementById(id)?.classList.contains("visible"));

    mensaje.style.display = tienePrendas ? "none" : "block";
}

function clearManiqui() {
    setManiquiImg("manualJacket", null);
    setManiquiImg("manualTop", null);
    setManiquiImg("manualDress", null);
    setManiquiImg("manualBottom", null);
    setManiquiImg("manualShoes", null);
}

/* ============================================================
   ARMARIO
   ============================================================ */

function addClothing() {
    const fileInput = document.getElementById("upload");
    const file = fileInput.files[0];
    const category = document.getElementById("category").value;

    if (!file) {
        alert("Seleccioná una imagen primero");
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Solo se aceptan archivos de imagen");
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const imgData = e.target.result;
        saveClothing(category, imgData);
        createClothingItem(category, imgData);
        fileInput.value = "";
        refrescarOutfitsSiHayClima();
    };

    reader.onerror = function () {
        alert("Error al leer el archivo");
    };

    reader.readAsDataURL(file);
}

function saveClothing(category, img) {
    const clothes = JSON.parse(localStorage.getItem(category)) || [];
    clothes.push(img);
    localStorage.setItem(category, JSON.stringify(clothes));
}

function saveCloset() {
    if (currentUser !== "Invitado") return;

    const continuar = confirm("Debés iniciar sesión para guardar armarios.\n\n¿Ir al login?");
    if (!continuar) return;

    document.getElementById("app").classList.add("hidden");
    document.getElementById("auth-screen").classList.remove("hidden");
    showLogin();
}

function clearCloset() {
    if (!confirm("¿Vaciar todo el armario?")) return;

    CATEGORIAS.forEach(category => {
        localStorage.removeItem(category);
        const grid = document.getElementById(category);
        if (grid) grid.innerHTML = "";
    });

    if (currentUser) {
        localStorage.removeItem("closet_" + currentUser);
    }

    clearManiqui();

    for (let i = 1; i <= 3; i++) {
        const outfit = document.getElementById("outfit" + i);
        if (outfit) outfit.innerHTML = "";
    }

    document.getElementById("recommendation").innerText = "Armario vacío.";
    ultimoClima = null;

    alert("Armario vaciado correctamente");
}

function deleteClothing(category, imgData) {
    let clothes = JSON.parse(localStorage.getItem(category)) || [];
    clothes = clothes.filter(i => i !== imgData);
    localStorage.setItem(category, JSON.stringify(clothes));
    refrescarOutfitsSiHayClima();
}

function refrescarOutfitsSiHayClima() {
    if (!ultimoClima) return;
    generateOutfits(ultimoClima.temp, ultimoClima.humidity, ultimoClima.wind, ultimoClima.sensacion);
}

function useOnManiqui(category, imgData) {
    if (category === "remeras") {
        setManiquiImg("manualTop", imgData);
        setManiquiImg("manualDress", null);
    }

    if (category === "camperas-livianas" || category === "camperas-abrigo") {
        setManiquiImg("manualJacket", imgData);
        setManiquiImg("manualDress", null);
    }

    if (category === "pantalones" || category === "bermudas" || category === "polleras") {
        setManiquiImg("manualBottom", imgData);
        setManiquiImg("manualDress", null);
    }

    if (category === "vestidos") {
        setManiquiImg("manualDress", imgData);
        setManiquiImg("manualTop", null);
        setManiquiImg("manualJacket", null);
        setManiquiImg("manualBottom", null);
    }

    if (category === "calzado") {
        setManiquiImg("manualShoes", imgData);
    }
}

function createClothingItem(category, imgData) {
    const box = document.createElement("div");
    box.classList.add("prenda-box");

    const img = document.createElement("img");
    img.src = imgData;
    img.alt = category;
    img.draggable = true;

    img.addEventListener("dragstart", function (e) {
        box.classList.add("dragging");
        e.dataTransfer.setData("text/plain", JSON.stringify({ img: imgData, source: category }));
    });

    img.addEventListener("dragend", function () {
        box.classList.remove("dragging");
    });

    const del = document.createElement("button");
    del.innerText = "✖";
    del.classList.add("delete-btn");
    del.title = "Eliminar prenda";
    del.onclick = () => {
        if (confirm("¿Eliminar esta prenda?")) {
            box.remove();
            deleteClothing(category, imgData);
        }
    };

    const use = document.createElement("button");
    use.innerText = "Usar";
    use.classList.add("use-btn");
    use.title = "Poner en el maniquí";
    use.onclick = () => useOnManiqui(category, imgData);

    box.appendChild(img);
    box.appendChild(del);
    box.appendChild(use);

    document.getElementById(category).appendChild(box);
}

function loadCloset() {
    CATEGORIAS.forEach(category => {
        const grid = document.getElementById(category);
        if (!grid) return;

        grid.innerHTML = "";
        const clothes = JSON.parse(localStorage.getItem(category)) || [];
        clothes.forEach(img => createClothingItem(category, img));
    });
}

/* ---------- Selección de archivo / vista previa ---------- */

document.getElementById("upload").addEventListener("change", function () {
    const texto = document.getElementById("fileName");
    const previewBox = document.getElementById("uploadPreviewBox");
    const preview = document.getElementById("uploadPreview");

    if (!this.files.length) {
        texto.textContent = "Ningún archivo seleccionado";
        previewBox.classList.add("hidden");
        selectedImgData = null;
        return;
    }

    const file = this.files[0];

    if (!file.type.startsWith("image/")) {
        alert("Solo se aceptan archivos de imagen");
        this.value = "";
        texto.textContent = "Ningún archivo seleccionado";
        previewBox.classList.add("hidden");
        selectedImgData = null;
        return;
    }

    texto.textContent = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        selectedImgData = e.target.result;
        preview.src = selectedImgData;
        previewBox.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
});

// Arrastrar la vista previa hacia una categoría
document.getElementById("uploadPreview").addEventListener("dragstart", function (e) {
    if (!selectedImgData) return;
    e.dataTransfer.setData("text/plain", JSON.stringify({ img: selectedImgData }));
});

/* ---------- Drag & drop al armario ---------- */

function setupClosetDragDrop() {
    CATEGORIAS.forEach(category => {
        const grid = document.getElementById(category);
        if (!grid) return;

        grid.addEventListener("dragover", function (e) {
            e.preventDefault();
            grid.classList.add("drag-over");
        });

        grid.addEventListener("dragleave", function () {
            grid.classList.remove("drag-over");
        });

        grid.addEventListener("drop", function (e) {
            e.preventDefault();
            grid.classList.remove("drag-over");

            const raw = e.dataTransfer.getData("text/plain");
            if (!raw) return;

            let data;
            try {
                data = JSON.parse(raw);
            } catch (err) {
                return;
            }

            if (!data.img) return;

            // Si la prenda ya estaba en otra categoría, se mueve
            if (data.source) {
                if (data.source === category) return;
                deleteClothing(data.source, data.img);
            }

            saveClothing(category, data.img);
            createClothingItem(category, data.img);

            // Si venía del selector de archivo, limpiar la vista previa
            if (!data.source) {
                selectedImgData = null;
                document.getElementById("uploadPreviewBox").classList.add("hidden");
                document.getElementById("upload").value = "";
                document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
            }

            refrescarOutfitsSiHayClima();
        });
    });
}

setupClosetDragDrop();

/* ============================================================
   GENERADOR DE OUTFITS
   ============================================================ */

function generateOutfits(temp, humidity, wind, sensacion) {
    const remeras = JSON.parse(localStorage.getItem("remeras")) || [];
    const camperasAbrigo = JSON.parse(localStorage.getItem("camperas-abrigo")) || [];
    const camperasLivianas = JSON.parse(localStorage.getItem("camperas-livianas")) || [];
    const pantalones = JSON.parse(localStorage.getItem("pantalones")) || [];
    const bermudas = JSON.parse(localStorage.getItem("bermudas")) || [];
    const vestidos = JSON.parse(localStorage.getItem("vestidos")) || [];
    const polleras = JSON.parse(localStorage.getItem("polleras")) || [];
    const calzado = JSON.parse(localStorage.getItem("calzado")) || [];

    let tops = [...remeras];
    let bottoms = [];
    let camperas = [];
    let camperaObligatoria = false;

    /* ---------- Lógica climática ---------- */

    if (sensacion <= 5) {
        // Frío intenso: camperas de abrigo obligatorias + pantalones largos únicamente
        camperas = [...camperasAbrigo];
        camperaObligatoria = true;
        bottoms = [...pantalones];

    } else if (sensacion <= 14) {
        // Frío moderado: camperas de abrigo + livianas, sin bermudas
        camperas = [...camperasAbrigo, ...camperasLivianas];
        camperaObligatoria = true;
        bottoms = [...pantalones, ...polleras];

    } else if (sensacion <= 22) {
        // Templado: camperas livianas opcionales, sin bermudas
        camperas = [...camperasLivianas];
        bottoms = [...pantalones, ...polleras];

    } else if (sensacion <= 27) {
        // Calor moderado: remeras + polleras/pantalones/bermudas
        bottoms = [...polleras, ...bermudas, ...pantalones];

    } else {
        // Calor intenso: remeras + bermudas y polleras prioritarias
        bottoms = [...bermudas, ...polleras];
    }

    // Viento fuerte (> 25 km/h): sumar camperas livianas si no están ya
    if (wind > 25 && sensacion > 14) {
        camperasLivianas.forEach(c => { if (!camperas.includes(c)) camperas.push(c); });
    }

    // Viento muy fuerte (> 40 km/h): forzar camperas de abrigo incluso con calor moderado
    if (wind > 40) {
        camperaObligatoria = true;
        camperasAbrigo.forEach(c => { if (!camperas.includes(c)) camperas.push(c); });
    }

    // Humedad alta (> 75%): quitar camperas de abrigo si hace calor (> 18°C)
    if (humidity > 75 && sensacion > 18) {
        camperas = camperas.filter(item => !camperasAbrigo.includes(item));
    }

    // Vestidos: solo con calor moderado o intenso
    const usarVestidos = sensacion >= 22;

    const hayCamperaDisponible = camperas.length > 0;

    let jacketPool;
    if (camperaObligatoria) {
        jacketPool = hayCamperaDisponible ? camperas : [null];
    } else {
        jacketPool = hayCamperaDisponible ? [...camperas, null] : [null];
    }

    const shoesPool = calzado.length > 0 ? calzado : [null];

    let combinaciones = [];

    // Outfits normales (top + campera + bottom [+ calzado])
    tops.forEach(top => {
        bottoms.forEach(bottom => {
            jacketPool.forEach(jacket => {
                shoesPool.forEach(shoe => {
                    combinaciones.push({ type: "normal", top, jacket, bottom, shoe });
                });
            });
        });
    });

    // Outfits con vestido [+ calzado]
    if (usarVestidos) {
        vestidos.forEach(dress => {
            shoesPool.forEach(shoe => {
                combinaciones.push({ type: "dress", dress, shoe });
            });
        });
    }

    /* ---------- Recomendación de texto ---------- */

    let recomendacion;

    if (sensacion <= 5) {
        recomendacion = "Frío intenso. Se recomiendan camperas de abrigo y pantalones largos.";
    } else if (sensacion <= 14) {
        recomendacion = "Hace frío. Llevá campera y pantalón largo.";
    } else if (sensacion <= 22) {
        recomendacion = "Clima templado. Una campera liviana puede ser útil.";
    } else if (sensacion <= 27) {
        recomendacion = "Calor moderado. Prendas frescas recomendadas.";
    } else {
        recomendacion = "Calor intenso. Bermudas y ropa bien liviana.";
    }

    if (wind > 40) recomendacion += " Viento muy fuerte — llevá abrigo aunque haga calor.";
    else if (wind > 25) recomendacion += " Hay bastante viento.";

    if (humidity > 75) recomendacion += " Humedad alta.";

    if (camperaObligatoria && !hayCamperaDisponible) {
        recomendacion += " No tenés ninguna campera cargada en tu armario — sumá una para abrigarte mejor.";
    }

    document.getElementById("recommendation").innerText = recomendacion;

    /* ---------- Panel "Campera Recomendada" ---------- */

    const jacketText = document.getElementById("jacketRecommendationText");
    const jacketBox = document.getElementById("jacketOptions");

    if (jacketText && jacketBox) {
        jacketBox.innerHTML = "";

        if (!camperaObligatoria && camperas.length === 0) {
            jacketText.innerText = "No hace falta campera con este clima.";
        } else if (!hayCamperaDisponible) {
            jacketText.innerText = camperaObligatoria
                ? "Este clima pide campera, pero no tenés ninguna cargada en tu armario."
                : "Podrías sumar una campera liviana, pero no tenés ninguna cargada.";
        } else {
            jacketText.innerText = camperaObligatoria
                ? "Elegí una campera para tu look de hoy:"
                : "Campera opcional para hoy:";

            camperas.forEach(jacketImg => {
                const img = document.createElement("img");
                img.src = jacketImg;
                img.alt = "Campera";
                img.onclick = () => setManiquiImg("manualJacket", jacketImg);
                jacketBox.appendChild(img);
            });
        }
    }

    /* ---------- Validar combinaciones ---------- */

    if (combinaciones.length === 0) {
        document.getElementById("recommendation").innerText = "No hay prendas suficientes para este clima.";

        for (let i = 1; i <= 3; i++) {
            const box = document.getElementById("outfit" + i);
            if (box) {
                box.innerHTML = `
                    <p style="color:#8fd3ff;text-align:center;padding:20px;font-size:13px;">
                        Sin outfit disponible
                    </p>
                `;
            }
        }
        return;
    }

    /* ---------- Mezclar y mostrar outfits ---------- */

    combinaciones = combinaciones.sort(() => Math.random() - 0.5);

    for (let i = 1; i <= 3; i++) {
        const box = document.getElementById("outfit" + i);
        if (!box) continue;
        box.innerHTML = "";

        const combo = combinaciones[i - 1];
        if (!combo) continue;

        if (combo.type === "dress") {
            const dress = document.createElement("img");
            dress.src = combo.dress;
            dress.alt = "Vestido";
            dress.onclick = () => {
                setManiquiImg("manualDress", combo.dress);
                setManiquiImg("manualTop", null);
                setManiquiImg("manualBottom", null);
            };
            box.appendChild(dress);

        } else {
            if (combo.jacket) {
                const jacket = document.createElement("img");
                jacket.src = combo.jacket;
                jacket.alt = "Campera";
                jacket.onclick = () => {
                    setManiquiImg("manualJacket", combo.jacket);
                    setManiquiImg("manualDress", null);
                };
                box.appendChild(jacket);
            }

            if (combo.top) {
                const top = document.createElement("img");
                top.src = combo.top;
                top.alt = "Parte superior";
                top.onclick = () => {
                    setManiquiImg("manualTop", combo.top);
                    setManiquiImg("manualDress", null);
                };
                box.appendChild(top);
            }

            if (combo.bottom) {
                const bottom = document.createElement("img");
                bottom.src = combo.bottom;
                bottom.alt = "Parte inferior";
                bottom.onclick = () => {
                    setManiquiImg("manualBottom", combo.bottom);
                    setManiquiImg("manualDress", null);
                };
                box.appendChild(bottom);
            }
        }

        if (combo.shoe) {
            const shoe = document.createElement("img");
            shoe.src = combo.shoe;
            shoe.alt = "Calzado";
            shoe.onclick = () => setManiquiImg("manualShoes", combo.shoe);
            box.appendChild(shoe);
        }
    }
}
