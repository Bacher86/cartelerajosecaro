const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};

// 1. INICIALIZAR FIREBASE
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const db = firebase.database();

// 2. DETECTAR SEDE DESDE LA URL (MAGIA PARA MULTI-EDIFICIO)
// Si la URL es: index.html?sede=secundaria -> sedeActual será 'secundaria'
// Si no hay nada en la URL, por defecto cargará 'primaria'
const urlParams = new URLSearchParams(window.location.search);
const sedeActual = urlParams.get('sede') || 'primaria';

// Referencia a la rama específica del edificio en Firebase
const dbRemota = db.ref('cartelera/' + sedeActual);

let dataActual = { texto: [], fotos: [], zocalo: "", eventos: [] };
let idxFoto = 0;
let idxMensaje = 0;

// --- FUNCIÓN RELOJ Y FECHAS ---
function actualizarReloj() {
    const ahora = new Date();
    
    // Reloj HH:MM
    const r = document.getElementById('reloj');
    if (r) r.innerText = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    // Fecha Gregoriana
    const f = document.getElementById('fecha-greg');
    if (f) f.innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    // Fecha Hebrea
    const fh = document.getElementById('fecha-heb');
    if (fh) {
        const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(ahora);
        fh.innerText = heb;
    }
    
    verificarEventos();
}

// --- ESCUCHAR CAMBIOS EN FIREBASE (SOLO DE MI SEDE) ---
dbRemota.on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
        dataActual = val;
        
        // Zócalo
        const z = document.getElementById('texto-zocalo');
        if (z) z.innerText = (dataActual.zocalo || "");
        
        // Mensajes Centrales
        const c = document.getElementById('escalera-mensajes');
        if (c) {
            c.innerHTML = '';
            idxMensaje = 0;
            (dataActual.texto || []).forEach((t, i) => {
                const div = document.createElement('div');
                div.className = 'mensaje-item' + (i === 0 ? ' enfocado' : '');
                div.innerText = t;
                c.appendChild(div);
            });
        }
    }
});

// --- ROTACIÓN DE MENSAJES ---
function rotarMensajes() {
    const mensajes = document.querySelectorAll('.mensaje-item');
    if (mensajes.length <= 1) return;

    mensajes.forEach(m => m.classList.remove('enfocado'));
    idxMensaje = (idxMensaje + 1) % mensajes.length;
    mensajes[idxMensaje].classList.add('enfocado');
}

// --- ROTACIÓN DE FOTOS ---
function rotarFoto() {
    if (!dataActual.fotos || dataActual.fotos.length === 0) return;
    
    idxFoto = (idxFoto + 1) % dataActual.fotos.length;
    const foto = dataActual.fotos[idxFoto];
    const img = document.getElementById('foto-principal');
    const colT = document.querySelector('.col-texto');
    const colF = document.querySelector('.col-fotos');

    if (img) {
        img.src = foto.url;
        img.style.display = 'block';
    }
    
    if (foto.formato === 'completa') {
        if (colT) colT.style.display = 'none';
        if (colF) colF.style.width = '100%';
    } else {
        if (colT) colT.style.display = 'flex';
        if (colF) colF.style.width = '55%';
    }
}

// --- VALIDACIÓN DE EVENTOS (BLOQUEO) ---
function verificarEventos() {
    const ahora = new Date();
    const hActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    const diaHoy = ahora.getDay();
    const offset = ahora.getTimezoneOffset() * 60000;
    const fechaHoy = (new Date(ahora - offset)).toISOString().split('T')[0];

    const eventoActivo = (dataActual.eventos || []).find(e => {
        const cumpleFechaInicio = !e.fechaInicio || fechaHoy >= e.fechaInicio;
        const cumpleFechaFin = !e.fechaFin || fechaHoy <= e.fechaFin;
        const coincideDia = e.dias ? e.dias.includes(diaHoy) : true;
        const coincideHora = (hActual >= e.inicio && hActual <= e.fin);
        return cumpleFechaInicio && cumpleFechaFin && coincideDia && coincideHora;
    });

    const overlay = document.getElementById('overlay-evento');
    if (overlay) {
        if (eventoActivo) {
            overlay.innerText = eventoActivo.msg;
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }
}

// --- INTERVALOS ---
setInterval(actualizarReloj, 1000); 
setInterval(rotarFoto, 8000);       
setInterval(rotarMensajes, 6000); 

actualizarReloj();

// Carga inicial
actualizarReloj();


