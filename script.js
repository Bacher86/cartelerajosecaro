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

// Reloj (Esto DEBE funcionar primero)
function actualizarReloj() {
    const ahora = new Date();
    const r = document.getElementById('reloj');
    if (r) r.innerText = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    const f = document.getElementById('fecha-greg');
    if (f) f.innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    verificarEventos();
}

// Escuchar cambios
dbRemota.ref('carteleraData').on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
        dataActual = val;
        const z = document.getElementById('texto-zocalo');
        if (z) z.innerText = (dataActual.zocalo || "") + " ——— ";
        
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

function verificarEventos() {
    const ahora = new Date();
    const h = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    const evento = (dataActual.eventos || []).find(e => h >= e.inicio && h <= e.fin);
    const overlay = document.getElementById('overlay-evento');
    if (overlay) {
        if (evento) {
            overlay.innerText = evento.msg;
            overlay.style.display = 'flex';
        } else {
            overlay.style.display = 'none';
        }
    }
}

setInterval(actualizarReloj, 1000);
setInterval(rotarFoto, 8000);
actualizarReloj();

