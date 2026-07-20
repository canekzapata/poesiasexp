(function (global) {
  "use strict";

  var C = global.LAB_CORPUS || {};
  var P = C.poliglotas || {};
  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var page = config.id || config.topology || "umbral";
  var storageKey = "otrorio.lenguas." + seed;
  var pagePopupCount = 0;
  var serial = 0;
  var observer;
  var languages = ["en", "fr", "pt", "de"];
  var names = {
    en: "JOURNEY / UX·UI",
    fr: "LANGUE QUI TRÉBUCHE",
    pt: "CORRENTE SOUSANDRADIANA",
    de: "SYSTEM / ORDNUNG"
  };

  function hash(text) {
    var h = 2166136261;
    for (var i = 0; i < String(text).length; i += 1) { h ^= String(text).charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function pick(list, salt) { return list && list.length ? list[hash(seed + ":" + salt) % list.length] : ""; }
  function emptyVoice() { return { influence: 1, memory: [], harvest: [], twists: 0 }; }
  function empty() {
    return {
      version: 4, seed: seed, gestures: 0, lastPopupAt: 0, lastPopupGesture: 0, popupCount: 0,
      lastLanguage: "", pageVisits: {}, conflicts: [],
      voices: { en: emptyVoice(), fr: emptyVoice(), pt: emptyVoice(), de: emptyVoice() }
    };
  }
  function read() {
    var state = empty();
    try { state = Object.assign(state, JSON.parse(localStorage.getItem(storageKey) || "{}")); } catch (error) { /* memoria oral */ }
    state.voices = state.voices || {};
    languages.forEach(function (language) { state.voices[language] = Object.assign(emptyVoice(), state.voices[language] || {}); });
    state.pageVisits = state.pageVisits || {};
    state.conflicts = state.conflicts || [];
    return state;
  }
  function write(state) {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (error) { /* memoria oral */ }
    return state;
  }
  function remember(state, language, text, target) {
    var voice = state.voices[language];
    var entry = { page: page, text: String(text || "").slice(0, 180), target: target && target.tagName || "BODY", at: Date.now() };
    voice.memory.push(entry);
    voice.memory = voice.memory.slice(-18);
    voice.influence = Math.min(24, Number(voice.influence || 1) + 1);
    if (state.lastLanguage && state.lastLanguage !== language) {
      var former = state.lastLanguage;
      var outcomes = {
        "en:de": "the UX note was classified as a system fault",
        "de:en": "die Ordnung erhielt einen Zweifel",
        "en:fr": "the label forgot which language owned its edge",
        "fr:en": "l’étiquette a mordu la note UX",
        "pt:de": "a palavra colhida atravessou a taxonomia",
        "de:pt": "das Kompositum wurde corrente",
        "fr:pt": "la langue a laissé une syllabe dans le courant",
        "pt:fr": "a margem mastigou a etiqueta"
      };
      var pair = former + ":" + language;
      state.conflicts.push({ page: page, pair: pair, outcome: outcomes[pair] || (former + " → " + language + ": una lengua dejó residuo en otra"), at: Date.now() });
      state.conflicts = state.conflicts.slice(-24);
      try { global.dispatchEvent(new CustomEvent("lab:language-conflict", { detail: state.conflicts[state.conflicts.length - 1] })); } catch (error) { /* el conflicto puede quedar mudo */ }
    }
    state.lastLanguage = language;
  }

  function carrySeed(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll("a[href]"), function (link) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      try {
        var url = new URL(href, global.location.href);
        if (url.origin !== global.location.origin) return;
        url.searchParams.set("seed", seed);
        link.href = url.href;
      } catch (error) { /* otra procedencia conserva su idioma */ }
    });
  }
  function eligible(node) {
    return node && node.nodeType === 1 && !node.closest(".polyglot-voice,.language-apparition,.relic-toast,.zapping-warning,.language-inlay,script,style,noscript,[contenteditable]");
  }
  function textOf(node) { return String(node && node.textContent || "").trim().replace(/\s+/g, " ").slice(0, 220); }
  function words(text) {
    return String(text || "").toLocaleLowerCase().match(/[\p{L}À-ž]{5,}/gu) || [];
  }
  function addInlay(target, language, text) {
    if (!eligible(target) || !text || target.matches("input,select,textarea,option,canvas,svg")) return;
    var inlay = document.createElement("small");
    inlay.className = "language-inlay voice-" + language + "-inline";
    inlay.lang = language;
    inlay.textContent = text;
    inlay.setAttribute("aria-hidden", "true");
    target.appendChild(inlay);
  }
  function addFrenchBraid(target, text, level) {
    if (!eligible(target) || target.matches("input,select,textarea,option,canvas,svg")) return;
    var braid = document.createElement("span");
    var pieces = String(text || "").replace(/[.,;!?']/g, "").split(/\s+/).filter(Boolean);
    var start = hash(seed + ":tresse:" + page + ":" + level) % Math.max(1, pieces.length);
    braid.className = "language-inlay voice-fr-inline french-braid";
    braid.lang = "fr";
    braid.setAttribute("aria-hidden", "true");
    braid.style.setProperty("--fr-turn", (-4 + level % 9) + "deg");
    braid.textContent = [pieces[start], pieces[(start + 2) % pieces.length], pieces[(start + 4) % pieces.length]].filter(Boolean).join(" · ");
    target.appendChild(braid);
  }
  function englishText(state, target, salt) {
    var base = pick(P.inglesTrayecto, "en:" + salt);
    var memory = state.voices.en.memory;
    if (memory.length && hash(salt + ":remember") % 3 === 0) {
      var former = memory[hash(salt) % memory.length];
      base += " Earlier, " + former.page + " called a " + former.target.toLowerCase() + " a consequence.";
    }
    return base;
  }
  function deform(text, level) {
    var replacements = [[/r/gi, "rr"], [/s/gi, "ss"], [/c/gi, "ç"], [/a/gi, "à"], [/e/gi, "é"], [/o/gi, "eau"]];
    var output = String(text || "");
    for (var i = 0; i < Math.min(replacements.length, 1 + Math.floor(level / 3)); i += 1) output = output.replace(replacements[i][0], replacements[i][1]);
    return output;
  }
  function portugueseText(state, target, salt) {
    var harvested = state.voices.pt.harvest || [];
    var prior = harvested.length ? harvested[hash(salt) % harvested.length] : "margem";
    return pick(P.portuguesCorriente, "pt:" + salt) + " ⟨" + prior + "-viagem⟩";
  }
  function germanText(state, target, salt) {
    var text = pick(P.alemanSistema, "de:" + salt);
    var former = state.voices.en.memory;
    if (former.length && hash(salt + ":classify") % 3 === 0) text += " / UX-ERINNERUNGSREST";
    return text;
  }
  function languageText(state, language, target, salt) {
    if (language === "en") return englishText(state, target, salt);
    if (language === "fr") return pick(P.francesTrabalenguas, "fr:" + salt);
    if (language === "pt") return portugueseText(state, target, salt);
    return germanText(state, target, salt);
  }

  function infect(target, language, options) {
    options = options || {};
    if (!eligible(target)) return null;
    var state = read();
    var salt = [page, language, state.gestures, serial, textOf(target)].join(":");
    var text = languageText(state, language, target, salt);
    target.classList.add("infected-language", "language-" + language);
    target.dataset.languageVisit = String((Number(target.dataset.languageVisit) || 0) + 1);
    if (language === "en") {
      target.dataset.uxComment = text;
      if (!target.getAttribute("title")) target.setAttribute("title", text);
      if (!target.querySelector(":scope > .voice-en-inline")) addInlay(target, language, text);
    } else if (language === "fr") {
      state.voices.fr.twists += 1;
      var mayDeform = target.matches("a,button,label,h1,h2,h3,summary,legend") && textOf(target).length > 1 && textOf(target).length < 90;
      if (mayDeform) {
        if (!target.dataset.languageOriginal) target.dataset.languageOriginal = textOf(target);
        Array.prototype.some.call(target.childNodes, function (node) {
          if (node.nodeType !== 3 || !node.nodeValue.trim()) return false;
          node.nodeValue = deform(target.dataset.languageOriginal, Math.min(12, state.voices.fr.twists));
          return true;
        });
      }
      target.dataset.frenchTwist = state.voices.fr.twists;
      if (!target.querySelector(":scope > .voice-fr-inline")) addFrenchBraid(target, text, state.voices.fr.twists);
    } else if (language === "pt") {
      var harvested = words(textOf(target)).slice(0, 5);
      state.voices.pt.harvest = state.voices.pt.harvest.concat(harvested).filter(function (word, index, all) { return all.indexOf(word) === index; }).slice(-42);
      target.dataset.harvestedWords = harvested.join(" ");
      if (!target.querySelector(":scope > .voice-pt-inline")) addInlay(target, language, portugueseText(state, target, salt + ":after"));
    } else {
      var systemClass = text.split(/[/:]/)[0].trim();
      target.dataset.systemClass = systemClass;
      if (!target.querySelector(":scope > .voice-de-inline")) addInlay(target, language, text);
    }
    remember(state, language, text, target);
    write(state);
    if (!options.quiet && global.LabEvents && state.gestures % 5 === 0) {
      global.LabEvents.record("lengua", names[language] + " infectó " + target.tagName.toLowerCase() + " en " + page, "lengua:" + language + ":" + page + ":" + Math.floor(state.gestures / 5));
    }
    return { language: language, text: text, target: target };
  }

  function show(language, text, event, context, options) {
    options = options || {};
    var state = read();
    var now = Date.now();
    if (language === "fr") return null;
    if (!text || !document.body || document.body.classList.contains("relic-codex-page") || document.body.classList.contains("epigraphic-chamber")) return null;
    var visitedCount = Object.keys(state.pageVisits || {}).length;
    if (!options.force && (pagePopupCount >= 1 || state.gestures < 12 || visitedCount < 3 || state.gestures - Number(state.lastPopupGesture || 0) < 15 || now - Number(state.lastPopupAt || 0) < 120000)) return null;
    var old = document.querySelector(".language-apparition");
    if (old) old.remove();
    serial += 1; pagePopupCount += 1;
    state.lastPopupAt = now; state.lastPopupGesture = state.gestures; state.popupCount = Number(state.popupCount || 0) + 1; write(state);
    var note = document.createElement("aside");
    var shapes = { en: "apparition-margin", pt: "apparition-current", de: "apparition-stamp" };
    note.className = "language-apparition voice-" + language + " " + (shapes[language] || "apparition-margin");
    note.lang = language;
    note.style.setProperty("--voice-r", (-4 + hash(seed + ":r:" + serial) % 9) + "deg");
    var label = document.createElement("b"); label.textContent = names[language] || language;
    var paragraph = document.createElement("p"); paragraph.textContent = text;
    var small = document.createElement("small"); small.textContent = context || ("residuo en " + page);
    note.appendChild(label); note.appendChild(paragraph); note.appendChild(small);
    document.body.appendChild(note);
    global.setTimeout(function () { if (note.isConnected) note.classList.add("is-fading"); }, 6800);
    global.setTimeout(function () { if (note.isConnected) note.remove(); }, 8800);
    return note;
  }

  function weightedLanguage(state, salt) {
    var total = languages.reduce(function (sum, language) { return sum + Math.max(2, 26 - Number(state.voices[language].influence || 1)); }, 0);
    var cursor = hash(seed + ":voice:" + salt) % total;
    for (var i = 0; i < languages.length; i += 1) {
      cursor -= Math.max(2, 26 - Number(state.voices[languages[i]].influence || 1));
      if (cursor < 0) return languages[i];
    }
    return "en";
  }
  function targetFrom(event) {
    return event.target && event.target.closest && event.target.closest("a,button,label,[data-diagram-node],.generative-chart,.mortal,td,[data-mutable],canvas");
  }
  function clicked(event) {
    if (!event.target || !event.target.closest || event.target.closest(".polyglot-voice,.language-apparition,.relic-toast,.zapping-warning,.language-inlay")) return;
    var target = targetFrom(event);
    if (!target || !eligible(target)) return;
    var state = read();
    state.gestures += 1;
    var language = weightedLanguage(state, page + ":" + state.gestures + ":" + textOf(target));
    write(state);
    if (hash(seed + ":infection:" + page + ":" + state.gestures) % 100 >= 34) return;
    var result = infect(target, language);
    var neighbor = target.parentElement && target.parentElement.querySelector("a,button,p,code,[data-diagram-node]");
    if (neighbor && neighbor !== target && hash(seed + ":neighbor:" + state.gestures) % 10 === 0) infect(neighbor, languages[(languages.indexOf(language) + 1) % languages.length], { quiet: true });
    if (result && language !== "fr" && hash(seed + ":apparition:" + page + ":" + state.gestures) % 1000 < 16) show(language, result.text, event, "aparición excepcional después de un trayecto");
  }
  function initialInfections() {
    if (!document.body || document.body.classList.contains("relic-codex-page") || document.body.classList.contains("epigraphic-chamber")) return;
    var state = read();
    state.pageVisits[page] = Number(state.pageVisits[page] || 0) + 1;
    write(state);
    var candidates = Array.prototype.filter.call(document.querySelectorAll("main a,main p,main h1,main h2,main code,main td,main [data-diagram-node],body > a"), eligible);
    var count = Math.min(candidates.length, 1 + hash(seed + ":arrival:" + page + ":" + state.pageVisits[page]) % 2);
    for (var i = 0; i < count; i += 1) {
      var target = candidates[hash(seed + ":arrival-target:" + page + ":" + i) % candidates.length];
      infect(target, weightedLanguage(state, "arrival-language:" + page + ":" + i), { quiet: true });
    }
  }
  function watchCannibals() {
    if (!global.MutationObserver || !document.body) return;
    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
          if (!eligible(node) || node.classList.contains("language-inlay")) return;
          carrySeed(node);
          var state = read();
          if (hash(seed + ":new-node:" + page + ":" + state.gestures + ":" + textOf(node)) % 100 < 8) infect(node, weightedLanguage(state, "cannibal:" + textOf(node)), { quiet: true });
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  document.addEventListener("click", clicked);
  function begin() { carrySeed(document); initialInfections(); watchCannibals(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", begin, { once: true }); else begin();
  global.addEventListener("pagehide", function () { if (observer) observer.disconnect(); }, { once: true });
  global.LabPolyglot = Object.freeze({ read: read, infect: infect, show: show, carrySeed: carrySeed });
})(window);
