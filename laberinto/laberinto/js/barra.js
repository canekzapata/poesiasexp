/*
  barra.js — controles enterrados
  poesiasexp / laberinto

  no un panel limpio: una tira minima, casi apagada, que crece al pasar por
  encima. nueva semilla, copiar semilla, reconstruir el mundo, descargar el
  manifiesto, y las tres salidas (mapa, afuera, índice). la misma semilla
  reconstruye la misma internet; el resto de la sesion la desvia.

  solo navegador.
*/
(function () {
  'use strict';
  var base = window.__BASE__ || '';
  var P = window.__PAGINA__ || {};
  var MAN = window.MANIFIESTO || {};

  function el(t, a, tx) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (tx != null) e.textContent = tx; return e; }

  var barra = el('nav', { class: 'lab-barra', 'aria-label': 'salidas del laberinto' });

  var sem = P.seed != null ? P.seed : '·';
  barra.appendChild(el('span', { title: 'semilla de esta página' }, '⌇ ' + String(sem).slice(0, 10)));
  barra.appendChild(sep());

  barra.appendChild(accion('otra', 'otra semilla', function () {
    location.href = location.pathname + '?semilla=' + (Math.random() * 1e9 | 0);
  }));
  barra.appendChild(accion('copiar', 'copiar el enlace con la semilla', function () {
    var u = location.href;
    if (navigator.clipboard) navigator.clipboard.writeText(u).then(flash, function () { prompt('semilla:', u); });
    else prompt('semilla:', u);
  }));
  barra.appendChild(accion('reconstruir', 'volver a sembrar el mundo', function () { location.reload(); }));
  barra.appendChild(accion('manifiesto', 'descargar el grafo', function () {
    var blob = new Blob([JSON.stringify(MAN, null, 1)], { type: 'application/json' });
    var a = el('a', { href: URL.createObjectURL(blob), download: 'manifiesto-' + (MAN.siteSeed || 'río') + '.json' });
    document.body.appendChild(a); a.click(); a.remove();
  }));
  barra.appendChild(sep());
  barra.appendChild(el('a', { href: base + 'mapa.html' }, 'mapa'));
  barra.appendChild(el('a', { href: base + 'afuera.html' }, 'afuera'));
  barra.appendChild(el('a', { href: base + 'index.html' }, 'índice'));

  function sep() { return el('span', { class: 'sep' }, '·'); }
  function accion(txt, titulo, fn) { var a = el('a', { href: '#', title: titulo }, txt); a.addEventListener('click', function (e) { e.preventDefault(); fn(); }); return a; }
  function flash() { var s = barra.firstChild; if (s) { var o = s.textContent; s.textContent = 'copiado'; setTimeout(function () { s.textContent = o; }, 900); } }

  if (document.body) document.body.appendChild(barra);
  else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(barra); });
})();
