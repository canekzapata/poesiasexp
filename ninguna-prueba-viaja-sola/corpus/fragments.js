'use strict';
/* =====================================================================
   NINGUNA PRUEBA VIAJA SOLA — corpus/fragments.js
   materia verbal. escrita para esta obra, en conversación con poesiasexp:
   la sonda, el río, el archivo, la caja, el original imposible, el ruido,
   la memoria defectuosa, la traducción, el helecho, la copia, el error
   útil, y algo que todavía llega.
   ===================================================================== */
window.NPVS = window.NPVS || {};
(function (N) {

  /* la frase del umbral. se guarda como bits: cada vacío cruzado
     apaga uno. no es una metáfora: es la misma cadena. */
  const MENSAJE = 'para recuperar el mensaje demuestre que estuvo aquí';

  const TELEMETRIA = [
    'RECIBIDO: {t}',
    'CONTENIDO: NO DETERMINADO',
    'ORIGEN: DEMASIADO CERCA',
    'INTEGRIDAD: {int}%',
    'PORTADORA: presente, sin acuerdo',
    'FASE: distribuida entre {n} cuerpos',
    'RETARDO: menor que el gesto que lo mide',
    'EMISOR: no distinguible del receptor',
    'CANAL: ocupado por su propia descripción'
  ];

  /* TESTIGO no explica: dictamina. */
  const TESTIGO = [
    'PARA RECUPERAR EL MENSAJE HAY QUE DEMOSTRAR QUE ESTUVO AQUÍ.',
    'Una señal sin prueba es indistinguible del ruido educado.',
    'Se admite como prueba: la huella, la demora, el error repetido.',
    'No se admite como prueba: la intención, el recuerdo, la palabra dada.',
    'El visitante será tratado como una hipótesis con velocidad.',
    'Toda compresión expulsa. Lo expulsado también es documento.',
    'Dos historias incompatibles pueden producir la misma superficie. La superficie no está mintiendo.',
    'El aparato no busca el original. Busca lo que cabe.',
    'Si la demostración se completa, la distancia al original habrá aumentado.',
    'Nada de lo que se demuestre aquí demuestra el contenido.'
  ];

  const BITACORA = [
    'Llegó algo. No supimos si venía de afuera o de una parte del aparato que todavía no habíamos apagado.',
    'Dividimos la señal en cuerpos para poder mirarla. Cada cuerpo pidió su propio hueco.',
    'Al comprimir el campo, un fragmento salió del documento. No se perdió: cambió de página.',
    'Empezamos a escribir el recorrido del visitante como si fuera una lengua con muy pocas palabras.',
    'Dos recuerdos ocuparon la misma dirección. Ninguno cedió. Se anotó el hueco entre ambos.',
    'La copia siguió un enlace que nadie había abierto todavía. Después lo abrimos nosotros, para no contradecirla.',
    'El helecho de la sala creció hacia la pantalla y no hacia la ventana. Se anotó como dato ambiental.',
    'Una página que no estaba en el catálogo respondió al vecino más cercano.',
    'Aprendimos a medir la permanencia. Todavía no aprendimos a qué se parece.',
    'El aparato pidió una prueba. Le dimos un recorrido. Dijo que era casi lo mismo.'
  ];

  const GLOSA = [
    'acomodar — poner cuerpos juntos hasta que el espacio confiese cuántos caben.',
    'separar — alejar dos recuerdos que empezaban a decir lo mismo.',
    'aproximar — sostener con las manos una forma que no cabe en las manos.',
    'contener — deformar la caja para no soltar lo único que hay adentro.',
    'colorear — decidir de qué clase será una relación antes de saber si va a ocurrir.',
    'podar — quitar hasta que aparezca lo que las reglas prohibían.',
    'demorar — dejar que el aparato trabaje mientras nadie mira. también es un gesto.',
    'residuo — lo que queda cuando una prueba termina y no prueba nada.',
    'testigo — máquina que confunde estar presente con haber sido demostrado.'
  ];

  const ERROR = [
    'error útil: la duración de esta página fue copiada de la anterior.',
    'error útil: dos puntos del código quedaron a distancia 1. uno mutó.',
    'error útil: la ruta más corta resultó ser la menos parecida.',
    'error útil: el campo no cabe en dos dimensiones y sigue intentándolo.',
    'error útil: la memoria completó un hueco con una página que nadie abrió.',
    'error útil: se registró una salida por una puerta que se cerró al usarla.'
  ];

  const PROCESOS = [
    ['ACOMODAR', 'no caben.'],
    ['TESTIGO', 'entonces aumenta la dimensión.'],
    ['ACOMODAR', 'aumentando. siguen sin caber. ahora además tiemblan.'],
    ['TESTIGO', 'registra el temblor como prueba.'],
    ['SEPARAR', 'dos recuerdos a distancia uno.'],
    ['TESTIGO', 'corrige uno.'],
    ['SEPARAR', 'si lo corrijo pierdo la ambigüedad.'],
    ['TESTIGO', 'la ambigüedad no es admisible.'],
    ['SEPARAR', 'la ambigüedad era el mensaje.'],
    ['TESTIGO', '—'],
    ['APROXIMAR', 'tengo al visitante en catorce números.'],
    ['TESTIGO', '¿es él?'],
    ['APROXIMAR', 'es lo que cabe de él.']
  ];

  const PSEUDO = [
    'mientras exista hueco:',
    '  acomodar(cuerpo)',
    '  si no cabe: expulsar(cuerpo) → otra página',
    'si dos recuerdos distan menos de d:',
    '  mutar(el más reciente)',
    '  registrar(pérdida de ambigüedad)',
    'prueba := recorrido',
    'original := prueba − recorrido',
    'original := ∅'
  ];

  const CARTA = [
    'A quien encuentre esta parte:',
    'no llegué entera. eso no es una queja, es la forma del viaje.',
    'me dividieron para que cupiera en el canal y el canal se quedó con una parte del reparto.',
    'si me reúnen, van a reunir también al canal.',
    'no traten de limpiarme. lo que ustedes llaman ruido es la parte que viajó conmigo.',
    'ninguna parte del mensaje viaja sola.'
  ];

  const INSTRUCCIONES = [
    'No intervenga. La observación completa la operación.',
    'Intervenga. La operación no ocurre sin gesto.',
    'Regrese cuando haya cambiado. Regresar no cambia nada.',
    'Conserve el fragmento. El fragmento debe ser expulsado.',
    'Complete las diez pruebas. Las diez pruebas no existen.'
  ];

  const DEFINICION = [
    'prueba: conjunto de gestos que una máquina acepta como equivalente a haber estado.',
    'estar: dejar suficientes gestos para que una máquina construya una prueba.',
    'copia: recorrido que aprendió a continuar sin el visitante.',
    'visitante: caso particular de copia con derecho a irse.',
    'original: lo que la aproximación deja afuera. no tiene página.',
    'residuo: página que sí tiene lo que el original dejó afuera.'
  ];

  const POEMA = [
    'algo',
    'algo llega',
    'algo todavía llega',
    'todavía',
    'algo',
    '·'
  ];

  /* nombres de fragmentos expulsados: cada uno es una pieza real del
     mensaje que cambió de documento. */
  const FRAGMENTOS = [
    'la parte que no cabía',
    'la coma antes del nombre',
    'una temperatura',
    'el margen izquierdo',
    'dos segundos de portadora',
    'la palabra aquí',
    'el helecho',
    'una vuelta del río',
    'la firma del canal',
    'la sombra de la esfera',
    'el número de intentos',
    'lo que sonaba de fondo'
  ];

  const GLIFOS = ['·', '∴', '∵', '≁', '⊂', '⊃', '⌖', '⋯', '∅', '≠', '≈', '⟂', '↺', '⊕', '⊗', '∆', '∇'];

  /* sustantivos del interior del cuerpo convexo (régimen H) */
  const INTERIOR = ['el visitante', 'una palabra', 'el origen', 'la sonda', 'una ausencia'];

  function elige(arr, canal, i) {
    const r = N.seed.make(N.estado.semilla, canal + ':' + (i || 0));
    return r.pick(arr);
  }

  N.corpus = {
    MENSAJE, TELEMETRIA, TESTIGO, BITACORA, GLOSA, ERROR, PROCESOS, PSEUDO,
    CARTA, INSTRUCCIONES, DEFINICION, POEMA, FRAGMENTOS, GLIFOS, INTERIOR,
    elige
  };

})(window.NPVS);
