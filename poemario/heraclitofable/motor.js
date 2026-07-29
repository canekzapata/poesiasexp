/* ============================================================================
   HERÁCLITO FABLE · motor
   ----------------------------------------------------------------------------
   Instrumento audiovisual en vivo. No es un video: es algo que se toca.
   Proyección pseudo-3D: los caracteres emergen del punto de fuga y crecen
   hacia ti (starfield). Los estallas. Lo enorme habla (vocoder-oráculo).
   ========================================================================== */
(() => {
  "use strict";

  const C = window.HFABLE_CORPUS;
  const $ = (s) => document.querySelector(s);
  const field = $("#field");
  const islandLayer = $("#islands");
  const hudMov = $("#mov");
  const hudInt = $("#intensity");
  const hudMsg = $("#msg");
  const legend = $("#legend");
  const flash = $("#flash");

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* --- movimientos --------------------------------------------------------- */
  const MOVES = [
    { id: 1, name: "I · LOGOS",        pool: "logos",        glyphBias: 0.85, bigBias: 0.02, rate: 1600, speed: 0.55, drone: 46 },
    { id: 2, name: "II · PÓLEMOS",     pool: "polemos",      glyphBias: 0.45, bigBias: 0.10, rate: 1050, speed: 0.85, drone: 58 },
    { id: 3, name: "III · HIPERSTICIÓN", pool: "hipersticion", glyphBias: 0.30, bigBias: 0.22, rate: 620,  speed: 1.25, drone: 74 },
    { id: 4, name: "IV · GLOSOLALIA",  pool: "glosolalia",   glyphBias: 0.15, bigBias: 0.55, rate: 900,  speed: 0.95, drone: 88 },
    { id: 5, name: "V · CENIZA",       pool: "ceniza",       glyphBias: 0.60, bigBias: 0.08, rate: 1400, speed: 0.70, drone: 40 },
  ];

  const state = {
    move: 0,
    intensity: 0.4,          // 0..1, tú lo empujas con ↑/↓
    invaders: [],
    max: 70,
    spawnAcc: 0,
    running: true,
    ceniza: false,           // colapso final
    last: performance.now(),
  };

  /* ======================================================================
     AUDIO · Web Audio API — instrumento en vivo
     Pad afinado a escala por movimiento + sub + río (hiss) + pulso
     generativo + estallidos-campana + voz-máquina. Compresor de seguridad
     y bus de espacio (delay con realimentación) para las colas.
     ==================================================================== */
  const Audio = (() => {
    let ctx, master, limiter, space, spaceGain, padGain, padFilter, sub, subGain, hiss, hissGain;
    let pads = [];           // osciladores del pad
    let ready = false, muted = false;
    let schedTimer = null, nextPulse = 0;

    // acorde/modo por movimiento (ratios sobre la fundamental)
    const CHORD = {
      1: [1, 1.5, 2, 3],           // Logos: quintas abiertas, sereno
      2: [1, 1.2, 1.5, 1.8],       // Pólemos: menor con tensión
      3: [1, 1.26, 1.5, 1.78],     // Hiperstición: inestable
      4: [1, 1.5, 2, 2.5, 3],      // Glosolalia: suspendido, brillante
      5: [1, 1.19, 1.5, 0.5],      // Ceniza: menor oscuro + sub
    };
    // escala pentatónica menor para el pulso (ratios sobre 2×fundamental)
    const SCALE = [1, 1.2, 1.333, 1.5, 1.8, 2, 2.4];
    const cur = { root: 46, intensity: 0.4, id: 1 };

    function ensure() {
      if (ready) { if (ctx.state === "suspended") ctx.resume(); return; }
      ctx = new (window.AudioContext || window.webkitAudioContext)();

      limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -8; limiter.knee.value = 8; limiter.ratio.value = 12;
      limiter.attack.value = 0.003; limiter.release.value = 0.25;
      limiter.connect(ctx.destination);

      master = ctx.createGain(); master.gain.value = 0.85; master.connect(limiter);

      // bus de espacio: delay con realimentación (reverberación barata)
      space = ctx.createDelay(1.0); space.delayTime.value = 0.33;
      const fb = ctx.createGain(); fb.gain.value = 0.42;
      const damp = ctx.createBiquadFilter(); damp.type = "lowpass"; damp.frequency.value = 2600;
      space.connect(damp); damp.connect(fb); fb.connect(space);
      spaceGain = ctx.createGain(); spaceGain.gain.value = 0.5;
      space.connect(spaceGain); spaceGain.connect(master);

      // pad (4 osciladores retuneables) → filtro → master
      padGain = ctx.createGain(); padGain.gain.value = 0.0;
      padFilter = ctx.createBiquadFilter(); padFilter.type = "lowpass";
      padFilter.frequency.value = 400; padFilter.Q.value = 4;
      padGain.connect(padFilter); padFilter.connect(master); padFilter.connect(space);
      pads = [];
      for (let i = 0; i < 4; i++) {
        const o = ctx.createOscillator(); o.type = i % 2 ? "sine" : "sawtooth";
        const g = ctx.createGain(); g.gain.value = 0.25;
        o.connect(g); g.connect(padGain); o.start();
        pads.push({ o, g });
      }
      // LFO lento sobre el corte del filtro = respiración
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.07;
      const lg = ctx.createGain(); lg.gain.value = 140;
      lfo.connect(lg); lg.connect(padFilter.frequency); lfo.start();

      // sub (peso)
      sub = ctx.createOscillator(); sub.type = "sine"; sub.frequency.value = 46;
      subGain = ctx.createGain(); subGain.gain.value = 0.0;
      sub.connect(subGain); subGain.connect(master); sub.start();

      // río: ruido filtrado
      const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
      hiss = ctx.createBufferSource(); hiss.buffer = buf; hiss.loop = true;
      const hf = ctx.createBiquadFilter(); hf.type = "bandpass"; hf.frequency.value = 1100; hf.Q.value = 0.6;
      hissGain = ctx.createGain(); hissGain.gain.value = 0.015;
      hiss.connect(hf); hf.connect(hissGain); hissGain.connect(master); hiss.start();

      ready = true;
      retune(1, 46, cur.intensity);
      padGain.gain.setTargetAtTime(0.13, ctx.currentTime, 2.0);
      nextPulse = ctx.currentTime + 0.5;
      schedTimer = setInterval(scheduler, 60);
    }

    function retune(id, root, intensity) {
      if (!ready) return;
      cur.id = id; cur.root = root; cur.intensity = intensity;
      const t = ctx.currentTime;
      const chord = CHORD[id] || CHORD[1];
      pads.forEach((p, i) => {
        const ratio = chord[i % chord.length];
        const det = 1 + (i - 1.5) * 0.004;             // leve desafinación = ancho
        p.o.frequency.setTargetAtTime(root * ratio * det, t, 0.7);
        p.g.gain.setTargetAtTime(muted ? 0 : 0.22, t, 0.7);
      });
      sub.frequency.setTargetAtTime(root / 2, t, 0.7);
      subGain.gain.setTargetAtTime(muted ? 0 : 0.10 + intensity * 0.10, t, 0.8);
      padFilter.frequency.setTargetAtTime(360 + intensity * 3200, t, 0.8);
      padGain.gain.setTargetAtTime(muted ? 0 : 0.11 + intensity * 0.09, t, 0.8);
      hissGain.gain.setTargetAtTime(muted ? 0 : 0.008 + intensity * 0.05, t, 0.8);
    }
    // firma compatible con los llamadores previos (root, intensity, moveId)
    function setDrone(root, intensity, id) { retune(id || cur.id, root, intensity); }

    // pulso generativo: campanas sobre la escala, según intensidad/movimiento
    function scheduler() {
      if (!ready) return;
      const pulseMoves = { 1: 0.15, 2: 0.7, 3: 1.0, 4: 0.85, 5: 0.3 };
      const density = pulseMoves[cur.id] ?? 0.5;
      while (nextPulse < ctx.currentTime + 0.15) {
        if (!muted && Math.random() < density) {
          const ratio = pick(SCALE);
          bell(cur.root * 2 * ratio, 0.9 + Math.random() * 1.4, 0.05 + cur.intensity * 0.05, true);
        }
        const beat = clamp(0.85 - cur.intensity * 0.5, 0.16, 0.85);
        nextPulse += beat * (Math.random() < 0.25 ? 2 : 1);
      }
    }

    // campana FM corta (musical), opcionalmente al bus de espacio
    function bell(freq, dur, vel, toSpace) {
      if (!ready) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
      const m = ctx.createOscillator(); m.type = "sine"; m.frequency.value = freq * 2.01;
      const mg = ctx.createGain(); mg.gain.value = freq * 1.2;
      mg.gain.setTargetAtTime(0, t, dur * 0.4);
      m.connect(mg); mg.connect(o.frequency);
      const g = ctx.createGain(); g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(vel, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(master); if (toSpace) g.connect(space);
      o.start(t); m.start(t); o.stop(t + dur + 0.05); m.stop(t + dur + 0.05);
    }

    // estallido: transitorio de ruido + campana afinada a la escala
    function boom(size) {
      if (!ready || muted) return;
      const t = ctx.currentTime;
      const n = ctx.createBufferSource();
      const len = 0.26;
      const b = ctx.createBuffer(1, ctx.sampleRate * len, ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2.2);
      n.buffer = b;
      const f = ctx.createBiquadFilter(); f.type = "bandpass";
      f.frequency.value = clamp(1600 - size * 240, 200, 1800); f.Q.value = 1.6;
      const g = ctx.createGain(); g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.001, t + len);
      n.connect(f); f.connect(g); g.connect(master); g.connect(space); n.start(t);
      // campana afinada: el sentido que nace
      bell(cur.root * 2 * pick(SCALE) / (size > 2 ? 2 : 1), 1.1 + size * 0.2, 0.10, true);
      // sub-golpe grave
      const o = ctx.createOscillator(); o.type = "triangle";
      o.frequency.setValueAtTime(clamp(150 - size * 14, 45, 150), t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.28);
      const og = ctx.createGain(); og.gain.value = 0.0001;
      og.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      o.connect(og); og.connect(master); o.start(t); o.stop(t + 0.32);
    }

    // impacto (invasor que llegó sin ser estallado): golpe seco y grave
    function impact() {
      if (!ready || muted) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.14);
      const g = ctx.createGain(); g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.22);
    }

    // voz-máquina: formantes que barren mientras habla el oráculo
    function tongue(dur) {
      if (!ready || muted) return;
      const t = ctx.currentTime;
      [cur.root * 8, cur.root * 14, cur.root * 26].forEach((f0, i) => {
        const o = ctx.createOscillator(); o.type = i === 0 ? "sawtooth" : "sine";
        o.frequency.value = f0;
        const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = f0; bp.Q.value = 9;
        const g = ctx.createGain(); g.gain.value = 0.0;
        g.gain.linearRampToValueAtTime(0.05 / (i + 1), t + 0.1);
        g.gain.setValueAtTime(0.05 / (i + 1), t + dur - 0.25);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        const v = ctx.createOscillator(); v.frequency.value = rnd(4, 7);
        const vg = ctx.createGain(); vg.gain.value = f0 * 0.04;
        v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + dur);
        o.connect(bp); bp.connect(g); g.connect(master); g.connect(space);
        o.start(t); o.stop(t + dur + 0.05);
      });
    }

    function duck(down) {
      if (!ready) return;
      master.gain.setTargetAtTime(down ? 0.4 : 0.85, ctx.currentTime, 0.2);
    }

    function toggleMute() {
      muted = !muted;
      if (ready) retune(cur.id, cur.root, cur.intensity);
      return muted;
    }

    return { ensure, setDrone, boom, impact, tongue, duck, toggleMute, get muted() { return muted; } };
  })();

  /* ======================================================================
     VOZ · speechSynthesis en español (el oráculo dice palabras)
     ==================================================================== */
  const Voice = (() => {
    let voice = null;
    function loadVoice() {
      const vs = speechSynthesis.getVoices();
      voice = vs.find(v => /^es/i.test(v.lang) && /mexi|latin|american/i.test(v.name))
           || vs.find(v => /^es/i.test(v.lang)) || vs[0] || null;
    }
    if ("speechSynthesis" in window) {
      loadVoice();
      speechSynthesis.onvoiceschanged = loadVoice;
    }
    function speak(text, big) {
      if (!("speechSynthesis" in window) || !text) return 2.2;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.lang = voice ? voice.lang : "es-ES";
      u.rate = big ? 0.72 : 0.9;      // lento = ritual
      u.pitch = big ? 0.35 : 0.5;     // grave = máquina
      u.volume = 1;
      speechSynthesis.speak(u);
      // duración estimada para sincronizar la capa de formantes
      return clamp(text.length / (big ? 7 : 10), 1.4, 9);
    }
    return { speak };
  })();

  /* ======================================================================
     PALIMPSESTO · cluster de glifos que chocan
     Cuatro (o más) caracteres de escrituras distintas impresos casi encima:
     sus trazos colisionan y nace un glifo imposible. A veces un combinante
     se apila sobre el anterior (choque real de diacrítico).
     ==================================================================== */
  const SCRIPT_KEYS = C.scripts ? Object.keys(C.scripts) : [];
  function pickGlyph() {
    if (!SCRIPT_KEYS.length) return pick(C.glyphs);
    return pick(C.scripts[pick(SCRIPT_KEYS)]);
  }
  // devuelve un elemento .cluster con n glifos superpuestos
  function buildCluster(n) {
    const wrap = document.createElement("div");
    wrap.className = "cluster";
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.className = "gch";
      let ch = pickGlyph();
      // ~35% de las veces cuelga un diacrítico combinante que se apila
      if (C.combinantes && Math.random() < 0.35) ch += pick(C.combinantes);
      s.textContent = ch;
      // colisión: offsets pequeños respecto al centro + rotación + escala
      const dx = rnd(-0.22, 0.22), dy = rnd(-0.22, 0.22);
      const rot = rnd(-24, 24), sc = rnd(0.82, 1.28);
      s.style.transform = `translate(-50%,-50%) translate(${dx}em,${dy}em) rotate(${rot}deg) scale(${sc})`;
      s.style.opacity = rnd(0.82, 1).toFixed(2);
      wrap.appendChild(s);
    }
    return wrap;
  }

  /* ======================================================================
     INVASORES · proyección pseudo-3D
     ==================================================================== */
  function contentFor(mv) {
    const r = Math.random();
    if (r < mv.glyphBias) {
      // cluster palimpsesto de 3–5 glifos; a veces gigante
      const n = 3 + (Math.random() * 3 | 0);
      const big = Math.random() < mv.bigBias * 0.8;
      return { kind: "glyph", cluster: n, frag: null, big };
    }
    const frag = pick(C[mv.pool]);
    const big = Math.random() < mv.bigBias;
    return { kind: big ? "big" : "text", text: frag.es, frag, big };
  }

  function spawn() {
    if (state.invaders.length >= state.max) return;
    const mv = MOVES[state.move];
    const c = contentFor(mv);
    const el = document.createElement("div");
    el.className = "inv " + (c.big && c.kind === "glyph" ? "glyph big" : c.kind);

    let textPayload = c.text || "";
    let inner;                              // elemento interno que el loop NO toca
    if (c.kind === "glyph") {
      inner = buildCluster(c.cluster);
      el.appendChild(inner);
      textPayload = "";                     // los glifos no se leen
    } else {
      inner = document.createElement("span"); inner.className = "es"; inner.textContent = c.text;
      el.appendChild(inner);
      if (c.frag && c.frag.gr) {
        const g = document.createElement("span"); g.className = "gr"; g.textContent = c.frag.gr;
        el.appendChild(g);
      }
    }

    // animaciones WebKit (color/filtro en el .inv; deriva/wobble en el interno,
    // porque el loop reescribe transform/opacity del wrapper cada frame)
    el.style.setProperty("--adur", rnd(3, 9).toFixed(1) + "s");
    if (Math.random() < 0.5) el.classList.add(pick(["anim-chroma", "anim-throb"]));
    if (Math.random() < 0.4) { inner.classList.add("anim-wobble"); inner.style.setProperty("--adur", rnd(2.5, 6).toFixed(1) + "s"); }

    const inv = {
      el, kind: c.kind, text: textPayload, frag: c.frag, big: !!c.big,
      x: rnd(-0.9, 0.9), y: rnd(-0.9, 0.9),
      z: 1.0,
      vz: rnd(0.7, 1.3) * (c.big ? 0.72 : 1),
      spin: rnd(-14, 14),
      hue: pick(["a", "b", "c", "d", "e"]),
      dead: false,
    };
    if (Math.abs(inv.x) < 0.12 && Math.abs(inv.y) < 0.12) inv.x += 0.3; // evita el centro exacto
    el.style.setProperty("--hue", `var(--${inv.hue})`);
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); explode(inv); });
    field.appendChild(el);
    state.invaders.push(inv);
  }

  function project(inv) {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    const sx = cx + (inv.x / inv.z) * cx * 0.92;
    const sy = cy + (inv.y / inv.z) * cy * 0.92;
    const scale = clamp(0.12 / inv.z, 0.12, 7) * (inv.big ? 1.7 : 1);
    return { sx, sy, scale };
  }

  function explode(inv) {
    if (inv.dead) return;
    inv.dead = true;
    const { sx, sy, scale } = project(inv);
    Audio.boom(scale);

    // partículas de caracteres (de un cluster salen sus propios glifos)
    let chars;
    if (inv.kind === "glyph") chars = [...inv.el.querySelectorAll(".gch")].map(s => s.textContent);
    else chars = inv.text.slice(0, 14).split("");
    if (!chars.length) chars = [pickGlyph(), pickGlyph(), pickGlyph()];
    for (let i = 0; i < Math.max(8, chars.length); i++) {
      const p = document.createElement("span");
      p.className = "shard";
      p.textContent = chars[i % chars.length] || pick(C.glyphs);
      const ang = rnd(0, Math.PI * 2), dist = rnd(40, 200) * clamp(scale, .4, 3);
      p.style.left = sx + "px"; p.style.top = sy + "px";
      p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
      p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
      p.style.color = getComputedStyle(inv.el).getPropertyValue("--hue");
      field.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }

    // πόλεμος genera sentido: si tenía fragmento, se vuelve legible (isla) y el oráculo puede hablar
    if (inv.frag) {
      releaseIsland(inv.frag);
      if (inv.big || state.move === 3) speakFragment(inv.frag, inv.big);
    }
    kill(inv);
  }

  function kill(inv) {
    inv.dead = true;
    inv.el.remove();
    const i = state.invaders.indexOf(inv);
    if (i >= 0) state.invaders.splice(i, 1);
  }

  /* ======================================================================
     ISLAS LEGIBLES · lo que πόλεμος libera del ruido
     ==================================================================== */
  function releaseIsland(frag) {
    const isl = document.createElement("figure");
    isl.className = "island";
    isl.style.left = rnd(6, 62) + "vw";
    isl.style.top = rnd(10, 66) + "vh";
    isl.style.setProperty("--ih", `var(--${pick(["a", "b", "c", "d"])})`);
    isl.innerHTML =
      `<p class="es">${frag.es}</p>` +
      (frag.gr ? `<p class="gr">${frag.gr}</p>` : "") +
      (frag.via ? `<figcaption>${frag.via}</figcaption>` : "");
    isl.dataset.text = frag.es;         // para que el oráculo pueda leerla
    islandLayer.appendChild(isl);
    // las islas también son mortales: se desvanecen (panta rhei)
    setTimeout(() => { isl.classList.add("fade"); setTimeout(() => isl.remove(), 2500); }, rnd(9000, 16000));
  }

  /* ======================================================================
     ORÁCULO · el vocoder lee. speakFragment lee uno dado; speakRandom lee
     ALGO que esté ahora en pantalla (el gesto que pediste).
     ==================================================================== */
  function speakFragment(frag, big) {
    const dur = Voice.speak(frag.es, big);
    Audio.tongue(dur); Audio.duck(true);
    triggerGiantText(frag.es);
    setTimeout(() => Audio.duck(false), dur * 1000 + 200);
  }

  function speakRandom() {
    // reúne todo el texto legible que exista ahora mismo en pantalla
    const pool = [];
    state.invaders.forEach(i => { if (i.frag) pool.push(i.frag); });
    islandLayer.querySelectorAll(".island").forEach(el => {
      pool.push({ es: el.dataset.text, gr: "", via: "en pantalla" });
    });
    if (!pool.length) { flashMsg("nada legible en pantalla · deja que πόλεμος libere algo"); return; }
    const frag = pick(pool);
    speakFragment(frag, true);
    flashMsg("ORÁCULO: " + frag.es);
  }

  /* texto gigante que llena la pantalla cuando habla la máquina */
  let giantTimer = null;
  function triggerGiantText(text) {
    const g = $("#giant");
    g.textContent = text;
    g.classList.add("on");
    clearTimeout(giantTimer);
    giantTimer = setTimeout(() => g.classList.remove("on"), 4200);
  }

  /* ======================================================================
     LOOP
     ==================================================================== */
  function loop(now) {
    const dt = Math.min(64, now - state.last) / 1000;
    state.last = now;
    const mv = MOVES[state.move];

    if (state.running && !state.ceniza) {
      state.spawnAcc += dt * 1000;
      const rate = mv.rate / (0.5 + state.intensity * 1.6);
      while (state.spawnAcc > rate) { spawn(); state.spawnAcc -= rate; }
    }

    const spd = mv.speed * (0.5 + state.intensity * 1.5);
    for (let i = state.invaders.length - 1; i >= 0; i--) {
      const inv = state.invaders[i];
      inv.z -= spd * inv.vz * dt * 0.28;
      const { sx, sy, scale } = project(inv);

      if (inv.z < 0.085) {                    // llegó a ti sin ser estallado
        if (!state.ceniza) { Audio.impact(); screenShake(); }
        kill(inv);
        continue;
      }
      if ((sx < -200 || sx > innerWidth + 200 || sy < -200 || sy > innerHeight + 200) && inv.z < 0.5) {
        kill(inv); continue;                  // salió de cuadro
      }
      const rot = inv.spin * (1 - inv.z);
      inv.el.style.transform =
        `translate3d(${sx}px,${sy}px,0) translate(-50%,-50%) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(1)}deg)`;
      inv.el.style.opacity = clamp(1.15 - inv.z, 0.15, 1).toFixed(2);
    }

    // en CENIZA todo se apaga hacia el río
    if (state.ceniza && state.invaders.length === 0) { state.ceniza = false; setMove(0); }

    requestAnimationFrame(loop);
  }

  /* ======================================================================
     GESTOS EN VIVO
     ==================================================================== */
  function setMove(i) {
    state.move = clamp(i, 0, MOVES.length - 1);
    const mv = MOVES[state.move];
    hudMov.textContent = mv.name;
    Audio.setDrone(mv.drone, state.intensity, mv.id);
    document.body.dataset.move = mv.id;
    if (mv.id === 5) startCeniza();
  }

  function setIntensity(v) {
    state.intensity = clamp(v, 0, 1);
    hudInt.textContent = "▓".repeat(Math.round(state.intensity * 10)).padEnd(10, "░");
    const mv = MOVES[state.move];
    Audio.setDrone(mv.drone, state.intensity, mv.id);
  }

  function burst(n) { for (let i = 0; i < n; i++) setTimeout(spawn, i * 40); }

  function startCeniza() {
    state.ceniza = true;
    // colapso: estallar todo lo que quede, en cascada
    const list = [...state.invaders];
    list.forEach((inv, k) => setTimeout(() => { if (!inv.dead) explode(inv); }, k * 90));
    flashMsg("CENIZA · y otra vez la corriente");
  }

  function screenShake() {
    document.body.classList.remove("shake"); void document.body.offsetWidth;
    document.body.classList.add("shake");
    flash.classList.add("on"); setTimeout(() => flash.classList.remove("on"), 90);
  }

  function flashMsg(t) {
    hudMsg.textContent = t;
    hudMsg.classList.add("on");
    clearTimeout(flashMsg._t);
    flashMsg._t = setTimeout(() => hudMsg.classList.remove("on"), 3200);
  }

  /* ======================================================================
     ENTRADA · mouse + teclado (el instrumento)
     ==================================================================== */
  function start() {
    Audio.ensure();
    $("#veil").classList.add("gone");
    setMove(0); setIntensity(0.4);
    flashMsg("el río empieza · pulsa H para ver los controles");
  }

  addEventListener("keydown", (e) => {
    if (e.repeat && !["ArrowUp", "ArrowDown"].includes(e.key)) return;
    switch (e.key) {
      case "1": case "2": case "3": case "4": case "5":
        Audio.ensure(); setMove(+e.key - 1); break;
      case " ": e.preventDefault(); Audio.ensure(); burst(6 + (state.intensity * 10 | 0)); break;
      case "ArrowUp": setIntensity(state.intensity + 0.06); break;
      case "ArrowDown": setIntensity(state.intensity - 0.06); break;
      case "v": case "V": Audio.ensure(); speakRandom(); break;               // oráculo lee lo que esté en pantalla
      case "b": case "B": Audio.ensure(); spawnGiant(); break;                // invoca un texto enorme que hablará
      case "Enter": Audio.ensure(); setMove(3); burst(4); speakRandom(); break; // trance instantáneo
      case "m": case "M": flashMsg(Audio.toggleMute() ? "silencio" : "sonido"); break;
      case "c": case "C": clearIslands(); break;
      case "h": case "H": legend.classList.toggle("on"); break;
      case "f": case "F": toggleFull(); break;
    }
  });

  // invoca un invasor grande garantizado (para el clímax)
  function spawnGiant() {
    const frag = pick(C.glosolalia);
    const el = document.createElement("div");
    el.className = "inv big";
    const t = document.createElement("span"); t.className = "es"; t.textContent = frag.es; el.appendChild(t);
    if (frag.gr) { const g = document.createElement("span"); g.className = "gr"; g.textContent = frag.gr; el.appendChild(g); }
    const inv = { el, kind: "big", text: frag.es, frag, big: true,
      x: rnd(-0.4, 0.4), y: rnd(-0.4, 0.4), z: 1, vz: 0.6, spin: rnd(-6, 6),
      hue: pick(["a", "c", "d"]), dead: false };
    el.style.setProperty("--hue", `var(--${inv.hue})`);
    el.addEventListener("pointerdown", (ev) => { ev.preventDefault(); explode(inv); });
    field.appendChild(el); state.invaders.push(inv);
    flashMsg("algo enorme se acerca…");
  }

  function clearIslands() {
    islandLayer.querySelectorAll(".island").forEach(el => { el.classList.add("fade"); setTimeout(() => el.remove(), 500); });
  }

  function toggleFull() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  $("#veil").addEventListener("pointerdown", start, { once: true });
  addEventListener("keydown", function once() { start(); removeEventListener("keydown", once); }, { once: true });

  requestAnimationFrame(loop);
})();
