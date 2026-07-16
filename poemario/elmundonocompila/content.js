'use strict';

/* =====================================================================
   EL MUNDO NO COMPILA
   content.js  ::  materiales + azar sembrable + categorías + tejedores
   ---------------------------------------------------------------------
   Reorganiza los pools de content(2).js en 12 categorías conceptuales.
   Cada fragmento textual mezcla al menos TRES categorías.
   Todo el azar estructural pasa por RNG (sembrable → reproducible).
   ===================================================================== */

/* ------------------------------------------------------------------ */
/*  RNG sembrable (mulberry32 sobre hash FNV-1a de la semilla)         */
/* ------------------------------------------------------------------ */
const RNG = (() => {
  let state = 0x9e3779b9;
  function seedFrom(input) {
    let h = 2166136261 >>> 0;
    const s = String(input == null ? Date.now() : input);
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    state = (h >>> 0) || 0x9e3779b9;
  }
  function next() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    seedFrom, next,
    get state() { return state >>> 0; },
    set state(v) { state = v >>> 0; },
  };
})();

/* small helpers — all structural randomness flows through RNG */
function rnd()            { return RNG.next(); }
function pick(a)         { return a[(rnd() * a.length) | 0]; }
function rint(a, b)      { return Math.floor(rnd() * (b - a + 1)) + a; }
function rflt(a, b, d = 1) { return +(rnd() * (b - a) + a).toFixed(d); }
function chance(p)       { return rnd() < p; }
function shuffle(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function pickN(a, n) { return shuffle(a).slice(0, Math.min(n, a.length)); }
function padEnd(s, n) { s = String(s); return s.length >= n ? s : s + ' '.repeat(n - s.length); }

/* ------------------------------------------------------------------ */
/*  Las 12 categorías del mundo que la máquina cree conocer            */
/* ------------------------------------------------------------------ */
const CAT_NAMES = ['WORLD','BODY','CODE','WEATHER','LABOR','MEMORY','NETWORK','MATTER','ERROR','TIME','PROTOCOL','RESIDUE'];

const CATS = {
  WORLD: {
    glyph: '◍', abbr: 'WLD',
    nodo: ['el mundo','la frontera','el barrio','el tráfico','la guerra','la deuda',
      'la ciudad','la multitud','la calle','el país','el mercado','la plaza',
      'la intemperie','el continente','el censo','la nación','la vecindad','el afuera'],
    acc: ['rodea','excede','precede','insiste','se desborda','no cabe','sigue afuera',
      'ocurre sin permiso','llega completo','se niega a caber'],
    frag: ['el mundo llegó completo — el modelo pidió que esperara',
      'afuera sigue pasando algo que el diagrama no anotó',
      'la frontera no es una línea: es una latencia',
      'ninguna escala coincide con otra y aun así todo pesa'],
    unidad: ['fronteras','deudas','censos','vueltas','provincias','desalojos'],
    estado: ['sin representar','fuera de campo','excedido','no indexado'],
  },
  BODY: {
    glyph: '☌', abbr: 'BOD',
    nodo: ['el cuerpo','la piel','la nuca','el pulso','la sangre','el muslo','la boca',
      'el aliento','la mano','el ojo','la célula','el hueso','el nervio','la fiebre',
      'la respiración','la garganta','el latido','la retina'],
    acc: ['respira','tiembla','suda','late','se abre','se cierra','duele','arde',
      'se contrae','se eriza','no obedece','se calla'],
    frag: ['la célula no pidió pertenecer al sistema',
      'el pulso a 72 y sin embargo nadie contesta',
      'la piel es la primera interfaz y ya viene rota',
      'respirar es una modulación que nadie programó'],
    unidad: ['bpm','°C','mm Hg','latidos','µm','ml'],
    estado: ['febril','en reposo','sobrecargado','sin señal','vivo, aún'],
  },
  CODE: {
    glyph: '⌘', abbr: 'COD',
    nodo: ['la función','la variable','el bucle','la instrucción','el puntero',
      'la condición','el índice','la clase','el objeto','la excepción','el compilador',
      'la sintaxis','el argumento','el retorno','el hilo','la pila'],
    acc: ['compila','itera','evalúa','retorna','declara','ejecuta','lanza','apunta a',
      'no compila','se cuelga','desborda la pila','espera un valor'],
    frag: ['for cada cosa in mundo: cosa.nombre = aproximación',
      'el compilador esperaba un mundo y recibió un cuerpo',
      'la condición se evalúa a sí misma hasta agotarse',
      'todo nombre es un puntero a algo que ya se movió'],
    unidad: ['ops','iteraciones','líneas','tokens','bytes','stack frames'],
    estado: ['no compila','en bucle','sin tipar','indefinido','segfault inminente'],
  },
  WEATHER: {
    glyph: '☂', abbr: 'WEA',
    nodo: ['la nube','la lluvia','el viento','la niebla','la tormenta','la presión',
      'el frente frío','la humedad','el granizo','la sequía','el viento sur','la bruma',
      'el pronóstico','el cielo','la borrasca'],
    acc: ['llueve','sopla','se acumula','descarga','se disipa','cambia','presiona',
      'amenaza','no termina','vuelve del sur'],
    frag: ['la nube no sabe que debajo de ella el código la llama nube',
      'pronóstico: melancolía con probabilidad de excepción',
      'el viento sur trae paquetes que nadie pidió',
      'llueve sobre datos que ya nadie va a leer'],
    unidad: ['hPa','mm','%HR','°','km/h','octas'],
    estado: ['nublado','inestable','saturado','bajo mínimos','cargado'],
  },
  LABOR: {
    glyph: '⚒', abbr: 'LAB',
    nodo: ['el turno','la jornada','el salario','la fábrica','la mano de obra','la factura',
      'el horario','la tarea','el proceso','la cadena','el rendimiento','la cuota',
      'el descuento','el patrón','la máquina','la planilla'],
    acc: ['produce','rinde','cobra','debe','gasta','descuenta','terceriza','acumula',
      'no alcanza','sigue corriendo','se atrasa','extrae'],
    frag: ['el turno terminó pero el proceso sigue en segundo plano',
      'la energía sin factura mueve todo lo demás',
      'cada tarea deja un residuo que nadie cuantifica',
      'la máquina descuenta el tiempo que el cuerpo no recupera'],
    unidad: ['horas','cuotas','%','tareas/h','turnos','jornales'],
    estado: ['en deuda','al 78%','tercerizado','sin pausa','descontado'],
  },
  MEMORY: {
    glyph: '▤', abbr: 'MEM',
    nodo: ['el recuerdo','el archivo','el sector','la huella','el olvido','la caché',
      'el registro','la copia','el respaldo','la cinta','el dato','el índice',
      'la memoria','el bloque','el fantasma del archivo'],
    acc: ['recuerda','olvida','guarda','corrompe','sobrescribe','respalda','pierde',
      'no encuentra','insiste','se degrada','vuelve incompleto'],
    frag: ['el sector 07 está corrupto y aun así insiste en recordarte',
      'lo que llamamos memoria es un dieléctrico cargado',
      'la copia perdió el aura pero ganó circulación',
      'el respaldo guardó todo menos lo que importaba'],
    unidad: ['bytes','sectores','años','bloques','KiB','huellas'],
    estado: ['corrupto','fragmentado','de sólo lectura','sobrescrito','casi perdido'],
  },
  NETWORK: {
    glyph: '◈', abbr: 'NET',
    nodo: ['el nodo','el enlace','el paquete','el protocolo','la señal','el ruido',
      'el vecino','la ruta','el servidor','el puerto','la antena','el peer','el salto',
      'el handshake','la malla','el enrutador'],
    acc: ['transmite','enruta','pierde','retransmite','sincroniza','cae','reconecta',
      'no responde','se extravía','hace eco','busca un nodo que ya no está'],
    frag: ['la red sólo se ve cuando se rompe',
      'paquete extraviado sin acuse de recibo',
      'todo verso es una transmisión sin ack',
      'la malla no tiene centro y por eso no se cae del todo'],
    unidad: ['bits/s','paquetes','saltos','ms','dBm','nodos'],
    estado: ['desconectado','en reintento','con eco','sin ruta','a la deriva'],
  },
  MATTER: {
    glyph: '◆', abbr: 'MAT',
    nodo: ['el polvo','el óxido','el metal','la ceniza','el agua','la sal','el barro',
      'el cobre','el cristal','la piedra','el calor','la corriente','el sedimento',
      'la placa','la humedad del cuarto'],
    acc: ['se oxida','se disuelve','arde','se acumula','vibra','se enfría','corroe',
      'sedimenta','persiste','no pregunta','decide antes que nadie'],
    frag: ['la materia recuerda sin necesidad de archivo',
      'polvo sobre la placa y el voltaje persiste',
      'la sustancia decide antes que el sujeto',
      'lo molecular antecede a lo gramatical'],
    unidad: ['g','µg/L','°C','J','ppm','mol'],
    estado: ['oxidado','disuelto','saturado','sedimentado','todavía vibrando'],
  },
  ERROR: {
    glyph: '⨯', abbr: 'ERR',
    nodo: ['el error','la excepción','la falla','el fallo','la advertencia','el bug',
      'el segfault','el desbordamiento','la pérdida de paquete','el timeout','la traza',
      'el volcado','la interrupción'],
    acc: ['falla','se desborda','lanza','aborta','reintenta','colapsa','no atrapa',
      'permanece','vuelve','deja una traza','no se resuelve'],
    frag: ['ERROR 421: el modelo recibió el mundo pero no encontró dónde guardarlo',
      'el error permanece más tiempo que el resultado correcto',
      'la falla no es lo contrario del sentido: es otra de sus formas',
      'excepción no atrapada — nadie estaba escuchando'],
    unidad: ['códigos','trazas','reintentos','ms','fallos/min','volcados'],
    estado: ['no atrapado','fatal','recuperable (mentira)','en cascada','pendiente'],
  },
  TIME: {
    glyph: '◷', abbr: 'TIM',
    nodo: ['el instante','la demora','el ciclo','la época','el antes','el después',
      'el reloj','la duración','el retraso','la latencia','el compás','la vuelta',
      'la espera','el intervalo'],
    acc: ['demora','adelanta','atrasa','repite','recurre','cae fuera del tiempo',
      'no llega','se dilata','vuelve antes de irse','tarda otra era'],
    frag: ['antes aparece después y nadie corrige el índice',
      'esperar otra época geológica',
      'la latencia entre el mundo y su nombre crece cada vuelta',
      'el reloj mide todo menos el tiempo que falta'],
    unidad: ['ms','vueltas','eras','compases','años luz','turnos'],
    estado: ['en demora','recursivo','fuera de fase','dilatado','pendiente'],
  },
  PROTOCOL: {
    glyph: '§', abbr: 'PRO',
    nodo: ['el protocolo','la norma','el reglamento','el formulario','el trámite',
      'el permiso','la cláusula','el estándar','el acuse','el handshake','el sello',
      'la firma','la política'],
    acc: ['firma','tramita','valida','autoriza','deniega','exige','sella','no reconoce',
      'queda pendiente','caduca','pide otro permiso'],
    frag: ['el protocolo que nadie firmó igual nos obliga',
      'SI no hay permiso: esperar / SINO: seguir esperando',
      'la cláusula se remite a otra cláusula que no existe',
      'todo trámite es un ciclo sin condición de salida'],
    unidad: ['sellos','cláusulas','folios','firmas','formularios','permisos'],
    estado: ['pendiente','denegado','caducado','sin firmar','en revisión'],
  },
  RESIDUE: {
    glyph: '░', abbr: 'RES',
    nodo: ['el residuo','la sobra','el desecho','la ruina','la escoria','el descarte',
      'el sedimento','la mancha','el fantasma','el remanente','la basura','la resaca',
      'lo que quedó del margen'],
    acc: ['queda','sobra','se descarta','se sedimenta','persiste','mancha','contamina',
      'reaparece','no se limpia','se cuela en la siguiente vuelta'],
    frag: ['lo que no encontró conexión queda en el margen',
      'cada vuelta deja una mancha que la siguiente hereda',
      'residuo visual de un diagrama que ya nadie lee',
      'la ruina es un cálculo que siguió corriendo sin nosotros'],
    unidad: ['sobras','manchas','fantasmas','restos','%','capas'],
    estado: ['residual','heredado','sin limpiar','contaminante','persistente'],
  },
};

/* ------------------------------------------------------------------ */
/*  Pesos de categoría — el motor los modifica según el estado global  */
/* ------------------------------------------------------------------ */
const CAT_WEIGHTS = {};
CAT_NAMES.forEach(c => { CAT_WEIGHTS[c] = 1; });

/* elige n categorías distintas, muestreo ponderado sin reemplazo */
function chooseCats(n = 3) {
  const names = CAT_NAMES.slice();
  const chosen = [];
  n = Math.min(n, names.length);
  while (chosen.length < n && names.length) {
    let total = 0;
    for (const nm of names) total += Math.max(0.02, CAT_WEIGHTS[nm] || 0);
    let r = rnd() * total, idx = 0;
    for (let i = 0; i < names.length; i++) {
      r -= Math.max(0.02, CAT_WEIGHTS[names[i]] || 0);
      if (r <= 0) { idx = i; break; }
    }
    chosen.push(names.splice(idx, 1)[0]);
  }
  return chosen;
}

/* atajos de material sobre una categoría */
function C(cat)      { return CATS[cat]; }
function nodo(cat)   { return pick(C(cat).nodo); }
function acc(cat)    { return pick(C(cat).acc); }
function fragOf(cat) { return pick(C(cat).frag); }
function unidad(cat) { return pick(C(cat).unidad); }
function estado(cat) { return pick(C(cat).estado); }

/* material transversal heredado / mutado de content(2).js */
const UNITS_ODD = ['Ω','µF','Hz','mV','β','ε₀','Np','Wb','π','rad/s','K','psi','poética','dosis','octas','sin unidad'];
const FORMULAS = [
  'V = IR','τ = RC','f₀ = 1/(2π√LC)','Δφ → 0','|A·β| ≥ 1','kT/q ≈ 25.85 mV',
  'S = k·ln(W)','ΔE·Δt ≥ ℏ/2','dosis(t) = D₀ + ∫i dt','género ≈ Σ(protocolo·gain)',
  'cuerpo(t) = hardware(t) ⊛ código(t)','mundo − Σ(cosa) = residuo',
  'latencia = |mundo − modelo|','error = ∂(sentido)/∂(protocolo)',
  'σ² = 4kTRΔf','V(t) = V₀·e^(−t/τ)','duty → timbre','P(t) = P₀·e^(−λt)',
];
const GLYPHS = ['∿','⊕','∅','▲','■','×','∫','⊥','≈','→','↺','⟂','⌁','◌','§','░'];
const KAOMOJI = ['(◉_◉)','(¬_¬)','¯\\_(ツ)_/¯','(._.)','(⌐■_■)','((( ok )))','{ tbd }',
  '<silence>','[redacted]','(◞‸◟)','(￣ω￣)','⟨ trans ⟩','// proceso //','(>_<)'];

/* ------------------------------------------------------------------ */
/*  Tejedores de fragmentos — cada uno mezcla >=3 categorías           */
/*  Evitan la forma "X es Y": usan instrucciones, enumeraciones,       */
/*  relaciones espaciales, acciones e interrupciones.                  */
/* ------------------------------------------------------------------ */

/* devuelve {lines:[...], cats:[...], kind:'...'} */
function weave(cats) {
  cats = cats || chooseCats(3);
  const [a, b, c] = cats;
  const templates = [
    /* 0 · condicional imposible */
    () => ({ kind: 'condicional', lines: [
      `SI ${nodo(a)} ${acc(a)} sobre ${nodo(b)}:`,
      `    abrir ${nodo(c)} que ya no ${acc(c)}`,
      `SINO:`,
      `    esperar ${unidad(b)} ${pick(['más','de menos','sin promesa'])}`,
    ] }),
    /* 1 · pseudocódigo que se resta el mundo */
    () => ({ kind: 'bucle', lines: [
      `for cada ${nodo(a)} in ${nodo(b)}:`,
      `    ${nodo(a).replace(/^(el|la|los|las) /,'')}.nombre = aproximación`,
      `    ${nodo(b)} -= ${nodo(c)}`,
    ] }),
    /* 2 · nodo indeciso */
    () => ({ kind: 'nodo', lines: [
      `nodo_${padZero(rint(0,99))}:`,
      `    ${nodo(a)} que todavía no decidió`,
      `    si es ${short(nodo(b))} / ${short(nodo(c))} / residuo`,
    ] }),
    /* 3 · error como poema */
    () => ({ kind: 'error', lines: [
      `ERROR ${rint(400,599)}`,
      `    ${fragOf(a)}`,
      `    ${nodo(b)} no encontró dónde guardar ${nodo(c)}`,
    ] }),
    /* 4 · observación (la nube no sabe) */
    () => ({ kind: 'observacion', lines: [
      `${cap(nodo(a))} no sabe`,
      `    que debajo ${nodo(b)}`,
      `    ${acc(c)} lo que no tiene nombre`,
    ] }),
    /* 5 · enumeración desbordada */
    () => ({ kind: 'lista', lines: [
      `${cap(nodo(a))},`,
      `${nodo(b)},`,
      `${nodo(c)} —`,
      `y todo lo demás ${pick(['sin catalogar','fuera de índice','en el margen'])}`,
    ] }),
    /* 6 · relación espacial */
    () => ({ kind: 'espacial', lines: [
      `${cap(nodo(a))}`,
      `  ${pick(['sobre','debajo de','al lado de','dentro de','contra'])} ${nodo(b)}`,
      `    ${pick(['y más abajo','al fondo','en el borde'])}, ${nodo(c)} ${acc(c)}`,
    ] }),
    /* 7 · instrucción incompleta */
    () => ({ kind: 'instruccion', lines: [
      `${cap(acc(a))} ${nodo(b)} hasta que`,
      `${nodo(c)} ${pick(['cambie de sentido','deje de responder','se parezca a otra cosa'])}`,
      `${pick(['// falta un paso','// no se especifica cuál','// resultado indefinido'])}`,
    ] }),
    /* 8 · medida sin unidad adecuada */
    () => ({ kind: 'medida', lines: [
      `medir ${nodo(a)} en ${pick(UNITS_ODD)}:`,
      `    resultado = ${val()} ${unidad(b)}`,
      `    ${pick(['unidad no corresponde','fuera de rango','la medición cambia el ' + short(nodo(c))])}`,
    ] }),
    /* 9 · causa después de la consecuencia */
    () => ({ kind: 'causa', lines: [
      `primero ${nodo(a)} ${acc(a)}`,
      `después, su causa: ${nodo(b)}`,
      `(el efecto llegó ${unidad(c) ? rint(1,999) + ' ' + unidad(c) : ''} antes)`.replace('  ',' '),
    ] }),
    /* 10 · glosa que contradice */
    () => ({ kind: 'glosa', lines: [
      `${fragOf(a)}`,
      `  — pero ${nodo(b)} ${acc(b)} lo contrario`,
      `  ${pick(GLYPHS)} ${fragOf(c)}`,
    ] }),
    /* 11 · protocolo circular */
    () => ({ kind: 'protocolo', lines: [
      `[${C(a).abbr}] ${cap(nodo(a))} ${acc(a)}`,
      `[${C(b).abbr}] remite a ${nodo(b)}`,
      `[${C(c).abbr}] que remite a ${short(nodo(a))} — ${estado(c)}`,
    ] }),
  ];
  const out = pick(templates)();
  out.cats = cats;
  return out;
}

/* fragmentos de una sola línea, densos, para floaters y márgenes */
function microLine(cats) {
  cats = cats || chooseCats(3);
  const [a, b, c] = cats;
  const forms = [
    () => `${short(nodo(a))} → ${short(nodo(b))} → ${short(nodo(c))}`,
    () => `${nodo(a)} ${acc(b)} ${nodo(c)}`,
    () => `[${C(a).abbr}·${C(b).abbr}·${C(c).abbr}] ${estado(a)}`,
    () => `${fragOf(a)}`,
    () => `${cap(nodo(a))} ${pick(GLYPHS)} ${nodo(b)} ${pick(GLYPHS)} ${nodo(c)}`,
    () => `${pick(FORMULAS)}  ::  ${estado(c)}`,
  ];
  return { text: pick(forms)(), cats };
}

/* etiquetas cortas de nodo (para diagramas) */
function nodeLabel(cat) {
  const raw = nodo(cat);
  if (chance(0.35)) return short(raw);
  return raw;
}

/* una "clase" para diagramas de clase — objetos como Nube, Deuda, etc. */
const CLASS_OBJECTS = ['Nube','Deuda','Animal','Archivo','Frontera','Ruina','Cuerpo',
  'Turno','Sector','Paquete','Residuo','Instante','Polvo','Protocolo','Ciudad'];
function classSpec() {
  const name = pick(CLASS_OBJECTS);
  const cats = chooseCats(3);
  const attrs = pickN([
    `peso: ${val()} ${pick(UNITS_ODD)}`,
    `estado: ${estado(cats[0])}`,
    `origen: ${short(nodo(cats[1]))}`,
    `${short(nodo(cats[2]))}: ${val()}`,
    `latencia: ${rint(1,999)} ms`,
    `sin_representar: ${rint(5,95)}%`,
    `dueño: null`,
  ], rint(2, 4));
  const methods = pickN([
    `${acc(cats[0]).replace(/ .*/,'')}()`,
    `medir(${short(nodo(cats[1]))})`,
    `heredar(residuo)`,
    `perder()`,
    `no_compilar()`,
    `${acc(cats[2]).replace(/ .*/,'')}(mundo)`,
  ], rint(1, 3));
  return { name, attrs, methods, cats };
}

/* valor "irreal pero posible" — heredado de content(2).js, sobre RNG */
function val() {
  const s = [
    () => `${rint(1,999)}`,
    () => `${rflt(0.1,9.9,1)}`,
    () => `∞`,
    () => `π·${rint(1,99)}`,
    () => `?`,
    () => `${rint(2,99)}·dt`,
    () => `aprendido`,
    () => `${rint(1,99)}β`,
    () => `~${rint(1,9)}k`,
    () => `${rint(1,9)}.${rint(0,9)}·10^${rint(-9,6)}`,
    () => `NaN`,
  ];
  return pick(s)();
}

/* utilitarios de texto */
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function short(s) {
  return String(s).replace(/^(el|la|los|las|un|una) /i, '').split(' ')[0];
}
function padZero(n) { return String(n).padStart(2, '0'); }

/* títulos / rúbricas para páginas */
function pageTitle(op, cats) {
  const opNames = {
    clasificar:  'CLASIFICAR LO INCLASIFICABLE',
    conectar:    'CONECTAR ESCALAS QUE NO COINCIDEN',
    medir:       'MEDIR SIN UNIDAD ADECUADA',
    causa:       'LA CAUSA DESPUÉS DEL EFECTO',
    mapa:        'MAPA SIN TERRITORIO',
    ejecutar:    'INSTRUCCIÓN QUE SE MODIFICA',
    repetir:     'REPETIR HASTA CAMBIAR DE SENTIDO',
    error:       'EL ERROR COMO CONOCIMIENTO',
    marginal:    'LA NOTA AL MARGEN COMO SISTEMA',
    desobedecer: 'EL DIAGRAMA DESOBEDECE SU LEYENDA',
  };
  const base = opNames[op] || 'TENTATIVA DE DIAGRAMAR EL MUNDO';
  return base + '  ·  ' + cats.map(x => C(x).abbr).join(' + ');
}

/* pequeño banco de rúbricas / sellos administrativos */
function stamp() {
  return pick([
    'DOC. INTERNO — NO DISTRIBUIR',
    'BORRADOR / SIN FIRMAR',
    'COPIA ' + rint(2,99) + ' DE ∞',
    'REV. ' + rint(0,9) + '.' + rint(0,99),
    'MEDICIÓN PARCIAL',
    'SISTEMA PLANETARIO AVERIADO',
    'PENDIENTE DE COMPILACIÓN',
    'ARCHIVO ' + padZero(rint(0,99)) + ' — CORRUPTO',
  ]);
}

/* exponer para depuración / motor (scripts clásicos comparten alcance) */
const CONTENT = {
  RNG, CATS, CAT_NAMES, CAT_WEIGHTS, chooseCats,
  weave, microLine, nodeLabel, classSpec, pageTitle, stamp,
  pick, rint, rflt, chance, shuffle, pickN, val, short, cap, padEnd, padZero,
  FORMULAS, GLYPHS, KAOMOJI, UNITS_ODD, CLASS_OBJECTS,
  nodo, acc, fragOf, unidad, estado, C,
};
if (typeof window !== 'undefined') window.CONTENT = CONTENT;
