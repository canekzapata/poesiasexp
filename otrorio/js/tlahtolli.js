(function (global) {
  "use strict";

  var C = global.LAB_CORPUS || {};
  var N = C.nahuatl || {};
  var config = global.LAB_PAGE || {};
  var params = new URLSearchParams(global.location.search);
  var seed = params.get("seed") || config.worldSeed || "otra-agua-2026";
  var budget = Math.max(9, Math.min(42, Number(config.mutationBudget || 18)));
  var used = 0;
  var observing = false;

  function hash(text) {
    var h = 1779033703 ^ String(text).length;
    for (var i = 0; i < String(text).length; i += 1) { h = Math.imul(h ^ String(text).charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return (h ^ h >>> 16) >>> 0;
  }
  function pick(list, salt) { return list && list.length ? list[hash(seed + ":" + salt) % list.length] : null; }
  function eligible(node) {
    if (!node || node.nodeType !== 1 || used >= budget || node.dataset.tlahtolli) return false;
    if (node.closest("script,style,noscript,canvas,svg,iframe,form,button,input,select,textarea,.permanent-routes,.lab-meta,.footnote-bar,.relic-toast,.relic-codex,.relic-sources,.polyglot-voice,[aria-hidden=true]")) return false;
    if (node.children.length > 3 || !node.textContent || node.textContent.trim().length < 12) return false;
    return /^(P|LI|DD|DT|BLOCKQUOTE|FIGCAPTION|ARTICLE|SECTION|ASIDE|DIV|SPAN|CODE|PRE|MARK|SMALL)$/.test(node.tagName);
  }
  function decorate(node, salt) {
    if (!eligible(node)) return;
    var long = node.textContent.trim().length > 150 && hash(salt) % 4 === 0;
    var item = pick(long ? N.parrafos : N.fragmentos, salt);
    if (!item) return;
    var fragment = document.createElement(long ? "aside" : "span");
    fragment.className = "nahuatl-fragment " + (long ? "is-passage" : "is-gloss");
    fragment.dataset.tlahtolli = "1";
    var nah = document.createElement("span");
    nah.className = "nahuatl-original"; nah.lang = "nah"; nah.textContent = item.nah;
    var es = document.createElement("span");
    es.className = "nahuatl-gloss"; es.lang = "es"; es.textContent = item.es;
    fragment.appendChild(nah); fragment.appendChild(es);
    node.appendChild(fragment); node.dataset.tlahtolli = "1"; used += 1;
  }
  function scan(root, phase) {
    if (used >= budget || !root) return;
    var candidates = [];
    if (root.nodeType === 1 && eligible(root)) candidates.push(root);
    if (root.querySelectorAll) candidates = candidates.concat(Array.prototype.slice.call(root.querySelectorAll("p,li,dd,dt,blockquote,figcaption,article,section,aside,div,span,code,pre,mark,small")));
    candidates.forEach(function (node, index) {
      if (used >= budget) return;
      var salt = [phase, config.id || config.topology || "raíz", index, node.textContent.slice(0, 40)].join(":");
      var frequency = config.topology === "textstorm" || config.topology === "diagramtext" ? 3 : 6;
      if (hash(seed + salt) % frequency === 0) decorate(node, salt);
    });
  }
  function layer() {
    if (!document.body || hash(seed + ":capa:" + (config.id || config.topology)) % 5 > 1) return;
    var item = pick(N.fragmentos, "capa:" + (config.id || config.topology));
    if (!item) return;
    var wall = document.createElement("div");
    wall.className = "tlahtolli-layer"; wall.lang = "nah"; wall.setAttribute("aria-hidden", "true"); wall.textContent = item.nah;
    document.body.appendChild(wall);
  }
  function init() {
    scan(document.body, "inicial"); layer();
    var observer = new MutationObserver(function (records) {
      if (observing) return;
      observing = true;
      records.forEach(function (record, recordIndex) {
        Array.prototype.forEach.call(record.addedNodes, function (node, index) { if (node.nodeType === 1) scan(node, "generado:" + recordIndex + ":" + index); });
      });
      observing = false;
      if (used >= budget) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    global.addEventListener("pagehide", function () { observer.disconnect(); }, { once: true });
    if (global.LabEvents) global.LabEvents.record("tlahtolli", "el náhuatl atravesó " + (config.topologyLabel || config.topology || "el documento"), "tlahtolli:" + (config.id || config.topology));
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
  global.LabTlahtolli = Object.freeze({ scan: scan, decorate: decorate });
})(window);
