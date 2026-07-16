'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  archive.js  ::  el modelo de datos y su memoria
//
//  El archivo NO es una secuencia de páginas: es un solo campo de
//  fragmentos con memoria. Cada fragmento carga cuatro valores que
//  la lectura modifica de manera irreversible:
//
//      { atencion, daño, conexiones, edad }
//
//  Al terminar una vuelta el archivo se muta a sí mismo (CONTRAARCHIVO):
//  lo muy observado se hipertrofia, lo ignorado se fosiliza, lo borrado
//  regresa como signo, lo conectado hereda palabras de sus vecinos, lo
//  mal predicho corrompe la leyenda, y sólo entre 5% y 15% permanece,
//  elegido por la historia de esa lectura y no al azar.
// =====================================================================

(function () {
  const C = (typeof window !== 'undefined' ? window.ARCHIVE_CONTENT : require('./content.js'));

  // ---- azar firmado -------------------------------------------------
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^ (h >>> 16)) >>> 0;
    };
  }
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    const h = xmur3(String(seed));
    return mulberry32(h());
  }

  // ---- morfología (portada del nefelógrafo) -------------------------
  //  la geometría de cada estrato ES una operación sobre las letras
  const VOWELS = /[aeiouáéíóúüàèìòù]/gi;
  const CONS = /[^aeiouáéíóúüàèìòù\s]/gi;

  const Morph = {
    esqueletoConsonantico(w) {
      return w.replace(VOWELS, '').replace(/\s+/g, ' ').trim() || w[0] || '·';
    },
    esqueletoVocalico(w) {
      return w.replace(CONS, '').trim() || w;
    },
    invertir(w) {
      return [...w].reverse().join('');
    },
    // pierde letras dejando huecos, como la lluvia del nefelógrafo
    evaporar(w, rng, p = 0.32) {
      return [...w].map((ch) => (ch !== ' ' && rng() < p ? ' ' : ch)).join('');
    },
    // erosiona los bordes, vuelta tras vuelta
    erosionar(w, n = 1) {
      const s = w.trim();
      if (s.length <= 2) return s;
      const cut = Math.min(n, Math.floor(s.length / 2) - 1);
      return s.slice(cut, s.length - cut);
    },
    expandir(w) {
      return [...w].join(' ');
    },
    // funde dos palabras por su zona de contacto (vapor+poesía → vapoesía)
    fusionar(a, b) {
      const overlap = Math.min(3, a.length - 1, b.length - 1);
      for (let k = overlap; k >= 1; k--) {
        if (a.slice(-k).toLowerCase() === b.slice(0, k).toLowerCase()) {
          return a + b.slice(k);
        }
      }
      const mid = Math.ceil(a.length / 2);
      return a.slice(0, mid) + b.slice(Math.floor(b.length / 2));
    },
    ocr(w, rng, p = 0.5) {
      return [...w].map((ch) => {
        const low = ch.toLowerCase();
        if (C.OCR_MAP[low] && rng() < p) return C.OCR_MAP[low];
        return ch;
      }).join('');
    },
  };

  // aplica la operación de un estrato a un texto entero
  function applyStratum(text, opKey, rng) {
    switch (opKey) {
      case 'plain':
        return text;
      case 'imperative':
        return text; // el texto ya viene como instrucción cuando toca
      case 'skeleton':
        return text.split(/\s+/).map((w) => Morph.esqueletoConsonantico(w)).join(' ');
      case 'ocr':
        return Morph.ocr(text, rng, 0.45);
      case 'glyph':
        return [...text].map((ch) => (ch === ' ' ? ' ' : (rng() < 0.7 ? pick(C.GLYPHS, rng) : ch))).join('');
      case 'dust':
        return Morph.evaporar(Morph.esqueletoConsonantico(text), rng, 0.55);
      default:
        return text;
    }
  }

  function pick(arr, rng) { return arr[Math.floor(rng() * arr.length)]; }

  // limpia palabras para contar repeticiones
  function words(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zñ0-9]+/g, ' ').trim().split(/\s+/).filter((w) => w.length > 3);
  }

  // los ocho estados de una vuelta — no son páginas, son modos del campo
  const STATES = [
    'futuro_anterior',   // 1 — residuos de acciones aún no hechas
    'celda',             // 2 — el afuera se llena; no tocar también escribe
    'caja',              // 3 — adentro/afuera dejan de ser estables
    'excavacion',        // 4 — el movimiento vertical descubre estratos
    'enlace',            // 5 — unir dos fragmentos produce una tercera cosa
    'presente_continuo', // 6 — permanecer deforma la palabra
    'arqueologia_futura',// 7 — lo borrado vuelve mal atribuido
    'profecia_fallida',  // 8 — el libro predice; acierta o pierde integridad
  ];

  let UID = 0;

  class Archive {
    constructor(seed) {
      this.seed = String(seed || `archivo-${Date.now().toString(36)}`);
      this.rng = makeRng(this.seed);
      this.turn = 0;
      this.stateIndex = 0;
      this.legendIntegrity = 100;   // la leyenda diagramática se corrompe
      this.authority = 0;           // sube cuando el sistema predice bien
      this.fragments = [];
      this.relations = [];
      this.buried = [];             // residuos enterrados que regresan
      this.prediction = null;       // profecía de la próxima acción
      this.log = [];                // arqueología de esta sesión (para impresión)
      this.integrityHistory = [];   // integridad de la leyenda por vuelta (gráfica)
      this.opKeys = Object.keys(C.OPERATIONS);
      this._seedBuried();
      this.beginTurn();
    }

    // --- azar local reproducible por etiqueta -------------------------
    fork(label) { return makeRng(`${this.seed}:${this.turn}:${label}`); }
    float(a = 0, b = 1) { return a + (b - a) * this.rng(); }
    int(a, b) { return Math.floor(this.float(a, b + 1)); }
    chance(p = 0.5) { return this.rng() < p; }
    pick(arr) { return arr[Math.floor(this.rng() * arr.length)]; }

    get state() { return STATES[this.stateIndex]; }
    get stateNumber() { return this.stateIndex + 1; }

    // --- el archivo empieza enterrado: residuos de una lectura prevista
    _seedBuried() {
      const r = makeRng(`${this.seed}:prevista`);
      const n = 6 + Math.floor(r() * 6);
      for (let i = 0; i < n; i++) {
        const opKey = this.opKeys[Math.floor(r() * this.opKeys.length)];
        this.buried.push({
          text: this._composeWith(opKey, r),
          origin: opKey,
          era: C.OPERATIONS.cronologia.years[Math.floor(r() * C.OPERATIONS.cronologia.years.length)],
          predicted: true,
        });
      }
    }

    // --- composición de un fragmento a partir de una operación --------
    _composeWith(opKey, r = this.rng) {
      const op = C.OPERATIONS[opKey];
      const rr = typeof r === 'function' ? r : this.rng;
      const P = (arr) => arr[Math.floor(rr() * arr.length)];
      const a = P(op.words);
      const b = P(op.words);
      const open = P(C.SYNTAX.openings)
        .replace('{a}', a).replace('{b}', b)
        .replace('{v}', P(C.SYNTAX.verbs));
      const end = P(C.SYNTAX.endings);
      return `${open}\n${end}`;
    }

    // --- crea un fragmento vivo con memoria en cero -------------------
    makeFragment(opKey, opts = {}) {
      const op = C.OPERATIONS[opKey];
      const isInstruction = opts.instruction || this.chance(0.18);
      const text = isInstruction ? this.pick(op.instructions) : this._composeWith(opKey);
      const frag = {
        id: `f${(UID++).toString(36)}`,
        text,
        origin: opKey,
        glyph: op.glyph,
        instruction: isInstruction,
        // posición en el pliego deformable (fracciones 0..1)
        x: opts.x != null ? opts.x : this.float(0.06, 0.94),
        y: opts.y != null ? opts.y : this.float(0.08, 0.92),
        // el estrato de reposo: dónde vive esta frase en la profundidad
        stratum: opts.stratum != null ? opts.stratum : this.int(0, 2),
        scale: 1,
        // ---- MEMORIA VERDADERA ----
        atencion: 0,     // cuánto fue observado (permanencia del cursor)
        daño: 0,         // erosión por el cursor veloz
        conexiones: [],  // ids de fragmentos enlazados
        edad: opts.edad || 0,
        // procedencia narrativa
        buriedFrom: opts.buriedFrom || null,
        era: opts.era || null,
        born: this.turn,
      };
      return frag;
    }

    // --- comienza una vuelta: futuro anterior ------------------------
    beginTurn() {
      this.stateIndex = 0;
      this.legendIntegrity = Math.max(8, this.legendIntegrity - this.float(0, 6));
      const target = 26 + this.turn; // el campo se densifica vuelta a vuelta
      this.log.push({ kind: 'turn-begin', turn: this.turn, at: Date.now() });

      // los residuos enterrados regresan como lectura prevista,
      // mal atribuidos a otra época (arqueología futura anticipada)
      const back = this.buried.splice(0, Math.min(this.buried.length, this.int(3, 7)));
      back.forEach((res) => {
        const f = this.makeFragment(res.origin, {
          buriedFrom: res.turn != null ? res.turn : 'previsto',
          era: res.era || this.pick(C.OPERATIONS.cronologia.years),
          edad: (res.edad || 0) + 1,
        });
        // el residuo trae su texto anterior, ya deformado
        f.text = res.text;
        f.predicted = res.predicted || false;
        this.fragments.push(f);
      });

      // se generan fragmentos frescos hasta densificar el campo
      while (this.fragments.length < target) {
        this.fragments.push(this.makeFragment(this.pick(this.opKeys)));
      }
      this.integrityHistory.push(this.legendIntegrity);
      if (this.integrityHistory.length > 40) this.integrityHistory.shift();
    }

    // --- avanzar de estado (los ocho modos de la vuelta) -------------
    advanceState() {
      if (this.stateIndex >= STATES.length - 1) {
        return this.endTurn();       // tras profecía fallida, muta y reinicia
      }
      this.stateIndex++;
      this.log.push({ kind: 'state', state: this.state, turn: this.turn, at: Date.now() });
      return this.state;
    }
    // un estado puede adelantarse por la acción que lo caracteriza
    jumpTo(stateName) {
      const idx = STATES.indexOf(stateName);
      if (idx > this.stateIndex) {
        this.stateIndex = idx;
        this.log.push({ kind: 'state-jump', state: stateName, turn: this.turn, at: Date.now() });
      }
      return this.state;
    }

    // --- PROFECÍA :: el sistema predice la próxima acción del lector --
    predict() {
      const acciones = ['mover', 'detener', 'enlazar', 'arrastrar', 'excavar', 'abandonar', 'nada'];
      // la predicción usa la historia: sesga hacia lo más frecuente
      const counts = this._actionCounts || {};
      const weights = acciones.map((a) => [a, 1 + (counts[a] || 0)]);
      const total = weights.reduce((s, w) => s + w[1], 0);
      let n = this.rng() * total;
      let chosen = acciones[0];
      for (const [a, w] of weights) { n -= w; if (n <= 0) { chosen = a; break; } }
      this.prediction = { accion: chosen, at: Date.now(), resolved: false };
      return this.prediction;
    }
    recordAction(accion) {
      this._actionCounts = this._actionCounts || {};
      this._actionCounts[accion] = (this._actionCounts[accion] || 0) + 1;
    }
    resolvePrediction(accionReal) {
      if (!this.prediction || this.prediction.resolved) return null;
      const hit = this.prediction.accion === accionReal;
      this.prediction.resolved = true;
      this.prediction.real = accionReal;
      this.prediction.hit = hit;
      if (hit) {
        // si acierta, la interfaz se vuelve más autoritaria
        this.authority = Math.min(100, this.authority + this.float(6, 14));
      } else {
        // si falla, la leyenda diagramática pierde integridad
        this.legendIntegrity = Math.max(0, this.legendIntegrity - this.float(7, 18));
      }
      this.log.push({ kind: 'prophecy', predicted: this.prediction.accion, real: accionReal, hit });
      return this.prediction;
    }

    // --- ENLACE :: unir dos fragmentos produce una tercera cosa ------
    link(idA, idB) {
      const a = this.fragments.find((f) => f.id === idA);
      const b = this.fragments.find((f) => f.id === idB);
      if (!a || !b || a === b) return null;
      const relKey = this._weightedRelation();
      const rel = C.RELATIONS[relKey];
      const relation = { id: `r${(UID++).toString(36)}`, from: idA, to: idB, kind: relKey, glyph: rel.glyph, turn: this.turn };
      this.relations.push(relation);
      if (!a.conexiones.includes(idB)) a.conexiones.push(idB);
      if (!b.conexiones.includes(idA)) b.conexiones.push(idA);
      // conectar no explica: modifica ambos textos y engendra un tercero
      const third = this._mutatePair(a, b, relKey);
      this.log.push({ kind: 'link', from: idA, to: idB, rel: relKey });
      return { relation, third };
    }
    _weightedRelation() {
      const keys = Object.keys(C.RELATIONS);
      const entries = keys.map((k) => {
        let w = 1;
        if (k === 'perdida') w += (100 - this.legendIntegrity) / 40;
        if (k === 'contradiccion') w += this.turn * 0.2;
        if (k === 'demora') w += 0.4;
        return [k, w];
      });
      const total = entries.reduce((s, e) => s + e[1], 0);
      let n = this.rng() * total;
      for (const [k, w] of entries) { n -= w; if (n <= 0) return k; }
      return keys[0];
    }
    _mutatePair(a, b, relKey) {
      const wa = a.text.split(/\s+/);
      const wb = b.text.split(/\s+/);
      const pa = wa[Math.floor(this.rng() * wa.length)] || '';
      const pb = wb[Math.floor(this.rng() * wb.length)] || '';
      switch (relKey) {
        case 'contagio': // intercambian una palabra
          this._swapWord(a, pa, pb); this._swapWord(b, pb, pa); break;
        case 'herencia': // b hereda una palabra de a
          b.text = b.text.replace(pb, `${pb} ${pa}`); break;
        case 'contradiccion': // a niega lo que b afirma
          a.text = `no ${a.text}`; break;
        case 'perdida': // ambos pierden algo
          a.text = a.text.replace(pa, '████'); b.text = b.text.replace(pb, '····'); break;
        case 'demora': // b llega tarde: se desplaza en el pliego
          b.y = Math.min(0.95, b.y + 0.08); break;
        case 'eco': // a repite una palabra de b
          a.text = a.text.replace(pa, `${pa} ${pa} ${pb}`); break;
      }
      // la tercera cosa: una fusión que nace del enlace
      return Morph.fusionar(pa || 'a', pb || 'b');
    }
    _swapWord(frag, from, to) {
      if (!from || !to) return;
      frag.text = frag.text.replace(from, to);
    }

    // --- PRESENTE CONTINUO :: permanecer deforma la palabra ----------
    //  cada repetición pierde, desplaza o intercambia una letra
    dwellDeform(frag) {
      frag.atencion += 1;
      const modes = [
        (w) => w.slice(0, -1),                                   // pierde
        (w) => (w.length > 1 ? w[1] + w[0] + w.slice(2) : w),    // desplaza
        (w) => { const i = Math.floor(this.rng() * w.length); return w.slice(0, i) + this.pick('aeiouns'.split('')) + w.slice(i + 1); }, // intercambia
      ];
      const parts = frag.text.split(/(\s+)/);
      const idxs = parts.map((p, i) => (/\S/.test(p) ? i : -1)).filter((i) => i >= 0);
      if (!idxs.length) return;
      const i = idxs[Math.floor(this.rng() * idxs.length)];
      const mode = modes[Math.floor(this.rng() * modes.length)];
      const repeated = parts[i] + ' ' + mode(parts[i]);
      parts[i] = repeated;
      frag.text = parts.join('');
      // la repetición se acumula, pero el fragmento no crece sin fin:
      // el presente continuo tiene duración, no infinito
      if (frag.text.length > 200) frag.text = frag.text.slice(-180);
    }

    // --- SONDA :: el cursor veloz erosiona, el lento revela ----------
    probe(frag, velocity) {
      if (velocity > 1.2) {
        frag.daño = Math.min(100, frag.daño + velocity * 0.6);
        if (frag.daño > 40 && this.chance(0.2)) {
          frag.text = Morph.evaporar(frag.text, this.rng, 0.18);
        }
      } else {
        frag.atencion += (1.2 - velocity);
      }
    }

    // --- render de un fragmento según la profundidad de excavación ---
    //  la ilegibilidad es local; la legibilidad, estructural
    renderText(frag, depth) {
      const dist = Math.abs(depth - frag.stratum);
      const stratum = C.STRATA[Math.min(C.STRATA.length - 1, Math.round(depth))];
      const r = makeRng(`${frag.id}:${stratum.key}:${frag.edad}`);
      let t = frag.text;
      if (dist >= 0.5) t = applyStratum(t, stratum.op, r);
      if (frag.daño > 60) t = Morph.evaporar(t, r, 0.3);
      return t;
    }

    // =================================================================
    //  EL CONTRAARCHIVO :: al terminar la vuelta, el archivo se muta
    // =================================================================
    endTurn() {
      this.log.push({ kind: 'turn-end', turn: this.turn, at: Date.now() });

      // 1. cada fragmento envejece y calcula su puntaje de supervivencia
      this.fragments.forEach((f) => {
        f.edad += 1;
        f._score = this._survivorScore(f);
      });

      // 2. lo muy observado se hipertrofia
      this.fragments.forEach((f) => {
        if (f.atencion > 6) {
          f.scale = Math.min(6, 1 + f.atencion * 0.12);
          f.text = f.text.toUpperCase();
        }
      });

      // 3. lo ignorado se fosiliza (a esqueleto consonántico)
      this.fragments.forEach((f) => {
        if (f.atencion < 1 && f.edad > 1) {
          f.stratum = 2;
          f.text = f.text.split(/\s+/).map((w) => Morph.esqueletoConsonantico(w)).join(' ');
          f.fossil = true;
        }
      });

      // 4. lo borrado regresa como signo (glifo)
      this.fragments.forEach((f) => {
        if (f.daño > 55) {
          f.stratum = 4;
          f.text = [...f.text].map((ch) => (ch === ' ' ? ' ' : this.pick(C.GLYPHS))).join('');
          f.sign = true;
        }
      });

      // 5. lo conectado hereda palabras de sus vecinos
      this.fragments.forEach((f) => {
        f.conexiones.forEach((cid) => {
          const n = this.fragments.find((x) => x.id === cid);
          if (!n) return;
          const nw = n.text.split(/\s+/).filter((w) => w.length > 3);
          if (nw.length && this.chance(0.6)) {
            const w = nw[Math.floor(this.rng() * nw.length)];
            f.text = `${f.text} ${w}`;
          }
        });
      });

      // 6. lo mal predicho ya corrompió la leyenda durante la vuelta.
      //    aquí la corrupción se sedimenta.
      if (this.prediction && this.prediction.resolved && !this.prediction.hit) {
        this.legendIntegrity = Math.max(0, this.legendIntegrity - this.float(2, 8));
      }

      // 7. sólo permanece entre 5% y 15%, ELEGIDO POR LA HISTORIA
      const keepRatio = this.float(0.05, 0.15);
      const sorted = [...this.fragments].sort((a, b) => b._score - a._score);
      const keepN = Math.max(2, Math.round(this.fragments.length * keepRatio));
      const survivors = sorted.slice(0, keepN);
      const buried = sorted.slice(keepN);

      // los residuos se entierran, para regresar mal atribuidos
      buried.forEach((f) => {
        this.buried.push({
          text: applyStratum(f.text, 'dust', makeRng(`${f.id}:dust`)),
          origin: f.origin,
          turn: this.turn,
          edad: f.edad,
          era: f.era || this.pick(C.OPERATIONS.cronologia.years),
        });
      });
      // el enterramiento no es infinito
      if (this.buried.length > 40) this.buried = this.buried.slice(-40);

      // el archivo mutado (ARCHIVO′) conserva sólo a los sobrevivientes.
      // se copia el arreglo: beginTurn lo repuebla, y no queremos que ese
      // relleno contamine el conteo verdadero de supervivencia.
      const survivorCount = survivors.length;
      this.fragments = survivors.slice();
      // las relaciones que perdieron un extremo quedan huérfanas
      const alive = new Set(survivors.map((f) => f.id));
      this.relations = this.relations.filter((r) => alive.has(r.from) && alive.has(r.to));

      this.turn += 1;
      this.beginTurn();
      return { turn: this.turn, keepRatio, survivors: survivorCount, buried: buried.length };
    }

    // el puntaje NO es azar: es la biografía del fragmento en esta lectura
    _survivorScore(f) {
      return (
        f.atencion * 3.0 +           // lo mirado sobrevive
        f.conexiones.length * 2.2 +  // lo enlazado sobrevive
        f.daño * 0.8 +               // lo herido deja marca
        f.edad * 0.4 +               // lo viejo persiste
        (f.predicted ? -2 : 0)       // lo previsto tiende a disolverse
      );
    }

    // --- clon determinista para imponer la edición impresa -----------
    snapshotForPrint() {
      return {
        seed: this.seed,
        turn: this.turn,
        legendIntegrity: this.legendIntegrity,
        authority: this.authority,
        fragments: this.fragments.map((f) => ({ ...f })),
        relations: this.relations.map((r) => ({ ...r })),
        buried: this.buried.slice(),
        log: this.log.slice(),
        prediction: this.prediction,
      };
    }
  }

  const api = { Archive, makeRng, Morph, applyStratum, STATES, words };
  if (typeof window !== 'undefined') window.ArchiveCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
