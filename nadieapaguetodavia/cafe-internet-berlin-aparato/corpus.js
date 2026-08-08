/* =====================================================================
   NADIE APAGUE TODAVÍA — aparato crítico
   corpus.js · los testigos, el índice y las lecturas

   El poemario no se conserva. Se conserva su aparato.

   estructura de un verso:
     { l: { C:"lectura", D:"lectura", O:"lectura" } }   verso con testimonios
     { l: { D:"lectura" } }                              testimonio único
     { laguna: 34 }                                      hueco medido en signos
     { blanco: 1 }                                       corte de estrofa

   marcas de nota: ED · M97 · M? · MÁQUINA · OTRA MANO · K · ↳
   enlaces en las notas:  [[21]] pieza · [[T:C]] testigo
   ===================================================================== */

window.APARATO = (function () {
  "use strict";

  /* -------------------------------------------------------------------
     LOS CINCO TESTIGOS
     cada uno falla de una manera distinta. ahí está el libro.
     ------------------------------------------------------------------- */

  var testigos = [
    {
      sigla: "C",
      nombre: "cuaderno de tapas negras",
      soporte: "papel · tinta y lápiz · 96 hojas, 61 escritas",
      fecha: "III–IX 1997",
      procedencia: "de la mochila de Mara. lo transcribió otra mano en 2004.",
      virtud: "es lo más cercano que hay a un original: la letra escribiendo.",
      falla: "son borradores. Mara tachaba y seguía. tres lenguas en la misma línea.",
      color: "c1"
    },
    {
      sigla: "D",
      nombre: "disquete once, sin etiqueta",
      soporte: "3.5\" DD · copia hecha al cierre · doce sectores ilegibles",
      fecha: "06.09.97 02:41 (reloj adelantado)",
      procedencia: "estaba en una caja de zapatos rotulada OFICINA.",
      virtud: "es el único testimonio con hora de máquina.",
      falla: "el archivo se corta. donde el sector muere, el verso muere.",
      color: "c2"
    },
    {
      sigla: "P",
      nombre: "juego de hojas",
      soporte: "papel · impresión láser, después fotocopia de fotocopia",
      fecha: "05–06.IX.1997 y después",
      procedencia: "circularon esa noche. volvieron por correo desde tres ciudades.",
      virtud: "alguien las leyó de verdad: hay correcciones a mano.",
      falla: "no sabemos de quién es la mano. mejoró los versos sin firmar.",
      color: "c3"
    },
    {
      sigla: "O",
      nombre: "OCR de 2003",
      soporte: "lectura automática de [[T:P]] cuando [[T:P]] ya se borraba",
      fecha: "11.02.2003",
      procedencia: "una beca de digitalización que duró cinco semanas.",
      virtud: "conserva páginas de [[T:P]] que después se perdieron.",
      falla: "es una máquina. confunde rn con m, l con 1, y a veces mejora.",
      color: "c4"
    },
    {
      sigla: "R",
      nombre: "Hanna, 2011",
      soporte: "testimonio oral, transcrito · 3 h 40 min de grabación",
      fecha: "22.05.2011",
      procedencia: "estuvo esa noche. oyó a Mara leer en voz alta dos veces.",
      virtud: "es la única que sabe cómo sonaban.",
      falla: "recuerda el efecto y reconstruye las palabras. y ya había leído a los otros.",
      color: "c5"
    }
  ];

  /* -------------------------------------------------------------------
     LOS CUADERNILLOS
     el libro perdido estaba cosido en cinco. los nombres son de Mara.
     ------------------------------------------------------------------- */

  var cuadernillos = [
    { id: "I",   nombre: "verbinden",  glosa: "conectar",  desde: 1,  hasta: 9  },
    { id: "II",  nombre: "laden",      glosa: "cargar",    desde: 10, hasta: 18 },
    { id: "III", nombre: "senden",     glosa: "enviar",    desde: 19, hasta: 28 },
    { id: "IV",  nombre: "speichern",  glosa: "guardar",   desde: 29, hasta: 36 },
    { id: "V",   nombre: "morgen",     glosa: "mañana",    desde: 37, hasta: 40 }
  ];

  /* -------------------------------------------------------------------
     EL ÍNDICE Y LAS PIEZAS
     estado: restituible · fragmentaria · perdida · sin_testimonio
     ------------------------------------------------------------------- */

  var piezas = [

  /* ============ CUADERNILLO I — verbinden ============ */

  {
    n: 1, folio: "1r", titulo: "tren nocturno", estado: "restituible",
    versos: [
      { l: {
        C: "salgo de Constanța con dos monitores",
        D: "salgo de Constanța con dos monitores",
        R: "salió de Constanța cargando dos pantallas, dijo, y ya venía cansada"
      } },
      { l: {
        C: "y una caja de cables que pesa más que los monitores",
        P: "y una caja de cables que pesa más",
        O: "y una caja de cabIes que pesa rnás"
      } },
      { l: {
        C: "en la aduana húngara preguntan si son mercancía",
        D: "en la aduana húngara preguntan si son mercancía"
      } },
      { l: {
        C: "digo que son obra y no me creen",
        P: "digo que son obra y no me creen",
        R: "dijo que eran obra, y el hombre se rió, y ella pagó igual"
      } },
      { blanco: 1 },
      { l: {
        C: "escribo obra en el formulario",
        D: "escribo obra en el formulario"
      } },
      { l: {
        C: "en la casilla que dice valor escribo cero",
        P: "en la casilla del valor escribo cero",
        O: "en la casilla del vaIor escribo cero"
      } },
      { laguna: 41 },
      { l: {
        D: "y las dos cosas son verdad al mismo tiempo",
        R: "y decía que las dos cosas eran ciertas, eso lo repitió"
      } },
      { blanco: 1 },
      { l: {
        C: "en el bolsillo llevo un papel con un teléfono",
        D: "en el bolsillo llevo un papel con un teléfono",
        P: "llevo en el bolsillo un papel con un teléfono"
      } },
      { l: {
        C: "y una instrucción: llamar después de las seis",
        P: "y una instrucción: llamar después de las seis",
        O: "y una instrucción: IIamar después de Ias seis"
      } },
      { l: {
        C: "preguntar por el perro",
        D: "preguntar por el perro",
        R: "preguntar por Kifli. lo dijo así, con el nombre."
      } }
    ],
    notas: [
      { m: "ED", t: "Pieza de apertura en los cinco testimonios. Es la única de la que nadie discute el lugar." },
      { m: "M97", t: "La aduana fue en Curtici, no en Hungría. Lo dejo mal porque suena mejor y porque a esa hora yo tampoco sabía dónde estaba." },
      { m: "ED", t: "La laguna del verso 7 mide 41 signos en [[T:D]]. Es el único hueco del libro cuyo tamaño conocemos con exactitud: el sector se cortó limpio. Sabemos cuánto falta y no qué falta." },
      { m: "M?", t: "Lo que falta ahí es la palabra que buscaba para decir que una cosa puede no valer nada y ser todo lo que traes. No la encontré en 1997 y no la he encontrado." },
      { m: "R", t: "«Leyó esta primero, de pie, con el abrigo puesto todavía. Nadie le había pedido que leyera.»" },
      { m: "K", t: "El papel del teléfono estaba escrito por Ileana, que se quedó con el perro. La letra es de ella hasta la palabra perro, y de Mara desde ahí." }
    ]
  },

  {
    n: 2, folio: "1v", titulo: "inventario de lo que cruzó la frontera", estado: "restituible",
    versos: [
      { l: {
        C: "dos monitores CRT, beige, distinto beige cada uno",
        D: "dos monitores CRT beige, distinto beige cada uno",
        O: "dos rnonitores CRT beige, distinto beige cada uno"
      } },
      { l: {
        C: "catorce cables, once que sé para qué son",
        P: "catorce cables, once que sé para qué son"
      } },
      { l: {
        C: "cuarenta y un disquetes, treinta y nueve con etiqueta",
        D: "cuarenta y un disquetes, treinta y nueve con etiqueta",
        R: "cuarenta y tantos disquetes. dos sin nombre, eso sí lo recuerdo."
      } },
      { l: {
        C: "una regleta rumana que no entra en el enchufe alemán",
        P: "una regleta que no entra en el enchufe alemán"
      } },
      { l: {
        C: "un adaptador que sí",
        D: "un adaptador que sí"
      } },
      { blanco: 1 },
      { l: {
        C: "una libreta con direcciones y contraseñas tachadas",
        P: "una libreta con direcciones y contraseñas tachadas",
        O: "una Iibreta con direcciones y contraseñas tachadas"
      } },
      { l: {
        C: "las tachaduras también son información",
        D: "las tachaduras también son información",
        R: "decía que lo tachado también contaba. eso lo dijo mucho."
      } },
      { blanco: 1 },
      { laguna: 27 },
      { l: {
        D: "y una foto de unas patas debajo de una mesa",
        P: "y una foto de unas patas debajo de una mesa",
        O: "y una foto de unas patas debajo de una rnesa"
      } }
    ],
    notas: [
      { m: "ED", t: "El inventario coincide en todos los testimonios salvo en el número de disquetes. [[T:R]] dice cuarenta y tantos; los demás, cuarenta y uno. Se conserva la cifra." },
      { m: "M97", t: "Falta en la lista el termo. El termo cruzó cuatro fronteras y no lo puse. Lo pongo aquí." },
      { m: "OTRA MANO", t: "el termo no era suyo" },
      { m: "ED", t: "La laguna del verso 8 corresponde en [[T:C]] a una línea tachada hasta el papel. La transcripción de 2004 anota: «ilegible, cinco palabras, la tinta atraviesa la hoja»." }
    ]
  },

  {
    n: 3, folio: "2r", titulo: "la sala antes", estado: "restituible",
    versos: [
      { l: {
        C: "una mesa larga hecha de tableros y caballetes",
        D: "una mesa larga hecha de tableros y caballetes",
        P: "una mesa larga de tableros y caballetes"
      } },
      { l: {
        C: "polvo con la forma de lo que estuvo aquí antes",
        P: "polvo con la forma de lo que estuvo antes",
        R: "hablaba del polvo. de que el polvo tenía forma de las cosas anteriores."
      } },
      { l: {
        C: "una pared demasiado blanca para lo que vamos a hacerle",
        O: "una pared dernasiado blanca para lo que vamos a hacerle"
      } },
      { blanco: 1 },
      { l: {
        C: "pongo la primera computadora en la esquina",
        D: "pongo la primera computadora en la esquina",
        P: "pongo la primera computadora en la esquina"
      } },
      { l: {
        C: "la enciendo",
        D: "la enciendo"
      } },
      { l: {
        C: "y la habitación se vuelve un lugar con centro",
        P: "y la habitación adquiere un centro",
        O: "y la habitación adquiere un centre",
        R: "y dijo: ahora la sala ya tiene dónde mirar"
      } },
      { blanco: 1 },
      { l: {
        C: "escribo CAFÉ / INTERNET / HEUTE en una hoja",
        D: "escribo CAFÉ / INTERNET / HEUTE en una hoja"
      } },
      { l: {
        C: "la pego torcida",
        P: "la pego torcida",
        R: "la pegó chueca y la dejó chueca. eso fue a propósito."
      } },
      { l: {
        C: "la dejo torcida",
        D: "la dejo torcida"
      } }
    ],
    notas: [
      { m: "ED", t: "La lectura de [[T:O]] en el verso 6 —«centre»— es un error de reconocimiento. Se conserva en el aparato porque durante nueve años fue la lectura aceptada: la primera edición mecanografiada la leyó como palabra francesa y anotó al margen «cf. centre, Derrida»." },
      { m: "M?", t: "Nunca leí a Derrida en 1997. Lo leí en 2006 porque me lo prestaron para explicarme un poema mío." },
      { m: "ED", t: "La hoja pegada torcida se conserva. Está en [[T:P]], fotocopiada con el muro incluido. La cinta adhesiva aparece como dos rectángulos negros." },
      { m: "↳", t: "Sobre esa hoja, ver la pieza [[4]], de la que sólo queda ella." }
    ]
  },

  {
    n: 4, folio: "2v", titulo: "CAFÉ / INTERNET / HEUTE", estado: "fragmentaria",
    versos: [
      { l: {
        P: "hoy quiere decir hasta las dos de la mañana",
        O: "hoy quiere decir hasta Ias dos de Ia rnañana"
      } }
    ],
    notas: [
      { m: "ED", t: "De esta pieza sobrevive un verso. No está en ningún testimonio del libro: está escrito con marcador al reverso de la hoja del cartel, y llegó al archivo porque alguien fotocopió la hoja por los dos lados sin saber por qué." },
      { m: "M97", t: "El cartel decía HEUTE. Nadie preguntó hoy hasta cuándo." },
      { m: "R", t: "«El cartel se cayó como a las once y nadie lo volvió a pegar. Para entonces ya no hacía falta anunciar nada.»" }
    ]
  },

  {
    n: 5, folio: "3r", titulo: "dos monitores", estado: "restituible",
    versos: [
      { l: {
        C: "el mío calienta por arriba y hay que dejarle aire",
        D: "el mío calienta por arriba y hay que dejarle aire",
        O: "el rnío caIienta por arriba y hay que dejarIe aire"
      } },
      { l: {
        C: "el otro tiene el verde alto y todas las caras se ven enfermas",
        P: "el otro tiene el verde alto: todas las caras se ven enfermas"
      } },
      { l: {
        C: "no lo calibro",
        D: "no lo calibro"
      } },
      { l: {
        C: "que el retrato de esta noche salga con fiebre",
        P: "que el retrato de esta noche salga con fiebre",
        R: "quería que la noche saliera con fiebre. usó esa palabra, fiebre."
      } },
      { blanco: 1 },
      { l: {
        C: "un monitor pesa lo que pesa una persona pequeña",
        D: "un monitor pesa lo que pesa una persona pequeña",
        P: "un monitor pesa como una persona pequeña"
      } },
      { l: {
        C: "por eso se cargan entre dos",
        D: "por eso se cargan entre dos"
      } },
      { l: {
        C: "y por eso mover una exposición se parece a mudarse",
        P: "y mover una exposición se parece a mudarse",
        O: "y rnover una exposición se parece a rnudarse"
      } },
      { laguna: 19 }
    ],
    notas: [
      { m: "ED", t: "El verso final falta en los cinco testimonios. [[T:D]] conserva su longitud: 19 signos. [[T:C]] tiene la línea empezada y abandonada: «y por eso una amis»." },
      { m: "M?", t: "No lo terminé porque en ese momento entró alguien cargando el suyo." },
      { m: "MÁQUINA", t: "Reconstrucción propuesta por la edición de 2003 y rechazada: «y por eso una amistad». Longitud 19. Coincide. No se acepta: coincidir no es ser." }
    ]
  },

  {
    n: 6, folio: "3v", titulo: "topología del suelo", estado: "restituible",
    versos: [
      { l: {
        C: "las extensiones dibujan en el piso lo que no dibujamos en la pared",
        P: "las extensiones dibujan en el piso lo que no dibujamos en la pared",
        O: "Ias extensiones dibujan en eI piso Io que no dibujarnos en Ia pared"
      } },
      { l: {
        C: "quién depende de quién para tener corriente",
        D: "quién depende de quién para tener corriente"
      } },
      { blanco: 1 },
      { l: {
        C: "la estación 7 cuelga de la 6",
        D: "la estación 7 cuelga de la 6",
        P: "la estación 7 cuelga de la 6"
      } },
      { l: {
        C: "la 6 de una regleta que sostiene un ladrillo",
        D: "la 6 de una regleta que sostiene un ladrillo"
      } },
      { l: {
        C: "el ladrillo lo trajo Hanna del patio",
        P: "el ladrillo lo trajo Hanna del patio",
        R: "el ladrillo lo traje yo. no del patio: de la obra de al lado."
      } },
      { blanco: 1 },
      { l: {
        C: "pegamos cinta amarilla encima de los cables",
        D: "pegamos cinta amarilla encima de los cables",
        O: "pegarnos cinta arnariIIa encirna de Ios cabIes"
      } },
      { l: {
        C: "para que nadie se caiga",
        D: "para que nadie se caiga"
      } },
      { l: {
        C: "al final de la noche la cinta es lo único que sigue en su lugar",
        P: "al final la cinta es lo único que sigue en su sitio",
        R: "y al final quedó la cinta pegada, con la forma de todo lo que ya no estaba"
      } }
    ],
    notas: [
      { m: "ED", t: "Única pieza en la que [[T:R]] corrige un dato de hecho y los editores anteriores la creyeron. El ladrillo venía de una obra vecina. Se conserva la lectura de [[T:C]] en el cuerpo y la corrección aquí: no es lo mismo un patio que una obra." },
      { m: "M97", t: "Estación 7 = la de la escritora. Estación 6 = la del escáner. Si se cae el escáner se cae ella. Escribirlo antes de que pase." },
      { m: "ED", t: "Pasó. Ver [[13]], de la que sólo se conserva el verso que lo cuenta." }
    ]
  },

  {
    n: 7, folio: "4r", titulo: "quién trae la extensión", estado: "perdida",
    versos: [],
    notas: [
      { m: "ED", t: "Título en el índice. Ningún testimonio conserva una sola palabra del cuerpo. [[T:D]] tiene el nombre del archivo y cero bytes." },
      { m: "R", t: "«Ésa me acuerdo que existía porque me daba risa. No me acuerdo de nada más. Perdón.»" },
      { m: "M?", t: "Era la más corta del libro. Era una lista de nombres. No hacía falta ser poema." }
    ]
  },

  {
    n: 8, folio: "4v", titulo: "el mapa que dejó de coincidir", estado: "restituible",
    versos: [
      { l: {
        C: "dibujo el mapa de las conexiones en una hoja grande",
        D: "dibujo el mapa de las conexiones en una hoja grande",
        P: "dibujo en una hoja grande el mapa de las conexiones"
      } },
      { l: {
        C: "mientras lo dibujo alguien mueve la estación 3",
        D: "mientras lo dibujo alguien mueve la estación 3",
        O: "rnientras Io dibujo aIguien rnueve Ia estación 3"
      } },
      { l: {
        C: "el mapa envejece más rápido de lo que lo hago",
        P: "el mapa envejece más rápido de lo que lo hago",
        R: "decía que el mapa se ponía viejo mientras lo hacía. se reía de eso."
      } },
      { blanco: 1 },
      { l: {
        C: "no lo tiro",
        D: "no lo tiro"
      } },
      { l: {
        C: "lo cuelgo al lado del mapa correcto",
        P: "lo cuelgo junto al mapa correcto"
      } },
      { l: {
        C: "para que se vea el rato en que creímos eso",
        P: "para que se vea el rato en que creímos eso",
        O: "para que se vea eI rato en que creírnos eso"
      } },
      { blanco: 1 },
      { l: {
        C: "al reverso de este mapa escribo el índice del libro",
        D: "al reverso de este mapa escribo el índice del libro"
      } },
      { l: {
        C: "es la única hoja lo bastante grande",
        D: "es la única hoja lo bastante grande",
        R: "usó el revés del plano porque no había otra hoja. eso fue todo. no fue una idea."
      } }
    ],
    notas: [
      { m: "ED", t: "Esta pieza explica por qué existe este aparato. El índice del poemario —lo único completo que sobrevive— está escrito al dorso del plano de la sala. Se conservó porque el plano se conservó, y el plano se conservó porque estaba clavado en la pared cuando alguien fotografió el muro." },
      { m: "ED", t: "De modo que tenemos el mapa de la habitación y la lista de los poemas en las dos caras del mismo papel, y no tenemos los poemas." },
      { m: "M?", t: "Si hubiera sabido, escribo los poemas al reverso y el índice en el cuaderno." },
      { m: "OTRA MANO", t: "no habrías sabido cuál era el reverso" }
    ]
  },

  {
    n: 9, folio: "5r", titulo: "tarea sin autoridad", estado: "fragmentaria",
    versos: [
      { l: {
        C: "nadie dijo quién manda y todo el día alguien decide",
        R: "algo de que nadie mandaba pero alguien siempre decidía"
      } },
      { l: {
        C: "casi siempre la misma persona",
        O: "casi siernpre Ia rnisrna persona"
      } }
    ],
    notas: [
      { m: "ED", t: "Dos versos, ambos en [[T:C]], ambos tachados con una sola raya —es decir, legibles: Mara tachaba para no publicar, no para borrar." },
      { m: "M97", t: "No lo pongas. Va a parecer que me quejo y estoy describiendo." },
      { m: "ED", t: "Se pone. La instrucción de no publicar llegó junto con el texto, en el mismo soporte, con la misma letra. Publicar la instrucción es la única manera honesta de obedecerla a medias." }
    ]
  },

  /* ============ CUADERNILLO II — laden ============ */

  {
    n: 10, folio: "5v", titulo: "besetzt", estado: "restituible",
    versos: [
      { l: {
        C: "una línea telefónica para diez máquinas",
        D: "una línea telefónica para diez máquinas",
        P: "una sola línea telefónica para diez máquinas"
      } },
      { l: {
        C: "el módem marca y suena ocupado",
        D: "el módem marca y suena ocupado",
        O: "eI rnódern rnarca y suena ocupado"
      } },
      { l: {
        C: "marca otra vez",
        D: "marca otra vez"
      } },
      { l: {
        C: "besetzt",
        D: "besetzt",
        R: "y decía besetzt en voz alta cada vez, como un conteo"
      } },
      { blanco: 1 },
      { l: {
        C: "aprendemos la palabra sin traducirla",
        P: "aprendemos la palabra sin traducirla"
      } },
      { l: {
        C: "porque la aprendemos oyéndola",
        D: "porque la aprendemos oyéndola",
        P: "la aprendemos oyéndola"
      } },
      { l: {
        C: "quince veces seguidas",
        D: "quince veces seguidas",
        R: "fueron muchas más de quince. muchas más."
      } },
      { blanco: 1 },
      { l: {
        C: "conectar no es un estado: es una insistencia",
        P: "conectar no es un estado sino una insistencia",
        O: "conectar no es un estado sino una insistencia"
      } },
      { l: {
        C: "alguien tiene que estar ahí marcando",
        D: "alguien tiene que estar ahí marcando"
      } },
      { l: {
        C: "y esa persona no está mirando la exposición",
        P: "y esa persona no está viendo la exposición",
        R: "y ella no vio nada esa noche. nada. estuvo marcando."
      } }
    ],
    notas: [
      { m: "ED", t: "El poema entero está construido sobre la única palabra alemana que el grupo aprendió esa semana sin que nadie la tradujera." },
      { m: "M97", t: "besetzt: ocupado. También se dice de un asiento y de un país." },
      { m: "ED", t: "La glosa de [[T:C]] no está en el poema sino al margen. Los editores de 2003 la incorporaron al cuerpo como un verso 11 que aquí no existe. Se retira: es una nota, y una nota que dice demasiado." }
    ]
  },

  {
    n: 11, folio: "6r", titulo: "si esto abre, ya estoy ahí", estado: "restituible",
    versos: [
      { l: {
        C: "llega un correo enviado anoche desde otra ciudad",
        D: "llega un correo enviado anoche desde otra ciudad",
        P: "llega un correo enviado anoche desde otra ciudad"
      } },
      { l: {
        C: "trae una imagen comprimida y una frase",
        D: "trae una imagen comprimida y una frase",
        O: "trae una irnagen cornprirnida y una frase"
      } },
      { l: {
        C: "si esto abre, ya estoy ahí",
        D: "si esto abre, ya estoy ahí",
        R: "si esto abre ya estoy ahí. eso lo repetimos toda la noche, como saludo."
      } },
      { blanco: 1 },
      { l: {
        C: "abre",
        D: "abre"
      } },
      { l: {
        C: "y no está",
        D: "y no está",
        P: "y no está aquí"
      } },
      { blanco: 1 },
      { l: {
        C: "la frase no mentía: dijo ahí, no aquí",
        P: "la frase no mentía: decía ahí, no aquí",
        O: "Ia frase no rnentía: decía ahí, no aquí"
      } },
      { laguna: 33 },
      { l: {
        D: "un archivo es una manera de estar en un sitio sin llegar",
        R: "algo así como que abrir un archivo era estar sin llegar. no sé si esas palabras."
      } }
    ],
    notas: [
      { m: "ED", t: "La frase «si esto abre, ya estoy ahí» aparece en los cinco testimonios sin variantes. Es el único verso del libro en esa situación." },
      { m: "M?", t: "Porque no es mío. Lo escribió Vasile en el asunto del correo y yo lo copié." },
      { m: "ED", t: "No hay ningún Vasile en la lista de participantes ni en [[T:R]]. La nota se conserva: una atribución falsa también es un documento sobre cómo alguien quiso repartir el crédito." }
    ]
  },

  {
    n: 12, folio: "6v", titulo: "once minutos por una imagen", estado: "restituible",
    versos: [
      { l: {
        C: "sesenta y un kilobytes",
        D: "sesenta y un kilobytes",
        O: "sesenta y un kiIobytes"
      } },
      { l: {
        C: "once minutos",
        D: "once minutos"
      } },
      { l: {
        C: "la imagen baja por franjas y cada franja es una noticia",
        P: "la imagen baja por franjas y cada franja es una noticia",
        R: "iba bajando a tiras. cada tira nos ponía nerviosos."
      } },
      { blanco: 1 },
      { l: {
        C: "franja 1: cielo o pared, no se sabe",
        D: "franja 1: cielo o pared, no se sabe"
      } },
      { l: {
        C: "franja 4: hay alguien",
        D: "franja 4: hay alguien",
        P: "franja 4: hay alguien"
      } },
      { l: {
        C: "franja 7: hay dos",
        D: "franja 7: hay dos"
      } },
      { l: {
        C: "franja 9: el segundo es una silla",
        P: "franja 9: el segundo era una silla",
        O: "franja 9: eI segundo era una siIIa"
      } },
      { blanco: 1 },
      { l: {
        C: "durante once minutos hablamos de otra cosa",
        D: "durante once minutos hablamos de otra cosa",
        P: "durante once minutos hablamos de otra cosa"
      } },
      { l: {
        C: "la espera es el único rato en que nos miramos",
        P: "la espera es el único rato en que nos miramos",
        R: "decía que sólo nos veíamos las caras mientras cargaba algo"
      } },
      { l: {
        C: "cuando termina de cargar no hay nadie mirando",
        D: "cuando termina de cargar no hay nadie mirando",
        O: "cuando termina de cargar no hay nadie rnirando"
      } }
    ],
    notas: [
      { m: "ED", t: "El cálculo es correcto para las condiciones descritas. No es una exageración poética: 61 KB por línea conmutada compartida daba ese orden de espera." },
      { m: "M97", t: "La imagen era el patio de la casa de Ileana. Con el perro. El perro salió movido." },
      { m: "K", t: "Salió movido porque estaba yendo hacia quien tomaba la foto." },
      { m: "ED", t: "La nota anterior está marcada [[T:C]] pero la letra no es de Mara. Es la única nota [K] escrita por otra persona y nadie la ha reclamado." }
    ]
  },

  {
    n: 13, folio: "7r", titulo: "nadie estaba mirando", estado: "fragmentaria",
    versos: [
      { l: {
        P: "el escáner se cayó y la escritora lo sostuvo con la rodilla",
        O: "eI escáner se cayó y Ia escritora Io sostuvo con Ia rodiIIa",
        R: "se venció la mesa de mi lado y aguanté el escáner con la pierna hasta que vinieron"
      } },
      { l: {
        P: "durante cuatro minutos fue la obra más difícil de la sala",
        R: "cuatro minutos. o menos. se me hicieron largos."
      } }
    ],
    notas: [
      { m: "ED", t: "Los dos versos vienen de [[T:P]] —una hoja suelta, sin folio, encontrada dentro de otra pieza— y están confirmados por [[T:R]], que es la protagonista. Es el único caso del libro en que la testigo y el personaje son la misma persona." },
      { m: "R", t: "«Y ella lo escribió esa misma noche. Me lo enseñó. Le dije que no era para tanto y me dijo que ése era exactamente el punto.»" }
    ]
  },

  {
    n: 14, folio: "7v", titulo: "la habitación del MOO", estado: "restituible",
    versos: [
      { l: {
        C: "escribo look",
        D: "escribo look",
        P: "escribo look"
      } },
      { l: {
        C: "y la habitación me contesta cómo es",
        D: "y la habitación me contesta cómo es",
        O: "y Ia habitación rne contesta córno es"
      } },
      { l: {
        C: "hay tres personas aquí y ninguna tiene cuerpo",
        P: "hay tres personas aquí y ninguna tiene cuerpo",
        R: "tres tipos conectados en un cuarto que no existía, y ella les habló"
      } },
      { blanco: 1 },
      { l: {
        C: "escribo say hello",
        D: "escribo say hello"
      } },
      { l: {
        C: "dos contestan y uno lleva cuatro horas quieto",
        P: "dos contestan y uno lleva cuatro horas quieto",
        O: "dos contestan y uno IIeva cuatro horas quieto"
      } },
      { l: {
        C: "está conectado y no está",
        D: "está conectado y no está"
      } },
      { l: {
        C: "es el primer fantasma que veo y es un permiso mal cerrado",
        P: "es el primer fantasma que veo y es una sesión mal cerrada",
        R: "dijo que el fantasma era un permiso que nadie cerró"
      } },
      { blanco: 1 },
      { l: {
        C: "construyo una taza",
        D: "construyo una taza",
        P: "construyo una taza"
      } },
      { l: {
        C: "escribo su descripción con cuidado",
        D: "escribo su descripción con cuidado"
      } },
      { l: {
        C: "nadie puede beber de ella y la dejo ahí de todos modos",
        P: "nadie puede beber de ella y la dejo ahí igual",
        O: "nadie puede beber de eIIa y Ia dejo ahí iguaI"
      } },
      { l: {
        C: "no sé si esto es programar, jugar, conversar o escribir teatro",
        D: "no sé si esto es programar, jugar, conversar o escribir teatro",
        R: "y preguntó si eso era programar o jugar o hablar. no lo resolvió."
      } }
    ],
    notas: [
      { m: "ED", t: "La taza sobrevivió al libro. Aparece en [[16]] como objeto de la sala y en [[T:R]] como recuerdo físico. Hanna cree haber bebido de ella." },
      { m: "M?", t: "La taza del MOO no se podía beber. La taza de la mesa sí. Una noche larga vuelve eso indistinguible y ése era el chiste." },
      { m: "MÁQUINA", t: "Registro conservado de la sesión: >build taza / You now have taza. / >describe taza as \"está tibia\" / Description set." },
      { m: "ED", t: "El registro anterior procede de [[T:D]] y es el único texto del libro que la máquina escribió sin intermediario. Se conserva como testimonio, no como verso." }
    ]
  },

  {
    n: 15, folio: "8r", titulo: "una taza que nadie puede beber", estado: "fragmentaria",
    versos: [
      { l: {
        D: "está tibia porque yo escribí que está tibia",
        R: "está tibia porque lo escribí. eso sí lo puedo repetir palabra por palabra."
      } }
    ],
    notas: [
      { m: "ED", t: "Un verso. Coincidencia exacta entre un disquete y una memoria de catorce años después. El aparato no puede explicarlo y no lo intenta." },
      { m: "OTRA MANO", t: "puede explicarlo: hanna leyó el disquete en 2009" },
      { m: "ED", t: "Hanna declara no haber visto nunca el contenido de [[T:D]]. La nota anterior no está firmada y aparece en el margen de una fotocopia de trabajo del propio archivo. No es de 1997: es de aquí." }
    ]
  },

  {
    n: 16, folio: "8v", titulo: "comida sobre el teclado", estado: "restituible",
    versos: [
      { l: {
        C: "comemos junto a las máquinas porque siempre falta algo",
        D: "comemos junto a las máquinas porque siempre falta algo",
        O: "cornernos junto a Ias rnáquinas porque siernpre faIta aIgo"
      } },
      { l: {
        C: "la pausa es falsa y aun así es la mejor hora del día",
        P: "la pausa es falsa y es la mejor hora del día",
        R: "la comida fue lo mejor. ahí se habló de verdad."
      } },
      { blanco: 1 },
      { l: {
        C: "quién se va de Berlín",
        D: "quién se va de Berlín"
      } },
      { l: {
        C: "quién no tiene para el alquiler",
        D: "quién no tiene para el alquiler",
        P: "quién no tiene para el alquiler"
      } },
      { l: {
        C: "quién quiere dejar de hacer arte y no lo dice así",
        P: "quién quiere dejar de hacer arte sin decirlo así",
        O: "quién quiere dejar de hacer arte sin decirIo así"
      } },
      { l: {
        C: "quién guarda todavía los correos de alguien",
        D: "quién guarda todavía los correos de alguien",
        R: "y quién no había borrado los mensajes de su ex. eso lo preguntó Mara."
      } },
      { blanco: 1 },
      { l: {
        C: "una taza deja un círculo sobre la lista de archivos",
        D: "una taza deja un círculo sobre la lista de archivos",
        P: "una taza deja un círculo sobre la lista de archivos"
      } },
      { l: {
        C: "el círculo tapa cuatro nombres",
        D: "el círculo tapa cuatro nombres"
      } },
      { l: {
        C: "los cuatro que después no encontramos",
        P: "los cuatro que después no aparecieron",
        R: "y justo ésos fueron los que se perdieron. eso me lo dijo después, no ahí."
      } }
    ],
    notas: [
      { m: "ED", t: "La coincidencia entre la mancha y la pérdida es, casi con seguridad, una construcción posterior: [[T:R]] admite que la relación se la contaron después. Se conserva porque el libro la sostiene tres veces más." },
      { m: "M97", t: "La mancha existe. La lista existe. Está en la caja." },
      { m: "ED", t: "Está en la caja. La hoja con el círculo se conserva y es ilegible exactamente donde el poema dice." },
      { m: "↳", t: "La mancha vuelve en [[21]] como zona negra del escáner y en [[34]] como halo. Sobre su tercera vida, ver la nota 2 de [[34]]." }
    ]
  },

  {
    n: 17, folio: "9r", titulo: "FACE TO FACE / WITHOUT A FACE", estado: "restituible",
    versos: [
      { l: {
        C: "en una pantalla las caras están acostadas",
        D: "en una pantalla las caras están acostadas",
        P: "en una pantalla las caras están acostadas"
      } },
      { l: {
        C: "hay que inclinar la cabeza para verlas",
        D: "hay que inclinar la cabeza para verlas",
        O: "hay que incIinar Ia cabeza para verIas"
      } },
      { l: {
        C: "en la otra están de pie y te miran de frente",
        P: "en la otra están de pie y te miran de frente",
        R: "una pantalla con caritas de lado y otra con caritas derechas"
      } },
      { blanco: 1 },
      { l: {
        C: "la instrucción dice: haz una cara y ponle nombre en tu lengua",
        D: "la instrucción dice: haz una cara y ponle nombre en tu lengua",
        P: "la instrucción dice: componga una cara y nómbrela en su lengua"
      } },
      { blanco: 1 },
      { l: {
        C: "la misma cara recibe cuatro nombres",
        D: "la misma cara recibe cuatro nombres",
        O: "Ia rnisrna cara recibe cuatro nornbres"
      } },
      { l: {
        C: "cansancio, cortesía, tristeza que no quiere molestar, sueño",
        P: "cansancio, cortesía, tristeza que no quiere molestar, sueño",
        R: "alguien puso cansada y otro puso educada y era la misma carita"
      } },
      { l: {
        C: "no es un idioma universal: es una superficie donde no coincidimos despacio",
        P: "no es un idioma universal: es una superficie donde no coincidimos despacio",
        O: "no es un idiorna universaI: es una superficie donde no coincidirnos despacio"
      } },
      { blanco: 1 },
      { l: {
        C: "imprimo las caras y las cuelgo como una conversación sin frases",
        D: "imprimo las caras y las cuelgo como una conversación sin frases",
        P: "imprimo las caras y las cuelgo como conversación sin frases"
      } },
      { laguna: 52 }
    ],
    notas: [
      { m: "ED", t: "Las dos genealogías que la pieza pone frente a frente están documentadas y son distintas. El emoticono lateral remite a la propuesta de Scott Fahlman en un tablón de Carnegie Mellon, septiembre de 1982. El kaomoji erguido circulaba en servicios japoneses desde mediados de los ochenta, con una atribución individual mucho menos firme. En 1997 ambos son historia disponible, no profecía." },
      { m: "M97", t: "Nota al margen de la hoja: en vez de mandar la imagen cada vez, mandar un código chico y que cada aparato la dibuje él." },
      { m: "ED", t: "Ésa es la laguna del verso 9: cincuenta y dos signos. La nota al margen sobrevivió; el verso que la contenía, no. Es exactamente lo contrario de lo que suele pasar." },
      { m: "M?", t: "La hoja con esa nota apareció después dentro de un sobre rotulado FIRST EMOJI / 1997. La letra del sobre es mía. La fecha del sobre es de 2001." },
      { m: "ED", t: "El conjunto histórico de 176 signos de 12×12 píxeles se desarrolló para i-mode entre 1998 y 1999 y se transmitía como datos de carácter. Una anticipación fechada en 1997 sólo puede leerse como ficción o como lectura retroactiva. El sobre no prueba una anticipación: prueba que alguien, en 2001, quiso tener un antecedente." }
    ]
  },

  {
    n: 18, folio: "9v", titulo: "lo que Kifli hizo hoy", estado: "restituible",
    versos: [
      { l: {
        C: "el mensaje tarda dos días en llegar y dice tres cosas",
        D: "el mensaje tarda dos días en llegar y dice tres cosas",
        P: "el mensaje tardó dos días y dice tres cosas"
      } },
      { blanco: 1 },
      { l: {
        C: "comió a las ocho",
        D: "comió a las ocho"
      } },
      { l: {
        C: "salió al puerto",
        D: "salió al puerto",
        P: "salió hasta el puerto"
      } },
      { l: {
        C: "espera junto a la puerta a la hora en que llegabas",
        P: "espera junto a la puerta a la hora en que tú llegabas",
        O: "espera junto a Ia puerta a Ia hora en que tú IIegabas",
        R: "que el perro se ponía en la puerta a la hora de siempre. eso la puso mal."
      } },
      { blanco: 1 },
      { l: {
        C: "esto es una red también",
        D: "esto es una red también",
        P: "esto también es una red"
      } },
      { l: {
        C: "alguien mira a un animal y escribe tres líneas",
        P: "alguien mira a un animal y escribe tres líneas"
      } },
      { l: {
        C: "y las manda a mil quinientos kilómetros",
        D: "y las manda a mil quinientos kilómetros",
        O: "y Ias rnanda a rniI quinientos kiIórnetros"
      } },
      { l: {
        C: "para que yo pueda seguir cableando",
        P: "para que yo pueda seguir con los cables",
        R: "decía que le escribían del perro para que ella pudiera trabajar"
      } }
    ],
    notas: [
      { m: "K", t: "Ileana escribe siempre en el mismo orden: comió, salió, esperó. Cambia el orden sólo cuando algo va mal." },
      { m: "ED", t: "Los mensajes sobre Kifli forman la serie más regular del libro: [[18]], [[33]] y la nota 6 de [[1]]. Son también los únicos textos cuya procedencia nadie ha discutido nunca." },
      { m: "M?", t: "Porque a nadie le pareció que valieran la pena y por eso nadie los tocó. Es la mejor conservación que hay: que no le interesen a nadie." }
    ]
  },

  /* ============ CUADERNILLO III — senden ============ */

  {
    n: 19, folio: "10r", titulo: "la carpeta que no está", estado: "restituible",
    versos: [
      { l: {
        C: "a las cuatro y cuarto la carpeta no está donde estaba",
        D: "a las cuatro y cuarto la carpeta no está donde estaba",
        P: "a las cuatro y cuarto la carpeta no está donde estaba"
      } },
      { l: {
        C: "o nunca estuvo y lo que teníamos era el acuerdo de que estaba",
        P: "o nunca estuvo y teníamos sólo el acuerdo de que estaba",
        O: "o nunca estuvo y teníarnos sóIo eI acuerdo de que estaba"
      } },
      { blanco: 1 },
      { l: {
        C: "en el disco de Hanna hay una versión de agosto",
        D: "en el disco de Hanna hay una versión de agosto"
      } },
      { l: {
        C: "en el mío una de la semana pasada",
        D: "en el mío una de la semana pasada",
        P: "en el mío una de la semana pasada"
      } },
      { l: {
        C: "ninguna es la que perdimos",
        D: "ninguna es la que perdimos",
        R: "ninguna servía. las dos eran de otro momento."
      } },
      { blanco: 1 },
      { l: {
        C: "discutimos tres cosas: reconstruir, disimular, mostrar el hueco",
        P: "discutimos tres cosas: reconstruir, disimular o mostrar el hueco",
        O: "discutirnos tres cosas: reconstruir, disirnuIar o rnostrar eI hueco"
      } },
      { l: {
        C: "gana el hueco por cansancio, no por poética",
        P: "gana el hueco por cansancio, no por poética",
        R: "al final dejamos el hueco porque ya no daba el tiempo. después dijimos que era a propósito."
      } },
      { blanco: 1 },
      { l: {
        C: "no hay culpable",
        D: "no hay culpable"
      } },
      { l: {
        C: "hay una obra que siempre fue un acuerdo entre memorias",
        P: "hay una obra que siempre fue un acuerdo entre memorias",
        O: "hay una obra que siernpre fue un acuerdo entre rnernorias"
      } }
    ],
    notas: [
      { m: "ED", t: "Esta pieza describe, en 1997 y sobre otra cosa, el procedimiento exacto de esta edición. No se ha añadido una sola palabra." },
      { m: "M97", t: "Escribir esto ahora, antes de que decidamos qué contamos mañana." },
      { m: "ED", t: "La lectura de [[T:R]] en el verso 7 —«después dijimos que era a propósito»— no está en ningún soporte de 1997. Puede ser lucidez de 2011 o puede ser el verso que Mara borró. El aparato no decide." }
    ]
  },

  {
    n: 20, folio: "10v", titulo: "dos discos, dos memorias", estado: "fragmentaria",
    versos: [
      { l: {
        C: "comparar dos copias es una manera de discutir sin gritar",
        O: "cornparar dos copias es una rnanera de discutir sin gritar"
      } }
    ],
    notas: [
      { m: "ED", t: "Un verso en [[T:C]], al pie de una página ocupada por un diagrama de dos círculos que se cortan. La zona común está rayada y dice «esto sí»." },
      { m: "M?", t: "El resto del poema estaba en la máquina de Hanna y la máquina de Hanna se vendió en 1999." }
    ]
  },

  {
    n: 21, folio: "11r", titulo: "apertura", estado: "restituible",
    versos: [
      { l: {
        C: "entran antes de que terminemos de probar",
        D: "entran antes de que terminemos de probar",
        P: "entran antes de que terminemos las pruebas"
      } },
      { l: {
        C: "y eso ya no se puede deshacer",
        D: "y eso ya no se puede deshacer",
        O: "y eso ya no se puede deshacer"
      } },
      { blanco: 1 },
      { l: {
        C: "una niña juega la aventura de texto sin leer las instrucciones",
        D: "una niña juega la aventura de texto sin leer las instrucciones",
        P: "una niña juega la aventura sin leer las instrucciones"
      } },
      { l: {
        C: "escribe lo que quiere y el juego a veces le contesta",
        P: "escribe lo que quiere y a veces el juego le contesta",
        R: "la niña le escribía cualquier cosa a la máquina y se moría de risa"
      } },
      { l: {
        C: "encuentra en veinte minutos dos errores que no vimos en tres semanas",
        D: "encuentra en veinte minutos dos errores que no vimos en tres semanas",
        O: "encuentra en veinte rninutos dos errores que no virnos en tres sernanas"
      } },
      { blanco: 1 },
      { l: {
        C: "una señora usa el correo para escribirle a su hijo",
        D: "una señora usa el correo para escribirle a su hijo",
        P: "una señora usa el correo para escribir a su hijo"
      } },
      { l: {
        C: "no viene a ver arte: viene a mandar un mensaje y el mensaje es urgente",
        P: "no viene a ver arte: viene a mandar algo urgente",
        R: "una mujer mayor mandó un correo de verdad. eso fue lo mejor de la noche."
      } },
      { l: {
        C: "le doy la estación 4 y me quedo de espaldas",
        D: "le doy la estación 4 y me quedo de espaldas",
        P: "le doy la estación 4 y me pongo de espaldas"
      } },
      { blanco: 1 },
      { l: {
        C: "un hombre pregunta dónde está el arte",
        D: "un hombre pregunta dónde está el arte"
      } },
      { l: {
        C: "mientras lo pregunta tapa la ventilación de un monitor con el abrigo",
        P: "mientras pregunta tapa con el abrigo la ventilación de un monitor",
        O: "rnientras pregunta tapa con eI abrigo Ia ventiIación de un rnonitor"
      } },
      { l: {
        C: "no le contesto: muevo el abrigo",
        D: "no le contesto: muevo el abrigo",
        R: "y ella no le contestó, nomás le quitó el abrigo de encima. buenísimo."
      } }
    ],
    notas: [
      { m: "ED", t: "Pieza más larga conservada. También la de mayor acuerdo entre testimonios: cuatro de cinco coinciden en la estructura y en el orden de las tres visitas." },
      { m: "M97", t: "Poner que la niña rompió el juego. No poner su nombre." },
      { m: "ED", t: "No hay nombre en ningún testimonio. La instrucción se cumplió y no sabemos quién era." },
      { m: "OTRA MANO", t: "yo era la niña" },
      { m: "ED", t: "Esa nota está escrita a lápiz en una fotocopia de [[T:P]] que llegó al archivo en 2014 desde una dirección de Kreuzberg, sin remitente. No se ha podido verificar ni descartar. Se conserva en su sitio." }
    ]
  },

  {
    n: 22, folio: "11v", titulo: "view-source", estado: "restituible",
    versos: [
      { l: {
        C: "un visitante abre el código fuente de la página",
        D: "un visitante abre el código fuente de la página",
        P: "un visitante abre el código de la página"
      } },
      { l: {
        C: "y lee los comentarios que dejamos para nosotras",
        P: "y lee los comentarios que dejamos para nosotras",
        O: "y Iee Ios cornentarios que dejarnos para nosotras"
      } },
      { blanco: 1 },
      { l: {
        C: "arreglar esto antes del viernes",
        D: "arreglar esto antes del viernes"
      } },
      { l: {
        C: "no tocar, no sé por qué funciona",
        D: "no tocar, no sé por qué funciona",
        P: "no tocar: no sé por qué funciona"
      } },
      { l: {
        C: "aquí iba la foto de todas",
        D: "aquí iba la foto de todas",
        R: "había un comentario que decía dónde iba la foto que nunca pusimos"
      } },
      { blanco: 1 },
      { l: {
        C: "se ríe y me dice que ésa es la obra",
        P: "se ríe y me dice que ésa es la obra",
        O: "se ríe y rne dice que ésa es Ia obra"
      } },
      { l: {
        C: "le digo que ésa es la lista de pendientes",
        D: "le digo que ésa es la lista de pendientes"
      } },
      { l: {
        C: "los dos tenemos razón y sólo uno se va a poder ir a dormir",
        P: "los dos tenemos razón y sólo uno se va a ir a dormir",
        R: "le contestó que era la lista de cosas por hacer. y que ella no se iba a dormir."
      } }
    ],
    notas: [
      { m: "ED", t: "El visitante aparece en [[T:C]] como «A.» y en [[T:P]] sin nombre. En [[T:R]] es «el ruso, o el que decían que era el ruso»." },
      { m: "M97", t: "A. miró los botones como si ya fueran cuadros." },
      { m: "M?", t: "¿A. era Alexei o Andrei?" },
      { m: "ED", t: "El aparato no ofrece certificado. En 1997 existía una obra hecha con elementos de formulario HTML —Form Art, de Alexei Shulgin—: eso está documentado. Que su autor estuviera en esta sala esa noche, no." },
      { m: "↳", t: "La tarjeta con las palabras A. / FORM? se conserva. Es todo lo que queda de [[23]]." }
    ]
  },

  {
    n: 23, folio: "12r", titulo: "A. / FORM?", estado: "fragmentaria",
    versos: [
      { l: {
        P: "un menú desplegable es una lista que decidió esconderse",
        O: "un rnenú despIegabIe es una Iista que decidió esconderse"
      } }
    ],
    notas: [
      { m: "ED", t: "Único verso. Está escrito al dorso de una tarjeta que dice, por delante, A. / FORM?. La letra del verso no es la de la tarjeta." },
      { m: "R", t: "«Eso lo dijo él y ella lo apuntó. O lo dijo ella y él lo apuntó. Estábamos todos hablando encima.»" }
    ]
  },

  {
    n: 24, folio: "12v", titulo: "dónde está el arte", estado: "perdida",
    versos: [],
    notas: [
      { m: "ED", t: "Título en el índice. Sin testimonio. La pregunta que la titula sí sobrevive, dentro de [[21]], donde no se contesta." },
      { m: "M?", t: "La escribí y la saqué el mismo día. Contestaba demasiado." }
    ]
  },

  {
    n: 25, folio: "13r", titulo: "cola de impresión", estado: "restituible",
    versos: [
      { l: {
        C: "no hay obras: hay trabajos",
        D: "no hay obras: hay trabajos",
        P: "no hay obras, hay trabajos"
      } },
      { blanco: 1 },
      { l: {
        C: "007 CUSCO 21:03 14K imprimiendo",
        D: "007 CUSCO 21:03 14K imprimiendo"
      } },
      { l: {
        C: "008 SANCRIS 21:07 2K retenido",
        D: "008 SANCRIS 21:07 2K retenido"
      } },
      { l: {
        C: "009 BERLIN 21:11 61K en cola",
        D: "009 BERLIN 21:11 61K en cola",
        O: "009 BERLlN 21:11 61K en coIa"
      } },
      { l: {
        D: "013 —— 21:14 0K recibido",
        P: "013 —— 21:14 0K recibido"
      } },
      { blanco: 1 },
      { l: {
        C: "el trabajo 013 no tiene origen y pesa cero",
        D: "el trabajo 013 no tiene origen y pesa cero",
        P: "el 013 no tiene origen y pesa cero"
      } },
      { l: {
        C: "está en la cola desde las nueve y catorce",
        D: "está en la cola desde las nueve y catorce"
      } },
      { l: {
        C: "nadie lo cancela",
        D: "nadie lo cancela",
        R: "nadie lo quitó. le tomamos cariño, la verdad."
      } },
      { blanco: 1 },
      { l: {
        C: "un estado no es una descripción: es una promesa con hora",
        P: "un estado no es una descripción sino una promesa con hora",
        O: "un estado no es una descripción sino una prornesa con hora"
      } }
    ],
    notas: [
      { m: "ED", t: "El trabajo 013 aparece en los cinco testimonios y en el registro de máquina de [[T:D]]. Es decir: existió como entrada en la cola. Su origen es lo que no existe." },
      { m: "MÁQUINA", t: "QUEUE.LOG 21:14:02 — job 013 received from (null), 0 bytes, retained." },
      { m: "M?", t: "Alguien mandó un trabajo vacío para ver si llegaba. Nunca supimos quién y era la mejor pieza de la noche." },
      { m: "ED", t: "O el spool escribió una línea sobre sí mismo. Las dos explicaciones tienen la misma evidencia: una línea de registro." }
    ]
  },

  {
    n: 26, folio: "13v", titulo: "Cusco por bandas", estado: "restituible",
    versos: [
      { l: {
        C: "la imagen llega en cuatro paquetes y sale en cuatro densidades",
        D: "la imagen llega en cuatro paquetes y sale en cuatro densidades",
        P: "la imagen llega en cuatro paquetes y sale en cuatro densidades"
      } },
      { l: {
        C: "la hoja es más oscura arriba que abajo",
        D: "la hoja es más oscura arriba que abajo",
        O: "Ia hoja es rnás oscura arriba que abajo"
      } },
      { l: {
        C: "y esa diferencia es el viaje, no el dibujo",
        P: "y esa diferencia es el viaje, no el dibujo",
        R: "decía que lo interesante era que se veía el viaje en la tinta"
      } },
      { blanco: 1 },
      { l: {
        C: "Rosa manda instrucciones antes que imágenes",
        D: "Rosa manda instrucciones antes que imágenes",
        P: "manda instrucciones antes que imágenes"
      } },
      { l: {
        C: "imprimir sin corregir el contraste",
        D: "imprimir sin corregir el contraste"
      } },
      { l: {
        C: "no centrar",
        D: "no centrar",
        P: "no centrar"
      } },
      { l: {
        C: "si se atasca, dejarla atascada un minuto y después seguir",
        P: "si se atasca, dejarla atascada un minuto y seguir",
        O: "si se atasca, dejarIa atascada un rninuto y seguir"
      } },
      { blanco: 1 },
      { l: {
        C: "escaneamos lo que salió y se lo devolvemos deformado",
        D: "escaneamos lo que salió y se lo devolvemos deformado",
        P: "escaneamos lo que salió y se lo devolvemos deformado"
      } },
      { l: {
        C: "ella responde a la deformación, no a la imagen",
        P: "ella responde a la deformación, no a la imagen",
        R: "y lo que mandaba después contestaba a lo que le habíamos roto"
      } },
      { l: {
        C: "en ninguna de las tres ciudades existe el original",
        D: "en ninguna de las tres ciudades existe el original",
        O: "en ninguna de Ias tres ciudades existe eI originaI"
      } }
    ],
    notas: [
      { m: "ED", t: "El nombre Rosa aparece sólo en [[T:C]] y [[T:D]]. Los testimonios impresos lo omiten. Se conserva: la artista de Cusco tenía nombre y la costumbre de las crónicas europeas era no escribirlo." },
      { m: "M97", t: "Instrucción de Rosa, textual: no me arreglen la impresión." },
      { m: "ED", t: "Las prácticas de transmisión remota entre artistas —fax art, arte telemático— tenían ya más de una década en 1997. Esta pieza no inaugura nada y no pretende hacerlo. Documenta un turno de trabajo." }
    ]
  },

  {
    n: 27, folio: "14r", titulo: "San Cristóbal: intervalos", estado: "restituible",
    versos: [
      { l: {
        C: "de allá llegan palabras y silencios medidos",
        D: "de allá llegan palabras y silencios medidos",
        P: "de allá llegan palabras y silencios medidos"
      } },
      { l: {
        C: "el silencio también ocupa hoja",
        D: "el silencio también ocupa hoja",
        O: "eI siIencio tarnbién ocupa hoja"
      } },
      { blanco: 1 },
      { l: {
        C: "entre las páginas viene un fragmento de un comunicado",
        D: "entre las páginas viene un fragmento de un comunicado",
        P: "entre las páginas viene un fragmento de un comunicado"
      } },
      { l: {
        C: "y viene con su cadena: quién lo escribió, quién lo tradujo,",
        P: "y viene con su cadena: quién lo escribió, quién lo tradujo,"
      } },
      { l: {
        C: "quién lo tecleó, quién pagó la llamada, quién lo reenvió",
        D: "quién lo tecleó, quién pagó la llamada, quién lo reenvió",
        O: "quién Io tecIeó, quién pagó Ia IIarnada, quién Io reenvió"
      } },
      { blanco: 1 },
      { l: {
        C: "aquí decimos que la selva entró directo al módem",
        D: "aquí decimos que la selva entró directo al módem",
        R: "aquí en Berlín se decía esa frase, sí. la de la selva y el módem."
      } },
      { l: {
        C: "y en medio había catorce pasos",
        D: "y en medio había catorce pasos",
        P: "y en medio hubo catorce pasos"
      } },
      { l: {
        C: "trece de ellos son personas",
        D: "trece de ellos son personas",
        P: "trece de ellos son personas"
      } },
      { blanco: 1 },
      { l: {
        C: "no imprimimos lo que no pudimos rastrear",
        D: "no imprimimos lo que no pudimos rastrear",
        O: "no irnprirnirnos Io que no pudirnos rastrear"
      } },
      { l: {
        C: "eso también fue una decisión estética",
        P: "eso también fue una decisión estética",
        R: "hubo cosas que decidieron no imprimir. hubo discusión."
      } }
    ],
    notas: [
      { m: "ED", t: "En septiembre de 1997 el levantamiento de 1994 tiene tres años y los Acuerdos de San Andrés, uno. No es mitología: es correo reciente." },
      { m: "ED", t: "La circulación internacional de los comunicados zapatistas ocurrió por redes digitales y, de manera decisiva, por cadenas humanas de retransmisión, traducción y solidaridad. La cuenta de los catorce pasos que hace el poema es la parte que el entusiasmo de la época solía saltarse." },
      { m: "M97", t: "Preguntar a G. si podemos imprimir el segundo texto. Si no contesta hoy, no se imprime." },
      { m: "ED", t: "No contestó. No se imprimió. El hueco correspondiente en el papel continuo se conserva y mide once centímetros." },
      { m: "M?", t: "Once centímetros de no hacer algo. Es lo único de esa noche de lo que estoy segura." }
    ]
  },

  {
    n: 28, folio: "14v", titulo: "el atasco de las 21:17", estado: "restituible",
    versos: [
      { l: {
        C: "la impresora se traba con la hoja a medio salir",
        D: "la impresora se traba con la hoja a medio salir",
        P: "la impresora se traba con la hoja a medio salir"
      } },
      { l: {
        C: "el papel está caliente y toda la sala lo mira",
        D: "el papel está caliente y toda la sala lo mira",
        O: "eI papeI está caIiente y toda Ia saIa Io rnira"
      } },
      { l: {
        C: "es lo más parecido a una obra que ha pasado en tres horas",
        P: "es lo más parecido a una obra que pasó en tres horas",
        R: "cuando se atascó, todo el mundo se juntó ahí. fue el momento."
      } },
      { blanco: 1 },
      { l: {
        C: "abrir la máquina, ¿es reparar o es interrumpir?",
        D: "abrir la máquina, ¿es reparar o es interrumpir?",
        P: "abrir la máquina: ¿reparar o interrumpir?"
      } },
      { blanco: 1 },
      { l: {
        C: "de Cusco llega CONTINÚEN",
        D: "de Cusco llega CONTINÚEN",
        P: "de Cusco llega CONTINÚEN"
      } },
      { l: {
        C: "de San Cristóbal: EL ATASCO TAMBIÉN LLEGÓ AQUÍ",
        D: "de San Cristóbal: EL ATASCO TAMBIÉN LLEGÓ AQUÍ",
        O: "de San Cristóbal: EL ATASCO TAMBlÉN LLEGÓ AQUÍ"
      } },
      { blanco: 1 },
      { l: {
        C: "abro la tapa",
        D: "abro la tapa"
      } },
      { l: {
        C: "la hoja tiene algo escrito en el margen que no mandó nadie",
        P: "la hoja tiene algo escrito en el margen que no mandó nadie",
        R: "en la orilla del papel había una frase. no era de ninguno de los dos envíos."
      } },
      { laguna: 41 },
      { l: {
        C: "cierro la tapa sin sacar la hoja",
        D: "cierro la tapa sin sacar la hoja",
        P: "cierro la tapa sin sacar la hoja"
      } }
    ],
    notas: [
      { m: "ED", t: "El centro del libro y su mayor pérdida. La laguna del verso 9 mide 41 signos: exactamente la del verso 7 de [[1]]." },
      { m: "ED", t: "Los editores de 2003 concluyeron que era el mismo verso y lo imprimieron dos veces, restituido en ambos lugares. El texto que imprimieron no procede de ningún testimonio: lo escribieron ellos." },
      { m: "M?", t: "No era el mismo verso. Eran el mismo tamaño de agujero, que no es lo mismo. Un agujero no tiene contenido: tiene medida." },
      { m: "R", t: "«Leyó lo del margen en voz alta y después cerró la impresora. Nadie le pidió que la abriera otra vez. Yo creo que ni ella se acordaba al día siguiente.»" },
      { m: "ED", t: "El rumor de que las tres impresoras se atascaron a la misma hora en las tres ciudades circula desde 2004 y no tiene ningún soporte. Se registra aquí como lo que es: una leyenda que el libro produjo después de perderse." }
    ]
  },

  /* ============ CUADERNILLO IV — speichern ============ */

  {
    n: 29, folio: "15r", titulo: "saturación", estado: "fragmentaria",
    versos: [
      { l: {
        P: "a las once ya nadie sabe qué es la obra y qué es la documentación",
        O: "a Ias once ya nadie sabe qué es Ia obra y qué es Ia docurnentación"
      } },
      { l: {
        R: "y a nadie le importaba, ésa es la parte que no se cuenta nunca"
      } }
    ],
    notas: [
      { m: "ED", t: "El primer verso está en [[T:P]] y en su lectura mecánica. El segundo existe únicamente en [[T:R]]: Hanna lo da como verso y podría ser suyo." },
      { m: "R", t: "«No sé si eso lo escribió ella o lo estoy diciendo yo ahora. Déjalo con mi nombre, mejor.»" },
      { m: "ED", t: "Se deja con su nombre. Es la única atribución del libro pedida por la testigo." }
    ]
  },

  {
    n: 30, folio: "15v", titulo: "la estación que siguió mostrando la caché", estado: "restituible",
    versos: [
      { l: {
        C: "la estación 9 pierde la red y no se entera",
        D: "la estación 9 pierde la red y no se entera",
        P: "la estación 9 pierde la red y no se entera"
      } },
      { l: {
        C: "sigue mostrando la página que ya no está en ninguna parte",
        D: "sigue mostrando la página que ya no está en ninguna parte",
        O: "sigue rnostrando Ia página que ya no está en ninguna parte"
      } },
      { blanco: 1 },
      { l: {
        C: "dos visitantes la leen completa",
        D: "dos visitantes la leen completa",
        P: "dos visitantes la leen entera"
      } },
      { l: {
        C: "discuten sobre ella",
        D: "discuten sobre ella"
      } },
      { l: {
        C: "uno la copia a mano en una servilleta",
        P: "uno la copia a mano en una servilleta",
        R: "un muchacho copió un texto en una servilleta. eso lo vi yo."
      } },
      { blanco: 1 },
      { l: {
        C: "la página existió mientras alguien la leía",
        D: "la página existió mientras alguien la leía",
        P: "la página existió mientras alguien la leía"
      } },
      { l: {
        C: "que es más de lo que puede decirse de casi todo",
        P: "que es más de lo que puede decirse de casi todo",
        O: "que es rnás de Io que puede decirse de casi todo",
        R: "y decía que eso ya era bastante"
      } },
      { blanco: 1 },
      { l: {
        C: "no reinicio la máquina hasta las dos",
        D: "no reinicio la máquina hasta las dos"
      } },
      { l: {
        C: "no por respeto: por no interrumpir una conversación",
        P: "no por respeto sino por no interrumpir una conversación",
        R: "no la apagó porque estaban platicando. así de simple."
      } }
    ],
    notas: [
      { m: "ED", t: "La servilleta no se conserva. Se conserva la mención en tres testimonios independientes, lo que es más de lo que puede decirse de casi todo." },
      { m: "M?", t: "La página era mía. Es la única obra mía que alguien copió a mano." },
      { m: "ED", t: "En [[T:C]] esa nota está escrita y después tachada, y después escrita otra vez debajo, igual." }
    ]
  },

  {
    n: 31, folio: "16r", titulo: "se fue sin despedirse", estado: "fragmentaria",
    versos: [
      { l: {
        C: "no es un final: es que había un tren",
        P: "no es un final: había un tren",
        R: "se fue porque tenía tren. no fue drama. después sí fue drama."
      } }
    ],
    notas: [
      { m: "ED", t: "Un verso. La pieza figura en el índice con doce líneas —Mara numeraba— y once no existen." },
      { m: "M97", t: "No escribir esto hoy. Escribirlo cuando ya no duela o cuando duela distinto." },
      { m: "ED", t: "La nota está fechada por Mara: 5.IX. El verso conservado, en la misma página, no tiene fecha. No sabemos cuál de los dos se escribió primero." }
    ]
  },

  {
    n: 32, folio: "16v", titulo: "llamada a Constanța", estado: "fragmentaria",
    versos: [
      { l: {
        D: "marco a las once y no contesta nadie porque allá es más tarde",
        O: "rnarco a Ias once y no contesta nadie porque aIIá es rnás tarde"
      } },
      { l: {
        D: "marco a las doce y contesta Ileana con la voz de haber estado dormida"
      } }
    ],
    notas: [
      { m: "ED", t: "Dos versos en [[T:D]], donde el archivo se corta. El sector siguiente está muerto." },
      { m: "ED", t: "Lo que decía el resto lo sabemos por [[33]], que existe entero. Es el único caso del libro en que la continuación sobrevive y el poema no." },
      { m: "M?", t: "Constanța está una hora adelante. Toda la noche calculé mal en la misma dirección." }
    ]
  },

  {
    n: 33, folio: "17r", titulo: "el perro cenó", estado: "restituible",
    versos: [
      { l: {
        C: "pregunto por él antes que por nadie",
        D: "pregunto por él antes que por nadie",
        P: "pregunto por él antes que por nadie"
      } },
      { l: {
        C: "Ileana dice: comió, y está debajo de la mesa",
        D: "Ileana dice: comió, y está debajo de la mesa",
        O: "IIeana dice: cornió, y está debajo de Ia rnesa"
      } },
      { l: {
        C: "cerca del teléfono",
        D: "cerca del teléfono",
        R: "el perro estaba junto al teléfono. eso lo contó como cinco veces."
      } },
      { blanco: 1 },
      { l: {
        C: "cuelgo y vuelvo a la sala",
        D: "cuelgo y vuelvo a la sala",
        P: "cuelgo y vuelvo a la sala"
      } },
      { l: {
        C: "aquí hay ochenta personas hablando de comunicación planetaria",
        D: "aquí hay ochenta personas hablando de comunicación planetaria",
        P: "aquí hay ochenta personas hablando de comunicación planetaria"
      } },
      { blanco: 1 },
      { l: {
        C: "la noticia más importante de la noche",
        D: "la noticia más importante de la noche",
        O: "Ia noticia rnás irnportante de Ia noche"
      } },
      { l: {
        C: "es que el perro cenó",
        D: "es que el perro cenó",
        P: "es que el perro cenó",
        R: "que el perro había cenado. y lo dijo en serio, no de broma."
      } },
      { blanco: 1 },
      { l: {
        C: "no lo escribo para que sea gracioso",
        P: "no lo escribo para que sea gracioso"
      } },
      { l: {
        C: "lo escribo porque es la información que viajó mil quinientos kilómetros",
        P: "lo escribo porque es la información que cruzó mil quinientos kilómetros",
        O: "Io escribo porque es Ia inforrnación que cruzó rniI quinientos kiIórnetros"
      } },
      { l: {
        C: "y llegó completa",
        D: "y llegó completa",
        R: "y llegó entera. eso último lo dijo despacio."
      } }
    ],
    notas: [
      { m: "ED", t: "Única pieza del libro conservada íntegra en cuatro testimonios, sin lagunas y con variantes menores. También la más citada por quienes conocieron el poemario sin haberlo leído." },
      { m: "K", t: "Kifli: bollo con forma de media luna. Se lo pusieron por la manera en que dormía." },
      { m: "ED", t: "Kifli murió en 2003 en Constanța, con Ileana. El dato no pertenece al libro y se registra aquí porque el libro lo va a hacer inevitable." },
      { m: "M?", t: "Todo el poemario iba a llamarse así hasta la semana anterior. Cambié el título porque me pareció que un libro no puede llamarse por lo único que salió bien." }
    ]
  },

  {
    n: 34, folio: "17v", titulo: "nadie apague todavía", estado: "restituible",
    versos: [
      { l: {
        C: "lo digo tres veces esta noche y significa tres cosas",
        D: "lo digo tres veces esta noche y significa tres cosas",
        P: "lo digo tres veces esta noche y significa tres cosas"
      } },
      { blanco: 1 },
      { l: {
        C: "a las siete: no apaguen, todavía estoy copiando",
        D: "a las siete: no apaguen, todavía estoy copiando",
        O: "a Ias siete: no apaguen, todavía estoy copiando"
      } },
      { l: {
        C: "a las once: no apaguen, la señora no ha terminado su correo",
        D: "a las once: no apaguen, la señora no ha terminado su correo",
        P: "a las once: no apaguen, la señora no terminó su correo"
      } },
      { l: {
        C: "a las dos: no apaguen",
        D: "a las dos: no apaguen",
        R: "y la tercera vez ya no dijo por qué. sólo dijo no apaguen."
      } },
      { blanco: 1 },
      { l: {
        C: "la tercera no tiene explicación detrás",
        P: "la tercera no lleva explicación detrás",
        O: "Ia tercera no IIeva expIicación detrás"
      } },
      { l: {
        C: "la digo mirando a alguien que se va mañana",
        P: "la digo mirando a alguien que se va mañana",
        R: "lo dijo mirando a la que se iba. todos entendimos y nadie dijo nada."
      } },
      { blanco: 1 },
      { l: {
        C: "una instrucción técnica repetida suficientes veces",
        D: "una instrucción técnica repetida suficientes veces",
        P: "una instrucción técnica repetida suficientes veces"
      } },
      { l: {
        C: "se convierte en la manera de decir lo que no sabemos decir",
        P: "se convierte en la manera de decir lo que no sabemos decir",
        O: "se convierte en Ia rnanera de decir Io que no saberrios decir"
      } },
      { blanco: 1 },
      { laguna: 24 },
      { l: {
        D: "y las máquinas obedecen la primera acepción",
        R: "algo de que las máquinas sólo entienden el primer sentido"
      } }
    ],
    notas: [
      { m: "ED", t: "Pieza que da título al conjunto. El título aparece en el índice —al dorso del plano— con letra más grande y subrayado dos veces." },
      { m: "ED", t: "El halo oscuro que atraviesa esta hoja en [[T:P]] es el círculo de café de [[16]], trasladado por seis años de fotocopias. Ya no es una mancha: es una propiedad del papel." },
      { m: "M?", t: "Tres veces, tres sentidos, y el tercero es el único que iba dirigido a una persona. Ella no lo oyó. Estaba abajo, desconectando." },
      { m: "R", t: "«Sí lo oí.»" },
      { m: "ED", t: "Las dos notas anteriores están separadas por catorce años y una de ellas contesta a la otra. El aparato las deja juntas porque es el único lugar donde pueden estarlo." }
    ]
  },

  {
    n: 35, folio: "18r", titulo: "nueve monitores obedecen", estado: "fragmentaria",
    versos: [
      { l: {
        C: "apagamos nueve y el décimo tarda",
        D: "apagamos nueve y el décimo tarda",
        P: "apagamos nueve y el décimo tarda"
      } },
      { l: {
        C: "un punto blanco en el centro que no termina de irse",
        O: "un punto bIanco en eI centro que no terrnina de irse",
        R: "quedaba un puntito blanco en medio de la pantalla, sí, así eran"
      } }
    ],
    notas: [
      { m: "ED", t: "Dos versos de una pieza que el índice numera con nueve. Los siete restantes no existen en ningún soporte." },
      { m: "M97", t: "Uno por monitor. El décimo se queda sin verso a propósito." },
      { m: "ED", t: "Si la instrucción anterior se cumplió, la pieza tenía nueve versos para diez monitores, y lo que falta —siete— no incluye el décimo, que nunca se escribió. La pérdida y el hueco deliberado son indistinguibles en el resultado, y no lo son en absoluto." }
    ]
  },

  {
    n: 36, folio: "18v", titulo: "disquete sin etiqueta", estado: "fragmentaria",
    versos: [
      { l: {
        C: "escribir el nombre es la parte que se olvida",
        D: "escribir el nombre es la parte que se olvida",
        O: "escribir eI nornbre es Ia parte que se oIvida"
      } }
    ],
    notas: [
      { m: "ED", t: "Un verso. Está en el testimonio que él mismo describe: [[T:D]] es el disquete sin etiqueta." },
      { m: "M?", t: "Once tenían nombre. El once no." },
      { m: "ED", t: "El disquete se llama once porque llegó al archivo en una caja con otros diez, no porque nadie lo numerara. El nombre que usamos para el testigo se lo pusimos nosotros, aquí, en esta edición. También esto es una restitución." }
    ]
  },

  /* ============ CUADERNILLO V — morgen ============ */

  {
    n: 37, folio: "19r", titulo: "procedimiento", estado: "restituible",
    versos: [
      { l: {
        C: "guardar",
        D: "guardar",
        P: "guardar"
      } },
      { l: {
        C: "expulsar",
        D: "expulsar",
        P: "expulsar"
      } },
      { l: {
        C: "escribir el nombre",
        D: "escribir el nombre",
        P: "escribir el nombre"
      } },
      { l: {
        C: "llevar una copia a otra casa",
        D: "llevar una copia a otra casa",
        P: "llevar una copia a otra casa",
        O: "IIevar una copia a otra casa"
      } },
      { l: {
        C: "acordarse mañana de qué se quiso guardar",
        D: "acordarse mañana de qué se quiso guardar",
        R: "y al final: acordarse mañana de qué querías guardar. ésa me la sé."
      } },
      { blanco: 1 },
      { l: {
        C: "de los cinco pasos hacemos cuatro",
        D: "de los cinco pasos hacemos cuatro",
        P: "de los cinco pasos hicimos cuatro"
      } },
      { l: {
        C: "el que falta no es el tercero",
        P: "el que falta no es el tercero",
        O: "eI que faIta no es eI tercero"
      } },
      { l: {
        C: "es el quinto",
        D: "es el quinto",
        R: "el que no hicimos fue el último. acordarnos."
      } }
    ],
    notas: [
      { m: "ED", t: "Instrucción afectiva en forma de procedimiento técnico. Los cinco pasos coinciden en todos los testimonios; los tres versos finales, no: [[T:D]] los tiene, [[T:C]] los tiene tachados con una raya, [[T:P]] no los imprime." },
      { m: "M97", t: "Quitar los últimos tres. Explican." },
      { m: "ED", t: "No se quitan. Sin ellos el poema es una instrucción; con ellos es un balance. Esta edición prefiere el balance y declara que está prefiriendo." },
      { m: "OTRA MANO", t: "el tercero tampoco lo hicieron. el once no tiene etiqueta." }
    ]
  },

  {
    n: 38, folio: "19v", titulo: "notas del autor, 2001", estado: "fragmentaria",
    versos: [
      { l: {
        D: "esto lo escribo cuatro años después dentro de una copia cerrada en 1997",
        O: "esto Io escribo cuatro años después dentro de una copia cerrada en 1997"
      } }
    ],
    notas: [
      { m: "ED", t: "El archivo que contiene este verso está dentro de [[T:D]], cuya última escritura registrada es del 06.09.97 a las 02:41. La fecha interna del archivo es 14.03.01." },
      { m: "ED", t: "Un disquete puede reescribirse. La explicación aburrida es que alguien lo abrió en 2001 y guardó algo dentro. Ninguna otra huella de esa apertura existe: el resto de los archivos conserva su fecha." },
      { m: "M?", t: "Yo no fui." },
      { m: "ED", t: "El poema que crea la evidencia de la que dice provenir. Se marca aquí como lo que es —hiperstición— y se conserva en el cuerpo con su ambigüedad intacta, porque quitarla sería editar el problema en vez de editar el libro." }
    ]
  },

  {
    n: 39, folio: "20r", titulo: "index.html", estado: "perdida",
    versos: [],
    notas: [
      { m: "ED", t: "Título en el índice. Sin testimonio de ninguna clase." },
      { m: "MÁQUINA", t: "El archivo homónimo en [[T:D]] contiene 812 bytes de HTML incompleto. Una etiqueta de lista abierta y nunca cerrada. No es un poema: es una página que quedó a medio escribir." },
      { m: "ED", t: "Salvo que el índice la numere entre los poemas, con folio, como a las demás. El índice está escrito a mano y no distingue entre lo que era poema y lo que era archivo. Puede que Mara tampoco." }
    ]
  },

  {
    n: 40, folio: "20v", titulo: "morgen", estado: "sin_testimonio",
    versos: [],
    notas: [
      { m: "ED", t: "Último título del índice. No se conserva ni una palabra, ni una cita, ni una mención en [[T:R]]. De las cuarenta piezas del libro, es la única de la que no sabemos absolutamente nada excepto que Mara la contó." },
      { m: "ED", t: "El aparato ha llegado hasta aquí restituyendo con testimonios. Aquí no hay ninguno. Cualquier cosa que aparezca en este folio la habrá puesto quien lee." },
      { m: "M?", t: "morgen no es una carpeta." }
    ]
  }

  ];

  return {
    testigos: testigos,
    cuadernillos: cuadernillos,
    piezas: piezas,
    obra: {
      titulo: "NADIE APAGUE TODAVÍA",
      autora: "Mara Ionescu (atribuido)",
      lugar: "Berlín",
      anio: "1997",
      piezas: 40,
      nota: "no se conserva"
    }
  };
})();
