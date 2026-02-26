<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Panel Central Multisede - Institucional</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #eef2f3; color: #333; }
        .panel { background: white; padding: 30px; border-radius: 15px; max-width: 700px; margin: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        h2 { color: #2e314f; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
        
        label { font-weight: bold; display: block; margin-top: 15px; margin-bottom: 5px; }
        input, select, button, textarea { width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 8px; box-sizing: border-box; font-size: 1rem; }
        
        /* Estilo para los Checkboxes de Sedes */
        .sedes-container { background: #fdf2d5; border: 2px solid #d4af37; padding: 15px; border-radius: 10px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .sede-option { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }
        .sede-option input { width: auto; margin: 0; }

        button { background: #2e314f; color: white; border: none; cursor: pointer; font-weight: bold; transition: 0.3s; margin-top: 10px; }
        button:hover { background: #d4af37; color: #2e314f; }
        
        .historial-box { margin-top: 30px; border-top: 2px solid #eee; padding-top: 20px; }
        .historial-item { background: #f9f9f9; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; border-radius: 6px; border-left: 4px solid #2e314f; font-size: 0.85rem; }
        .btn-borrar { width: auto; background: #e74c3c; padding: 5px 12px; margin: 0; font-size: 0.75rem; }

        .dias-selector { display: flex; justify-content: space-between; background: #f0f0f0; padding: 10px; border-radius: 8px; }
        .dias-selector label { font-size: 0.7rem; text-align: center; margin: 0; }
        .dias-selector input { width: auto; display: block; margin: 5px auto; }
    </style>
</head>
<body>

<div class="panel">
    <h2>🚀 Panel de Control Central</h2>
    
    <label>🏢 DESTINOS (Elegí dónde se verá):</label>
    <div class="sedes-container">
        <label class="sede-option"><input type="checkbox" class="sede-check" value="primaria"> Primaria</label>
        <label class="sede-option"><input type="checkbox" class="sede-check" value="kheila-gan"> Kheila/Gan</label>
        <label class="sede-option"><input type="checkbox" class="sede-check" value="secundaria"> Secundaria</label>
    </div>

    <label>¿Qué vas a subir?</label>
    <select id="tipo">
        <option value="texto">Mensaje Central (Texto)</option>
        <option value="foto">Foto (URL - Lateral)</option>
        <option value="foto-completa">Foto (URL - Pantalla Completa)</option>
        <option value="zocalo">Zócalo (Texto corrido abajo)</option>
        <option value="evento">Mensaje Programado (Bloqueo Horario)</option>
    </select>

    <textarea id="contenido" placeholder="Escribí el texto o pegá el link de la imagen..." rows="3"></textarea>

    <div id="horarios" style="display:none; background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 10px;">
        <label>📅 Rango de Fechas (Vigencia):</label>
        <div style="display: flex; gap: 10px;">
            <input type="date" id="fecha-inicio">
            <input type="date" id="fecha-fin">
        </div>
        
        <label>🕒 Rango Horario y Días:</label>
        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <input type="time" id="inicio"> 
            <input type="time" id="fin">
        </div>
        <div class="dias-selector">
            <label><input type="checkbox" class="dia-check" value="1" checked> Lun</label>
            <label><input type="checkbox" class="dia-check" value="2" checked> Mar</label>
            <label><input type="checkbox" class="dia-check" value="3" checked> Mié</label>
            <label><input type="checkbox" class="dia-check" value="4" checked> Jue</label>
            <label><input type="checkbox" class="dia-check" value="5" checked> Vie</label>
            <label><input type="checkbox" class="dia-check" value="6"> Sáb</label>
            <label><input type="checkbox" class="dia-check" value="0"> Dom</label>
        </div>
    </div>

    <button id="btnSubir">🚀 PUBLICAR AHORA</button>

    <div class="historial-box">
        <label>🔍 VER/BORRAR CONTENIDO DE:</label>
        <select id="ver-historial-sede" onchange="cargarHistorial()">
            <option value="primaria">Primaria</option>
            <option value="kheila-gan">Kheila/Gan</option>
            <option value="secundaria">Secundaria</option>
        </select>
        <div id="historial">Cargando lista...</div>
    </div>
</div>

<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>

<script>
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

    // Mostrar/Ocultar campos de horario
    document.getElementById('tipo').addEventListener('change', function() {
        document.getElementById('horarios').style.display = this.value === 'evento' ? 'block' : 'none';
    });

    // BOTÓN SUBIR (Lógica multisede)
    document.getElementById('btnSubir').onclick = function() {
        const sedes = Array.from(document.querySelectorAll('.sede-check:checked')).map(cb => cb.value);
        if (sedes.length === 0) return alert("❌ Seleccioná al menos un edificio.");

        const tipo = document.getElementById('tipo').value;
        const cont = document.getElementById('contenido').value;

        if (!cont && tipo !== 'zocalo') return alert("❌ Escribí algo para publicar.");

        sedes.forEach(sede => {
            const refSede = db.ref('cartelera/' + sede);
            refSede.once('value').then(snap => {
                let data = snap.val() || { texto: [], fotos: [], zocalo: "", eventos: [] };
                if(!data.texto) data.texto = [];
                if(!data.fotos) data.fotos = [];
                if(!data.eventos) data.eventos = [];

                if (tipo === 'texto') data.texto.push(cont);
                else if (tipo === 'foto') data.fotos.push({url: cont, formato: 'normal'});
                else if (tipo === 'foto-completa') data.fotos.push({url: cont, formato: 'completa'});
                else if (tipo === 'zocalo') data.zocalo = cont;
                else if (tipo === 'evento') {
                    const dias = Array.from(document.querySelectorAll('.dia-check:checked')).map(cb => parseInt(cb.value));
                    data.eventos.push({
                        msg: cont, 
                        inicio: document.getElementById('inicio').value, 
                        fin: document.getElementById('fin').value, 
                        dias: dias,
                        fechaInicio: document.getElementById('fecha-inicio').value || null,
                        fechaFin: document.getElementById('fecha-fin').value || null
                    });
                }
                return refSede.set(data);
            });
        });

        alert("✅ Publicado con éxito.");
        document.getElementById('contenido').value = "";
    };

    // HISTORIAL
    function cargarHistorial() {
        const sede = document.getElementById('ver-historial-sede').value;
        db.ref('cartelera/' + sede).on('value', snap => {
            const h = document.getElementById('historial');
            const data = snap.val();
            if(!data) { h.innerHTML = "Vacío."; return; }
            h.innerHTML = "";
            if(data.texto) data.texto.forEach((t, i) => h.innerHTML += `<div class="historial-item">📝 ${t.substring(0,20)}... <button class="btn-borrar" onclick="borrar('texto', ${i})">Eliminar</button></div>`);
            if(data.fotos) data.fotos.forEach((f, i) => h.innerHTML += `<div class="historial-item">🖼️ Foto ${i+1} <button class="btn-borrar" onclick="borrar('fotos', ${i})">Eliminar</button></div>`);
            if(data.eventos) data.eventos.forEach((e, i) => h.innerHTML += `<div class="historial-item">⏰ Evento ${e.inicio} <button class="btn-borrar" onclick="borrar('eventos', ${i})">Eliminar</button></div>`);
            if(data.zocalo) h.innerHTML += `<div class="historial-item">🎞️ Zócalo: ${data.zocalo.substring(0,20)}... <button class="btn-borrar" onclick="borrar('zocalo')">Eliminar</button></div>`;
        });
    }

    window.borrar = function(cat, i) {
        const sede = document.getElementById('ver-historial-sede').value;
        const ref = db.ref('cartelera/' + sede);
        ref.once('value').then(snap => {
            let data = snap.val();
            if(cat === 'zocalo') data.zocalo = "";
            else data[cat].splice(i, 1);
            ref.set(data);
        });
    };

    cargarHistorial();
</script>

</body>
</html>



