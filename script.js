const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};

// Inicializar Firebase si no está inicializado
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const dbRemota = firebase.database();

let dataActual = { texto: [], fotos: [], zocalo: "", eventos: [] };
let idxFoto = 0;

// --- FUNCIÓN RELOJ Y FECHAS ---
function actualizarReloj() {
    const ahora = new Date();
    
    // Reloj HH:MM
    const r = document.getElementById('reloj');
    if (r) r.innerText = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    // Fecha Gregoriana (Lunes 25 de Febrero...)
    const f = document.getElementById('fecha-greg');
    if (f) f.innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    // Fecha Hebrea automática
    const fh = document.getElementById('fecha-heb');
    if (fh) {
        const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(ahora);
        fh.innerText = heb;
    }
    
    // Ejecutar validación de mensajes programados
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
        
        // Actualizar Mensajes en Escalera
        const c = document.getElementById('escalera-mensajes');
        if (c) {
            c.innerHTML = '';
            (dataActual.texto || []).forEach((t, i) => {
                const div = document.createElement('div');
                div.className = 'mensaje-item' + (i === 0 ? ' enfocado' : '');
                div.innerText = t;
                c.appendChild(div);
            });
        }
    }
});

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
    
    // Manejo de pantalla completa
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
    
    // 1. Hora actual (HH:MM)
    const hActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    // 2. Día de la semana (0-6)
    const diaHoy = ahora.getDay();
    
    // 3. Fecha actual (YYYY-MM-DD) - Ajustada a zona horaria local
    const offset = ahora.getTimezoneOffset() * 60000;
    const fechaHoy = (new Date(ahora - offset)).toISOString().split('T')[0];

    const eventoActivo = (dataActual.eventos || []).find(e => {
        // Validación de Rango de FECHAS (Calendario)
        const cumpleFechaInicio = !e.fechaInicio || fechaHoy >= e.fechaInicio;
        const cumpleFechaFin = !e.fechaFin || fechaHoy <= e.fechaFin;
        
        // Validación de DÍA de la semana
        const coincideDia = e.dias ? e.dias.includes(diaHoy) : true;
        
        // Validación de HORA
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
setInterval(actualizarReloj, 1000); // Cada segundo para el reloj
setInterval(rotarFoto, 8000);       // Cada 8 segundos cambian las fotos

// Carga inicial
actualizarReloj();



