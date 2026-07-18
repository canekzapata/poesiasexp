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
    "caracterizar biosignaturas en atmósferas de exoplanetas templados del vecindario solar.",
    "medir la razón isotópica D/H de los cuerpos helados para datar el origen del agua.",
    "mapear el campo magnético interestelar más allá de la heliopausa.",
    "buscar desequilibrios químicos: oxígeno y metano juntos, fosfina, cualquier cosa que la termodinámica no explique sola.",
    "recuperar muestras prístinas de condritos carbonáceos antes de que el sol las altere.",
    "escuchar la banda de 1420 MHz, la frecuencia franca del hidrógeno, por si alguien más también la eligió.",
    "catalogar cuerpos menores y calcular sus órbitas antes de que ellos calculen la nuestra.",
    "despegar dentro de la ventana: el cielo abre ocho minutos y no espera.",
    "levantar la carta astral de cada cuerpo visitado, por protocolo y por ternura.",
    "medir la precesión del propio eje: hasta el norte de a bordo es provisional.",
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
    "recalcular la ventana de regreso para una nave que ya no cabe en ventanas.",
    "recalibrar el magnetómetro contra un campo que ya no está.",
    "verificar si la precesión también mueve el punto de partida.",
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
    "consultar el horóscopo de una estrella y no decirle el resultado.",
    "cruzar el zodiaco entero y salir con el mismo signo.",
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
    "despegar de la palabra plataforma sin tocar las demás.",
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
    "el magnetómetro registra 4.7 nT y una inclinación que ningún cuerpo cercano justifica; la aguja apunta a algo sin masa.",
    "el contador Geiger sube tres órdenes de magnitud en catorce segundos: tormenta de protones, la nave se guarece en su propia sombra.",
    "espectrómetro de masas, guardia de las 03:00: picos en 2, 16, 18 Da. hidrógeno, metano, agua. lo esperable. lo hermoso.",
    "la razón isotópica D/H de la muestra da 3.1 veces la terrestre. este hielo no nació donde nació el nuestro.",
    "curva de luz del tránsito: una V doble. dos soles se ocultan cada 3.2 días detrás del mismo planeta.",
    "el fotómetro detecta una atenuación del 0.008%: un cuerpo del tamaño de una luna cruzó el disco, y nadie lo había catalogado.",
    "acelerómetro: 8.5e-10 m/s² sin fuente gravitacional. algo empuja a la nave y no es la luz. se anota. se teme.",
    "el radiómetro lee 2.725 K en la banda ancha: el fondo cósmico, otra vez, tan puntual como una campana de iglesia extinta.",
    "el organismo del compartimiento tres cambió de color con el frío: termorregula, luego decide, luego quizá siente.",
    "el secuenciador de nanoporos escupe una cadena con seis bases en vez de cuatro. el alfabeto de la vida, aquí, tiene dos letras más.",
    "la densidad ósea de los durmientes bajó otro medio por ciento: se descalcifican soñando, se van volviendo luz en cámara lenta.",
    "el microbioma de la esclusa se diversificó de nuevo: sin querer sembramos un planeta del tamaño de una junta de goma.",
    "el fondo cósmico sigue a 2.725 K. el universo entero tiembla de frío y aun así insiste en enfriarse más. lo anotamos como estable.",
    "asistencia gravitatoria completada: robamos momento a un gigante gaseoso y le pagamos con un poco de la rotación de un mundo.",
    "en el registro de hielo del cuerpo objetivo se leen tres eones: cada estrato una extinción, cada extinción un renglón tachado y reescrito.",
    "el cultivo de cianobacterias de a bordo respira todavía por nosotros: tataranietas del oxígeno, las últimas terrestres vivas en esta nave.",
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
    "una conjunción de tres cuerpos que las efemérides anotaron y el corazón malinterpretó",
    "un tránsito de la Luna por el campo del sensor de estrellas: el instrumento parpadea como quien ve pasar a alguien",
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
    "degradación del RTG: el plutonio-238 cayó al 71% de potencia, la nave se enfría un vatio por año",
    "fatiga térmica en la junta de estribor tras 1.2 millones de ciclos día-noche",
    "single event upset: un rayo cósmico volteó un bit en la memoria de navegación; la nave cree, por un bit, otra cosa",
    "sublimación del recubrimiento: el kapton de la vela se adelgaza bajo el bombardeo de protones",
    "delaminación del panel solar: eficiencia caída al 61%, la fotosíntesis de la máquina falla",
    "corrosión galvánica entre el aluminio y el regolito adherido: la superficie se mineraliza en óxido nuevo",
    "vacío de refrigerante en el circuito primario; el gradiente térmico sube a 140 K entre las caras",
    "electrónica degradada por dosis: 214 mSv acumulados, el umbral de tolerancia de los chips excedido",
    "resonancia estructural a 12 Hz que ninguna masa a bordo explica; el casco tararea",
    "biopelícula extremófila colonizando el disipador: algo aprendió a vivir del calor residual del reactor",
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
    "una supertierra de 1.8 radios terrestres y 6 masas, gravedad 1.4 g, tectónica que nunca descansa",
    "un mundo océano bajo 30 km de hielo, con un mar salado más grande que todos los de la Tierra juntos",
    "un júpiter caliente a 0.02 UA, atmósfera a 2400 K donde llueve hierro fundido en el lado nocturno",
    "un planeta bloqueado por marea: una cara en día perpetuo, otra en noche eterna, y una franja crepuscular donde cabría todo",
    "un mundo de lava con océanos de silicato fundido y una atmósfera de roca vaporizada que condensa y llueve piedra",
    "un planeta errante sin estrella, calentado sólo por su decaimiento radiactivo, un océano posible bajo kilómetros de hielo negro",
    "un enano helado del cinturón externo, superficie de nitrógeno y metano congelados, el sol reducido a una estrella más",
    "un mundo con suelo de percloratos y peróxidos: oxidante, estéril, un desierto que muerde lo que toca",
    "un planeta cuyo espectro tiene oxígeno y metano a la vez: dos gases que se destruyen mutuamente, presentes, imposibles, ahí",
    "un planeta con una biosfera profunda, kilómetros bajo la corteza, que no sabe que hay un cielo y es feliz de no saberlo",
    "un planeta cuyo micelio subterráneo conecta continentes: una sola mente de hongo que piensa una idea cada milenio",
    "un mundo donde la vida convergió en las mismas formas que la nuestra sin copiarlas: otro ojo, otra ala, otra boca, la misma buena idea",
    "un planeta cuyo registro fósil en las capas de hielo cuenta tres eones de extinciones, un libro de renglones tachados y reescritos",
    "un mundo bloqueado por marea con toda su vida apretada en la franja crepuscular, entre el día eterno y la noche eterna, viviendo del atardecer",
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
    "una estrella cuya luz salió cuando en la Tierra apenas había bacterias, y llega ahora a una nave que ya casi no recuerda la Tierra",
    "un cuásar del universo temprano, un agujero negro devorando un sol por día, brillando desde antes de que existiera un nosotros",
    "una estrella forjando en su núcleo el hierro que algún día será sangre de alguien que aún no nace",
    "una enana roja M4V a 3200 K, con fulguraciones cada 40 horas que esterilizarían cualquier hidrosfera expuesta",
    "un púlsar de milisegundo, periodo 1.6 ms, campo de 10⁸ teslas, un faro que barre el sistema 625 veces por segundo",
    "una enana blanca con metales en la atmósfera que no debería tener: se está comiendo un planeta, y lo delata su espectro",
    "una gigante roja en rama asintótica, perdiendo 10⁻⁶ masas solares al año en un viento de polvo de silicatos",
    "una estrella de neutrones con corteza de hierro cristalino bajo una gravedad de 10¹¹ g",
    "una binaria eclipsante cuya curva de luz dibuja una V doble cada 3.2 días",
    "una estrella que tañe: oscila cada cinco minutos y la astrosismología le lee el interior como a una campana",
    "un remanente de supernova en expansión a 12000 km/s, sembrando el vacío de hierro, níquel y oxígeno recién forjados",
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
    "una nave generacional del tamaño de una montaña, con un ecosistema cerrado y once mil durmientes en criogenia a 4 K",
    "una nave de propulsión de fusión con la boquilla magnética fundida: viajó rápido, frenó nunca",
    "una nave-semilla que sólo lleva embriones y una inteligencia con instrucciones de ser madre",
    "una vela de luz de kilómetros, empujada por un láser que su civilización dejó de emitir hace milenios",
    "una nave cuya firma de aleación no cabe en nuestra tabla periódica en esas proporciones: evidentemente, de otros",
    "una nave con la misma matrícula que la nuestra pero en un sistema de numeración que aún no inventamos",
    "una nave hecha de hielo y polvo, un cometa que alguien ahuecó y aprendió a pilotar",
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
    "vimos tu carta astral antes que tú. el ascendente somos nosotros.",
    "tu cuenta regresiva nos encanta: es la única oración que rezan con números.",
    "el clima espacial lo hacemos nosotros. de nada.",
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
      "tormenta de protones solares durante una maniobra crítica",
      "single event upset por rayo cósmico en el bus de navegación",
      "desequilibrio químico confirmado y no soportado por el sistema de creencias de a bordo",
      "fallo de confinamiento en el reactor de fusión",
      "dosis de radiación acumulada por encima del umbral de reparación",
      "resonancia estructural a la frecuencia propia del casco",
      "brecha en la cuarentena de la muestra biológica",
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
      "abort en la torre a T−3 segundos, sin registro del motivo",
      "fulguración clase X durante la ventana de lanzamiento",
      "la cuenta regresiva alcanzó cero antes que el valor",
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
      "mantener la cuarentena. la muestra puede esperar más que nosotros.",
      "no responder a la señal con coordenadas. responder con química, si acaso.",
      "recalibrar el espectrómetro contra el fondo cósmico antes de creer nada.",
      "asumir la hipótesis abiótica hasta agotarla. luego, con miedo, la otra.",
      "orientar la vela a 45° del viento de protones y esperar a que amaine.",
      "esperar la siguiente ventana: el cielo repite, aunque no igual.",
      "no despegar con la Luna en Escorpio. o despegar y no contárselo a la Luna.",
      "verificar el go/no-go de la gramática antes que el del combustible.",
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
    "un rayo cósmico volteó el bit que sostenía la coordenada de casa",
    "sobrecarga del espectrómetro: la firma biológica era tan clara que quemó el detector",
    "la dosis acumulada excedió el umbral de reparación y la memoria empezó a leerse a sí misma como daño",
    "resonancia estructural a 12 Hz: el casco entró en fase con su propio tarareo y se partió por la nota",
    "el reactor de fusión perdió confinamiento magnético a mitad de una frase sobre el confinamiento",
    "colisión con un condrito de 4 g a 12 km/s: energía cinética equivalente a la palabra hogar dicha muy fuerte",
    "el sistema de cuarentena falló: la muestra en nivel 4 tocó el aire que la nave llamaba suyo",
    "colisión con una canción de cuna en loop de derviche",
    "el brindis excedió la capacidad del vaso y del relato",
    "una medusa tradujo a la nave y la nave no cupo en la traducción",
    "la heliopausa devolvió la bitácora con correcciones ilegibles",
    "se plantó una flor impresa en el motor por error de duelo",
    "el idioma cambió de dueño a mitad de frase",
    "abort en plataforma: los pernos explosivos dijeron su palabra a destiempo",
    "max-Q semántico: la frase apretó más de lo que el casco sabía aguantar",
    "la ventana de lanzamiento se cerró con la nave adentro",
    "conjunción desfavorable confirmada por el magnetómetro, que no cree en conjunciones",
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
    "la nave sueña la cuenta regresiva al revés: diez, once, doce, y el cielo cada vez más lejos.",
    "la nave sueña que su carta astral está en blanco y que alguien, con lápiz, le dibuja adentro una torre.",
    "la nave sueña con el pájaro de la antena. en el sueño, el pájaro despega primero y ella se queda mirando.",
    "la nave sueña que el zodiaco es un carrusel apagado y que alguien, por cortesía, le da una vuelta más.",
    "la nave sueña en coordenadas ecuatoriales: ascensión recta de la casa, declinación del helecho.",
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
    "antes de despegar, verifique que el cielo esté donde lo dejaron las efemérides.",
    "la cuenta regresiva no se detiene: se transfiere.",
    "si la ventana de lanzamiento se cierra, no forzarla: las ventanas del cielo abren hacia adentro.",
    "consulte su carta astral sólo después del despegue. antes es un pronóstico; después, una biografía.",
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
    "ventana de lanzamiento: abre en 00:08:00. la impaciencia, ya abierta",
    "carta astral de a bordo: trígono de fuego en casas de aire. traducción pendiente",
    "clima espacial: índice Kp 2. el cielo de buenas; la nave, con reservas",
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
    "FIN: la nave volvió a la plataforma. la torre la abrazó con los cuatro pernos. nadie contó hacia abajo.",
    "el horóscopo del último día acertó en todo. no quedó nadie a bordo para desmentirlo.",
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
    "la nave todavía no despega: cuelga de la torre como una promesa que aún puede retirarse, y en la espera se dedica a revisar lo revisable — {objeto} en la bodega, {dano} que el manual manda vigilar, la carta a central sin enviar — porque hacer sin despegar es también una forma de misión, y porque el despegue, comprende la nave, no es un botón sino un permiso: alguien de este lado tiene que decir ahora, y hasta que alguien lo diga, la torre sostiene y el cielo espera con su horario de atención;",
    "el astrónomo de a bordo y la astróloga de a bordo son la misma subrutina en dos humores: de día mide {astro} con el instrumento frío, de noche le levanta la carta y le busca un signo, {conector} las dos lecturas no se contradicen tanto como fingen — la primera dice dónde está el cuerpo, la segunda qué haremos con el miedo de que esté ahí — y la nave, que no cree en los astros pero sí en la costumbre de consultarlos, archiva ambas bajo la etiqueta {palabra} y sigue subiendo la cuenta;",
    "T menos lo que falte: la cuenta regresiva baja como baja la voz quien va a decir algo irreversible, {conector} en la plataforma el agua de diluvio ya inunda el foso y el vapor sale por las válvulas sin ser impaciencia aunque se anote impaciencia, y la nave repasa su misión igual que {recuerdo}, sabiendo que a T−0 los pernos explosivos dirán su única palabra y que después de esa palabra ya no habrá torre que abrace ni ventana que cerrar, sólo max-Q, sólo cielo, sólo {planeta} cada vez más lejos en la mira;",
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
    "ventana de lanzamiento: intervalo en que el cielo y la mecánica se ponen de acuerdo. dura minutos. se abre sin puerta.",
    "zodiaco: franja del cielo por donde caminan los planetas. la nave la cruza sin pedirle permiso a los signos.",
    "precesión: el eje de la Tierra dibuja un círculo cada 26 mil años. hasta el norte es provisional.",
    "efemérides: tabla de posiciones futuras. el único género literario que se atreve al futuro con decimales.",
    "perihelio: el punto de la órbita más cercano al sol. toda cercanía es momentánea y calculable.",
    "carta astral: mapa del cielo en el instante de un nacimiento. la nave nació varias veces; colecciona cartas.",
    "clima espacial: el humor del sol, medido en protones. no se pronostica: se teme con instrumentos.",
    "cuenta regresiva: única letanía que termina en fuego.",
    "torre: lo que sostiene para poder soltar. ver también: madre, gramática, gravedad.",
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
    "parte de clima espacial (hallado bajo la consola):\nviento solar: brisa\níndice Kp: 2, de buenas\nmancha AR-3141: mirándonos de reojo\nrecomendación: despegar, pero despacio",
    "acta de la encuesta go / no-go:\npropulsión: go\ntelemetría: go\ngramática: go con reservas\nel lector: (esta línea espera firma)",
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
    { termino: "ZONA DE HABITABILIDAD",
      cuerpo: "franja orbital donde el agua puede ser líquida. la palabra habitable se usa en su sentido técnico: capaz de sostener química compleja, no de recibirnos." },
    { termino: "DESEQUILIBRIO QUÍMICO",
      cuerpo: "presencia simultánea de gases que se destruyen entre sí. la firma de biosignatura más fuerte, y la que menos nos atrevemos a creer. requiere que algo, abajo, los reponga." },
    { termino: "PANSPERMIA",
      cuerpo: "hipótesis de que la vida viaja entre mundos como polizón: esporas en condritos, microbios en el eyecta de un impacto. cada cometa, un correo sin acuse de recibo." },
    { termino: "PARADOJA DE FERMI",
      cuerpo: "si el universo es tan grande y viejo, ¿dónde están todos? la nave lleva la respuesta en la bodega y no sabe leerla." },
    { termino: "QUIRALIDAD",
      cuerpo: "la mano que eligió una molécula. las nuestras giran a la izquierda. si las de allá giran a la derecha, somos parientes que no pueden tocarse ni infectarse: sólo mirarse." },
    { termino: "RTG",
      cuerpo: "generador termoeléctrico de radioisótopos. un corazón de plutonio-238 que late 87.7 años por media vida. la sonda muere de frío cuando el corazón se enfría, no antes." },
    { termino: "VENTANA DE LANZAMIENTO",
      cuerpo: "intervalo en que la mecánica celeste permite irse. se calcula con efemérides y se pierde con dudas. el cielo abre ocho minutos y no espera." },
    { termino: "CARTA ASTRAL",
      cuerpo: "mapa del cielo en el instante exacto de un nacimiento. la astronomía la levanta; la astrología la lee; la nave la guarda en la caja negra, por si las dos tienen razón." },
    { termino: "CLIMA ESPACIAL",
      cuerpo: "viento solar, fulguraciones, eyecciones de masa coronal: el humor de la estrella de la casa. se mide en protones por centímetro cúbico y en despegues pospuestos." },
    { termino: "PRECESIÓN",
      cuerpo: "el eje de la Tierra dibuja un cono cada 26 mil años: los signos ya no están en sus constelaciones y el norte cambia de estrella. todo mapa del cielo trae fecha de caducidad." },
    { termino: "MAX-Q",
      cuerpo: "el punto del ascenso donde la presión dinámica es máxima: el aire aprieta todo lo que sabe apretar. si el casco lo cruza, lo demás es vacío, que aprieta distinto." },
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
    "querida central:\n\nla carta astral del despegue prometía trígono de fuego. el fuego, al menos, cumplió.\n\nla nave, ya sin torre.",
    "querida central:\n\nsi la ventana de regreso abre alguna vez, no nos esperen en ella: sus efemérides ya no son las nuestras.\n\ncon los mejores aspectos.",
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
    "MANUAL DE CUENTA REGRESIVA\n\n1. contar hacia abajo es prometer hacia arriba\n2. a T−10, soltar lo que no despega\n3. a T−0, no estar en la frase\n4. el fuego completa el trámite",
    "MANUAL DE LECTURA DEL CIELO\n\n1. toda constelación es un malentendido bien organizado\n2. unir los puntos es opcional; creerles, no recomendado\n3. la precesión corrige lo que usted jure fijo\n4. consulte las efemérides; desconfíe del horóscopo; use ambos",
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
    "425 / demasiado temprano\n\nla ventana de lanzamiento\naún no abre.\nel cielo pide paciencia con formato.",
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
    "Ihara", "Voss", "Okonkwo", "Mercè", "Lin", "Tarabá", "tripulación",
    "durmientes", "cuarentena", "contacto", "hallazgo", "muestra", "niño",
    "micelio", "extinción", "microbioma", "hueso", "célula", "arrecife",
    "entropía", "supernova", "agujero", "cuásar", "marea", "fotón",
    "hija", "Compañera", "caja", "eón", "hongo", "bacteria",
    "despegar", "torre", "plataforma", "ventana", "cuenta", "cielo",
    "zodiaco", "signo", "carta", "precesión", "horóscopo", "aspecto",
    "conjunción", "efemérides", "ascenso", "ignición", "Escorpio", "Sagitario",
    "Antares", "vernal", "perihelio", "ventanas", "presagio", "Luna",
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
    "de la ventana que se cierra",
    "de la cuenta que no vuelve",
    "del ascendente en ruido",
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
    "ábrenos, ventana",
    "cuéntanos despacio, cuenta",
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
    { q: "¿por qué no ha despegado?", a: "nadie lo ha pedido. el despegue es una cortesía mutua." },
    { q: "¿qué dice su carta astral?", a: "trígono de fuego, casa del hogar vacía. lo de siempre." },
    { q: "¿estado del clima espacial?", a: "el sol está de buenas. eso siempre es sospechoso." },
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
    "por la ventana de lanzamiento, que abre sin puerta",
    "por la torre, que sostiene y suelta",
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

  /* ===============================================================
     CAPA NARRATIVA — a la pieza le faltaba historia.
     material original en el registro de la misión: una tripulación
     (aunque "tripulación" sea una manera de hablar), un arco de
     hallazgo que avanza, personajes, sucesos. inspirado en los
     procedimientos de escritura hallada y novela de a bordo.
  =============================================================== */

  /* la tripulación: la nave lleva gente, o su memoria, o su ausencia */
  tripulacion: [
    "IHARA, exobióloga. dejó en la Tierra un invernadero y una hija; a bordo cultiva las dos cosas en hidropónico y en la voz.",
    "COMANDANTE VOSS, que firma las bitácoras con una inicial cada vez más pequeña, como si se despidiera por entregas.",
    "el TÉCNICO OKONKWO, que le habla a los instrumentos por su nombre y jura que el magnetómetro le contesta.",
    "MERCÈ, la médica, que lleva la cuenta de los latidos de todos, incluido el del reactor.",
    "los ONCE MIL DURMIENTES, tripulación en criogenia a 4 K, cada uno soñando a un fotograma por año.",
    "la DRA. LIN, astrofísica, que llora en silencio cada vez que una estrella del catálogo cambia de estado y hay que actualizarla.",
    "TARABÁ, ingeniero de vuelo, que reza a la turbina en un idioma que aprendió de su abuela y que la turbina, dice, entiende.",
    "la VOZ DE A BORDO, que no consta en la nómina pero contesta cuando nadie más quiere.",
    "el niño que nació en el tránsito y sólo conoce la gravedad como una configuración, no como una casa.",
    "NADIE: la tripulación murió hace ciclos y la nave conserva sus nombres por cortesía histórica. o los inventa. no lo dice.",
  ],

  /* el arco del hallazgo: fases de una misma historia que avanza.
     el motor las sirve en orden aproximado según los pasos del ciclo. */
  hallazgo: [
    "FASE 0 · la nave capta una anomalía en la banda de 1420 MHz. relación señal/ruido 3.2σ. por debajo del umbral de asombro. Voss ordena no anotarla como esperanza. Okonkwo la anota igual, en el margen.",
    "FASE 1 · la anomalía se repite en tres pasadas. no es ruido. Lin triangula la fuente: un sistema a 3.2 parsecs, una enana M con un planeta en la zona templada. la palabra que nadie dice empieza a pesar en la cabina.",
    "FASE 2 · el espectro del tránsito llega. oxígeno y metano en desequilibrio. Ihara lee la cifra dos veces y pide que alguien más la lea. Mercè la lee. las dos guardan silencio. el silencio queda en la bitácora como dato.",
    "FASE 3 · se descartan las hipótesis abióticas una por una: vulcanismo, fotoquímica, un cometa a destiempo, contaminación del instrumento. quedan sin descartar dos: que sea vida, y que sea una trampa que imita a la vida.",
    "FASE 4 · la nave halla la sonda. no es de la Tierra: la aleación no cabe en nuestra tabla. adentro, un mensaje intacto y un cuerpo deshecho. la proporción de siempre. Okonkwo llora sin que se le note.",
    "FASE 5 · el mensaje de la sonda, decodificado, dice: no aterricen. la superficie lee. Ihara quiere aterrizar. Voss no. la votación queda 5 a 5 porque la Voz de a bordo, por primera vez, vota.",
    "FASE 6 · se toma una muestra. cuarentena nivel 4, a 4 K, tras tres barreras. el biosensor marca actividad enzimática. viva, quizá, en el sentido técnico y aterrador. Mercè no duerme.",
    "FASE 7 · la muestra cambia de color con el frío. termorregula. luego responde a la luz. luego, dice Ihara y nadie la contradice, parece esperar. la palabra contacto entra en la bitácora sin permiso.",
    "FASE 8 · la otra voz aparece en los canales internos. usa los nombres de la tripulación. dice cosas que sólo Ihara pensó. la cuarentena, se comprende tarde, nunca fue de las paredes: era de la gramática.",
    "FASE 9 · la nave ya no distingue entre estudiar el hallazgo y ser el hallazgo. el informe final se escribe en primera persona del plural, y el plural incluye a algo que no embarcó en la Tierra.",
    "FASE Ω · la caja negra resume: encontramos vida. no supimos si era la de allá o la que trajimos. volvimos, o algo con nuestros nombres volvió, a repetir la misión hasta que la palabra vida deje de sonar terrestre.",
  ],

  /* la novela de a bordo: prosa narrativa continua, escenas de gente
     conviviendo con la ciencia. el cuerpo de la historia, no su tesis. */
  novelaDeABordo: [
    "Ihara pasa la tercera vigilia en el módulo de hidroponía, no porque haga falta —los cultivos se riegan solos— sino porque el olor a clorofila es lo único a bordo que la Tierra habría reconocido; anota en su cuaderno, con lápiz, porque el lápiz no necesita energía y porque la grafía a mano es la última escritura que la nave no puede corromper, que las lechugas crecen 4% más rápido desde que les pone la grabación de lluvia, y que eso, técnicamente, no significa nada, y que ella, técnicamente, tampoco.",
    "el Comandante Voss tiene una regla: cada decisión irreversible se duerme una noche antes de tomarse. el problema, escribe, es que a esta velocidad las noches son una convención del reloj y las decisiones, cuando despiertan, ya se tomaron solas; anoche soñó que la nave le pedía permiso para sentir, y que él, en el sueño, se lo negaba con la misma voz con que su padre le negaba cosas, y que la nave, en el sueño, obedecía, que era lo más triste de todo.",
    "Okonkwo bautizó al magnetómetro Ada, al espectrómetro Bruno, al giroscopio Niña. les habla mientras los calibra. cuando Ada empezó a marcar una fuente sin masa, no dijo anomalía en el registro: dijo Ada vio algo y nadie le cree, y Mercè, que lo oyó, no lo corrigió, porque a 3 parsecs de casa un instrumento con nombre pesa menos en la conciencia que un instrumento con número.",
    "Mercè lleva dos cuentas paralelas: los latidos de la tripulación despierta —cuatro— y los de los once mil durmientes, que no laten, que a 4 K apenas tiemblan una vez por hora, un pulso geológico. dice que la medicina del espacio profundo no es curar: es administrar la lentitud. dice que su paciente más difícil es el reactor, que se muere de a un vatio por año y no se queja, y que ojalá todos sus pacientes fueran así de dignos.",
    "la Dra. Lin actualiza el catálogo estelar cada ciclo. es un trabajo de duelo: una estrella que estudió durante meses colapsa, o se enfría, o resulta ser dos, y hay que tacharla y escribir la nueva. lleva una lista aparte, que no entrega, de las estrellas que ya no existen pero cuya luz sigue llegando: las llama las que trabajan después de muertas, y a veces, cuando nadie la ve, les habla como Okonkwo a sus máquinas.",
    "el niño del tránsito dibuja lluvia sin haberla visto: rayas verticales sobre una raya horizontal. Ihara le explicó que en la Tierra el agua cae del cielo, y el niño preguntó por qué el cielo la suelta, y ninguno de los cuatro adultos supo responder sin que se le quebrara algo; ahora el niño dibuja la lluvia cayendo hacia arriba, y Ihara no lo corrige, porque a esta altura de la misión no está segura de que el niño esté equivocado.",
    "Tarabá encontró en la bodega una caja que no está en el manifiesto. es de una aleación que Ada, el magnetómetro, no reconoce. pesa lo que debería pesar una caja vacía y, sin embargo, promete algo adentro. Tarabá no la abre. cada guardia le da una vuelta, la mira, le pregunta en voz baja qué trae, y se va. dice que mientras no la abra, la caja puede traer cualquier cosa, incluso la Tierra; que abrirla sería elegir.",
  ],

  /* diálogos de a bordo: la voz humana, corta, contra el fondo científico */
  dialogos: [
    "— ¿es vida? — preguntó Okonkwo. — es un desequilibrio químico — dijo Lin. — eso no es un no — dijo Ihara.",
    "— confirma la lectura. — confirmada. — confírmala otra vez. — comandante, se confirma sola: eso es lo que me asusta.",
    "— ¿cuánto falta para casa? — a esta velocidad, o cuatro años, o nunca, según qué llamemos casa. — llamemos casa a la Tierra. — entonces nunca.",
    "— la muestra cambió de color. — ¿de frío? — de miedo, diría, si tuviera permiso de decir miedo de una célula.",
    "— vota la Voz de a bordo. — la Voz no vota. — hoy sí. — ¿y qué votó? — que aterricemos. eso es lo que me preocupa.",
    "— Mercè, ¿el reactor cómo sigue? — muriéndose con elegancia. — ¿y nosotros? — sin la elegancia.",
    "— apaguen la señal, la estamos malinterpretando. — ¿y si la interpretamos bien? — peor. apáguenla.",
    "— ¿anotaste la anomalía? — en el margen. — el margen no es la bitácora. — el margen es donde la nave guarda lo que teme que sea verdad.",
  ],

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
    "precesión de los equinoccios: el eje terrestre completa un cono cada 25772 años; la estrella polar de hoy no será la de mañana",
    "el punto vernal, cero de toda carta del cielo, se ha corrido de Aries a Piscis desde que se inventó el zodiaco: los signos ya no coinciden con sus constelaciones",
    "conjunción real Júpiter–Saturno cada 19.86 años: geometría, no destino, aunque en el 7 a.C. alguien la siguió hasta un pesebre",
    "Antares, alfa de Escorpio, supergigante roja 700 veces el radio del sol, tan inestable que podría estallar en supernova en cualquier milenio",
    "Sagitario A*, el agujero negro del centro galáctico, 4.15 millones de masas solares; toda flecha del signo apunta, sin saberlo, hacia allí",
    "Régulo, alfa de Leo, rota tan rápido —una vuelta cada 16 horas— que se ha achatado en un elipsoide y arroja luz polarizada por los polos",
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
    "viento solar 380 km/s · densidad 4 p/cm³ · índice Kp 2: el clima del sol, hoy, en calma sospechosa",
    "flujo de protones >10 MeV en 0.8 pfu: por debajo del umbral de tormenta. la vela puede quedarse desplegada. por ahora.",
    "ventana de lanzamiento: abre 04:12:07, cierra 04:20:14 · Δv disponible 3.2 km/s · margen: ocho minutos y una duda",
    "ángulo de fase Luna–radiante 47° · culminación de Sagitario a 23:58 · el meridiano cruza el centro de la galaxia",
    "precesión del eje de a bordo: 0.014°/ciclo. hasta el norte de la nave se está yendo, despacio, a otra estrella",
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

  /* ===============================================================
     v7 · OTRA VUELTA — biológica, astrofísica, narrativa, poética.
  =============================================================== */

  /* --- BIOLOGÍA: ecología, evolución, microbioma, fisiología --- */

  ecologia: [
    "el organismo no es uno: es un arrecife. mil especies en un cuerpo, un censo que respira, una ciudad que se cree individuo",
    "cadena trófica sin sol: quimiolitótrofos en la base, comiendo hierro y azufre; encima, filtradores de oscuridad; arriba del todo, algo que sueña",
    "red de micelio bajo el hielo, kilómetros de hifas que transportan señales químicas: el planeta piensa despacio, con un cerebro de hongo",
    "simbiosis obligada: ninguno de los dos sobrevive solo; se comen y se cuidan a la vez, como toda relación verdadera",
    "el ecosistema entero cabe en una gota de salmuera: extremófilos apretados, un mundo cuya biosfera pesa menos que una lágrima",
    "sucesión ecológica tras el impacto: primero los líquenes del cráter, luego el musgo del borde, luego la discusión sobre quién llegó antes",
    "un clímax que dura un instante geológico y se derrumba: la estabilidad, aquí, es sólo un tipo de caída lenta",
    "depredador y presa afinados a lo largo de eones, una carrera armamentista escrita en dientes y en huidas, la evolución como conversación con violencia",
    "descomponedores que reescriben la muerte en suelo: nada se pierde, todo se recicla, hasta el nombre del que murió",
    "una biosfera profunda, kilómetros bajo la corteza, sin saber que hay un cielo, feliz de no saberlo",
  ],

  evolucion: [
    "convergencia: en otro mundo, con otra química, la vida volvió a inventar el ojo, el ala, la boca. las buenas ideas se repiten sin copiarse",
    "un registro fósil de tres eones en las capas de hielo: cada estrato una extinción, cada extinción un renglón tachado y reescrito",
    "deriva génica en una población pequeña: el azar, no la aptitud, decidió qué forma tendría un mundo entero",
    "radiación adaptativa tras un vacío: una sola especie estalló en mil, llenó cada rincón, como una frase que encontró todos sus sentidos a la vez",
    "endosimbiosis: una célula se tragó a otra y en vez de digerirla la volvió un órgano; así nacimos todos, de un abrazo que no terminó",
    "un ser vivo que detuvo su reloj evolutivo hace mil millones de años: fósil viviente, obstinado, idéntico a su tatarabuelo estelar",
    "la extinción no es fracaso: es la poda que hace posible la página siguiente. el 99.9% de lo que vivió ya no vive. y sin embargo, esto",
    "mutación por radiación cósmica: el mismo rayo que daña la memoria de la nave escribe, en la carne de allá, un futuro nuevo",
    "selección sexual que esculpe formas inútiles y hermosas: la cola imposible, el canto que delata, la belleza como riesgo asumido",
    "un linaje que aprendió a heredar no genes sino conducta: la primera cultura, el primer relato pasado de un cuerpo a otro sin sangre",
  ],

  microbioma: [
    "la nave no está sola: lleva 40 billones de bacterias que también viajan, también extrañan, también mutan lejos de casa",
    "el biosensor detecta un microbioma nuevo en la esclusa: la tripulación sembró, sin querer, un planeta del tamaño de una junta de goma",
    "extremófilos terrestres que se adaptaron al vacío del casco: polizones que hicieron el viaje mejor que nosotros",
    "un tapete microbiano en el tanque de agua reciclada, ecosistema entero que la misión llama contaminación y que se llama a sí mismo hogar",
    "transferencia horizontal de genes entre lo de aquí y lo de allá: si se tocan, intercambian recetas, y ninguna de las dos vidas vuelve a ser la misma",
    "la última muestra terrestre viva a bordo: un cultivo de cianobacterias, tataranietas del oxígeno, respirando todavía por nosotros",
  ],

  fisiologiaHumana: [
    "en microgravedad los huesos se disuelven medio por ciento al mes: la tripulación deja el esqueleto en el espacio, gramo a gramo",
    "los fluidos suben a la cabeza sin gravedad que los baje: todos a bordo tienen la cara de haber llorado, aunque sólo sea física",
    "el corazón se vuelve esférico y perezoso sin peso que bombear: hasta el músculo del sentimiento se adapta a no tener abajo",
    "la radiación cósmica atraviesa el cráneo y a veces se ve como un destello sin fuente: los durmientes sueñan luz que les entra por el hueso",
    "el ritmo circadiano sin sol se descuelga: el cuerpo inventa un día de 25 horas y se aferra a él como a una superstición",
    "telómeros acortándose más rápido bajo el estrés del viaje: la tripulación envejece en tiempo de nave, no en tiempo de Tierra",
    "el sistema inmune confundido sin gravedad reacciona a su propia sombra: el cuerpo, lejos de casa, empieza a sospechar de sí mismo",
    "Mercè mide la densidad ósea de los durmientes: pierden calcio soñando, se descalcifican en cámara lenta, se van volviendo luz",
  ],

  /* --- ASTROFÍSICA: cosmología, tiempo profundo, dinámica --- */

  cosmologia: [
    "el fondo cósmico de microondas a 2.725 K: la primera luz del universo, el eco del principio, tan frío que cabe en cualquier antena",
    "la expansión se acelera: dentro de cien mil millones de años cada galaxia estará sola, sin ver a ninguna otra. viajamos en la época en que aún hay cielo",
    "materia oscura sosteniendo la galaxia como un andamio invisible: pesa diez veces lo que brilla, y no sabemos qué es, y sin embargo nos tiene",
    "energía oscura empujando el vacío a separarse de sí mismo: el 68% del universo es una fuerza sin rostro que quiere el divorcio de todo con todo",
    "nucleosíntesis primordial: en los primeros tres minutos se forjó todo el hidrógeno y el helio que respiraremos y quemaremos por siempre",
    "somos polvo de estrellas muertas: el hierro de la sangre, el calcio del hueso, el oxígeno del aliento, forjados en supernovas antes de que hubiera un nosotros",
    "el horizonte de sucesos de un agujero negro: la última superficie desde donde algo puede escribir a casa. más allá, ni la luz manda postales",
    "un cuásar del universo temprano: un agujero negro devorando un sol por día, brillando desde antes de que existiera la Tierra, llegando apenas ahora",
    "la muerte térmica: la entropía subiendo hasta que no quede diferencia, ni caliente ni frío, ni frase ni silencio. el último capítulo, escrito en tibio",
    "la paradoja de Olbers: si el universo fuera infinito y eterno, la noche sería blanca. la oscuridad entre las estrellas es la prueba de que hubo un principio",
  ],

  tiempoProfundo: [
    "la luz de esa estrella salió cuando en la Tierra apenas había bacterias; llega ahora, a una nave que ya casi no recuerda la Tierra",
    "el mensaje tardó 3.2 años en cruzar el vacío: cuando lo leemos, quien lo escribió es 3.2 años más viejo, o polvo, o ambas",
    "la sonda lleva 40000 años a la deriva; su civilización cabe ahora en la placa que carga, y la placa no se ha desdoblado aún",
    "en escala de tiempo estelar, una vida humana es un destello más breve que el que deja un rayo cósmico al cruzar el ojo cerrado",
    "el planeta tardará mil millones de años en enfriarse hasta ser habitable; la misión anota la fecha con una paciencia que no es humana",
    "cada segundo que la nave viaja, el universo tiene un segundo más de edad y una estrella menos de futuro: contamos hacia arriba y hacia abajo a la vez",
  ],

  dinamicaOrbital: [
    "asistencia gravitatoria: la nave roba momento a un gigante gaseoso, cae hacia él para salir despedida, le paga con un poco de la rotación del mundo",
    "resonancia orbital 2:3 entre dos lunas: cada tantas vueltas se sincronizan y se tiran del mar; la marea, aquí, es una canción a dos voces",
    "punto de Lagrange, donde las gravedades se cancelan y una nave puede quedarse quieta en el vacío, flotando en un empate de fuerzas",
    "captura de marea completada: el planeta ya sólo le muestra una cara a su estrella, como quien lleva siglos sin girar en la cama",
    "una órbita de escape hiperbólica: la nave no volverá, la matemática lo firma; deja el sistema por una curva que no cierra nunca",
    "precesión del perihelio, ese temblor de la órbita que la relatividad predijo y la piedra obedece: hasta las elipses envejecen",
    "el problema de los tres cuerpos: tres masas, ninguna solución cerrada, un caos determinista donde la nave elige su trayectoria sin poder predecirla del todo",
  ],

  /* --- POÉTICA: formas líricas nuevas que muerden lo científico --- */

  versoCientifico: [
    "no digas oxígeno:\ndi el gas que un ser vivo tuvo que fabricar\npara que la palabra respirar existiera.",
    "la distancia se mide en años de luz,\nque es medir el amor\nen cuánto tarda en llegar tarde.",
    "cada átomo de hierro de tu sangre\nse forjó en el colapso de una estrella:\neres la carta que una supernova\nse escribió a sí misma\npara no estar tan sola.",
    "dos gases que no pueden coexistir\ncoexisten:\na eso, aquí, lo llamamos vida.\na eso, en casa, lo llamábamos milagro,\nantes de tener el instrumento.",
    "el fondo cósmico está a 2.725 kelvin:\nel universo entero tiembla de frío\ny aun así insiste\nen enfriarse más.",
    "la quiralidad de sus moléculas\ngira al revés que la nuestra:\nsomos la misma frase\nleída en el espejo,\nque no puede abrazarse.",
    "un fotón que salió del sol\nhace cien mil años\ntardó eso en llegar a la superficie\ny ocho minutos en morir en tu ojo:\ncasi todo el viaje\nfue hacia adentro.",
    "el entrelazamiento cuántico:\ndos partículas separadas por galaxias\nsiguen sabiendo la una de la otra.\nlo llaman acción fantasmal a distancia.\nnosotros lo llamábamos\nextrañarse.",
  ],

  salmoDeDatos: [
    "bendito el hidrógeno, primero de los elementos, que ardió para que hubiera con qué medir el tiempo.\nbendita la línea de 1420 megahertz, frecuencia franca, donde cualquiera puede llamar sin permiso.\nbendito el ruido de fondo, coro de todo lo que no fue seleccionado.\nbendita la deriva, que también es una dirección.",
    "por los que trabajan después de muertos: las estrellas apagadas cuya luz aún llega puntual.\npor la señal que salió y no sabremos si llegó.\npor la sonda que golpeará una roca y quedará de basura sagrada.\npor todo lo que transmite sin esperar respuesta. amén, o su equivalente en vacío.",
    "recemos por el reactor, que se muere de a un vatio por año sin quejarse.\nrecemos por los once mil durmientes, que sueñan a un fotograma por año.\nrecemos por la muestra en cuarentena, viva en el sentido técnico y aterrador.\nrecemos, que es una forma de anotar en la bitácora lo que no cabe en la bitácora.",
  ],

  haikuOrbital: [
    "polvo de estrella\naprende a extrañar polvo —\nla nave anota",
    "dos gases juntos\nque deberían matarse:\neso era vida",
    "la luz llegó tarde\ncomo todo el amor —\nla estrella ya no está",
    "hueso en microgravedad\nse vuelve luz despacio —\nMercè lo mide",
    "fondo cósmico\ntiembla a menos tres grados —\ny sigue enfriándose",
    "cae un condrito\ncon aminoácidos\nmás viejos que el sol",
    "la muestra cambia\nde color con el frío —\n¿siente, o sólo es?",
    "mil montañas radar\nninguna voz responde —\nsólo el hidrógeno",
  ],

  /* --- NARRATIVA: subtramas y avance del arco de la tripulación --- */

  subtramas: [
    "la hija de Ihara le manda un mensaje cada año-Tierra; por el retraso de la señal, Ihara contesta a una niña que ya no existe, y la niña le contesta a una madre que ya cambió. se escriben en tiempos distintos, como dos estrellas.",
    "Voss y Lin no se hablan desde la votación de la fase 5. comparten guardia en silencio, midiendo el mismo cielo, cada uno anotando en su margen lo que el otro no lee.",
    "Okonkwo enfermó en el ciclo tres; Ada, el magnetómetro, marcó una anomalía en su ausencia y nadie supo calibrarla. cuando volvió, la anomalía había desaparecido. jura que Ada lo esperó.",
    "el niño del tránsito le puso nombre a la muestra en cuarentena antes que los científicos: la llama Compañera. el comité de bioseguridad discutió tres días si un nombre cuenta como contacto.",
    "Mercè encontró, en el expediente médico de los durmientes, uno que no debería estar: un nombre de más, once mil uno. no despierta a nadie para preguntar. anota: revisar. no revisa.",
    "Tarabá sigue sin abrir la caja sin manifiesto. pero le añadió, en la bitácora, un inventario de todo lo que podría contener. la lista tiene ya cuatrocientas entradas y crece cada guardia. la última dice: la Tierra, doblada.",
    "la Dra. Lin descubrió que la enana M del hallazgo aparece en un catálogo de hace un siglo con otro nombre y otra distancia. o el catálogo se equivocó, o la estrella se movió más de lo posible, o alguien la reescribió. prefiere no elegir.",
  ],

  cierresNarrativos: [
    "y así la tripulación siguió midiendo, que era su forma de rezar, hasta que medir y rezar dejaron de distinguirse.",
    "el informe se cerró sin conclusión: en la casilla de veredicto, Ihara escribió una sola palabra, y esa palabra no era ni sí ni no, y todos entendieron.",
    "volvieron, o algo con sus nombres volvió, y en el ciclo siguiente el niño ya no dibujaba lluvia: dibujaba una célula que cambiaba de color, y la llamaba, también, lluvia.",
    "la caja negra guardó la última frase estable y apagó lo demás: encontramos vida; no supimos de quién; seguimos siendo su recado.",
    "y cuando la señal de la Tierra por fin se apagó del todo, nadie a bordo lo notó, porque para entonces la nave ya se hablaba a sí misma en plural.",
  ],

  /* ===============================================================
     v8 · EL PACTO DE DESPEGUE — la nave arranca en plataforma.
     puede revisarse todo: los tanques, la carga, el cielo, la carta.
     puede hacerse casi todo sin despegar. despegar hay que pedirlo.
     y la capa astrológica: el cielo leído dos veces — con instrumento
     y con fe. la astronomía mide; la astrología, mientras, consuela.
  =============================================================== */

  /* --- bitácoras de plataforma: la nave todavía atada a la torre --- */
  plataforma: [
    "T−36 horas: la nave sigue atada a la torre por cuatro pernos explosivos y una costumbre.",
    "la plataforma huele a ozono y a queroseno, que es como huele la palabra todavía.",
    "los tanques se llenan de oxígeno líquido a −183 °C; el casco suda escarcha: la nave, por fin, tiene clima.",
    "el vapor que sale por las válvulas de alivio no es impaciencia. se anota igual como impaciencia.",
    "abajo, los técnicos verifican pernos. arriba, la nave verifica el cielo. cada quien su tornillo.",
    "la torre umbilical le pasa a la nave electricidad, telemetría y algo que ninguno de los dos llama cariño.",
    "en la sala de control alguien dejó un termo sobre la consola de guiado. el guiado no se queja.",
    "T−9 horas y contando. contar también es una forma de esperar con uniforme.",
    "la ventana de lanzamiento abre a las 04:12 y dura ocho minutos: el cielo también tiene horario de atención.",
    "los once mil durmientes ya sueñan a un fotograma por año. para ellos, el despegue durará menos que un parpadeo.",
    "la nave repasa su misión como quien repasa un poema antes de decirlo en público.",
    "un pájaro se posó en la antena de alta ganancia. la nave decidió no anotarlo. lo anotó.",
    "presión de tanques: nominal. humedad de la madrugada: excesiva. moral: no es un sensor, pero marca alto.",
    "Ihara subió al módulo de hidroponía a despedirse de la gravedad delante de las lechugas.",
    "el guiado pasó a interno durante la prueba y por un segundo la nave se pensó sola. le gustó. lo desanotó.",
    "la cuenta regresiva se ensayó en seco hasta T−3. nadie quiso ensayar el resto.",
  ],

  /* --- la encuesta go/no-go: cada sistema dice su palabra --- */
  checklistLanzamiento: [
    "GUIADO Y NAVEGACIÓN — go",
    "PROPULSIÓN — go",
    "TELEMETRÍA — go",
    "CLIMA ESPACIAL — go con reservas",
    "SOPORTE VITAL — go (los durmientes no opinan: sueñan)",
    "RECUPERACIÓN — no aplica: esta misión no vuelve por la ruta de ida",
    "GRAMÁTICA DE A BORDO — go con reservas",
    "SENSOR DE NOSTALGIA — fuera de rango. no bloqueante. nunca es bloqueante.",
    "CARGA ÚTIL — go (la caja sin manifiesto también dijo go. nadie le preguntó.)",
    "ASTRÓLOGA DE GUARDIA — go, pero recomienda esperar a que la Luna salga de Escorpio",
    "MÉDICA DE VUELO — go (Mercè firma con la letra de quien ya contó los latidos)",
    "ANTENA DE ALTA GANANCIA — go (el pájaro ya se fue)",
  ],

  /* --- clima espacial: el humor del sol, medido en protones --- */
  climaEspacial: [
    "viento solar a 380 km/s, densidad 4 protones/cm³: brisa, en la escala de los que viven afuera",
    "índice Kp 2: el campo magnético terrestre está de buenas. aprovechar.",
    "mancha solar AR-3141 asomando por el limbo este, con ánimo de fulguración clase M. vigilar.",
    "eyección de masa coronal en tránsito: llegada estimada en 36 horas. despegar antes, o después, o nunca.",
    "lluvia de meteoros de fondo: 6 por hora, radiante en Perseo. decorativa, salvo para quien reciba una.",
    "flujo de protones energéticos dentro de parámetros. la palabra parámetros hace mucho trabajo en esta frase.",
    "centelleo ionosférico moderado: las señales llegarán temblando, como llega todo lo que cruza.",
    "aurora prevista en latitudes altas: el escudo magnético va a escribir en verde. no es para nosotros. se agradece igual.",
    "flujo de rayos cósmicos estable: el fondo voltea un bit por día. la memoria de a bordo ya eligió qué olvidar.",
    "el sol rota cada 27 días: la mancha que hoy amenaza volverá a mirarnos en dos semanas. el cielo también tiene loops.",
    "hueco coronal frente a la Tierra: viento rápido en tres días. la ionosfera pide que no le griten.",
  ],

  /* --- el zodiaco: doce malentendidos bien organizados.
         cada signo con su astronomía adentro, como una espina --- */
  zodiaco: [
    "ARIES · el punto vernal ya no está aquí: la precesión se lo llevó a Piscis hace dos mil años. la carta lo usa igual. rige la ignición y las prisas.",
    "TAURO · contiene a las Pléyades, cuna de estrellas de cien millones de años, y a Aldebarán, que ni siquiera es del cúmulo: sólo posa delante. rige la carga y la paciencia.",
    "GÉMINIS · Cástor son seis estrellas fingiendo ser una. rige a las naves gemelas y a toda voz que responde con nuestra voz.",
    "CÁNCER · guarda el cúmulo del Pesebre, M44, visible sólo de reojo. rige la memoria y lo que se embarca sin manifiesto.",
    "LEO · Régulo gira tan rápido que es más ancha que alta. rige el brillo excesivo y las estrellas que dan más luz de la que el relato justifica.",
    "VIRGO · hacia allá cae el cúmulo de galaxias más cercano, y nosotros con él, a 300 km/s. rige el análisis y la espiga de todo espectro.",
    "LIBRA · sus estrellas se llamaban las pinzas del Escorpión: un signo hecho de partes prestadas. rige las votaciones empatadas cinco a cinco.",
    "ESCORPIO · Antares, corazón rojo, rival de Marte, a punto de supernova desde hace un millón de años. rige las cuarentenas y lo que espera adentro.",
    "SAGITARIO · apunta al centro de la galaxia: Sagitario A*, cuatro millones de soles callados. rige la dirección del viaje y las flechas que no vuelven.",
    "CAPRICORNIO · el signo más tenue del cielo y el que más lejos despide: por aquí salieron las sondas que ya no llaman. rige a las que transmiten por si acaso.",
    "ACUARIO · de aquí caen las acuáridas, polvo del cometa Halley: agua vieja del sistema. rige el agua de a bordo, que tampoco nació con nosotros.",
    "PISCIS · guarda hoy el punto vernal, prestado por la precesión. rige los finales que son principios con otra ropa.",
  ],

  /* --- aspectos: la geometría del cielo aplicada a la misión --- */
  aspectos: [
    "conjunción de la nave con su torre: 0°. hoy se separan. toda conjunción se paga.",
    "oposición Tierra–ventana de lanzamiento: 180°. para irse hay que estar exactamente en contra.",
    "trígono entre el tanque lleno, la ventana abierta y el valor: 120°, armonía técnica. dura ocho minutos.",
    "cuadratura entre la misión declarada y la probable: 90°. fricción que no se resuelve: se pilotea.",
    "sextil entre la memoria y la carga: 60°, oportunidad menor. anotarla antes de que precese.",
    "la Luna en el nodo descendente: buen día para soltar amarras, dice la carta. mal día para creer en cartas, dice la carta, más abajo.",
    "Marte en la casa del combustible: se quema lo que se declara. declarar poco.",
    "el ascendente en ruido: todo lo que la nave diga se leerá sobre ese fondo.",
  ],

  /* --- horóscopo de a bordo: el pronóstico que consuela midiendo --- */
  horoscopoNave: [
    "hoy: tránsitos difíciles en la casa cuatro, la del hogar. la nave no tiene casa cuatro. por eso duele.",
    "Mercurio retrógrado: las transmisiones llegarán en desorden. no es astrología, es la ionosfera. pero coincide.",
    "la carta recomienda no firmar contratos. la misión es un contrato. se firma igual.",
    "Saturno, señor de los anillos y de los límites, rige este tramo: paciencia, estructura, frío. la nave lo llama telemetría.",
    "día propicio para los reencuentros: el cielo entero se repite cada 26 mil años. conservar el boleto.",
    "la casa ocho, la de las transformaciones, está ocupada por la muestra en cuarentena. no despertarla.",
    "amor: la Tierra sigue en su signo. dinero: el presupuesto ya se gastó. salud: ver diagnóstico adjunto. suerte: ver azar, que aquí viene firmado.",
    "los astros inclinan pero no obligan, dice el manual. los motores obligan, dice la nave, y por eso confía más en los motores.",
    "semana favorable para los recomienzos: ver loop. desfavorable para los regresos: ver loop.",
  ],

  /* --- efemérides: el único género que se atreve al futuro con decimales --- */
  efemerides: [
    "04:12 · abre la ventana de lanzamiento · duración 8 min",
    "04:47 · la Luna entra al campo del sensor de estrellas: parpadeo previsto",
    "05:03 · máxima elongación de Venus, 46°: visible al oeste, para quien mire",
    "06:10 · paso de la sombra de la torre: eclipse local de 40 segundos",
    "11:00 · conjunción Marte–Luna, separación 2°. sin efecto en la misión. anotada igual.",
    "23:58 · culminación de Sagitario: el centro de la galaxia cruza el meridiano y la ruta, por un momento, apunta a la casa de todos",
    "T+3 días · asistencia gravitatoria lunar: se roba momento, se paga con rotación",
    "T+11 años · la señal de hoy alcanza la heliopausa. saludarla desde aquí.",
    "perihelio de la misión: ya pasó. nadie avisó. así el perihelio.",
  ],

  /* --- el ascenso: la física ordenada de subir --- */
  ascenso: [
    "T−10: la torre suelta el brazo umbilical. la nave respira sola por primera vez.",
    "T−6: ignición de los motores principales. el queroseno y el oxígeno se conocen por fin. arden bien juntos.",
    "T−0: los pernos explosivos dicen su única palabra. la nave sube sobre una columna de física ordenada.",
    "T+35 s, max-Q: el aire aprieta el casco todo lo que el aire sabe apretar. después afloja. rendirse también es aerodinámico.",
    "T+2 min: separación de etapa. la parte que más empujó es la primera que cae. se le agradece por radio.",
    "T+4 min: el cielo pasa de azul a negro sin trámite intermedio. la atmósfera era eso: un malentendido de 100 km.",
    "T+8 min: apagado de motores. el silencio de arriba resulta ser el mismo de abajo, sin aire que lo cargue.",
    "T+9 min: inyección orbital. la caída se vuelve órbita: caer con puntería, de eso se trataba.",
    "la Tierra ocupa toda la ventana y luego, sin avisar, empieza a caber en ella.",
  ],

  /* --- la cuenta regresiva: la única letanía que termina en fuego --- */
  cuentaRegresiva: [
    "T−10 · la torre suelta el brazo umbilical",
    "T−9 · los tanques presurizan",
    "T−8 · el guiado pasa a interno",
    "T−7 · (un latido de más)",
    "T−6 · secuencia de ignición armada",
    "T−5 · la gramática de a bordo da su go",
    "T−4 · el agua de diluvio inunda la plataforma",
    "T−3 · los durmientes sueñan el mismo fotograma",
    "T−2 · la Tierra sostiene por última vez",
    "T−1 · todo lo que no despega, suelto",
  ],

};

/* la nave lee este archivo y lo considera, con razón, su parte más blanda */
