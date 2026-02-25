const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};

// Inicializar Firebase
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const dbRemota = firebase.database();

let dataActual = { texto: [], fotos: [], zocalo: "", eventos: [] };
let idxFoto = 0;
let idxMensaje = 0; // Índice para la rotación de textos

// --- FUNCIÓN RELOJ Y FECHAS ---
function actualizarReloj() {
    const ahora = new Date();
    
    const r = document.getElementById('reloj');
    if (r) r.innerText = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    const f = document.getElementById('fecha-greg');
    if (f) f.innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    const fh = document.getElementById('fecha-heb');
    if (fh) {
        const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(ahora);
        fh.innerText = heb;
    }
    
    verificarEventos();
}

// --- ESCUCHAR CAMBIOS EN FIREBASE ---
dbRemota.ref('carteleraData').on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
        dataActual = val;
        
        // Actualizar Zócalo
        const z = document.getElementById('texto-zocalo');
        if (z) z.innerText = (dataActual.zocalo || "");
        
        // Actualizar Mensajes en Escalera (Reinicia la lista)
        const c = document.getElementById('escalera-mensajes');
        if (c) {
            c.innerHTML = '';
            idxMensaje = 0; // Reiniciamos el índice al recibir datos nuevos
            (dataActual.texto || []).forEach((t, i) => {
                const div = document.createElement('div');
                div.className = 'mensaje-item' + (i === 0 ? ' enfocado' : '');
                div.innerText = t;
                c.appendChild(div);
            });
        }
    }
});

// --- ROTACIÓN DE MENSAJES CENTRALES ---
function rotarMensajes() {
    const mensajes = document.querySelectorAll('.mensaje-item');
    if (mensajes.length <= 1) return; // No rotar si hay 0 o 1 mensaje

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

// --- VALIDACIÓN DE MENSAJES PROGRAMADOS (BLOQUEO) ---
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
setInterval(rotarMensajes, 6000); // Nueva rotación de mensajes cada 6 segundos

// Carga inicial
actualizarReloj();

