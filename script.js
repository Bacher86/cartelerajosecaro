// Configuración de Firebase obtenida de tu captura
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
firebase.initializeApp(firebaseConfig);
const dbRemota = firebase.database();

let listaFotos = [];
let idxFoto = 0;
let idxTexto = 0;
let listaTextos = [];

// ESCUCHAR CAMBIOS EN TIEMPO REAL
dbRemota.ref('carteleraData').on('value', (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    // 1. Zócalo
    if (data.zocalo) {
        document.getElementById('texto-zocalo').innerText = data.zocalo + " ——— ";
    }

    // 2. Fotos
    if (data.fotos && data.fotos.length > 0) {
        listaFotos = data.fotos;
        idxFoto = 0;
        document.getElementById('foto-principal').src = listaFotos[0];
        document.getElementById('foto-principal').style.display = 'block';
    }

    // 3. Textos (Escalera)
    listaTextos = data.texto ? data.texto.split('\n').filter(t => t.trim() !== "") : ["BIENVENIDOS"];
    const container = document.getElementById('escalera-mensajes');
    container.innerHTML = '';
    
    listaTextos.forEach((t) => {
        const div = document.createElement('div');
        div.className = 'mensaje-item';
        div.innerText = t;
        container.appendChild(div);
    });

    idxTexto = 0;
    actualizarPosiciones();
});

function actualizarPosiciones() {
    const items = document.querySelectorAll('.mensaje-item');
    if (items.length === 0) return;

    items.forEach((item, i) => {
        item.classList.remove('enfocado', 'anterior', 'proximo');
        
        const esEnfocado = i === idxTexto % items.length;
        const esAnterior = i === (idxTexto - 1 + items.length) % items.length;
        const esProximo = i === (idxTexto + 1) % items.length;

        if (esEnfocado) item.classList.add('enfocado');
        else if (esAnterior && items.length > 1) item.classList.add('anterior');
        else if (esProximo && items.length > 2) item.classList.add('proximo');
    });
}

function rotarTexto() {
    if (listaTextos.length > 1) {
        idxTexto = (idxTexto + 1) % listaTextos.length;
        actualizarPosiciones();
    }
}

function rotarFoto() {
    if (listaFotos.length > 1) {
        idxFoto = (idxFoto + 1) % listaFotos.length;
        const img = document.getElementById('foto-principal');
        img.style.opacity = 0;
        setTimeout(() => {
            img.src = listaFotos[idxFoto];
            img.style.opacity = 1;
        }, 500);
    }
}

function actualizarReloj() {
    const ahora = new Date();
    document.getElementById('reloj').innerText = ahora.getHours() + ":" + ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById('fecha-greg').innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    try {
        const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'}).format(ahora).replace(" AM", "");
        document.getElementById('fecha-heb').innerText = heb;
    } catch(e) {}
}

setInterval(actualizarReloj, 1000);
setInterval(rotarTexto, 6000);
setInterval(rotarFoto, 8000);
actualizarReloj();
setInterval(actualizarReloj, 1000);
setInterval(syncData, 3000);
setInterval(rotarTexto, 6000);

setInterval(rotarFoto, 8000);
