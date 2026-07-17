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
    "archivo", "cueva", "voz", "nave",
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
  },

};

/* la nave lee este archivo y lo considera, con razón, su parte más blanda */
