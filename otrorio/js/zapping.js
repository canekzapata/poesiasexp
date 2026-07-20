(function (global) {
  "use strict";

  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var genomes = global.LAB_PAGE_GENOMES || [];
  var sessionKey = "otrorio.zapping." + seed;
  var timer = 0;
  var warningTimer = 0;
  var cancelled = false;

  function hash32(text) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
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

  function readState() {
    try { return Object.assign({ count: 0, seen: {} }, JSON.parse(sessionStorage.getItem(sessionKey) || "{}")); }
    catch (error) { return { count: 0, seen: {} }; }
  }

  function writeState(state) {
    try { sessionStorage.setItem(sessionKey, JSON.stringify(state)); } catch (error) { /* el zapping puede olvidar */ }
  }

  function pickTarget() {
    var state = readState();
    var rng = rngFrom(seed + ":zap:" + (config.id || "portal") + ":" + state.count);
    if (rng() < .11) return "../mapa.html?view=used&seed=" + encodeURIComponent(seed);
    if (global.LabRoutes && global.LabRoutes.explorationHref) {
      var exploratory = global.LabRoutes.explorationHref({ zap: state.count + 1, discover: 1 });
      if (exploratory) return exploratory;
    }
    var pool = genomes.filter(function (genome) { return genome.id !== config.id; });
    if (!pool.length) return null;
    var target = pool[Math.floor(rng() * pool.length)];
    var href = "./" + target.id + ".html";
    return global.LabRoutes ? global.LabRoutes.carrySeed(href, { zap: state.count + 1 }) : href + "?seed=" + encodeURIComponent(seed);
  }

  function removeWarning() {
    var warning = document.querySelector(".zapping-warning");
    if (warning) warning.remove();
  }

  function clearTimers() {
    global.clearTimeout(timer);
    global.clearTimeout(warningTimer);
    removeWarning();
  }

  function cancel() {
    cancelled = true;
    clearTimers();
    var sacrificed = global.LabRelics && global.LabRelics.sacrifice("cancelar el zapping en " + config.id);
    if (global.LabEvents) global.LabEvents.record("zapping", "el lector decidió permanecer en " + config.id + (sacrificed ? " y entregó una reliquia" : " sin reliquias que entregar"));
  }

  function showWarning() {
    if (cancelled) return;
    var warning = document.createElement("aside");
    warning.className = "zapping-warning";
    warning.innerHTML = "<span>SEÑAL CAMBIANDO / ZAPPING</span><button type=\"button\">quedarme aquí</button>";
    warning.querySelector("button").addEventListener("click", cancel);
    document.body.appendChild(warning);
  }

  function jump() {
    if (cancelled) return null;
    var target = pickTarget();
    if (!target) return null;
    clearTimers();
    var state = readState();
    state.count += 1;
    writeState(state);
    if (global.LabRoutes && global.LabRoutes.incrementZap) global.LabRoutes.incrementZap();
    if (global.LabEvents) global.LabEvents.record("zapping", "la señal cambió desde " + config.id + " hacia " + target);
    global.location.href = target;
    return target;
  }

  function init() {
    var isTop = true;
    try { isTop = global.top === global.self; } catch (error) { isTop = false; }
    if (!isTop || !config.id || !config.zapping || config.topology === "timepoem" || params.get("nozap") === "1") return;
    if (global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var state = readState();
    if (state.count >= 6 || state.seen[config.id]) return;
    state.seen[config.id] = true;
    writeState(state);
    var delay = Math.max(9000, Number(config.zappingDelay || 22) * 1000);
    warningTimer = global.setTimeout(showWarning, Math.max(1200, delay - 4800));
    timer = global.setTimeout(jump, delay);
    global.addEventListener("pagehide", clearTimers, { once: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabZapping = Object.freeze({ jump: jump, cancel: cancel, pickTarget: pickTarget });
})(window);
