let listaFotos = [];
let idxFoto = 0;
let idxTexto = 0;
let lastDataStr = "";
let listaTextos = [];

function actualizarReloj() {
    const ahora = new Date();
    document.getElementById('reloj').innerText = ahora.getHours() + ":" + ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById('fecha-greg').innerText = ahora.toLocaleDateString('es-AR', {weekday: 'long', day: 'numeric', month: 'long'});
    try {
        const heb = new Intl.DateTimeFormat('es-AR-u-ca-hebrew', {day: 'numeric', month: 'long', year: 'numeric'})
            .format(ahora)
            .replace(" AM", ""); // Esto borra el AM de la pantalla
        document.getElementById('fecha-heb').innerText = heb;
    } catch(e) {}
}

function syncData() {
    const raw = localStorage.getItem('carteleraData');
    if (!raw || raw === lastDataStr) return;
    lastDataStr = raw;
    const data = JSON.parse(raw);

    // Zócalo
    if (data.zocalo) document.getElementById('texto-zocalo').innerText = data.zocalo + " ——— ";

    // Procesar datos
    listaTextos = data.texto ? data.texto.split('\n').filter(t => t.trim() !== "") : [];
    listaFotos = data.fotos || [];

    const colTexto = document.querySelector('.col-texto');
    const colFotos = document.querySelector('.col-fotos');
    const container = document.getElementById('escalera-mensajes');

    // LÓGICA DE PANTALLA COMPLETA / EXPANSIÓN
    if (listaTextos.length > 0 && listaFotos.length > 0) {
        // AMBOS PRESENTES
        colTexto.classList.remove('hidden', 'full-width');
        colFotos.classList.remove('hidden', 'full-width');
    } 
    else if (listaTextos.length > 0 && listaFotos.length === 0) {
        // SOLO TEXTO
        colTexto.classList.add('full-width');
        colTexto.classList.remove('hidden');
        colFotos.classList.add('hidden');
    } 
    else if (listaTextos.length === 0 && listaFotos.length > 0) {
        // SOLO FOTOS
        colFotos.classList.add('full-width');
        colFotos.classList.remove('hidden');
        colTexto.classList.add('hidden');
    }

    // Dibujar mensajes
    container.innerHTML = '';
    listaTextos.forEach((t) => {
        const div = document.createElement('div');
        div.className = 'mensaje-item';
        div.innerText = t;
        container.appendChild(div);
    });

    idxTexto = 0;
    actualizarPosiciones();

    // Fotos
    if (listaFotos.length > 0) {
        document.getElementById('foto-principal').src = listaFotos[0];
        document.getElementById('foto-principal').style.display = 'block';
        idxFoto = 0;
    }
}

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
        document.getElementById('foto-principal').src = listaFotos[idxFoto];
    }
}

actualizarReloj();
syncData();
setInterval(actualizarReloj, 1000);
setInterval(syncData, 3000);
setInterval(rotarTexto, 6000);
setInterval(rotarFoto, 8000);