const firebaseConfig = { /* TUS CREDENCIALES */ };
firebase.initializeApp(firebaseConfig);
const dbRemota = firebase.database();

let dataActual = { texto: [], fotos: [], zocalo: "", eventos: [] };
let idxFoto = 0;
let idxTexto = 0;

// Escuchar cambios
dbRemota.ref('carteleraData').on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
        dataActual = val;
        renderTextosEstaticos();
    }
});

function renderTextosEstaticos() {
    document.getElementById('texto-zocalo').innerText = dataActual.zocalo + " ——— ";
    const container = document.getElementById('escalera-mensajes');
    container.innerHTML = '';
    dataActual.texto.forEach(t => {
        const div = document.createElement('div');
        div.className = 'mensaje-item';
        div.innerText = t;
        container.appendChild(div);
    });
    actualizarPosiciones();
}

function rotarFoto() {
    if (!dataActual.fotos || dataActual.fotos.length === 0) return;
    
    idxFoto = (idxFoto + 1) % dataActual.fotos.length;
    const foto = dataActual.fotos[idxFoto];
    const img = document.getElementById('foto-principal');
    const colTexto = document.querySelector('.col-texto');
    const colFotos = document.querySelector('.col-fotos');

    img.src = foto.url;
    
    // LOGICA PANTALLA COMPLETA
    if (foto.formato === 'completa') {
        colTexto.style.display = 'none';
        colFotos.style.width = '100%';
    } else {
        colTexto.style.display = 'flex';
        colFotos.style.width = '50%';
    }
}

function verificarEventos() {
    const ahora = new Date();
    const horaActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    
    const eventoActivo = dataActual.eventos?.find(e => horaActual >= e.inicio && horaActual <= e.fin);
    
    const overlay = document.getElementById('overlay-evento');
    if (eventoActivo) {
        overlay.innerText = eventoActivo.msg;
        overlay.style.display = 'flex'; // BLOQUEO TOTAL
    } else {
        overlay.style.display = 'none';
    }
}

// Reloj y bucles
setInterval(() => {
    const ahora = new Date();
    document.getElementById('reloj').innerText = ahora.getHours() + ":" + ahora.getMinutes().toString().padStart(2, '0');
    verificarEventos();
}, 1000);

setInterval(rotarFoto, 8000);
setInterval(() => {
    if (dataActual.texto.length > 1) {
        idxTexto = (idxTexto + 1) % dataActual.texto.length;
        actualizarPosiciones();
    }
}, 6000);