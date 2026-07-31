/*
  sonido.js — altavoz de PC. Apagado por defecto.

  Ondas cuadradas cortas, un solo canal, sin reverberación, sin pads.
  Un tono por material al tocarlo, un clic seco por paso, y silencio
  absoluto en la quietud, para que la condensación ocurra en calma.

  La pieza está completa en silencio: aquí no viaja ninguna información
  que no exista ya en la rejilla.
*/
(function (root) {
  "use strict";

  function Sonido() {
    this.ctx = null;
    this.encendido = false;
    this.silencioHasta = 0;
  }

  var S = Sonido.prototype;

  S.arrancar = function () {
    if (this.ctx) return this.ctx;
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return null;
    try { this.ctx = new AC(); } catch (e) { this.ctx = null; }
    return this.ctx;
  };

  S.alternar = function () {
    this.encendido = !this.encendido;
    if (this.encendido) {
      var c = this.arrancar();
      if (c && c.state === "suspended") c.resume();
      if (!c) this.encendido = false;
    }
    return this.encendido;
  };

  S.cerrar = function () {
    if (this.ctx) { try { this.ctx.close(); } catch (e) {} this.ctx = null; }
    this.encendido = false;
  };

  /* callar: mientras el visitante está quieto no suena nada */
  S.callar = function (ms) { this.silencioHasta = (root.performance ? performance.now() : Date.now()) + ms; };

  S.pitido = function (hz, ms, vol) {
    if (!this.encendido || !this.ctx) return;
    var ahora = root.performance ? performance.now() : Date.now();
    if (ahora < this.silencioHasta) return;
    var t = this.ctx.currentTime;
    var osc = this.ctx.createOscillator();
    var g = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(hz, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol == null ? 0.045 : vol, t + 0.003);
    g.gain.setValueAtTime(vol == null ? 0.045 : vol, t + ms / 1000 - 0.004);
    g.gain.linearRampToValueAtTime(0, t + ms / 1000);
    osc.connect(g); g.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + ms / 1000 + 0.01);
  };

  S.paso = function () { this.pitido(96, 18, 0.03); };
  S.giro = function () { this.pitido(72, 12, 0.022); };
  S.muro = function (material) { this.pitido(material ? material.tono : 220, 55, 0.05); };
  S.perforar = function () { this.pitido(140, 90, 0.06); };
  S.umbral = function () { this.pitido(58, 220, 0.05); };
  S.panel = function (abre) { this.pitido(abre ? 880 : 330, 40, 0.035); };
  S.volcado = function () { this.pitido(41, 400, 0.04); };

  var api = { Sonido: Sonido };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MT_SONIDO = api;
})(typeof window !== "undefined" ? window : globalThis);
