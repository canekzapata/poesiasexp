/* =====================================================================
   CAFÉ INTERNET, BERLÍN, 1997 — motor.js

   el motor no muestra el libro: lo abre.

   lo que hace, y por qué:
   · carga por franjas — una imagen de 61 KB tardaba once minutos.
     aquí tarda segundos y se puede interrumpir. la espera es material,
     no castigo.
   · enlaces con retórica — siete tipos, siete comportamientos. el
     visitado no vuelve a ser nuevo: guarda cuántas veces se cruzó.
   · nota 6 — la pieza 01 tiene una nota en blanco. se llena al abrir
     el atasco de las 21:17. es la única operación del libro que ocurre
     fuera del cuerpo de los dos poemas que la producen.
   · nota invasora — morgen/notas_del_autor_2001.txt crece con cada
     lectura hasta ocupar más que los poemas que comenta.
   · morgen/index.html — la etiqueta <li> quedó abierta en 1997. la
     página sigue esperando. no da error.
   · bitácora local — la ruta del lector se guarda en esta máquina y no
     se envía a ningún servidor. se puede borrar.
   ===================================================================== */

(function (global) {
  "use strict";

  var C = global.CAFE97;
  var A = C.archivos;
  var porRuta = {};
  A.forEach(function (a, i) { a.i = i; porRuta[a.ruta] = a; });

  var DIRS = [
    { d: "",            t: "/cafe_berlin_1997" },
    { d: "montage",     t: "montage/" },
    { d: "public_html", t: "public_html/" },
    { d: "spool",       t: "spool/" },
    { d: "nachtkopie",  t: "nachtkopie/" },
    { d: "morgen",      t: "morgen/" }
  ];

  var LLAVE = "cafe97:v1";
  var mem = leer();

  function leer() {
    var base = { visitas: {}, enlaces: {}, ruta: [], nota6: false, lecturasNota: 0 };
    try {
      var v = JSON.parse(localStorage.getItem(LLAVE) || "{}");
      for (var k in base) if (v[k] !== undefined) base[k] = v[k];
    } catch (e) { /* sin memoria: el libro se lee igual, sin acumulación */ }
    return base;
  }
  function guardar() {
    try { localStorage.setItem(LLAVE, JSON.stringify(mem)); } catch (e) {}
  }

  /* ---- utilidades ---------------------------------------------------- */

  var esc = function (s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  var kb = function (n) {
    if (!n) return "0 b";
    if (n < 1024) return n + " b";
    if (n < 1048576) return (n / 1024).toFixed(1).replace(".0", "") + " kB";
    return (n / 1048576).toFixed(1).replace(".0", "") + " MB";
  };

  /* {{tipo|texto|ruta}} → anclaje tipado, con su memoria de visitas */
  var RE = /\{\{(\w+)\|([^|{}]+)\|([^|{}]+)\}\}/g;
  function enlazar(txt) {
    return esc(txt).replace(RE, function (_, tipo, texto, ruta) {
      var clave = tipo + ":" + ruta;
      var veces = mem.enlaces[clave] || 0;
      return '<a class="e' + (veces ? " visitado" : "") + '" data-t="' + tipo +
             '" data-r="' + esc(ruta) + '" data-veces="' + veces +
             '" href="#' + esc(ruta) + '">' + texto + "</a>";
    });
  }

  /* ---- el árbol ------------------------------------------------------- */

  var $arbol = document.getElementById("arbol");

  function pintarArbol(actual) {
    var h = "";
    var n = 0;
    DIRS.forEach(function (g) {
      var hijos = A.filter(function (a) { return a.dir === g.d; });
      if (!hijos.length) return;
      h += "<h2>" + esc(g.t) + "</h2>";
      hijos.forEach(function (a) {
        var num = a.dir === "" ? "  " : String(++n).padStart(2, "0");
        h += '<a href="#' + esc(a.ruta) + '" data-r="' + esc(a.ruta) + '"' +
             (mem.visitas[a.ruta] ? ' class="leido"' : "") + ">" +
             '<span class="n">' + num + "</span> " +
             esc(a.ruta.split("/").pop()) + "</a>";
      });
    });
    $arbol.innerHTML = h;
    marcarAqui(actual);
  }

  function marcarAqui(ruta) {
    Array.prototype.forEach.call($arbol.querySelectorAll("a"), function (a) {
      a.classList.toggle("aqui", a.dataset.r === ruta);
      if (mem.visitas[a.dataset.r]) a.classList.add("leido");
    });
  }

  /* ---- carga por franjas ---------------------------------------------- */

  var reduc = global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timer = null, morgenTimer = null;

  function detener() {
    if (timer) { clearInterval(timer); timer = null; }
    if (morgenTimer) { clearInterval(morgenTimer); morgenTimer = null; }
  }

  var $barra = document.getElementById("barra");
  var $llena = $barra.firstElementChild;
  var $aviso = document.getElementById("aviso-carga");
  var completar = null;

  function cargar(versos, modo) {
    var $c = document.getElementById("cuerpo");
    $c.innerHTML = versos.map(function (v) {
      return '<span class="v oculto">' + enlazar(v) + "</span>";
    }).join("");
    var nodos = $c.querySelectorAll(".v");

    // el archivo /morgen nunca termina: se resuelve aparte
    if (modo === "infinita") { revelar(nodos, nodos.length); return morgen(); }

    var paso = modo === "franjas" ? 90 : modo === "lenta" ? 42 : 16;
    if (reduc || modo === "instantanea") { revelar(nodos, nodos.length); ocultarBarra(); return; }

    var i = 0;
    $barra.hidden = false;
    $aviso.textContent = modo === "franjas"
      ? "cargando por franjas · clic o Esc para completar"
      : "cargando · clic o Esc para completar";

    completar = function () { revelar(nodos, nodos.length); detener(); ocultarBarra(); completar = null; };

    timer = setInterval(function () {
      i += modo === "franjas" ? 1 : 2;
      revelar(nodos, i);
      $llena.style.width = Math.min(100, (i / nodos.length) * 100) + "%";
      if (i >= nodos.length) completar && completar();
    }, paso);
  }

  function revelar(nodos, hasta) {
    for (var i = 0; i < nodos.length; i++) nodos[i].classList.toggle("oculto", i >= hasta);
  }
  function ocultarBarra() { $barra.hidden = true; $llena.style.width = "0"; $aviso.textContent = ""; }

  /* morgen: se detiene en 87% y sigue intentando, sin dar error */
  function morgen() {
    var $m = document.getElementById("morgen-barra");
    if (!$m) return;
    $barra.hidden = true; $aviso.textContent = "";
    var p = 0, subiendo = true;
    morgenTimer = setInterval(function () {
      if (subiendo) { p += 9; if (p >= 87) { p = 87; subiendo = false; } }
      var lleno = Math.round(p / 5);
      $m.innerHTML = "<b>" + "▓".repeat(lleno) + "</b>" + "░".repeat(20 - lleno) +
                     "  " + p + "%  " + (subiendo ? "recibiendo…" : "esperando el cierre de &lt;li&gt;…");
    }, 260);
  }

  /* ---- notas ----------------------------------------------------------- */

  var NOTA6 = "«catorce kilos, dice ella. aquí una computadora entera pesa una beca.» " +
    "No sé cómo llegó al margen de una hoja que salió de esta sala. Lo escribí en un " +
    "archivo, en un tren, la noche anterior, y ese archivo se quedó en Constanța.";

  function pintarNotas(a, reciente) {
    var $n = document.getElementById("notas");
    var notas = (a.notas || []).slice();

    // la nota invasora crece con cada lectura
    if (a.crecimiento) {
      var hasta = Math.min(mem.lecturasNota, a.crecimiento.length);
      var extra = a.crecimiento.slice(0, hasta).map(function (t, i) {
        return { marca: "M?", texto: t, orden: i + 1 };
      });
      notas = extra.concat(notas);
    }

    var h = "<h2>notas · " + notas.length + "</h2>";
    notas.forEach(function (n, i) {
      var vacia = n.nota6 && !mem.nota6;
      var llena = n.nota6 && mem.nota6;
      h += '<div class="nota' + (vacia ? " blanca" : "") + (llena ? " llena" : "") +
           (llena && reciente ? " nueva" : "") + '" data-m="' + esc(n.marca) + '">' +
           '<span class="num">' + (i + 1) + '</span>' +
           '<span class="m">[' + esc(n.marca) + "]</span>" +
           (vacia ? '<span class="hueco"></span>' : enlazar(llena ? NOTA6 : n.texto)) +
           "</div>";
    });
    if (!notas.length) h += '<div class="nota blanca">(este archivo no tiene notas.)</div>';
    $n.innerHTML = h;
    $n.scrollTop = 0;
  }

  /* ---- abrir ------------------------------------------------------------ */

  var $cab = document.getElementById("cabecera");
  var $doc = document.getElementById("doc");

  function abrir(ruta, empuja) {
    var a = porRuta[ruta] || porRuta["public_html/404.html"];
    detener(); completar = null;

    // la nota 6 se llena al llegar aquí, no antes
    var reciente = false;
    if (a.llenaNota6 && !mem.nota6) { mem.nota6 = true; reciente = true; }
    if (a.crecimiento) mem.lecturasNota += 1;

    mem.visitas[a.ruta] = (mem.visitas[a.ruta] || 0) + 1;
    if (mem.ruta[mem.ruta.length - 1] !== a.ruta) mem.ruta.push(a.ruta);
    if (mem.ruta.length > 400) mem.ruta = mem.ruta.slice(-400);
    guardar();

    document.body.dataset.clase = a.clase || "poema";

    var n = a.dir === "" ? "" : String(A.filter(function (x) { return x.dir !== ""; })
      .indexOf(a) + 1).padStart(2, "0") + " · ";

    $cab.innerHTML =
      '<span id="titulo-obra"><i>café internet, berlín</i> · 1997</span>' +
      '<span class="r">' + esc(a.ruta) + "</span>" +
      (a.hora ? "<b>" + esc(a.hora) + "</b>" : '<span class="d">—</span>') +
      '<span class="d">' + kb(a.peso) + "</span>" +
      '<span class="d">' + esc(a.fecha || "—") + "</span>" +
      '<span class="d">' + esc(a.soporte || "") + "</span>" +
      '<span class="d">visitas ' + mem.visitas[a.ruta] + "</span>";

    document.getElementById("hoja").innerHTML =
      "<h1>" + esc(n + a.titulo) + "</h1>" +
      '<p class="sub">' + esc(a.soporte || "") + "</p>" +
      '<div id="cuerpo"></div>' +
      (a.clase === "incompleto" ? '<div id="morgen-barra"></div>' : "");

    document.title = a.ruta + " · café internet, berlín, 1997";
    cargar(a.cuerpo, a.carga || "normal");
    pintarNotas(a, reciente);
    pintarArbol(a.ruta);
    pintarPie();
    $doc.scrollTop = 0;
    if (empuja !== false && location.hash.slice(1) !== a.ruta) location.hash = a.ruta;
  }

  /* ---- pie: la bitácora que no se envía a ningún servidor -------------- */

  function pintarPie() {
    var leidos = Object.keys(mem.visitas).length;
    document.getElementById("contador").innerHTML =
      "<b>" + leidos + "</b>/" + A.length + " archivos";
    var ult = mem.ruta.slice(-6).map(function (r) { return r.split("/").pop(); });
    document.getElementById("ruta-lector").textContent =
      "ruta: " + (ult.join("  ›  ") || "—");
  }

  /* ---- eventos ---------------------------------------------------------- */

  document.addEventListener("click", function (ev) {
    var a = ev.target.closest("a.e, #arbol a, #pie a[data-r]");
    if (a && a.dataset.r) {
      ev.preventDefault();
      if (a.classList.contains("e")) {
        var clave = a.dataset.t + ":" + a.dataset.r;
        mem.enlaces[clave] = (mem.enlaces[clave] || 0) + 1;
      }
      abrir(a.dataset.r);
      return;
    }
    // clic en el cuerpo durante la carga: completar. la espera no es castigo.
    if (completar && ev.target.closest("#doc")) completar();
  });

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && completar) { ev.preventDefault(); return completar(); }
    if (ev.target.matches("input, textarea")) return;
    var i = A.indexOf(porRuta[location.hash.slice(1)] || A[0]);
    if (ev.key === "j" || ev.key === "ArrowDown" && ev.altKey) abrir(A[Math.min(A.length - 1, i + 1)].ruta);
    if (ev.key === "k" || ev.key === "ArrowUp" && ev.altKey) abrir(A[Math.max(0, i - 1)].ruta);
    if (ev.key === "n") abrir("public_html/404.html");
    if (ev.key === "m") abrir("morgen/index.html");
  });

  document.getElementById("olvidar").addEventListener("click", function () {
    mem = { visitas: {}, enlaces: {}, ruta: [], nota6: false, lecturasNota: 0 };
    guardar();
    abrir(location.hash.slice(1) || "00_README.TXT", false);
  });

  global.addEventListener("hashchange", function () {
    var r = location.hash.slice(1);
    if (r && porRuta[r]) abrir(r, false);
  });

  global.addEventListener("beforeunload", detener);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) detener();
  });

  /* ---- arranque ---------------------------------------------------------- */

  pintarArbol("");
  abrir(location.hash.slice(1) && porRuta[location.hash.slice(1)]
        ? location.hash.slice(1) : "00_README.TXT", false);

})(window);
