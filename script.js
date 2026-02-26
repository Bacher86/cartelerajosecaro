const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const urlParams = new URLSearchParams(window.location.search);
const sedeActual = urlParams.get('sede') || 'primaria';
const dbRemota = db.ref('cartelera/' + sedeActual);

let dataActual = { texto: [], fotos: [], zocalo: "", eventos: [] };
let idxFoto = 0;
let idxMensaje = 0;

function actualizarReloj() {
    const ahora = new Date();
    document.getElementById('reloj').innerText = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById('fecha-greg').innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    try {
        const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(ahora);
        document.getElementById('fecha-heb').innerText = heb;
    } catch(e){}
    
    verificarEventos();
}

dbRemota.on('value', snap => {
    const val = snap.val();
    if(val) {
        dataActual = val;
        document.getElementById('texto-zocalo').innerText = dataActual.zocalo || "";
        const c = document.getElementById('escalera-mensajes');
        c.innerHTML = '';
        (dataActual.texto || []).forEach((t, i) => {
            const div = document.createElement('div');
            div.className = 'mensaje-item' + (i === 0 ? ' enfocado' : '');
            div.innerText = t;
            c.appendChild(div);
        });
    }
});

function verificarEventos() {
    const overlay = document.getElementById('overlay-evento');
    if (!dataActual.eventos || dataActual.eventos.length === 0) {
        overlay.style.display = 'none';
        return;
    }

    const ahora = new Date();
    const hActual = ahora.getHours().toString().padStart(2, '0') + ":" + ahora.getMinutes().toString().padStart(2, '0');
    const diaHoy = ahora.getDay();
    const offset = ahora.getTimezoneOffset() * 60000;
    const fechaHoy = (new Date(ahora - offset)).toISOString().split('T')[0];

    const evento = dataActual.eventos.find(e => {
        const cumpleF = (!e.fechaInicio || fechaHoy >= e.fechaInicio) && (!e.fechaFin || fechaHoy <= e.fechaFin);
        const cumpleD = e.dias ? e.dias.includes(diaHoy) : true;
        const cumpleH = (hActual >= e.inicio && hActual <= e.fin);
        return cumpleF && cumpleD && cumpleH;
    });

    if (evento) {
        overlay.innerText = evento.msg;
        overlay.style.display = 'flex';
    } else {
        overlay.style.display = 'none';
    }
}

function rotarMensajes() {
    const mensajes = document.querySelectorAll('.mensaje-item');
    if (mensajes.length <= 1) return;
    mensajes.forEach(m => m.classList.remove('enfocado'));
    idxMensaje = (idxMensaje + 1) % mensajes.length;
    mensajes[idxMensaje].classList.add('enfocado');
}

function rotarFoto() {
    if (!dataActual.fotos || dataActual.fotos.length === 0) return;
    idxFoto = (idxFoto + 1) % dataActual.fotos.length;
    const foto = dataActual.fotos[idxFoto];
    const img = document.getElementById('foto-principal');
    const colT = document.querySelector('.col-texto');
    const colF = document.querySelector('.col-fotos');
    img.src = foto.url;
    img.style.display = 'block';
    if (foto.formato === 'completa') {
        colT.style.display = 'none';
        colF.style.width = '100%';
    } else {
        colT.style.display = 'flex';
        colF.style.width = '55%';
    }
}

setInterval(actualizarReloj, 1000);
setInterval(rotarFoto, 8000);
setInterval(rotarMensajes, 6000);
actualizarReloj();
