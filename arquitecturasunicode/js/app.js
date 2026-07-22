(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var $ = function (selector) { return document.querySelector(selector); };
  var svg = $("#lamina");
  var state = {
    seed: "",
    piece: null,
    mode: "retype",
    carbon: false,
    drawing: false,
    mutations: []
  };

  function svgElement(name, attributes, text) {
    var node = document.createElementNS(NS, name);
    Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function freshSeed() {
    var numbers = new Uint32Array(2);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(numbers);
    else { numbers[0] = Date.now() >>> 0; numbers[1] = Math.floor(Math.random() * 0xffffffff); }
    return "UA-" + numbers[0].toString(36).toUpperCase() + numbers[1].toString(36).toUpperCase().slice(0, 3);
  }

  function folio(seed) {
    return String(ARQ_AZAR.hashSeed(seed) % 1000000).padStart(6, "0");
  }

  function setMessage(text, temporary) {
    var message = $("#mensaje");
    message.textContent = text;
    if (temporary) {
      window.clearTimeout(setMessage.timer);
      setMessage.timer = window.setTimeout(function () {
        message.textContent = state.mode === "excavate"
          ? "ARRASTRAR SOBRE LOS SIGNOS: EXCAVAR"
          : "CLIC SOBRE UN SIGNO: RETIPAR";
      }, 1900);
    }
  }

  function readURL() {
    state.seed = new URLSearchParams(window.location.search).get("seed") || freshSeed();
  }

  function writeURL() {
    var params = new URLSearchParams();
    params.set("seed", state.seed);
    try {
      window.history.replaceState(null, "", window.location.pathname + "?" + params.toString() + window.location.hash);
    } catch (error) {
      // file:// puede bloquear la firma de la barra; no bloquea la pieza.
    }
  }

  function faceColor(item) {
    var colors = state.piece.colors;
    if (item.anomaly) return colors.anomalia;
    var face = item.face;
    if (item.body === "derecha" && state.piece.traits.alphabetRelation === "CARAS INVERTIDAS") {
      face = face === "frente" ? "lateral" : face === "lateral" ? "frente" : "techo";
    } else if (item.body === "derecha" && state.piece.traits.alphabetRelation === "TRADUCCIÓN MATERIAL") {
      face = face === "frente" ? "techo" : face === "techo" ? "frente" : "lateral";
    }
    return colors[face] || colors.frente;
  }

  function applyColors() {
    var colors = state.piece.colors;
    var paper = $("#papel");
    paper.style.setProperty("--papel", colors.papel);
    paper.style.setProperty("--tinta", colors.frente);
    paper.style.setProperty("--rojo", colors.anomalia);
    paper.style.setProperty("--azul-carbon", colors.carbon);
  }

  function addSvgDefinitions() {
    var defs = svgElement("defs");
    defs.appendChild(svgElement("style", {}, [
      "#edificio text, #carbon-copy text { font-family: 'Architecture Mono', 'Unicode Backup', 'Courier New', monospace; white-space: pre; }",
      "#carbon-copy text { opacity: .16; }"
    ].join("\n")));
    svg.appendChild(defs);
  }

  function renderGlyph(item, carbon, index) {
    var x = item.x + (carbon ? state.piece.traits.direction * 3.1 : 0);
    var y = item.y + (carbon ? 2.35 : 0);
    var attributes = {
      x: x,
      y: y,
      "font-size": item.fontSize,
      "text-anchor": "middle",
      "dominant-baseline": "central",
      class: carbon ? "carbon-glyph" : "glyph" + (item.anomaly ? " anomalia" : ""),
      "data-id": item.id,
      "data-voxel": item.voxel,
      "data-face": item.face,
      "data-body": item.body,
      "data-base": item.baseGlyph,
      "data-index": index,
      fill: carbon ? state.piece.colors.carbon : faceColor(item),
      opacity: carbon ? 0.16 : item.opacity
    };
    var text = svgElement("text", attributes, carbon ? item.baseGlyph : item.glyph);
    if (!carbon) {
      text.style.setProperty("--retraso", item.delay + "s");
      text.style.setProperty("--opacidad", item.opacity);
    }
    return text;
  }

  function renderPiece() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.appendChild(svgElement("rect", { width: 900, height: 1200, fill: state.piece.colors.papel }));
    addSvgDefinitions();

    var carbon = svgElement("g", { id: "carbon-copy" });
    carbon.style.display = state.carbon ? "" : "none";
    state.piece.surface.forEach(function (item, index) {
      if (item.glyph) carbon.appendChild(renderGlyph(item, true, index));
    });
    svg.appendChild(carbon);

    var building = svgElement("g", { id: "edificio" });
    state.piece.surface.forEach(function (item, index) {
      if (item.glyph) building.appendChild(renderGlyph(item, false, index));
    });
    svg.appendChild(building);

    svg.classList.toggle("modo-excavar", state.mode === "excavate");
    svg.classList.remove("escribiendo");
    void svg.getBoundingClientRect();
    svg.classList.add("escribiendo");

    $("#descripcionSvg").textContent = state.piece.meta.species + ", semilla " + state.seed +
      ". " + state.piece.geometry.kind + ". Alfabeto " + state.piece.meta.alphabet.join(" ") + ".";
  }

  function speciesTitle() {
    return state.piece.meta.species.toLocaleUpperCase("es");
  }

  function updateMetadata() {
    var piece = state.piece;
    var traits = piece.traits;
    var signature = folio(state.seed);
    var isWaiting = piece.meta.speciesKey === "espera";
    var isEntangled = piece.meta.speciesKey === "entrelazada";
    var isNonEuclidean = piece.meta.speciesKey === "noeuclidiana";
    var isGrammar = piece.meta.speciesKey === "gramatica";
    var genes = piece.geometry.genealogy;
    $("#reloj").textContent = "SEMILLA " + signature;
    $("#folioSemilla").textContent = "UA/" + signature;
    $("#tituloEspecie").textContent = speciesTitle();
    $("#especieCabecera").textContent = speciesTitle();
    $("#temperaturaCabecera").textContent = "TEMPERATURA " + traits.temperature;
    $("#fraseImpresa").textContent = piece.meta.phrase.toLocaleUpperCase("es");
    $("#firmaImpresa").textContent = piece.meta.palette + " / " + piece.meta.color + " / ERROR " + traits.error + "%";
    $("#lecturaPlano").textContent = "LA SEMILLA ORDENÓ: " + piece.meta.instructions.join(" · ") +
      ". " + (isWaiting
        ? traits.alphabetRelation
        : isEntangled ? piece.geometry.relation : isNonEuclidean ? piece.geometry.law
          : isGrammar ? piece.geometry.relation : piece.geometry.kind) + ".";
    $("#datoEspecie").textContent = isGrammar ? "GENEALOGÍA" : piece.meta.speciesKey.toLocaleUpperCase("es");
    $("#datoFormaI").textContent = isWaiting
      ? traits.leftMorph
      : isEntangled || isNonEuclidean ? piece.geometry.kind : isGrammar
        ? genes.footprint + " / " + genes.structure
        : "MASA VOXELAR";
    $("#datoFormaII").textContent = isWaiting ? traits.rightMorph : isEntangled
      ? piece.geometry.bodies + " CUERPOS / " + piece.geometry.crossings + " CRUCES"
      : isNonEuclidean
        ? piece.geometry.portalCount + " PORTALES / " + piece.geometry.curvatureClass
        : isGrammar ? genes.void + " / " + genes.crown
      : "VANO EXCAVADO";
    $("#datoRelacion").textContent = isWaiting
      ? traits.relation
      : isEntangled ? piece.geometry.relation : isNonEuclidean
        ? piece.geometry.law + " / " + piece.geometry.orientation
        : isGrammar ? genes.annex + " / " + genes.deformation
        : "INTERIOR / EXTERIOR";
    $("#datoCaracteres").textContent = piece.meta.alphabet.join("  ");
    $("#datoColor").textContent = piece.meta.color;
    $("#datoPerspectiva").textContent = traits.perspectiveClass + " / " + traits.perspective +
      (isNonEuclidean ? " / CURVA " + piece.geometry.curvature : isGrammar && genes.contamination !== "NINGUNA"
        ? " / " + genes.contamination : "");
    $("#datoTemperatura").textContent = traits.temperature;
    $("#datoSuperficie").textContent = piece.stats.visibleGlyphs + " SIGNOS";
    $("#datoVacio").textContent = Math.round(piece.stats.whitespace * 100) + "%";
    $("#datoMutaciones").textContent = state.mutations.length;
    document.title = "UA/" + signature + " — " + speciesTitle();
  }

  function updateModeButtons() {
    var retype = state.mode === "retype";
    $("#modoRetipar").classList.toggle("activo", retype);
    $("#modoRetipar").setAttribute("aria-pressed", String(retype));
    $("#modoExcavar").classList.toggle("activo", !retype);
    $("#modoExcavar").setAttribute("aria-pressed", String(!retype));
    svg.classList.toggle("modo-excavar", !retype);
    setMessage(retype ? "CLIC SOBRE UN SIGNO: RETIPAR" : "ARRASTRAR SOBRE LOS SIGNOS: EXCAVAR");
  }

  function setCarbon(value) {
    state.carbon = value;
    var group = $("#carbon-copy");
    if (group) group.style.display = value ? "" : "none";
    $("#carbon").classList.toggle("activo", value);
    $("#carbon").setAttribute("aria-pressed", String(value));
  }

  function generate() {
    state.piece = ARQ_MOTOR.build({ seed: state.seed });
    state.mutations = [];
    state.carbon = state.piece.traits.carbon;
    applyColors();
    renderPiece();
    updateMetadata();
    updateModeButtons();
    setCarbon(state.carbon);
    writeURL();
    setMessage(speciesTitle() + " / " + folio(state.seed), true);
  }

  function newSeed() {
    state.seed = freshSeed();
    generate();
  }

  function cycleGlyph(target) {
    if (!target || !target.classList.contains("glyph")) return;
    var palette = state.piece.palette;
    var cycle = [palette.frente, palette.lateral, palette.techo, palette.sombra, "·"];
    var before = target.textContent;
    var index = cycle.indexOf(before);
    var after = cycle[(index + 1 + cycle.length) % cycle.length];
    target.textContent = after;
    target.classList.remove("anomalia");
    target.setAttribute("fill", state.piece.colors[target.dataset.face] || state.piece.colors.frente);
    state.mutations.push({ order: state.mutations.length + 1, type: "retype", id: target.dataset.id, from: before, to: after });
    updateMetadata();
    setMessage(before + " → " + after, true);
  }

  function excavateVoxel(voxel) {
    if (!voxel) return;
    var already = state.mutations.some(function (mutation) { return mutation.type === "excavate" && mutation.voxel === voxel; });
    if (already) return;
    var removed = 0;
    svg.querySelectorAll("#edificio .glyph").forEach(function (node) {
      if (node.dataset.voxel === voxel && node.textContent) {
        node.dataset.erased = "true";
        node.textContent = "";
        removed += 1;
      }
    });
    if (!removed) return;
    state.mutations.push({ order: state.mutations.length + 1, type: "excavate", voxel: voxel, faces: removed });
    updateMetadata();
  }

  function setMode(mode) {
    state.mode = mode;
    updateModeButtons();
  }

  function currentSurface() {
    return state.piece.surface.map(function (item) {
      var node = svg.querySelector('#edificio .glyph[data-id="' + item.id + '"]');
      var copy = Object.assign({}, item);
      copy.glyph = node ? node.textContent : "";
      copy.manuallyErased = Boolean(node && node.dataset.erased === "true");
      return copy;
    });
  }

  function exportData() {
    return {
      meta: Object.assign({}, state.piece.meta, { folio: "UA/" + folio(state.seed), exportedAt: new Date().toISOString() }),
      parameters: state.piece.parameters,
      traits: state.piece.traits,
      interpretation: state.piece.interpretation,
      geometry: state.piece.geometry,
      colors: state.piece.colors,
      layout: state.piece.layout,
      stats: state.piece.stats,
      carbonCopy: state.carbon,
      interventions: state.mutations.slice(),
      surface: currentSurface()
    };
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function saveJSON() {
    download(new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" }),
      state.piece.meta.speciesKey + "-" + folio(state.seed) + ".json");
    setMessage("JSON GUARDADO: LA ARQUITECTURA RECUERDA LA MANO", true);
  }

  function arrayBufferToDataURL(buffer, mime) {
    var bytes = new Uint8Array(buffer);
    var binary = "";
    for (var i = 0; i < bytes.length; i += 0x8000) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
    }
    return "data:" + mime + ";base64," + btoa(binary);
  }

  async function loadFontData(path, mime) {
    try {
      var response = await fetch(path);
      if (!response.ok) throw new Error("font " + response.status);
      return arrayBufferToDataURL(await response.arrayBuffer(), mime);
    } catch (error) {
      return null;
    }
  }

  function addExportCaptions(clone) {
    var colors = state.piece.colors;
    var group = svgElement("g", { id: "ficha", fill: colors.frente, "font-family": "'Apercu Local', Arial, sans-serif" });
    var phraseSize = state.piece.meta.phrase.length > 84 ? 8 : state.piece.meta.phrase.length > 60 ? 10 : 12;
    group.appendChild(svgElement("line", { x1: 52, y1: 76, x2: 848, y2: 76, stroke: colors.frente, "stroke-width": 1 }));
    group.appendChild(svgElement("text", { x: 52, y: 58, "font-size": 12, "letter-spacing": 1.2 }, speciesTitle()));
    group.appendChild(svgElement("text", { x: 848, y: 58, "font-size": 12, "text-anchor": "end", "letter-spacing": 1.2 }, "UA/" + folio(state.seed)));
    group.appendChild(svgElement("line", { x1: 52, y1: 1112, x2: 848, y2: 1112, stroke: colors.frente, "stroke-width": 1 }));
    group.appendChild(svgElement("text", { x: 52, y: 1140, "font-size": phraseSize, "font-weight": 700, "letter-spacing": .8 }, state.piece.meta.phrase.toLocaleUpperCase("es")));
    group.appendChild(svgElement("text", { x: 848, y: 1166, "font-size": 9, "text-anchor": "end", opacity: .7, "letter-spacing": 1 },
      state.piece.meta.palette + " / " + state.piece.meta.color + " / " + state.piece.traits.temperature));
    clone.appendChild(group);
  }

  async function standaloneSVG() {
    var clone = svg.cloneNode(true);
    clone.removeAttribute("class");
    clone.setAttribute("xmlns", NS);
    clone.setAttribute("width", "900");
    clone.setAttribute("height", "1200");
    if (!state.carbon) {
      var carbon = clone.querySelector("#carbon-copy");
      if (carbon) carbon.remove();
    }
    var metadata = svgElement("metadata");
    metadata.textContent = JSON.stringify(exportData());
    clone.insertBefore(metadata, clone.firstChild);
    addExportCaptions(clone);

    var fonts = await Promise.all([
      loadFontData("fonts/Ac437_ApricotPortable.ttf", "font/ttf"),
      loadFontData("fonts/Symbola.otf", "font/otf"),
      loadFontData("fonts/Apercu.otf", "font/otf")
    ]);
    var style = clone.querySelector("defs style");
    var embedded = "";
    if (fonts[0]) embedded += "@font-face{font-family:'Architecture Mono';src:url('" + fonts[0] + "') format('truetype');}";
    if (fonts[1]) embedded += "@font-face{font-family:'Unicode Backup';src:url('" + fonts[1] + "') format('opentype');}";
    if (fonts[2]) embedded += "@font-face{font-family:'Apercu Local';src:url('" + fonts[2] + "') format('opentype');}";
    if (style) style.textContent = embedded + style.textContent;
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone);
  }

  async function saveSVG() {
    setMessage("PREPARANDO SVG AUTÓNOMO…");
    var content = await standaloneSVG();
    download(new Blob([content], { type: "image/svg+xml;charset=utf-8" }),
      state.piece.meta.speciesKey + "-" + folio(state.seed) + ".svg");
    setMessage("SVG GUARDADO: SIGNOS EDITABLES / FUENTES INCRUSTADAS", true);
  }

  async function copyURL() {
    writeURL();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("URL–POSTAL COPIADA", true);
    } catch (error) {
      window.prompt("Copia esta URL–postal:", window.location.href);
    }
  }

  svg.addEventListener("click", function (event) {
    if (state.mode === "retype") cycleGlyph(event.target);
  });
  svg.addEventListener("pointerdown", function (event) {
    if (state.mode !== "excavate" || !event.target.classList.contains("glyph")) return;
    state.drawing = true;
    svg.setPointerCapture(event.pointerId);
    excavateVoxel(event.target.dataset.voxel);
    event.preventDefault();
  });
  svg.addEventListener("pointermove", function (event) {
    if (!state.drawing || state.mode !== "excavate") return;
    var target = document.elementFromPoint(event.clientX, event.clientY);
    if (target && target.classList && target.classList.contains("glyph")) excavateVoxel(target.dataset.voxel);
  });
  window.addEventListener("pointerup", function () { state.drawing = false; });

  $("#nueva").addEventListener("click", newSeed);
  $("#modoRetipar").addEventListener("click", function () { setMode("retype"); });
  $("#modoExcavar").addEventListener("click", function () { setMode("excavate"); });
  $("#carbon").addEventListener("click", function () { setCarbon(!state.carbon); });
  $("#guardarSvg").addEventListener("click", saveSVG);
  $("#guardarJson").addEventListener("click", saveJSON);
  $("#copiarUrl").addEventListener("click", copyURL);

  window.addEventListener("keydown", function (event) {
    if (event.key.toLocaleLowerCase() === "n") newSeed();
    if (event.key.toLocaleLowerCase() === "e") setMode(state.mode === "excavate" ? "retype" : "excavate");
    if (event.key.toLocaleLowerCase() === "c") setCarbon(!state.carbon);
    if (event.key.toLocaleLowerCase() === "s") saveSVG();
    if (event.key.toLocaleLowerCase() === "j") saveJSON();
  });

  readURL();
  generate();
})();
