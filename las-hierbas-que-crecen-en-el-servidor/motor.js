/* =====================================================================
   LAS HIERBAS QUE CRECEN EN EL SERVIDOR — motor.js

   motor de lectura. sin navegacion guiada. sin tutorial.
   el lector abre archivos. el motor recuerda.

   memoria (localStorage): hierbas.lectura = { abiertos, margenes, orden }
   ===================================================================== */
(function () {
  "use strict";

  var corpus = window.HIERBAS;
  if (!corpus) { console.warn("hierbas: corpus.js no encontrado"); return; }

  var archivos = corpus.archivos;
  var escritorio = document.getElementById("escritorio");
  var lector = document.getElementById("lector");
  var cuerpo = lector.querySelector(".cuerpo");
  var btnMargenes = document.getElementById("btn-margenes");
  var btnCerrar = document.getElementById("btn-cerrar");
  var nombreDoc = document.getElementById("nombre-doc");
  var contador = document.getElementById("contador");
  var pieLeidos = document.getElementById("leidos");

  var mem = cargarMemoria();
  var archivoActual = null;
  var mostrandoMargenes = false;

  function cargarMemoria() {
    try { var r = localStorage.getItem("hierbas.lectura"); if (r) return JSON.parse(r); } catch (e) {}
    return { abiertos: [], margenes: [], orden: [] };
  }
  function guardarMemoria() {
    try { localStorage.setItem("hierbas.lectura", JSON.stringify(mem)); } catch (e) {}
  }
  function fueAbierto(id) { return mem.abiertos.indexOf(id) >= 0; }
  function fueMargenes(id) { return mem.margenes.indexOf(id) >= 0; }
  function marcarAbierto(id) { if (!fueAbierto(id)) { mem.abiertos.push(id); guardarMemoria(); } }
  function marcarMargenes(id) { if (!fueMargenes(id)) { mem.margenes.push(id); guardarMemoria(); } }

  function buscarArchivo(id) {
    for (var i = 0; i < archivos.length; i++) if (archivos[i].id === id) return archivos[i];
    return null;
  }

  function actualizarEscritorio() {
    var icons = escritorio.querySelectorAll(".archivo");
    for (var i = 0; i < icons.length; i++) {
      var el = icons[i], id = el.dataset.id, arch = buscarArchivo(id);
      if (!arch) continue;
      var bloq = arch.bloqueado && arch.bloqueadoPor && !fueAbierto(arch.bloqueadoPor);
      el.classList.toggle("bloqueado", bloq);
      el.classList.toggle("leido", fueAbierto(id));
    }
    actualizarPie();
  }

  function actualizarPie() {
    var d = 0;
    for (var i = 0; i < archivos.length; i++) {
      var a = archivos[i];
      if (!a.bloqueado || !a.bloqueadoPor || fueAbierto(a.bloqueadoPor)) d++;
    }
    contador.textContent = mem.abiertos.length;
    pieLeidos.textContent = d;
  }

  function escapar(t) {
    return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function renderizarArchivo(arch, conMargenes) {
    var h = "", ls = arch.cuerpo || [];
    for (var i = 0; i < ls.length; i++) h += escapar(ls[i]) + "\n";
    if (conMargenes && arch.margenes && arch.margenes.length) {
      h += "\n";
      for (var j = 0; j < arch.margenes.length; j++) {
        var m = arch.margenes[j], c = m.autor === "ruben" ? "margen ruben" : "margen";
        h += "<div class=\"" + c + "\">" + escapar(m.texto) + "</div>\n";
      }
    }
    cuerpo.innerHTML = h;
  }

  function abrirArchivo(id) {
    var arch = buscarArchivo(id);
    if (!arch) return;
    if (arch.bloqueado && arch.bloqueadoPor && !fueAbierto(arch.bloqueadoPor)) return;
    archivoActual = arch;
    mostrandoMargenes = fueMargenes(id);
    marcarAbierto(id);
    mem.orden.push(id); guardarMemoria();
    renderizarArchivo(arch, mostrandoMargenes);
    lector.classList.add("abierto");
    nombreDoc.textContent = arch.nombre;
    btnMargenes.classList.toggle("activo", mostrandoMargenes);
    btnMargenes.style.display = (arch.margenes && arch.margenes.length) ? "" : "none";
    actualizarEscritorio();
    cuerpo.scrollTop = 0;
  }

  function cerrarArchivo() { lector.classList.remove("abierto"); archivoActual = null; }

  function toggleMargenes() {
    if (!archivoActual) return;
    mostrandoMargenes = !mostrandoMargenes;
    if (mostrandoMargenes) marcarMargenes(archivoActual.id);
    btnMargenes.classList.toggle("activo", mostrandoMargenes);
    renderizarArchivo(archivoActual, mostrandoMargenes);
    cuerpo.scrollTop = 0;
    actualizarEscritorio();
  }

  function construirEscritorio() {
    escritorio.innerHTML = "";
    for (var i = 0; i < archivos.length; i++) {
      var arch = archivos[i];
      var el = document.createElement("div");
      el.className = "archivo"; el.tabIndex = 0;
      el.dataset.id = arch.id; el.dataset.tipo = arch.tipo;
      var bloq = arch.bloqueado && arch.bloqueadoPor && !fueAbierto(arch.bloqueadoPor);
      if (bloq) el.classList.add("bloqueado");
      if (fueAbierto(arch.id)) el.classList.add("leido");
      var ic = document.createElement("span"); ic.className = "icono"; ic.textContent = arch.icono || "\u25A1";
      var nm = document.createElement("span"); nm.className = "nombre"; nm.textContent = arch.nombre;
      var ps = document.createElement("span"); ps.className = "peso"; ps.textContent = arch.peso || "";
      el.appendChild(ic); el.appendChild(nm); el.appendChild(ps);
      el.addEventListener("click", function () { abrirArchivo(this.dataset.id); });
      el.addEventListener("keydown", function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); this.click(); } });
      escritorio.appendChild(el);
    }
    actualizarPie();
  }

  btnMargenes.addEventListener("click", toggleMargenes);
  btnCerrar.addEventListener("click", cerrarArchivo);
  lector.addEventListener("click", function (ev) { if (ev.target === lector) cerrarArchivo(); });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && lector.classList.contains("abierto")) { cerrarArchivo(); return; }
    if (ev.key === "m" && lector.classList.contains("abierto")) toggleMargenes();
  });

  construirEscritorio();
})();
