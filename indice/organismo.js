(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var seed = params.get("seed") || "organismo-" + Date.now().toString(36);
  var unicodeCanvas = document.getElementById("unicode-field");
  var unicodeCtx = unicodeCanvas.getContext("2d");
  var world = document.getElementById("cannibal-world");
  var speciesField = document.getElementById("species-field");
  var textField = document.getElementById("text-field");
  var rareWindows = document.getElementById("rare-windows");
  var glyphField = document.getElementById("glyph-field");
  var glyphs = document.getElementById("glyphs");
  var veinField = document.getElementById("vein-field");
  var veins = document.getElementById("veins");
  var wireField = document.getElementById("wire-field");
  var wires = document.getElementById("wires");
  var estratosFrame = document.getElementById("donor-estratos");
  var letrasFrame = document.getElementById("donor-letras");
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var palette = [
    "#050505", "#f8f7f1", "#ff4fa3", "#147bff", "#b7ff3c",
    "#ff652b", "#ffd400", "#5a2dff", "#00e5ff", "#ff1616",
    "#47251f", "#f3ead6", "#39d98a", "#cab43d", "#6f7a2c"
  ];
  var unicode = Array.from(
    "░▒▓█▄▀▌▐■□▪▫●○◌◍◎◆◇◈△▲▽▼◢◣◤◥⌇⌁⌖⌘⌗⌑⌂" +
    "∿≋≡≈∴∵∞∫∑√⊕⊗⊙⋮⋯↗↘↙↖←→↑↓⟁⟐⧉⧖" +
    "𐀀𐀁𐀂𐀃𐀄𐀅𐀆𐀇𐀈𐀉𐀊𐀋𐀌𐀍𐀎𐀏" +
    "𓀀𓁹𓂀𓃠𓆣𓇳𓊖𓋹𓍯𔐀𔐁𔐂𔐃" +
    "01{}[]<>/\\|:;,.+*-=¿?¡!atlRÍO"
  );
  var glyphFallback = Array.from("𐀀𐀁𐀂𐀃𓀀𓁹𓂀𔐀░▒▓█◯△⌇∿∞⟁𐇐");
  var blends = ["normal", "multiply", "screen", "difference", "exclusion", "hard-light"];
  var fonts = ["Apricot", "Symbola", "Electronics", "Lineal B", "Apercu", "monospace"];
  var sources = [
    { id: "estratos", href: "../estratos/index.html" },
    { id: "lasletras", href: "../lasletras/index.html" },
    { id: "otrorio", href: "../otrorio/index.html" },
    { id: "laberinto", href: "../laberinto/laberinto/index.html" },
    { id: "loop", href: "../poemario/loop-nave/index.html" },
    { id: "escape", href: "../escape/index.html" }
  ];
  var fallback = [
    "otra agua en el mismo río",
    "la página recuerda otra página",
    "una ventana olvida su pared",
    "la corriente piensa sin centro",
    "una célula contiene un cielo",
    "el documento también navega",
    "cables como algas",
    "lo ilegible es su futuro",
    "la forma duda de sí",
    "el texto cae fuera del texto",
    "un signo se salió de su escala",
    "lo mínimo repite lo inmenso"
  ];

  var random;
  var serial = 0;
  var phraseSerial = 0;
  var backgroundOffset = 0;
  var backgroundColor = "#f8f7f1";
  var backgroundInk = "#050505";
  var liveSpecies = [];
  var mutationTimer = 0;
  var backgroundTimer = 0;
  var liveTimer = 0;

  function hash32(value) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(value).length; i += 1) {
      h ^= String(value).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFor(value) {
    var state = hash32(value);
    return function () {
      var t = state += 0x6d2b79f5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function between(a, b) { return a + random() * (b - a); }
  function pick(list, fallbackValue) {
    return list && list.length ? list[Math.floor(random() * list.length)] : fallbackValue;
  }

  function donorDocument(frame) {
    try { return frame.contentDocument || frame.contentWindow.document; }
    catch (error) { return null; }
  }

  function estratosCanvas() {
    var doc = donorDocument(estratosFrame);
    return doc && doc.querySelector("#world");
  }

  function letrasSvg() {
    var doc = donorDocument(letrasFrame);
    return doc && doc.querySelector("#lamina");
  }

  function corpus() {
    var root = window.LAB_CORPUS || {};
    var writing = root.escrituras || {};
    return []
      .concat(root.monumentales || [])
      .concat(root.fragmentos || [])
      .concat(root.microtextos || [])
      .concat(root.ventanas || [])
      .concat(root.codigo || [])
      .concat(writing.literaria || [])
      .concat(writing.visual || [])
      .concat(writing.fauxCodigo || [])
      .concat(fallback);
  }

  function phrase(salt) {
    var pool = corpus();
    return pool[hash32(seed + ":" + salt + ":" + phraseSerial) % pool.length] || fallback[0];
  }

  function source(id) {
    if (id) {
      var found = sources.find(function (item) { return item.id === id; });
      if (found) return found;
    }
    return pick(sources, sources[0]);
  }

  function worldHeight() {
    return Math.max(world.offsetHeight, innerHeight * 2.5, 1600);
  }

  function chooseBackground() {
    backgroundColor = pick(palette);
    var others = palette.filter(function (color) { return color !== backgroundColor; });
    backgroundInk = pick(others);
    document.documentElement.style.setProperty("--background", backgroundColor);
    document.documentElement.style.setProperty("--background-ink", backgroundInk);
    document.body.style.backgroundColor = backgroundColor;
    drawUnicode(true);
  }

  function resize() {
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    unicodeCanvas.width = Math.round(innerWidth * dpr);
    unicodeCanvas.height = Math.round(innerHeight * dpr);
    unicodeCanvas.style.width = innerWidth + "px";
    unicodeCanvas.style.height = innerHeight + "px";
    unicodeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var height = worldHeight();
    glyphField.setAttribute("viewBox", "0 0 " + innerWidth + " " + height);
    veinField.setAttribute("viewBox", "0 0 " + innerWidth + " " + height);
    wireField.setAttribute("viewBox", "0 0 " + innerWidth + " " + height);
    drawUnicode(true);
  }

  function drawUnicode(force) {
    if (!force && reduceMotion) return;
    unicodeCtx.clearRect(0, 0, innerWidth, innerHeight);
    unicodeCtx.fillStyle = backgroundInk;
    unicodeCtx.textBaseline = "top";
    var base = innerWidth < 720 ? 12 : 16;
    var rowHeight = base * 1.12;
    var columns = Math.ceil(innerWidth / (base * .72)) + 4;
    var rows = Math.ceil(innerHeight / rowHeight) + 4;
    backgroundOffset = (backgroundOffset + (force ? 0 : 1)) % columns;
    for (var y = -2; y < rows; y += 1) {
      for (var x = -2; x < columns; x += 1) {
        var salt = hash32(seed + ":" + (x + backgroundOffset) + ":" + y);
        var glyph = unicode[salt % unicode.length];
        var size = salt % 97 === 0 ? base * 4.5 : salt % 29 === 0 ? base * 2 : base;
        unicodeCtx.font = (salt % 8 === 0 ? "700 " : "400 ") + size + "px Apricot, Symbola, monospace";
        unicodeCtx.globalAlpha = salt % 13 === 0 ? .78 : .18 + (salt % 37) / 100;
        unicodeCtx.fillText(
          glyph,
          x * base * .72 + (y % 2) * base * .24,
          y * rowHeight + (salt % 5)
        );
      }
    }
    unicodeCtx.globalAlpha = 1;
  }

  function cropSpec(salt) {
    return {
      sx: hash32(seed + ":sx:" + salt) % 610,
      sy: hash32(seed + ":sy:" + salt) % 860,
      sw: 70 + hash32(seed + ":sw:" + salt) % 260,
      sh: 70 + hash32(seed + ":sh:" + salt) % 320
    };
  }

  function recolorCrop(target, salt, color, preserve) {
    var donor = estratosCanvas();
    var box = target.getBoundingClientRect();
    var width = Math.max(42, Math.round(box.width));
    var height = Math.max(42, Math.round(box.height));
    var scale = Math.min(1.25, devicePixelRatio || 1);
    target.width = Math.round(width * scale);
    target.height = Math.round(height * scale);
    var targetCtx = target.getContext("2d", { willReadFrequently: true });
    targetCtx.setTransform(scale, 0, 0, scale, 0, 0);
    targetCtx.clearRect(0, 0, width, height);

    if (!donor || !donor.width) {
      targetCtx.strokeStyle = color;
      targetCtx.lineWidth = Math.max(1, width / 90);
      targetCtx.beginPath();
      for (var f = 0; f < 18; f += 1) {
        var angle = f / 18 * Math.PI * 2;
        var radius = width * (.12 + (f % 6) / 11);
        targetCtx.lineTo(width / 2 + Math.cos(angle) * radius, height / 2 + Math.sin(angle) * radius);
      }
      targetCtx.stroke();
      return;
    }

    var crop = cropSpec(salt);
    var temp = document.createElement("canvas");
    temp.width = Math.max(1, Math.round(width * scale));
    temp.height = Math.max(1, Math.round(height * scale));
    var tempCtx = temp.getContext("2d", { willReadFrequently: true });
    try {
      tempCtx.drawImage(
        donor,
        crop.sx % Math.max(1, donor.width - crop.sw),
        crop.sy % Math.max(1, donor.height - crop.sh),
        crop.sw, crop.sh,
        0, 0, temp.width, temp.height
      );
      var image = tempCtx.getImageData(0, 0, temp.width, temp.height);
      var data = image.data;
      var corners = [
        0,
        (temp.width - 1) * 4,
        (temp.height - 1) * temp.width * 4,
        (temp.height * temp.width - 1) * 4
      ];
      var bg = [0, 0, 0];
      corners.forEach(function (index) {
        bg[0] += data[index];
        bg[1] += data[index + 1];
        bg[2] += data[index + 2];
      });
      bg = bg.map(function (value) { return value / corners.length; });
      var rgb = hexToRgb(color);
      for (var i = 0; i < data.length; i += 4) {
        var distance = Math.sqrt(
          Math.pow(data[i] - bg[0], 2) +
          Math.pow(data[i + 1] - bg[1], 2) +
          Math.pow(data[i + 2] - bg[2], 2)
        );
        var alpha = Math.max(0, Math.min(255, (distance - 11) * 7));
        data[i + 3] = Math.min(data[i + 3], alpha);
        if (!preserve) {
          data[i] = rgb[0];
          data[i + 1] = rgb[1];
          data[i + 2] = rgb[2];
        }
      }
      tempCtx.putImageData(image, 0, 0);
      targetCtx.drawImage(temp, 0, 0, width, height);
    } catch (error) {
      targetCtx.drawImage(donor, 0, 0, width, height);
    }
  }

  function hexToRgb(hex) {
    var clean = String(hex).replace("#", "");
    if (clean.length === 3) clean = clean.split("").map(function (char) { return char + char; }).join("");
    var value = parseInt(clean, 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function createSpecies(large) {
    serial += 1;
    var salt = serial;
    var donor = source("estratos");
    var link = document.createElement("a");
    link.className = "species";
    link.href = donor.href;
    link.setAttribute("aria-label", "Abrir Estratos");
    var width = between(large ? 260 : 35, large ? Math.min(900, innerWidth * .8) : Math.min(430, innerWidth * .48));
    link.style.setProperty("--x", between(-12, 94).toFixed(2) + "vw");
    link.style.setProperty("--y", between(-80, worldHeight() - 150).toFixed(0) + "px");
    link.style.setProperty("--w", width.toFixed(0) + "px");
    link.style.setProperty("--h", (width * between(.45, 1.45)).toFixed(0) + "px");
    link.style.setProperty("--z", String(2 + salt % 110));
    link.style.setProperty("--color", pick(palette));
    link.style.setProperty("--r", between(-70, 70).toFixed(2) + "deg");
    link.style.setProperty("--scale-x", between(.55, 2.2).toFixed(2));
    link.style.setProperty("--scale-y", between(.55, 2.2).toFixed(2));
    link.style.setProperty("--origin", pick(["0 0", "50% 50%", "100% 0"]));
    link.style.setProperty("--blend", pick(blends));
    link.style.setProperty("--shadow", pick(palette));
    link.style.setProperty("--shadow-x", between(-14, 18).toFixed(0) + "px");
    link.style.setProperty("--shadow-y", between(-14, 18).toFixed(0) + "px");
    link.style.setProperty("--duration", between(5, 31).toFixed(1) + "s");
    link.style.setProperty("--delay", between(-25, 0).toFixed(1) + "s");
    link.style.setProperty("--xa", between(-30, 20).toFixed(0) + "px");
    link.style.setProperty("--ya", between(-24, 20).toFixed(0) + "px");
    link.style.setProperty("--xb", between(-20, 55).toFixed(0) + "px");
    link.style.setProperty("--yb", between(-20, 65).toFixed(0) + "px");
    link.style.setProperty("--ra", between(-4, 4).toFixed(1) + "deg");
    link.style.setProperty("--rb", between(-6, 6).toFixed(1) + "deg");
    var canvas = document.createElement("canvas");
    link.appendChild(canvas);
    speciesField.appendChild(link);
    var color = link.style.getPropertyValue("--color");
    requestAnimationFrame(function () { recolorCrop(canvas, salt, color, salt % 7 === 0); });
    if (salt % 3 === 0) liveSpecies.push({ canvas: canvas, salt: salt, color: color });
    return link;
  }

  function glyphPool() {
    var donor = letrasSvg();
    if (!donor) return glyphFallback;
    var found = Array.prototype.slice.call(donor.querySelectorAll("text"))
      .map(function (node) { return node.textContent.trim(); })
      .filter(Boolean);
    return found.length ? found : glyphFallback;
  }

  function createGlyph(index, forcedLarge) {
    var ns = "http://www.w3.org/2000/svg";
    var pool = glyphPool();
    var value = pick(pool, pick(glyphFallback));
    if (value.length > 14 && random() < .75) value = Array.from(value)[index % Array.from(value).length];
    var anchor = document.createElementNS(ns, "a");
    anchor.classList.add("glyph-link");
    anchor.setAttribute("href", "../lasletras/index.html");
    anchor.setAttribute("aria-label", "Abrir Espacio Escultórico");
    var text = document.createElementNS(ns, "text");
    text.classList.add("glyph-unit");
    var x = between(-40, innerWidth + 40);
    var y = between(-50, worldHeight() + 50);
    var chance = random();
    var size = forcedLarge ? between(180, 620) : chance < .3 ? between(3, 14) : chance < .84 ? between(15, 95) : between(110, 390);
    text.setAttribute("x", x.toFixed(1));
    text.setAttribute("y", y.toFixed(1));
    text.setAttribute("transform", "rotate(" + between(-100, 100).toFixed(1) + " " + x.toFixed(1) + " " + y.toFixed(1) + ")");
    text.style.setProperty("--fill", pick(palette));
    text.style.setProperty("--stroke", random() < .32 ? pick(palette) : "transparent");
    text.style.setProperty("--stroke-width", random() < .32 ? between(.5, 5).toFixed(1) + "px" : "0px");
    text.style.setProperty("--font", pick(fonts));
    text.style.setProperty("--size", size.toFixed(1) + "px");
    text.style.setProperty("--opacity", between(.35, 1).toFixed(2));
    text.style.setProperty("--blend", pick(blends));
    text.style.setProperty("--duration", between(4, 29).toFixed(1) + "s");
    text.style.setProperty("--delay", between(-24, 0).toFixed(1) + "s");
    text.style.setProperty("--steps", String(2 + Math.floor(random() * 8)));
    text.style.setProperty("--xa", between(-20, 15).toFixed(0) + "px");
    text.style.setProperty("--ya", between(-20, 15).toFixed(0) + "px");
    text.style.setProperty("--xb", between(-15, 45).toFixed(0) + "px");
    text.style.setProperty("--yb", between(-15, 55).toFixed(0) + "px");
    text.style.setProperty("--ra", between(-12, 5).toFixed(1) + "deg");
    text.style.setProperty("--rb", between(-5, 14).toFixed(1) + "deg");
    text.style.setProperty("--sa", between(.72, 1.12).toFixed(2));
    text.style.setProperty("--sb", between(.88, 1.45).toFixed(2));
    text.textContent = value;
    anchor.appendChild(text);
    glyphs.appendChild(anchor);
  }

  function createPhrase(large) {
    phraseSerial += 1;
    var donor = source();
    var node = document.createElement(random() < .76 ? "a" : "span");
    node.className = "phrase";
    if (node.tagName === "A") node.href = donor.href;
    var roll = random();
    if (roll < .22) node.classList.add("tiny");
    if (roll > .9) node.classList.add("vertical");
    var size = large ? between(10, 24) : roll < .22 ? between(.45, 1.35) : between(1.6, 10);
    node.style.setProperty("--x", between(-15, 90).toFixed(2) + "vw");
    node.style.setProperty("--y", between(-70, worldHeight() - 100).toFixed(0) + "px");
    node.style.setProperty("--w", between(250, Math.max(400, innerWidth * .9)).toFixed(0) + "px");
    node.style.setProperty("--z", String(30 + phraseSerial % 150));
    node.style.setProperty("--color", pick(palette));
    node.style.setProperty("--size", size.toFixed(2) + "vw");
    node.style.setProperty("--weight", String((4 + Math.floor(random() * 6)) * 100));
    node.style.setProperty("--tracking", between(-.08, .2).toFixed(3) + "em");
    node.style.setProperty("--case", pick(["uppercase", "lowercase", "none"]));
    node.style.setProperty("--blend", pick(blends));
    node.style.setProperty("--r", between(-55, 55).toFixed(2) + "deg");
    node.style.setProperty("--stretch", between(.55, 1.9).toFixed(2));
    node.style.setProperty("--stroke", random() < .28 ? pick(palette) : "transparent");
    node.style.setProperty("--stroke-width", random() < .28 ? between(1, 5).toFixed(1) + "px" : "0px");
    node.style.setProperty("--duration", between(8, 34).toFixed(1) + "s");
    node.style.setProperty("--delay", between(-28, 0).toFixed(1) + "s");
    node.style.setProperty("--xa", between(-40, 15).toFixed(0) + "px");
    node.style.setProperty("--ya", between(-25, 15).toFixed(0) + "px");
    node.style.setProperty("--xb", between(-15, 90).toFixed(0) + "px");
    node.style.setProperty("--yb", between(-15, 120).toFixed(0) + "px");
    textField.appendChild(node);
    typeText(node, phrase("phrase-" + phraseSerial), large ? 18 : 30);
  }

  function typeText(node, value, speed) {
    if (reduceMotion) {
      node.textContent = value;
      return;
    }
    var index = 0;
    function write() {
      if (!node.isConnected) return;
      node.textContent = value.slice(0, index);
      index += index % 8 === 0 ? 2 : 1;
      if (index <= value.length) setTimeout(write, speed + Math.random() * speed);
    }
    write();
  }

  function curve() {
    var height = worldHeight();
    return [
      "M", between(-50, innerWidth + 50).toFixed(0), between(-20, height * .2).toFixed(0),
      "C", between(-innerWidth * .2, innerWidth * 1.2).toFixed(0), between(height * .1, height * .5).toFixed(0),
      between(-innerWidth * .2, innerWidth * 1.2).toFixed(0), between(height * .4, height * .8).toFixed(0),
      between(-50, innerWidth + 50).toFixed(0), between(height * .75, height + 50).toFixed(0)
    ].join(" ");
  }

  function createVein(index) {
    var ns = "http://www.w3.org/2000/svg";
    var donor = source();
    var group = document.createElementNS(ns, "g");
    group.classList.add("vein");
    group.style.setProperty("--color", pick(palette));
    group.style.setProperty("--width", between(.6, index % 5 === 0 ? 5 : 2.2).toFixed(1) + "px");
    group.style.setProperty("--dash", between(1, 8).toFixed(0) + " " + between(4, 24).toFixed(0));
    group.style.setProperty("--duration", between(9, 32).toFixed(1) + "s");
    group.style.setProperty("--type-size", between(8, index % 4 === 0 ? 21 : 13).toFixed(1) + "px");
    var id = "vein-" + index;
    var d = curve();
    var anchor = document.createElementNS(ns, "a");
    anchor.setAttribute("href", donor.href);
    var line = document.createElementNS(ns, "path");
    line.setAttribute("id", id);
    line.setAttribute("class", "line");
    line.setAttribute("d", d);
    var hit = document.createElementNS(ns, "path");
    hit.setAttribute("class", "hit");
    hit.setAttribute("d", d);
    var text = document.createElementNS(ns, "text");
    var textPath = document.createElementNS(ns, "textPath");
    textPath.setAttribute("href", "#" + id);
    textPath.setAttribute("startOffset", between(0, 55).toFixed(0) + "%");
    var p = phrase("vein-" + index);
    textPath.textContent = (p + " ◇ ").repeat(3);
    text.appendChild(textPath);
    anchor.append(line, hit, text);
    group.appendChild(anchor);
    veins.appendChild(group);
  }

  function createWire(index) {
    var ns = "http://www.w3.org/2000/svg";
    var line = document.createElementNS(ns, index % 4 === 0 ? "polygon" : "polyline");
    var points = [];
    var cx = between(-80, innerWidth + 80);
    var cy = between(-80, worldHeight() + 80);
    for (var i = 0; i < 4 + index % 8; i += 1) {
      points.push((cx + between(-190, 190)).toFixed(0) + "," + (cy + between(-190, 190)).toFixed(0));
    }
    line.setAttribute("class", "wire");
    line.setAttribute("points", points.join(" "));
    line.style.setProperty("--color", pick(palette));
    line.style.setProperty("--width", between(.4, index % 7 === 0 ? 4 : 1.8).toFixed(1) + "px");
    line.style.setProperty("--opacity", between(.25, .8).toFixed(2));
    line.style.setProperty("--duration", between(4, 18).toFixed(1) + "s");
    wires.appendChild(line);
  }

  function rareWindow() {
    if (random() > .55) return;
    var article = document.createElement("article");
    article.className = "rare-window";
    article.style.setProperty("--x", between(3, 78).toFixed(1) + "vw");
    article.style.setProperty("--y", between(20, worldHeight() - 280).toFixed(0) + "px");
    article.style.setProperty("--w", between(150, Math.min(420, innerWidth * .55)).toFixed(0) + "px");
    article.style.setProperty("--h", between(110, 320).toFixed(0) + "px");
    article.style.setProperty("--fg", pick(palette));
    article.style.setProperty("--bg", pick(palette));
    article.style.setProperty("--shadow", pick(palette));
    article.style.setProperty("--r", between(-9, 9).toFixed(1) + "deg");
    var header = document.createElement("header");
    header.textContent = "□  ×";
    var link = document.createElement("a");
    link.href = "../estratos/index.html";
    var canvas = document.createElement("canvas");
    link.appendChild(canvas);
    article.append(header, link);
    rareWindows.appendChild(article);
    requestAnimationFrame(function () { recolorCrop(canvas, serial + 700, pick(palette), false); });
  }

  function refreshGlyphs() {
    glyphs.replaceChildren();
    var count = innerWidth < 720 ? 55 : 95;
    for (var i = 0; i < count; i += 1) createGlyph(i, i % 47 === 0);
  }

  function digest() {
    serial = 0;
    phraseSerial = 0;
    liveSpecies = [];
    random = rngFor(seed + ":" + Date.now());
    speciesField.replaceChildren();
    textField.replaceChildren();
    rareWindows.replaceChildren();
    glyphs.replaceChildren();
    veins.replaceChildren();
    wires.replaceChildren();
    chooseBackground();
    var mobile = innerWidth < 720;
    for (var s = 0; s < (mobile ? 15 : 24); s += 1) createSpecies(s % 11 === 0);
    refreshGlyphs();
    for (var p = 0; p < (mobile ? 7 : 10); p += 1) createPhrase(p % 6 === 0);
    for (var v = 0; v < (mobile ? 3 : 4); v += 1) createVein(v);
    for (var w = 0; w < (mobile ? 4 : 7); w += 1) createWire(w);
    rareWindow();
  }

  function mutate() {
    var roll = random();
    if (roll < .12) chooseBackground();
    else if (roll < .45) createSpecies(random() < .12);
    else if (roll < .68) createGlyph(serial + phraseSerial, random() < .04);
    else if (roll < .88) createPhrase(random() < .18);
    else createWire(serial + phraseSerial);
    if (speciesField.children.length > 38) speciesField.children[0].remove();
    if (glyphs.children.length > 145) glyphs.children[0].remove();
    if (textField.children.length > 18) textField.children[0].remove();
    if (wires.children.length > 13) wires.children[0].remove();
  }

  function refreshLiveSpecies() {
    liveSpecies.slice(0, 15).forEach(function (item, index) {
      if (item.canvas.isConnected) recolorCrop(item.canvas, item.salt + backgroundOffset + index, item.color, item.salt % 7 === 0);
    });
  }

  function loadDonors() {
    estratosFrame.src = "../estratos/index.html?seed=" + encodeURIComponent(seed + "-paisaje");
    letrasFrame.src = "../lasletras/index.html?seed=" + encodeURIComponent(seed + "-caracteres");
    estratosFrame.addEventListener("load", function () {
      setTimeout(refreshLiveSpecies, 900);
    }, { once: true });
    letrasFrame.addEventListener("load", function () {
      setTimeout(refreshGlyphs, 1300);
    }, { once: true });
  }

  function init() {
    random = rngFor(seed);
    loadDonors();
    resize();
    digest();
    document.getElementById("regenerate").addEventListener("click", digest);
    addEventListener("resize", resize);
    document.addEventListener("keydown", function (event) {
      if (event.key.toLowerCase() === "r") digest();
      if (event.key.toLowerCase() === "c") createSpecies(true);
      if (event.key.toLowerCase() === "g") createGlyph(serial + phraseSerial, true);
      if (event.key.toLowerCase() === "t") createPhrase(true);
    });
    world.addEventListener("dblclick", function (event) {
      if (!event.target.closest("a,button")) createSpecies(true);
    });
    mutationTimer = setInterval(mutate, reduceMotion ? 12000 : 4300);
    backgroundTimer = setInterval(function () { drawUnicode(false); }, reduceMotion ? 15000 : 1150);
    liveTimer = setInterval(refreshLiveSpecies, reduceMotion ? 16000 : 2600);
  }

  addEventListener("pagehide", function () {
    clearInterval(mutationTimer);
    clearInterval(backgroundTimer);
    clearInterval(liveTimer);
  }, { once: true });

  init();
})();
