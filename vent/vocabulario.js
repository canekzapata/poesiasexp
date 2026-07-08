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
  frases: [
    "Pinos verdes y una choza rústica, el Sol hundiéndose en el aire puro.",
    "No hay gansos silvestres que pasen volando, y ella está lejos, lejos.",
    "Del otro lado del agua nubes oscuras se arremolinan.",
    "Bajo los rayos de la Luna los islotes aparecen expuestos.",
    "Un chaparrón sobre la choza de techo de paja.",
    "Nubes blancas en el cielo recién despejado.",
    "Hojas cayendo, ni una palabra hablada.",
    "La mente similar al vacío.",
    "La vitalidad similar al arco iris.",
    "Entre los miles de picos de Wu, volando con las nubes, corriendo con el viento.",
    "Sé un observador del Cielo y la Tierra.",
    "Construir una choza bajo los pinos.",
    "Conociendo sólo la mañana y la noche, pero no cuál estación pueda ser.",
    "Al lado del arroyo sinuoso.",
    "Debajo de la sombra del pino oscuro.",
    "Escuché la música del cielo, sorprendido por sus raras melodías.",
    "No es de los átomos del cosmos sino como si llegara hasta las nubes blancas.",
    "Nacido allí de brisas translúcidas.",
    "Allá lejos, parece a mano. ¡Llegas cerca, ya no está allí!",
    "Está en las colinas apiladas, en los árboles altos, en los musgos oscuros, en los rayos del Sol.",
    "Su débil sonido elude el oído.",
    "La vida se extiende a cien años, y aún así es un período muy corto.",
    "¡Ah, ahí está la Montaña del Sur en su grandiosidad!",
    "Pero las nubes son densas y no conozco el lugar.",
    "Las nieblas se disuelven, el Sol se eleva, ningún hombre aparece aún.",
    "El remo boga, repentinamente las montañas y el río son verdes.",
    "Navegando en medio de la corriente, mira hacia atrás, al cielo infinito.",
    "Desde los acantilados, las nubes lo siguen sin intención.",
    "Mil montañas, ningún pájaro vuela.",
    "Diez mil senderos, ni una huella de hombre.",
    "En un bote, un viejo vestido a la ligera, pescando solo, en el helado río nevado.",
    "Con una piedra por almohada, me dormí, y mi libro cayó de mi mano cansada.",
    "Las brisas de primavera barren los prados verdes.",
    "Un pájaro blanco rompe el universo verde de la ladera de la montaña.",
    "El agua viviente debe ser cocida con fuego viviente.",
    "Extraigo yo mismo la pureza de la laguna.",
    "La Luna está guardada en un jarro.",
    "Corto el río con un cucharón.",
    "Repentinamente se oye el viento, vertiéndose en el bosque de pinos.",
    "Sentado ociosamente, escucho las guardias sonando en la ciudad desierta.",
    "Blanca, escasa e hirsuta, mi barba se mezcla con el viento.",
    "Apoyado en mi vara escucho al río.",
    "En la noche profunda el viento sueña.",
    "El pescador deja que el pequeño remo se mueva, y que el bote flote.",
    "Cuando se despierta el pescador, no tiene idea de dónde se encuentra.",
    "Y ahí en el río, su sueño se rompe en pedazos en esta primavera.",
    "Entre capullos que caen, y candelillas que vuelan.",
    "Sobrio pero borracho, borracho pero sobrio.",
    "Interminablemente, interminablemente en el lago crecen los berzos.",
    "Los vientos nocturnos y los rocíos tienen el aroma del perfume de los lotos.",
    "Esperemos y miremos el brillo del lago cuando la Luna se ponga.",
    "¡Qué profundamente silencioso es el templo de Tao!",
    "Árboles con hojas coloreadas están creciendo y extendiéndose.",
    "Olvidado de las palabras, paseo y descanso aquí.",
    "Quemo incienso para romper el profundo silencio.",
    "Bebo el agua del arroyo y me relajo con alegría.",
    "Qué tranquilo es, como al comienzo del Cielo y la Tierra.",
    "Para estar libre del ruido me construí una pequeña cabaña lejos, en lo profundo de las montañas.",
    "Cuando llega la primavera observo los pájaros.",
    "En otoño trepo a los más altos picos.",
    "Así disfruto del verdadero sabor de las estaciones.",
    "La montaña sólida, me temo, saldría volando.",
    "La Naturaleza no es igual que el hombre.",
    "La quietud es como el estanque de los cuatro mares.",
    "Alta es la Montaña de las Brujas, alta y grande.",
    "Profundas son las aguas del Huai, profundas y raudas.",
    "Aquí estoy detenido sin botador ni remo.",
    "Ante estas turbulentas arremolinadas aguas.",
    "Largo, muy largo el camino.",
    "Solloza el pez varado en las arenas del río.",
    "Profundos y oscuros los caminos del Monte Frío.",
    "Frescos y silenciosos los bordes de sus torrentes.",
    "Pájaros por doquier cantando sin nadie que rompa la paz.",
    "Susurro del viento que acaricia el rostro.",
    "Y la nieve copiosa que cubre el vestido.",
    "Pasan los días sin que el sol aparezca.",
    "Mi corazón como la luna de otoño.",
    "Verde estanque de limpias y brillantes aguas.",
    "Trepo por los senderos de la Montaña Fría.",
    "Senderos que parecen no tener final.",
    "Largas torrenteras pedregosas.",
    "Anchos barrancos con yerba que la neblina empaña.",
    "Musgo resbaladizo sin haber llovido.",
    "Cantan los pinos sin soplar el viento.",
    "¿Por qué no rompes los lazos del mundo y vienes a sentarte conmigo entre las blancas nubes?",
    "He recorrido errante muchos miles de leguas.",
    "Viajado por ríos donde crecía poderosa la yerba.",
    "Cruzado la lejana muralla donde se levantan rojizas polvaredas.",
    "Ahora he vuelto a la Montaña Fría.",
    "Apoyo la cabeza en la corriente y me lavo los oídos.",
    "Gritan los monos, una fría niebla cubre los arroyos.",
    "Mi puerta de ramas armoniza con el color de los riscos.",
    "He cavado una poza donde se vierte el agua del manantial.",
    "Recogiendo plantas pasaré los años que me restan.",
    "Contemplo a lo lejos, entre el viento y la bruma, el país de los cinco vados.",
    "Aun en los confines del mundo seguiremos estando cerca.",
    "Claras como el espacio, las aguas de Chu allá muy lejos se unen al verde mar.",
    "Miles de leguas nos separan, mas una copa de vino y nos sentimos unidos.",
    "En el valle los pájaros cantan al brillante sol.",
    "En la ribera los monos aúllan al viento de la tarde.",
    "Ante mi lecho la luz de una brillante luna semeja escarcha que cubriera el suelo.",
    "Alzo la cabeza, contemplo la brillante luna; luego la bajo y me acuerdo de mi tierra.",
    "Doradas nubes sobre el borde de la muralla.",
    "Hasta ella llegan voces a través de la verde gasa de la ventana.",
    "En la soledad de su alcoba, su llanto parece lluvia.",
    "¿No veis que las aguas del Río Amarillo descienden del cielo y hasta el mar corren raudas para no retornar?",
    "Por la mañana negra seda; ahora, en el ocaso, se han vuelto nieve.",
    "Verdes montañas se extienden más allá de la muralla norte.",
    "Blancas aguas rodean la ciudad del este.",
    "Los pensamientos del viajero: nubes flotantes. Los sentimientos del viejo amigo: el sol poniente.",
    "Una jarra de vino entre las flores; bebo solo, sin compañía de amigo.",
    "Alzo mi taza, invito a la luna; con mi sombra somos tres.",
    "Es primavera, tiempo de alegría; canto, la luna empieza a oscilar; bailo, y se alborota mi sombra.",
    "Volveremos a encontrarnos, espero, allá lejos, en el Río de Plata.",
    "Sopla el viento; las flores de los sauces llenan la taberna con su fragancia.",
    "Preguntad a esas aguas que fluyen hacia el este si pueden ir más lejos que la amistad de un amigo."
  ],

  /* ---- el lexico corto: nombres del paisaje ---- */
  palabras: [
    "montaña","monte","cordillera","risco","ladera","cumbre","valle","cañada","barranco",
    "río","arroyo","torrente","laguna","estanque","mar","vado","orilla","cascada","manantial",
    "nube","niebla","bruma","viento","brisa","lluvia","nieve","escarcha","rocío","tormenta",
    "sol","luna","astro","estrella","aurora","ocaso","cielo","bóveda","horizonte","sombra",
    "pino","bambú","sauce","musgo","yerba","loto","junco","raíz","hoja","semilla",
    "pez","ave","pájaro","mono","grulla","garza","ciervo","cangrejo","pescador","recluso",
    "piedra","roca","arena","polvo","jade","sal","fuego","brasa","ceniza","humo",
    "silencio","vacío","quietud","distancia","camino","sendero","umbral","confín","territorio","topología",
    "isla","islote","meseta","altiplano","duna","delta","estuario","glaciar","costa","frontera"
  ],

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
