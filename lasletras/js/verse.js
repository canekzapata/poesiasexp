/*
  verse.js — "espacio escultórico", edición para Verse (generative-verse).

  Diferencias con la versión vertical de poesiasexp:
    · lámina CUADRADA (1000 × 1000), a sangre en cualquier viewport;
    · sin infraestructura: no hay cabecera, panel, botones ni exportaciones;
    · la única entrada es el hash que Verse inyecta por ?payload=base64(JSON);
    · los datos de la semilla se imprimen DENTRO de la propia imagen (ficha);
    · los rasgos se publican en window.$artifact.features para el metadato del token.

  La semilla es lo único que decide. La misma semilla reconstruye exactamente
  la misma arquitectura, incluida frase, perspectiva, color y anomalía.
*/
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SIZE = 1000;
  // Marco imprimible: la obra ocupa casi todo el cuadrado; el texto se retira
  // a la esquina inferior derecha, así que sólo reservamos una banda baja.
  var FRAME = { x: 78, y: 88, width: SIZE - 156, height: SIZE - 236 };
  var svg = document.getElementById("lamina");

  function el(name, attributes, text) {
    var node = document.createElementNS(NS, name);
    Object.keys(attributes || {}).forEach(function (key) {
      if (attributes[key] !== null && attributes[key] !== undefined) node.setAttribute(key, attributes[key]);
    });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // --- Semilla: Verse entrega hash y edición en un payload base64 -----------
  function randomHash() {
    var hex = "0123456789abcdef";
    var out = "0x";
    var bytes = new Uint8Array(32);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (var b = 0; b < bytes.length; b += 1) bytes[b] = Math.floor(Math.random() * 256);
    for (var i = 0; i < bytes.length; i += 1) out += hex[bytes[i] >> 4] + hex[bytes[i] & 15];
    return out;
  }

  function readSeed() {
    var params = new URLSearchParams(window.location.search);
    var payload = params.get("payload");
    if (payload) {
      try {
        var decoded = JSON.parse(atob(payload));
        return {
          hash: decoded.hash != null ? String(decoded.hash) : randomHash(),
          edition: Number(decoded.editionNumber || decoded.edition || 1)
        };
      } catch (error) { /* payload inválido: caemos a los alternos */ }
    }
    var direct = params.get("hash") || params.get("seed") || params.get("fxhash");
    if (direct) return { hash: String(direct), edition: Number(params.get("edition") || 1) };
    return { hash: randomHash(), edition: 1 };
  }

  function folio(seed) {
    return String(ARQ_AZAR.hashSeed(seed) % 1000000).padStart(6, "0");
  }

  // --- Reencuadre cuadrado -------------------------------------------------
  // build() ya ajustó la superficie a la lámina vertical, pero cada signo
  // conserva sus coordenadas proyectadas (rawX/rawY + perturbaciones). Las
  // reutilizamos para reencuadrar sin volver a construir la arquitectura.
  function fitSquare(surface) {
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    surface.forEach(function (item) {
      var x = item.rawX + item.perturbX;
      var y = item.rawY + item.perturbY;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    var rawWidth = Math.max(1, maxX - minX);
    var rawHeight = Math.max(1, maxY - minY);
    var scale = Math.min(FRAME.width / rawWidth, FRAME.height / rawHeight);
    scale = Math.min(scale, 3);
    var usedWidth = rawWidth * scale;
    var usedHeight = rawHeight * scale;
    var originX = FRAME.x + (FRAME.width - usedWidth) / 2;
    var originY = FRAME.y + (FRAME.height - usedHeight) / 2;
    var fontSize = Math.max(9, Math.min(30, 13 * scale));
    surface.forEach(function (item) {
      item.sx = Math.round((originX + (item.rawX + item.perturbX - minX) * scale) * 100) / 100;
      item.sy = Math.round((originY + (item.rawY + item.perturbY - minY) * scale) * 100) / 100;
      item.sfont = Math.round(fontSize * 100) / 100;
    });
    return fontSize;
  }

  // --- Color por cara (respeta las relaciones de alfabeto entre cuerpos) ---
  function faceColor(piece, item) {
    var colors = piece.colors;
    if (item.anomaly) return colors.anomalia;
    var face = item.face;
    var relation = piece.traits.alphabetRelation;
    if (item.body === "derecha" && relation === "CARAS INVERTIDAS") {
      face = face === "frente" ? "lateral" : face === "lateral" ? "frente" : "techo";
    } else if (item.body === "derecha" && relation === "TRADUCCIÓN MATERIAL") {
      face = face === "frente" ? "techo" : face === "techo" ? "frente" : "lateral";
    }
    return colors[face] || colors.frente;
  }

  function glyphNode(piece, item, carbon, index) {
    var x = item.sx + (carbon ? piece.traits.direction * 3.2 : 0);
    var y = item.sy + (carbon ? 2.4 : 0);
    return el("text", {
      x: x, y: y,
      "font-size": item.sfont,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      class: carbon ? "carbon-glyph" : "glyph",
      fill: carbon ? piece.colors.carbon : faceColor(piece, item),
      opacity: carbon ? 0.16 : item.opacity,
      "data-index": index,
      "data-family": item.face
    }, "");
  }

  // --- Ficha impresa dentro de la imagen -----------------------------------
  function formaLabel(piece) {
    var g = piece.geometry;
    var key = piece.meta.speciesKey;
    if (key === "escultura") return g.assembly + " · " + g.modules.join(" + ");
    if (key === "espera") return g.leftMorph + " / " + g.rightMorph;
    if (key === "entrelazada") return g.kind + " · " + g.bodies + " CUERPOS / " + g.crossings + " CRUCES";
    if (key === "noeuclidiana") return g.kind + " · " + g.portalCount + " PORTALES";
    if (key === "gramatica") {
      var genes = g.genealogy;
      return genes.footprint + " / " + genes.structure + " / " + genes.crown;
    }
    return "MASA VOXELAR / VANO EXCAVADO";
  }

  function upper(text) { return String(text).toLocaleUpperCase("es"); }

  function colophonLines(piece, seed) {
    return [
      { t: piece.traits.perspectiveClass + " · ERROR " + piece.traits.error + "% · UA/" + folio(seed), s: 9, o: 0.6 },
      { t: piece.meta.palette + " · " + piece.meta.color + " · " + piece.traits.temperature, s: 9, o: 0.6 },
      { t: upper(piece.meta.phrase), s: 12, o: 1 },
      { t: formaLabel(piece), s: 10, o: 0.72 },
      { t: upper(piece.meta.species), s: 10, o: 0.72 },
      { t: "ESPACIO ESCULTÓRICO", s: 11, o: 1 }
    ];
  }

  // Todo el texto vive en un colofón en la esquina inferior derecha.
  // La info de edición/serie NO se imprime: la administra el propio Verse.
  function addColophon(piece, seed) {
    var ink = piece.colors.frente;
    var rightX = SIZE - 54;
    var group = el("g", { class: "ficha", fill: ink, "text-anchor": "end" });

    // Líneas de abajo hacia arriba (la última que se dibuja queda más arriba).
    var lines = colophonLines(piece, seed);

    var y = SIZE - 46;
    lines.forEach(function (line) {
      group.appendChild(el("text", {
        x: rightX, y: y, "font-size": line.s, opacity: line.o, "letter-spacing": 0.6
      }, line.t));
      y -= line.s + 7;
    });

    // Acento: una regla corta sobre el bloque.
    group.appendChild(el("line", {
      x1: rightX - 176, y1: y + 5, x2: rightX, y2: y + 5, stroke: ink, "stroke-width": 1, opacity: 0.5
    }));

    var gifLink = el("a", {
      href: "#", class: "gif-link", "data-role": "gif-export",
      "aria-label": "Descargar la escritura de esta semilla como GIF"
    });
    gifLink.appendChild(el("text", {
      x: rightX, y: SIZE - 24, "font-size": 8, opacity: 0.34, "letter-spacing": 0.8
    }, "GIF ↘"));
    group.appendChild(gifLink);
    return group;
  }

  // --- Render --------------------------------------------------------------
  function render(piece, seed, edition) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    document.body.style.background = piece.colors.papel;
    svg.appendChild(el("title", { id: "tituloSvg" }, "Espacio escultórico generado por la semilla"));
    svg.appendChild(el("desc", { id: "descripcionSvg" },
      upper(piece.meta.species) + ", semilla UA/" + folio(seed) + ". " + formaLabel(piece) +
      ". Alfabeto " + piece.meta.alphabet.join(" ") + "."));
    svg.appendChild(el("rect", { width: SIZE, height: SIZE, fill: piece.colors.papel }));

    var nodes = { main: {}, carbon: {}, colophon: null };
    if (piece.traits.carbon) {
      var carbon = el("g", { id: "carbon-copy" });
      piece.surface.forEach(function (item, index) {
        if (!item.glyph) return;
        var node = glyphNode(piece, item, true, index);
        nodes.carbon[index] = node;
        carbon.appendChild(node);
      });
      svg.appendChild(carbon);
    }

    var building = el("g", { id: "edificio" });
    piece.surface.forEach(function (item, index) {
      if (!item.glyph) return;
      var node = glyphNode(piece, item, false, index);
      nodes.main[index] = node;
      building.appendChild(node);
    });
    svg.appendChild(building);

    nodes.colophon = addColophon(piece, seed);
    nodes.gifLink = nodes.colophon.querySelector("[data-role='gif-export']");
    nodes.colophon.classList.add("is-waiting");
    svg.appendChild(nodes.colophon);
    document.title = "UA/" + folio(seed) + " — " + upper(piece.meta.species);
    return nodes;
  }

  // --- Rasgos publicados para el metadato del token ------------------------
  function publishFeatures(piece, schedule) {
    var genes = piece.meta.speciesKey === "gramatica" ? piece.geometry.genealogy : null;
    window.$artifact = window.$artifact || {};
    window.$artifact.features = {
      "Especie": upper(piece.meta.species),
      "Forma": formaLabel(piece),
      "Alfabeto": piece.meta.palette,
      "Color": piece.meta.color,
      "Sistema cromático": piece.colors.generativa ? piece.colors.modo : "PALETA EDITADA",
      "Temperatura": piece.traits.temperature,
      "Perspectiva": piece.traits.perspectiveClass,
      "Volumen": piece.stats.volumetric ? "FRENTE / PROFUNDIDAD / CUBIERTA" : "SUPERFICIE",
      "Estructura": genes ? genes.structure : "—",
      "Vacío": genes ? genes.void : "—",
      "Cubierta": genes ? genes.crown : "—",
      "Escritura": (Math.round(schedule.durationMs / 100) / 10) + " S / " + schedule.correctedMistakes + " CORRECCIONES",
      "Copia carbón": piece.traits.carbon ? "Sí" : "No",
      "Anomalía": piece.palette.anomalia
    };
  }

  function revealFinal(piece, nodes) {
    piece.surface.forEach(function (item, index) {
      if (!item.glyph || !nodes.main[index]) return;
      nodes.main[index].textContent = item.glyph;
      if (nodes.carbon[index]) nodes.carbon[index].textContent = item.baseGlyph;
    });
  }

  function prefersStillImage() {
    var params = new URLSearchParams(window.location.search);
    if (params.get("still") === "1" || params.get("motion") === "off") return true;
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function signalReady() {
    if (typeof window.fxpreview === "function") { try { window.fxpreview(); } catch (e) {} }
    window.dispatchEvent(new Event("verse:ready"));
  }

  function connectGifExport(piece, seed, schedule, nodes) {
    if (!nodes.gifLink || !window.ARQ_GIF_EXPORTER) return;
    var label = nodes.gifLink.querySelector("text");
    var busy = false;
    nodes.gifLink.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (busy) return;
      busy = true;
      nodes.gifLink.classList.add("is-exporting");
      label.textContent = "GIF 0%";
      ARQ_GIF_EXPORTER.exportAnimation({
        piece: piece,
        schedule: schedule,
        faceColor: faceColor,
        colophon: { ink: piece.colors.frente, lines: colophonLines(piece, seed) },
        filename: "espacio-escultorico-UA-" + folio(seed) + ".gif",
        onProgress: function (progress) {
          label.textContent = "GIF " + Math.round(progress * 100) + "%";
        }
      }).then(function () {
        label.textContent = "GIF ✓";
      }).catch(function (error) {
        console.error(error);
        label.textContent = "GIF ×";
      }).finally(function () {
        window.setTimeout(function () {
          label.textContent = "GIF ↘";
          nodes.gifLink.classList.remove("is-exporting");
          busy = false;
        }, 1400);
      });
    });
  }

  function boot() {
    var input = readSeed();
    var piece = ARQ_MOTOR.build({ seed: input.hash });
    fitSquare(piece.surface);
    var schedule = ARQ_TYPEWRITER.createSchedule(piece, input.hash);
    var nodes = render(piece, input.hash, input.edition);
    publishFeatures(piece, schedule);
    connectGifExport(piece, input.hash, schedule, nodes);
    window.__ARQ_TYPEWRITER_SCHEDULE = schedule;

    var finish = function () {
      revealFinal(piece, nodes);
      nodes.colophon.classList.remove("is-waiting");
      // Un cuadro adicional garantiza que la captura vea también el colofón.
      window.requestAnimationFrame(signalReady);
    };
    if (prefersStillImage()) {
      window.requestAnimationFrame(finish);
      return;
    }
    ARQ_TYPEWRITER.play(schedule, function (event) {
      var node = nodes.main[event.index];
      if (node) node.textContent = event.value;
      if (event.kind === "correct" && nodes.carbon[event.index]) {
        nodes.carbon[event.index].textContent = piece.surface[event.index].baseGlyph;
      }
    }, finish);
  }

  // Esperamos a las fuentes para que la captura no salga con signos de reserva.
  if (document.fonts && document.fonts.ready) {
    var launched = false;
    var launch = function () { if (launched) return; launched = true; boot(); };
    document.fonts.ready.then(launch);
    window.setTimeout(launch, 1500);
  } else {
    boot();
  }
})();
