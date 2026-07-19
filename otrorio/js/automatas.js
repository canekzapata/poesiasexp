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

  function paint(canvas, options) {
    if (!canvas) return function () {};
    var ctx = canvas.getContext("2d", { alpha: false });
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
    paint: paint,
    cellsToMask: cellsToMask
  });
})(window);
