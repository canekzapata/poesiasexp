'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — narrative.js
   cinco movimientos. no son niveles: son estados del aparato deducidos
   de invariantes. ningún hito aparece antes de ganarse.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  const MOVIMIENTOS = [
    { n: 'I',   nombre: 'RECEPCIÓN',     linea: 'llega algo. la página no distingue entre señal, ruido y visitante.' },
    { n: 'II',  nombre: 'APROXIMACIÓN',  linea: 'el aparato construye una copia finita del recorrido.' },
    { n: 'III', nombre: 'CONTRADICCIÓN', linea: 'dos historias incompatibles producen la misma superficie.' },
    { n: 'IV',  nombre: 'CONTACTO',      linea: 'la señal empieza a usar los gestos del visitante.' },
    { n: 'V',   nombre: 'CERTIFICADO',   linea: 'la demostración falló. el fracaso tiene forma de documento.' }
  ];

  /* invariantes: condiciones persistentes, no puntajes.
     cada uno declara su familia — la del régimen que lo produjo — porque
     el certificado exige evidencia de varias familias, no cantidad. */
  const INVARIANTES = {
    'el-campo-fue-tocado':              ['A', 'el campo fue tocado con las manos'],
    'campo-comprimido-dos-veces':       ['A', 'el campo fue comprimido y expulsó cuerpos'],
    'dimension-insuficiente-corregida': ['A', 'se añadió una dimensión que nadie puede ver'],
    'frase-en-el-vacio':                ['A', 'una frase ocupa un hueco y ahora estorba'],
    'un-vacio-fue-cruzado':             ['A', 'un hueco del campo funcionó como puerta'],
    'la-compresion-abrio-una-caja':     ['A', 'comprimir dejó de ser posible y apareció un contenedor'],
    'un-fragmento-volvio':              ['A', 'un residuo fue devuelto a un campo que no lo esperaba'],
    'una-perdida-demostrable':          ['A', 'una pérdida quedó registrada como pérdida'],

    'tres-codigos-separados':           ['B', 'tres recuerdos se mantuvieron a distancia mínima'],
    'un-bit-a-mano':                    ['B', 'un bit fue cambiado a mano'],
    'ambiguedad-conservada':            ['B', 'se conservó la ambigüedad en lugar de corregirla'],
    'ruta-elegida-por-codigo':          ['B', 'se siguió una dirección por su código, no por su nombre'],

    'la-copia-existe':                  ['C', 'existe una copia del recorrido'],
    'la-copia-actua-sola':              ['C', 'la copia actúa por su cuenta'],
    'la-copia-navego-sola':             ['C', 'la copia cruzó un enlace sin el visitante'],

    'dos-recuerdos-incompatibles':      ['D', 'la memoria sostiene dos versiones de lo mismo'],
    'regreso-no-equivalente':           ['D', 'se volvió a una página que ya no es la misma'],
    'dos-superficies-iguales':          ['D', 'dos historias distintas produjeron la misma superficie'],
    'el-dictamen-fue-objetado':         ['D', 'el dictamen fue objetado y la objeción lo confirmó'],
    'la-funcion-no-declarada-fue-escrita': ['D', 'el recorrido fue inscrito como misión del objeto'],

    'reticula-deformada':               ['G', 'la retícula dejó de ser la que era'],
    'ruta-mas-cercana-incorrecta':      ['G', 'se aceptó una aproximación en lugar del original'],
    'distancia-preservada':             ['G', 'se conservó una distancia sin resolver'],
    'las-dos-cercanias-coincidieron':   ['G', 'la geometría y el recorrido señalaron lo mismo'],
    'la-distancia-crecio-sola':         ['G', 'la distancia aumentó sin que nadie hiciera nada'],

    'punto-sostenido':                  ['H', 'un punto permaneció dentro del cuerpo'],
    'el-interior-fue-expulsado':        ['H', 'el contenedor soltó lo único que contenía'],

    'triangulo-monocromatico':          ['I', 'tres relaciones del mismo color se cerraron'],

    'el-campo-escribio-solo':           ['·', 'la inactividad completó una escritura'],
    'la-espera-abrio-una-ruta':         ['·', 'la espera abrió una dirección que no estaba'],
    'la-espera-completo-la-carta':      ['·', 'una transmisión entró completa porque nadie la cortó'],
    'la-interrupcion-tuvo-costo':       ['·', 'una transmisión fue interrumpida y lo que faltaba se volvió residuo'],
    'la-espera-eligio-por-ti':          ['·', 'la espera eligió una dirección'],
    'el-silencio-fue-sostenido':        ['·', 'el silencio se sostuvo el tiempo suficiente para medirse'],
    'la-repeticion-revelo-la-estructura': ['·', 'repetir dejó ver lo que había debajo del ruido'],
    'la-demora-se-completo':            ['·', 'una página se terminó de escribir con puro tiempo'],
    'el-original-volvio-a-faltar':      ['·', 'la sustitución del original se deshizo sola'],

    'conexion-eliminada':               ['J', 'se quitó una relación que la prueba necesitaba'],
    'acta-emitida':                     ['J', 'se emitió un acta que no demuestra el contenido']
  };

  function movimiento() {
    const m = N.mem.d;
    const h = m.hitos;
    const contras = m.contradicciones.length;
    const actos = m.copia.actos.length;
    if (Object.keys(h).length >= 8 && (contras >= 2 || m.triangulos.length)) return 4;
    if (actos >= 4 && (contras >= 1 || h['dos-recuerdos-incompatibles'])) return 3;
    if (contras >= 1 || h['dos-recuerdos-incompatibles'] || h['regreso-no-equivalente']) return 2;
    if (h['la-copia-existe'] || Object.keys(h).length >= 3) return 1;
    return 0;
  }

  function estado() {
    const i = movimiento();
    return Object.assign({ i }, MOVIMIENTOS[i]);
  }

  function ganados() {
    const h = N.mem.d.hitos;
    return Object.keys(h).filter(k => INVARIANTES[k]).map(k => ({
      k, familia: INVARIANTES[k][0], texto: INVARIANTES[k][1], t: h[k].t, v: h[k].v
    }));
  }

  function familias() { return new Set(ganados().map(x => x.familia)); }

  /* el certificado no se desbloquea con una secuencia exacta: pide
     evidencia acumulada de al menos cuatro familias distintas. */
  function puedeCertificar() {
    return ganados().length >= 6 && familias().size >= 4;
  }

  function faltaParaCertificar() {
    const g = ganados();
    const f = familias().size;
    return Math.max(Math.max(0, 6 - g.length), Math.max(0, 4 - f));
  }

  /* el aparato habla según el movimiento en curso */
  function dictamen() {
    const e = estado();
    const m = N.mem.d;
    const t = N.corpus.TESTIGO;
    const idx = (e.i * 2 + m.contradicciones.length) % t.length;
    return t[idx];
  }

  N.narrativa = { MOVIMIENTOS, INVARIANTES, movimiento, estado, ganados, familias, puedeCertificar, faltaParaCertificar, dictamen };

})(window.NPVS);
