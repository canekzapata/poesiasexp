'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  climate.js  ::  la lectura convertida en clima
//
//  Un canvas que respira: un campo de presión/temperatura en bandas
//  (como un mapa meteorológico) que fluye con el tiempo y se deforma
//  con la memoria — donde prestaste atención sube la presión, donde
//  erosionaste hay turbulencia, los enlaces trazan frentes. Encima,
//  un viento de glifos a la deriva. Arte generativo, no fondo.
// =====================================================================

(function () {
  const C = window.ARCHIVE_CONTENT;
  const makeRng = window.ArchiveCore.makeRng;

  // convierte hsl(...) a [h,s,l] numéricos
  function parseHsl(str) {
    const m = /hsl\(([-\d.]+),([\d.]+)%?,([\d.]+)%?\)/.exec(str);
    return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : [0, 0, 50];
  }
  const hsl = (h, s, l, a = 1) =>
    `hsla(${(((h % 360) + 360) % 360).toFixed(1)},${s.toFixed(1)}%,${l.toFixed(1)}%,${a})`;

  class Climate {
    constructor(canvas, archive, palette) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.archive = archive;
      this.palette = palette;
      this.rng = makeRng(`${archive.seed}:clima`);
      this.t = 0;
      this.depth = 0;
      this.intensity = 1;
      this.GX = 60; this.GY = 34;              // resolución del campo
      this.memGrid = new Float32Array(this.GX * this.GY);
      this._memAt = 0;
      this._buildRamp();
      this._buildWaves();
      this._buildParticles();
      // buffer de baja resolución: se dibuja el campo aquí y se escala
      // con interpolación → gradientes atmosféricos suaves, no cuadrícula
      this.buf = document.createElement('canvas');
      this.buf.width = this.GX; this.buf.height = this.GY;
      this.bctx = this.buf.getContext('2d');
      this.resize();
    }

    // rampa de color: bandas de isobaras a partir de la paleta
    _buildRamp() {
      const P = this.palette;
      const fondo = parseHsl(P.fondo);
      const cols = P.colors.map(parseHsl).sort((a, b) => a[2] - b[2]);
      this.ramp = [];
      const stops = [fondo, cols[2], cols[6], cols[10], cols[14], cols[18], cols[22], parseHsl(P.acento)];
      const N = 14;
      for (let i = 0; i < N; i++) {
        const f = i / (N - 1) * (stops.length - 1);
        const a = stops[Math.floor(f)], b = stops[Math.min(stops.length - 1, Math.ceil(f))];
        const k = f - Math.floor(f);
        // interpola tono por el camino corto
        let dh = b[0] - a[0]; if (dh > 180) dh -= 360; if (dh < -180) dh += 360;
        this.ramp.push([a[0] + dh * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]);
      }
    }

    _buildWaves() {
      const r = this.rng;
      this.waves = Array.from({ length: 5 }, () => ({
        fx: 0.6 + r() * 3.2, fy: 0.6 + r() * 3.2,
        sp: (r() - 0.5) * 0.5, ph: r() * 6.28, amp: 0.35 + r() * 0.5,
      }));
    }

    _buildParticles() {
      const r = this.rng;
      const sets = [C.GLYPHSETS.braille, C.GLYPHSETS.onda, C.GLYPHSETS.punto, C.GLYPHSETS.bloque, C.GLYPHSETS.flecha];
      this.particles = Array.from({ length: 130 }, () => {
        const set = sets[(r() * sets.length) | 0];
        return {
          x: r(), y: r(),
          g: set[(r() * set.length) | 0],
          size: 8 + r() * 22,
          hue: (r() * 360),
          spin: (r() - 0.5) * 0.02,
          rot: r() * 6.28,
          life: r(),
        };
      });
    }

    resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = this.canvas.clientWidth || window.innerWidth;
      const h = this.canvas.clientHeight || window.innerHeight;
      this.canvas.width = Math.max(1, Math.floor(w * dpr));
      this.canvas.height = Math.max(1, Math.floor(h * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.W = w; this.H = h;
    }

    // el mapa de memoria: la biografía de los fragmentos deforma el clima
    updateMemory() {
      const g = this.memGrid; g.fill(0);
      const frags = this.archive.fragments;
      for (const f of frags) {
        const w = (f.atencion * 0.9 - f.daño * 0.35 + f.conexiones.length * 1.2) * 0.06;
        if (Math.abs(w) < 0.02) continue;
        const cx = f.x * this.GX, cy = f.y * this.GY;
        const sig = 4 + f.conexiones.length;
        const x0 = Math.max(0, (cx - sig) | 0), x1 = Math.min(this.GX - 1, (cx + sig) | 0);
        const y0 = Math.max(0, (cy - sig) | 0), y1 = Math.min(this.GY - 1, (cy + sig) | 0);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const d2 = (x - cx) * (x - cx) + (y - cy) * (y - cy);
          g[y * this.GX + x] += w * Math.exp(-d2 / (2 * sig * sig));
        }
      }
      this._memAt = performance.now();
    }

    _fieldAt(u, v, t) {
      let s = 0;
      for (const w of this.waves) {
        s += w.amp * Math.sin(u * 6.2832 * w.fx + t * w.sp + w.ph)
                   * Math.cos(v * 6.2832 * w.fy - t * w.sp * 0.7 + w.ph);
      }
      return s;
    }

    step(dt) {
      this.t += dt * 0.4 * this.intensity;
      const ctx = this.ctx, W = this.W, H = this.H, GX = this.GX, GY = this.GY;
      if (performance.now() - this._memAt > 260) this.updateMemory();

      const cw = W / GX, ch = H / GY;
      const depthShift = this.depth * 1.2;      // excavar enfría y baja la luz
      // fondo base
      ctx.globalAlpha = 1;
      ctx.fillStyle = this.palette.fondo;
      ctx.fillRect(0, 0, W, H);

      // campo en bandas (isobaras de color) dibujado en el buffer chico
      const bctx = this.bctx;
      for (let y = 0; y < GY; y++) {
        for (let x = 0; x < GX; x++) {
          let val = this._fieldAt(x / GX, y / GY, this.t) + this.memGrid[y * GX + x];
          let n = (val + 1.4) / 2.8;                     // → 0..1
          n = Math.max(0, Math.min(0.999, n));
          const band = this.ramp[(n * this.ramp.length) | 0];
          bctx.fillStyle = hsl(band[0] + depthShift * 6, band[1], Math.max(6, band[2] - depthShift * 4));
          bctx.fillRect(x, y, 1, 1);
        }
      }
      // escalado suave: la cuadrícula se vuelve atmósfera
      ctx.globalAlpha = 0.86;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(this.buf, 0, 0, GX, GY, 0, 0, W, H);

      // isolíneas: el contorno de una banda, trazado grueso (frente)
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = this.palette.tinta;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      const thr = 0.5 + 0.25 * Math.sin(this.t * 0.3);
      for (let y = 0; y < GY; y++) {
        for (let x = 0; x < GX; x++) {
          const val = this._fieldAt(x / GX, y / GY, this.t) + this.memGrid[y * GX + x];
          const n = (val + 1.4) / 2.8;
          if (Math.abs(n - thr) < 0.02) { ctx.moveTo(x * cw, y * ch); ctx.lineTo(x * cw + cw, y * ch + ch); }
        }
      }
      ctx.stroke();

      // viento de glifos: partículas advectadas por el gradiente del campo
      ctx.globalAlpha = 1;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const e = 0.008;
      for (const p of this.particles) {
        const fx = this._fieldAt(p.x + e, p.y, this.t) - this._fieldAt(p.x - e, p.y, this.t);
        const fy = this._fieldAt(p.x, p.y + e, this.t) - this._fieldAt(p.x, p.y - e, this.t);
        p.x += (-fy) * 0.02 * this.intensity + 0.0006;   // rota alrededor de los centros
        p.y += (fx) * 0.02 * this.intensity;
        p.rot += p.spin;
        if (p.x > 1.02) p.x -= 1.04; if (p.x < -0.02) p.x += 1.04;
        if (p.y > 1.02) p.y -= 1.04; if (p.y < -0.02) p.y += 1.04;
        p.life += dt * 0.1; const tw = 0.55 + 0.45 * Math.sin(p.life * 3 + p.hue);
        ctx.save();
        ctx.translate(p.x * W, p.y * H);
        ctx.rotate(p.rot);
        ctx.font = `${p.size}px "IBM Plex Mono", monospace`;
        ctx.fillStyle = hsl(p.hue + this.t * 8, 85, 62, 0.16 + tw * 0.42);
        ctx.fillText(p.g, 0, 0);
        ctx.restore();
      }
    }

    reseed(archive, palette) {
      this.archive = archive; this.palette = palette;
      this.rng = makeRng(`${archive.seed}:clima`);
      this.t = 0;
      this._buildRamp(); this._buildWaves(); this._buildParticles();
      this.updateMemory();
    }
  }

  window.ArchiveClimate = Climate;
})();
