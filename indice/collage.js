(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var seed = params.get("seed") || "desborde-" + Date.now().toString(36);
  var field = document.getElementById("strata-field");
  var ctx = field.getContext("2d");
  var world = document.getElementById("cannibal-world");
  var collage = document.getElementById("collage");
  var textField = document.getElementById("text-field");
  var rareWindows = document.getElementById("rare-windows");
  var veinField = document.getElementById("vein-field");
  var veins = document.getElementById("veins");
  var wireField = document.getElementById("wire-field");
  var wires = document.getElementById("wires");
  var estratosFrame = document.getElementById("donor-estratos");
  var letrasFrame = document.getElementById("donor-letras");
  var reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var serial = 0;
  var textSerial = 0;
  var tileSerial = 0;
  var tiles = [];
  var liveCanvases = [];
  var palette = [
    "#050505", "#f8f7f1", "#ff4fa3", "#147bff", "#b7ff3c",
    "#ff652b", "#ffd400", "#5a2dff", "#00e5ff", "#ff1616",
    "#6f7a2c", "#f3ead6", "#39d98a", "#cab43d", "#47251f"
  ];
  var blends = ["normal", "multiply", "screen", "difference", "hard-light", "exclusion", "color-burn"];
  var clips = [
    "polygon(0 7%, 82% 0, 100% 74%, 67% 100%, 4% 83%)",
    "polygon(12% 0, 100% 11%, 82% 100%, 0 76%)",
    "polygon(0 0, 100% 17%, 91% 91%, 19% 100%, 7% 53%)",
    "polygon(20% 0, 100% 0, 78% 100%, 0 84%)",
    "polygon(0 22%, 76% 0, 100% 42%, 64% 100%, 8% 79%)",
    "circle(48% at 51% 49%)",
    "ellipse(48% 29% at 50% 50%)",
    "polygon(50% 0, 100% 100%, 0 78%)",
    "inset(0 0 0 0)"
  ];
  var sources = [
    { id: "estratos", href: "../estratos/index.html", type: "canvas" },
    { id: "letras", href: "../lasletras/index.html", type: "svg" },
    { id: "rio", href: "../otrorio/index.html", type: "iframe" },
    { id: "laberinto", href: "../laberinto/laberinto/index.html", type: "iframe" },
    { id: "loop", href: "../poemario/loop-nave/index.html", type: "iframe" },
    { id: "escape", href: "../escape/index.html", type: "iframe" }
  ];
  var fallback = [
    "OTRA AGUA EN EL MISMO RÍO",
    "LA PÁGINA RECUERDA OTRA PÁGINA",
    "EL FONDO NO PROVIENE DEL FONDO",
    "UNA VENTANA OLVIDA SU PARED",
    "LA CORRIENTE PIENSA SIN CENTRO",
    "UNA CÉLULA CONTIENE UN CIELO",
    "EL DOCUMENTO TAMBIÉN NAVEGA",
    "CABLES COMO ALGAS",
    "LO ILEGIBLE ES SU FUTURO",
    "LA FORMA DUDA DE SÍ",
    "VENTANA MADRE DESCONOCIDA",
    "EL TEXTO CAE FUERA DEL TEXTO",
    "MIL PAISAJES USAN EL MISMO ERROR"
  ];

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

  var random = rngFor(seed);
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

  function estratosOverlay() {
    var doc = donorDocument(estratosFrame);
    return doc && doc.querySelector("#overlay");
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
    return pool[hash32(seed + ":" + salt + ":" + textSerial) % pool.length] || fallback[0];
  }

  function source(type) {
    var pool = type ? sources.filter(function (item) { return item.type === type; }) : sources;
    return pick(pool.length ? pool : sources, sources[0]);
  }

  function setBackground() {
    var colors = palette.slice();
    document.documentElement.style.setProperty("--bg-1", pick(colors));
    document.documentElement.style.setProperty("--bg-2", pick(colors));
    document.documentElement.style.setProperty("--bg-3", pick(colors));
    document.documentElement.style.setProperty("--bg-angle", between(0, 360).toFixed(0) + "deg");
    field.style.mixBlendMode = pick(["hard-light", "difference", "multiply", "screen", "exclusion"], "hard-light");
    document.body.style.backgroundColor = pick(colors);
  }

  function resize() {
    var dpr = Math.min(devicePixelRatio || 1, 1.5);
    field.width = Math.round(innerWidth * dpr);
    field.height = Math.round(innerHeight * dpr);
    field.style.width = innerWidth + "px";
    field.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var fullHeight = Math.max(innerHeight * (innerWidth < 720 ? 3.4 : 2.6), 1700);
    veinField.setAttribute("viewBox", "0 0 " + innerWidth + " " + fullHeight);
    wireField.setAttribute("viewBox", "0 0 " + innerWidth + " " + fullHeight);
    makeTiles();
  }

  function makeTiles() {
    tiles = [];
    var count = innerWidth < 720 ? 360 : 1000;
    var base = Math.max(7, Math.sqrt(innerWidth * innerHeight / count));
    for (var i = 0; i < count; i += 1) {
      tiles.push({
        x: between(-40, innerWidth + 20),
        y: between(-40, innerHeight + 20),
        w: base * between(.35, 5.2),
        h: base * between(.3, 4.4),
        sx: between(0, 680),
        sy: between(0, 950),
        sw: between(18, 260),
        sh: between(18, 310),
        alpha: between(.08, .84),
        blend: pick(["source-over", "screen", "difference", "multiply", "hard-light"]),
        phase: between(0, Math.PI * 2),
        speed: between(.00008, .00052)
      });
    }
  }

  function mutateTiles() {
    for (var i = 0; i < Math.max(4, tiles.length * .035); i += 1) {
      var tile = pick(tiles);
      tile.sx = between(0, 680);
      tile.sy = between(0, 950);
      tile.x += between(-100, 100);
      tile.y += between(-80, 80);
      tile.blend = pick(["source-over", "screen", "difference", "multiply", "hard-light"]);
    }
  }

  function fallbackTile(tile, time) {
    ctx.strokeStyle = pick(palette);
    ctx.lineWidth = between(.4, 2.4);
    ctx.beginPath();
    ctx.moveTo(tile.x, tile.y);
    ctx.lineTo(tile.x + tile.w * .2, tile.y + tile.h);
    ctx.lineTo(tile.x + tile.w, tile.y + Math.sin(time * tile.speed) * tile.h);
    ctx.stroke();
  }

  function drawBackground(time) {
    requestAnimationFrame(drawBackground);
    if (reduceMotion && tileSerial++ % 40) return;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    var donor = estratosCanvas();
    var overlay = estratosOverlay();
    for (var i = 0; i < tiles.length; i += 1) {
      var tile = tiles[i];
      var pulse = Math.sin(time * tile.speed + tile.phase);
      ctx.save();
      ctx.globalAlpha = tile.alpha * (.72 + pulse * .24);
      ctx.globalCompositeOperation = tile.blend;
      if (donor && donor.width) {
        try {
          ctx.drawImage(
            donor,
            tile.sx % Math.max(1, donor.width - tile.sw),
            tile.sy % Math.max(1, donor.height - tile.sh),
            tile.sw, tile.sh,
            tile.x + pulse * 8, tile.y - pulse * 5,
            tile.w, tile.h
          );
          if (overlay && i % 31 === 0) {
            ctx.drawImage(overlay, tile.x, tile.y, tile.w, tile.h);
          }
        } catch (error) { fallbackTile(tile, time); }
      } else fallbackTile(tile, time);
      ctx.restore();
    }
  }

  function shardStyle(node, extraLarge) {
    var fullHeight = world.offsetHeight || innerHeight * 2.6;
    node.style.setProperty("--x", between(-12, 92).toFixed(2) + "vw");
    node.style.setProperty("--y", between(-120, fullHeight - 180).toFixed(0) + "px");
    node.style.setProperty("--w", between(extraLarge ? 280 : 75, extraLarge ? Math.min(960, innerWidth * .88) : Math.min(620, innerWidth * .68)).toFixed(0) + "px");
    node.style.setProperty("--h", between(extraLarge ? 220 : 58, extraLarge ? 690 : 480).toFixed(0) + "px");
    node.style.setProperty("--z", String(2 + serial % 120));
    node.style.setProperty("--r", between(-37, 37).toFixed(2) + "deg");
    node.style.setProperty("--skew-x", between(-10, 10).toFixed(2) + "deg");
    node.style.setProperty("--skew-y", between(-5, 5).toFixed(2) + "deg");
    node.style.setProperty("--origin", pick(["0 0", "50% 50%", "100% 0", "20% 80%"]));
    node.style.setProperty("--clip", pick(clips));
    node.style.setProperty("--blend", pick(blends));
    node.style.setProperty("--fg", pick(palette));
    node.style.setProperty("--bg", pick(palette));
    node.style.setProperty("--shadow", pick(palette));
    node.style.setProperty("--hue", between(-110, 145).toFixed(1) + "deg");
    node.style.setProperty("--sat", between(.7, 2.7).toFixed(2));
    node.style.setProperty("--contrast", between(.75, 1.9).toFixed(2));
    node.style.setProperty("--duration", between(5, 37).toFixed(2) + "s");
    node.style.setProperty("--delay", between(-28, 0).toFixed(2) + "s");
  }

  function paintCanvas(target, salt) {
    var box = target.getBoundingClientRect();
    var width = Math.max(80, box.width);
    var height = Math.max(60, box.height);
    var dpr = Math.min(devicePixelRatio || 1, 1.25);
    target.width = width * dpr;
    target.height = height * dpr;
    var targetCtx = target.getContext("2d");
    targetCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    targetCtx.fillStyle = pick(palette);
    targetCtx.fillRect(0, 0, width, height);
    var donor = estratosCanvas();
    if (!donor || !donor.width) {
      targetCtx.fillStyle = pick(palette);
      targetCtx.font = "900 " + Math.max(18, width / 9) + "px sans-serif";
      targetCtx.fillText(phrase(salt).slice(0, 18), 0, height * .55);
      return;
    }
    for (var i = 0; i < 4 + salt % 17; i += 1) {
      targetCtx.globalAlpha = between(.3, 1);
      targetCtx.globalCompositeOperation = pick(["source-over", "difference", "screen", "multiply"]);
      try {
        targetCtx.drawImage(
          donor,
          hash32(seed + salt + ":" + i) % Math.max(1, donor.width - 220),
          hash32(salt + ":y:" + i) % Math.max(1, donor.height - 260),
          between(40, 270), between(40, 320),
          between(-width * .12, width * .8), between(-height * .1, height * .8),
          between(width * .18, width * .9), between(height * .18, height * .9)
        );
      } catch (error) {}
    }
    targetCtx.globalAlpha = 1;
    targetCtx.globalCompositeOperation = "source-over";
  }

  function sculptureSvg(salt) {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    var donor = letrasSvg();
    var candidates = donor ? Array.prototype.slice.call(donor.children).filter(function (node) {
      return !/^(title|desc|style|script|defs)$/i.test(node.tagName);
    }) : [];
    if (candidates.length) {
      for (var i = 0; i < Math.min(candidates.length, 2 + salt % 8); i += 1) {
        var clone = candidates[(salt * 7 + i * 11) % candidates.length].cloneNode(true);
        Array.prototype.forEach.call(clone.querySelectorAll("[id]"), function (node, n) {
          node.id = "collage-" + salt + "-" + i + "-" + n;
        });
        svg.appendChild(clone);
      }
    } else {
      for (var g = 0; g < 120; g += 1) {
        var text = document.createElementNS(ns, "text");
        var a = g / 120 * Math.PI * 2;
        var radius = 115 + Math.sin(g * .7) * 95;
        text.setAttribute("x", String(500 + Math.cos(a) * radius));
        text.setAttribute("y", String(500 + Math.sin(a) * radius));
        text.setAttribute("font-size", String(10 + g % 9 * 4));
        text.setAttribute("fill", pick(palette));
        text.textContent = Array.from("𐀀░▒▓◯△⌇∿𓀀𔐀")[g % 11];
        svg.appendChild(text);
      }
    }
    return svg;
  }

  function createShard(kind, extraLarge) {
    serial += 1;
    var salt = serial;
    var donor = source(kind);
    var link = document.createElement("a");
    link.className = "shard";
    link.href = donor.href;
    link.setAttribute("aria-label", "Abrir fragmento de " + donor.id);
    shardStyle(link, Boolean(extraLarge));

    if (kind === "canvas") {
      var canvas = document.createElement("canvas");
      link.appendChild(canvas);
      requestAnimationFrame(function () { paintCanvas(canvas, salt); });
      if (salt % 4 === 0) liveCanvases.push({ canvas: canvas, salt: salt });
    } else if (kind === "svg") {
      link.classList.add("is-sculpture");
      link.appendChild(sculptureSvg(salt));
    } else {
      var frame = document.createElement("iframe");
      frame.src = donor.href + (donor.href.indexOf("?") >= 0 ? "&" : "?") + "seed=" + encodeURIComponent(seed + "-" + salt);
      frame.loading = "lazy";
      frame.tabIndex = -1;
      frame.style.setProperty("--frame-x", between(-43, 2).toFixed(1) + "%");
      frame.style.setProperty("--frame-y", between(-38, 2).toFixed(1) + "%");
      frame.style.setProperty("--frame-scale", between(.62, 1.35).toFixed(2));
      link.appendChild(frame);
    }
    collage.appendChild(link);
    return link;
  }

  function createText(giant) {
    textSerial += 1;
    var donor = source();
    var linked = random() < .72;
    var node = document.createElement(linked ? "a" : "span");
    node.className = "mega-text";
    if (random() < .14) node.classList.add("vertical");
    if (linked) node.href = donor.href;
    var fullHeight = world.offsetHeight || innerHeight * 2.6;
    node.style.setProperty("--x", between(-18, 88).toFixed(2) + "vw");
    node.style.setProperty("--y", between(-90, fullHeight - 120).toFixed(0) + "px");
    node.style.setProperty("--w", between(280, Math.max(420, innerWidth * .98)).toFixed(0) + "px");
    node.style.setProperty("--z", String(20 + textSerial % 160));
    node.style.setProperty("--color", pick(palette));
    node.style.setProperty("--hover", pick(palette));
    node.style.setProperty("--stroke", random() < .5 ? pick(palette) : "transparent");
    node.style.setProperty("--stroke-width", random() < .34 ? between(1, 6).toFixed(1) + "px" : "0px");
    node.style.setProperty("--size", giant ? between(11, 27).toFixed(1) + "vw" : between(2.5, 11).toFixed(1) + "vw");
    node.style.setProperty("--weight", String(Math.floor(between(4, 10)) * 100));
    node.style.setProperty("--tracking", between(-.08, .16).toFixed(3) + "em");
    node.style.setProperty("--case", pick(["uppercase", "lowercase", "none"]));
    node.style.setProperty("--white", random() < .17 ? "nowrap" : "normal");
    node.style.setProperty("--blend", pick(blends));
    node.style.setProperty("--r", between(-42, 42).toFixed(2) + "deg");
    node.style.setProperty("--stretch", between(.52, 2.1).toFixed(2));
    node.style.setProperty("--dx-a", between(-80, 30).toFixed(0) + "px");
    node.style.setProperty("--dy-a", between(-35, 35).toFixed(0) + "px");
    node.style.setProperty("--dx-b", between(-60, 180).toFixed(0) + "px");
    node.style.setProperty("--dy-b", between(-40, 180).toFixed(0) + "px");
    node.style.setProperty("--duration", between(7, 39).toFixed(1) + "s");
    node.style.setProperty("--delay", between(-30, 0).toFixed(1) + "s");
    textField.appendChild(node);
    typeText(node, phrase("mega-" + textSerial), giant ? 16 : 28);
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
      index += 1 + (index % 9 === 0 ? 2 : 0);
      if (index <= value.length) setTimeout(write, speed + Math.random() * speed);
    }
    write();
  }

  function curvePath(width, height, salt) {
    return [
      "M", between(-70, width + 70).toFixed(1), between(-40, height * .25).toFixed(1),
      "C", between(-width * .25, width * 1.25).toFixed(1), between(height * .05, height * .5).toFixed(1),
      between(-width * .25, width * 1.25).toFixed(1), between(height * .38, height * .82).toFixed(1),
      between(-70, width + 70).toFixed(1), between(height * .72, height + 70).toFixed(1)
    ].join(" ");
  }

  function createVein(index) {
    var ns = "http://www.w3.org/2000/svg";
    var donor = source();
    var group = document.createElementNS(ns, "g");
    group.classList.add("vein");
    group.style.setProperty("--color", pick(palette));
    group.style.setProperty("--shadow", pick(palette));
    group.style.setProperty("--width", between(.7, index % 8 === 0 ? 10 : 3.4).toFixed(1) + "px");
    group.style.setProperty("--dash", between(1, 9).toFixed(0) + " " + between(3, 22).toFixed(0) + " " + between(5, 38).toFixed(0));
    group.style.setProperty("--duration", between(8, 33).toFixed(1) + "s");
    group.style.setProperty("--type-size", between(9, index % 6 === 0 ? 31 : 17).toFixed(1) + "px");
    var pathId = "route-" + index;
    var d = curvePath(innerWidth, Math.max(world.offsetHeight, 1700), index);
    var shadow = document.createElementNS(ns, "path");
    shadow.setAttribute("class", "shadow");
    shadow.setAttribute("d", d);
    var anchor = document.createElementNS(ns, "a");
    anchor.setAttribute("href", donor.href);
    var line = document.createElementNS(ns, "path");
    line.setAttribute("id", pathId);
    line.setAttribute("class", "line");
    line.setAttribute("d", d);
    var hit = document.createElementNS(ns, "path");
    hit.setAttribute("class", "hit");
    hit.setAttribute("d", d);
    var text = document.createElementNS(ns, "text");
    var textPath = document.createElementNS(ns, "textPath");
    textPath.setAttribute("href", "#" + pathId);
    textPath.setAttribute("startOffset", between(0, 60).toFixed(1) + "%");
    var p = phrase("vein-" + index);
    textPath.textContent = (p + " ◇ " + p + " ↗ ").repeat(3);
    text.appendChild(textPath);
    anchor.append(line, hit, text);
    group.append(shadow, anchor);
    veins.appendChild(group);
  }

  function createWire(index) {
    var ns = "http://www.w3.org/2000/svg";
    var poly = document.createElementNS(ns, index % 4 === 0 ? "polygon" : "polyline");
    var points = [];
    var fullHeight = Math.max(world.offsetHeight, 1700);
    var cx = between(-100, innerWidth + 100);
    var cy = between(-100, fullHeight + 100);
    for (var i = 0; i < 4 + index % 12; i += 1) {
      points.push((cx + between(-260, 260)).toFixed(0) + "," + (cy + between(-260, 260)).toFixed(0));
    }
    poly.setAttribute("points", points.join(" "));
    poly.setAttribute("class", "wire");
    poly.style.setProperty("--wire-color", pick(palette));
    poly.style.setProperty("--wire-width", between(.35, index % 10 === 0 ? 7 : 2.3).toFixed(2) + "px");
    poly.style.setProperty("--wire-opacity", between(.22, .94).toFixed(2));
    poly.style.setProperty("--duration", between(2, 19).toFixed(1) + "s");
    wires.appendChild(poly);
  }

  function rareWindow() {
    var donor = source(random() < .5 ? "canvas" : "svg");
    var article = document.createElement("article");
    article.className = "rare-window";
    var fullHeight = world.offsetHeight || 1700;
    article.style.setProperty("--x", between(-4, 82).toFixed(1) + "vw");
    article.style.setProperty("--y", between(0, fullHeight - 300).toFixed(0) + "px");
    article.style.setProperty("--w", between(180, Math.min(520, innerWidth * .63)).toFixed(0) + "px");
    article.style.setProperty("--h", between(130, 390).toFixed(0) + "px");
    article.style.setProperty("--z", String(110 + serial));
    article.style.setProperty("--fg", pick(palette));
    article.style.setProperty("--bg", pick(palette));
    article.style.setProperty("--shadow", pick(palette));
    article.style.setProperty("--r", between(-12, 12).toFixed(2) + "deg");
    var header = document.createElement("header");
    header.textContent = "□  ○  ×";
    var link = document.createElement("a");
    link.href = donor.href;
    if (donor.type === "canvas") {
      var canvas = document.createElement("canvas");
      link.appendChild(canvas);
      requestAnimationFrame(function () { paintCanvas(canvas, serial + 900); });
    } else link.appendChild(sculptureSvg(serial + 900));
    article.append(header, link);
    rareWindows.appendChild(article);
  }

  function digest() {
    serial = 0;
    textSerial = 0;
    liveCanvases = [];
    collage.replaceChildren();
    textField.replaceChildren();
    rareWindows.replaceChildren();
    veins.replaceChildren();
    wires.replaceChildren();
    random = rngFor(seed + ":" + Date.now());
    setBackground();
    makeTiles();
    var mobile = innerWidth < 720;
    var shardCount = mobile ? 29 : 58;
    for (var i = 0; i < shardCount; i += 1) {
      var chance = random();
      createShard(chance < .54 ? "canvas" : chance < .92 ? "svg" : "iframe", i % 13 === 0);
    }
    for (var t = 0; t < (mobile ? 11 : 19); t += 1) createText(t % 5 === 0);
    for (var v = 0; v < (mobile ? 12 : 23); v += 1) createVein(v);
    for (var w = 0; w < (mobile ? 20 : 42); w += 1) createWire(w);
    for (var r = 0; r < (mobile ? 1 : 2); r += 1) rareWindow();
  }

  function mutate() {
    var roll = random();
    if (roll < .16) setBackground();
    else if (roll < .33) mutateTiles();
    else if (roll < .55) createShard(random() < .6 ? "canvas" : random() < .75 ? "svg" : "iframe", random() < .08);
    else if (roll < .78) createText(random() < .25);
    else if (roll < .91) createWire(serial + textSerial);
    else rareWindow();
    var allShards = collage.children;
    if (allShards.length > 82) allShards[0].remove();
    if (textField.children.length > 34) textField.children[0].remove();
    if (rareWindows.children.length > 4) rareWindows.children[0].remove();
  }

  function updateLiveFragments() {
    for (var i = 0; i < Math.min(liveCanvases.length, 12); i += 1) {
      var item = liveCanvases[(tileSerial + i) % liveCanvases.length];
      if (item && item.canvas.isConnected) paintCanvas(item.canvas, item.salt + tileSerial);
    }
  }

  function loadDonors() {
    estratosFrame.src = "../estratos/index.html?seed=" + encodeURIComponent(seed + "-paisaje");
    letrasFrame.src = "../lasletras/index.html?seed=" + encodeURIComponent(seed + "-forma");
    letrasFrame.addEventListener("load", function () {
      setTimeout(function () {
        Array.prototype.forEach.call(document.querySelectorAll(".shard.is-sculpture"), function (node, index) {
          node.replaceChildren(sculptureSvg(index + 1));
        });
      }, 1200);
    }, { once: true });
  }

  function init() {
    loadDonors();
    resize();
    digest();
    requestAnimationFrame(drawBackground);
    document.getElementById("regenerate").addEventListener("click", digest);
    addEventListener("resize", resize);
    document.addEventListener("keydown", function (event) {
      if (event.key.toLowerCase() === "r") digest();
      if (event.key.toLowerCase() === "c") createShard(random() < .55 ? "canvas" : random() < .8 ? "svg" : "iframe", true);
      if (event.key.toLowerCase() === "t") createText(true);
    });
    world.addEventListener("dblclick", function (event) {
      if (!event.target.closest("a,button,iframe")) createShard(random() < .6 ? "canvas" : "svg", true);
    });
    setInterval(mutate, reduceMotion ? 12000 : 2900);
    setInterval(updateLiveFragments, reduceMotion ? 15000 : 1800);
    setInterval(setBackground, reduceMotion ? 20000 : 8700);
  }

  init();
})();
