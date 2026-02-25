const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};
firebase.initializeApp(firebaseConfig);
const dbRemota = firebase.database();

let dataActual = { texto: [], fotos: [], zocalo: "", eventos: [] };
let idxFoto = 0;
let idxTexto = 0;

// Escuchar cambios de Firebase
dbRemota.ref('carteleraData').on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
        dataActual = val;
        renderTextosEstaticos();
    }
});

function renderTextosEstaticos() {
    // Actualiza el zócalo
    const zocaloElemento = document.getElementById('texto-zocalo');
    if (zocaloElemento) zocaloElemento.innerText = (dataActual.zocalo || "") + " ——— ";

    // Actualiza los mensajes centrales
    const container = document.getElementById('escalera-mensajes');
    if (container) {
        container.innerHTML = '';
        if (dataActual.texto) {
            dataActual.texto.forEach((t, index) => {
                const div = document.createElement('div');
                div.className = 'mensaje-item' + (index === 0 ? ' enfocado' : '');
                div.innerText = t;
                container.appendChild(div);
            });
        }
    }
}

function rotarFoto() {
    if (!dataActual.fotos || dataActual.fotos.length === 0) return;
    
    idxFoto = (idxFoto + 1) % dataActual.fotos.length;
    const foto = dataActual.fotos[idxFoto];
    const img = document.getElementById('foto-principal');
    const colTexto = document.querySelector('.col-texto');
    const colFotos = document.querySelector('.col-fotos');

    if (img) img.src = foto.url;
    
    if (foto.formato === 'completa') {
        if (colTexto) colTexto.style.display = 'none';
        if (colFotos) colFotos.style.width = '100%';
    } else {
        if (colTexto) colTexto.style.display = 'flex';
        if (colFotos) colFotos.style.width = '55%';
    }
}

function verificarEventos() {
    const ahora = new Date();
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    const eventoActivo = dataActual.eventos?.find(e => horaActual >= e.inicio && horaActual <= e.fin);
    
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

function actualizarReloj() {
    const ahora = new Date();
    const reloj = document.getElementById('reloj');
    if (reloj) reloj.innerText = ahora.getHours() + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    const fechaG = document.getElementById('fecha-greg');
    if (fechaG) fechaG.innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    verificarEventos();
}

// Iniciar bucles
setInterval(actualizarReloj, 1000);
setInterval(rotarFoto, 8000);
