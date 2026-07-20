(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var modes = ["bars", "line", "scatter", "radial", "strata", "stream"];
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
    return {
      links: document.querySelectorAll("a[href]").length,
      buttons: document.querySelectorAll("button").length,
      blocks: document.querySelectorAll("div,section,article,aside,table,pre,blockquote").length,
      glyphs: document.querySelectorAll(".glyph,.glyph-layer,.ascii-plane,.garden-glyphs").length,
      text: Math.min(9999, (document.body.textContent || "").length),
      events: events,
      rule: Number(config.cellularRule || 0),
      depth: Number(new URLSearchParams(location.search).get("depth") || 0)
    };
  }

  function values(rng, count) {
    var m = metrics();
    var base = [m.links, m.buttons, m.blocks, m.glyphs, m.text / 80, m.events + 1, m.rule / 3, (m.depth + 1) * 9];
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

  var drawers = { bars: drawBars, line: drawLine, scatter: drawScatter, radial: drawRadial, strata: drawStrata, stream: drawStream };

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
      mode = modes[(modes.indexOf(mode) + 1 + Math.floor(rngFrom(seed + mutation)() * 4)) % modes.length];
      figure.dataset.chart = mode;
      draw(canvas, mode, index + mutation);
      if (global.LabEvents) global.LabEvents.record("grafica", "la gráfica cambió a " + mode);
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
    caption.textContent = ["densidad de lluvia", "historial del cauce", "población de enlaces", "pérdida por color", "ruido acumulado"][Math.floor(rng() * 5)] + " / " + (config.id || "umbral");
    figure.appendChild(button); figure.appendChild(canvas); figure.appendChild(caption); root.appendChild(figure);
    bindFigure(figure, existing.length + mutation);
    if (global.LabEvents) global.LabEvents.record("grafica", figure.dataset.chart + " / " + caption.textContent);
    return figure;
  }

  global.LabCharts = Object.freeze({ modes: modes.slice(), metrics: metrics, draw: draw, hydrate: hydrate, spawn: spawn });
})(window);
