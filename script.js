// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};

// 1. INICIALIZACIÓN
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const db = firebase.database();

// 2. DETECTAR SEDE DESDE URL (?sede=primaria)
const urlParams = new URLSearchParams(window.location.search);
const sedeActual = urlParams.get('sede') || 'primaria';
const dbRemota = db.ref('cartelera/' + sedeActual);

let dataActual = { texto: [], fotos: [], zocalo: "" };
let idxFoto = 0;
let idxMensaje = 0;

// --- FUNCIÓN RELOJ Y FECHAS ---
function actualizarReloj() {
    const ahora = new Date();
    
    // Reloj
    const r = document.getElementById('reloj');
    if (r) r.innerText = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    // Fecha Gregoriana
    const f = document.getElementById('fecha-greg');
    if (f) f.innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    // Fecha Hebrea
    const fh = document.getElementById('fecha-heb');
    if (fh) {
        try {
            const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(ahora);
            fh.innerText = heb;
        } catch(e) { console.error("Error fecha heb", e); }
    }
}

// --- ESCUCHAR FIREBASE ---
dbRemota.on('value', (snapshot) => {
    const val = snapshot.val();
    console.log("Datos recibidos de " + sedeActual + ":", val); // Esto ayuda a ver si llegan datos

    if (val) {
        dataActual = val;
        
        // Actualizar Zócalo
        const z = document.getElementById('texto-zocalo');
        if (z) z.innerText = (dataActual.zocalo || "Sin noticias de momento.");
        
        // Actualizar Mensajes
        const c = document.getElementById('escalera-mensajes');
        if (c) {
            c.innerHTML = '';
            idxMensaje = 0;
            const mensajes = dataActual.texto || [];
            if (mensajes.length > 0) {
                mensajes.forEach((t, i) => {
                    const div = document.createElement('div');
                    div.className = 'mensaje-item' + (i === 0 ? ' enfocado' : '');
                    div.innerText = t;
                    c.appendChild(div);
                });
            } else {
                c.innerHTML = '<div class="mensaje-item enfocado">Bienvenidos</div>';
            }
        }
        
        // Mostrar primera foto inmediatamente si existe
        if (dataActual.fotos && dataActual.fotos.length > 0) {
            cambiarFoto(0);
        }
    }
});

// --- ROTACIÓN DE MENSAJES ---
function rotarMensajes() {
    const mensajes = document.querySelectorAll('.mensaje-item');
    if (mensajes.length <= 1) return;

    mensajes.forEach(m => m.classList.remove('enfocado'));
    idxMensaje = (idxMensaje + 1) % mensajes.length;
    if (mensajes[idxMensaje]) {
        mensajes[idxMensaje].classList.add('enfocado');
    }
}

// --- LÓGICA DE FOTOS ---
function cambiarFoto(indice) {
    if (!dataActual.fotos || !dataActual.fotos[indice]) return;
    
    const foto = dataActual.fotos[indice];
    const img = document.getElementById('foto-principal');
    const colT = document.querySelector('.col-texto');
    const colF = document.querySelector('.col-fotos');

    if (img) {
        img.src = foto.url;
        img.style.display = 'block';
        
        if (foto.formato === 'completa') {
            if (colT) colT.style.display = 'none';
            if (colF) colF.style.width = '100%';
        } else {
            if (colT) colT.style.display = 'flex';
            if (colF) colF.style.width = '55%';
        }
    }
}

function rotarFoto() {
    if (!dataActual.fotos || dataActual.fotos.length <= 1) return;
    idxFoto = (idxFoto + 1) % dataActual.fotos.length;
    cambiarFoto(idxFoto);
}

// --- INTERVALOS ---
setInterval(actualizarReloj, 1000); 
setInterval(rotarFoto, 8000);       
setInterval(rotarMensajes, 6000); 

// Carga Inicial
actualizarReloj();

