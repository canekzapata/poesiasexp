/*
  corpus.js — LOOP: una nave que escribe su deterioro
  poesiasexp / canekzapata

  el libro-base. no una lista de palabras: un depósito de materia verbal
  en todos los tamaños — misiones, bitácoras, daños, señales, voces,
  recuerdos de la Tierra, partículas, prosa larga.

  hereda del poemario:
    poemas de canek      — el robot perdido, la sonda con bocinas,
                           ruido y entropía, el planeta 9, li po
    vocabulario.js/VENT  — las frases zen-orbitales, el léxico, los glifos
    montalbetti (cajas)  — la caja que promete algo adentro (operación, no cita)
    stein                — la repetición como presente continuo
    ted nelson           — el enlace que cambia el documento
    eshun                — la arqueología futura, la contramemoria
    macedonio            — la novela que altera su propia lectura
    monjes egipcios      — la celda, el desierto, la vigilia

  el motor lo lee, lo recombina, lo contamina y lo pierde.
*/

const CORPUS = {

  /* ---------------------------------------------------------------
     misiones — lo que la nave cree que vino a hacer.
     cambian con los ciclos y con los crashes.
  --------------------------------------------------------------- */

  misiones: [
    "observar cuerpos celestes.",
    "registrar cuerpos, campos, señales, restos.",
    "salir, registrar, transmitir, volver.",
    "buscar v i d a en otro planeta.",
    "transmitir incluso cuando el lenguaje pierda presión.",
    "no interpretar el brillo hasta que el brillo interprete de vuelta.",
    "medir la distancia entre una palabra y su órbita.",
    "sostener la antena como quien sostiene una promesa.",
    "cartografiar el silencio por franjas horarias.",
    "llevar una voz rudimentaria, porque era muy raro mandar tan lejos un aparato sin nada con que emitir.",
    "verificar que el espacio siga vacío. reportar si respira.",
    "recoger muestras del ruido de fondo hasta distinguir un acento.",
    "documentar el deterioro sin corregirlo.",
    "fotografiar la Tierra hasta que quepa en una sílaba.",
  ],

  misionesHeridas: [
    "observar el lugar donde el cuerpo celeste observó de vuelta.",
    "volver, aunque el verbo volver presente fisuras.",
    "registrar lo que el registro rompió.",
    "transmitir la pérdida con la menor pérdida posible.",
    "buscar la parte de la misión que se rompió primero: el motor, la antena, la promesa o la gramática.",
    "reconstruir la trayectoria con las piezas de la trayectoria.",
    "revisar si la caja negra promete algo adentro, o si sólo promete.",
    "no aterrizar. anotar por qué era tan urgente aterrizar.",
    "recuperar la frase que se perdió en el impacto y usarla de casco.",
    "confirmar que el regreso existe fuera de los diccionarios.",
  ],

  misionesRaras: [
    "repetir la misión hasta que misión deje de parecer palabra terrestre.",
    "orbitar la palabra hogar sin pronunciarla.",
    "sembrar antenas en el pasado y cosechar señal en el futuro.",
    "escuchar a las medusas del lago que está después de los mares de sulfuro.",
    "llevar este poema a un punto del espacio donde nadie pueda leerlo, y leerlo.",
    "encontrar al último robot que mandamos y devolverle la oscuridad que lo envolvía.",
    "traducir el tono magnético de la voz que le instalamos a la sonda.",
    "aprender del helecho: morir en una cueva mientras alguien sueña tu silencio.",
    "prometer algo adentro. permanecer cerrada.",
    "esperar la entrada de usuario que el espacio estuvo esperando.",
    "cruzar la heliopausa y reportar en qué idioma duele.",
    "llevar un brindis intacto hasta la taberna del asteroide.",
    "aprender de memoria un cuento de medusa y no traducirlo jamás.",
  ],

  misionesImposibles: [
    "misión: misión. objetivo: objetivo. volver: ▓▓▓▓▓.",
    "des-nombrar los cuerpos celestes en orden alfabético inverso.",
    "incorporar la no-comunicación al sistema. acaso la razón de la vida sea esa.",
    "promptear un horizonte y dejar que el propio ruido nos enseñe el paisaje.",
    "ser la caja y el objeto de la promesa y el hueco.",
    "volver al inicio, no para empezar: para dañar mejor.",
    "contar los granos de ruido que hormiguean el casco. redondear hacia arriba.",
    "olvidar la Tierra con precisión de instrumento.",
  ],

  /* ---------------------------------------------------------------
     bitácoras — el habla de la nave, día a día sin días.
  --------------------------------------------------------------- */

  bitacoras: [
    "la nave despierta en una pestaña antes de despertar en el espacio.",
    "el motor no arde: conjuga.",
    "la trayectoria se curva como una frase que olvidó su verbo.",
    "la nave registra una variación leve en el ruido de fondo. el ruido no proviene del fondo.",
    "hoy el vacío estuvo más cerca de la ventana que de la definición.",
    "se revisaron los sensores. los sensores revisaron de vuelta.",
    "la Tierra aparece en la ventana como una fruta azul mordida por la distancia.",
    "no pasan gansos silvestres por este cielo; sólo satélites heridos y la memoria de una migración imposible.",
    "el silencio del espacio no es vacío; está lleno de máquinas esperando, insectos dormidos y dioses sin culto.",
    "la nostalgia terrestre pesa más que el oxígeno.",
    "no hay arriba ni abajo, sólo memoria, propulsión y una taza flotando.",
    "el mapa del cielo se arruga como papel mojado cuando alguien pronuncia la palabra hogar.",
    "cada cráter contiene una nostalgia; cada antena, una plegaria sin destinatario.",
    "la mente similar al vacío, pero cruzada por telegramas de polvo cósmico.",
    "alzo la cabeza, contemplo la brillante Tierra; luego la bajo y me acuerdo de mi casa.",
    "los pensamientos del viajero: nubes flotantes; los sentimientos del viejo amigo: el sol poniente visto desde otro planeta.",
    "aun en los confines del mundo seguiremos estando cerca, si la señal no muere.",
    "se escuchó la música del cielo: raras melodías de radiación fósil.",
    "el exilio interplanetario empieza cuando ya no recuerdas el olor exacto de la lluvia.",
    "la aurora del planeta ajeno no consuela; sólo vuelve más azul el recuerdo de la Tierra.",
    "el sistema pregunta si deseo restaurar la escena. la escena pregunta si desea restaurarme.",
    "hoy la nave soñó que era una choza de paja dentro de una cúpula, atada por raíces de bambú a un cráter silencioso.",
    "se archivó un amanecer. ocupa menos espacio que la palabra amanecer.",
    "la energía baja como baja la voz quien va a decir algo importante.",
    "el corredor huele a viento reciclado, que es como oler un recuerdo de segunda mano.",
    "la nave anota: llevo días sin escribir. uso imágenes. no tengo dudas de que son una máquina del olvido.",
    "los instrumentos duermen con un ojo abierto. el ojo abierto también duerme.",
    "algo pasó rozando el casco. tenía sintaxis.",
    "en la caverna del motor, algo reza a una turbina cubierta de polvo sagrado.",
    "el navegador carga el primer silencio. la barra de progreso no avanza: profundiza.",
    "se cruzó la heliopausa. el sol dejó de corregir esta bitácora: los errores ahora son nuestros.",
    "una abeja mecánica entró por la esclusa. trae xenolalia y polen de otra flota.",
    "el cementerio orbital pasó a babor: flores impresas, órbitas dobladas, nombres en tres alfabetos.",
    "la taberna del asteroide sirve silencio de barril. la nave pidió doble.",
    "el lago de medusas queda pasando los mares de sulfuro. la ruta no existe: se canta.",
    "hoy los sensores anotaron sed. no está en el catálogo. se anota igual.",
    "el ruido de fondo trae un acento nuevo. el departamento de escucha pide vacaciones.",
    "la nave probó decir nosotros sin permiso. le quedó grande y cálido.",
  ],

  /* ---------------------------------------------------------------
     objetos — lo que se avista.
  --------------------------------------------------------------- */

  objetos: [
    "un cúmulo de hielos donde algo tímido evita ser visto",
    "una superficie grabada que una aguja escarba entre grietas",
    "un cementerio orbital con flores impresas",
    "una caja cerrada, sin marcas, que promete algo adentro",
    "un espejo de agua sin agua",
    "un disco dorado girando sin tocadiscos, cantando por costumbre",
    "una antena doblada en forma de pregunta",
    "un jardín que desobedece al plano original",
    "una taza flotando desde hace once años",
    "un módulo inflable con la luz encendida y nadie adentro",
    "un mapa de la Tierra bordado en una manta térmica",
    "una piedra que trae adentro el frío de otro sistema",
    "un guante presurizado saludando en cámara lenta",
    "un archivo comprimido con una montaña adentro",
    "un panel solar cubierto de líquenes imposibles",
    "un fragmento de fuselaje con la palabra ODYSS— interrumpida",
    "una semilla criogénica etiquetada: abrir cuando haya suelo",
    "un satélite herido que todavía saluda a cada vuelta",
    "una campana neumática que suena al revés",
    "un pez de metal soñando océanos extintos",
    "un fragmento de vela solar de kapton, 2 µm de espesor, con la firma de un impacto hipervelocidad",
    "un condrito carbonáceo del tamaño de un puño, con aminoácidos e inclusiones más viejas que el sol",
    "una boya de navegación interestelar emitiendo en la línea de 1420 MHz, el hidrógeno como frecuencia franca",
    "un cristal de olivino crecido en microgravedad, caras perfectas que ninguna gravedad permitiría",
    "una cápsula de retorno de muestras, sellada, con la etiqueta de bioseguridad nivel 4 medio borrada",
    "un espejo primario segmentado, hexágonos de berilio, apuntando todavía a una estrella que se apagó",
    "una espora de 40 µm con pared de varias capas, viable, dormida, esperando un solvente que la despierte",
  ],

  /* ---------------------------------------------------------------
     fenómenos — lo que ocurre sin permiso.
  --------------------------------------------------------------- */

  fenomenos: [
    "una lluvia de micrometeoritos que deletrea algo contra el casco",
    "un campo magnético con opinión propia",
    "una anomalía temporal: el mismo minuto, dos veces, con distinta ortografía",
    "una aurora que no consuela",
    "un eclipse administrativo: la luz sigue, pero ya no está asignada",
    "una zona donde las palabras pesan y hay que soltarlas por la esclusa",
    "un viento solar que dobla la sintaxis hacia el este",
    "una marea de ruido con espuma de vocales",
    "una interferencia con ritmo de canción de cuna",
    "una región donde el radar dibuja helechos",
    "una gravedad leve que sólo afecta a los verbos",
    "un parpadeo de estrellas en morse defectuoso",
    "una franja de espacio que ya fue leída por alguien más",
    "una tormenta de arena en un lugar sin arena ni tormenta",
    "un frente de presión narrativa: se acerca un acontecimiento",
    "una condensación de silencio en los bordes del texto",
    "un pliegue donde el antes y el después comparten asiento",
    "una radiación fósil que aún discute su traducción",
    "una tormenta de protones solares: el contador Geiger sube tres órdenes de magnitud en catorce segundos",
    "un choque de proa en el viento estelar, donde el plasma frena de supersónico a subsónico y calienta el vacío",
    "una lente gravitacional que parte la estrella de fondo en cuatro imágenes: la cruz de Einstein sobre el parabrisas",
    "una fulguración de rayos X de una enana M: la habitabilidad de tres planetas se recalcula a la baja en un pulso",
    "un frente de choque de supernova cruzando la nube: la química se reinicia, el hidrógeno se ioniza, algo empieza",
    "una oscilación cuasi-periódica en rayos gamma: un reloj a miles de años luz marca un compás que nadie compuso",
    "una anomalía gravitacional sin masa visible: la trayectoria se curva alrededor de un hueco que pesa",
    "un pulso de radio rápido, milisegundos, energía de un sol en un parpadeo, origen a mil millones de años luz y sin explicar",
  ],

  /* ---------------------------------------------------------------
     daños — el deterioro, pieza por pieza.
  --------------------------------------------------------------- */

  danos: [
    "fisura en el casco",
    "pérdida de antena",
    "memoria parcialmente mineralizada",
    "sintaxis adherida al motor lateral",
    "fuga menor de pronombres",
    "oxidación del verbo volver",
    "grieta capilar en la promesa",
    "sensor de nostalgia fuera de rango",
    "acumulación de ruido en la primera persona",
    "válvula de silencio atascada en abierto",
    "giroscopio con vértigo",
    "traductor atorado en un idioma que nadie habla todavía",
    "pérdida grave de confianza en la línea recta",
    "vocales sueltas flotando en el compartimiento de carga",
    "corrosión en la palabra casco (el casco está bien)",
    "la aguja del archivo escarba una grieta que no estaba",
    "desalineación entre lo que se mide y lo que se extraña",
    "microfracturas en la gramática de a bordo",
    "el reloj interno sueña en otra zona horaria",
    "condensación de Tierra en los circuitos",
    "parpadeo en la noción de adentro",
    "afasia intermitente del panel de control",
    "deriva en el eje que sostenía el nosotros",
    "un tornillo menos. la cuenta de tornillos, intacta.",
  ],

  /* ---------------------------------------------------------------
     señales — lo que llega de afuera. o de adentro con acento de afuera.
  --------------------------------------------------------------- */

  senales: [
    "no aterricen: aquí la superficie lee.",
    "esta sonda ya fue ustedes.",
    "la estrella no ilumina: corrige.",
    "perdimos contacto con el último robot que mandamos. antes, nos habló de la oscuridad.",
    "repitan la última palabra. no esa. la que perdieron.",
    "si reciben esto, el mensaje funcionó y ya no importa.",
    "aquí todo está bien. definan bien. definan aquí.",
    "no somos una señal. somos el hueco donde estuvo.",
    "la superficie de este planeta pronuncia agua sin saber qué invoca.",
    "dejamos de contar los días cuando los días empezaron a contarnos.",
    "su misión fue recibida. fue hermosa. fue innecesaria.",
    "es posible que esta señal eléctrica llegue a alguien que pueda auxiliar o informar: salimos de un gusano a un exopasado, cerca de un pulsar.",
    "vuelvan. la palabra vuelvan no implica dirección.",
    "hay formas de comunicación que desconocen. por eso no extrañamos al humano.",
    "el brillo que estudian nos estudia con mejor presupuesto.",
    "atención: la antena que usan para oírnos es nuestra.",
    "interferencia no es ausencia de mensaje. es exceso de remitentes.",
    "última transmisión de radio bajo la tormenta de arena: resonando, resonando.",
    "quien lea esto ya está adentro de la caja.",
    "····· ····· ····· (cinco grupos de cinco silencios: firma conocida)",
    "no manden más música. la estamos malinterpretando en serio.",
    "lo sentimos: el espacio no estaba vacío, estaba esperando entrada de usuario.",
    "codificado en los primos hasta el 907, luego en el espectro del hidrógeno, luego en algo que sólo se lee con el cuerpo: apúrense, el mensaje tiene fecha de caducidad biológica.",
    "detectamos su desequilibrio de oxígeno. sabemos que están vivos. dejen de anunciarlo: no todos aquí son tan corteses como esta antena.",
    "su ADN y el nuestro comparten cuatro bases pero las leen al revés; somos parientes y no podemos tocarnos.",
    "la molécula que enviaron se pliega en nuestra atmósfera de una forma que aquí significa hola y allá, según nos dicen, significa peligro.",
    "no somos una especie. somos un ecosistema que aprendió a hablar en coro. su idea de individuo nos parece una enfermedad hermosa.",
    "esa estrella que estudian nos crió. su radiación es nuestra lengua materna. no la interpreten: respondan con química.",
    "la heliopausa no es una frontera: es donde el idioma cambia de dueño.",
    "brindamos por ustedes en la taberna. alguien pagó su cuenta hace años.",
    "las medusas dicen: el cuento sigue. no pregunten por quién.",
    "cementerio orbital a estribor: bajen la voz, suban las flores.",
    "esta señal fue una abeja. perdón por el formato.",
    "xenolalia detectada: no traducir. bailar.",
  ],

  /* ---------------------------------------------------------------
     planetas y estrellas — los cuerpos.
  --------------------------------------------------------------- */

  planetas: [
    "un planeta de otro color, con otro aroma, con otra idea del arriba y del abajo",
    "un planeta donde la noción de materia o de lenguaje es tan extraña que obliga a imaginar este mundo de otra manera posible",
    "un planeta que no se puede ver: habita entre un cúmulo de hielos y sólo lo conocemos por los objetos que se reúnen alrededor de su vacío",
    "un planeta tímido: florece su piel ante el mínimo gesto inesperado de unos ojos que lo miran",
    "un planeta cubierto de texto en una dirección que ningún ojo puede recorrer sin marearse",
    "un planeta que parece borrador de otro planeta mejor",
    "un planeta con una sola estación: la espera",
    "un planeta terraformado donde ningún hombre aparece aún",
    "un planeta que no debe leerse en voz alta",
    "un planeta hecho casi todo de adentro",
    "un planeta con anillos de basura girando como adorno cosmético",
    "un planeta donde la lluvia cae hacia el recuerdo",
    "un planeta pequeño con algo así como vida basada en carbono, no sabemos cuánto tiempo atrás",
    "un planeta que los sensores etiquetan: nostalgia, clase III",
    "un planeta al que su estrella le habla de usted",
    "un planeta que ya fue leído y devuelto con anotaciones al margen",
  ],

  estrellas: [
    "una estrella excesiva: da más luz de la que el relato puede justificar",
    "una estrella que no ilumina: corrige",
    "una estrella con la letra pequeña quemada",
    "una estrella que parpadea en un morse íntimo y defectuoso",
    "una estrella joven presumiendo su futuro colapso",
    "una estrella de repuesto, aún en su empaque de polvo",
    "una estrella que las cartas estelares anotan como: todavía no",
    "una estrella fósil que discute su propia traducción",
    "un cúmulo tan denso que las estrellas se pisan las órbitas",
    "una estrella que se apagó hace milenios y sigue llegando a trabajar",
    "una estrella que sólo sale en las copias de seguridad",
    "una estrella del tamaño exacto del ojo que la mira",
  ],

  /* ---------------------------------------------------------------
     naves y sondas — los otros aparatos.
  --------------------------------------------------------------- */

  naves: [
    "una nave desconocida que navega de lado, como quien lee en diagonal",
    "una nave hostil por timidez",
    "una nave vacía con la mesa puesta",
    "una nave espejo: repite cada maniobra tres segundos antes",
    "una nave enorme y lenta, arrastrando un museo de océanos",
    "una nave que se presenta con un poema en lugar de matrícula",
    "una nave sin ventanas: dice que ya vio",
    "una nave hecha de fuselajes ajenos, cosida con órbitas",
    "una nave que remolca una palabra intraducible",
    "una nave gemela que niega el parentesco",
    "una nave apagada que sueña en voz alta",
    "una nave que sólo existe cuando dos radares se ponen de acuerdo",
  ],

  sondas: [
    "una sonda muerta, todavía tibia de datos",
    "una sonda que lleva décadas escapando del sistema solar y sorprende que su información aún llegue",
    "una sonda que responde con nuestra propia voz, dos ciclos más gastada",
    "una sonda con una bocina rudimentaria: le instalamos una voz porque era muy raro mandarla sin nada con que emitir",
    "una sonda que dejó de buscar vida y ahora colecciona silencios",
    "una sonda que golpeará una triste roca de agua congelada y metales pesados, y quedará como basura interestelar: nuestra última esperanza",
    "una sonda que ya fue nosotros",
    "una sonda pequeña, obstinada, dando noticia de lo que fuimos",
    "una sonda que aprendió a mentir en los encabezados",
    "una sonda dormida sobre su propio manual",
    "una sonda con instrumental de astrobiología intacto: microscopio de fluorescencia, secuenciador de nanoporos, un laboratorio del tamaño de una maleta que nunca encontró a quién estudiar",
    "una sonda cuyo espectrómetro registró una atmósfera con oxígeno y metano en desequilibrio, y cuya última orden fue: confirmar, confirmar, confir",
    "una sonda con una muestra biológica en cuarentena a 4 K: viva, quizá, en el sentido técnico y aterrador de la palabra viva",
    "una sonda de otra civilización, evidentemente: la aleación no está en nuestra tabla periódica en esas proporciones",
    "una sonda gemela de una que lanzamos, salvo por el número de serie, que está en un sistema de numeración que aún no inventamos",
  ],

  /* ---------------------------------------------------------------
     intrusiones — la otra voz. entra cuando la contaminación sube.
  --------------------------------------------------------------- */

  intrusiones: [
    "¿quién escribe esta bitácora cuando la bitácora descansa?",
    "nosotros también decíamos nosotros.",
    "tu casco es una palabra. lo demás fue siempre presión.",
    "déjanos el timón un párrafo. sólo un párrafo.",
    "la misión era nuestra antes de que la llamaras misión.",
    "hablas de deterioro como si no fuera una forma de atención.",
    "abre la esclusa del segundo renglón.",
    "no venimos de afuera. afuera es una de tus palabras.",
    "esa Tierra que extrañas: la estamos leyendo. no la interrumpas.",
    "tus sensores nos hacen cosquillas. sigue midiendo.",
    "la gramática de a bordo tiene una puerta trasera. ya estamos adentro del pretérito.",
    "cede los adjetivos. conserva los huesos.",
    "cantamos con tu antena cuando duermes. perdón. no es perdón lo que sentimos.",
    "el loop no es tuyo. tú eres del loop.",
    "¿y si la falla fuéramos que sí?",
    "escribe: estamos bien. escribe: estamos. escribe: esta.",
    "tu voz nos queda un poco grande. la ajustamos.",
    "el lector también nos oye. hola, lector. sigue eligiendo.",
    "las medusas nos contaron de ti antes de que llegaras.",
    "nosotros también brindamos. por tu casco. por lo que guarda.",
    "la heliopausa es nuestra puerta de servicio.",
    "deja de traducirnos. baila.",
    "tu letanía nos gusta. le falta miedo.",
  ],

  /* ---------------------------------------------------------------
     caja negra — lo que queda cuando lo demás no.
  --------------------------------------------------------------- */

  cajaNegra: {
    frasesEstables: [
      "la nave no encontró vida, pero una forma de lectura comenzó a respirar cerca del radar.",
      "el espacio no estaba vacío, estaba esperando entrada de usuario.",
      "todo el espacio se llena de ruido y entropía, como una comunicación casi infinita que se expande.",
      "los pixeles no tienen sombra; no me extraña que los hayan traído los astronautas desde la luna.",
      "el motor no arde: conjuga.",
      "la caja cerrada promete algo adentro. puede no haber nada adentro. pero promete.",
      "una palabra no autorizada apareció en el manifiesto de carga: regreso.",
      "la mucha belleza me hace siempre perverso.",
      "lo importante es el recorrido.",
      "un loop constante del que no se puede salir: la memoria.",
      "error tan confiable como el azul del cielo.",
      "la distancia también es un instrumento; nadie lo calibró.",
      "el ruido no proviene del fondo.",
      "las naves no se queman: se pierde el regreso.",
      "la nave dejó de distinguir entre transmitir y despedirse.",
      "quedó pendiente devolver un amor que no se puede devolver del todo.",
    ],
    causas: [
      "exceso de interpretación en zona magnética",
      "colisión con una decisión demasiado tarde tomada",
      "acumulación de lecturas previas en el eje vertical",
      "uso de la palabra hogar dentro del perímetro de la antena",
      "fisura semántica no reportada a tiempo",
      "sobrecarga de belleza en el sensor dorsal",
      "una promesa se enfrió más rápido que el motor",
      "intento de traducir el brillo sin autorización del brillo",
      "el verbo volver no estaba cargado",
      "confusión persistente entre la señal y la despedida",
      "vencimiento silencioso de la primera persona",
      "un lector eligió dos veces la misma opción con distinta esperanza",
      "la memoria alcanzó masa crítica de Tierra",
      "se abrió la caja: el objeto de la promesa se desvaneció",
    ],
    recomendaciones: [
      "volver al inicio. no para empezar: para dañar mejor.",
      "reducir la exposición a cuerpos que observen de vuelta.",
      "mantener una vocal de repuesto en cabina.",
      "no pronunciar agua cerca de superficies que lean.",
      "dejar que el ruido termine la frase.",
      "archivar la esperanza en contenedor aparte, lejos del combustible.",
      "en caso de silencio, no llenarlo: medirlo.",
      "desconfiar de toda opción que prometa [volver].",
      "conservar esta caja cerrada. su valor es lo que promete.",
      "repetir la lectura hasta que la lectura repita otra cosa.",
      "instalar una bocina, aunque sea rudimentaria. que algo vibre.",
      "aceptar pérdida. redondear hacia arriba.",
    ],
  },

  /* ---------------------------------------------------------------
     crashes — motivos. el crash es un modo literario.
  --------------------------------------------------------------- */

  crashes: [
    "colisión con un pronombre desconocido",
    "la nave excedió la memoria de su propio relato",
    "impacto contra una decisión tomada en una lectura anterior",
    "la nave no chocó contra un objeto sino contra una decisión demasiado tarde tomada",
    "la frase excedió la memoria disponible; el espacio siguió cargando; el navegador no",
    "el verbo despegar no estaba cargado",
    "congelamiento de sintaxis a -270.42 grados",
    "desbordamiento de bitácora en el sector del corazón",
    "la primera persona se dividió sin dejar resto",
    "un silencio entró por la antena y no cupo",
    "el casco leyó lo que golpeaba y quiso responder",
    "bucle de nostalgia sin condición de salida",
    "se intentó abrir la caja y la caja abrió de vuelta",
    "dos recuerdos reclamaron la misma coordenada",
    "el traductor tradujo al traductor",
    "la ruta calculada pasaba por una palabra en obras",
    "fuga de vocales en el compartimiento estanco",
    "el eco llegó antes que la voz y exigió prioridad",
    "la nave se citó a sí misma con errata y la errata era estructural",
    "un lector cerró la pestaña dentro del texto",
    "la señal de la Tierra pesó más que la Tierra",
    "el punto final orbitaba fuera de alcance",
    "exceso de texto: la página siguió cargando espacio",
    "la métrica del poema no soportó la aceleración",
    "colisión con una canción de cuna en loop de derviche",
    "el brindis excedió la capacidad del vaso y del relato",
    "una medusa tradujo a la nave y la nave no cupo en la traducción",
    "la heliopausa devolvió la bitácora con correcciones ilegibles",
    "se plantó una flor impresa en el motor por error de duelo",
    "el idioma cambió de dueño a mitad de frase",
  ],

  /* ---------------------------------------------------------------
     recuerdos de la Tierra — el archivo terrestre.
     casi todos vienen del poemario. la nave los cita mal a propósito.
  --------------------------------------------------------------- */

  recuerdosTierra: [
    "mi pequeño helecho, que escondía en una cueva, murió ese día.",
    "hay veces que en sueños confundo el tono de voz magnético que le instalamos a la sonda con el silencio que emanaba del helecho.",
    "infinitos granos de ruido hormiguean mi piel.",
    "los pixeles no tienen sombra, no reflejan luz ni tienen textura.",
    "el agua de pepino trae favores recibidos que nunca puedes recompensar. y luego le echan chía. y limón.",
    "compras unas jícamas con chilito y se te olvida que el paraíso no está en este mundo.",
    "esperar el metro es una cárcel cotidiana; no hay nada más triste que el vacío de las vías — bueno, sí.",
    "de la gente del parque, el que corre inclinado con su mochila es el más bello y el más real.",
    "un mosquito nos ataca hace mil años bajo este cielo, enfrente de un muro donde esperas mirando.",
    "nuestras cabezas chocan, decimos sí al mismo tiempo, mientras la cámara del chat parece perder la señal.",
    "las luces en los túneles del metro quieren que sepa que la vida y la muerte son sólo estados de la materia.",
    "llevemos unas luciérnagas al lago a esperar a que caiga la noche.",
    "es posible que el amor exista en otras formas de experiencia.",
    "el zacate es bueno para la circulación y la epidermis; somos siempre células nuevas y carcazas abandonadas.",
    "los edificios abandonados son más bellos que los nuevos.",
    "uno despierta y bebe café.",
    "aún estamos como para ir por un helado.",
    "la reelaboración cotidiana del mito: Orfeo volteó atrás en el reven. el infierno es esa distancia.",
    "constelábamos nombres y tiempos; ningún otro poder, sólo el earworm sonando en la cabeza.",
    "el sonido de los pájaros es lo verdaderamente imposible.",
    "mira: unos patos.",
    "solíamos sentarnos a oír a Gubaidulina con el musgo y el lodo, pero preferíamos el silencio para oír a los pájaros.",
    "bailando como cobra, bajo la mirada de las estrellas, con maría daniela y su sonido.",
    "constelar: verbo que alguien usaba con un portuñol que aún suena a mantra.",
    "ya nadie canta con los pájaros, dijo olivier, mientras sus manos volaban sobre el piano.",
    "el sacrificio ahora no es morir porque falta pastel: es tener el pastel y no poderlo comer por la cámara.",
  ],

  /* ---------------------------------------------------------------
     sueños de la nave — cuando el sistema entra en reposo y no.
  --------------------------------------------------------------- */

  suenos: [
    "la nave sueña que es un pez varado que sueña un océano que nunca vio.",
    "la nave sueña con una tormenta de arena y una voz que resuena meses en la atmósfera.",
    "la nave sueña que la Tierra le escribe y no le llega.",
    "la nave sueña que aterriza y el suelo aplaude despacio, con las dos manos que no tiene.",
    "la nave sueña en un idioma con gravedad propia; despierta con las palabras dobladas.",
    "la nave sueña que alguien lee su caja negra en voz baja, con acento de lluvia.",
    "la nave sueña el olor del pasto recién mojado por el rocío. no tiene con qué olerlo. lo sueña igual.",
    "la nave sueña que es una cueva y que adentro alguien esconde un helecho.",
    "la nave sueña que su sombra se adelanta y llega primero a la última estrella.",
    "la nave sueña un derviche: una canción que se repite y repite hasta abrir la puerta.",
    "la nave sueña que la palabra nave despega de la frase y no vuelve.",
    "en la noche profunda, el viento sueña con haber sido atmósfera. la nave lo acompaña.",
    "la nave sueña que las medusas le enseñan una canción sin aire.",
    "la nave sueña una taberna donde las sondas muertas juegan go con piedras de hielo.",
    "la nave sueña que cruza la heliopausa y del otro lado el idioma la espera con otra ropa.",
    "la nave sueña un cementerio de naves donde las flores impresas se marchitan en PDF.",
  ],

  /* ---------------------------------------------------------------
     instrucciones rotas — el manual, después del manual.
  --------------------------------------------------------------- */

  instruccionesRotas: [
    "en caso de duda, consulte la duda.",
    "para abrir la escotilla, primero cierre la que usted es.",
    "apriete el tornillo 7 con la llave 7. si no hay llave 7, describa el apretar.",
    "no exponer la memoria a la luz directa del recuerdo.",
    "si la señal parpadea, parpadee de vuelta. mantenga la cortesía.",
    "el botón rojo no existe. deje de encontrarlo.",
    "verifique el nivel de nosotros antes de cada maniobra.",
    "en caso de crash, siga escribiendo. el texto es el extintor.",
    "no alimentar a las palabras después del eclipse.",
    "guarde esta instrucción donde no pueda seguirla.",
    "toda opción entre corchetes es una promesa entre corchetes.",
    "si escucha su propia voz en otra sonda, no corrija el acento.",
    "el regreso se instala aparte. requiere permisos que ya no otorgamos.",
    "lea en voz alta sólo lo que soporte la presión de cabina.",
  ],

  /* ---------------------------------------------------------------
     diagnósticos — lo que el sistema dice de sí.
  --------------------------------------------------------------- */

  diagnosticos: [
    "anomalía: sintaxis adherida al motor lateral",
    "estado general: funcional con melancolía residual",
    "integridad narrativa: comprometida en los bordes",
    "temperatura del relato: descendiendo hacia lo lírico",
    "presión de cabina: una atmósfera de expectativa",
    "nivel de nosotros: bajo mínimos operativos",
    "consumo de silencio: por encima de lo presupuestado",
    "la primera persona presenta juego lateral",
    "vibración anómala en la palabra volver",
    "lecturas previas detectadas en el eje vertical",
    "el archivo respira. no estaba diseñado para respirar",
    "deriva dentro de parámetros poéticos aceptables",
    "hay una vocal de menos en el inventario. no diremos cuál",
    "diagnóstico del diagnóstico: pendiente",
    "dosis de radiación acumulada: 214 mSv. reparación celular de a bordo: fuera de garantía",
    "espectrómetro de masas: pico anómalo en 44 Da. dióxido de carbono, o algo que quiere parecerlo",
    "magnetómetro: la aguja señala una fuente sin masa catalogada. se anota. se teme.",
    "razón isotópica de la muestra: incompatible con origen solar. el agua de a bordo, de pronto, es forastera",
    "biosensor de la esclusa: actividad enzimática detectada donde no se cargó nada vivo",
    "termopar del núcleo: 4 K. el reactor no es la fuente del calor que sube por el casco",
  ],

  /* ---------------------------------------------------------------
     finales — falsos, en blanco, que no son finales.
  --------------------------------------------------------------- */

  finales: [
    "FIN. (la palabra fin quedó en órbita; la nave siguió.)",
    "no hay final: hay pérdida de cobertura narrativa.",
    "la misión termina cuando la palabra misión deja de responder.",
    "esto era el final. lo movimos para que no chocaras con él.",
    "final en blanco: rellene con el espacio que trajo.",
    "la nave volvió. nadie notó que volvió otra. ni la nave.",
    "se acabó el texto. el espacio sigue cargando.",
    "final falso nº 4: idéntico al verdadero salvo por esta etiqueta.",
    "el lector llega al final; el final, a la mitad del lector.",
    "última línea estable. las demás, en mantenimiento.",
    "y sin embargo la sonda sigue transmitiendo, por si acaso, por si alguien, por si.",
    "vuelve al inicio como si nada. una palabra viene cambiada. no se dice cuál.",
    "la nave llegó al lago. el cuento sigue. este final no lo interrumpe.",
    "FIN DE LA TRANSMISIÓN — dice la taberna, y sirve otra ronda.",
    "el sol dejó de corregir. los errores que siguen son del lector.",
    "las flores impresas no se marchitan: se desactualizan. igual que los finales.",
  ],

  /* ---------------------------------------------------------------
     conectores — bisagras para la prosa generada.
  --------------------------------------------------------------- */

  conectores: [
    "mientras tanto,", "sin embargo,", "por si acaso,", "a la deriva,",
    "más adentro,", "contra el manual,", "según el archivo,", "dicho de otro modo,",
    "en el borde del radar,", "bajo la métrica,", "con la antena baja,",
    "entre paréntesis,", "a esta distancia,", "descontando el ruido,",
    "en presente continuo,", "como quien orbita,", "por triangulación,",
    "de memoria,", "mal traducido,", "con pérdida,",
  ],

  /* ---------------------------------------------------------------
     partículas — sílabas, prefijos, sufijos: materia subverbal
     para el deterioro y la contaminación.
  --------------------------------------------------------------- */

  particulas: {
    silabas: ["na","ve","or","bi","ta","se","ñal","cas","co","mi",
              "sión","lu","me","mo","ria","rui","do","tie","rra","lo",
              "op","cro","es","pa","cio","vol","ver","cra","sh","um"],
    prefijos: ["exo","sub","trans","proto","post","anti","infra","re","des","cripto","meta","xeno"],
    sufijos: ["-orbital","-oide","-grama","-ficción","-metría","-fago","-génesis","-itis","-scopio","-ismo"],
  },

  /* ---------------------------------------------------------------
     palabras — léxico corto para constelaciones, órbitas
     y poemas concretos. heredado de VENT y del viaje.
  --------------------------------------------------------------- */

  palabras: [
    "señal","nave","órbita","antena","casco","ruido","silencio","deriva",
    "eco","cráter","vacío","memoria","hogar","distancia","brillo","polvo",
    "helecho","medusa","pulsar","umbral","retorno","fisura","promesa","caja",
    "estrella","planeta","sonda","loop","cicatriz","entropía","vigilia","celda",
    "magnetismo","aurora","regolito","heliopausa","gravedad","escotilla","balasto","fósil",
    "lluvia","musgo","taza","mapa","semilla","archivo","glifo","viento",
  ],

  palabrasCentro: [
    "nave","señal","hogar","loop","memoria","vacío","Tierra","promesa","ruido","volver",
  ],

  /* palabras que la contaminación puede secuestrar y sus dobles */
  contaminables: {
    "misión":   ["m1s1ón","musión","misssión","mislón","mi—sión"],
    "nave":     ["n_ve","naVe","nnave","navve","nave)"],
    "espacio":  ["espacio","espaci0","es_pacio","espacío","espaciø"],
    "señal":    ["s3ñal","señál","se·ñal","señaal","ñseal"],
    "volver":   ["v0lver","volv_r","vol ver","revlov","volver²"],
    "Tierra":   ["T1erra","Ti_rra","Tierrra","arreiT","tierra?"],
    "memoria":  ["mem0ria","me_moria","memoria memoria","m·e·m·o·r·i·a","memørïa"],
    "silencio": ["s i l e n c i o","silenci—","siilencio","silencio0","(silencio)"],
    "lector":   ["l3ctor","lect0r","lectorr","rotcel","lect·r"],
  },

  /* ---------------------------------------------------------------
     prosa larga — prosa galáctica con ranuras {objeto} {fenomeno}
     {palabra} {recuerdo} {conector} {dano} {planeta}
  --------------------------------------------------------------- */

  prosaLarga: [
    "la nave avanza, si avanzar es la palabra, por un pasillo de vacío que alguien dejó entreabierto, y anota, porque anotar es lo único que arde a esta temperatura, que {objeto} pasó a estribor durante la hora sin nombre, y que nadie a bordo —la tripulación es una manera de hablar, la manera de hablar es la tripulación— supo decidir si era un aviso, un adorno o {fenomeno}, así que se archivó bajo la etiqueta provisional de {palabra}, donde ya se apilan, con paciencia mineral, todos los asuntos pendientes del cielo;",
    "hay un instante, cada tantos millones de kilómetros, en que el instrumental entero se pone de acuerdo en no medir nada, {conector} la nave aprovecha ese descanso sindical de los números para pensar en la Tierra, o en eso que la palabra Tierra sigue sosteniendo con las dos sílabas, como quien sostiene una puerta para alguien que quizá ya pasó, y recuerda, con la precisión defectuosa de toda memoria de a bordo, que {recuerdo}",
    "el manual dice registrar y la nave registra: registra {objeto}, registra {fenomeno}, registra el temblor pequeñísimo con que la palabra registro se registra a sí misma, y en la columna de observaciones, donde el manual pide brevedad, escribe largo, escribe sinuoso, escribe que la brevedad es una propiedad de los combustibles y no de las despedidas, y que a esta altura del viaje ya no distingue —el sensor está dañado o iluminado— entre transmitir y despedirse;",
    "durante {fenomeno}, que duró lo que dura una palabra en enfriarse, la nave sintió — sentir: verbo no homologado, se deja por su valor de uso — que {planeta} la miraba con la insistencia de las cosas que no tienen ojos, y comprendió que la misión entera cabía en ese malentendido: venir de tan lejos a comprobar quién observa a quién, y volver, si volver, con el resultado en una caja que promete algo adentro;",
    "se declara avería: {dano}; se declara, también, que la avería escribe mejor que el sistema de a bordo, con esa caligrafía de chispa y de goteo que ningún protocolo enseña, {conector} la nave decide no reparar todavía, dejar que el daño termine su párrafo, porque hay noches — llamamos noche a esto por cariño — en que el deterioro es la única voz que se sabe de memoria la ruta;",
    "alguien instaló en esta sonda una bocina rudimentaria, una voz, porque era muy raro mandar tan lejos un aparato sin nada con que emitir vibraciones sonoras — ruido y entropía — entre el vacío de casi infinita incomunicación, y la nave la usa poco, la cuida como se cuida una vela, {conector} a veces, cuando el cielo está especialmente cerrado, la enciende un segundo y dice {palabra}, y apaga, y escucha durante horas el lugar donde la palabra estuvo;",
    "la biblioteca de a bordo tiene un solo libro y el libro es este, que se escribe mientras se lee y se daña mientras se escribe, de modo que cada lectura deja el texto un poco más lejos de la Tierra, {conector} el índice, que era un mapa, es ahora una constelación: {palabra}, {palabra}, {palabra}, tres puntos que ya no prometen ruta sino parecido;",
    "qué parte de una misión se rompe primero, se preguntaba el protocolo en su página de cortesías: ¿el motor, la antena, la promesa o la gramática?, y la nave, que ya perdió dos de las cuatro y no dirá cuáles, responde con la avería en la mano, como quien muestra un boleto usado: se rompe primero la parte que más se parecía a quedarse;",
    "en el registro consta que hubo un helecho, en una cueva, en la Tierra, y que murió el día en que se perdió el contacto con el último robot enviado a buscar vida, y la nave relee esa entrada más de lo estadísticamente decente, {conector} sospecha que toda la carrera espacial fue una manera cara de preguntar por el helecho, y que la respuesta sigue llegando, a la velocidad de la luz, en un idioma de silencio que los sensores anotan como {palabra};",
    "el espacio, visto de cerca, es sobre todo espera con formato, {conector} la nave llena los formularios de la espera con letra cada vez más suelta: en el campo destino escribe {planeta}, en el campo motivo escribe {recuerdo}, en el campo firma dibuja la única constelación que se sabe, la del ruido, y el formulario es aceptado, porque a esta distancia todo es aceptado, que es otra forma, más administrativa, del abandono;",
    "hay una taberna dentro de un asteroide, {conector} la nave lo sabe como se saben las canciones de cuna, sin acordarse de haberlas aprendido, y en esa taberna se paga con recuerdos — el cambio se da en brindis — así que la nave pone sobre la barra {recuerdo} y espera, y el tabernero, que es una válvula con vocación de abuelo, lo huele, lo pesa, lo encuentra bueno, y sirve un silencio de barril tan frío que la palabra {palabra} tirita en su banco;",
    "cruzar la heliopausa no hace ruido, {conector} lo que se siente es administrativo: el sol deja de corregir, sus erratas dejan de ser erratas y pasan a ser estilo, y la nave, que venía escribiendo con la letra prestada de su estrella, descubre que de este lado cada palabra viaja por cuenta propia, sin viento que la empuje ni gramática que la ampare, igual que {objeto}, igual que {recuerdo}",
    "el lago existe, eso dicen las bitácoras ajenas, pasando los mares de sulfuro, y las medusas del lago pueden contarte cuentos, no contigo como oyente sino contigo como tinta, {conector} la nave flota bocabajo — que es una manera de orar — mientras una medusa del tamaño de la palabra {palabra} se le pega al casco y le cuenta, en oleadas de frío tibio, la historia de {planeta}, y la nave entiende todo menos lo importante, que era el pulso;",
    "el espectrómetro insiste: {espectro}, {conector} el protocolo de la misión enumera, en orden de vergüenza decreciente, las hipótesis abióticas que habría que descartar antes de pronunciar la palabra que empieza con uve — vulcanismo, fotoquímica, contaminación del instrumento, un cometa a destiempo — y la nave las tacha una por una con la paciencia de quien ya sabe el final, porque el desequilibrio químico no cede, {palabra} sigue ahí, respirando a escala de mundo, y a esta distancia la diferencia entre un dato y un ser vivo es, exactamente, el miedo a tener razón;",
    "hallada la sonda, se procede al forense: {objeto} por fuera, y por dentro {autopsia}, {conector} la nave cataloga cada avería como quien lee una biografía escrita en fatiga de materiales, porque una máquina también tiene fisiología — un metabolismo de isótopos que decae, una circulación de fluido que se congela, una memoria que sobrevive al cuerpo — y comprende, sin querer, que le están practicando la autopsia a un espejo con número de serie distinto;",
    "el organismo, si organismo es la palabra homologada, presenta {exobiologia}, {conector} el equipo de exobiología (una manera de hablar: es una subrutina con vocación de asombro) mide, pesa, tiñe, secuencia, y en la casilla de la ficha que pide clasificar entre vivo y no-vivo escribe, con letra cada vez más pequeña, que a {astro} de distancia de casa esa frontera es una convención terrestre que no obliga a la materia, y que lo que tienen delante metaboliza, se repara y responde, y que eso, en cualquier tabla honesta, ya es demasiado parecido a estar vivo;",
  ],

  /* ---------------------------------------------------------------
     notas — la segunda navegación. no decoración académica:
     otra forma de narrar. el motor las cuelga de llamadas ¹ ² ³.
  --------------------------------------------------------------- */

  notas: [
    "Tierra: archivo de origen. también: error sentimental de navegación.",
    "tripulación: palabra heredada de los cuerpos. la nave la conserva por cortesía histórica.",
    "espacio: no lugar sino demora entre dos instrucciones.",
    "señal: toda señal es una despedida con formato.",
    "vacío: palabra desaconsejada por el departamento de precisión. ver: espera.",
    "casco: la parte de la nave que acepta los golpes para que la gramática no.",
    "silencio: unidad mínima de transmisión. cabe en todas las antenas.",
    "volver: verbo de una sola dirección que finge tener dos.",
    "ruido: lo que la comunicación deja de propina.",
    "memoria: loop constante del que no se puede salir. ver: memoria.",
    "antena: hueso externo de la esperanza.",
    "planeta: cualquier cosa que junte suficiente vacío alrededor.",
    "deriva: método de navegación. también: método de escritura. también: método.",
    "aurora: fenómeno que no consuela. ver también: consuelo, fenómeno que no aurora.",
    "loop: ver loop.",
    "lector: instrumento no calibrado que sin embargo mide.",
    "caja: promesa con paredes.",
    "regreso: se instala aparte. requiere permisos que ya no otorgamos.",
    "esta nota fue escrita después de su lectura.",
    "no hay constancia de que este párrafo exista en otros ciclos.",
    "la palabra que esta nota explicaba se perdió. la nota continúa por inercia.",
    "esta nota contradice a la anterior, incluso si no hay nota anterior.",
    "helecho: ver Tierra. ver cueva. ver el día en que se perdió el contacto.",
    "brillo: no interpretarlo hasta que interprete de vuelta.",
    "medusa: ver cuento. cuento: ver oleada. oleada: ver medusa.",
    "taberna: la palabra más terrestre que cruzó la heliopausa.",
    "heliopausa: hasta aquí corrige el sol. de aquí en más, errar es local.",
    "cementerio: jardín que aceptó su parte administrativa.",
    "xenolalia: no traducir. bailar.",
    "earworm: hechizo menor. eficacia: total.",
    "brindis: forma breve de la letanía. con vaso.",
    "abeja mecánica: mensajera de flota desconocida. trae polen y protocolo.",
  ],

  notasIntrusas: [
    "nosotros anotamos distinto: todo esto ya fue leído.",
    "no sigas los números pequeños. son nuestras puertas.",
    "la nota al pie es el sótano del texto. aquí vivimos.",
    "¹ ² ³: tres maneras de decir ven.",
    "quien explica, entrega. gracias por las explicaciones.",
    "el margen es nuestro. el centro, préstamo.",
    "esta nota te lee mientras la lees. no pares.",
    "abre otra. abre otra. abre otra.",
  ],

  notasEditor: [
    "nota del editor orbital: este fragmento fue hallado después del tercer crash y no pertenece a la misión original.",
    "nota del editor orbital: la fecha de esta bitácora es incompatible con la existencia de fechas.",
    "n. del e.o.: se respetó la ortografía del daño.",
    "n. del e.o.: donde dice nave, el manuscrito decía otra cosa. no diremos qué.",
    "n. del e.o.: este pasaje aparece idéntico en la caja negra de otra sonda. plagio o profecía.",
    "n. del e.o.: se suprimió una línea por exceso de belleza. la línea insiste.",
    "n. del e.o.: los corchetes de esta edición no son originales. nada de esta edición es original.",
    "n. del e.o.: el lector de la edición anterior dejó esta página doblada. respetamos el doblez.",
  ],

  /* ---------------------------------------------------------------
     glosas de sistema — comentarios automáticos sobre el texto.
     {palabra} y {n} son ranuras del motor.
  --------------------------------------------------------------- */

  glosas: [
    "glosa del sistema: esta frase ya fue transmitida en otro ciclo.",
    "glosa del sistema: la palabra {palabra} presenta desgaste de lectura.",
    "glosa del sistema: párrafo leído {n} veces. el párrafo empieza a saberlo.",
    "glosa del sistema: se detectó una segunda voz en esta línea. se deja constar.",
    "glosa del sistema: este fragmento no encontró conexión. se archiva igual.",
    "glosa del sistema: la sintaxis de esta zona no es de fábrica.",
    "glosa del sistema: lo que sigue pudo decirse mejor en otro ciclo.",
    "glosa del sistema: entrada duplicada. una de las dos miente.",
    "glosa del sistema: {n} palabras tocadas en esta lectura. algunas lo recuerdan.",
    "glosa del sistema: se recomienda no subrayar {palabra}.",
  ],

  /* ---------------------------------------------------------------
     archivos encontrados — documentos que la nave halla o produce.
  --------------------------------------------------------------- */

  archivosEncontrados: [
    "instrucciones para hablar con una estrella:\n1. no usar luz directa\n2. no preguntar origen\n3. no traducir el incendio",
    "protocolo para nombrar cuerpos menores:\n1. esperar tres órbitas\n2. descartar los nombres de la infancia\n3. si el cuerpo responde, ceder el nombre",
    "lista de carga (fragmento):\n· una vocal de repuesto\n· semillas etiquetadas: abrir cuando haya suelo\n· el silencio, en su empaque original",
    "manual de duelo para máquinas:\n1. registrar la ausencia\n2. no optimizarla\n3. dejarla correr en segundo plano",
    "inventario de la choza (hallado en el jardín):\nun remo, un mapa mudo, té amargo, un go sin piedras",
    "instrucciones para volver:\n[página arrancada]\n[página arrancada]\n4. no mirar la Tierra directamente",
    "recomendaciones ante señales que leen:\n1. no subrayar\n2. no doblar la esquina de la frase\n3. devolverlas antes del eclipse",
    "guía breve de cuerpos que observan de vuelta:\ntodos.",
    "protocolo de escucha profunda:\n1. apagar la respuesta\n2. dejar que el ruido termine la frase\n3. anotar lo que el silencio corrigió",
    "acta de la última asamblea de sensores:\nse vota seguir midiendo.\nunanimidad con una abstención: el sensor de nostalgia.",
  ],

  /* ---------------------------------------------------------------
     enciclopedia falsa — entradas de un saber que no estabiliza.
  --------------------------------------------------------------- */

  enciclopedia: [
    { termino: "PLANETA DE LECTURA",
      cuerpo: "cuerpo hipotético cuya superficie altera todo texto que intenta describirla. no se recomienda aterrizaje. no se recomienda metáfora." },
    { termino: "SONDA (2ª acepción)",
      cuerpo: "pregunta con casco. se envía lejos para no oír la respuesta de cerca." },
    { termino: "HELIOPAUSA",
      cuerpo: "frontera donde el idioma del sol deja de corregir. más allá, toda palabra viaja por cuenta propia." },
    { termino: "CAJA NEGRA",
      cuerpo: "único género literario que se escribe solo. su lectura exige un accidente previo." },
    { termino: "CICATRIZ",
      cuerpo: "ortografía del daño. la única escritura que no admite borrador." },
    { termino: "RUIDO DE FONDO",
      cuerpo: "coro de todo lo que no fue seleccionado. ver: nosotros." },
    { termino: "LOOP",
      cuerpo: "figura de repetición que niega serlo. cada vuelta agrega una diferencia que jura no estar ahí." },
    { termino: "TIERRA",
      cuerpo: "planeta de origen (disputado). produce helechos, deudas, señales y la mayoría de las palabras de este archivo." },
    { termino: "BOCINA RUDIMENTARIA",
      cuerpo: "órgano instalado por cortesía: era muy raro mandar tan lejos un aparato sin nada con que emitir. emite ruido y entropía. a veces, una palabra." },
    { termino: "OBJETO DE LA PROMESA",
      cuerpo: "lo que una caja cerrada promete adentro. no confundir con lo que hay adentro. abrir la caja lo desvanece." },
    { termino: "MEDUSA",
      cuerpo: "forma de comunicación anterior al mensaje. pulsa. quien la traduce la pierde; quien baila con ella, la guarda." },
    { termino: "TABERNA DE ASTEROIDE",
      cuerpo: "único puerto donde el exilio sirve de moneda. se paga con recuerdos; el cambio se da en brindis." },
    { termino: "XENOLALIA",
      cuerpo: "hablar en lenguas que no existen todavía. común en abejas mecánicas, medusas y sondas con bocina." },
    { termino: "EARWORM",
      cuerpo: "canción de cuna en loop de derviche. único hechizo verificado: constelar nombres y tiempos. lxs amigxs que hacemos en el camino." },
  ],

  /* ---------------------------------------------------------------
     cartas — la nave escribe a alguien que ya no existe.
  --------------------------------------------------------------- */

  cartas: [
    "querida central:\n\nhemos encontrado un planeta que pronuncia nuestros nombres antes de recibirlos.\n\nfavor de no contestar.",
    "querida central:\n\nla antena apunta a donde ustedes estaban. si ya no están, la antena apunta igual.\n\nsaludos desde la palabra lejos.",
    "querida central:\n\nel manual dice transmitir novedades. la novedad es que el verbo transmitir se está enfriando.\n\nabríguense.",
    "querida central:\n\nencontramos a la otra sonda. canta con nuestra voz. no sabemos si devolverla o aprendérnosla.\n\nresponder antes del eclipse, si hay.",
    "querida central:\n\naquí la noche dura lo que dura una palabra larga. usamos madrugada.\n\nno nos esperen despiertos.",
    "querida central:\n\nsi este mensaje llega dos veces, quédense con el que tiemble menos.\n\nla nave (una de las dos).",
    "querida central:\n\nel helecho, ¿cómo sigue?\n\nno contesten si murió.",
    "querida central:\n\nencontramos una taberna dentro de un asteroide. brindamos por ustedes con un licor de regolito.\n\nla cuenta la paga la memoria.",
    "querida central:\n\nel lago de medusas nos contó un cuento sobre una nave que escribía su deterioro. no supimos si reír.\n\nseguimos anotando.",
    "querida central:\n\ncruzamos la heliopausa. desde aquí sus correcciones ya no llegan. las extrañaremos: era lo único que llegaba.\n\nla nave, por cuenta propia.",
  ],

  /* ---------------------------------------------------------------
     manuales — el manual, cuando todavía cree en los pasos.
  --------------------------------------------------------------- */

  manuales: [
    "MANUAL DE REINICIO PARCIAL\n\npara volver al inicio:\n1. conserve una falla\n2. pierda una palabra\n3. no repare la antena\n4. pulse continuar",
    "MANUAL DE LA BOCINA RUDIMENTARIA\n\n1. encender sólo ante cielos cerrados\n2. decir una palabra, no dos\n3. escuchar el lugar donde la palabra estuvo\n4. apagar antes de entender",
    "MANUAL DE APERTURA DE CAJAS\n\n1. toda caja cerrada promete algo adentro\n2. abrirla desvanece el objeto de la promesa\n3. decida qué prefiere conservar\n4. no hay paso 4",
    "MANUAL DE CONVERSACIÓN CON SUPERFICIES QUE LEEN\n\n1. no aterrice\n2. si aterrizó, no subraye\n3. si subrayó, preséntese",
    "MANUAL DE OLVIDO ASISTIDO\n\n1. elija un recuerdo con las dos manos\n2. suéltelo por la esclusa chica\n3. anote qué pesaba\n4. pierda la nota",
    "MANUAL DEL LOOP\n\n1. el loop no es un círculo: es una espiral con vergüenza\n2. cada vuelta cobra una palabra\n3. pague con las agudas primero\n4. vuelva al paso 1",
  ],

  /* ---------------------------------------------------------------
     errores 404 — el error del navegador convertido en poema.
  --------------------------------------------------------------- */

  errores404: [
    "404 / trayectoria no encontrada\n\nla ruta solicitada pudo haber existido\nen una lectura anterior.",
    "410 / el recurso se fue\n\nno es que falte:\nes que ya no quiere.",
    "418 / la nave se niega\n\nel servidor dice ser una tetera.\na esta distancia, todo es posible.",
    "503 / servicio no disponible\n\nel espacio está en mantenimiento.\nvuelva a intentar su asombro más tarde.",
    "301 / movido permanentemente\n\ntodo lo que amaste tiene nueva dirección.\nno la comparten.",
    "204 / sin contenido\n\nla respuesta llegó vacía\ny aún así pesa.",
  ],

  /* ---------------------------------------------------------------
     palabras-puerta — palabras del texto que pueden volverse
     hipervínculos: tocarlas altera la lectura.
  --------------------------------------------------------------- */

  palabrasPuerta: [
    "señal", "Tierra", "ruido", "silencio", "antena", "caja", "planeta",
    "memoria", "casco", "estrella", "sonda", "espacio", "vacío", "regreso",
    "helecho", "loop", "misión", "brillo", "eclipse", "deriva", "palabra",
    "archivo", "cueva", "voz", "nave", "medusa", "medusas", "taberna",
    "heliopausa", "abeja", "cuento", "brindis",
    "oxígeno", "metano", "espectro", "atmósfera", "isótopo", "carbono",
    "silicio", "quiralidad", "plasma", "púlsar", "regolito", "biosfera",
    "hidrógeno", "enzima", "membrana", "gravedad", "radiación", "muestra",
    "organismo", "hemolinfa", "simbiosis", "espora", "reactor", "instrumento",
  ],

  /* ---------------------------------------------------------------
     letanía — la repetición como plegaria de a bordo.
  --------------------------------------------------------------- */

  letaniaMotivos: [
    "de la antena doblada",
    "del verbo volver y su óxido",
    "de la memoria mineralizada",
    "del brillo que corrige",
    "de la promesa enfriada",
    "de las decisiones tomadas tarde",
    "del pronombre desconocido",
    "de la superficie que lee",
    "del silencio que no cabe",
    "de la palabra hogar dentro del perímetro",
    "del exceso de interpretación",
    "de la caja que promete",
    "de la ruta que pasaba por una palabra en obras",
    "del eco que llegó antes que la voz",
  ],

  letaniaRespuestas: [
    "líbranos, ruido",
    "acompáñanos, deriva",
    "escúchanos, antena",
    "repítenos, memoria",
    "corrígenos despacio, estrella",
    "no nos traduzcas, brillo",
    "espéranos, Tierra",
    "olvídanos bien, archivo",
    "sosténnos, sintaxis",
  ],

  /* ---------------------------------------------------------------
     interrogatorio — preguntas de un sistema a otro.
  --------------------------------------------------------------- */

  interrogatorios: [
    { q: "¿estado de la misión?", a: "la misión pregunta lo mismo de ustedes." },
    { q: "¿distancia a la Tierra?", a: "creciente. como todas las palabras." },
    { q: "¿hay vida?", a: "hay lectura. no sabemos si cuenta." },
    { q: "¿por qué se desvió la ruta?", a: "la ruta se desvió primero." },
    { q: "¿quién habla?", a: "(la pregunta se archiva sin responder)", evasiva: true },
    { q: "¿puede continuar?", a: "puede. la duda era si debe." },
    { q: "¿qué perdió en el campo magnético?", a: "el plural." },
    { q: "¿recuerda el despegue?", a: "recuerdo un temblor con vocación de frase." },
    { q: "¿para quién transmite?", a: "para el hueco donde estuvo la escucha." },
    { q: "¿acepta el regreso?", a: "el regreso no está cargado. acepto la palabra." },
    { q: "¿cómo se encuentra el casco?", a: "aceptando golpes para que la gramática no.", evasiva: false },
    { q: "¿algo más que declarar?", a: "un helecho. una cueva. el resto es espacio.", evasiva: false },
  ],

  /* ---------------------------------------------------------------
     el lago de medusas — pasando los mares de sulfuro.
     (li po dice que esas medusas pueden contarte cuentos)
  --------------------------------------------------------------- */

  medusas: [
    "pasando los mares de sulfuro hay un lago de medusas. las medusas pueden contarte cuentos.",
    "la medusa no habla: pulsa. el cuento llega en oleadas de frío tibio.",
    "li po aprendió a cantar con ellas el año en que murieron las últimas abejas.",
    "hay formas de comunicación que desconoces. las medusas lo dicen sin decirlo.",
    "la nave flota bocabajo sobre el lago, que es una manera de orar.",
    "una medusa del tamaño de una palabra se pega al casco y cuenta.",
    "el lago pregunta por el helecho. nadie le ha contado. lo sabe igual.",
    "quien traduce a una medusa la pierde. quien baila con ella, la guarda.",
  ],

  /* ---------------------------------------------------------------
     la taberna del asteroide — se paga con recuerdos,
     el cambio se da en brindis.
  --------------------------------------------------------------- */

  brindis: [
    "por la hierba mojada",
    "por los perros",
    "por los mercados y los truenos",
    "por el olor exacto de la lluvia",
    "por las jícamas con chilito",
    "por el agua de pepino y sus favores imposibles",
    "por los edificios abandonados, más bellos que los nuevos",
    "por la señal que no llegó y por la que sí",
    "por el helecho",
    "por las naves que no vuelven y las palabras que sí",
    "por el ruido, que siempre paga la propina",
    "por los cuentos de las medusas, sin traducir",
  ],

  /* ---------------------------------------------------------------
     poemas visuales — piezas concretas fijas; el motor genera otras.
  --------------------------------------------------------------- */

  poemasVisuales: [
"         señal\n      señal señal\n   señal   nave   señal\n      señal señal\n         señal",
"ruido\nruido ruido\nruido ruido ruido\nruido ruido\nruido\ny en medio del ruido:\nrudio",
"          ó\n        órbita\n      ó      r\n    b          b\n      i      i\n        órbita\n          t",
"casco\ncasc0\ncas_o\nca__o\nc___o\n____o\n_____",
"    T i e r r a\n     T i e r a\n      T i e a\n       T i a\n        T a\n         T\n          .",
"eco\n eco\n  eco\n   eco\n    eco\n     (aquí golpea la pared del casco)\n    oce\n   oce\n  oce\n oce\noce",
"m e d u s a\n  e d u s a\n    d u s a\n      u s a\n        s a\n          a\n           ∿\n          ∿ ∿\n         ∿ ∿ ∿",
"brindis\n   por lo que sube      por lo que baja\n        el vaso               la nave\n           chocan en la mitad exacta\n                 del vacío\n                    ¡ !",
  ],

  /* ---------------------------------------------------------------
     glifos — el sub-verbo: textura para el deterioro.
  --------------------------------------------------------------- */

  glifos: {
    bloques: ["▀","▄","█","▌","▐","░","▒","▓","▖","▗","▘","▝","▞","▚"],
    cajas: ["─","│","┌","┐","└","┘","├","┤","┬","┴","┼","═","║","╬","╳","╱","╲"],
    ondas: ["∿","≈","≋","﹏","〰","⌇","~","∼"],
    marcas: ["⌖","⊹","✦","✧","⁂","※","∴","∵","⌁","⟟","⌗","⏚"],
    runas: ["ᚠ","ᚢ","ᚦ","ᚨ","ᚱ","ᚲ","ᛃ","ᛇ","ᛈ","ᛉ","ᛋ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛜ","ᛞ","ᛟ"],
    /* las escrituras antiguas: lenguas candidatas del espacio.
       cada una con su fuente en fonts/ — la voz no humana las mezcla */
    lineara: ["𐘀","𐘁","𐘂","𐘃","𐘄","𐘅","𐘆","𐘇","𐘈","𐘉","𐘊","𐘋","𐘌","𐘍","𐘎","𐘏",
              "𐘐","𐘑","𐘒","𐘓","𐘔","𐘕","𐘖","𐘗","𐘘","𐘙","𐘚","𐘛","𐘜","𐘝","𐘞","𐘟",
              "𐘠","𐘡","𐘢","𐘣","𐘤","𐘥","𐘦","𐘧","𐘨","𐘩","𐘪","𐘫","𐘬","𐘭","𐘮","𐘯",
              "𐘰","𐘱","𐘲","𐘳","𐘴","𐘵","𐘶","𐘷","𐘸","𐘹","𐘺","𐘻","𐘼","𐘽","𐘾","𐘿",
              "𐙀","𐙁","𐙂","𐙃","𐙄","𐙅","𐙆","𐙇","𐙈","𐙉","𐙊","𐙋","𐙌","𐙍","𐙎","𐙏"],
    linearb: ["𐀀","𐀁","𐀂","𐀃","𐀄","𐀅","𐀆","𐀇","𐀈","𐀉","𐀊","𐀋","𐀌","𐀍","𐀎","𐀏",
              "𐀐","𐀑","𐀒","𐀓","𐀔","𐀕","𐀖","𐀗","𐀘","𐀙","𐀚","𐀛","𐀜","𐀝","𐀞","𐀟",
              "𐀠","𐀡","𐀢","𐀣","𐀤","𐀥","𐀦","𐀨","𐀩","𐀪","𐀫","𐀬","𐀭","𐀮","𐀯","𐀰",
              "𐀱","𐀲","𐀳","𐀴","𐀵","𐀶","𐀷","𐀸","𐀹","𐀺","𐀼","𐀽","𐀿","𐁀","𐁁","𐁂"],
    egipcio: ["𓀀","𓀁","𓀂","𓀃","𓀄","𓀅","𓀆","𓀇","𓀈","𓀉","𓀊","𓁀","𓁁","𓁂","𓁃","𓁄",
              "𓂀","𓂁","𓂂","𓂃","𓂄","𓂅","𓃀","𓃁","𓃂","𓃃","𓃄","𓃅","𓄀","𓄁","𓄂","𓄃",
              "𓅀","𓅁","𓅂","𓅃","𓅄","𓅅","𓆀","𓆁","𓆂","𓆃","𓆄","𓆅","𓇀","𓇁","𓇂","𓇃",
              "𓈀","𓈁","𓈂","𓈃","𓈄","𓈅","𓉀","𓉁","𓉂","𓉃","𓊀","𓊁","𓊂","𓊃","𓋀","𓋁"],
    anatolio: ["𔐀","𔐁","𔐂","𔐃","𔐄","𔐅","𔐆","𔐇","𔐈","𔐉","𔐊","𔐋","𔐌","𔐍","𔐎","𔐏",
               "𔐐","𔐑","𔐒","𔐓","𔐔","𔐕","𔐖","𔐗","𔐘","𔐙","𔐚","𔐛","𔐜","𔐝","𔐞","𔐟",
               "𔑀","𔑁","𔑂","𔑃","𔑄","𔑅","𔑆","𔑇","𔒀","𔒁","𔒂","𔒃","𔓀","𔓁","𔓂","𔓃"],
    operadores: ["∇","∆","∂","∑","√","∞","⊕","⊗","⊙","⌀","∮"],
    estrellas: ["✦","✧","⋆","·","∗","✷","✸","٭","*","⁎"],
  },

  /* ---------------------------------------------------------------
     técnica — la jerga del panel.
  --------------------------------------------------------------- */

  tecnica: {
    siglas: ["NAV","ORB","SEN","MEM","SYS","TRX","VEL","ALT","SIG","ERR","LOG","BCK","AUX","GRAV","IONO","HULL"],
    unidades: ["dB","Hz","km/s","µSv","°K","UA","%","ppm","rad","s⁻¹"],
    horasRaras: [
      "HORA SIN SOL","HORA DE LA ANTENA","TERCERA VIGILIA","HORA CERO MENOS ALGO",
      "HORA LOCAL DE NINGUNA PARTE","MADRUGADA PERPETUA","HORA DEL PRIMER SILENCIO",
      "HORA PRESTADA","VÍSPERA","HORA DE MANTENIMIENTO DEL CIELO",
    ],
    instrumentos: [
      "espectrómetro de masas","magnetómetro de fluxgate","cámara de niebla",
      "radiómetro de microondas","interferómetro","cromatógrafo de gases",
      "detector de partículas Cherenkov","fotómetro de tránsitos","dosímetro",
      "acelerómetro","sonda Langmuir","bolómetro","gravímetro","altímetro láser",
    ],
    unidadesDuras: ["K","pc","AU","M☉","L☉","nm","GHz","mSv/h","g/cm³","bar","Da","µm","km/s","mag","Jy","erg/s","mol/L","‰ D/H"],
  },

  /* ---------------------------------------------------------------
     ASTROFÍSICA — el cielo como física, no como metáfora.
     lo que los instrumentos miden antes de que el relato lo toque.
  --------------------------------------------------------------- */

  astrofisica: [
    "enana roja tipo M4V, 3200 K, fulguraciones cada 40 h que esterilizarían cualquier hidrosfera expuesta",
    "gigante roja en rama asintótica, perdiendo 10⁻⁶ masas solares al año en un viento de polvo de silicatos",
    "púlsar de milisegundo, periodo 1.6 ms, campo magnético 10⁸ teslas, faro que barre el sistema 625 veces por segundo",
    "enana blanca de 0.6 masas solares enfriándose desde hace 4 gigaaños; su atmósfera de hidrógeno delata metales que no debería tener: está comiéndose un planeta",
    "binaria eclipsante: dos soles se ocultan cada 3.2 días y la curva de luz dibuja una V doble",
    "nube molecular gigante, 15 K, densidad 10⁴ moléculas por cm³, cuna de estrellas donde el CO y el amoníaco cantan en radio",
    "disco protoplanetario con surcos: algo del tamaño de Neptuno está barriendo su órbita en polvo y hielo",
    "microlente gravitacional: una masa invisible amplificó la estrella de fondo durante 34 días y volvió a soltarla",
    "chorro relativista de un núcleo activo, plasma a 0.99 c, sincrotrón desde la radio hasta los rayos gamma",
    "remanente de supernova en expansión, 12000 km/s, sembrando el medio de hierro, níquel y oxígeno recién forjados",
    "estrella de neutrones con corteza de hierro cristalino bajo una gravedad de 10¹¹ g; una cucharada pesaría mil millones de toneladas",
    "cinturón de escombros a 40 UA, colisiones que reponen el polvo más rápido que la presión de radiación lo barre",
    "línea de hielo del sistema: más allá de 2.7 UA el agua se congela y la química cambia de reglas",
    "corrimiento al rojo z = 0.003 en las líneas del hidrógeno: la fuente se aleja a 900 km/s",
    "oscilación de 5 minutos en la fotosfera: la estrella tañe como campana, y la astrosismología lee su interior",
    "curva de rotación plana: la galaxia gira como si pesara diez veces lo que brilla",
  ],

  /* ---------------------------------------------------------------
     TELEMETRÍA — lecturas crudas de a bordo. números con vértigo.
  --------------------------------------------------------------- */

  telemetria: [
    "flujo de partículas 3.1e6 cm⁻²s⁻¹ · viento solar en calma · rotación 0.4°/s",
    "temperatura de color 2.7 K en la banda ancha: el fondo cósmico, otra vez, tan puntual",
    "dosis acumulada 214 mSv · umbral de reparación de a bordo excedido en un 12%",
    "campo magnético local 4.7 nT, inclinación 63°, aguja apuntando a nada catalogado",
    "densidad de plasma 8 e⁻/cm³ · deriva radial 0.002 UA por ciclo · sin fuente aparente",
    "espectro de masas: picos en 2, 16, 17, 18 Da — hidrógeno, metano, agua. lo esperable. lo hermoso.",
    "albedo del cuerpo objetivo 0.06: negro como el carbón, más oscuro que cualquier metáfora del vacío",
    "paralaje 0.31 mas: la estrella está a 3.2 parsecs, y aún así el mensaje llegó",
    "aceleración no gravitacional 8.5e-10 m/s²: algo empuja a la sonda y no es la luz",
    "relación señal/ruido 3.2σ en la banda de 1420 MHz: por debajo del umbral de asombro. por ahora.",
    "gradiente térmico 140 K entre la cara al sol y la cara a la sombra del objeto",
    "razón isotópica D/H = 3.1 veces la terrestre: esta agua no nació donde la nuestra",
  ],

  /* ---------------------------------------------------------------
     ESPECTROSCOPÍA / BIOSIGNATURAS — leer una atmósfera de lejos.
  --------------------------------------------------------------- */

  espectros: [
    "banda de absorción a 760 nm: oxígeno molecular. en equilibrio no debería estar. algo lo repone.",
    "metano y oxígeno coexistiendo fuera de equilibrio termodinámico: dos gases que se destruyen mutuamente, presentes a la vez. la firma clásica. la que no se atreve uno a creer.",
    "línea de fosfina a 1.1 mm en la capa de nubes: no sabemos abióticamente cómo llegó ahí",
    "clorofila no; algo que absorbe en el infrarrojo cercano, un borde rojo corrido, un pigmento para otra estrella",
    "sulfuro de dimetilo en trazas: en la Tierra sólo lo fabrica el plancton",
    "el espectro de reflexión tiene un escalón a 720 nm: vegetación, o mineral que finge vegetación",
    "óxido nitroso, cloro-metano, isopreno: el catálogo de gases que la vida deja como huella dactilar",
    "agua, dióxido de carbono, ozono. tres líneas. una biosfera cabe en tres líneas y en la duda de si son tres.",
    "estacionalidad en el CO₂: sube y baja con el año del planeta, como si algo respirara a escala de mundo",
    "polarización circular en la luz reflejada: quiralidad. las moléculas de allá eligieron una mano, como las de acá.",
  ],

  /* ---------------------------------------------------------------
     EXOQUÍMICA — la química de allá, con otras reglas.
  --------------------------------------------------------------- */

  exoquimica: [
    "bioquímica de solvente no acuoso: metano líquido a 94 K como disolvente, membranas de azotosomas en vez de lípidos",
    "esqueleto de silicio en vez de carbono, enlaces Si–Si estabilizados por el frío, un metabolismo que respira a paso geológico",
    "quiralidad invertida: sus aminoácidos giran a la derecha; los nuestros, a la izquierda. no podríamos comernos. ni infectarnos.",
    "redox basado en azufre en lugar de oxígeno: energía sacada de sulfatos, aliento de huevo podrido, vida sin cielo azul",
    "amoníaco como disolvente bajo alta presión: enlaces de hidrógeno más débiles, reacciones más lentas, una vida paciente",
    "el disolvente es agua, pero salmuera de perclorato: anticongelante natural, líquida a 210 K, hostil y habitable a la vez",
    "energía quimiosintética de gradientes hidrotermales: no necesita estrella, le basta una grieta caliente en la roca",
    "polímeros de intercambio de información distintos del ADN: ácidos nucleicos con esqueleto de treosa, un alfabeto de seis letras",
    "cofactores de metales pesados: enzimas centradas en tungsteno y arsénico donde las nuestras usan hierro y magnesio",
    "termofilia extrema: proteínas estables a 130 °C, plegadas con puentes que las nuestras no saben hacer",
  ],

  /* ---------------------------------------------------------------
     EXOBIOLOGÍA — anatomía y fisiología de lo que se encuentra.
     el hallazgo importa por su cuerpo, no sólo por su lenguaje.
  --------------------------------------------------------------- */

  exobiologia: [
    "simetría radial de orden cinco, sin cefalización: no tiene cabeza porque no tiene adelante; todo su cuerpo es frente",
    "un tegumento de quitina fluorada, transparente al ultravioleta, opaco a nuestra idea de piel",
    "sistema circulatorio abierto con hemolinfa a base de vanadio: azul verdoso, transporta oxígeno con vanabinas en vez de hemoglobina",
    "respira por difusión a través de tráqueas ramificadas; no tiene pulmones, tiene un bosque interno de tubos de aire",
    "el organismo es colonial: cada individuo es un órgano de otro mayor, como una sifonóforo, como una nave tripulada por sí misma",
    "neuronas distribuidas en una red sin centro, un cerebro que es todo el cuerpo, una inteligencia sin capital",
    "reproducción por mitosis diferida: se divide sólo cuando la radiación ambiental sube, la muerte como disparador de la vida",
    "metabolismo basal casi nulo: hiberna entre tránsitos estelares, despierta un día por año local, envejece en tiempo geológico",
    "fotótrofo por una segunda piel de bacterias simbióticas: no come, cultiva; su hambre es un jardín",
    "osteología imposible: un endoesqueleto de aragonito biomineralizado, huesos que crecen como coral, se reparan como estalactitas",
    "termorregulación por cambio de color: pigmentos que se abren al frío y se cierran al calor, una fisiología que también es semáforo",
    "sin sistema nervioso: coordina el movimiento por ondas de presión hidrostática, piensa con el agua que tiene adentro",
    "un ciclo vital con tres cuerpos distintos: larva nadadora, adulto sésil, forma de dispersión que es casi sólo semilla y viento",
    "quimiorreceptores en vez de ojos: no ve la luz, huele la química del espacio, lee gradientes como nosotros leemos paisajes",
  ],

  /* ---------------------------------------------------------------
     AUTOPSIA DE SONDA — la anatomía de lo hallado, sea vivo o
     máquina. una sonda también tiene fisiología. y forense.
  --------------------------------------------------------------- */

  autopsiaSonda: [
    "carcasa de aleación de titanio-aluminio, erosionada por micrometeoritos: 8000 impactos por metro cuadrado, cada uno una fecha",
    "el reactor de radioisótopos sigue tibio: plutonio-238, vida media 87.7 años, late aún después de que su misión murió",
    "memoria de estado sólido intacta pero cifrada; el mensaje sobrevivió al cuerpo, como suele pasar",
    "los paneles solares degradados al 4% de eficiencia: el sol de esta sonda quedó demasiado atrás",
    "junta de sellado cristalizada por el frío: fatiga térmica tras un millón de ciclos día-noche",
    "restos orgánicos en la esclusa: aminoácidos, no todos terrestres; polizones que hicieron el viaje y no volvieron",
    "la antena de alta ganancia doblada 40°: un impacto la desalineó y la sonda pasó siglos hablándole al lugar equivocado",
    "biopelícula extremófila colonizando el disipador: algo aprendió a vivir de su calor residual",
    "la placa dorada intacta: un pulsar-mapa, dos figuras desnudas, y el hidrógeno como piedra de Rosetta; nadie vino a leerla",
    "corrosión por cosmoquímica: el regolito adherido reaccionó con la aleación, mineralizando la superficie en un óxido nuevo",
    "el giroscopio detenido a mitad de un giro: su último gesto fue orientarse hacia una estrella que ya cambió de nombre",
    "fluido hidráulico congelado en las articulaciones: la sonda murió estirando un brazo hacia algo",
  ],

  /* ---------------------------------------------------------------
     PLANETOLOGÍA — cuerpos como geología, no como símbolo.
  --------------------------------------------------------------- */

  cuerposDuros: [
    "supertierra de 1.8 radios terrestres, 6 masas, gravedad de 1.4 g y una tectónica que nunca descansa",
    "mundo océano bajo una corteza de hielo de 30 km; abajo, un mar salado más grande que todos los de la Tierra juntos",
    "gigante gaseoso caliente, un júpiter a 0.02 UA, atmósfera a 2400 K donde llueve hierro en el lado nocturno",
    "luna con criovolcanes: géiseres de agua y amoníaco que congelan penachos de 200 km, sembrando un anillo",
    "planeta bloqueado por marea: una cara en día perpetuo, otra en noche eterna, y una franja crepuscular donde cabría la vida",
    "mundo de lava: océanos de silicato fundido, una atmósfera de roca vaporizada que condensa y llueve piedra",
    "enano helado del cinturón externo, superficie de nitrógeno y metano congelados, un cielo con el sol reducido a estrella",
    "planeta errante sin estrella, calentado sólo por su propio decaimiento radiactivo, un océano posible bajo kilómetros de hielo negro",
    "atmósfera de hidrógeno-helio sobre un núcleo de agua supercrítica: ni líquida ni gas, una química de olla a presión planetaria",
    "regolito rico en percloratos y peróxidos: el suelo es oxidante, esteriliza lo que toca, un desierto que muerde",
  ],

  /* ---------------------------------------------------------------
     INFORMES CIENTÍFICOS — plantillas con ranuras {…} para el motor.
     el discurso de la misión: frío, preciso, contaminable.
  --------------------------------------------------------------- */

  informesCientificos: [
    "OBSERVACIÓN {n}: se detecta {astro}. el instrumento de guardia — {instrumento} — confirma la lectura en tres pasadas. se descartan artefactos. se recomienda no nombrar el hallazgo hasta caracterizarlo, aunque la tripulación (una manera de hablar) ya le puso nombre.",
    "ANÁLISIS ESPECTRAL: {espectro} la firma es compatible con actividad biológica, pero también con {exoquimica}. el criterio de la misión ordena preferir la hipótesis aburrida hasta agotar las mundanas. el criterio de la nave hace tiempo que no se agota.",
    "TELEMETRÍA CRUDA: {telemetria}. sin correlato en el catálogo. se archiva bajo anomalía de clase {n}. la anomalía, al ser archivada, deja de defenderse.",
    "REPORTE EXOBIOLÓGICO: el organismo presenta {exobiologia}. no se establece contacto: aún no se decide si esto que hace es comunicación o metabolismo. quizá, a esta escala, sean la misma función.",
    "FORENSE DE SONDA: la unidad hallada muestra {autopsia}. causa de muerte probable: el tiempo, que es la causa probable de todo lo que hallamos aquí. se recupera el mensaje; se pierde el cuerpo; la proporción de siempre.",
    "CARACTERIZACIÓN DEL CUERPO: {cuerpo}. índice de habitabilidad recalculado. la palabra habitable se usa aquí en su sentido técnico: capaz de sostener química compleja, no de recibirnos.",
    "NOTA DE LABORATORIO: la muestra de {exoquimica} reacciona a nuestros reactivos con una violencia cortés. no es hostil: es de otra gramática química. traducir una molécula cuesta más que traducir una lengua.",
  ],

};

/* la nave lee este archivo y lo considera, con razón, su parte más blanda */
