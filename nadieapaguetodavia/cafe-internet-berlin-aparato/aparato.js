/* =====================================================================
   NADIE APAGUE TODAVÍA — aparato crítico
   aparato.js · la máquina de cotejar

   leer aquí es editar. cada elección tiene un costo:
   creer a un testigo desacredita a los otros, y un testigo desacreditado
   se retira del aparato llevándose consigo versos que nadie más vio.
   los huecos que produzca su retirada no se pueden deshacer.

   nada de esto sale de esta máquina.
   ===================================================================== */

(function () {
  "use strict";

  var A = window.APARATO;
  var LLAVE = "aparato-nadie-apague-v1";

  /* ---------------- estado ------------------------------------------- */

  var estado = {
    credito: {},        // sigla -> 0..100
    elegido: {},        // "pieza:verso" -> sigla
    lagunasProducidas: {}, // "pieza:verso" -> sigla que se llevó el verso
    retirados: [],      // siglas retiradas, en orden
    morgen: "",         // lo que escribió quien lee
    morgenFijado: false,
    cotejos: 0
  };

  var CREDITO_INICIAL = 70;   /* margen para subir y para caer */
  var UMBRAL_ENTREDICHO = 34;
  var UMBRAL_RETIRO = 12;

  function cargar() {
    try {
      var s = localStorage.getItem(LLAVE);
      if (s) {
        var d = JSON.parse(s);
        for (var k in estado) if (d[k] !== undefined) estado[k] = d[k];
      }
    } catch (e) { /* sin memoria local, el aparato sigue funcionando */ }
    A.testigos.forEach(function (t) {
      if (typeof estado.credito[t.sigla] !== "number") estado.credito[t.sigla] = CREDITO_INICIAL;
    });
  }

  function guardar() {
    try { localStorage.setItem(LLAVE, JSON.stringify(estado)); } catch (e) {}
  }

  function olvidar() {
    try { localStorage.removeItem(LLAVE); } catch (e) {}
    location.reload();
  }

  /* ---------------- consultas ----------------------------------------- */

  function retirado(s) { return estado.credito[s] <= UMBRAL_RETIRO; }
  function enEntredicho(s) { return !retirado(s) && estado.credito[s] < UMBRAL_ENTREDICHO; }

  function siglasDe(verso) {
    return Object.keys(verso.l || {});
  }

  /* lecturas todavía disponibles: las de testigos no retirados */
  function disponibles(verso) {
    return siglasDe(verso).filter(function (s) { return !retirado(s); });
  }

  /* dos testigos que dicen exactamente lo mismo no están en desacuerdo:
     son un solo dato con dos procedencias. se agrupan bajo una sigla
     compuesta —CD, DP— igual que en la edición impresa.                */
  function agrupar(verso, siglas) {
    var orden = [], porTexto = {};
    siglas.forEach(function (s) {
      var t = verso.l[s];
      if (!porTexto[t]) { porTexto[t] = { texto: t, siglas: [] }; orden.push(porTexto[t]); }
      porTexto[t].siglas.push(s);
    });
    return orden;
  }

  function clave(p, i) { return p.n + ":" + i; }

  /* ---------------- la operación central ------------------------------ */
  /* elegir una lectura acredita a su testigo y desacredita a los que
     ofrecían otra cosa en esa misma línea. sólo a ésos: un testigo que
     calla en un verso no pierde nada por callar.

     el crédito ganado es el número de lecturas vencidas por el castigo
     de cada una. así una lectura ecuánime deja el aparato en pie y sólo
     la parcialidad sostenida retira testigos: el libro no se derrumba
     por leerlo, se derrumba por creerle siempre al mismo.               */

  var CASTIGO = 4;

  function elegir(p, i, verso, sigla) {
    if (estado.elegido[clave(p, i)] === sigla) return;

    var disp = disponibles(verso);
    var grupos = agrupar(verso, disp);
    if (grupos.length < 2) return;

    var elegidos = grupos.filter(function (g) { return g.siglas.indexOf(sigla) !== -1; })[0];
    if (!elegidos) return;
    var otros = disp.filter(function (s) { return elegidos.siglas.indexOf(s) === -1; });
    if (!otros.length) return;

    estado.elegido[clave(p, i)] = sigla;
    estado.cotejos++;

    /* suma cero: lo que pierden los rechazados es lo que ganan los creídos */
    var reparto = (CASTIGO * otros.length) / elegidos.siglas.length;
    elegidos.siglas.forEach(function (s) {
      estado.credito[s] = Math.min(100, estado.credito[s] + reparto);
    });
    otros.forEach(function (s) {
      estado.credito[s] = Math.max(0, estado.credito[s] - CASTIGO);
    });

    var antes = estado.retirados.length;
    aplicarRetiros();
    guardar();
    pintarTestigos();

    /* si un testigo acaba de retirarse, el libro entero cambia: sus
       lecturas desaparecen de todas las piezas, no sólo de ésta.       */
    if (estado.retirados.length > antes) A.piezas.forEach(pintarPieza);
    else pintarPieza(p);

    pintarEstado();
    pintarEstudio();
  }

  /* un testigo que cae por debajo del umbral se retira del aparato.
     los versos que sólo él sostenía se vuelven huecos. no vuelven.     */

  function aplicarRetiros() {
    A.testigos.forEach(function (t) {
      if (!retirado(t.sigla)) return;
      if (estado.retirados.indexOf(t.sigla) === -1) estado.retirados.push(t.sigla);
    });

    A.piezas.forEach(function (p) {
      (p.versos || []).forEach(function (v, i) {
        if (!v.l) return;
        var k = clave(p, i);
        if (estado.lagunasProducidas[k]) return;
        var quedan = disponibles(v);
        if (quedan.length === 0) {
          var unico = siglasDe(v)[0];
          estado.lagunasProducidas[k] = unico;
          delete estado.elegido[k];
        } else if (estado.elegido[k] && quedan.indexOf(estado.elegido[k]) === -1) {
          delete estado.elegido[k];   // el testigo que habíamos creído ya no está
        }
      });
    });
  }

  /* ---------------- restitución de un verso ---------------------------- */

  function restitucion(p, i, v) {
    var k = clave(p, i);
    if (estado.lagunasProducidas[k]) {
      return { tipo: "laguna-producida", por: estado.lagunasProducidas[k] };
    }
    var disp = disponibles(v);
    if (disp.length === 0) return { tipo: "laguna-producida", por: siglasDe(v)[0] };

    var grupos = agrupar(v, disp);

    /* un solo grupo: nadie discute. o hay un testigo solo, o hay varios de acuerdo. */
    if (grupos.length === 1) {
      var g = grupos[0];
      return {
        tipo: g.siglas.length === 1 ? "unica" : "consenso",
        sigla: g.siglas[0], siglas: g.siglas, texto: g.texto
      };
    }

    var e = estado.elegido[k];
    if (e && disp.indexOf(e) !== -1) {
      var el = grupos.filter(function (x) { return x.siglas.indexOf(e) !== -1; })[0];
      if (el) return { tipo: "resuelto", sigla: el.siglas[0], siglas: el.siglas, texto: el.texto };
    }
    return { tipo: "abierto", grupos: grupos };
  }

  /* ---------------- utilidades de texto -------------------------------- */

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* [[21]] -> enlace a pieza · [[T:C]] -> referencia a testigo */
  function enlaces(txt) {
    return esc(txt)
      .replace(/\[\[T:([A-Z])\]\]/g, function (_, s) {
        var t = porSigla(s);
        return '<span class="ref-t s-' + s + '" title="' +
          (t ? esc(t.nombre + " · " + t.soporte) : "") + '">' + s + "</span>";
      })
      .replace(/\[\[(\d+)\]\]/g, function (_, n) {
        var p = A.piezas.filter(function (x) { return x.n === +n; })[0];
        return '<a href="#p' + n + '">' + (p ? esc(p.titulo) : n) +
          ' <span class="num">' + n + "</span></a>";
      });
  }

  function porSigla(s) {
    return A.testigos.filter(function (t) { return t.sigla === s; })[0];
  }

  /* ---------------- pintar la barra de testigos ------------------------ */

  function pintarTestigos() {
    var cont = document.getElementById("testigos");
    cont.innerHTML = "";
    A.testigos.forEach(function (t) {
      var c = Math.round(estado.credito[t.sigla]);
      var el = document.createElement("div");
      el.className = "testigo" + (retirado(t.sigla) ? " retirado" : enEntredicho(t.sigla) ? " entredicho" : "");
      el.setAttribute("data-s", t.sigla);
      el.setAttribute("title",
        t.nombre + "\n" + t.soporte + "\n" + t.fecha +
        "\n\nvirtud: " + t.virtud.replace(/\[\[T:([A-Z])\]\]/g, "$1") +
        "\nfalla: " + t.falla.replace(/\[\[T:([A-Z])\]\]/g, "$1") +
        (retirado(t.sigla) ? "\n\nRETIRADO DEL APARATO." : ""));
      el.innerHTML =
        '<span class="sig">' + t.sigla + "</span>" +
        '<span class="cred">' + (retirado(t.sigla) ? "retirado" : c + "%") + "</span>" +
        '<span class="barra" style="width:' + Math.max(2, c) + "%\"></span>";
      cont.appendChild(el);
    });

    if (estado.morgenFijado) {
      var el2 = document.createElement("div");
      el2.className = "testigo";
      el2.setAttribute("data-s", "T");
      el2.setAttribute("title", "testimonio añadido durante esta lectura, en el folio 20v.\nno existía antes de que usted escribiera.");
      el2.innerHTML = '<span class="sig">T</span><span class="cred">esta lectura</span>' +
        '<span class="barra" style="width:100%"></span>';
      cont.appendChild(el2);
    }
  }

  /* ---------------- pintar una pieza ----------------------------------- */

  function pintarPieza(p) {
    var art = document.getElementById("p" + p.n);
    if (!art) return;
    var vs = art.querySelector(".versos");
    if (!vs) return;
    vs.innerHTML = "";

    var num = 0;
    (p.versos || []).forEach(function (v, i) {
      var d = document.createElement("div");

      if (v.blanco) { d.className = "verso blanco"; vs.appendChild(d); return; }
      num++;

      if (v.laguna) {
        d.className = "verso";
        d.innerHTML = '<span class="vn">' + num + '</span>' +
          '<span class="laguna">' + rep("·", Math.min(46, Math.round(v.laguna / 1.6))) +
          '<span class="medida">laguna · ' + v.laguna + " signos</span></span>";
        vs.appendChild(d);
        return;
      }

      var r = restitucion(p, i, v);
      d.className = "verso " + (r.tipo === "abierto" ? "abierto" : r.tipo === "unica" ? "unica" : "resuelto");
      var h = '<span class="vn">' + num + "</span>";

      if (r.tipo === "laguna-producida") {
        h += '<span class="laguna producida">' + rep("·", 22) +
          '<span class="medida">hueco producido por esta edición · sólo lo sostenía ' + r.por + "</span></span>";
      } else if (r.tipo === "unica") {
        h += '<span class="texto-restituido">' + esc(r.texto) +
          '<span class="sig-inline s-' + r.sigla + '">' + r.sigla + "</span>" +
          '<span class="sello">testimonio único · aceptado sin cotejo</span></span>';
      } else if (r.tipo === "consenso") {
        h += '<span class="texto-restituido">' + esc(r.texto) + siglasInline(r.siglas) +
          '<span class="sello">consenso de ' + r.siglas.length + " testigos</span></span>";
      } else if (r.tipo === "resuelto") {
        h += '<span class="texto-restituido">' + esc(r.texto) + siglasInline(r.siglas) + "</span>";
      } else {
        h += '<div class="cotejo">';
        r.grupos.forEach(function (g) {
          var dudoso = g.siglas.every(enEntredicho);
          h += '<button class="lectura' + (dudoso ? " entredicho" : "") +
            '" data-s="' + g.siglas[0] + '" data-p="' + p.n + '" data-i="' + i + '">' +
            '<span class="sg">' + g.siglas.join("") + '</span><span class="tx">' +
            esc(g.texto) + "</span></button>";
        });
        h += '<div class="cotejo-nota">' + r.grupos.length +
          " lecturas en desacuerdo · elija una para restituir el verso</div></div>";
      }

      d.innerHTML = h;
      vs.appendChild(d);
    });

    vs.querySelectorAll("button.lectura").forEach(function (b) {
      b.addEventListener("click", function () {
        var pn = +b.getAttribute("data-p"), vi = +b.getAttribute("data-i");
        var pz = A.piezas.filter(function (x) { return x.n === pn; })[0];
        elegir(pz, vi, pz.versos[vi], b.getAttribute("data-s"));
      });
    });

    marcarIndice(p);
  }

  function rep(c, n) { var s = ""; for (var i = 0; i < n; i++) s += c; return s; }

  function siglasInline(siglas) {
    return siglas.map(function (s) {
      return '<span class="sig-inline s-' + s + '">' + s + "</span>";
    }).join("");
  }

  function piezaHecha(p) {
    if (!p.versos || !p.versos.length) return false;
    var abiertos = 0;
    p.versos.forEach(function (v, i) {
      if (!v.l) return;
      if (restitucion(p, i, v).tipo === "abierto") abiertos++;
    });
    return abiertos === 0;
  }

  function marcarIndice(p) {
    var li = document.querySelector('li[data-p="' + p.n + '"]');
    if (li) li.setAttribute("data-hecha", piezaHecha(p) ? "1" : "0");
  }

  /* ---------------- estudio preliminar que se corrige solo ------------- */
  /* la introducción fue escrita antes de que usted cotejara. a medida
     que la edición avanza, ED tiene que ir corrigiéndola en el margen.  */

  var MARGINALES = [
    { si: function () { return estado.cotejos >= 3; },
      t: "Corrijo el párrafo anterior. Escribí «el lector encontrará el libro restituido». No lo encontrará: lo está haciendo. Cada verso que quedaba en disputa quedó fijado por una mano que no es la de 1997." },
    { si: function () { return estado.cotejos >= 10; },
      t: "Segunda corrección. Sostuve que el aparato es neutral porque presenta todas las lecturas. Presentarlas todas y obligar a elegir una no es lo mismo que ser neutral: es repartir la responsabilidad y quedarse con el diseño." },
    { si: function () { return estado.retirados.length >= 1; },
      t: function () {
        var s = estado.retirados[0], t = porSigla(s);
        return "Se ha retirado " + s + " (" + t.nombre + "). No lo decidí yo y no lo decidió un método: lo decidió la desconfianza acumulada de una lectura. Los versos que sólo " + s + " sostenía ya no están en esta edición y no los tiene nadie más.";
      } },
    { si: function () { return estado.retirados.length >= 2; },
      t: "Segundo testigo retirado. A esta altura la edición que usted tiene en las manos se parece menos al libro perdido que a un retrato de en quién decidió creer. Eso siempre fue verdad de todas las ediciones críticas; aquí sólo es visible." },
    { si: function () { return estado.morgenFijado; },
      t: "El folio 20v ya no está vacío. Lo que hay ahí entró al aparato durante esta lectura y desde ahora es citado por notas anteriores como si siempre hubiera estado. No sé cómo llamar a eso. En 1997 lo habrían llamado un error de fechas." }
  ];

  function pintarEstudio() {
    var cont = document.getElementById("marginales");
    if (!cont) return;
    cont.innerHTML = "";
    MARGINALES.forEach(function (m) {
      if (!m.si()) return;
      var s = document.createElement("span");
      s.className = "marginal";
      s.textContent = typeof m.t === "function" ? m.t() : m.t;
      cont.appendChild(s);
    });
  }

  /* ---------------- estado de la edición ------------------------------- */

  function pintarEstado() {
    var cont = document.getElementById("estado-cuerpo");
    if (!cont) return;

    var porTestigo = {}, total = 0, huecos = 0, abiertos = 0;
    A.testigos.forEach(function (t) { porTestigo[t.sigla] = 0; });

    A.piezas.forEach(function (p) {
      (p.versos || []).forEach(function (v, i) {
        if (!v.l) return;
        var r = restitucion(p, i, v);
        if (r.tipo === "laguna-producida") { huecos++; return; }
        if (r.tipo === "abierto") { abiertos++; return; }
        total++;
        /* sólo cuenta como crédito de lectura lo que hubo que decidir:
           el consenso y el testimonio único no eligen a nadie.          */
        if (r.tipo === "resuelto") r.siglas.forEach(function (s) { porTestigo[s]++; });
      });
    });

    var dom = null;
    Object.keys(porTestigo).forEach(function (s) {
      if (!dom || porTestigo[s] > porTestigo[dom]) dom = s;
    });

    var h = "versos restituidos <b>" + total + "</b> · en disputa <b>" + abiertos + "</b>";
    if (huecos) {
      h += ' · <b style="color:var(--ed)">' + huecos + "</b> " +
        (huecos === 1 ? "hueco producido" : "huecos producidos") + " por esta edición";
    }
    h += "<br>cotejos hechos <b>" + estado.cotejos + "</b>";
    if (estado.cotejos > 0 && dom) {
      var t = porSigla(dom);
      h += "<br>testigo dominante <b class=\"s-" + dom + "\">" + dom + "</b> — " + t.nombre;
    }
    if (estado.retirados.length) {
      h += "<br>retirados: <b>" + estado.retirados.join(", ") + "</b>";
    }
    h += '<br><button class="olvidar" id="olvidar">olvidar esta lectura</button>';
    cont.innerHTML = h;

    var b = document.getElementById("olvidar");
    if (b) b.addEventListener("click", olvidar);
  }

  /* ---------------- el folio 20v --------------------------------------- */

  function montarMorgen(art, p) {
    var caja = document.createElement("div");

    if (estado.morgenFijado) {
      caja.innerHTML =
        '<div class="morgen-restituido">' + esc(estado.morgen) +
        '<span class="sig-inline s-T">T</span></div>' +
        '<p class="estado-nota">testimonio T · añadido durante esta lectura · ' +
        'no se envió a ningún servidor · vive únicamente en esta máquina</p>';
      /* fuera de .versos: ese contenedor se vacía en cada repintado */
    art.appendChild(caja);
      return;
    }

    caja.className = "morgen-campo";
    caja.innerHTML =
      '<textarea id="morgen-txt" placeholder="' +
      "aquí no hay testimonio que cotejar." +
      '" aria-label="folio 20v, sin testimonio"></textarea>' +
      '<p class="aviso">lo que escriba en este folio entrará al aparato como testimonio <b>T</b>, ' +
      'con su propia sigla y su propia falla. las notas de otras piezas empezarán a citarlo. ' +
      'no se envía a ningún servidor: se queda en esta máquina hasta que usted la olvide.</p>' +
      '<button class="acto" id="morgen-fijar" disabled>fijar el testimonio</button>';
    /* fuera de .versos: ese contenedor se vacía en cada repintado */
    art.appendChild(caja);

    var ta = document.getElementById("morgen-txt");
    var bt = document.getElementById("morgen-fijar");
    ta.value = estado.morgen || "";
    bt.disabled = !ta.value.trim();
    ta.addEventListener("input", function () {
      estado.morgen = ta.value;
      bt.disabled = !ta.value.trim();
      guardar();
    });
    bt.addEventListener("click", function () {
      if (!ta.value.trim()) return;
      estado.morgen = ta.value.trim();
      estado.morgenFijado = true;
      guardar();
      construir();
      pintarTodo();
      var el = document.getElementById("p40");
      if (el) el.scrollIntoView();
    });
  }

  /* ---------------- construcción del documento -------------------------- */

  function construir() {
    /* índice */
    var idx = document.getElementById("indice");
    idx.innerHTML = "";
    A.cuadernillos.forEach(function (c) {
      var h = document.createElement("div");
      h.className = "cuadernillo-tit";
      h.innerHTML = "cuadernillo " + c.id + " · " + c.nombre + " <em>(" + c.glosa + ")</em>";
      idx.appendChild(h);

      var ol = document.createElement("ol");
      ol.className = "indice";
      A.piezas.filter(function (p) { return p.n >= c.desde && p.n <= c.hasta; })
        .forEach(function (p) {
          var li = document.createElement("li");
          li.setAttribute("data-p", p.n);
          li.setAttribute("data-estado", p.estado);
          li.innerHTML =
            '<span class="num">' + String(p.n).padStart(2, "0") + "</span>" +
            '<a href="#p' + p.n + '">' + esc(p.titulo) + "</a>" +
            '<span class="est">' + etiquetaEstado(p) + "</span>";
          ol.appendChild(li);
        });
      idx.appendChild(ol);
    });

    /* cuerpo */
    var cuerpo = document.getElementById("cuerpo");
    cuerpo.innerHTML = "";
    A.cuadernillos.forEach(function (c) {
      var h = document.createElement("div");
      h.className = "cuadernillo-tit";
      h.innerHTML = "cuadernillo " + c.id + " · " + c.nombre + " <em>(" + c.glosa + ")</em>";
      cuerpo.appendChild(h);

      A.piezas.filter(function (p) { return p.n >= c.desde && p.n <= c.hasta; })
        .forEach(function (p) {
          var art = document.createElement("article");
          art.className = "pieza";
          art.id = "p" + p.n;

          var h2 = '<h2>' + String(p.n).padStart(2, "0") + " · " + esc(p.titulo) + "</h2>" +
            '<div class="folio">folio ' + p.folio + " · " + etiquetaEstado(p) + "</div>";

          if (p.estado === "perdida") {
            h2 += '<p class="estado-nota">sin testimonio. sólo el título, en el índice escrito al dorso del plano de la sala.</p>';
          } else if (p.estado === "sin_testimonio") {
            h2 += '<p class="estado-nota">último folio. ningún testigo lo vio.</p>';
          } else if (p.estado === "fragmentaria") {
            h2 += '<p class="estado-nota">fragmentaria · sobrevive lo que otros citaron</p>';
          }

          h2 += '<div class="versos"></div>';

          if (p.notas && p.notas.length) {
            h2 += '<div class="notas">';
            p.notas.forEach(function (n) {
              h2 += '<div class="nota" data-m="' + esc(n.m) + '"><span class="marca">' +
                esc(n.m) + "</span>" + enlaces(n.t) + "</div>";
            });
            h2 += "</div>";
          }

          art.innerHTML = h2;
          cuerpo.appendChild(art);

          if (p.estado === "sin_testimonio") montarMorgen(art, p);
        });
    });

    /* la hiperstición: una vez fijado T, notas anteriores lo citan */
    if (estado.morgenFijado) inyectarCitasT();
  }

  function etiquetaEstado(p) {
    if (p.estado === "perdida") return "perdida";
    if (p.estado === "sin_testimonio") return "sin testimonio";
    if (p.estado === "fragmentaria") return "fragmentaria";
    return piezaHecha(p) ? "restituida" : "restituible";
  }

  /* las notas que sólo existen si quien lee escribió el último folio */
  var CITAS_T = [
    { p: 8,  m: "ED", t: "Al dorso del plano, después del último título, hay una línea que las ediciones anteriores leyeron como una tachadura. Cotejada con el testimonio T de esta lectura, coincide en extensión." },
    { p: 38, m: "ED", t: "El argumento de que un texto no puede entrar en una copia cerrada acaba de perder su mejor ejemplo. En esta edición hay un testimonio fechado hoy dentro de un libro de 1997, y lo puso alguien que no estaba allí." },
    { p: 40, m: "M?", t: "Sabía que alguien iba a llenar esta hoja. Por eso la dejé en el índice." }
  ];

  function inyectarCitasT() {
    CITAS_T.forEach(function (c) {
      var art = document.getElementById("p" + c.p);
      if (!art) return;
      var cont = art.querySelector(".notas");
      if (!cont) {
        cont = document.createElement("div");
        cont.className = "notas";
        art.appendChild(cont);
      }
      var d = document.createElement("div");
      d.className = "nota";
      d.setAttribute("data-m", c.m);
      d.innerHTML = '<span class="marca">' + c.m + "</span>" + enlaces(c.t);
      cont.appendChild(d);
    });
  }

  /* ---------------- teclado -------------------------------------------- */

  function piezaVisible() {
    var arts = document.querySelectorAll("article.pieza");
    var mejor = null, d = Infinity;
    arts.forEach(function (a) {
      var t = Math.abs(a.getBoundingClientRect().top - 80);
      if (t < d) { d = t; mejor = a; }
    });
    return mejor;
  }

  function mover(dir) {
    var a = piezaVisible();
    if (!a) return;
    var n = +a.id.slice(1) + dir;
    var o = document.getElementById("p" + n);
    if (o) o.scrollIntoView({ block: "start" });
  }

  document.addEventListener("keydown", function (e) {
    if (e.target && /^(TEXTAREA|INPUT)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "j") mover(1);
    else if (e.key === "k") mover(-1);
    else if (e.key === "i") { document.getElementById("indice").scrollIntoView(); }
    else if (e.key === "m") { var m = document.getElementById("p40"); if (m) m.scrollIntoView(); }
  });

  /* ---------------- arranque -------------------------------------------- */

  function pintarTodo() {
    pintarTestigos();
    A.piezas.forEach(pintarPieza);
    pintarEstado();
    pintarEstudio();
  }

  cargar();
  aplicarRetiros();
  construir();
  pintarTodo();

  var cerrar = document.getElementById("estado-cerrar");
  if (cerrar) {
    cerrar.addEventListener("click", function () {
      var c = document.querySelector(".estado-edicion");
      c.classList.toggle("min");
      cerrar.textContent = c.classList.contains("min") ? "+" : "−";
    });
  }
})();
