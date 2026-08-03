/* =====================================================================
   EL CLAVE BIEN TEÑIDO — worklets/cuerpo.js
   anfitrión del cuerpo espectral. no compone, no decide y no guarda
   estado narrativo: instancia `dsp/cuerpo.wasm` —compilado por Faust en
   el taller— y le da un hilo de audio propio.

   son ciento treinta líneas de ABI escritas a mano en vez de setecientos
   kilobytes de runtime de terceros, porque esta pieza tiene que seguir
   siendo legible y modificable dentro de diez años.

   el ABI de Faust (backend `wasm-i`, `-single`) es éste:
     memoria    el módulo exporta la suya; el struct del DSP vive en 0 y
                ocupa `size` bytes. después de `size` colocamos el arreglo
                de punteros de salida y los búferes de audio.
     funciones  init(dsp, sr) · compute(dsp, n, entradas, salidas)
                setParamValue(dsp, indice, valor)
     índices    los da `dsp/cuerpo.meta.json`, que se versiona al lado

   los parámetros son AudioParam de verdad: así el tiempo los puede rampar
   con la precisión del reloj de audio, y una transición de veinte minutos
   se programa en vez de animarse cuadro a cuadro.
   ===================================================================== */

const PARAMS = [
  ['f0', 110, 20, 4000],
  ['estiramiento', 0, -0.15, 0.15],
  ['desviacion', 0, -150, 150],
  ['croma', 1, 0, 1],
  ['rugosidad', 0, 0, 1],
  ['congelado', 0, 0, 1],
  ['interpolacion', 0, 0, 1],
  ['ganancia', 0, 0, 1],
  ['a0', 0.5, 0, 1], ['a1', 0.4, 0, 1], ['a2', 0.3, 0, 1], ['a3', 0.25, 0, 1],
  ['a4', 0.2, 0, 1], ['a5', 0.16, 0, 1], ['a6', 0.13, 0, 1], ['a7', 0.1, 0, 1],
  ['b0', 0.5, 0, 1], ['b1', 0.4, 0, 1], ['b2', 0.3, 0, 1], ['b3', 0.25, 0, 1],
  ['b4', 0.2, 0, 1], ['b5', 0.16, 0, 1], ['b6', 0.13, 0, 1], ['b7', 0.1, 0, 1]
];

/* las importaciones que pide el `.wasm`: sólo matemáticas. */
function importaciones() {
  const m = {
    _abs: Math.abs, _acosf: Math.acos, _asinf: Math.asin, _atanf: Math.atan,
    _atan2f: Math.atan2, _ceilf: Math.ceil, _cosf: Math.cos, _expf: Math.exp,
    _floorf: Math.floor, _fmodf: (x, y) => x % y, _logf: Math.log, _log10f: Math.log10,
    _max_f: Math.max, _min_f: Math.min, _powf: Math.pow, _remainderf: (x, y) => x - Math.round(x / y) * y,
    _roundf: Math.round, _sinf: Math.sin, _sqrtf: Math.sqrt, _tanf: Math.tan,
    _acoshf: Math.acosh, _asinhf: Math.asinh, _atanhf: Math.atanh,
    _coshf: Math.cosh, _sinhf: Math.sinh, _tanhf: Math.tanh,
    _isnanf: Number.isNaN, _isinff: (x) => !isFinite(x),
    _copysignf: (x, y) => (Math.sign(x) === Math.sign(y) ? x : -x),
    memoryBase: 0, tableBase: 0
  };
  /* la versión doble de cada una, por si el compilador la pide */
  for (const k of Object.keys(m)) {
    if (k.endsWith('f') && typeof m[k] === 'function') m[k.slice(0, -1)] = m[k];
  }
  return { env: m };
}

class Cuerpo extends AudioWorkletProcessor {

  static get parameterDescriptors() {
    return PARAMS.map(function (p) {
      return { name: p[0], defaultValue: p[1], minValue: p[2], maxValue: p[3], automationRate: 'k-rate' };
    });
  }

  constructor(opciones) {
    super();
    const o = (opciones && opciones.processorOptions) || {};
    this.vivo = false;
    this.ultimos = {};
    try {
      const modulo = new WebAssembly.Module(o.wasm);
      this.inst = new WebAssembly.Instance(modulo, importaciones());
      const e = this.inst.exports;
      this.meta = o.meta;
      this.dsp = 0;

      /* memoria: struct del DSP, luego el arreglo de punteros de salida,
         luego los búferes. todo alineado a 8. */
      const align = (n) => (n + 7) & ~7;
      const salidas = o.meta.salidas || 1;
      const cuadro = 128;
      const ptrSalidas = align(o.meta.size);
      const base = align(ptrSalidas + salidas * 4);
      const total = base + salidas * cuadro * 4;
      const paginas = Math.ceil(total / 65536) + 1;
      const tiene = e.memory.buffer.byteLength / 65536;
      if (tiene < paginas) e.memory.grow(paginas - tiene);

      this.i32 = new Int32Array(e.memory.buffer);
      this.f32 = new Float32Array(e.memory.buffer);
      this.ptrSalidas = ptrSalidas;
      this.salidas = [];
      for (let i = 0; i < salidas; i++) {
        const p = base + i * cuadro * 4;
        this.i32[(ptrSalidas >> 2) + i] = p;
        this.salidas.push(p >> 2);
      }

      e.init(this.dsp, sampleRate);
      this.vivo = true;
      this.port.postMessage({ tipo: 'listo' });
    } catch (err) {
      /* degradación honesta: si el cuerpo no se pudo instanciar, este
         nodo se calla y la red lo sustituye por osciladores. no se
         muestra un error técnico y no se bloquea nada. */
      this.port.postMessage({ tipo: 'sin-cuerpo', razon: String(err && err.message || err) });
    }
    this.port.onmessage = (ev) => {
      if (ev.data && ev.data.tipo === 'apagar') this.vivo = false;
    };
  }

  process(entradas, salidas, params) {
    const out = salidas[0];
    if (!this.vivo) { for (const c of out) c.fill(0); return true; }
    const e = this.inst.exports;

    /* los parámetros llegan como AudioParam: el tiempo los rampa y aquí
       sólo se copian cuando cambian. */
    for (const p of PARAMS) {
      const nombre = p[0];
      const arr = params[nombre];
      const v = arr.length ? arr[0] : p[1];
      if (this.ultimos[nombre] !== v) {
        const idx = this.meta.params[nombre];
        if (idx !== undefined) e.setParamValue(this.dsp, idx, v);
        this.ultimos[nombre] = v;
      }
    }

    e.compute(this.dsp, out[0].length, 0, this.ptrSalidas);

    const src = this.f32;
    const base = this.salidas[0];
    const canal0 = out[0];
    for (let i = 0; i < canal0.length; i++) {
      const x = src[base + i];
      canal0[i] = x === x ? x : 0;        // un NaN no se propaga a la salida
    }
    for (let c = 1; c < out.length; c++) out[c].set(canal0);
    return true;
  }
}

registerProcessor('cuerpo', Cuerpo);
