(function (global) {
  "use strict";

  function bit(rule, left, center, right) {
    return (rule >> ((left << 2) | (center << 1) | right)) & 1;
  }

  function nextRow(row, rule, wrap) {
    var out = new Uint8Array(row.length);
    for (var i = 0; i < row.length; i += 1) {
      var l = i ? row[i - 1] : (wrap ? row[row.length - 1] : 0);
      var c = row[i];
      var r = i < row.length - 1 ? row[i + 1] : (wrap ? row[0] : 0);
      out[i] = bit(rule, l, c, r);
    }
    return out;
  }

  function seededRow(cols, rng, density) {
    var row = new Uint8Array(cols);
    for (var i = 0; i < cols; i += 1) row[i] = rng() < density ? 1 : 0;
    if (!row.some(Boolean)) row[Math.floor(cols / 2)] = 1;
    return row;
  }

  function history(options) {
    var rows = options.rows || 48;
    var row = options.row || seededRow(options.cols || 64, options.rng || Math.random, options.density || .22);
    var result = [row];
    for (var y = 1; y < rows; y += 1) {
      row = nextRow(row, options.rule || 90, options.wrap !== false);
      result.push(row);
    }
    return result;
  }

  function paintWolfram(canvas, options) {
    if (!canvas) return function () {};
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return function () {};
    var cell = Math.max(2, Number(options.cell) || 7);
    var palette = options.palette || ["#000", "#fff", "#ff3e9d", "#2c63ff"];
    var stopped = false;
    var timer = 0;
    var row;
    var y = 0;
    var cols = 0;
    var rows = 0;

    function resize() {
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      cols = Math.ceil(global.innerWidth / cell);
      rows = Math.ceil(global.innerHeight / cell);
      canvas.width = Math.ceil(global.innerWidth * dpr);
      canvas.height = Math.ceil(global.innerHeight * dpr);
      canvas.style.width = global.innerWidth + "px";
      canvas.style.height = global.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, global.innerWidth, global.innerHeight);
      row = seededRow(cols, options.rng || Math.random, options.density || .18);
      y = 0;
    }

    function drawRow() {
      if (!row || y >= rows) return false;
      for (var x = 0; x < row.length; x += 1) {
        ctx.fillStyle = row[x] ? palette[1 + ((x + y) % (palette.length - 1))] : palette[0];
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
      row = nextRow(row, options.rule || 90, true);
      y += 1;
      return y < rows;
    }

    function frame() {
      if (stopped) return;
      var batch = options.animated ? 2 : rows;
      while (batch-- > 0 && drawRow()) { /* pintar por lotes */ }
      if (y < rows && options.animated) timer = global.requestAnimationFrame(frame);
    }

    function restart() {
      global.cancelAnimationFrame(timer);
      resize();
      frame();
    }

    resize();
    frame();
    global.addEventListener("resize", restart, { passive: true });
    return function stop() {
      stopped = true;
      global.cancelAnimationFrame(timer);
      global.removeEventListener("resize", restart);
    };
  }

  function seededGrid(cols, rows, rng, states, density) {
    var grid = [];
    states = Math.max(2, states || 2);
    density = density == null ? .28 : density;
    for (var y = 0; y < rows; y += 1) {
      var row = new Uint8Array(cols);
      for (var x = 0; x < cols; x += 1) {
        row[x] = rng() < density ? 1 + Math.floor(rng() * (states - 1)) : 0;
      }
      grid.push(row);
    }
    return grid;
  }

  function conwayStep(grid, wrap) {
    var rows = grid.length;
    var cols = grid[0].length;
    var next = Array.from({ length: rows }, function () { return new Uint8Array(cols); });
    for (var y = 0; y < rows; y += 1) {
      for (var x = 0; x < cols; x += 1) {
        var neighbors = 0;
        for (var dy = -1; dy <= 1; dy += 1) {
          for (var dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            var yy = y + dy;
            var xx = x + dx;
            if (wrap) { yy = (yy + rows) % rows; xx = (xx + cols) % cols; }
            if (yy >= 0 && yy < rows && xx >= 0 && xx < cols) neighbors += grid[yy][xx] ? 1 : 0;
          }
        }
        next[y][x] = grid[y][x] ? (neighbors === 2 || neighbors === 3 ? 1 : 0) : (neighbors === 3 ? 1 : 0);
      }
    }
    return next;
  }

  function cyclicStep(grid, states) {
    var rows = grid.length;
    var cols = grid[0].length;
    var next = Array.from({ length: rows }, function () { return new Uint8Array(cols); });
    for (var y = 0; y < rows; y += 1) {
      for (var x = 0; x < cols; x += 1) {
        var current = grid[y][x];
        var desired = (current + 1) % states;
        var change = false;
        for (var dy = -1; dy <= 1 && !change; dy += 1) {
          for (var dx = -1; dx <= 1; dx += 1) {
            if (!dx && !dy) continue;
            if (grid[(y + dy + rows) % rows][(x + dx + cols) % cols] === desired) { change = true; break; }
          }
        }
        next[y][x] = change ? desired : current;
      }
    }
    return next;
  }

  function paintGrid(canvas, options) {
    if (!canvas) return function () {};
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return function () {};
    var cell = Math.max(3, Number(options.cell) || 8);
    var palette = options.palette || ["#000", "#fff", "#ff3e9d", "#2c63ff", "#b7ff3c"];
    var rng = options.rng || Math.random;
    var mode = options.mode === "cyclic" ? "cyclic" : "conway";
    var states = Math.max(3, Math.min(8, Number(options.states) || palette.length));
    var grid;
    var cols;
    var rows;
    var timer = 0;
    var stopped = false;
    var last = 0;

    function resize() {
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      cols = Math.ceil(global.innerWidth / cell);
      rows = Math.ceil(global.innerHeight / cell);
      canvas.width = Math.ceil(global.innerWidth * dpr);
      canvas.height = Math.ceil(global.innerHeight * dpr);
      canvas.style.width = global.innerWidth + "px";
      canvas.style.height = global.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grid = seededGrid(cols, rows, rng, mode === "cyclic" ? states : 2, mode === "cyclic" ? .94 : (options.density || .27));
      if (!options.animated) {
        for (var i = 0; i < 9; i += 1) grid = mode === "cyclic" ? cyclicStep(grid, states) : conwayStep(grid, true);
      }
      draw();
    }

    function draw() {
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, global.innerWidth, global.innerHeight);
      for (var y = 0; y < rows; y += 1) {
        for (var x = 0; x < cols; x += 1) {
          var state = grid[y][x];
          if (mode === "conway" && !state) continue;
          ctx.fillStyle = mode === "cyclic" ? palette[state % palette.length] : palette[1 + ((x + y) % (palette.length - 1))];
          ctx.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    function frame(time) {
      if (stopped) return;
      if (!last || time - last > (mode === "conway" ? 230 : 140)) {
        grid = mode === "cyclic" ? cyclicStep(grid, states) : conwayStep(grid, true);
        draw();
        last = time;
      }
      timer = global.requestAnimationFrame(frame);
    }

    function restart() {
      global.cancelAnimationFrame(timer);
      resize();
      if (options.animated) timer = global.requestAnimationFrame(frame);
    }

    resize();
    if (options.animated) timer = global.requestAnimationFrame(frame);
    global.addEventListener("resize", restart, { passive: true });
    return function stop() {
      stopped = true;
      global.cancelAnimationFrame(timer);
      global.removeEventListener("resize", restart);
    };
  }

  function paintTypographic(canvas, options) {
    if (!canvas) return function () {};
    var ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return function () {};
    var cell = Math.max(8, Number(options.cell) || 13);
    var palette = options.palette || ["#000", "#fff", "#ff3e9d", "#2c63ff"];
    var rng = options.rng || Math.random;
    var words = options.words || ["RÍO", "CAER", "href", "▓", "otra", "agua"];
    var stopped = false;

    function draw() {
      var dpr = Math.min(global.devicePixelRatio || 1, 2);
      var cols = Math.ceil(global.innerWidth / cell);
      var rows = Math.ceil(global.innerHeight / cell);
      var tape = history({ cols: cols, rows: rows, rule: options.rule || 110, rng: rng, density: options.density || .15 });
      canvas.width = Math.ceil(global.innerWidth * dpr);
      canvas.height = Math.ceil(global.innerHeight * dpr);
      canvas.style.width = global.innerWidth + "px";
      canvas.style.height = global.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = palette[0];
      ctx.fillRect(0, 0, global.innerWidth, global.innerHeight);
      ctx.font = Math.floor(cell * .86) + "px monospace";
      ctx.textBaseline = "top";
      tape.forEach(function (row, y) {
        row.forEach(function (alive, x) {
          if (!alive && (x + y) % 17) return;
          ctx.fillStyle = alive ? palette[1 + ((x + y) % (palette.length - 1))] : palette[0];
          ctx.fillText(words[(x * 3 + y) % words.length], x * cell, y * cell);
        });
      });
    }

    draw();
    global.addEventListener("resize", draw, { passive: true });
    return function stop() {
      stopped = true;
      if (stopped) global.removeEventListener("resize", draw);
    };
  }

  function paint(canvas, options) {
    options = options || {};
    if (options.mode === "conway" || options.mode === "cyclic") return paintGrid(canvas, options);
    if (options.mode === "typographic") return paintTypographic(canvas, options);
    return paintWolfram(canvas, options);
  }

  function cellsToMask(options) {
    var grid = history(options);
    var mask = [];
    grid.forEach(function (row, y) {
      row.forEach(function (alive, x) {
        if (alive) mask.push({ x: x, y: y, index: y * row.length + x });
      });
    });
    return mask;
  }

  global.LabAutomata = Object.freeze({
    nextRow: nextRow,
    seededRow: seededRow,
    history: history,
    seededGrid: seededGrid,
    conwayStep: conwayStep,
    cyclicStep: cyclicStep,
    paintWolfram: paintWolfram,
    paint: paint,
    cellsToMask: cellsToMask
  });
})(window);
