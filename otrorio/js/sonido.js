(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var storageKey = "otrorio.sound.enabled";
  var enabled = false;
  var started = false;
  var engine = null;
  var step = 0;

  try { enabled = localStorage.getItem(storageKey) === "1"; } catch (error) { enabled = false; }

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

  var rng = rngFrom(seed + ":tone:" + (config.id || config.topology || "portal"));
  var scales = [
    ["C2", "D#2", "F2", "G2", "A#2", "C3", "D#3"],
    ["D2", "E2", "F2", "A2", "C3", "D3", "F3"],
    ["C2", "C#2", "E2", "F#2", "G2", "A#2", "C3"],
    ["A1", "C2", "D2", "E2", "G2", "A2", "C3"]
  ];
  var scale = scales[(Number(config.cellularRule || 30) + hash32(config.topology || "portal")) % scales.length];

  function store(value) {
    enabled = value;
    try { localStorage.setItem(storageKey, value ? "1" : "0"); } catch (error) { /* el sonido puede no recordar */ }
    updateControls();
  }

  function updateControls() {
    document.documentElement.dataset.sound = started ? "on" : enabled ? "armed" : "off";
    Array.prototype.forEach.call(document.querySelectorAll("#sound-entry, [data-operation='sound']"), function (control) {
      control.setAttribute("aria-pressed", started ? "true" : "false");
      if (control.id === "sound-entry") control.textContent = started ? "silenciar el río" : enabled ? "sonido esperando gesto" : "entrar con sonido";
    });
  }

  function build() {
    if (engine || !global.Tone) return engine;
    var Tone = global.Tone;
    var master = new Tone.Volume(-17).toDestination();
    var filter = new Tone.Filter({ frequency: 780 + Number(config.cellularRule || 30) * 11, type: "lowpass", rolloff: -24 }).connect(master);
    var delay = new Tone.FeedbackDelay({ delayTime: ["8n", "8t", "4n"][hash32(config.id || "0") % 3], feedback: .18 + rng() * .17, wet: .24 }).connect(master);
    filter.connect(delay);
    var synth = new Tone.PolySynth(Tone.FMSynth).connect(filter);
    synth.volume.value = -13;
    var noise = new Tone.NoiseSynth({
      volume: -27,
      noise: { type: rng() < .5 ? "pink" : "brown" },
      envelope: { attack: .01, decay: .16, sustain: 0, release: .18 }
    }).connect(filter);
    var pulse = new Tone.MembraneSynth({ volume: -24, pitchDecay: .08, octaves: 2 }).connect(master);
    var transport = Tone.getTransport();
    transport.bpm.value = 48 + (Number(config.cellularRule || 30) % 43);
    transport.swing = ((Number(config.index || 0) % 5) * .07);
    var interval = ["2n", "2t", "1m", "4n."][hash32(config.topology || "portal") % 4];
    var loop = new Tone.Loop(function (time) {
      var local = rngFrom(seed + ":tone-step:" + (config.id || "portal") + ":" + step++);
      if (local() < .68) {
        var note = scale[Math.floor(local() * scale.length)];
        synth.triggerAttackRelease(note, local() < .3 ? "16n" : "8n", time, .12 + local() * .22);
      }
      if (local() < .23) noise.triggerAttackRelease("32n", time, .08 + local() * .12);
      if (local() < .12) pulse.triggerAttackRelease(scale[0], "16n", time, .1);
    }, interval).start(0);
    engine = { master: master, filter: filter, delay: delay, synth: synth, noise: noise, pulse: pulse, transport: transport, loop: loop };
    return engine;
  }

  function eventNote(type) {
    if (!started || !engine || !global.Tone) return;
    var index = hash32(type + ":" + step + ":" + (config.id || "portal")) % scale.length;
    var note = scale[index];
    var now = global.Tone.now();
    if (type === "destruccion" || type === "ruido") engine.noise.triggerAttackRelease("16n", now, .16);
    else if (type === "canibal") {
      engine.synth.triggerAttackRelease([note, scale[(index + 3) % scale.length]], "8n", now, .22);
      engine.filter.frequency.rampTo(420 + (index * 190), .18);
    } else if (type === "grafica" || type === "automata") engine.synth.triggerAttackRelease(note, "16n", now, .18);
    else if (type === "enlace" || type === "ventana") engine.pulse.triggerAttackRelease(note, "32n", now, .13);
  }

  async function start() {
    if (!global.Tone) {
      document.documentElement.dataset.sound = "missing";
      return false;
    }
    try {
      await global.Tone.start();
      var e = build();
      if (!e) return false;
      e.master.mute = false;
      if (e.transport.state !== "started") e.transport.start("+0.05");
      started = true;
      store(true);
      if (global.LabEvents) global.LabEvents.record("sonido", "Tone.js comenzó con regla " + (config.cellularRule || "umbral"), "sonido:" + (config.id || "portal"));
      return true;
    } catch (error) {
      document.documentElement.dataset.sound = "error";
      return false;
    }
  }

  function stop() {
    if (engine) {
      engine.master.mute = true;
      if (engine.transport.state === "started") engine.transport.pause();
    }
    started = false;
    store(false);
  }

  function toggle() {
    if (started) { stop(); return Promise.resolve(false); }
    store(true);
    return start();
  }

  function arm() {
    if (!enabled || started) return;
    var awaken = function (event) {
      if (event.target && event.target.closest && event.target.closest("#sound-entry, [data-operation='sound']")) return;
      document.removeEventListener("pointerdown", awaken, true);
      document.removeEventListener("keydown", awaken, true);
      start();
    };
    document.addEventListener("pointerdown", awaken, true);
    document.addEventListener("keydown", awaken, true);
  }

  function init() {
    updateControls();
    var entry = document.getElementById("sound-entry");
    if (entry) entry.addEventListener("click", function () { toggle(); });
    arm();
    global.addEventListener("lab:acontecimiento", function (event) {
      if (event.detail && event.detail.type) eventNote(event.detail.type);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && started) {
        engine.master.mute = !engine.master.mute;
        document.documentElement.dataset.sound = engine.master.mute ? "muted" : "on";
      }
    });
    global.addEventListener("pagehide", function () {
      if (engine && engine.transport.state === "started") engine.transport.pause();
    }, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabSound = Object.freeze({ start: start, stop: stop, toggle: toggle, event: eventNote, isEnabled: function () { return enabled; }, isStarted: function () { return started; } });
})(window);
