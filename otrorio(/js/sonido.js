(function (global) {
  "use strict";

  if (global.LabSound) return;

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var storageKey = "otrorio.sound.enabled";
  var messageType = "otrorio:sonido";
  var ownsAudio = true;
  var enabled = false;
  var started = false;
  var engine = null;
  var step = 0;
  var tonePromise = null;
  var startPromise = null;
  var awakenHandler = null;
  var entryControl = null;
  var entryHandler = null;
  var eventHandler = null;
  var messageHandler = null;
  var keyHandler = null;
  var initialized = false;
  var disposed = false;

  try { ownsAudio = global.top === global.self; } catch (error) { ownsAudio = true; }
  try { enabled = localStorage.getItem(storageKey) === "1"; } catch (error) { enabled = false; }

  var currentScript = document.currentScript && document.currentScript.src;
  var toneURL = currentScript ? new URL("../vendor/Tone.js", currentScript).href : (config.id ? "../vendor/Tone.js" : "vendor/Tone.js");

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

  function ownerAPI() {
    if (ownsAudio) return null;
    try {
      return global.top && global.top.LabSound ? global.top.LabSound : null;
    } catch (error) {
      return null;
    }
  }

  function relay(action, detail) {
    var owner = ownerAPI();
    if (owner && typeof owner[action] === "function") return owner[action](detail);
    try { global.parent.postMessage({ type: messageType, action: action, detail: detail || null }, "*"); } catch (error) { /* el marco no encontró la superficie */ }
    return action === "event" ? undefined : Promise.resolve(false);
  }

  function store(value) {
    enabled = value;
    try { localStorage.setItem(storageKey, value ? "1" : "0"); } catch (error) { /* el sonido puede no recordar */ }
    updateControls();
  }

  function ownerState(name, fallback) {
    var owner = ownerAPI();
    if (owner && typeof owner[name] === "function") return owner[name]();
    return fallback;
  }

  function updateControls() {
    var audible = ownsAudio ? started : ownerState("isStarted", false);
    var armed = ownsAudio ? enabled : ownerState("isEnabled", enabled);
    document.documentElement.dataset.sound = ownsAudio ? (audible ? "on" : armed ? "armed" : "off") : "delegated";
    Array.prototype.forEach.call(document.querySelectorAll("#sound-entry, [data-operation='sound']"), function (control) {
      control.setAttribute("aria-pressed", audible ? "true" : "false");
      if (control.id === "sound-entry") control.textContent = audible ? "silenciar el río" : ownsAudio && armed ? "sonido esperando gesto" : ownsAudio ? "entrar con sonido" : "sonido en la superficie";
    });
  }

  function loadTone() {
    if (!ownsAudio) return Promise.resolve(null);
    if (global.Tone) return Promise.resolve(global.Tone);
    if (tonePromise) return tonePromise;
    document.documentElement.dataset.sound = "loading";
    tonePromise = new Promise(function (resolve, reject) {
      var script = document.querySelector("script[data-tone-lazy]");
      var finish = function () {
        if (global.Tone) resolve(global.Tone);
        else reject(new Error("Tone.js terminó de cargar sin exponer Tone"));
      };
      var fail = function () {
        tonePromise = null;
        reject(new Error("No se pudo cargar Tone.js desde " + toneURL));
      };
      if (script) {
        script.addEventListener("load", finish, { once: true });
        script.addEventListener("error", fail, { once: true });
        return;
      }
      script = document.createElement("script");
      script.src = toneURL;
      script.async = true;
      script.dataset.toneLazy = "1";
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", fail, { once: true });
      document.head.appendChild(script);
    });
    return tonePromise;
  }

  function build() {
    if (engine || !global.Tone || !ownsAudio) return engine;
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
    if (!ownsAudio) return relay("event", type);
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

  function disarm() {
    if (!awakenHandler) return;
    document.removeEventListener("pointerdown", awakenHandler, true);
    document.removeEventListener("keydown", awakenHandler, true);
    awakenHandler = null;
  }

  function start() {
    if (!ownsAudio) return relay("start");
    if (disposed) return Promise.resolve(false);
    if (started) return Promise.resolve(true);
    if (startPromise) return startPromise;
    startPromise = (async function () {
      try {
        await loadTone();
        if (disposed) return false;
        await global.Tone.start();
        if (disposed) return false;
        var e = build();
        if (!e) return false;
        e.master.mute = false;
        if (e.transport.state !== "started") e.transport.start("+0.05");
        started = true;
        disarm();
        store(true);
        if (global.LabEvents) global.LabEvents.record("sonido", "Tone.js comenzó con regla " + (config.cellularRule || "umbral"), "sonido:" + (config.id || "portal"));
        return true;
      } catch (error) {
        if (!disposed) {
          document.documentElement.dataset.sound = "error";
          if (enabled) global.setTimeout(arm, 0);
        }
        return false;
      } finally {
        startPromise = null;
      }
    })();
    return startPromise;
  }

  function stop() {
    if (!ownsAudio) return relay("stop");
    disarm();
    if (engine) {
      engine.master.mute = true;
      if (engine.transport.state === "started") engine.transport.pause();
    }
    started = false;
    store(false);
    return false;
  }

  function toggle() {
    if (!ownsAudio) return relay("toggle");
    if (started) return Promise.resolve(stop());
    store(true);
    return start();
  }

  function arm() {
    if (!ownsAudio || !enabled || started || startPromise || awakenHandler) return;
    awakenHandler = function (event) {
      if (event.target && event.target.closest && event.target.closest("#sound-entry, [data-operation='sound']")) return;
      disarm();
      start();
    };
    document.addEventListener("pointerdown", awakenHandler, true);
    document.addEventListener("keydown", awakenHandler, true);
  }

  function disposeEngine() {
    if (!engine) return;
    if (engine.transport && engine.transport.state === "started") engine.transport.pause();
    [engine.loop, engine.synth, engine.noise, engine.pulse, engine.delay, engine.filter, engine.master].forEach(function (node) {
      if (node && typeof node.dispose === "function") node.dispose();
    });
    engine = null;
    started = false;
  }

  function onMessage(event) {
    var data = event.data;
    if (!data || data.type !== messageType || typeof data.action !== "string") return;
    if (!ownsAudio) {
      try { global.parent.postMessage(data, "*"); } catch (error) { /* el mensaje termina en este marco */ }
      return;
    }
    if (data.action === "event" && typeof data.detail === "string") eventNote(data.detail);
    else if (data.action === "start") start();
    else if (data.action === "stop") stop();
    else if (data.action === "toggle") toggle();
  }

  function cleanup() {
    if (!initialized) return;
    initialized = false;
    disposed = true;
    disarm();
    if (entryControl && entryHandler) entryControl.removeEventListener("click", entryHandler);
    if (eventHandler) global.removeEventListener("lab:acontecimiento", eventHandler);
    if (messageHandler) global.removeEventListener("message", messageHandler);
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    entryControl = null;
    entryHandler = null;
    eventHandler = null;
    messageHandler = null;
    keyHandler = null;
    disposeEngine();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    disposed = false;
    updateControls();
    entryControl = document.getElementById("sound-entry");
    if (entryControl) {
      entryHandler = function () { toggle(); };
      entryControl.addEventListener("click", entryHandler);
    }
    arm();
    eventHandler = function (event) {
      if (event.detail && event.detail.type) eventNote(event.detail.type);
    };
    global.addEventListener("lab:acontecimiento", eventHandler);
    messageHandler = onMessage;
    global.addEventListener("message", messageHandler);
    keyHandler = function (event) {
      if (event.key === "Escape" && ownsAudio && started && engine) {
        engine.master.mute = !engine.master.mute;
        document.documentElement.dataset.sound = engine.master.mute ? "muted" : "on";
      }
    };
    document.addEventListener("keydown", keyHandler);
    global.addEventListener("pagehide", cleanup, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.addEventListener("pageshow", function (event) { if (event.persisted && disposed) init(); });
  global.LabSound = Object.freeze({
    start: start,
    stop: stop,
    toggle: toggle,
    event: eventNote,
    isEnabled: function () { return ownsAudio ? enabled : ownerState("isEnabled", enabled); },
    isStarted: function () { return ownsAudio ? started : ownerState("isStarted", false); }
  });
})(window);
