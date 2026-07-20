(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var modes = ["bars", "line", "scatter", "radial", "strata", "stream", "moire", "glitch", "constellation", "glyph", "cellular", "erosion"];
  var mutation = 0;

  function hash32(text) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(text).length; i += 1) {
      h ^= String(text).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function rngFrom(text) {
    var state = hash32(text);
    return function () {
      var t = state += 0x6d2b79f5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function palette() {
    var style = getComputedStyle(document.documentElement);
    return ["--bg", "--fg", "--a", "--b", "--c", "--d"].map(function (name) {
      return style.getPropertyValue(name).trim() || "#000";
    });
  }

  function metrics() {
    var events = global.LabEvents ? global.LabEvents.read().entries.length : 0;
    var memory = global.LabRoutes && global.LabRoutes.readMemory ? global.LabRoutes.readMemory() : { visits: {}, durations: {} };
    var visits = Object.keys(memory.visits || {}).reduce(function (sum, id) { return sum + Number(memory.visits[id] || 0); }, 0);
    var duration = Object.keys(memory.durations || {}).reduce(function (sum, id) { return sum + Number(memory.durations[id] || 0); }, 0) / 1000;
    return {
      links: document.querySelectorAll("a[href]").length,
      buttons: document.querySelectorAll("button").length,
      blocks: document.querySelectorAll("div,section,article,aside,table,pre,blockquote").length,
      glyphs: document.querySelectorAll(".glyph,.glyph-layer,.ascii-plane,.garden-glyphs").length,
      text: Math.min(9999, (document.body.textContent || "").length),
      events: events,
      visits: visits,
      duration: duration,
      rule: Number(config.cellularRule || 0),
      depth: Number(new URLSearchParams(location.search).get("depth") || 0)
    };
  }

  function values(rng, count) {
    var m = metrics();
    var base = [m.links, m.buttons, m.blocks, m.glyphs, m.text / 80, m.events + 1, m.rule / 3, (m.depth + 1) * 9, m.visits + 1, m.duration / 7 + 1];
    return Array.from({ length: count }, function (_, i) {
      var source = base[i % base.length];
      return Math.max(1, source * (.35 + rng() * 1.35) + rng() * 12);
    });
  }

  function prepare(canvas) {
    var width = Math.max(180, canvas.clientWidth || Number(canvas.dataset.width) || 360);
    var height = Math.max(120, canvas.clientHeight || Number(canvas.dataset.height) || 230);
    var dpr = Math.min(global.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    var ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: width, height: height };
  }

  function axes(ctx, width, height, colors) {
    ctx.strokeStyle = colors[1];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 10); ctx.lineTo(24, height - 20); ctx.lineTo(width - 8, height - 20); ctx.stroke();
    ctx.fillStyle = colors[1];
    ctx.font = "8px monospace";
    ctx.fillText("0", 11, height - 15);
    ctx.fillText("∞?", 3, 14);
  }

  function drawBars(ctx, width, height, colors, rng) {
    var data = values(rng, 11);
    var max = Math.max.apply(null, data);
    var available = width - 42;
    var gap = Math.max(2, available / data.length * .16);
    var bar = available / data.length - gap;
    axes(ctx, width, height, colors);
    data.forEach(function (value, i) {
      var h = value / max * (height - 48);
      ctx.fillStyle = colors[2 + (i % 4)];
      ctx.fillRect(30 + i * (bar + gap), height - 20 - h, bar, h);
      if (i % 2 === 0) ctx.fillRect(30 + i * (bar + gap), 8 + rng() * 16, Math.max(1, bar / 3), 3);
    });
  }

  function drawLine(ctx, width, height, colors, rng) {
    var data = values(rng, 24);
    var max = Math.max.apply(null, data);
    axes(ctx, width, height, colors);
    for (var layer = 0; layer < 4; layer += 1) {
      ctx.strokeStyle = colors[2 + layer];
      ctx.lineWidth = 1 + layer * .6;
      ctx.beginPath();
      data.forEach(function (value, i) {
        var x = 28 + i / (data.length - 1) * (width - 40);
        var y = height - 22 - (value * (.55 + rng() * .6)) / max * (height - 45);
        if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }

  function drawScatter(ctx, width, height, colors, rng) {
    axes(ctx, width, height, colors);
    for (var i = 0; i < 90; i += 1) {
      var x = 27 + rng() * (width - 38);
      var y = 12 + rng() * (height - 37);
      var size = 1 + rng() * (i % 7 === 0 ? 12 : 5);
      ctx.fillStyle = colors[2 + (i % 4)];
      if (i % 5) ctx.fillRect(x, y, size, size); else { ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); }
    }
  }

  function drawRadial(ctx, width, height, colors, rng) {
    var cx = width / 2, cy = height / 2;
    var data = values(rng, 18);
    var max = Math.max.apply(null, data);
    for (var ring = 0; ring < 5; ring += 1) {
      ctx.strokeStyle = colors[2 + (ring % 4)];
      ctx.beginPath(); ctx.arc(cx, cy, 18 + ring * Math.min(width, height) / 13, 0, Math.PI * 2); ctx.stroke();
    }
    data.forEach(function (value, i) {
      var angle = i / data.length * Math.PI * 2 - Math.PI / 2;
      var radius = 12 + value / max * Math.min(width, height) * .42;
      ctx.strokeStyle = colors[2 + (i % 4)];
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius); ctx.stroke();
      ctx.fillStyle = colors[2 + ((i + 1) % 4)];
      ctx.fillRect(cx + Math.cos(angle) * radius - 2, cy + Math.sin(angle) * radius - 2, 4 + (i % 4), 4 + (i % 4));
    });
  }

  function drawStrata(ctx, width, height, colors, rng) {
    var data = values(rng, 14);
    var total = data.reduce(function (sum, value) { return sum + value; }, 0);
    var y = 0;
    data.forEach(function (value, i) {
      var h = Math.max(3, value / total * height);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(0, y, width, h + 1);
      ctx.fillStyle = colors[(i + 1) % colors.length];
      ctx.font = Math.max(7, Math.min(13, h * .55)) + "px monospace";
      ctx.fillText(i % 2 ? "archivo" : "lluvia / " + i, 4 + rng() * Math.max(1, width - 100), y + Math.min(h - 1, 12));
      y += h;
    });
  }

  function drawStream(ctx, width, height, colors, rng) {
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    for (var line = 0; line < 22; line += 1) {
      ctx.strokeStyle = colors[2 + (line % 4)];
      ctx.lineWidth = .6 + (line % 4) * .35;
      ctx.beginPath();
      for (var x = -8; x < width + 8; x += 7) {
        var y = height * .1 + line * height / 27 + Math.sin(x * .025 + line * .8) * (4 + rng() * 13);
        if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  function drawMoire(ctx, width, height, colors, rng) {
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = .74;
    for (var family = 0; family < 3; family += 1) {
      var ox = width * (.25 + family * .23) + (rng() - .5) * 40;
      var oy = height * (.35 + (family % 2) * .24) + (rng() - .5) * 30;
      ctx.strokeStyle = colors[2 + (family % 4)];
      ctx.lineWidth = .5 + family * .45;
      for (var ring = 4; ring < Math.max(width, height) * .74; ring += 5 + family) {
        ctx.beginPath(); ctx.arc(ox, oy, ring, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGlitch(ctx, width, height, colors, rng) {
    var data = values(rng, 48);
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < 150; i += 1) {
      var value = data[i % data.length];
      var x = rng() * width, y = rng() * height;
      var w = Math.max(1, value / 3 * (rng() < .15 ? 5 : 1));
      ctx.fillStyle = colors[2 + (i % 4)];
      ctx.globalAlpha = .32 + rng() * .68;
      ctx.fillRect(x, y, w, 1 + rng() * 9);
      if (i % 17 === 0) { ctx.font = (7 + rng() * 20) + "px monospace"; ctx.fillText("0x" + Math.floor(value * 17).toString(16), x - 8, y); }
    }
    ctx.globalAlpha = 1;
  }

  function drawConstellation(ctx, width, height, colors, rng) {
    var data = values(rng, 38);
    var points = data.map(function (value, i) { return { x: 12 + rng() * (width - 24), y: 12 + rng() * (height - 24), r: 1 + value % 8, i: i }; });
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    points.forEach(function (point, i) {
      points.slice(i + 1).forEach(function (other) {
        var distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance > width * .27 || (point.i + other.i + Number(config.cellularRule || 0)) % 4) return;
        ctx.globalAlpha = Math.max(.08, 1 - distance / (width * .27));
        ctx.strokeStyle = colors[2 + (i % 4)]; ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(other.x, other.y); ctx.stroke();
      });
      ctx.globalAlpha = 1; ctx.fillStyle = colors[2 + (i % 4)]; ctx.fillRect(point.x - point.r / 2, point.y - point.r / 2, point.r, point.r);
    });
  }

  function drawGlyph(ctx, width, height, colors, rng) {
    var glyphs = ["RÍO", "href", "▓", "∅", "110", "llueve", "<div>", "otra"];
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    for (var i = 0; i < 96; i += 1) {
      var size = 6 + Math.pow(rng(), 2) * Math.min(72, width / 4);
      ctx.font = "900 " + size + "px monospace";
      ctx.fillStyle = colors[2 + (i % 4)];
      ctx.globalAlpha = .25 + rng() * .75;
      ctx.fillText(glyphs[(i + Math.floor(rng() * glyphs.length)) % glyphs.length], rng() * width - size, rng() * height);
    }
    ctx.globalAlpha = 1;
  }

  function drawCellular(ctx, width, height, colors, rng) {
    var cell = Math.max(3, Math.floor(Math.min(width, height) / 34));
    var cols = Math.ceil(width / cell), rows = Math.ceil(height / cell);
    var tape = global.LabAutomata ? global.LabAutomata.history({ cols: cols, rows: rows, rule: Number(config.cellularRule || 110), rng: rng, density: .17 }) : [];
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    tape.forEach(function (row, y) {
      row.forEach(function (alive, x) {
        if (!alive) return;
        ctx.fillStyle = colors[2 + ((x + y) % 4)];
        if ((x * 3 + y) % 7) ctx.fillRect(x * cell, y * cell, cell, cell);
        else { ctx.beginPath(); ctx.arc(x * cell, y * cell, cell * 1.6, 0, Math.PI * 2); ctx.strokeStyle = colors[2 + ((x + y + 1) % 4)]; ctx.stroke(); }
      });
    });
  }

  function drawErosion(ctx, width, height, colors, rng) {
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, width, height);
    for (var layer = 0; layer < 42; layer += 1) {
      ctx.strokeStyle = colors[2 + (layer % 4)];
      ctx.lineWidth = layer % 9 === 0 ? 3 : .7;
      ctx.beginPath();
      for (var x = -10; x <= width + 10; x += 5) {
        var y = height * .08 + layer * height / 47 + Math.sin(x * (.015 + layer * .0007) + layer) * (4 + layer * .18) + (rng() - .5) * 7;
        if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  var drawers = { bars: drawBars, line: drawLine, scatter: drawScatter, radial: drawRadial, strata: drawStrata, stream: drawStream, moire: drawMoire, glitch: drawGlitch, constellation: drawConstellation, glyph: drawGlyph, cellular: drawCellular, erosion: drawErosion };

  function draw(canvas, mode, salt) {
    var prepared = prepare(canvas);
    if (!prepared) return;
    mode = drawers[mode] ? mode : modes[hash32(salt || seed) % modes.length];
    var colors = palette();
    var rng = rngFrom(seed + ":chart:" + (config.id || "root") + ":" + mode + ":" + (salt || 0) + ":" + mutation);
    prepared.ctx.fillStyle = colors[0];
    prepared.ctx.fillRect(0, 0, prepared.width, prepared.height);
    drawers[mode](prepared.ctx, prepared.width, prepared.height, colors, rng);
    canvas.dataset.chartMode = mode;
    var figure = canvas.closest && canvas.closest(".generative-chart");
    if (figure) figure.dataset.chartMode = mode;
  }

  function bindFigure(figure, index) {
    if (!figure || figure.dataset.chartReady) return;
    figure.dataset.chartReady = "1";
    var canvas = figure.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      figure.insertBefore(canvas, figure.firstChild);
    }
    var mode = figure.dataset.chart || modes[index % modes.length];
    draw(canvas, mode, index);
    canvas.addEventListener("click", function () {
      mutation += 1;
      mode = modes[(modes.indexOf(mode) + 1 + Math.floor(rngFrom(seed + mutation)() * (modes.length - 1))) % modes.length];
      figure.dataset.chart = mode;
      draw(canvas, mode, index + mutation);
      if (global.LabEvents) global.LabEvents.record("grafica", "la gráfica cambió a " + mode);
    });
    canvas.addEventListener("dblclick", function (event) {
      event.preventDefault();
      figure.classList.toggle("chart-unmoored");
      figure.style.setProperty("--chart-r", (-14 + rngFrom(seed + ":unmoor:" + mutation)() * 28) + "deg");
      if (global.LabEvents) global.LabEvents.record("grafica", "la gráfica " + mode + " abandonó su eje");
    });
    var close = figure.querySelector(".chart-close");
    if (close) close.addEventListener("click", function () {
      if (global.LabEvents) global.LabEvents.record("destruccion", "una gráfica " + mode);
      figure.remove();
    });
  }

  function hydrate(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll(".generative-chart"), bindFigure);
  }

  function spawn(root, mode) {
    root = root || document.body;
    var existing = document.querySelectorAll(".spawned-chart");
    if (existing.length >= 10) existing[0].remove();
    var rng = rngFrom(seed + ":spawn-chart:" + mutation + ":" + existing.length);
    var figure = document.createElement("figure");
    figure.className = "generative-chart spawned-chart";
    figure.dataset.chart = mode || modes[Math.floor(rng() * modes.length)];
    figure.style.setProperty("--chart-x", (2 + rng() * 68) + "vw");
    figure.style.setProperty("--chart-y", (3 + rng() * 70) + "vh");
    figure.style.setProperty("--chart-w", (190 + rng() * 420) + "px");
    figure.style.setProperty("--chart-color", palette()[2 + Math.floor(rng() * 4)]);
    var button = document.createElement("button");
    button.className = "chart-close"; button.type = "button"; button.textContent = "×"; button.setAttribute("aria-label", "cerrar gráfica");
    var canvas = document.createElement("canvas");
    canvas.dataset.height = String(150 + Math.floor(rng() * 210));
    var caption = document.createElement("figcaption");
    caption.textContent = ["densidad de lluvia", "historial del cauce", "población de enlaces", "pérdida por color", "ruido acumulado", "tiempo usado", "órbita de reglas", "erosión del DOM"][Math.floor(rng() * 8)] + " / " + (config.id || "umbral");
    figure.appendChild(button); figure.appendChild(canvas); figure.appendChild(caption); root.appendChild(figure);
    bindFigure(figure, existing.length + mutation);
    if (global.LabEvents) global.LabEvents.record("grafica", figure.dataset.chart + " / " + caption.textContent);
    return figure;
  }

  global.LabCharts = Object.freeze({ modes: modes.slice(), metrics: metrics, draw: draw, hydrate: hydrate, spawn: spawn });
})(window);
