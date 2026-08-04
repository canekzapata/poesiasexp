'use strict';
/* =====================================================================
   CONTRAPUNTO ESPECTRAL — voces.js
   lo que faltaba no era una librería: eran voces, un sujeto y ataques.
   una masa que respira junta no es contrapunto, es una masa.

   la traducción es exacta. las huellas que vuelven deformadas ya eran
   entradas canónicas sin saberlo: un sujeto que reaparece más tarde, en
   otra voz, transformado. lo que aquí se añade es el vocabulario que
   faltaba —imitación, aumentación, disminución, inversión— y una sola
   diferencia con el contrapunto de teclado: la transposición no es por
   intervalos sino por **escalones de la serie armónica**. una respuesta
   no está una quinta arriba: está dos parciales arriba, y por eso suena
   emparentada y distinta a la vez.

   consecuencia que importa: el sujeto se toca sobre el espectro herido.
   si un bit apagó el parcial 6, la nota del sujeto que caía en el 6 no
   suena. el mensaje degradándose le hace agujeros al tema.

   este módulo tampoco produce sonido: describe. `sound.js` lo toca.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  /* tres voces, cada una anclada a una región de la serie. no se cruzan:
     lo que las distingue es el registro, como en cualquier trío. */
  const REGISTROS = [
    { nombre: 'bajo',  min: 1,  max: 4,  amp: 0.85 },
    { nombre: 'medio', min: 4,  max: 9,  amp: 0.62 },
    { nombre: 'agudo', min: 8,  max: 16, amp: 0.42 }
  ];

  /* ---- el sujeto ----------------------------------------------------
     una contorno de escalones sobre la serie, no una melodía de notas.
     sale de la semilla, así que cada expediente tiene su propio tema. */
  function sujeto() {
    const r = N.seed.make(N.estado.semilla, 'sujeto');
    const n = r.i(5, 7);
    const pasos = [0];
    for (let i = 1; i < n; i++) {
      /* pasos pequeños con un salto: eso es lo que hace reconocible un
         tema. el salto cae siempre en el mismo lugar de la semilla. */
      const salto = (i === r.i(2, n - 2));
      pasos.push(pasos[i - 1] + (salto ? r.pick([3, 4, -3]) : r.pick([1, -1, 2, -2, 0])));
    }
    const duraciones = [];
    for (let i = 0; i < n; i++) duraciones.push(r.pick([1, 1, 0.5, 0.5, 2]));
    const ataques = [];
    for (let i = 0; i < n; i++) ataques.push(r.f(0.004, 0.03));
    return { pasos: pasos, duraciones: duraciones, ataques: ataques, n: n };
  }

  /* el pulso no es un metrónomo: sale de la pausa mediana del visitante,
     igual que la respiración. el tema va al paso del que lo escucha. */
  function pulso() {
    const mo = (N.copia && N.mem.d) ? N.copia.modelo() : null;
    const med = Math.max(4, Math.min(30, (mo && mo.mediana) || 9));
    return Math.max(0.22, Math.min(0.95, med / 14));
  }

  /* ---- una entrada: el sujeto dicho por una voz ----------------------
     la etapa del regreso decide la transformación, y son las de siempre:
       0  respuesta real —el tema tal cual, dos escalones arriba
       1  aumentación o disminución
       2  la respuesta baja de registro: pierde escalones
       3  estrecho con el sujeto equivocado: entra con el contorno vecino
       4  inversión —el tema al revés, desafinado: ya no se puede asegurar
   */
  function entradaPara(huella, etapa) {
    const s = sujeto();
    const e = etapa === undefined ? Math.min(huella.regresos || 0, 4) : etapa;
    const r = N.seed.make(N.estado.semilla, 'entrada:' + (huella.id || '0') + ':' + e);
    const voz = (huella.parcial + e) % REGISTROS.length;
    const reg = REGISTROS[voz];

    let pasos = s.pasos.slice();
    let factor = huella.escala || 1;
    let base = Math.max(reg.min, Math.min(reg.max, huella.parcial));
    let desafina = 0;
    let clase = huella.clase || 'verdadero';

    if (e === 0) {
      base = Math.max(reg.min, Math.min(reg.max, base + 2));  // respuesta real
    } else if (e === 1) {
      /* aumentación o disminución. si el modelo todavía no cambió la
         escala, la entrada la decide igual: una respuesta que dura lo
         mismo que el sujeto no es una respuesta, es un unísono. */
      factor = (huella.escala && huella.escala !== 1) ? huella.escala : (r.raw() < 0.5 ? 2.6 : 0.42);
    } else if (e === 2) {
      pasos = pasos.map(function (p) { return Math.round(p * 0.5); });
      base = Math.max(reg.min, base - 2);
    } else if (e === 3) {
      /* contorno prestado: el tema entra con la forma del vecino */
      const g = huella.genealogia && huella.genealogia[0];
      if (g) {
        const otra = N.seed.make(N.estado.semilla, 'sujeto');
        pasos = pasos.slice().reverse();
        base = Math.max(reg.min, Math.min(reg.max, g.parcial || base));
      }
      desafina = 22;
    } else {
      pasos = pasos.map(function (p) { return -p; });          // inversión
      desafina = 55;
    }

    return {
      voz: voz, registro: reg.nombre, base: base, pasos: pasos,
      duraciones: s.duraciones, ataques: s.ataques,
      factor: factor, desafina: desafina, clase: clase, etapa: e,
      de: huella.pagina, id: huella.id
    };
  }

  /* refleja un escalón que se salió de la serie hacia dentro, como una
     voz que rebota en su límite en vez de aplastarse contra él */
  function plegar(i, n) {
    let k = i, vueltas = 0;
    while ((k < 1 || k > n) && vueltas++ < 8) {
      if (k < 1) k = 2 - k;
      if (k > n) k = 2 * n - k;
    }
    return Math.max(1, Math.min(n, k));
  }

  /* ---- el plan de la entrada, nota por nota --------------------------
     aquí se toca el espectro herido: cada nota busca su parcial y, si el
     mensaje lo apagó, la nota no suena. el tema pierde notas conforme el
     mensaje pierde bits. */
  function notas(entrada) {
    const esp = N.espectro.estado();
    const P = esp.parciales;
    const b = pulso() * (entrada.factor || 1);
    const out = [];
    let t = 0;
    for (let i = 0; i < entrada.pasos.length; i++) {
      /* el contorno se pliega dentro de la serie en vez de recortarse.
         recortar hundía la inversión contra el parcial 1 y repetía la
         misma nota grave: eso no es un canon invertido, es un tropiezo.
         plegar conserva la forma del contorno, que es lo que se reconoce. */
      const idx = plegar(entrada.base + entrada.pasos[i], P.length);
      const p = P[idx - 1];
      const dur = entrada.duraciones[i] * b;
      const callado = !p || p.modo === 'callado';
      const nota = {
        t: t,
        parcial: idx,
        f: p ? p.f + p.desv : 0,
        dur: dur,
        ataque: entrada.ataques[i],
        amp: REGISTROS[entrada.voz].amp * (p ? Math.pow(p.a, 0.35) : 0),
        desafina: entrada.desafina,
        callado: callado,
        modo: p ? p.modo : 'callado'
      };
      /* cada nota trae su propio espectro y su índice de anillo: el
         timbre lo hereda del organismo, no lo elige el renderizador */
      nota.timbre = timbre(nota, esp.estira);
      nota.anillo = anillo(entrada.clase);
      out.push(nota);
      t += dur;
    }
    return { notas: out, duracion: t, voz: entrada.voz, entrada: entrada };
  }

  /* cuántas notas del tema siguen sonando: la legibilidad del sujeto,
     medida. es también el rastro legible para quien no oye. */
  /* ---- el timbre de una nota ----------------------------------------
     una nota no es una frecuencia: es un espectro que evoluciona. cada
     nota se sintetiza con cuatro parciales propios cuyo brillo cae al
     decaer —ataque claro, cola oscura—, que es lo que distingue un
     instrumento de un oscilador pelado.

     la inarmonicidad de esos parciales la hereda del organismo: si el
     expediente está herido, las notas del tema también suenan
     inarmónicas. el timbre no se elige, se hereda. */
  function timbre(nota, estira) {
    const s = estira === undefined ? 0.008 : estira;
    const dur = nota.dur;
    const out = [];
    for (let k = 1; k <= 4; k++) {
      /* el mismo estiramiento que deforma la serie deforma cada nota */
      const mult = Math.pow(k, 1 + s * 2.2);
      out.push({
        mult: mult,
        /* los agudos entran igual de rápido y se van antes: eso es un
           ataque con brillo que se apaga, no un filtro barrido */
        amp: Math.pow(k, -1.35),
        dur: dur * (k === 1 ? 1 : 0.72 / Math.pow(k, 0.35)),
        ataque: nota.ataque * (k === 1 ? 1 : 0.6)
      });
    }
    return out;
  }

  /* ---- modulación en anillo -----------------------------------------
     cuando una huella deja de poder asegurarse, desafinarla no basta:
     sigue siendo el mismo objeto un poco corrido. la modulación en
     anillo lo convierte en otro —suma y diferencia, espectro inarmónico
     que ya no pertenece a la serie—. es la operación espectral para
     «esto ya no es aquello». */
  function anillo(clase) {
    if (clase === 'inventado') return 0.62;
    if (clase === 'degradado') return 0.24;
    if (clase === 'contradiccion') return 0.4;
    return 0;
  }

  /* ---- conducción ----------------------------------------------------
     tres voces que no se escuchan entre sí son tres monólogos. estas son
     las dos reglas mínimas del contrapunto, traducidas a la serie:
       · nada de unísonos accidentales entre voces distintas;
       · si otra voz sube, ésta prefiere bajar.
     y una cadencia que aquí sí significa algo: dos voces que caen en
     parciales de la misma familia (2, 4, 8 · 3, 6, 12) se resuelven. */
  function familia(p) {
    let k = p;
    while (k % 2 === 0 && k > 1) k = k / 2;
    return k;                                   // 8→1, 12→3, 5→5
  }

  function conducir(entrada, otras) {
    if (!otras || !otras.length) return entrada;

    /* una voz canta una línea. si la entrada cae en una voz que ya está
       ocupada, se muda a la que lleve más tiempo callada: tres voces que
       pueden solaparse consigo mismas no son tres voces, son tres
       etiquetas. */
    const ocupadas = otras.map(function (o) { return o.voz; });
    if (ocupadas.indexOf(entrada.voz) >= 0) {
      for (let k = 1; k <= REGISTROS.length; k++) {
        const cand = (entrada.voz + k) % REGISTROS.length;
        if (ocupadas.indexOf(cand) < 0) {
          entrada.voz = cand;
          entrada.registro = REGISTROS[cand].nombre;
          const reg = REGISTROS[cand];
          entrada.base = Math.max(reg.min, Math.min(reg.max, entrada.base));
          entrada.mudada = true;
          break;
        }
      }
    }

    const dir = entrada.pasos[entrada.pasos.length - 1] - entrada.pasos[0];
    let base = entrada.base;
    for (const o of otras) {
      if (o.voz === entrada.voz) continue;
      const dirO = o.pasos[o.pasos.length - 1] - o.pasos[0];
      /* movimiento contrario: si la otra sube, ésta entra bajando */
      if (dir * dirO > 0) entrada.pasos = entrada.pasos.map(function (x) { return -x; });
      /* unísono accidental: la entrada se aparta un escalón */
      if (o.base === base) base += (base > 8 ? -1 : 1);
    }
    entrada.base = base;
    entrada.cadencia = otras.some(function (o) {
      return o.voz !== entrada.voz && familia(o.base) === familia(entrada.base);
    });
    return entrada;
  }

  const BASE_CANONICA = 6;   // registro medio: el tema se mide siempre ahí
  function integridadDelSujeto() {
    const s = sujeto();
    const P = N.espectro.estado().parciales;
    let vivas = 0;
    for (let i = 0; i < s.pasos.length; i++) {
      const p = P[plegar(BASE_CANONICA + s.pasos[i], P.length) - 1];
      if (p && p.modo !== 'callado') vivas++;
    }
    return { vivas: vivas, total: s.n };
  }

  /* el contorno escrito, para la bitácora y el acta */
  function contorno(entrada) {
    const e = entrada || { pasos: sujeto().pasos, base: 3 };
    return e.pasos.map(function (p) { return (p >= 0 ? '+' : '') + p; }).join(' ');
  }

  N.voces = {
    REGISTROS, sujeto, pulso, entradaPara, notas, integridadDelSujeto, contorno,
    timbre, anillo, conducir, familia, plegar
  };

})(window.NPVS);
