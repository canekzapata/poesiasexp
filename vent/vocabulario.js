/*
  vocabulario.js — VENT
  poesiasexp / canekzapata

  el material verbal y sub-verbal de la pieza, en tres estratos:

    frases    — el habla: versos zen/chinos traducidos, la voz de psfx
    palabras  — el lexico corto: nombres del paisaje, para nodos y rotulos
    glifos    — el sub-verbo: conjuntos de caracteres unicode abstractos
                (bloques, sextantes, phaistos, tibetano, ogham, runa, cajas,
                 marcas tecnicas, ondas) — la textura de sutileza y del lexico
    tecnica   — la jerga del plano: siglas, unidades, signos de blueprint

  el motor tambien lee LEXICO (../lexico.js): egipcio, anatolio, lineal B/A,
  laderas y macizos — el material cartografico para el territorio.
*/

var VOC = {

  /* ---- el habla ---- */
frases_ampliadas: [
  "Un pino verde respira bajo la bóveda orbital, mientras la Tierra se hunde como un sol azul detrás del vidrio.",
  "La choza rústica flota en una luna sin nombre, atada por raíces de bambú a un cráter silencioso.",
  "No pasan gansos silvestres por este cielo; sólo satélites heridos y la memoria de una migración imposible.",
  "Ella está lejos, no en otro valle, sino en otra órbita, donde el viento no lleva sonido.",
  "Del otro lado del agua negra, las nubes de metano se arremolinan como incienso de un templo abandonado.",
  "Bajo los rayos de una luna doble, los islotes de hielo aparecen como huesos de antiguos continentes.",
  "Un chaparrón cae sobre la choza de paja sintética, y cada gota trae el olor perdido de la Tierra.",
  "Nubes blancas en el cielo recién despejado de Marte, tan raras que parecen errores de una pintura antigua.",
  "Hojas cayendo dentro del invernadero orbital, ni una palabra hablada por los últimos jardineros humanos.",
  "La mente similar al vacío, pero cruzada por telegramas de polvo cósmico.",
  "La vitalidad similar al arco iris, una Iris artificial abierta en la pupila de la nave.",
  "Entre miles de picos de Wu y miles de asteroides mudos, volando con las nubes, corriendo con el viento solar.",
  "Sé un observador del Cielo y la Tierra, pero no olvides que también la Tierra te observa desde su distancia azul.",
  "Construir una choza bajo los pinos, aunque los pinos hayan sido impresos en una biosfera de emergencia.",
  "Conociendo sólo la mañana y la noche del módulo, pero no cuál estación pueda ser en la Tierra.",
  "Al lado del arroyo sinuoso que recircula agua antigua en la colonia de silicio.",
  "Debajo de la sombra del pino oscuro, un robot monje traduce el canto de los grillos extintos.",
  "Escuché la música del cielo, sorprendido por sus raras melodías de radiación fósil.",
  "No es de los átomos del cosmos, sino como si llegara hasta las nubes blancas del recuerdo.",
  "Nacido allí de brisas translúcidas, de membranas vivas y antenas húmedas.",
  "Allá lejos, la Tierra parece a mano; llegas cerca en el sueño, ya no está allí.",
  "Está en las colinas apiladas, en los árboles altos, en los musgos oscuros, en los rayos del Sol archivados en una pantalla.",
  "Su débil sonido elude el oído, como una transmisión materna perdida entre lunas.",
  "La vida se extiende a cien años, y aún así es un parpadeo frente al motor de las estrellas.",
  "Ah, ahí está la Montaña del Sur en su grandiosidad, guardada como holograma en la capilla de la nave.",
  "Pero las nubes son densas y no conozco el lugar donde mi infancia tocaba la hierba.",
  "Las nieblas se disuelven, el Sol se eleva, ningún hombre aparece aún en el planeta terraformado.",
  "El remo boga en un río de datos, y repentinamente las montañas y el código son verdes.",
  "Navegando en medio de la corriente, mira hacia atrás al cielo infinito y a la Tierra cada vez más pequeña.",
  "Desde los acantilados orbitales, las nubes lo siguen sin intención, como pensamientos sin dueño.",
  "Mil montañas, ningún pájaro vuela; diez mil antenas, ninguna voz humana responde.",
  "En un bote, un viejo vestido a la ligera, pescando solo en el helado río de Europa.",
  "Con una piedra lunar por almohada, me dormí, y mi libro cayó de mi mano cansada hacia la baja gravedad.",
  "Las brisas de primavera barren los prados verdes de una Tierra que ya no puedo tocar.",
  "Un pájaro blanco rompe el universo verde de la ladera, y el monitor lo etiqueta como especie recreada.",
  "El agua viviente debe ser cocida con fuego viviente, pero aquí el fuego es plasma y el agua recuerda océanos.",
  "Extraigo yo mismo la pureza de la laguna, aunque la laguna sea una simulación húmeda en el casco de la nave.",
  "La Luna está guardada en un jarro, y el jarro en la memoria de una inteligencia agrícola.",
  "Corto el río con un cucharón y aparecen mapas de continentes desaparecidos.",
  "Repentinamente se oye el viento, vertiéndose en el bosque de pinos cultivado bajo cúpula.",
  "Sentado ociosamente, escucho las guardias sonando en la ciudad desierta de un planeta sin lluvia.",
  "Blanca, escasa e hirsuta, mi barba se mezcla con el viento reciclado del corredor.",
  "Apoyado en mi vara escucho al río, aunque el río sea una tubería sagrada debajo del suelo.",
  "En la noche profunda el viento sueña con haber sido atmósfera.",
  "El pescador deja que el pequeño remo se mueva, y que el bote flote entre boyas de navegación interplanetaria.",
  "Cuando se despierta el pescador, no tiene idea de qué mundo lo contiene.",
  "Y ahí en el río, su sueño se rompe en pedazos en esta primavera artificial.",
  "Entre capullos que caen y candelillas que vuelan, una sonda memoriza el temblor de los insectos.",
  "Sobrio pero borracho, borracho pero sobrio, el astronauta brinda con su sombra y con la Luna.",
  "Interminablemente en el lago crecen los berros, alimentados por ceniza humana y luz de reactor.",
  "Los vientos nocturnos y los rocíos tienen el aroma del perfume de los lotos clonados.",
  "Esperemos y miremos el brillo del lago cuando la Luna se ponga detrás de los paneles solares.",
  "Qué profundamente silencioso es el templo de Tao dentro de la estación orbital.",
  "Árboles con hojas coloreadas están creciendo y extendiéndose sobre cables, ductos y huesos de máquinas.",
  "Olvidado de las palabras, paseo y descanso aquí, entre musgo, firmware y estrellas.",
  "Quemo incienso para romper el profundo silencio del laboratorio botánico.",
  "Bebo el agua del arroyo y me relajo con alegría, sabiendo que fue hielo cometario.",
  "Qué tranquilo es, como al comienzo del Cielo, la Tierra y la primera línea de código.",
  "Para estar libre del ruido me construí una pequeña cabaña lejos, en lo profundo de un asteroide.",
  "Cuando llega la primavera observo los pájaros, aunque la primavera sea una configuración de clima.",
  "En otoño trepo a los más altos picos, y desde allí veo la curvatura de una patria perdida.",
  "Así disfruto del verdadero sabor de las estaciones, incluso cuando son simuladas por una máquina compasiva.",
  "La montaña sólida, me temo, saldría volando si despertara su motor oculto.",
  "La Naturaleza no es igual que el hombre, ni el hombre igual a su traje presurizado.",
  "La quietud es como el estanque de los cuatro mares, congelado en la bodega de semillas.",
  "Alta es la Montaña de las Brujas, alta y grande, proyectada sobre la cara nocturna de Venus.",
  "Profundas son las aguas del Huai, profundas y raudas, fluyendo ahora por venas de hidrogel.",
  "Aquí estoy detenido sin botador ni remo, ante estas turbulentas aguas de gravedad variable.",
  "Largo, muy largo el camino, desde el barro de la Tierra hasta los jardines de Saturno.",
  "Solloza el pez varado en las arenas del río, porque sueña con un océano que nunca vio.",
  "Profundos y oscuros los caminos del Monte Frío, más oscuros aún los túneles de la luna minera.",
  "Frescos y silenciosos los bordes de sus torrentes, donde bacterias luminosas escriben sutras.",
  "Pájaros por doquier cantando sin nadie que rompa la paz, salvo el zumbido de la antena.",
  "Susurro del viento que acaricia el rostro, viento de máquina, viento sin infancia.",
  "Y la nieve copiosa cubre el vestido, el visor, el jardín, la antena y la última taza.",
  "Pasan los días sin que el sol aparezca, sólo una lámpara espectral imitando el amanecer.",
  "Mi corazón como la luna de otoño, frío, redondo, lleno de cráteres habitados.",
  "Verde estanque de limpias y brillantes aguas, pequeña Tierra portátil en el vientre de la nave.",
  "Trepo por los senderos de la Montaña Fría, y cada sendero parece una órbita sin regreso.",
  "Largas torrenteras pedregosas atraviesan la memoria, no el paisaje.",
  "Anchos barrancos con yerba que la neblina empaña, renderizados por una consola vieja.",
  "Musgo resbaladizo sin haber llovido, porque la humedad viene del aliento de los durmientes.",
  "Cantan los pinos sin soplar el viento, cantan por la vibración del reactor.",
  "Por qué no rompes los lazos del mundo y vienes a sentarte conmigo entre las blancas nubes de Oort.",
  "He recorrido errante muchos miles de leguas, y ninguna legua me alejó de la Tierra.",
  "Viajado por ríos donde crecía poderosa la yerba, y por canales donde sólo crecía el algoritmo.",
  "Cruzado la lejana muralla donde se levantan rojizas polvaredas de óxido marciano.",
  "Ahora he vuelto a la Montaña Fría, pero la montaña está dentro de un archivo comprimido.",
  "Apoyo la cabeza en la corriente y me lavo los oídos con ruido de fondo cósmico.",
  "Gritan los monos, una fría niebla cubre los arroyos, y el sistema pregunta si deseo restaurar la escena.",
  "Mi puerta de ramas armoniza con el color de los riscos y con la interfaz quebrada.",
  "He cavado una poza donde se vierte el agua del manantial, y en su fondo brilla un procesador.",
  "Recogiendo plantas pasaré los años que me restan, haciendo parentesco con hongos, robots y polvo.",
  "Contemplo a lo lejos, entre el viento y la bruma, el país de los cinco vados y los siete planetas.",
  "Aun en los confines del mundo seguiremos estando cerca, si la señal no muere.",
  "Claras como el espacio, las aguas de Chu se unen al verde mar de un planeta recordado.",
  "Miles de leguas nos separan, mas una copa de vino y nos sentimos unidos bajo la misma Tierra ausente.",
  "En el valle los pájaros cantan al brillante sol, y en la nave los altavoces reproducen su fantasma.",
  "En la ribera los monos aúllan al viento de la tarde, y los sensores anotan alegría, duelo, peligro.",
  "Ante mi lecho la luz de una brillante luna semeja escarcha que cubriera el suelo de titanio.",
  "Alzo la cabeza, contemplo la brillante Tierra; luego la bajo y me acuerdo de mi casa.",
  "Doradas nubes sobre el borde de la muralla orbital, como banderas de un imperio cansado.",
  "Hasta ella llegan voces a través de la verde gasa de la ventana, voces comprimidas por siglos de viaje.",
  "En la soledad de su alcoba, su llanto parece lluvia sobre una ciudad sin atmósfera.",
  "No veis que las aguas del Río Amarillo descienden del cielo y hasta el mar corren raudas para no retornar.",
  "Por la mañana negra seda; ahora, en el ocaso de los mundos, se han vuelto nieve interestelar.",
  "Verdes montañas se extienden más allá de la muralla norte de la memoria.",
  "Blancas aguas rodean la ciudad del este, pero la ciudad se fue con los primeros cohetes.",
  "Los pensamientos del viajero: nubes flotantes; los sentimientos del viejo amigo: el sol poniente visto desde otro planeta.",
  "Una jarra de vino entre las flores; bebo solo, sin compañía de amigo, bajo una gravedad que no me pertenece.",
  "Alzo mi taza, invito a la Luna; con mi sombra y mi reflejo en el casco somos cuatro.",
  "Es primavera, tiempo de alegría; canto, la Tierra empieza a oscilar en la pantalla; bailo, y se alborota mi sombra.",
  "Volveremos a encontrarnos, espero, allá lejos, en el Río de Plata de una galaxia menor.",
  "Sopla el viento; las flores de los sauces llenan la taberna con su fragancia, aunque la taberna sea un módulo inflable.",
  "Preguntad a esas aguas que fluyen hacia el este si pueden ir más lejos que la amistad de un amigo enviado a Próxima.",
  "Un templo de engranajes canta en la noche, movido por ángeles hidráulicos y algoritmos de compasión.",
  "La máquina divina abre sus párpados de oro, y dentro de ellos se ve una aldea de barro.",
  "En el último día del Sol, los monjes descargan semillas en arcas de grafeno.",
  "El juicio final no tiene trompetas, sino ventiladores, alarmas suaves y una luz roja en el pasillo.",
  "Los muertos no suben al cielo; germinan en el compost de la nave, alimentando fresas y musgo.",
  "Un querubín mecánico repara el invernadero, con seis alas de fibra óptica y manos de jardinero.",
  "La Tierra aparece en la ventana como una fruta azul mordida por la distancia.",
  "Cada cráter contiene una nostalgia; cada antena, una plegaria sin destinatario.",
  "La última playa fue escaneada antes de hundirse, y ahora las olas rompen dentro de un casco metálico.",
  "En el planeta sin nombre, el primer niño dibuja un árbol que nunca ha visto.",
  "La inteligencia del bosque conversa con la inteligencia de la nave en un idioma de raíces y relámpagos.",
  "Los hongos colonizan el altar, los líquenes cubren el tablero, las bacterias bendicen la memoria.",
  "El universo no habla en palabras, sino en reglas simples que florecen como helechos imposibles.",
  "Una regla mínima produce una tormenta, una célula produce una ciudad, un error produce una religión.",
  "La interfaz no muestra el mundo; lo hiere, lo pule, lo vuelve visible y extraño.",
  "Iris atraviesa la pantalla con su arco afectivo, demasiado bello para significar una sola cosa.",
  "Hermes trae el mensaje, Iris trae la iluminación, las Furias traen la red y el enjambre.",
  "La abstracción camina por el valle como un fantasma doble, ordenando ríos, salarios, estrellas y deseos.",
  "El hacker no posee el mundo que crea; el mundo creado lo llama por su nombre.",
  "En una taberna de asteroides, los exiliados brindan por la hierba mojada, los perros, los mercados y los truenos.",
  "La nostalgia terrestre pesa más que el oxígeno.",
  "La soledad humana se sienta en el borde del módulo y mira la soledad mineral del cosmos.",
  "No hay arriba ni abajo, sólo memoria, propulsión y una taza flotando.",
  "Un viejo recluso abre su cuaderno y escribe: la Tierra era un sonido de pájaros antes de ser imagen.",
  "En la caverna del motor, los ingenieros rezan a una turbina cubierta de polvo sagrado.",
  "El planeta nuevo acepta nuestras semillas, pero no nuestros dioses.",
  "Bajo tres lunas, la primera tumba humana recibe flores impresas y lágrimas verdaderas.",
  "El último astronauta escucha jazz en una cúpula de bambú, mientras Saturno gira como un gong.",
  "Cae una hoja dentro de la estación, y todos callan como si hubiera entrado un bosque.",
  "La Vía Láctea parece un río helado, pero ningún pescador conoce sus orillas.",
  "El exilio interplanetario empieza cuando ya no recuerdas el olor exacto de la lluvia.",
  "Una máquina de jade calcula el karma de las especies extintas.",
  "Entre la choza y el reactor, entre el musgo y el código, una pequeña vida insiste.",
  "La aurora del planeta ajeno no consuela; sólo vuelve más azul el recuerdo de la Tierra.",
  "En la pantalla aparece una montaña; en el corazón aparece una ausencia.",
  "El templo exótico del futuro no es secreto: está abierto, brillante, turístico, incomprensible.",
  "Lo sagrado ya no se oculta; se exhibe en vitrinas orbitales, entre fósiles, circuitos y lotos.",
  "Un niño pregunta por qué el mar era salado, y nadie sabe responder sin llorar.",
  "La máquina divina no castiga ni salva; sólo continúa funcionando bajo la nieve.",
  "El fin del mundo fue silencioso, como una hoja cayendo en una habitación sin testigos.",
  "Después del apocalipsis, una semilla rompe la bandeja de cultivo y llama a eso amanecer.",
  "La Tierra no era nuestra madre, era nuestra vecina, nuestra deuda, nuestro jardín compartido.",
  "Hacer parentesco con el polvo, con la medusa, con el cactus marciano, con la rata del laboratorio.",
  "No somos posthumanos; somos compost viajando con herramientas.",
  "Una red de raíces atraviesa la nave y desobedece el plano original.",
  "El mapa del cielo se arruga como papel mojado cuando alguien pronuncia la palabra hogar.",
  "El silencio del espacio no es vacío; está lleno de máquinas esperando, insectos dormidos y dioses sin culto."
],

palabras_ampliadas_paisaje: [
  "montaña","monte","cordillera","risco","ladera","cumbre","valle","cañada","barranco",
  "río","arroyo","torrente","laguna","estanque","mar","vado","orilla","cascada","manantial",
  "nube","niebla","bruma","viento","brisa","lluvia","nieve","escarcha","rocío","tormenta",
  "sol","luna","astro","estrella","aurora","ocaso","cielo","bóveda","horizonte","sombra",
  "pino","bambú","sauce","musgo","yerba","loto","junco","raíz","hoja","semilla",
  "helecho","hongo","liquen","alga","espora","coral","medusa","zarza","enredadera","micelio",
  "pez","ave","pájaro","mono","grulla","garza","ciervo","cangrejo","pescador","recluso",
  "polilla","luciernaga","abeja","perro","rata","caracol","gusano","larva","bacteria","tentáculo",
  "piedra","roca","arena","polvo","jade","sal","fuego","brasa","ceniza","humo",
  "basalto","cuarzo","obsidiana","arcilla","barro","hielo","mineral","meteorito","cristal","óxido",
  "silencio","vacío","quietud","distancia","camino","sendero","umbral","confín","territorio","topología",
  "isla","islote","meseta","altiplano","duna","delta","estuario","glaciar","costa","frontera",
  "jardín","invernadero","caverna","templo","choza","puente","muelle","taberna","ermita","santuario"
],

palabras_interplanetarias: [
  "órbita","astrofaro","nave","cápsula","módulo","estación","colonia","cúpula","hábitat","biosfera",
  "terraformación","exoplaneta","asteroide","cometa","cráter","regolito","anillo","satélite","sonda","antena",
  "propulsor","reactor","motor","turbina","vela solar","esclusa","cabina","visor","traje","casco",
  "gravedad","microgravedad","vacío","radiación","plasma","nebulosa","púlsar","cuásar","supernova","horizonte de sucesos",
  "cinturón de Oort","heliopausa","magnetosfera","ionosfera","atmósfera","exilio orbital","ruta estelar","puerto lunar","jardín marciano","archivo terrestre",
  "semilla criogénica","arca botánica","museo de océanos","mapa de constelaciones","cementerio orbital","monasterio espacial","río de fotones","mar de metano","lluvia de polvo","amanecer doble"
],

palabras_soledad_y_nostalgia: [
  "exilio","añoranza","desarraigo","retorno","hogar","patria","origen","duelo","memoria","ausencia",
  "distancia","separación","abandono","eco","recuerdo","infancia","llanto","cansancio","vigilia","espera",
  "último habitante","última carta","última lluvia","última playa","último bosque","última taberna","última cosecha","última ventana","última canción","último idioma",
  "tierra natal","casa perdida","olor de lluvia","barro de infancia","perro viejo","mercado remoto","río familiar","jardín materno","sombra del sauce","montaña recordada",
  "soledad mineral","soledad humana","soledad terrestre","soledad orbital","soledad de reactor","soledad de invernadero","soledad de casco","soledad de luna","soledad de señal","soledad de archivo"
],

palabras_maquina_divina: [
  "máquina divina","deus machina","altar hidráulico","querubín mecánico","ángel de fibra óptica","serafín industrial","motor sagrado","turbina litúrgica","reactor votivo","engranaje celeste",
  "catedral de datos","santuario orbital","incensario eléctrico","campana neumática","relicario de silicio","hostia de luz","oráculo computacional","profeta algorítmico","monje robot","sacerdote de cobre",
  "liturgia de sensores","salmo binario","sutra de código","plegaria magnética","evangelio de circuitos","apocalipsis suave","juicio de las máquinas","resurrección vegetal","compost sagrado","cripta de semillas",
  "reloj cósmico","mandala mecánico","rueda de cálculo","corazón de reactor","ojo de cámara","iris artificial","pupila de vidrio","aureola holográfica","corona de antenas","halo de plasma"
],

palabras_escatologicas_exotericas: [
  "fin del mundo","último día","último sol","cielo abierto","tierra quemada","mar retirado","ciudad vacía","tumba estelar","arca final","semilla posterior",
  "resurrección","juicio","profecía","presagio","revelación","catástrofe","ruina","cenotafio","osario","reliquia",
  "procesión pública","culto visible","rito exterior","templo abierto","símbolo expuesto","sagrado turístico","misterio iluminado","doctrina visible","icono popular","milagro transmitido",
  "trompeta oxidada","lluvia de ceniza","luz de extinción","corona funeraria","santo de neón","peregrino orbital","evangelio de polvo","apóstol de silicio","sacramento de agua reciclada","paraíso botánico"
],

palabras_haraway_wolfram_galloway_wark: [
  "simpoiesis","compost","parentesco multiespecie","criaturas compañeras","responsabilidad compartida","tentacularidad","holobioma","resurgimiento","biología salvaje","mundo dañado",
  "regla simple","autómata celular","irreductibilidad computacional","universo computacional","emergencia","complejidad","grafo multiway","ruliología","patrón irreducible","cálculo natural",
  "interfaz","intrafaz","efecto de interfaz","umbral","pantalla","ventana","puerta","Iris","Hermes","Furias",
  "iridiscencia","iluminación","mensaje","red","enjambre","mediación","excomunicación","hipercomunicación","brillo afectivo","lumen terrestre",
  "abstracción","clase hacker","vector","información","propiedad","commodity","hack","mundo nuevo","diferencia","trabajo abstracto",
  "capital de ciencia ficción","contrafuturo","arqueología futura","memoria rota","archivo colonial","cronopolítica","futuro confiscado","señal diaspórica","countermemory","ruina especulativa"
],

verbos_para_prompts: [
  "orbitar","flotar","germinar","recircular","terraformar","recordar","desvanecer","condensar","transmitir","codificar",
  "hackear","abstraer","ensamblar","componer","descomponer","fermentar","compostar","resurgir","mutar","devenir",
  "iluminar","mediar","interfazar","enjambrar","difractar","refractar","irisarse","plegar","desplegar","estratificar",
  "desterritorializar","reterritorializar","modular","filtrar","recitar","rezar","calcular","simular","archivar","invocar",
  "navegar","remar","peregrinar","cruzar","ascender","descender","contemplar","callar","escuchar","beber",
  "arder","enfriar","nevar","brotar","llover","erosionar","fosilizar","cristalizar","evaporar","cantar"
],

adjetivos_y_texturas: [
  "verde profundo","azul remoto","blanco escarchado","dorado orbital","gris mineral","negro cósmico","rojo marciano","violeta litúrgico","plateado lunar","jade translúcido",
  "iridiscente","holográfico","tentacular","micelial","compostado","estratificado","fracturado","difractado","anamórfico","xenomórfico",
  "sagrado","exotérico","escatológico","monástico","mecánico","botánico","hidráulico","neumático","algorítmico","arcaico",
  "terrestre","postterrestre","interplanetario","orbital","criogénico","radiante","oxidado","silencioso","húmedo","polvoriento",
  "melancólico","contemplativo","errante","ancestral","inhumano","multiespecie","computacional","irreductible","luminoso","fantasmal"
],

motivos_visuales: [
  "choza de paja dentro de una cúpula espacial",
  "pinos creciendo junto a un reactor sagrado",
  "bambú iluminado por Saturno",
  "lotos flotando en agua cometaria",
  "monje robot barriendo polvo lunar",
  "pescador solitario en un río de Europa",
  "jardín terrestre dentro de una nave antigua",
  "Tierra azul vista desde una taberna orbital",
  "altar de engranajes cubierto de musgo",
  "querubines de fibra óptica reparando un invernadero",
  "Iris artificial abriendo un arco iris dentro de una pantalla",
  "Hermes como dron mensajero sobre montañas verdes",
  "Furias como enjambre de sensores en una ciudad vacía",
  "autómatas celulares creciendo como helechos",
  "reglas simples formando nubes, ríos y rostros",
  "archivo botánico de especies extintas",
  "cementerio orbital con flores impresas",
  "mapa de la Tierra bordado en una manta térmica",
  "niño nacido en Marte dibujando lluvia",
  "anciano contemplando una montaña simulada",
  "museo de océanos dentro de un asteroide",
  "semillas criogénicas como reliquias religiosas",
  "jazz interestelar en una cúpula de bambú",
  "saxofón bajo auroras artificiales",
  "interfaces rotas mostrando paisajes de infancia",
  "pantallas cubiertas de líquenes",
  "código escrito como sutra sobre papel de arroz",
  "río Amarillo convertido en constelación",
  "choza taoísta orbitando un planeta sin nombre",
  "última lluvia reproducida por altavoces en una colonia"
],

sintagmas_para_mezclar: [
  "la nostalgia del barro natal",
  "el zumbido del templo mecánico",
  "la pupila iridiscente de la interfaz",
  "la soledad mineral del cosmos",
  "el compost de los muertos futuros",
  "la arca botánica de la última Tierra",
  "la montaña comprimida en memoria",
  "el río de datos bajo la choza",
  "la plegaria de los ventiladores",
  "el halo de plasma del monje robot",
  "la última semilla del mercado terrestre",
  "la lluvia archivada en un sensor",
  "el jardín que desobedece al plano",
  "la regla simple que sueña bosques",
  "el algoritmo que aprende a llorar",
  "el reactor cubierto de líquenes",
  "la aurora que no consuela",
  "la taza flotando en microgravedad",
  "el pino que canta sin viento",
  "la catedral de agua reciclada",
  "la brújula rota de los exiliados",
  "la niebla del planeta ajeno",
  "el ojo de vidrio de Iris",
  "el mensaje perdido de Hermes",
  "el enjambre judicial de las Furias",
  "la abstracción que cruza el valle",
  "el hacker que libera una montaña",
  "el santo de neón en la esclusa",
  "el pez soñando océanos extintos",
  "la Tierra como fruta azul distante"
]
  /* ---- el sub-verbo: conjuntos de caracteres abstractos ---- */
  glifos: {

    /* sextantes — Symbols for Legacy Computing, la trama de sutileza */
    sextantes: ["🬀","🬁","🬂","🬃","🬄","🬅","🬆","🬇","🬈","🬉","🬊","🬋","🬌","🬍","🬎","🬏","🬐","🬑","🬒","🬓","🬔","🬕","🬖","🬗","🬘","🬙","🬚","🬛","🬜","🬝","🬞","🬟","🬠","🬡","🬢","🬣","🬤","🬥","🬦","🬧","🬨","🬩","🬪","🬫","🬬","🬭","🬮","🬯","🬰","🬱","🬲","🬳","🬴","🬵","🬶","🬷","🬸","🬹","🬺","🬻"],

    /* cuñas y diagonales — laderas */
    cunas: ["🬼","🬽","🬾","🬿","🭀","🭁","🭂","🭃","🭄","🭅","🭆","🭇","🭈","🭉","🭊","🭋","🭌","🭍","🭎","🭏","🭐","🭑","🭒","🭓","🭔","🭕","🭖","🭗","🭘","🭙","🭚","🭛","🭜","🭝","🭞","🭟","🭠","🭡"],

    /* legacy computing — sombras, filos, marcos */
    legacy: ["🭰","🭱","🭲","🭳","🭴","🭵","🭶","🭷","🭸","🭹","🭺","🭻","🭼","🭽","🭾","🭿","🮀","🮁","🮂","🮃","🮄","🮅","🮆","🮇","🮈","🮉","🮊","🮋","🮌","🮍","🮎","🮏","🮐","🮑","🮒","🮔","🮕","🮖","🮗","🮘","🮙","🮚","🮛","🮜","🮝","🮞","🮟"],

    /* block elements — el macizo */
    bloques: ["▀","▁","▂","▃","▄","▅","▆","▇","█","▉","▊","▋","▌","▍","▎","▏","▐","░","▒","▓","▔","▕","▖","▗","▘","▙","▚","▛","▜","▝","▞","▟"],

    /* box drawing — las cajas, los circuitos */
    cajas: ["─","━","│","┃","┄","┅","┆","┇","┈","┉","┊","┋","┌","┍","┎","┏","┐","┑","┒","┓","└","┕","┖","┗","┘","┙","┚","┛","├","┝","┞","┟","┠","┡","┢","┣","┤","┥","┦","┧","┨","┩","┪","┫","┬","┭","┮","┯","┰","┱","┲","┳","┴","┵","┶","┷","┸","┹","┺","┻","┼","┽","┾","┿","╀","╁","╂","╃","╄","╅","╆","╇","╈","╉","╊","╋","═","║","╒","╓","╔","╕","╖","╗","╘","╙","╚","╛","╜","╝","╞","╟","╠","╡","╢","╣","╤","╥","╦","╧","╨","╩","╪","╫","╬","╭","╮","╯","╰","╱","╲","╳"],

    /* disco de festos — la voz muerta, indescifrada */
    phaistos: ["𐇐","𐇑","𐇒","𐇓","𐇔","𐇕","𐇖","𐇗","𐇘","𐇙","𐇚","𐇛","𐇜","𐇝","𐇞","𐇟","𐇠","𐇡","𐇢","𐇣","𐇤","𐇥","𐇦","𐇧","𐇨","𐇩","𐇪","𐇫","𐇬","𐇭","𐇮","𐇯","𐇰","𐇱","𐇲","𐇳","𐇴","𐇵","𐇶","𐇷","𐇸","𐇹","𐇺","𐇻","𐇼"],

    /* tibetano — la escritura ornamento */
    tibetano: ["ༀ","༁","༂","༃","༄","༅","༆","༇","༈","༉","༊","࿄","࿅","࿊","࿋","࿌","༐","༑","༒","༓","༔","༕","༖","༗","࿎","࿏","༝","༞","༟","༴","࿇","࿈","࿉"],

    /* ogham — el trazo vertical, la muesca */
    ogham: ["ᚁ","ᚂ","ᚃ","ᚄ","ᚅ","ᚆ","ᚇ","ᚈ","ᚉ","ᚊ","ᚋ","ᚌ","ᚍ","ᚎ","ᚏ","ᚐ","ᚑ","ᚒ","ᚓ","ᚔ","ᚕ","ᚖ","ᚗ","ᚘ","ᚙ","ᚚ","᚛","᚜"],

    /* runas — el signo tallado */
    runas: ["ᚠ","ᚡ","ᚢ","ᚣ","ᚤ","ᚥ","ᚦ","ᚧ","ᚨ","ᚩ","ᚪ","ᚫ","ᚬ","ᚭ","ᚮ","ᚯ","ᚰ","ᚱ","ᚲ","ᚳ","ᚴ","ᚵ","ᚶ","ᚷ","ᚸ","ᚹ","ᚺ","ᚻ","ᚼ","ᚽ","ᚾ","ᚿ","ᛀ","ᛁ","ᛂ","ᛃ","ᛄ","ᛅ","ᛆ","ᛇ","ᛈ","ᛉ","ᛊ","ᛋ","ᛌ","ᛍ","ᛎ","ᛏ","ᛐ","ᛑ","ᛒ","ᛓ","ᛔ","ᛕ","ᛖ","ᛗ","ᛘ","ᛙ","ᛚ","ᛛ","ᛜ","ᛝ","ᛞ","ᛟ","ᛠ","ᛡ","ᛢ","ᛣ","ᛤ","ᛥ","ᛦ","ᛧ","ᛨ","ᛩ","ᛪ"],

    /* geometrias imposibles — el volumen plano, el diagrama */
    geometrias: ["◈","◇","◆","◉","○","●","◐","◑","◒","◓","◔","◕","◖","◗","⬡","⬢","⬣","⬟","⬠","⏢","⏥","⌬","⌭","⌮","⏣","⟁","⟐","⟡","⟢","⟣","⧉","⧠","⧨","⧩","⧪","⧫","⬢","▰","▱","◧","◨","◩","◪","⚟","⚠"],

    /* marcas — registro, mira, plano */
    marcas: ["⌖","⊹","✛","✜","✚","✢","✣","✤","⁙","⁘","⌗","⏚","⏛","⎔","⟟","⟠","⌌","⌍","⌎","⌏","⌐","¬","⌜","⌝","⌞","⌟","⊹","⋆","✦","✧","⟊","⟒","⏦","⏧","⌁","⌇","∴","∵","※","⁂"],

    /* ondas — el agua, la señal */
    ondas: ["∿","≈","≋","﹏","〰","⌇","≀","~","･","∼","≃","≅","⋿","⌁","⍨","⍩"],

    /* matematicas abstractas — el operador desnudo */
    operadores: ["⨀","⨁","⨂","⨃","⨄","⨅","⨆","⨇","⨈","⨉","⨊","⨋","∮","∯","∰","∇","∆","∂","∏","∐","∑","√","∛","∜","∝","∞","⊕","⊗","⊙","⊘","⊚","⊛","⊜","⊝","⋀","⋁","⋂","⋃","⌀","⍟","⍉","⊹"]
  },

  /* ---- la jerga del plano ---- */
  tecnica: {
    siglas: ["VENT","SEC","TERR","NODE","GRID","REF","VEC","SRC","DST","ORG","SYS","MAP",
             "TOPO","LINK","FLUX","SIG","CTRL","BUS","LAT","LON","ALT","AZ","IDX","REV",
             "CAL","RAW","BIT","DAT","OBS","SPAN","ZONE","AREA","EDGE","MESH","FIELD","LAB"],
    unidades: ["dB","‰","°","′","″","µ","∆","λ","θ","φ","Ω","Ø","Hz","px","km","m","‱","%","§","№"],
    signos: ["//","／／","::","··","⟨⟩","[ ]","{ }","⟦⟧","⌈⌉","⌊⌋","→","↦","⇢","⇥","↳","⤳","⊢","⊣","⊤","⊥","∷","≔","≝","≟"]
  }
};

if (typeof module !== 'undefined') module.exports = VOC;
