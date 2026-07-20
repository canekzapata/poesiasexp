/*
  gramaticas.js — gramaticas del DOM
  poesiasexp / laberinto

  catalogo de topologias. cada una construye un arbol HTML distinto a partir del
  mismo contexto (rng reproducible, paleta, corpus, regla celular, enlaces).
  dos paginas pueden compartir corpus sin sentirse la misma plantilla: la
  variacion afecta al propio DOM. no arboles totalmente aleatorios: azar
  jerarquico. produce especies de paginas, no basura intercambiable.

  solo navegador (usa document). el motor la invoca; generar-sitio.mjs solo
  escribe la cascara y el descriptor.
*/
(function () {
  'use strict';

  // ---------- utileria ----------
  var U = {
    el: function (tag, attrs, kids) {
      var e = document.createElement(tag);
      if (attrs) for (var k in attrs) {
        if (k === 'style' && typeof attrs[k] === 'object') U.css(e, attrs[k]);
        else if (k === 'text') e.textContent = attrs[k];
        else if (k === 'html') e.innerHTML = attrs[k];
        else if (k.slice(0, 2) === 'on' && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
        else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
      }
      if (kids != null) U.add(e, kids);
      return e;
    },
    add: function (e, kids) {
      if (Array.isArray(kids)) kids.forEach(function (k) { if (k != null) U.add(e, k); });
      else if (typeof kids === 'string' || typeof kids === 'number') e.appendChild(document.createTextNode(String(kids)));
      else if (kids) e.appendChild(kids);
      return e;
    },
    css: function (e, o) { for (var k in o) e.style.setProperty(k, o[k]); return e; },
    px: function (n) { return Math.round(n) + 'px'; },
    // <a> real hacia otra pagina; data-kind lo enriquece rutas.js
    a: function (ctx, link, contenido, extra) {
      if (!link) link = ctx.linkAzar();
      var at = { href: link.href, 'data-kind': link.kind || 'normal', 'data-to': link.to || '' };
      if (extra) for (var k in extra) at[k] = extra[k];
      var e = U.el('a', at);
      U.add(e, contenido != null ? contenido : (link.text || ctx.rng.pick(ctx.corpus.enlaces)));
      e.classList.add('enlace');
      return e;
    },
    glifos: function (ctx, set, n) {
      var arr = ctx.corpus.setGlifos(set), s = '';
      for (var i = 0; i < n; i++) s += ctx.rng.pick(arr);
      return s;
    }
  };

  // ---------- 1. TABLA LABERINTO ----------
  function tabla(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var cols = r.int(6, 16), rows = r.int(8, 22);
    var auto = ctx.nuevoAutomata(cols);
    var tab = U.el('table', { class: 'g-tabla', style: { 'border-collapse': r.chance(0.5) ? 'collapse' : 'separate', 'border-spacing': U.px(r.int(0, 6)) } });
    if (r.chance(0.4)) tab.classList.add('tabla-fija');
    var encabezadoAlFinal = r.chance(0.35);

    function fila(i, esHead) {
      var fila = auto.paso();
      var tr = U.el('tr');
      var c = 0;
      while (c < cols) {
        var span = r.chance(0.14) ? r.int(2, Math.min(5, cols - c)) : 1;
        var td = U.el(esHead ? 'th' : 'td', { colspan: span > 1 ? span : null });
        var viva = fila[c];
        var borde = r.int(0, 2) === 0 ? ('1px ' + r.pick(['solid', 'dashed', 'dotted']) + ' ' + pal.borde) : '';
        if (borde) td.style.border = borde;
        td.style.padding = U.px(r.int(1, 10));
        if (viva && r.chance(0.5)) {
          // celda viva -> enlace
          td.appendChild(U.a(ctx, ctx.linkAzar(), r.chance(0.5) ? r.pick(C.tablas) : U.glifos(ctx, r.pick(['operadores', 'montes', 'agua']), r.int(1, 3))));
          td.style.background = pal.acento;
        } else if (viva) {
          td.style.background = r.pick(pal.colores);
          td.appendChild(document.createTextNode(r.chance(0.5) ? U.glifos(ctx, 'sextantes', span) : r.pick(C.tablas)));
        } else if (r.chance(0.12)) {
          // celda con otra tabla (anidada, pequeña)
          var mini = U.el('table', { class: 'g-tabla mini' });
          for (var mr = 0; mr < 2; mr++) {
            var mtr = U.el('tr');
            for (var mc = 0; mc < 2; mc++) mtr.appendChild(U.el('td', { text: r.pick(C.microtextos), style: { padding: '1px', 'font-size': '8px' } }));
            mini.appendChild(mtr);
          }
          td.appendChild(mini);
        } else if (r.chance(0.06)) {
          // celda-ventana: un iframe diminuto a otra pagina
          td.appendChild(U.el('iframe', { src: ctx.linkAzar().href, class: 'celda-iframe', loading: 'lazy', scrolling: 'no' }));
        } else {
          td.textContent = r.chance(0.25) ? r.pick(C.microtextos) : '';
        }
        // algunas celdas desaparecen al visitarse
        if (r.chance(0.15)) td.addEventListener('click', function () { this.style.visibility = 'hidden'; this.dataset.resto = '1'; });
        tr.appendChild(td);
        c += span;
      }
      return tr;
    }

    var cuerpo = U.el('tbody');
    var filasTr = [];
    for (var i = 0; i < rows; i++) { var tr = fila(i, false); filasTr.push(tr); cuerpo.appendChild(tr); }
    var head = U.el('thead', null, fila(0, true));
    if (encabezadoAlFinal) { tab.appendChild(cuerpo); tab.appendChild(head); }
    else { tab.appendChild(head); tab.appendChild(cuerpo); }

    // un clic en el titulo intercambia dos filas (la tabla intenta ordenarse y fracasa)
    tab.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'TH' && filasTr.length > 1) {
        var a = r.int(0, filasTr.length - 1), b = r.int(0, filasTr.length - 1);
        if (a !== b) cuerpo.insertBefore(filasTr[a], filasTr[b]);
      }
    });
    raiz.appendChild(U.el('div', { class: 'envoltura-tabla' }, tab));
    ctx.marcarAutomata(tab);
  }

  // ---------- 2. SISTEMA DE VENTANAS ----------
  function ventanas(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var campo = U.el('div', { class: 'g-ventanas' });
    var n = r.int(4, 10);
    for (var i = 0; i < n; i++) campo.appendChild(crearVentana(ctx, {
      x: r.int(2, 78), y: r.int(2, 70), w: r.int(16, 46), h: r.int(12, 44), z: i
    }));
    raiz.appendChild(campo);
    raiz.dataset.ventanas = '1';
  }

  function crearVentana(ctx, o) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var win = U.el('div', {
      class: 'ventana', style: {
        left: o.x + 'vw', top: o.y + 'vh', width: o.w + 'vw', 'min-height': o.h + 'vh',
        'z-index': 10 + (o.z || 0), background: pal.fondo, color: pal.tinta,
        border: '1px solid ' + pal.borde, 'box-shadow': '2px 2px 0 ' + pal.acento
      }
    });
    var titulo = U.el('div', { class: 'ventana-barra', style: { background: pal.acento, color: pal.fondo }, text: r.pick(C.ventanas) });
    var cerrar = U.el('span', { class: 'ventana-cerrar', text: '×', title: 'cerrar' });
    titulo.appendChild(cerrar);
    var cuerpo = U.el('div', { class: 'ventana-cuerpo' });
    // contenido variable
    var tipo = r.weighted({ texto: 3, enlaces: 3, iframe: 2, glifos: 2, ventana: 1 });
    if (tipo === 'texto') cuerpo.appendChild(U.el('p', { text: r.pick(C.fragmentos) }));
    else if (tipo === 'enlaces') { for (var e = 0; e < r.int(2, 5); e++) cuerpo.appendChild(U.a(ctx, ctx.linkAzar(), null, { style: 'display:block' })); }
    else if (tipo === 'iframe') cuerpo.appendChild(U.el('iframe', { src: ctx.linkAzar().href, class: 'ventana-iframe', loading: 'lazy' }));
    else if (tipo === 'glifos') cuerpo.appendChild(U.el('div', { class: 'ventana-glifos', text: U.glifos(ctx, r.pick(['anatolio', 'lineara', 'agua', 'aves']), r.int(12, 60)) }));
    else cuerpo.appendChild(U.el('div', { class: 'nota', text: 'esta ventana puede abrir otra' }));

    win.appendChild(titulo); win.appendChild(cuerpo);

    // arrastrar
    hacerArrastrable(win, titulo);
    // cerrar deja residuo (se convierte en color / comentario)
    cerrar.addEventListener('click', function (ev) {
      ev.stopPropagation();
      var resto = U.el('div', { class: 'residuo', style: { left: win.style.left, top: win.style.top, background: pal.acento }, title: '‹!-- ' + r.pick(C.comentariosHTML) + ' --›' });
      if (win.parentNode) win.parentNode.replaceChild(resto, win);
    });
    // doble clic: engendra otra ventana o encoge hasta un caracter
    win.addEventListener('dblclick', function (ev) {
      ev.stopPropagation();
      if (r.chance(0.5) && win.parentNode) {
        win.parentNode.appendChild(crearVentana(ctx, { x: o.x + r.int(2, 8), y: o.y + r.int(2, 8), w: Math.max(8, o.w - 4), h: Math.max(6, o.h - 4), z: (o.z || 0) + 1 }));
      } else {
        win.classList.toggle('encogida');
      }
    });
    return win;
  }

  function hacerArrastrable(win, asa) {
    var ox = 0, oy = 0, dragging = false;
    asa.style.cursor = 'move';
    asa.addEventListener('pointerdown', function (ev) {
      dragging = true; win.style.zIndex = 999;
      var rect = win.getBoundingClientRect(); ox = ev.clientX - rect.left; oy = ev.clientY - rect.top;
      asa.setPointerCapture(ev.pointerId);
    });
    asa.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      win.style.left = (ev.clientX - ox) + 'px'; win.style.top = (ev.clientY - oy) + 'px';
    });
    asa.addEventListener('pointerup', function () { dragging = false; });
  }

  // ---------- 3. CAMPO ABSOLUTO ----------
  function campo(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var W = r.int(2400, 6000), H = r.int(1600, 4200);
    var lienzo = U.el('div', { class: 'g-campo', style: { width: U.px(W), height: U.px(H), position: 'relative' } });
    // zonas negativas / habitaciones de color
    for (var z = 0; z < r.int(2, 6); z++) lienzo.appendChild(U.el('div', {
      class: 'zona', style: {
        left: U.px(r.int(0, W - 400)), top: U.px(r.int(0, H - 300)),
        width: U.px(r.int(200, 900)), height: U.px(r.int(150, 700)), background: r.pick(pal.colores), opacity: r.float(0.15, 0.6)
      }
    }));
    var n = r.int(30, 90);
    for (var i = 0; i < n; i++) {
      var tipo = r.weighted({ palabra: 3, enlace: 4, glifo: 3, monumento: 1, micro: 3 });
      var x = r.int(0, W - 60), y = r.int(0, H - 40);
      var e;
      if (tipo === 'enlace') e = U.a(ctx, ctx.linkAzar());
      else if (tipo === 'monumento') e = U.el('span', { class: 'monumento', style: { 'font-size': U.px(r.int(80, 260)), color: r.pick(pal.colores) }, text: r.pick(C.monumentales) });
      else if (tipo === 'glifo') e = U.el('span', { style: { 'font-size': U.px(r.int(14, 90)) }, text: U.glifos(ctx, r.pick(['montes', 'agua', 'anatolio', 'lineara', 'operadores']), r.int(1, 5)) });
      else if (tipo === 'micro') e = U.el('span', { class: 'micro', text: r.pick(C.microtextos) });
      else e = U.el('span', { text: r.pick(C.fragmentos), style: { 'max-width': U.px(r.int(120, 320)) } });
      U.css(e, { position: 'absolute', left: U.px(x), top: U.px(y) });
      if (r.chance(0.3)) e.style.transform = 'rotate(' + r.int(-90, 90) + 'deg)';
      lienzo.appendChild(e);
    }
    raiz.appendChild(lienzo);
    // un enlace puede trasladar el viewport a otras coordenadas
    raiz.dataset.scroll = 'campo';
  }

  // ---------- 4. CONSTELACION DE IFRAMES ----------
  function iframes(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal;
    var cont = U.el('div', { class: 'g-iframes' });
    var modo = r.pick(['mosaico', 'disperso', 'apilado']);
    cont.classList.add('if-' + modo);
    var n = r.int(4, 12);
    for (var i = 0; i < n; i++) {
      var prof = ctx.iframeDepth; // profundidad ya limitada por el motor
      var link = ctx.linkAzar();
      var w = r.int(18, 60), h = r.int(14, 48);
      var marco = U.el('div', {
        class: 'if-marco', style: {
          width: modo === 'disperso' ? w + 'vw' : '', height: modo === 'disperso' ? h + 'vh' : '',
          left: modo === 'disperso' ? r.int(0, 70) + 'vw' : '', top: modo === 'disperso' ? r.int(0, 60) + 'vh' : '',
          'border-color': pal.borde
        }
      });
      var ifr = U.el('iframe', { src: link.href + (link.href.indexOf('?') < 0 ? '?p=' : '&p=') + prof, loading: 'lazy' });
      marco.appendChild(ifr);
      if (r.chance(0.4)) marco.appendChild(U.el('div', { class: 'if-etiqueta', text: link.to || '·' }));
      cont.appendChild(marco);
    }
    raiz.appendChild(cont);
  }

  // ---------- 5. FORMULARIO ORACULAR ----------
  function formulario(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var form = U.el('form', { class: 'g-formulario', action: ctx.linkAzar().href, method: 'get', autocomplete: 'off' });
    var n = r.int(3, 6);
    for (var s = 0; s < n; s++) {
      var fs = U.el('fieldset');
      fs.appendChild(U.el('legend', { text: r.pick(C.instrucciones) }));
      var tipo = r.pick(['check', 'radio', 'select', 'range', 'textarea', 'meter']);
      if (tipo === 'check') {
        for (var c = 0; c < r.int(2, 5); c++) {
          var id = 'c' + s + '_' + c;
          var lab = U.el('label', { for: id });
          var box = U.el('input', { type: 'checkbox', id: id, name: 'r', value: r.pick(C.rutas) });
          // marcar crea una region; desmarcar destruye una familia de enlaces
          box.addEventListener('change', function () {
            if (this.checked) form.appendChild(U.el('div', { class: 'region', 'data-x': this.value, text: U.glifos(ctx, 'agua', r.int(6, 20)) }));
            else { var reg = form.querySelector('.region[data-x="' + this.value + '"]'); if (reg) reg.remove(); }
          });
          lab.appendChild(box); lab.appendChild(document.createTextNode(' ' + r.pick(C.enlaces)));
          fs.appendChild(lab);
        }
      } else if (tipo === 'radio') {
        for (var ra = 0; ra < r.int(2, 4); ra++) {
          var lr = U.el('label');
          lr.appendChild(U.el('input', { type: 'radio', name: 'orig' + s, value: ra }));
          lr.appendChild(document.createTextNode(' ' + r.pick(C.fragmentos)));
          fs.appendChild(lr);
        }
      } else if (tipo === 'select') {
        var sel = U.el('select', { name: 'ruta' });
        for (var op = 0; op < r.int(3, 7); op++) sel.appendChild(U.el('option', { value: ctx.linkAzar().href, text: r.pick(C.enlaces) }));
        sel.addEventListener('change', function () { location.href = this.value; });
        fs.appendChild(sel);
      } else if (tipo === 'range') {
        var rng = U.el('input', { type: 'range', min: 0, max: 100, value: r.int(0, 100), name: 'entropia' });
        var out = U.el('output', { text: 'ruido' });
        rng.addEventListener('input', function () { document.documentElement.style.setProperty('--entropia', (this.value / 100).toFixed(2)); out.textContent = C.coordenadas ? this.value : this.value; });
        fs.appendChild(rng); fs.appendChild(out);
      } else if (tipo === 'textarea') {
        var ta = U.el('textarea', { rows: 3, placeholder: r.pick(C.instrucciones) });
        ta.addEventListener('input', function () { document.title = (this.value.slice(-24) || '·'); });
        fs.appendChild(ta);
      } else {
        fs.appendChild(U.el('meter', { min: 0, max: 1, value: r.float(0.1, 0.95), text: 'señal' }));
        fs.appendChild(U.el('progress', { max: 100, value: r.int(10, 90) }));
      }
      form.appendChild(fs);
    }
    form.appendChild(U.el('button', { type: 'submit', text: r.pick(['enviar al río', 'consultar', 'oráculo', 'ir']) }));
    raiz.appendChild(form);
  }

  // ---------- 6. CODIGO FUENTE HABITABLE ----------
  function fuente(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var pre = U.el('pre', { class: 'g-fuente' });
    var prof = 0, maxProf = r.int(3, 6);
    function abrir(tag, cls) { return '<' + tag + (cls ? ' class="' + cls + '"' : '') + '>'; }
    var lineas = r.int(20, 60);
    for (var i = 0; i < lineas; i++) {
      var sangria = '  '.repeat(Math.max(0, prof));
      var dado = r.next();
      var linea = U.el('span', { class: 'linea' });
      if (dado < 0.3 && prof < maxProf) {
        var tag = r.pick(['div', 'section', 'ventana', 'río', 'sonda', 'p', 'ul']);
        var t = U.el('span', { class: 'etiqueta abre', text: sangria + abrir(tag, r.pick(C.atributos)) });
        // clicar la etiqueta revela / oculta lo que contiene
        t.addEventListener('click', function () { this.classList.toggle('plegada'); });
        linea.appendChild(t); prof++;
      } else if (dado < 0.5 && prof > 0) {
        var cierre = U.el('span', { class: 'etiqueta cierra', text: sangria.slice(2) + '</' + r.pick(['div', 'section', 'río', 'sonda', 'p']) + '>' });
        // clicar </div> puede cerrar (ocultar) la linea previa
        cierre.addEventListener('click', function () { var p = this.parentNode.previousSibling; if (p) p.style.opacity = 0.15; });
        linea.appendChild(cierre); prof--;
      } else if (dado < 0.72) {
        // un href que se vuelve enlace real
        linea.appendChild(document.createTextNode(sangria + 'href="'));
        linea.appendChild(U.a(ctx, ctx.linkAzar()));
        linea.appendChild(document.createTextNode('"'));
      } else if (dado < 0.85) {
        linea.appendChild(U.el('span', { class: 'atributo', text: sangria + 'data-' + r.pick(C.atributos) + '="' + r.pick(C.microtextos) + '"' }));
      } else {
        linea.appendChild(U.el('span', { class: 'comentario', text: sangria + '<!-- ' + r.pick(C.comentariosHTML) + ' -->' }));
      }
      pre.appendChild(linea);
      pre.appendChild(document.createTextNode('\n'));
    }
    raiz.appendChild(pre);
  }

  // ---------- 7. AUTOMATA HABITABLE ----------
  function celular(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var wrap = U.el('div', { class: 'g-celular' });
    var canvas = U.el('canvas', { class: 'celular-canvas' });
    wrap.appendChild(canvas);
    var capa = U.el('div', { class: 'celular-capa' });
    wrap.appendChild(capa);
    raiz.appendChild(wrap);
    // el motor anima el canvas; aqui sembramos celdas habitables (letras/enlaces)
    ctx.canvasCelular = canvas;
    var cols = r.int(20, 40);
    var auto = ctx.nuevoAutomata(cols);
    for (var fila = 0; fila < r.int(6, 14); fila++) {
      var f = auto.paso();
      for (var c = 0; c < cols; c++) {
        if (f[c] && r.chance(0.25)) {
          var cel = U.el('span', {
            class: 'celda-viva', style: {
              left: (c / cols * 100) + '%', top: (fila / 14 * 100 + r.int(0, 4)) + '%', color: r.pick(pal.colores)
            }
          });
          if (r.chance(0.5)) cel.appendChild(U.a(ctx, ctx.linkAzar(), r.pick(C.tablas)));
          else cel.textContent = r.chance(0.5) ? r.pick(C.tablas) : U.glifos(ctx, 'binario', 1);
          capa.appendChild(cel);
        }
      }
    }
    ctx.marcarAutomata(wrap);
  }

  // ---------- 8. INDICE EXPLOSIVO ----------
  function indice(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var ul = U.el('ul', { class: 'g-indice' });
    function item(txt) {
      var li = U.el('li');
      var a = U.a(ctx, ctx.linkAzar(), txt);
      // cada clic agrega enlaces nuevos (con boton derecho / clic largo no; usamos clic normal + preventDefault a veces)
      a.addEventListener('click', function (ev) {
        if (r.chance(0.55)) { // a veces navega, a veces se reproduce
          ev.preventDefault();
          var cuantos = r.int(1, 4);
          for (var k = 0; k < cuantos; k++) ul.insertBefore(item(r.pick(C.enlaces)), li.nextSibling);
          if (r.chance(0.3)) li.remove(); // otros se destruyen
          if (ul.children.length > 240) colapsar();
        }
      });
      // algunos enlaces siguen o huyen del cursor
      if (r.chance(0.2)) {
        var huye = r.chance(0.5);
        a.addEventListener('mousemove', function (ev) {
          this.style.position = 'relative';
          this.style.left = (huye ? -1 : 1) * (ev.offsetX - 10) + 'px';
        });
      }
      li.appendChild(a);
      return li;
    }
    function colapsar() { ul.innerHTML = ''; for (var i = 0; i < 3; i++) ul.appendChild(item(r.pick(C.monumentales))); }
    for (var i = 0; i < r.int(6, 16); i++) ul.appendChild(item(r.pick(C.enlaces)));
    raiz.appendChild(U.el('div', { class: 'indice-titulo', text: r.pick(C.instrucciones) }));
    raiz.appendChild(ul);
  }

  // ---------- 9. PAGINA CASI VACIA ----------
  function vacio(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var W = r.int(1600, 4200), H = r.int(1400, 3600);
    var v = U.el('div', { class: 'g-vacio', style: { width: U.px(W), height: U.px(H), position: 'relative' } });
    var tipo = r.pick(['enlace', 'celda', 'palabra', 'ventana', 'borde']);
    var x = r.int(W * 0.5, W - 200), y = r.int(H * 0.5, H - 120);
    var nodo;
    if (tipo === 'enlace') nodo = U.a(ctx, ctx.linkAzar(), r.pick(C.microtextos));
    else if (tipo === 'palabra') nodo = U.el('span', { class: 'monumento', text: r.pick(C.monumentales), style: { 'font-size': U.px(r.int(40, 120)) } });
    else if (tipo === 'ventana') nodo = crearVentana(ctx, { x: 40, y: 40, w: 8, h: 5, z: 0 });
    else if (tipo === 'borde') nodo = U.el('iframe', { src: ctx.linkAzar().href, style: { width: '3px', height: '120px', border: '1px solid ' + pal.borde } });
    else nodo = U.el('span', { class: 'celda-sola', text: U.glifos(ctx, 'operadores', 1) });
    U.css(nodo, { position: 'absolute', left: U.px(x), top: U.px(y) });
    v.appendChild(nodo);
    // a veces una barra revela que hay algo fuera
    if (r.chance(0.5)) v.appendChild(U.el('span', { class: 'micro', style: { position: 'absolute', left: U.px(r.int(20, 80)), top: U.px(r.int(20, 80)) }, text: r.pick(C.microtextos) }));
    raiz.appendChild(v);
  }

  // ---------- 10. PAISAJE DE GLIFOS ----------
  function paisaje(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var esc = U.el('div', { class: 'g-paisaje' });
    var capas = [
      { set: 'cielo', tam: [10, 26], op: 0.9 },
      { set: 'macizo', tam: [18, 44], op: 1 },
      { set: 'laderas', tam: [14, 30], op: 1 },
      { set: r.pick(['aves', 'anatolio']), tam: [12, 26], op: 0.95 },
      { set: r.pick(['humanos', 'plantas', 'animales']), tam: [12, 24], op: 1 },
      { set: 'agua', tam: [12, 28], op: 0.9 },
      { set: 'ondas', tam: [10, 22], op: 0.8 }
    ];
    capas.forEach(function (cp, idx) {
      var linea = '', ancho = r.int(60, 160);
      for (var i = 0; i < ancho; i++) linea += r.chance(0.7) ? r.pick(C.setGlifos(cp.set)) : ' ';
      var div = U.el('div', {
        class: 'paisaje-capa', style: {
          'font-size': U.px(r.int(cp.tam[0], cp.tam[1])), color: r.pick(pal.colores),
          opacity: cp.op, top: (idx / capas.length * 82) + '%', 'z-index': idx
        }, text: linea
      });
      // algunas letras del paisaje son enlaces
      if (r.chance(0.6)) {
        var link = U.a(ctx, ctx.linkAzar(), r.pick(C.setGlifos(cp.set)));
        link.classList.add('glifo-enlace');
        div.appendChild(link);
      }
      esc.appendChild(div);
    });
    // una palabra monumental encima
    if (r.chance(0.6)) esc.appendChild(U.el('span', { class: 'paisaje-palabra', text: r.pick(C.monumentales) }));
    raiz.appendChild(esc);
  }

  // ---------- 11. DOCUMENTO VERTICAL IMPOSIBLE ----------
  function vertical(raiz, ctx) {
    var r = ctx.rng, C = ctx.corpus;
    var doc = U.el('div', { class: 'g-vertical' });
    var estratos = r.int(6, 14);
    for (var s = 0; s < estratos; s++) {
      var subPal = ctx.paletaHija('estrato' + s);
      var prof = s / estratos;
      var sec = U.el('section', {
        class: 'estrato', style: {
          background: subPal.fondo, color: subPal.tinta,
          'min-height': r.int(50, 130) + 'vh', 'font-size': U.px(Math.round(10 + prof * r.int(4, 40)))
        }
      });
      var densidad = r.float(0.1, 0.9);
      var cuantos = Math.round(densidad * r.int(4, 16));
      for (var i = 0; i < cuantos; i++) {
        var d = r.next();
        if (d < 0.4) sec.appendChild(U.a(ctx, ctx.linkAzar(), null, { style: 'display:inline-block;margin:.3em' }));
        else if (d < 0.7) sec.appendChild(U.el('p', { text: r.pick(C.fragmentos) }));
        else sec.appendChild(U.el('span', { class: 'monumento', style: { display: 'block', color: r.pick(subPal.colores) }, text: r.pick(C.monumentales) }));
      }
      doc.appendChild(sec);
    }
    raiz.appendChild(doc);
  }

  // ---------- 12. CORREDOR HORIZONTAL ----------
  function corredor(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var W = r.int(9000, 22000);
    var pasillo = U.el('div', { class: 'g-corredor', style: { width: U.px(W) } });
    var x = 0;
    while (x < W - 300) {
      var d = r.next();
      var bloque;
      if (d < 0.25) { bloque = U.el('div', { class: 'corr-zona', style: { background: r.pick(pal.colores), width: U.px(r.int(200, 1200)) } }); }
      else if (d < 0.5) { bloque = U.el('div', { class: 'corr-obj', style: { 'font-size': U.px(r.int(30, 160)) }, text: U.glifos(ctx, r.pick(['montes', 'macizo', 'agua', 'anatolio']), r.int(2, 8)) }); }
      else if (d < 0.72) { bloque = U.a(ctx, ctx.linkAzar()); bloque.classList.add('corr-enlace'); }
      else if (d < 0.86) { bloque = U.el('div', { class: 'corr-vacio', style: { width: U.px(r.int(300, 1600)) } }); }
      else { bloque = U.el('div', { class: 'corr-palabra', style: { 'font-size': U.px(r.int(60, 220)), color: r.pick(pal.colores) }, text: r.pick(C.monumentales) }); }
      bloque.style.display = 'inline-block';
      bloque.style.verticalAlign = r.pick(['top', 'middle', 'bottom', 'baseline']);
      pasillo.appendChild(bloque);
      x += bloque.style.width ? parseInt(bloque.style.width) : r.int(120, 400);
    }
    raiz.appendChild(pasillo);
    raiz.dataset.scroll = 'corredor';
  }

  // ---------- 13. ERROR LOCAL ----------
  function error(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var e = U.el('div', { class: 'g-error' });
    e.appendChild(U.el('div', { class: 'error-linea', text: r.pick(C.errores) }));
    // comentarios HTML visibles con rutas dentro
    for (var i = 0; i < r.int(3, 8); i++) {
      var cm = U.el('div', { class: 'error-comentario', text: '<!-- ' + r.pick(C.comentariosHTML) + ' -->' });
      if (r.chance(0.5)) { var a = U.a(ctx, ctx.linkAzar(), r.pick(C.rutas)); cm.appendChild(document.createTextNode(' ')); cm.appendChild(a); }
      e.appendChild(cm);
    }
    // imagen inexistente cuyo alt contiene rutas
    e.appendChild(U.el('img', { src: 'no-existe/' + r.pick(C.rutas) + '.png', alt: r.pick(C.altText), class: 'error-img' }));
    // enlaces sin texto
    for (var k = 0; k < r.int(2, 6); k++) e.appendChild(U.a(ctx, ctx.linkAzar(), ' ', { class: 'enlace-sin-texto' }));
    // formulario de reparacion (no repara)
    var form = U.el('form', { class: 'error-reparar', onsubmit: function (ev) { ev.preventDefault(); this.querySelector('.resultado').textContent = r.pick(C.errores); } });
    form.appendChild(U.el('input', { type: 'text', placeholder: 'reparar…' }));
    form.appendChild(U.el('button', { text: 'reparar' }));
    form.appendChild(U.el('div', { class: 'resultado' }));
    e.appendChild(form);
    raiz.appendChild(e);
    raiz.classList.add('modo-error');
  }

  // ---------- 14. PAGINA REPRODUCTORA ----------
  function reproductora(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var rep = U.el('div', { class: 'g-reproductora' });
    rep.appendChild(U.el('div', { class: 'monumento', text: r.pick(C.monumentales) }));
    rep.appendChild(U.el('p', { text: 'esta página puede engendrar otra versión de sí misma' }));
    // la descendencia existe como srcdoc, blob descargable o nueva URL con semilla
    var panel = U.el('div', { class: 'rep-panel' });
    var vivero = U.el('div', { class: 'rep-vivero' });

    var bSrc = U.el('button', { text: 'gestar aquí (srcdoc)' });
    bSrc.addEventListener('click', function () {
      var hija = ctx.serializarDescendiente();
      vivero.appendChild(U.el('iframe', { srcdoc: hija.html, class: 'rep-hija', title: hija.semilla }));
    });
    var bBlob = U.el('button', { text: 'descargar descendiente (.html)' });
    bBlob.addEventListener('click', function () {
      var hija = ctx.serializarDescendiente();
      var blob = new Blob([hija.html], { type: 'text/html' });
      var url = URL.createObjectURL(blob);
      var a = U.el('a', { href: url, download: 'descendiente-' + hija.semilla + '.html', text: 'descendiente-' + hija.semilla + '.html' });
      vivero.appendChild(a);
    });
    var bUrl = U.el('button', { text: 'nueva semilla (misma página)' });
    bUrl.addEventListener('click', function () { location.href = location.pathname + '?semilla=' + (Math.random() * 1e9 | 0); });

    panel.appendChild(bSrc); panel.appendChild(bBlob); panel.appendChild(bUrl);
    rep.appendChild(panel); rep.appendChild(vivero);
    raiz.appendChild(rep);
  }

  // ---------- MAPA (indice falso) : lee el grafo real y lo vuelve tabla ----------
  function mapa(raiz, ctx) {
    var r = ctx.rng, pal = ctx.pal, C = ctx.corpus;
    var MAN = window.MANIFIESTO || { paginas: {}, aristas: [] };
    var ids = Object.keys(MAN.paginas || {});
    raiz.appendChild(U.el('div', { class: 'mapa-titulo monumento', text: 'MAPA' }));
    raiz.appendChild(U.el('div', { class: 'nota', text: 'este mapa no corresponde del todo a estas páginas' }));
    var tab = U.el('table', { class: 'g-tabla mapa-tabla' });
    var tb = U.el('tbody');
    // pagina base (donde vive esta cascara): sus enlaces salen a paginas/
    var pref = (ctx.prefijoPaginas != null) ? ctx.prefijoPaginas : '';
    ids.forEach(function (id) {
      var n = MAN.paginas[id];
      var tr = U.el('tr');
      var cid = U.el('td', { style: { background: n.color || pal.acento, color: pal.fondo } });
      cid.appendChild(U.el('a', { href: pref + id + '.html', class: 'enlace', 'data-kind': 'normal', text: id }));
      tr.appendChild(cid);
      tr.appendChild(U.el('td', { text: (n.topo || []).join('·') }));
      tr.appendChild(U.el('td', { text: 'gen.' + (n.rule != null ? n.rule : '?'), style: { 'font-size': '10px', opacity: .7 } }));
      var ctit = U.el('td');
      ctit.appendChild(U.el('a', { href: pref + id + '.html', class: 'enlace', 'data-kind': r.pick(['normal', 'iframe', 'ventana']), text: n.titulo || r.pick(C.enlaces) }));
      if (n.oculta) ctit.appendChild(U.el('span', { class: 'micro', text: ' · oculta' }));
      tr.appendChild(ctit);
      tb.appendChild(tr);
    });
    // filas falsas: rutas hacia paginas inexistentes
    for (var f = 0; f < r.int(4, 10); f++) {
      var tr2 = U.el('tr', { class: 'fila-falsa' });
      var fake = r.pick(C.rutas) + '-' + r.int(100, 999);
      tr2.appendChild(U.el('td', { text: '—' }));
      tr2.appendChild(U.el('td', { text: r.pick(C.rutas) }));
      tr2.appendChild(U.el('td', { text: 'gen.?', style: { 'font-size': '10px', opacity: .5 } }));
      tr2.appendChild(U.el('td', null, U.el('a', { href: pref + fake + '.html', class: 'enlace', 'data-kind': 'normal', text: fake + '.html' })));
      tb.appendChild(tr2);
    }
    tab.appendChild(tb);
    raiz.appendChild(U.el('div', { class: 'envoltura-tabla' }, tab));
  }

  var GRAMATICAS = {
    tabla: tabla, ventanas: ventanas, campo: campo, iframes: iframes,
    formulario: formulario, fuente: fuente, celular: celular, indice: indice,
    vacio: vacio, paisaje: paisaje, vertical: vertical, corredor: corredor,
    error: error, reproductora: reproductora, mapa: mapa
  };
  // pesos para el planificador: cuales aparecen mas
  GRAMATICAS._pesos = {
    tabla: 5, ventanas: 5, campo: 5, iframes: 3, formulario: 3, fuente: 3,
    celular: 5, indice: 4, vacio: 3, paisaje: 5, vertical: 4, corredor: 4,
    error: 2, reproductora: 2
  };
  GRAMATICAS._nombres = Object.keys(GRAMATICAS).filter(function (k) { return k[0] !== '_'; });

  if (typeof window !== 'undefined') { window.GRAMATICAS = GRAMATICAS; window.LAB_UTIL = U; }
  if (typeof module !== 'undefined' && module.exports) module.exports = GRAMATICAS;
})();
