'use strict';

// =====================================================================
//  EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
//  content.js  ::  el corpus reducido a operaciones formales
//
//  Nada de esto cita: cada familia toma de un texto del poemario
//  una sola operación (una manera de deformar el material) y la
//  convierte en vocabulario. No hay nombres, no hay epígrafes.
//  El lector no debería reconocer la fuente, sólo el gesto.
// =====================================================================

const ARCHIVE_CONTENT = (function () {

  // -------------------------------------------------------------------
  //  OPERACIONES  ::  ocho maneras de tratar el material
  //  cada una hereda de un texto una forma de hacer, no un contenido
  // -------------------------------------------------------------------
  const OPERATIONS = {

    // sonda / transmisión / distancia / máquina de compañía
    sonda: {
      glyph: '⇢',
      words: [
        'sonda','transmisión','distancia','ruido','entropía','señal',
        'incomunicación','silencio','helecho','arena','radio','vibración',
        'vacío','grano','eco','bocina','magnético','tormenta','cueva',
        'píxel','monitor','luna','emisor','portadora','estática','envío',
        'compañía','lejos','oscuridad','atmósfera','pulso','sin respuesta',
      ],
      instructions: [
        'emitir aunque nadie reciba',
        'instalar una voz al aparato que se aleja',
        'medir la distancia por el retardo del eco',
        'confundir el silencio con la última transmisión',
        'llenar el vacío de ruido para no estar solo',
      ],
    },

    // cronología imposible / traducción llegada desde el futuro
    cronologia: {
      glyph: '↺',
      words: [
        'exopasado','gusano de tiempo','edición','pulsar','obsolescencia',
        'singularidad','medusa','abeja mecánica','xenolalia','apofenia',
        'cerezo','té amargo','sucesor','porvenir','ruina','después',
        'siglo equivocado','antes de nacer','ya ocurrido','todavía no',
      ],
      instructions: [
        'fechar esta lectura en un año que no ha llegado',
        'traducir el poema desde un idioma posterior',
        'leer el presente como si fuera un hallazgo antiguo',
        'anunciar la primera edición para después de la última',
      ],
      // años imposibles: la cronología no avanza, se contradice
      years: ['8888 a.C.','6666 a.C.','4444 a.C.','2222 a.C.','∞ d.C.','−0 a.C.','año 0.5'],
    },

    // procedimiento / la novela que altera su propia lectura
    procedimiento: {
      glyph: '¶',
      words: [
        'prólogo','continuación','comienzo','personaje','lector salteado',
        'promesa','nota al margen','la obra que se prepara','borrador',
        'capítulo perdido','índice','erratum','la eterna','museo',
        'lo que faltará','antesala','la última primera página',
      ],
      instructions: [
        'escribir el prólogo del prólogo que sigue',
        'convertir al lector en personaje de esta página',
        'prometer una obra que este acto vuelve imposible',
        'comenzar de nuevo antes de haber empezado',
      ],
    },

    // adentro / afuera como operación, no como tema
    caja: {
      glyph: '▢',
      words: [
        'caja','dentro','fuera','frontera','tapa','borde','contenido',
        'metadato','límite','pliegue','umbral','margen','envoltura',
        'lo que pertenece','lo que sobra','la línea que decide',
      ],
      instructions: [
        'mover la frontera hasta que el afuera quede adentro',
        'declarar metadato lo que era poema',
        'guardar el poema en la caja de su propio índice',
        'arrastrar el borde y cambiar quién pertenece',
      ],
    },

    // arqueología futura / contramemoria / archivo incompleto
    arqueologia: {
      glyph: '⌖',
      words: [
        'archivo','ruina','excavación','estrato','datación','hallazgo',
        'contramemoria','fragmento','atribución errónea','documento',
        'falsificación','capa','sedimento','fósil','resto','vestigio',
        'lo enterrado','lo mal recordado','la sesión encontrada',
      ],
      instructions: [
        'atribuir esta lectura a un lector que no existió',
        'excavar la capa donde el error quedó escrito',
        'catalogar el presente como ruina de otro siglo',
        'recordar mal, y guardar el recuerdo como prueba',
      ],
    },

    // enlaces que cambian el documento en lugar de conducir fuera
    enlace: {
      glyph: '⋈',
      words: [
        'enlace','vínculo','transclusión','versión','referencia','salto',
        'cita viva','ventana','red','documento','cambio','conexión',
        'lo conectado','lo que hereda','la tercera cosa','contagio',
      ],
      instructions: [
        'unir dos fragmentos y producir un tercero',
        'hacer que el vínculo altere lo que une',
        'incrustar un poema dentro de otro sin copiarlo',
        'seguir el enlace y encontrar el mismo texto cambiado',
      ],
    },

    // repetición / duración / presente continuo
    duracion: {
      glyph: '≋',
      words: [
        'repetición','insistencia','presente','duración','otra vez',
        'seguir','permanecer','lo mismo','continuar','estar siendo',
        'y y y','lo que dura','la palabra repetida','presión',
      ],
      instructions: [
        'repetir hasta que la palabra pierda una letra',
        'sostener el presente hasta que se deforme',
        'decir lo mismo hasta que deje de ser lo mismo',
        'permanecer sobre una sílaba y verla cambiar',
      ],
    },

    // celda / retiro / atención / desierto / ritual temporal
    celda: {
      glyph: '◻',
      words: [
        'celda','retiro','atención','desierto','vigilia','hora',
        'ayuno','quietud','permanecer','no salir','silencio de arena',
        'la regla','el horario','la cuenta de las horas','soledad',
        'lo que se escribe al no tocar','disciplina','espera',
      ],
      instructions: [
        'no tocar: la quietud también escribe',
        'contar las horas hasta que las horas cuenten',
        'permanecer en la celda mientras el texto crece afuera',
        'ayunar de acción y observar lo que se acumula',
      ],
    },
  };

  // -------------------------------------------------------------------
  //  SINTAXIS  ::  cómo se enhebran las palabras en un fragmento
  // -------------------------------------------------------------------
  const SYNTAX = {
    openings: [
      '{a} que no {v}',
      'donde {a} se vuelve {b}',
      'aquí {a}, todavía {b}',
      'el {a} de {b}',
      '{a} — sin {b} —',
      'lo que queda de {a}',
      '{a}, después',
      'antes de {a}, ya {b}',
    ],
    hinges: [
      'y sin embargo','así','entonces','o quizá','pero','mientras','hasta que','porque',
    ],
    endings: [
      'no llega',
      'se repite',
      'ya fue leído',
      'nadie lo firma',
      'vuelve como signo',
      'no recuerda',
      'se entierra solo',
      'queda afuera',
    ],
    verbs: [
      'compila','recuerda','termina','responde','coincide','cierra','llega','vuelve','permanece','se firma',
    ],
    // instrucciones que aparecen dentro del poema y se corrompen
    hud: [
      'MUEVE EL CURSOR PARA EXCAVAR',
      'DETENTE PARA ACUMULAR',
      'UNE DOS FRAGMENTOS',
      'ARRASTRA LA FRONTERA',
      'NO HAGAS NADA',
      'ESTE ARCHIVO YA TE LEYÓ',
      'LA LECTURA MODIFICA EL LIBRO',
    ],
  };

  // -------------------------------------------------------------------
  //  RELACIONES  ::  lo que un enlace le hace a lo que enlaza
  // -------------------------------------------------------------------
  const RELATIONS = {
    demora:        { glyph: '⌇', verb: 'demora',        does: 'retrasa' },
    contagio:      { glyph: '≈', verb: 'contagia',      does: 'intercambia' },
    contradiccion: { glyph: '≠', verb: 'contradice',    does: 'niega' },
    perdida:       { glyph: '∅', verb: 'pierde',        does: 'borra' },
    herencia:      { glyph: '⊂', verb: 'hereda',        does: 'copia' },
    eco:           { glyph: '))', verb: 'ecoa',         does: 'repite' },
  };

  // -------------------------------------------------------------------
  //  ESTRATOS  ::  seis capas; la geometría es la operación lingüística
  //  bajar (scroll) es excavar: cada capa trata el texto de otra manera
  // -------------------------------------------------------------------
  const STRATA = [
    { key: 'frase',       label: 'frase',                  op: 'plain'    },
    { key: 'instruccion', label: 'instrucción',            op: 'imperative' },
    { key: 'esqueleto',   label: 'esqueleto consonántico', op: 'skeleton' },
    { key: 'ocr',         label: 'error OCR',              op: 'ocr'      },
    { key: 'glifo',       label: 'glifo',                  op: 'glyph'    },
    { key: 'residuo',     label: 'residuo',                op: 'dust'     },
  ];

  // sustituciones de OCR: el escáner del futuro se equivoca
  const OCR_MAP = {
    a:'ä', e:'€', i:'¡', o:'ø', u:'ü', n:'ñ', s:'§', c:'ç', t:'†', l:'|', r:'ř', d:'ð', m:'rn', g:'9', b:'6',
  };

  // glifos residuales: lo que queda cuando el sentido se va
  const GLYPHS = ['·','∴','⁘','⌁','◜','◞','†','∎','⌗','▚','░','▓','∷','·¬','◍'];

  // el único color diagnóstico se nombra pocas veces
  const DIAGNOSTIC = ['↯','⚑','▲','●','◆'];

  // -------------------------------------------------------------------
  //  GLIFOS UNIVERSALES  ::  la materia visual (sin dependencias de fuente)
  //  bloques, braille, geométricos, flechas, emoji: paisaje de caracteres
  // -------------------------------------------------------------------
  const GLYPHSETS = {
    bloque:    '█▓▒░▄▀▌▐▚▞▙▟▛▜◧◨◩◪▩'.split(''),
    braille:   '⠿⣿⡿⢿⣟⣯⣷⠶⠛⠫⢕⡪⠡⢁⣄⡇⠇⢰⣠⢄⡠⠤⠒⠊'.split(''),
    geo:       '◢◣◤◥▲▼◆◇●○◐◑◒◓■□▮▯⬢⬡⬠'.split(''),
    onda:      '∿⌇≈≋〜︾﹏⁓~⩄⩅≀'.split(''),
    flecha:    '↯⇢⇠⇡⇣↺↻⟲⟳➤➟⤳⇝⇜'.split(''),
    punto:     '·∴∵⁘⁙⁚⋮⋯⋰⋱∷⸪⸬'.split(''),
    // emoji de clima y archivo: universales, a color
    clima:     '🌡️🌤️⛅🌥️☁️🌦️🌧️⛈️🌩️🌨️❄️🌪️🌫️🌊💨🔥⚡🌈🌡️'.split(/(?=[\u{1F300}-\u{1FAFF}☀-➿])/u).filter(Boolean),
    archivo:   '📼💾📀🗂️🗄️📑🧾📎🖇️🔖🏷️📌📊📈📉🗺️🧭⏳⌛🕳️'.split(/(?=[\u{1F300}-\u{1FAFF}☀-➿])/u).filter(Boolean),
    bicho:     '🐛🦠🪲🐟🐠🕊️🦇🌱🍄🪸'.split(/(?=[\u{1F300}-\u{1FAFF}☀-➿])/u).filter(Boolean),
  };

  // -------------------------------------------------------------------
  //  CLIMA  ::  la máquina confunde lectura con clima
  //  la sesión se reporta como pronóstico meteorológico
  // -------------------------------------------------------------------
  const CLIMA = {
    fenomenos: ['lluvia de índices','niebla de sentido','frente de olvido','viento de datos',
      'granizo tipográfico','tormenta de citas','bruma de atención','sequía de lectura',
      'nevada de residuos','marea de enlaces','presión de archivo','humedad de memoria'],
    bulletins: [
      'PRONÓSTICO: lectura dispersa con {p}% de probabilidad de olvido',
      'ALERTA: {f} avanzando sobre el margen superior',
      'ÍNDICE DE ILEGIBILIDAD: {p} — se recomienda no comprender',
      'TEMPERATURA DE ATENCIÓN: {t}°  ·  sensación térmica: {s}°',
      'AVISO: el archivo confunde tu cursor con un {f}',
      'CLIMA DE HOY: {f}. mañana: lo mismo pero mal recordado',
      'HUMEDAD DEL SENTIDO: {p}%  ·  punto de rocío en la palabra {w}',
      'VIENTOS DE {t} km/h desde el futuro anterior',
    ],
  };

  // -------------------------------------------------------------------
  //  HUMOR  ::  chistes, memes, ruido cómico del sistema
  //  el archivo es solemne y también un desastre; ambas cosas
  // -------------------------------------------------------------------
  const MEMES = {
    // errores del sistema como microhumor
    errores: [
      'ERROR 404: lector no encontrado (pero seguimos archivándote)',
      'la lectura dejó de responder ¿esperar o forzar el cierre del poema?',
      'este fragmento fue leído por 0 personas y sin embargo se siente observado',
      'segmentation fault (núcleo del sentido volcado)',
      'TODO: recordar por qué escribí esto',
      'undefined is not a poem',
      'quería decir algo pero se cayó el servidor de la memoria',
      '¿seguro que querías entender? [sí] [no] [más tarde nunca]',
      'la palabra que buscabas está en otro estrato',
      'buffer de nostalgia al 97%  ·  derramando',
    ],
    // pseudocitas y atribuciones falsas (arqueología futura, en broma)
    citas: [
      '"todo archivo miente, pero este miente con método" — anónimo del año 8888',
      '"leer es un clima, no una decisión" — glifo hallado y perdido',
      '"el lector es un rumor que el libro no confirma"',
      '"esto ya lo había leído antes de escribirlo"',
      '"la nube no recuerda haber llovido"',
    ],
    // reacciones tipo meme, cortas
    reacciones: ['no era una nube era spam','esto es fino señor','literalmente yo','ok pero ¿y el clima?',
      'guardar para nunca','//sin comentarios','esto envejeció raro','real','se fue en llamas','☁️→💾→🕳️'],
  };

  // etiquetas para diagramas y gráficas generativas
  const DIAGRAMS = {
    charts: ['CALOR POR CAMPO','ROSA DE ACCIONES','INTEGRIDAD/VUELTA','PRESIÓN DE MEMORIA','ESTRATIGRAMA'],
    axes: ['atención','daño','edad','enlaces','olvido','presión','sentido'],
  };

  return { OPERATIONS, SYNTAX, RELATIONS, STRATA, OCR_MAP, GLYPHS, DIAGNOSTIC,
           GLYPHSETS, CLIMA, MEMES, DIAGRAMS };
})();

if (typeof window !== 'undefined') window.ARCHIVE_CONTENT = ARCHIVE_CONTENT;
if (typeof module !== 'undefined') module.exports = ARCHIVE_CONTENT;
