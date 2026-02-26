const firebaseConfig = {
    apiKey: "AIzaSyAzBO8TzuGeAV-_nsGDgIWckWhV_vkOhTY",
    authDomain: "cartelera-nube.firebaseapp.com",
    databaseURL: "https://cartelera-nube-default-rtdb.firebaseio.com",
    projectId: "cartelera-nube",
    storageBucket: "cartelera-nube.firebasestorage.app",
    messagingSenderId: "333887658907",
    appId: "1:333887658907:web:c9d3904ad02a8fd9fe1f3e"
};

if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// DETECTAR SEDE
const urlParams = new URLSearchParams(window.location.search);
const sedeActual = urlParams.get('sede') || 'primaria';
const dbRemota = db.ref('cartelera/' + sedeActual);

let dataActual = { texto: [], fotos: [], zocalo: "" };
let idxFoto = 0;
let idxMensaje = 0;

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
}

dbRemota.on('value', (snapshot) => {
    const val = snapshot.val();
    if (val) {
        dataActual = val;
        const z = document.getElementById('texto-zocalo');
        if (z) z.innerText = (dataActual.zocalo || "");
        
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

function rotarMensajes() {
    const mensajes = document.querySelectorAll('.mensaje-item');
    if (mensajes.length <= 1) return;
    mensajes.forEach(m => m.classList.remove('enfocado'));
    idxMensaje = (idxMensaje + 1) % mensajes.length;
    if(mensajes[idxMensaje]) mensajes[idxMensaje].classList.add('enfocado');
}

function rotarFoto() {
    if (!dataActual.fotos || dataActual.fotos.length === 0) return;
    idxFoto = (idxFoto + 1) % dataActual.fotos.length;
    const foto = dataActual.fotos[idxFoto];
    const img = document.getElementById('foto-principal');
    const colT = document.querySelector('.col-texto');
    const colF = document.querySelector('.col-fotos');

    if (img && foto) {
        img.src = foto.url;
        if (foto.formato === 'completa') {
            if (colT) colT.style.display = 'none';
            if (colF) colF.style.width = '100%';
        } else {
            if (colT) colT.style.display = 'flex';
            if (colF) colF.style.width = '55%';
        }
    }
}

setInterval(actualizarReloj, 1000); 
setInterval(rotarFoto, 8000);       
setInterval(rotarMensajes, 6000); 

actualizarReloj();
