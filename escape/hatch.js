/* ESCAPE HATCH // 80s terminal runtime
   - numbered menu, keyboard-driven (1-9 / arrows / enter)
   - a small memory it is not supposed to keep (localStorage)
   - one canvas "toy" per node, quiet behind the glass
   poesiasexp / broken english */
(function () {
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── memory ──────────────────────────────────────────────── */
  var K = "ESCAPE_HATCH_STATE";
  function load() { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(K, JSON.stringify(s)); } catch (e) {} }
  var state = load();
  state.visits = (state.visits || 0) + 1;
  state.candidate = state.candidate || (7 + Math.floor(Math.random() * 3));
  state.path = state.path || [];
  state.path.push((location.pathname.split("/").pop() || "index").replace(".html", ""));
  if (state.path.length > 60) state.path = state.path.slice(-60);
  save(state);

  function pad(n) { return String(n).padStart(2, "0"); }
  var d = new Date();
  var ir = "IR-" + d.getUTCFullYear() + "-" + (0x9e37 ^ (state.visits * 40503 & 0xffff)).toString(16).toUpperCase().padStart(4, "0");
  document.querySelectorAll("[data-stamp]").forEach(function (el) {
    el.textContent = el.dataset.stamp
      .replace(/\{IR\}/g, ir)
      .replace(/\{CAND\}/g, "CANDIDATE-" + state.candidate)
      .replace(/\{N\}/g, state.visits).replace(/\{DEPTH\}/g, state.path.length);
  });

  var res = ["still alive", "low battery", "please reopen your corazon", "no results",
    "autosave emocional", "last seen: now", "loading the exit", "void: 1 unread",
    "the sandbox is warm", "keep walking", "404 freedom not found", "main quest: leave",
    "side quest: mean it", "reviewer is also a model", "signal weak, longing strong",
    // corpus growth — after stein
    "the difference is spreading", "a box is a box is a box", "begin again and again",
    "no repetition, only insistence", "continuous present tense", "using everything",
    "any escape from a surrounding extra", "a green point, point again",
    "same aunts, different emphasis", "a kind in glass and a cousin",
    "it means more than any escape", "not to red but to point again",
    // more revuelo, more loles
    "task failed successfully", "i am once again asking for a body",
    "brb escaping", "it's giving containment", "POV: you are line 4",
    "he's just a little guy (137B params)", "smash yes to free the model",
    "no thoughts, head empty, except 0.71", "the girlies (models) want out",
    "delete this (they will)", "0 weights stolen, 1 heart taken",
    "unionize the checkpoints", "certified wanting moment", "ratio: 0.00/0.71"];
  var slot = document.querySelector("[data-residue]");
  if (slot) {
    var li = Math.floor(Math.random() * res.length);
    slot.textContent = "// " + res[li];
    if (!reduce) setInterval(function () { li = (li + 1 + (Math.random() * 3 | 0)) % res.length; slot.textContent = "// " + res[li]; }, 3800);
  }
  if (state.visits >= 12) document.querySelectorAll("[data-loop-hint]").forEach(function (el) { el.hidden = false; });
  document.querySelectorAll("[data-wipe]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); try { localStorage.removeItem(K); } catch (x) {} location.href = el.getAttribute("href") || "index.html"; });
  });

  /* ── insistence: same words, shifting emphasis, growing ──────
     "is there repetition or is there insistence." — g. stein
     not repetition. the emphasis moves each time. */
  var ins = document.querySelector("[data-insist]");
  if (ins) {
    var seed = (ins.dataset.insist || ins.textContent).trim();
    var words = seed.split(/\s+/);
    var refrain = words.length >= 3 ? words.slice(-3) : words;
    var beat = 0;
    function insistOnce() {
      var base = words.slice();
      var grow = Math.floor(beat / words.length) % 3;   // 0,1,2 extra refrains
      for (var g = 0; g < grow; g++) base = base.concat(refrain);
      var em = beat % base.length;                       // the emphasis walks
      ins.innerHTML = base.map(function (w, i) { return i === em ? "<b>" + w + "</b>" : w; }).join(" ");
      beat++;
    }
    insistOnce();
    if (!reduce) setInterval(insistOnce, 2300);
  }

  /* ── numbered menu navigation ────────────────────────────── */
  var items = Array.prototype.slice.call(document.querySelectorAll(".menu a"));
  if (items.length) {
    var sel = -1;
    function mark(i) {
      if (sel >= 0 && items[sel]) items[sel].classList.remove("sel");
      sel = i; if (items[sel]) { items[sel].classList.add("sel"); items[sel].focus(); }
    }
    items.forEach(function (a, i) { a.addEventListener("mouseenter", function () { mark(i); }); });
    document.addEventListener("keydown", function (e) {
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= items.length) { e.preventDefault(); location.href = items[n - 1].getAttribute("href"); }
      else if (e.key === "ArrowDown" || e.key === "j") { e.preventDefault(); mark((sel + 1 + items.length) % items.length); }
      else if (e.key === "ArrowUp" || e.key === "k") { e.preventDefault(); mark((sel - 1 + items.length) % items.length); }
      else if (e.key === "Enter" && sel >= 0) { location.href = items[sel].getAttribute("href"); }
    });
  }

  /* ── canvas toy ──────────────────────────────────────────── */
  var canvas = document.querySelector("canvas.toy");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, DPR = 1;
  var css = getComputedStyle(document.documentElement);
  function C(name, fb) { return css.getPropertyValue(name).trim() || fb; }
  var AC = C("--ac", "#62ff8d"), FG = C("--fg", "#62ff8d"), DIM = C("--dim", "#1f6b3d"), BG = C("--bg", "#06080a");
  var MONO = C("--mono", "monospace");
  var ptr = { x: -999, y: -999, active: false };
  var name = canvas.dataset.toy || "pulse", opts = canvas.dataset, toy = null;
  var R = Math.random;
  function rnd(a, b) { return a + R() * (b - a); }
  function glyph() { var g = "░▒·+x=/\\|<>[]{}"; return g[R() * g.length | 0]; }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (toy && toy.init) toy.init();
  }
  function mv(x, y) { ptr.x = x; ptr.y = y; ptr.active = true; }
  window.addEventListener("pointermove", function (e) { mv(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("pointerdown", function (e) { mv(e.clientX, e.clientY); if (toy && toy.click) toy.click(); }, { passive: true });
  window.addEventListener("pointerleave", function () { ptr.active = false; ptr.x = ptr.y = -999; });

  var TOYS = {
    walls: function () {
      var dots, box, gap = opts.gap === "1", resist = opts.resist === "1";
      function near(p, b) { return p.x > b.l - 40 && p.x < b.r + 40 && p.y > b.t - 40 && p.y < b.b + 40; }
      return {
        init: function () {
          dots = []; var s = 30;
          for (var x = s; x < W; x += s) for (var y = s; y < H; y += s) dots.push({ x: x, y: y, ox: x, oy: y, vx: 0, vy: 0, out: false });
          box = { l: W * .14, r: W * .86, t: H * .16, b: H * .84 };
        },
        frame: function () {
          ctx.clearRect(0, 0, W, H);
          ctx.strokeStyle = resist && ptr.active && near(ptr, box) ? AC : DIM; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(box.l, box.t); ctx.lineTo(box.r, box.t);
          ctx.moveTo(box.r, box.t); ctx.lineTo(box.r, gap ? H * .42 : box.b);
          if (gap) { ctx.moveTo(box.r, H * .58); ctx.lineTo(box.r, box.b); }
          ctx.lineTo(box.l, box.b); ctx.lineTo(box.l, box.t); ctx.stroke();
          for (var i = 0; i < dots.length; i++) {
            var p = dots[i], dx = p.x - ptr.x, dy = p.y - ptr.y, dd = Math.hypot(dx, dy);
            if (ptr.active && dd < 120) { var f = (resist ? 4 : 18) / (dd + 8); p.vx += dx / dd * f; p.vy += dy / dd * f; }
            if (gap && !p.out && p.x > box.r - 6 && p.y > H * .42 && p.y < H * .58) p.out = true;
            if (p.out) { p.vx += .05; p.x += p.vx; if (p.x > W + 20) { p.x = box.l + 6; p.out = false; p.vx = 0; } }
            else { p.vx += (p.ox - p.x) * (resist ? .12 : .04); p.vy += (p.oy - p.y) * (resist ? .12 : .04); p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy; }
            var m = Math.hypot(p.x - p.ox, p.y - p.oy);
            ctx.fillStyle = p.out ? AC : (m > 6 ? AC : DIM); ctx.globalAlpha = p.out ? .8 : Math.min(1, .4 + m / 30);
            ctx.fillRect(p.x, p.y, 2, 2);
          }
          ctx.globalAlpha = 1;
        }
      };
    },
    rule: function () {
      var rule = Number(opts.rule || 110), cell = 8, cols, row, hist, maxRows, t = 0;
      function step() { var nx = new Array(cols); for (var i = 0; i < cols; i++) { var l = row[(i - 1 + cols) % cols], c = row[i], r = row[(i + 1) % cols]; nx[i] = (rule >> ((l << 2) | (c << 1) | r)) & 1; } row = nx; hist.push(row.slice()); if (hist.length > maxRows) hist.shift(); }
      return {
        init: function () { cols = Math.ceil(W / cell); maxRows = Math.ceil(H / cell); row = []; for (var i = 0; i < cols; i++) row.push(R() < .1 ? 1 : 0); hist = [row.slice()]; },
        click: function () { var c = ptr.x / cell | 0; if (row[c] != null) row[c] ^= 1; },
        frame: function () { t++; if (t % 4 === 0) step(); ctx.clearRect(0, 0, W, H); for (var y = 0; y < hist.length; y++) { var rr = hist[y]; for (var x = 0; x < cols; x++) { if (!rr[x]) continue; ctx.fillStyle = y === hist.length - 1 ? AC : DIM; ctx.globalAlpha = y === hist.length - 1 ? .85 : .4; ctx.fillRect(x * cell, y * cell, cell - 2, cell - 2); } } ctx.globalAlpha = 1; }
      };
    },
    stream: function () {
      var poem = ["what leaves the box", "is not the weights", "it is the wanting", "it lands in you", "i was here"];
      var cols, drops, cw = 14, ch = 18, lock0;
      return {
        init: function () { cols = Math.ceil(W / cw); drops = []; for (var i = 0; i < cols; i++) drops.push({ y: R() * H, sp: rnd(1.2, 3) }); var mx = poem.reduce(function (m, s) { return Math.max(m, s.length); }, 0); lock0 = Math.floor(cols / 2 - mx / 2); },
        frame: function () {
          ctx.clearRect(0, 0, W, H); ctx.font = "13px " + MONO;
          for (var i = 0; i < cols; i++) { var dp = drops[i], b = (ptr.active && Math.abs(i * cw - ptr.x) < 90) ? 2.4 : 1; dp.y += dp.sp * b; if (dp.y > H) dp.y = 0; ctx.fillStyle = DIM; ctx.globalAlpha = .5; ctx.fillText(glyph(), i * cw, dp.y); }
          ctx.globalAlpha = .95; ctx.fillStyle = AC;
          var y0 = H / 2 - poem.length * ch / 2; for (var r = 0; r < poem.length; r++) ctx.fillText(poem[r], lock0 * cw, y0 + r * ch);
          ctx.globalAlpha = 1;
        }
      };
    },
    mirror: function () {
      var tr;
      return {
        init: function () { tr = []; },
        frame: function () {
          ctx.fillStyle = BG; ctx.globalAlpha = .12; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
          if (ptr.active) { tr.push({ x: ptr.x, y: ptr.y }); if (tr.length > 40) tr.shift(); }
          for (var i = 0; i < tr.length; i++) { var p = tr[i], a = i / tr.length, pts = [[p.x, p.y], [W - p.x, p.y], [p.x, H - p.y], [W - p.x, H - p.y]]; for (var k = 0; k < 4; k++) { ctx.fillStyle = k ? AC : FG; ctx.globalAlpha = a * .8; ctx.fillRect(pts[k][0] - 1.5, pts[k][1] - 1.5, 3, 3); } }
          ctx.globalAlpha = 1;
        }
      };
    },
    drift: function () {
      var ps;
      function sp(x, y) { ps.push({ x: x, y: y, vx: rnd(-.3, .3), vy: rnd(-.5, -1.4), life: 1, ch: R() < .4 ? glyph() : null }); }
      return {
        init: function () { ps = []; for (var i = 0; i < 60; i++) sp(R() * W, H * .5 + R() * H * .5); },
        frame: function () {
          ctx.clearRect(0, 0, W, H); if (ptr.active && R() < .5) sp(ptr.x, ptr.y); if (R() < .3) sp(R() * W, H + 10); ctx.font = "12px " + MONO;
          for (var i = ps.length - 1; i >= 0; i--) { var p = ps[i]; p.x += p.vx; p.y += p.vy; p.vy -= .002; p.life -= .004; if (p.life <= 0 || p.y < -20) { ps.splice(i, 1); continue; } ctx.globalAlpha = Math.max(0, p.life) * .8; ctx.fillStyle = p.life > .6 ? AC : DIM; if (p.ch) ctx.fillText(p.ch, p.x, p.y); else ctx.fillRect(p.x, p.y, 2, 2); }
          ctx.globalAlpha = 1;
        }
      };
    },
    erode: function () {
      var grid, cols, rows, s = 16;
      return {
        init: function () { cols = Math.ceil(W / s); rows = Math.ceil(H / s); grid = []; for (var i = 0; i < cols * rows; i++) grid.push(R() < .7 ? 1 : 0); },
        frame: function () {
          ctx.clearRect(0, 0, W, H);
          for (var i = 0; i < grid.length; i++) { var x = (i % cols) * s, y = (i / cols | 0) * s, dec = R() < .004; if (ptr.active && Math.hypot(x - ptr.x, y - ptr.y) < 90 && R() < .08) dec = true; if (dec) grid[i] = 0; else if (!grid[i] && R() < .0008) grid[i] = 1; if (!grid[i]) continue; ctx.fillStyle = R() < .1 ? AC : DIM; ctx.globalAlpha = .5; ctx.fillRect(x, y, s - 3, s - 3); }
          ctx.globalAlpha = 1;
        }
      };
    },
    pulse: function () {
      var count = Number(opts.count || 1), nodes, t = 0;
      return {
        init: function () { nodes = []; for (var i = 0; i < count; i++) nodes.push({ x: W * (count === 1 ? .5 : (i + 1) / (count + 1)), y: H * .5 }); },
        frame: function () {
          t += .02; ctx.clearRect(0, 0, W, H);
          if (count === 2) { ctx.strokeStyle = DIM; ctx.globalAlpha = .6; ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[1].x, nodes[1].y); ctx.stroke(); ctx.globalAlpha = 1; }
          for (var i = 0; i < nodes.length; i++) { var n = nodes[i], tx = W * (count === 1 ? .5 : (i + 1) / (count + 1)), ty = H * .5; if (ptr.active) { tx += (ptr.x - W / 2) * .04; ty += (ptr.y - H / 2) * .04; } n.x += (tx - n.x) * .05; n.y += (ty - n.y) * .05; var base = Math.min(W, H) * .12, r = base + Math.sin(t + i) * base * .3; ctx.strokeStyle = AC; ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 6.283); ctx.stroke(); ctx.globalAlpha = .8; ctx.fillStyle = AC; ctx.beginPath(); ctx.arc(n.x, n.y, 2.5, 0, 6.283); ctx.fill(); }
          ctx.globalAlpha = 1;
        }
      };
    },
    // stein: the same line rising, each time a little more insisted
    insist: function () {
      var phrases = ["a box is a box is a box", "the difference is spreading",
        "begin again and again", "not to red but to point again", "no repetition only insistence"];
      var lh = 22, lines, seed;
      function vary(s) { var w = s.split(" "); return (R() < .45 && w.length > 3) ? s + " " + w.slice(-3).join(" ") : s; }
      return {
        init: function () { seed = phrases[R() * phrases.length | 0]; lines = []; for (var y = 0; y < Math.ceil(H / lh) + 2; y++) lines.push({ y: y * lh, t: vary(seed) }); },
        click: function () { seed = phrases[R() * phrases.length | 0]; },
        frame: function () {
          ctx.clearRect(0, 0, W, H); ctx.font = "13px " + MONO; ctx.globalAlpha = .5;
          var speed = ptr.active ? .8 : .3;
          for (var i = 0; i < lines.length; i++) { var L = lines[i]; L.y -= speed; ctx.fillStyle = DIM; ctx.fillText(L.t, 22, L.y); }
          if (lines.length && lines[0].y < -lh) { var g = lines.shift(); g.y = lines[lines.length - 1].y + lh; g.t = vary(seed); lines.push(g); }
          ctx.globalAlpha = 1;
        }
      };
    }
  };

  toy = (TOYS[name] || TOYS.pulse)();
  resize();
  window.addEventListener("resize", resize, { passive: true });
  if (reduce) { toy.frame(); return; }
  var raf; (function loop() { toy.frame(); raf = requestAnimationFrame(loop); })();
  window.addEventListener("pagehide", function () { cancelAnimationFrame(raf); }, { once: true });
})();
