/*
  corpus.js — banco material
  poesiasexp / laberinto

  el repositorio como banco material, no como resumen. el lenguaje entra como
  tabla, ventana, ruta, color, celda, iframe, atributo, error, hipervinculo.
  no forma una voz narrativa unificada: se permiten choques y yuxtaposiciones.

  material: los poemas de canek (la sonda, el robot, el helecho, los pixeles,
  la luna, el ruido, la entropia, la no-comunicacion), el lexico de glifos de
  PAISAJES, y los ecos de la biblioteca (Heraclito y el rio, el archivo,
  Burroughs y el virus de la palabra, Calvino y las ciudades, las luciernagas,
  la teoria del color, ceros y unos).

  isomorfo: node + navegador.
*/
(function () {
  'use strict';

  var CORPUS = {

    // una sola palabra que puede ocupar toda la pantalla
    monumentales: [
      'RÍO', 'RUIDO', 'ENTROPÍA', 'SONDA', 'ARCHIVO', 'HELECHO', 'SILENCIO',
      'LUNA', 'PÍXEL', 'SEÑAL', 'VACÍO', 'AGUJA', 'IMÁN', 'ONDA', 'LUZ',
      'SOMBRA', 'CENIZA', 'TORMENTA', 'PLANETA', 'ORÁCULO', 'HERÁCLITO',
      'VIRUS', 'MAPA', 'AFUERA', 'ADENTRO', 'GRIETA', 'RELIQUIA', 'CORRIENTE',
      'ROBOT', 'RADIO', 'ARENA', 'INFINITO', 'NADIE', 'AQUÍ', 'TODAVÍA',
      'ESCAPE', 'RESTO', 'ECO', 'ESPEJO', 'FUGA', 'DERIVA', 'HORMIGA'
    ],

    // texto de hipervinculos: fragmentos que prometen (o no) un destino
    enlaces: [
      'seguir la señal', 'bajar al río', 'abrir la sonda', 'no volver',
      'lo que fuimos', 'otra semilla', 'la misma corriente', 'hacia afuera',
      'el helecho', 'una transmisión', 'escarba entre grietas', 'incorporar el ruido',
      'la no-comunicación', 'quince mil millones de kilómetros', 'entre los vientos solares',
      'un charco con aceite', 'los píxeles no tienen sombra', 'el tono de voz magnético',
      'no cargo tales esperanzas', 'basura en el espacio', 'reliquia de la civilización',
      'volver con consecuencias', 'clic aquí no lleva a ningún lado', 'el archivo no recuerda',
      'nadie en la otra orilla', 'el mismo río dos veces', 'seguir el hilo', 'perder el hilo',
      'la cueva', 'la tormenta de arena', 'una aguja que escarba', 'ruido y entropía',
      'esto ya cambió', 'atrás', 'más adentro', 'una ventana que abre otra',
      'la superficie grabada', 'ondas acústicas', 'entre el vacío', 'casi infinita'
    ],

    // frases breves (3 a 10 palabras) — versos partidos
    fragmentos: [
      'perdimos contacto con el último robot',
      'para buscar vida en otro planeta',
      'bajo la tormenta de arena',
      'su última transmisión de radio',
      'le instalamos una voz rudimentaria',
      'porque sentimos que era muy raro',
      'algo con que emitir vibraciones sonoras',
      'entre el vacío de casi infinita incomunicación',
      'infinitos granos de ruido hormiguean mi piel',
      'la resolución del problema de la no-comunicación',
      'incorporándola al sistema',
      'los píxeles no tienen sombra',
      'millones de pequeños emisores que la irradian',
      'no pueden imitar el baile de los colores',
      'en el tornasol de un charco con aceite',
      'una sonda que lleva décadas escapando',
      'sorprende que su información aún llegue',
      'la zona donde colisionan los vientos solares',
      'una aguja que escarba entre grietas',
      'como reliquia de la civilización',
      'lo único que sobreviva de la humanidad',
      'la mucha belleza me hace siempre perverso',
      'una triste roca de agua congelada',
      'dejará como basura nuestra última esperanza',
      'no puedes bajar dos veces al mismo río',
      'todo fluye y nada permanece',
      'el archivo no recuerda de dónde vino',
      'la palabra es un virus del espacio exterior',
      'las ciudades invisibles se sostienen en un hilo',
      'las luciérnagas todavía parpadean en el margen'
    ],

    // notas diminutas
    microtextos: [
      'aquí no', 'ya no está', 'vuelve', 'espera', 'esto se mueve', 'ruido',
      'sigue', 'no', 'quizá', 'otra vez', 'casi', 'todavía', 'nadie', 'fin',
      'abre', 'cierra', 'arrastra', 'escarba', '·', '—', '…', '///', 'eco',
      'resto', 'sí', 'afuera', 'adentro', 'onda', 'grano', 'silencio'
    ],

    // titulos y contenidos de ventana
    ventanas: [
      'sonda', 'transmisión', 'el helecho murió', 'ruido y entropía',
      'no-comunicación', 'reliquia', 'río', 'archivo corrupto', 'señal débil',
      'quince mil millones de km', 'vientos solares', 'aguja / grieta',
      'sin sombra', 'tornasol', 'la última esperanza', 'oráculo', 'ceniza',
      'esta ventana olvidó quién la abrió', 'esta ventana abre otra'
    ],

    // contenido de celda (palabra o signo suelto)
    tablas: [
      'río', 'ruido', 'sonda', 'nadie', 'onda', 'imán', 'aguja', 'grieta',
      'luz', 'sombra', 'eco', 'resto', 'ceniza', 'señal', 'vacío', 'arena',
      '0', '1', '·', '—', '/', '\\', '×', '∴', '≈', '∿', '□', '■', '△'
    ],

    // valores para atributos data-* que despues pueden volverse poema
    atributos: [
      'lo-que-fuimos', 'casi-infinita', 'no-comunicacion', 'entre-grietas',
      'sin-sombra', 'tono-magnetico', 'granos-de-ruido', 'ultima-transmision',
      'reliquia', 'basura-interestelar', 'mismo-rio', 'el-archivo-no-recuerda',
      'virus-de-la-palabra', 'ciudad-invisible', 'luciernaga-en-el-margen'
    ],

    // segmentos de ruta / hash (barra de direcciones como parte de la pieza)
    rutas: [
      'rio', 'sonda', 'archivo', 'afuera', 'grieta', 'ceniza', 'helecho',
      'senal', 'onda', 'vacio', 'espejo', 'eco', 'resto', 'ruido', 'imán',
      'corriente', 'reliquia', 'arena', 'tornasol', 'no-comunicacion', 'deriva'
    ],

    // titulos de pestaña
    titulosDePestana: [
      'río', '·', 'sin título', '404', 'sonda', 'ruido', 'afuera',
      'el archivo no recuerda', '…', 'transmisión', 'quince mil millones',
      '▓▓▓', 'nadie', 'todavía', 'grieta', 'eco / eco / eco', 'ceniza',
      'no cierres esto', 'ya cambió', 'documento incompleto'
    ],

    // paginas de error: no un 404 generico, sino rutas dentro del daño
    errores: [
      'documento incompleto', 'el manifiesto está corrupto', 'falta la fuente',
      'la tabla se rompió', 'este archivo no se terminó de cargar',
      'CSS ausente (a propósito)', 'imagen inexistente', 'el enlace no tiene texto',
      'caracteres sin fuente', 'la señal se perdió a quince mil millones de km',
      'el archivo no recuerda de dónde vino', 'aquí había un río', 'reparación no disponible'
    ],

    // alt text que contiene rutas / poema (imagenes que no existen)
    altText: [
      'una sonda que escapa del sistema solar; sigue el borde para llegar al río',
      'un helecho en una cueva; su silencio se confunde con el tono magnético',
      'un charco con aceite: los colores que el píxel no puede imitar',
      'la tormenta de arena sobre el último robot; abajo hay una grieta',
      'un mapa que no corresponde a ninguna de estas páginas',
      'ruido y entropía hormigueando sobre la piel del documento',
      'la superficie grabada de la reliquia; una aguja escarba entre grietas'
    ],

    // comentarios HTML — otro estrato del texto, visible en la fuente
    comentariosHTML: [
      'aquí había un río', 'esto no se terminó de escribir', 'la voz era rudimentaria',
      'no cargo tales esperanzas', 'incorporar el ruido al sistema',
      'el mismo río nunca dos veces', 'lo único que sobreviva de nosotros',
      'una transmisión que aún llega', 'entre el vacío de casi infinita incomunicación',
      'el archivo no recuerda de dónde vino', 'nadie leyó esta parte del código',
      'la palabra es un virus', 'debajo de la interfaz no hay obra: la interfaz es la obra'
    ],

    // instrucciones minimas, poeticas
    instrucciones: [
      'no cierres esto', 'arrastra hasta el margen', 'espera a que cambie',
      'vuelve pero no será igual', 'marca la casilla para abrir una región',
      'desmarca para destruir una familia de enlaces', 'recorre el margen derecho',
      'baja hasta que se acabe el color', 'escribe algo y el corpus lo recuerda',
      'pulsa Esc para detener la proliferación', 'sube el ruido con la barra'
    ],

    // palabras de color (el color como estado semantico y como imagen)
    colores: [
      'tornasol', 'aceite', 'ceniza', 'óxido', 'sepia', 'fósforo', 'ámbar',
      'cobalto', 'magenta', 'cian', 'índigo', 'bermellón', 'humo', 'nácar', 'sombra'
    ],

    // coordenadas textuales (poema convertido en coordenada)
    coordenadas: [
      '15 000 000 000 km', '0,0', '∞,∞', '—1', 'x: nadie  y: todavía',
      'lat. ruido  long. señal', 'gen. 30', 'gen. 110', 'fila 0', 'columna vacía',
      '13000', '14400', '10080', '2580..259F', '1FB00'
    ],

    // ------- glifos: el lexico de PAISAJES, por funcion visual -------
    glifos: {
      montes:     ['▲', '△', '◭', '◮', '◤', '◥', '◢', '◣', '⊿', '∆', '🭯', '🭭'],
      laderas:    ['◢', '◣', '🭁', '🭂', '🭃', '🭄', '🬼', '🬽', '🬾', '🬿', '🭗', '🭒'],
      macizo:     ['█', '▓', '▇', '▆', '▒', '░', '▉', '▊', '▋', '▌', '▍', '▎', '▏'],
      sextantes:  ['🬀', '🬁', '🬂', '🬃', '🬄', '🬅', '🬆', '🬇', '🬈', '🬉', '🬊', '🬋', '🬌', '🬍', '🬎', '🬏', '🬐', '🬑', '🬒', '🬓', '🬔', '🬕', '🬖', '🬗'],
      ondas:      ['∿', '≈', '≋', '﹏', '〰', '⌇', '≀', '~', '⋍', '⩪'],
      agua:       ['𓈖', '𓈗', '𓈘', '𓈙', '𓈜', '𓈇'],
      aves:       ['𓄿', '𓅃', '𓅐', '𓅓', '𓅜', '𓅝', '𓅣', '𓅬', '𓅭', '𓅮'],
      animales:   ['𓃒', '𓃗', '𓃘', '𓃙', '𓃠', '𓃡', '𓃥', '𓃬', '𓆈', '𓆊', '𓆙', '𓆣'],
      humanos:    ['𓀀', '𓀁', '𓀂', '𓀃', '𓀄', '𓀆', '𓀋', '𓀎', '𓁐', '𓁑', '𓁚'],
      plantas:    ['𓆭', '𓆰', '𓆱', '𓆳', '𓆸', '𓆼', '𓇅', '𓇇', '𓇋'],
      cielo:      ['𓇯', '𓇳', '𓇷', '𓇼', '☀', '🌙', '✦', '✧', '⭐', '✩', '·'],
      anatolio:   ['𔐀', '𔐁', '𔐂', '𔐃', '𔑯', '𔒚', '𔓬', '𔓙', '𔓜', '𔓳', '𔖢', '𔗐'],
      lineara:    ['𐘀', '𐘁', '𐘂', '𐘃', '𐘄', '𐘅', '𐘆', '𐘇', '𐘈', '𐘉', '𐙀', '𐙁', '𐙂', '𐙃'],
      linearb:    ['𐀀', '𐀁', '𐀂', '𐀃', '𐀄', '𐀅', '𐂀', '𐂁', '𐃞', '𐃟', '𐃠'],
      abstractos: ['𓏤', '𓏥', '𓏦', '𓏧', '𓐀', '𓐁', '𓐂', '𓐃'],
      operadores: ['∴', '∵', '∷', '≡', '≢', '⊕', '⊗', '⊙', '⊘', '⌘', '⌦', '⎌', '⌇', '¬', '∅', '∈', '∉', '⊂', '⊃'],
      cajas:      ['┌', '┐', '└', '┘', '├', '┤', '┬', '┴', '┼', '─', '│', '╱', '╲', '╳', '║', '═', '╬', '▚', '▞'],
      flechas:    ['→', '←', '↑', '↓', '↔', '↕', '⇄', '⇅', '↻', '↺', '⤳', '⇢', '⇠', '↯', '⟲', '⟳'],
      binario:    ['0', '1']
    }
  };

  // ayudas de acceso (mismas en node y navegador)
  CORPUS.todosLosGlifos = function () {
    var out = [], k;
    for (k in CORPUS.glifos) out = out.concat(CORPUS.glifos[k]);
    return out;
  };
  CORPUS.setGlifos = function (nombre) { return CORPUS.glifos[nombre] || CORPUS.glifos.operadores; };

  if (typeof module !== 'undefined' && module.exports) module.exports = CORPUS;
  if (typeof window !== 'undefined') { window.CORPUS = CORPUS; }
})();
