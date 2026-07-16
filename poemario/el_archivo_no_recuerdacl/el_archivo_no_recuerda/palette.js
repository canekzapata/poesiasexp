'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  palette.js  ::  el color no es decorado, es clima
//
//  Cada lectura genera su propia armonía cromática, como los paisajes
//  de poesiasexp: momento del día × modo armónico → 24 tonos HSL
//  reproducibles por la semilla. El archivo no tiene un color fijo:
//  tiene un tiempo (atmosférico) que le tocó a esta excavación.
// =====================================================================

(function () {
  const makeRng = window.ArchiveCore ? window.ArchiveCore.makeRng : null;

  // momento del día: sesga el tono y la luz de toda la lámina
  const MOMENTOS = {
    amanecer:  { tonos: [330, 30, 200, 18], luz: [42, 78], sat: [55, 95], humor: 'húmedo' },
    mediodia:  { tonos: [195, 215, 45, 130, 60], luz: [48, 88], sat: [60, 100], humor: 'seco' },
    atardecer: { tonos: [10, 35, 300, 275, 350], luz: [38, 72], sat: [65, 100], humor: 'incendiado' },
    noche:     { tonos: [230, 250, 270, 210, 190], luz: [30, 70], sat: [45, 92], humor: 'eléctrico' },
    tormenta:  { tonos: [280, 200, 120, 55], luz: [35, 80], sat: [70, 100], humor: 'inestable' },
  };

  // modo armónico: cómo se reparten los tonos alrededor de la base
  const MODOS = {
    caos:        (t, r) => r() * 360,
    mono:        (t, r) => t + (r() - 0.5) * 26,
    analogo:     (t, r) => t + (r() - 0.5) * 84,
    complemento: (t, r) => (r() < 0.5 ? t : t + 180) + (r() - 0.5) * 36,
    triada:      (t, r) => t + [0, 120, 240][(r() * 3) | 0] + (r() - 0.5) * 26,
    tetrada:     (t, r) => t + [0, 90, 180, 270][(r() * 4) | 0] + (r() - 0.5) * 20,
  };

  class Palette {
    constructor(seed) {
      this.seed = String(seed);
      this.rng = makeRng ? makeRng(`${seed}:palette`) : Math.random;
      const momentoKeys = Object.keys(MOMENTOS);
      const modoKeys = Object.keys(MODOS);
      this.momento = momentoKeys[(this.rng() * momentoKeys.length) | 0];
      this.modo = modoKeys[(this.rng() * modoKeys.length) | 0];
      this.M = MOMENTOS[this.momento];
      this.colors = [];
      for (let i = 0; i < 24; i++) this.colors.push(this._nuevo());
      // roles: el fondo es profundo, la tinta clara, el acento vibra
      this.fondoH = this._pick(this.M.tonos);
      this.fondo = this._hsl(this.fondoH, this.rng() * 30 + 40, this.momento === 'mediodia' ? 12 : 8);
      this.fondo2 = this._hsl(this.fondoH + 40, this.rng() * 30 + 45, 16);
      this.tinta = this._hsl(this._pick(this.M.tonos), 22, 92);
      this.acento = this._hsl(this._pick(this.M.tonos) + 180, 100, 60);
      this.diagnostico = this._hsl((this.fondoH + 180) % 360, 100, 62);
    }
    _pick(arr) { return arr[(this.rng() * arr.length) | 0]; }
    _hsl(h, s, l) { return `hsl(${(((h % 360) + 360) % 360).toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%)`; }
    _nuevo() {
      const base = this._pick(this.M.tonos);
      const h = MODOS[this.modo](base, this.rng);
      const s = this.M.sat[0] + this.rng() * (this.M.sat[1] - this.M.sat[0]);
      const l = this.M.luz[0] + this.rng() * (this.M.luz[1] - this.M.luz[0]);
      return this._hsl(h, s, l);
    }
    // un color estable para un id (mismo fragmento, mismo color por vuelta)
    forId(id, turn = 0) {
      const r = makeRng ? makeRng(`${this.seed}:${id}:${turn}`) : Math.random;
      const h = MODOS[this.modo](this._pick(this.M.tonos), r);
      return this._hsl(h, 60 + r() * 40, 50 + r() * 25);
    }
    pick() { return this.colors[(this.rng() * this.colors.length) | 0]; }
    // aplica todo a las variables CSS que la hoja de estilo anima
    apply(root = document.documentElement) {
      const s = root.style;
      this.colors.forEach((c, i) => s.setProperty(`--c${i}`, c));
      s.setProperty('--fondo', this.fondo);
      s.setProperty('--fondo2', this.fondo2);
      s.setProperty('--tinta', this.tinta);
      s.setProperty('--acento', this.acento);
      s.setProperty('--diagnostico', this.diagnostico);
      s.setProperty('--deg', `${(this.rng() * 360) | 0}deg`);
      s.setProperty('--deg2', `${(this.rng() * 360) | 0}deg`);
      s.setProperty('--t1', `${(0.9 + this.rng() * 1.6).toFixed(2)}s`);
      s.setProperty('--t2', `${(4 + this.rng() * 5).toFixed(2)}s`);
      s.setProperty('--t3', `${(2.4 + this.rng() * 3).toFixed(2)}s`);
      s.setProperty('--t5', `${(9 + this.rng() * 9).toFixed(2)}s`);
    }
  }

  window.ArchivePalette = Palette;
})();
