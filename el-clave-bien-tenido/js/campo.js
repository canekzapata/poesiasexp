'use strict';
/* =====================================================================
   EL CLAVE BIEN TEÑIDO — campo.js
   BANCO DE PRUEBAS de la interfaz. pinta el campo de pantallas y conecta
   los siete verbos con el modelo. no decide nada musical: lee el
   organismo y le manda gestos.

   la fase visual —la ventana de la casa, la lentitud como decisión, el
   residuo— viene después. esto es lo mínimo para que la cadena vertical
   se pueda comprobar entera, con teclado y con un dedo.
   ===================================================================== */
(function (raiz) {

  const C = {};
  let org = null, host = null, bit = null, estado = null, puerta = null;
  let nodos = {}, ultimoToque = 0, puertaDicha = false;
  const COL = () => raiz.CLAVE.color;

  function css(c) { return COL().hex(c); }

  function pintarUna(v) {
    let el = nodos[v.id];
    if (!el) {
      el = document.createElement('div');
      el.className = 'pantalla';
      el.tabIndex = 0;
      el.dataset.id = v.id;
      el.innerHTML = '<span class="rug"></span><span class="dato"></span>';
      host.appendChild(el);
      nodos[v.id] = el;
      conectarGestos(el, v.id);
    }
    const R = host.getBoundingClientRect();
    el.style.left = (v.rect.x * R.width) + 'px';
    el.style.top = (v.rect.y * R.height) + 'px';
    el.style.width = (v.rect.w * R.width) + 'px';
    el.style.height = (v.rect.h * R.height) + 'px';
    const paradas = v.gradiente.map(function (p, j) {
      return css(p) + ' ' + Math.round(j / (v.gradiente.length - 1) * 100) + '%';
    }).join(', ');
    el.style.backgroundImage = 'linear-gradient(' + v.eje + 'deg, ' + paradas + ')';
    el.dataset.clase = v.clase;
    el.dataset.medio = v.medioForzado || org.medio;
    el.dataset.congelado = v.congelado ? '1' : '0';
    el.style.setProperty('--rug', String(Math.min(0.7, v.rugosidad)));
    el.style.setProperty('--rug-ang', (v.eje % 180) + 'deg');
    /* el mismo estado, en texto, para quien no distingue el matiz */
    const r = org.rasgosNoCromaticos(v);
    el.querySelector('.dato').textContent =
      v.id + ' ' + v.color.nombre + '\n' + r.periodo.toFixed(2) + 's · ' + r.plano + ' · ' + r.bandas + 'b';
    el.setAttribute('aria-label', v.id + ' · ' + COL().linea(v.color) + ' · período ' +
      r.periodo.toFixed(2) + ' s · plano ' + r.plano + ' · ' + r.estado);
  }

  function pintar() {
    if (!org || !host) return;
    const vivas = {};
    for (const v of org.voces) {
      if (v.estado === 'audible' || v.estado === 'congelada' || v.estado === 'latente') {
        vivas[v.id] = true;
        pintarUna(v);
        if (v.estado === 'latente' && nodos[v.id]) nodos[v.id].style.opacity = '0.35';
        else if (nodos[v.id]) nodos[v.id].style.opacity = '1';
      }
    }
    for (const id in nodos) {
      if (vivas[id]) continue;
      const v = org.voz(id);
      const el = nodos[id];
      /* lo que se va deja residuo: la voz no vuelve, la inscripción sí */
      if (v && v.residuo) {
        const res = document.createElement('div');
        res.className = 'residuo';
        res.dataset.nombre = v.residuo.nombre;
        res.style.cssText = el.style.cssText;
        res.style.backgroundImage = 'none';
        host.appendChild(res);
      }
      el.remove();
      delete nodos[id];
    }
    estado.textContent = org.linea() + ' · ' + (raiz.CLAVE.tiempo.encendido ? raiz.CLAVE.tiempo.peldano : 'sin audio');
  }
  C.pintar = pintar;

  function escribir() {
    if (!bit) return;
    const ls = org.bitacora.slice(-26).reverse();
    bit.innerHTML = ls.map(function (l) {
      return '<div><b>' + l.t.toFixed(1) + '</b> ' + l.tipo + ' · ' + l.texto +
        (l.causa ? '<br>&nbsp;&nbsp;<span>' + l.causa + '</span>' : '') + '</div>';
    }).join('');
  }
  C.escribir = escribir;

  /* ---- los gestos ---------------------------------------------------- */
  function conectarGestos(el, id) {
    let arrastrando = false, dx = 0, dy = 0, movido = false;
    const R = () => host.getBoundingClientRect();

    el.addEventListener('pointerdown', function (ev) {
      if (ev.target !== el) return;
      const r = el.getBoundingClientRect();
      /* la esquina inferior derecha es `resize`, no arrastre */
      if (ev.clientX > r.right - 18 && ev.clientY > r.bottom - 18) return;
      arrastrando = true; movido = false;
      dx = ev.clientX - r.left; dy = ev.clientY - r.top;
      el.setPointerCapture(ev.pointerId);
      el.style.cursor = 'grabbing';
      ultimoToque = Date.now();
    });

    el.addEventListener('pointermove', function (ev) {
      if (!arrastrando) return;
      movido = true;
      const c = R();
      org.mover(id, (ev.clientX - dx - c.left) / c.width, (ev.clientY - dy - c.top) / c.height);
      pintar();
    });

    el.addEventListener('pointerup', function (ev) {
      if (!arrastrando) return;
      arrastrando = false;
      el.style.cursor = 'grab';
      try { el.releasePointerCapture(ev.pointerId); } catch (e) {}
      if (!movido) {
        /* tocar sin mover: detener o soltar. congelar es un verbo. */
        const v = org.voz(id);
        if (v && v.congelado) org.soltar(id); else org.detener(id);
      }
      refrescar();
    });

    /* redimensionar: aumentación y disminución. reordena todo el sistema
       polirrítmico, no sólo esta voz. */
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(function () {
        const c = R();
        if (!c.width) return;
        const v = org.voz(id);
        if (!v) return;
        const w = el.offsetWidth / c.width, h = el.offsetHeight / c.height;
        if (Math.abs(w - v.rect.w) < 0.004 && Math.abs(h - v.rect.h) < 0.004) return;
        org.redimensionar(id, w, h);
        ultimoToque = Date.now();
        refrescar();
      });
      ro.observe(el);
    }

    /* teclado: todo lo operable con un dedo lo es también sin ratón */
    el.addEventListener('keydown', function (ev) {
      const v = org.voz(id); if (!v) return;
      const paso = ev.shiftKey ? 0.08 : 0.02;
      let hecho = true;
      switch (ev.key) {
        case 'ArrowLeft': org.mover(id, v.rect.x - paso, v.rect.y); break;
        case 'ArrowRight': org.mover(id, v.rect.x + paso, v.rect.y); break;
        case 'ArrowUp': org.mover(id, v.rect.x, v.rect.y - paso); break;
        case 'ArrowDown': org.mover(id, v.rect.x, v.rect.y + paso); break;
        case '+': case '=': org.redimensionar(id, v.rect.w * 1.25, v.rect.h * 1.25); break;
        case '-': case '_': org.redimensionar(id, v.rect.w * 0.8, v.rect.h * 0.8); break;
        case 'd': org.duplicar(id); break;
        case 'x': case 'Delete': case 'Backspace': org.borrar(id); break;
        case 'i': org.invertir(id); break;
        case 'c': org.modificar(id, { dC: ev.shiftKey ? 0.02 : -0.02 }); break;
        case 'h': org.modificar(id, { dH: ev.shiftKey ? 12 : -12 }); break;
        case 'e': org.modificar(id, { dEje: 30 }); break;
        case ' ': (v.congelado ? org.soltar(id) : org.detener(id)); break;
        case 's': case 'r': {
          const otras = org.audibles().filter(w => w.id !== id);
          if (otras.length) {
            let mejor = otras[0], dm = 1e9;
            for (const w of otras) { const s = org.separacion(v, w); if (s < dm) { dm = s; mejor = w; } }
            if (ev.key === 's') org.sumar(id, mejor.id); else org.restar(id, mejor.id, ev.shiftKey);
          }
          break;
        }
        default: hecho = false;
      }
      if (hecho) { ev.preventDefault(); ultimoToque = Date.now(); refrescar(); }
    });
  }

  function refrescar() {
    pintar(); escribir();
    if (raiz.CLAVE.tiempo.encendido) raiz.CLAVE.tiempo.aplicarTodo(undefined, 0.12);
  }
  C.refrescar = refrescar;

  /* ---- la puerta: una sola cosa, y no vuelve a insistir --------------- */
  function vigilarPuerta() {
    if (puertaDicha) return;
    if (Date.now() - ultimoToque < 8000) return;
    puertaDicha = true;
    puerta.textContent = 'dos se tocan';
    puerta.classList.add('visible');
    setTimeout(function () { puerta.classList.remove('visible'); }, 9000);
  }

  /* ---- arranque ------------------------------------------------------ */
  function iniciar(organismo, opciones) {
    const o = opciones || {};
    org = organismo;
    host = document.getElementById('campo');
    bit = document.getElementById('bitacora');
    estado = document.getElementById('estado');
    puerta = document.getElementById('puerta');
    ultimoToque = Date.now();
    pintar(); escribir();

    /* el modelo avanza con el reloj del audio cuando hay audio. sin
       audio la obra se recorre igual: aquí el reloj es del navegador,
       y por eso NO decide música — sólo mantiene vivo el mismo modelo. */
    setInterval(function () {
      if (!raiz.CLAVE.tiempo.encendido) org.avanzar(org.t + 0.25);
      pintar(); escribir(); vigilarPuerta();
    }, 250);

    window.addEventListener('resize', pintar);
    document.addEventListener('pointerdown', function () { ultimoToque = Date.now(); }, true);

    if (raiz.CLAVE.tiempo) raiz.CLAVE.tiempo.alDibujar = function () { pintar(); escribir(); };
    return C;
  }

  C.iniciar = iniciar;
  raiz.CLAVE = raiz.CLAVE || {};
  raiz.CLAVE.campo = C;

})(typeof globalThis !== 'undefined' ? globalThis : this);
