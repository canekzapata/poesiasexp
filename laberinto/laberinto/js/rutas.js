/*
  rutas.js — comportamiento de los enlaces
  poesiasexp / laberinto

  usa hipervinculos HTML reales (href, hash, historial, boton atras). sobre
  ese esqueleto real, cada data-kind añade una conducta: cambiar de destino,
  abrir en iframe o ventana, saltar a una coordenada, morir tras un uso,
  heredar el color de su destino, multiplicarse. no todo es JS falso: la barra
  de direcciones y el boton atras siguen produciendo retornos reales.

  solo navegador.
*/
(function () {
  'use strict';
  var U = window.LAB_UTIL;

  function enlazar(root, ctx) {
    var enlaces = root.querySelectorAll('a[data-kind]');
    Array.prototype.forEach.call(enlaces, function (a) { conducta(a, ctx); });
  }

  function conducta(a, ctx) {
    var kind = a.getAttribute('data-kind') || 'normal';
    switch (kind) {
      case 'iframe': return comoIframe(a, ctx);
      case 'ventana': return comoVentana(a, ctx);
      case 'coordenada': return comoCoordenada(a, ctx);
      case 'perecedero': return perecedero(a, ctx);
      case 'cromatico': return cromatico(a, ctx);
      case 'mutante': return mutante(a, ctx);
      case 'multiplica': return multiplica(a, ctx);
      case 'reemplazo': /* default */ break;
      default: break; // normal: navegacion real
    }
  }

  function comoIframe(a, ctx) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (ctx.contarIframes() >= ctx.limites.iframes) return;
      var ov = U.el('div', { class: 'overlay-iframe' });
      var barra = U.el('div', { class: 'overlay-barra', text: a.getAttribute('data-to') || '·' });
      var cerrar = U.el('span', { class: 'overlay-cerrar', text: '×' });
      barra.appendChild(cerrar);
      var ifr = U.el('iframe', { src: a.href, class: 'overlay-cuerpo' });
      cerrar.addEventListener('click', function () { ov.remove(); });
      ov.appendChild(barra); ov.appendChild(ifr);
      document.body.appendChild(ov);
    });
  }

  function comoVentana(a, ctx) {
    a.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (ctx.contarVentanas() >= ctx.limites.ventanas) return;
      // solo bajo gesto: intenta ventana real; si la bloquean, cae a ventana interna
      var real = ev.shiftKey ? window.open(a.href, '_blank', 'width=420,height=320') : null;
      if (real) return;
      var win = U.el('div', {
        class: 'ventana ventana-ruta', style: {
          left: (10 + Math.random() * 60) + 'vw', top: (8 + Math.random() * 55) + 'vh',
          width: '34vw', 'min-height': '26vh', 'z-index': 500
        }
      });
      var barra = U.el('div', { class: 'ventana-barra', text: a.getAttribute('data-to') || a.textContent });
      var x = U.el('span', { class: 'ventana-cerrar', text: '×' });
      barra.appendChild(x);
      x.addEventListener('click', function () { win.remove(); });
      win.appendChild(barra);
      win.appendChild(U.el('iframe', { src: a.href, class: 'ventana-iframe' }));
      document.body.appendChild(win);
    });
  }

  function comoCoordenada(a, ctx) {
    a.addEventListener('click', function (ev) {
      var cont = ctx.contenedorScroll();
      if (!cont) return; // deja navegar normal si no hay campo
      ev.preventDefault();
      var maxX = Math.max(0, cont.scrollWidth - window.innerWidth);
      var maxY = Math.max(0, cont.scrollHeight - window.innerHeight);
      window.scrollTo({ left: Math.random() * maxX, top: Math.random() * maxY, behavior: 'smooth' });
      a.classList.add('usado');
    });
  }

  function perecedero(a, ctx) {
    a.addEventListener('click', function () {
      // navega, pero al volver (bfcache/reload) ya no estará: lo marcamos como resto
      a.dataset.perecido = '1';
      setTimeout(function () {
        var resto = U.el('span', { class: 'resto-enlace', text: '·' });
        if (a.parentNode) a.parentNode.replaceChild(resto, a);
      }, 40);
    });
  }

  function cromatico(a, ctx) {
    // hereda el color de su destino (segun la paleta del grafo, si el motor la expone)
    var col = ctx.colorDe(a.getAttribute('data-to'));
    if (col) { a.style.color = col; a.style.textDecorationColor = col; }
  }

  function mutante(a, ctx) {
    // cambia de destino cada cierto tiempo (registrado por el motor para poder pararlo)
    var t = ctx.intervalo(function () {
      var otro = ctx.linkAzarTemporal();
      a.href = otro.href; a.setAttribute('data-to', otro.to || '');
      a.classList.toggle('mutando');
    }, 2200 + Math.random() * 3000);
    a.dataset.timer = t;
  }

  function multiplica(a, ctx) {
    a.addEventListener('click', function (ev) {
      if (Math.random() < 0.6) {
        ev.preventDefault();
        for (var k = 0; k < 2; k++) {
          var clon = a.cloneNode(true);
          clon.classList.add('clon');
          conducta(clon, ctx);
          a.parentNode.insertBefore(clon, a.nextSibling);
        }
      }
    });
  }

  var RUTAS = { enlazar: enlazar, conducta: conducta };
  if (typeof window !== 'undefined') window.RUTAS = RUTAS;
})();
