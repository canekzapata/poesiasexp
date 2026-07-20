(function (global) {
  "use strict";

  // Materia seleccionada y reorganizada desde poesiasexp. No intenta contar
  // una historia: cada familia existe para ocupar una función del navegador.
  global.LAB_CORPUS = Object.freeze({
    monumentales: [
      "EL DOCUMENTO TAMBIÉN NAVEGA",
      "OTRA AGUA EN EL MISMO RÍO",
      "LA SALIDA FUE TRADUCIDA COMO ENTRADA",
      "EL ORIGINAL IMPOSIBLE",
      "VOLVER DAÑA MEJOR",
      "LA PÁGINA RECUERDA OTRA PÁGINA",
      "EL NAVEGADOR CARGA EL PRIMER SILENCIO",
      "EL FONDO NO PROVIENE DEL FONDO",
      "UN ERROR PRODUCE UNA RELIGIÓN",
      "LO ILEGIBLE ES SU FUTURO"
    ],
    enlaces: [
      "entrar por el margen", "seguir otra agua", "abrir la ceniza",
      "perder este destino", "doblar la ruta", "visitar el afuera",
      "copiar el hueco", "volver sin regresar", "traducir el borde",
      "hacer clic en la lluvia", "romper el índice", "habitar el atributo",
      "dejar que pase", "sembrar una ventana", "leer menos",
      "continuar en otra pestaña", "cerrar el verbo", "recordar este color"
    ],
    fragmentos: [
      "El texto no fue escrito: fue encontrado escribiéndose.",
      "Un río no se lee dos veces con el mismo idioma.",
      "El archivo guarda todo menos el momento en que fue leído.",
      "La memoria es un mapa dibujado sobre otro mapa que ya se movió.",
      "El manuscrito existe sólo mientras nadie lo entiende.",
      "El signo apunta a otro signo, y así hasta el agua.",
      "El fuego escribe en un alfabeto que sólo la ceniza sabe leer.",
      "El principio del texto está en un fragmento que aún no visitas.",
      "Traducir es cruzar un río cargando el río.",
      "La frase se desplaza; el sentido cambió de cauce.",
      "Una palabra puede ser una puerta; una puerta puede olvidar su pared.",
      "La nave despierta en una pestaña antes de despertar en el espacio.",
      "La trayectoria se curva como una frase que olvidó su verbo.",
      "La Tierra aparece en la ventana como una fruta azul mordida por la distancia.",
      "El mapa del cielo se arruga cuando alguien pronuncia la palabra hogar.",
      "El universo no habla en palabras, sino en reglas simples que florecen.",
      "Una regla mínima produce una tormenta, una célula produce una ciudad.",
      "La interfaz no muestra el mundo: lo hiere y lo vuelve visible.",
      "El sistema pregunta si deseo restaurar la escena. La escena pregunta si desea restaurarme.",
      "Desaparecer también es una manera de terminar la frase."
    ],
    microtextos: [
      "fragmento 0 de 0", "releído 0 veces", "subrayado ∞ veces",
      "sentido parcial", "cauce temporal", "memoria no montada",
      "nodo ya futuro", "original: ninguna", "latencia del fuego",
      "profundidad no verificable", "la nota muerde", "este borde escucha",
      "archivo en vigilia", "el margen discrepa", "ruido con sintaxis",
      "guardar sin conservar", "agua de segunda mano", "una ventana sueña"
    ],
    ventanas: [
      "ventana madre desconocida", "caja que promete algo adentro",
      "cámara del significado provisional", "otra pestaña antes del espacio",
      "ventana de regreso vencida", "interior del vínculo",
      "vista parcial del afuera", "documento todavía pequeño"
    ],
    tablas: [
      "RÍO", "FUEGO", "ARCHIVO", "CENIZA", "CAUCE", "LENGUA",
      "OLVIDO", "ECO", "UMBRAL", "MARGEN", "ÍNDICE", "GLIFO",
      "COPIA", "ORIGINAL", "TIEMPO", "AGUA", "SIGNO", "RUIDO"
    ],
    atributos: [
      "data-cauce", "aria-olvido", "href-futuro", "id-sin-origen",
      "class=agua", "title=ruina", "alt=otra-ruta", "data-memoria=parcial"
    ],
    rutas: [
      "cauce/otro", "archivo/sin-fecha", "afuera/adentro", "ruina/indexada",
      "nave/orbita/local", "agua/agua", "error/que-recuerda", "margen/futuro"
    ],
    titulosDePestana: [
      "el río rechazó sus cookies", "cargando un original que no existe",
      "la pestaña sueña otra pestaña", "este título continúa la frase",
      "archivo que arde despacio", "la dirección perdió la casa",
      "otra internet dentro del mismo corpus"
    ],
    errores: [
      "404: el significado cambió de cauce.",
      "HANDSHAKE: la lengua no responde.",
      "AssertionError: original no encontrado.",
      "La ruta existe, pero dejó de conducir.",
      "El documento confundió tu lectura con clima.",
      "No se pudo cerrar lo que nunca estuvo contenido.",
      "La copia precede al archivo solicitado.",
      "Demasiadas ventanas recuerdan el mismo exterior."
    ],
    altText: [
      "imagen ausente de un río que continúa fuera del archivo",
      "una montaña comprimida no pudo cargarse",
      "copia sin original; el alt text conserva la sombra",
      "la fotografía de la Tierra fue reemplazada por distancia",
      "este espacio vacío contiene una ruta no dibujada"
    ],
    comentariosHTML: [
      "<!-- aquí había una salida -->",
      "<!-- el copista añadió este margen mañana -->",
      "<!-- la ventana cerrada todavía ocupa memoria -->",
      "<!-- no interpretar el brillo -->",
      "<!-- este comentario desea ser visible -->"
    ],
    instrucciones: [
      "acepto los términos y las contradicciones",
      "mueva el rango hasta que la página dude",
      "desmarque la versión considerada original",
      "espere sin tocar el manuscrito",
      "escape detiene la proliferación",
      "el botón atrás conserva una cuerda imperfecta"
    ],
    codigo: [
      "GET /origen 302 cauce", "while(!entiendes){ excava(); }",
      "if (leído) archivo.olvidar();", "chmod 000 /manuscrito",
      "SELECT sentido FROM río WHERE ∅;", "catch(nada){ throw margen; }",
      "const regreso = historia.pop() || 'otra cosa';",
      "div.dataset.memoria = 'imperfecta';"
    ],
    coordenadas: [
      "x:−44 y:8888", "0v/∞", "19.4326°N 99.1332°W",
      "profundidad: 𐇐", "órbita local 000", "fila 110 / generación 30"
    ],
    colores: [
      "amarillo que abre", "azul de la distancia", "rosa reproductor",
      "verde sin archivo", "naranja de retorno", "violeta provisional",
      "negro que conduce fuera", "blanco todavía cargando"
    ],
    preguntas: [
      "¿Quién lee cuando te distraes?", "¿Cuál de tus lecturas dejaste sin cerrar?",
      "¿Y si la salida fuera la entrada mal traducida?",
      "¿El texto existió antes de que lo buscaras?",
      "¿Qué se pierde cuando algo por fin se entiende?"
    ],
    escrituras: {
      literaria: [
        "La lluvia no cae sobre la página: la página aprende a caer.",
        "El jardín crece debajo del código y levanta lentamente sus etiquetas.",
        "Cada estrato es una fecha que la pantalla pronuncia con otro color.",
        "La hoja escribe con luz; el archivo corrige con sombra.",
        "La corriente piensa sin centro y distribuye su recuerdo entre las piedras.",
        "El río conserva su forma sólo el tiempo suficiente para perderla.",
        "Una célula contiene un cielo que todavía no ha elegido su clima.",
        "El bosque enlaza, no suma: cada raíz abre una sintaxis lateral.",
        "Una ventana pequeña puede contener una distancia demasiado grande.",
        "Todo relieve es una herida lenta en la memoria de la superficie.",
        "La nave oyó llover dentro del monitor y creyó que había vuelto.",
        "Lo que no puede leerse de cerca empieza a significar desde lejos.",
        "En el fondo del documento una palabra germina fuera de su idioma.",
        "La marea mueve la forma, no el agua; el enlace mueve la lectura, no la página.",
        "El código no sabe que es código hasta que una flor lo atraviesa.",
        "Se hizo de noche en una celda y el resto de la tabla continuó brillando.",
        "Una lluvia muy antigua insiste en ejecutarse sobre esta pestaña.",
        "El lector dejó el cursor quieto y descubrió que la inacción también escribe.",
        "No hay fondo: sólo capas que aceptaron quedarse detrás.",
        "Al volver, el jardín había aprendido el nombre incompleto del visitante."
      ],
      visual: [
        "RÍO RÍO RÍO RÍO RÍO", "CAER / CARGAR / CRECER", "OTRA OTRA OTRA AGUA",
        "[          memoria          ]", "texto←color←texto←color",
        "una palabra          demasiado lejos", "▓▒░ el margen respira ░▒▓",
        "LLUVIA.HTML LLUVIA.HTML LLUVIA.HTML", "c e l d a   c i e l o",
        "ARCHIVO\\JARDÍN\\ARCHIVO", "∞ enlaces dentro de 1 enlace",
        "<BLOQUE><BLOQUE><BLOQUE>", "el       texto       cae",
        "W O L F R A M / C O N W A Y", "color: palabra; palabra: color;",
        "000101110001011101011101"
      ],
      fauxCodigo: [
        "if (llueve) documento.germinar();",
        "while (río) { href = otraAgua; }",
        "const jardín = Array.from({length: infinito}, semilla);",
        "body::before { content: memoria-del-clima; }",
        "SELECT color FROM lluvia WHERE lectura IS NULL;",
        "garden.appendChild(document.createTextNode('raíz'));",
        "@media (min-rain: 1px) { .palabra { overflow: cielo; } }",
        "for (const estrato of tiempo) estrato.pensar();",
        "GET /afuera 302 /adentro/del/agua",
        "canvas.fillText(archivo, x = deriva, y = recuerdo);",
        "rule[110].then(ciudad).catch(jardín);",
        "<div data-especie=\"nube\">un error fértil</div>",
        "--tinta: var(--frase-que-no-cabe);",
        "localStorage.setItem('lluvia', JSON.stringify(visitante));",
        "function caer(texto) { return texto.split('').reverse(); }",
        "grid[x][y] = vecinos === 3 ? palabra : silencio;",
        "chmod +x ./primavera && ./primavera --sin-centro",
        "try { traducir(raíz); } catch (luz) { continuar(); }",
        "0x52 0x49 0x4f 0x20 0x4f 0x54 0x52 0x4f",
        "document.querySelectorAll('vacío').forEach(abrir);"
      ],
      bloques: [
        "blockquote: una voz inclina todo el documento",
        "pre: el espacio también conserva información",
        "address: esta página vive en una dirección provisional",
        "details: abrir cambia el peso del texto",
        "fieldset: una frontera alrededor de una pregunta",
        "table: el río acepta filas durante unos segundos",
        "ul: una lista puede crecer como micelio",
        "figure: la escritura posa como imagen",
        "code: una instrucción ensaya su propia metáfora",
        "marquee fantasma: el movimiento sobrevive sin etiqueta"
      ],
      lluvia: [
        "cae", "carga", "otra agua", "todavía", "href", "llueve adentro",
        "memoria mineral", "una letra", "la misma nube", "archivo mojado",
        "texto de fondo", "error fértil", "jardín local", "sin centro",
        "una celda vive", "otra celda lee", "scroll lateral", "tinta azul",
        "regla 110", "el cursor espera", "volver", "no ha terminado"
      ],
      ascii: [
`        +----------+
       /          /|
      /  ARCHIVO / |
     +----------+  |
     |  otra    |  +
     |  agua    | /
     |          |/
     +----------+`,
`             .      *
        *        .
             /\\
       _/\\_/  \\_/\\_
  ~~~~ otra corriente ~~~~
       \\  raíz raíz /
        \\__||||___/`,
`        .-.-.     .-.-.
     .-(  jardín de  )-.
    (__ hipervínculos __)
       '._   |   _.'
          \\ | /
        ---\|/---
           ||
       ____||____`,
`      [ antena de lluvia ]
             /|\\
            / | \\
       ____/  |  \\____
      /   señal: todavía \\
     /____________________\\
         |  |  |  |`,
`       00000100000
       00001110000
       00011001000
       00110111100
       01100100010
       11011110111
       regla / jardín`
      ]
    },
    acontecimientos: {
      visita: [
        "La página {page} reconoció una forma de lectura que todavía no tenía nombre.",
        "En {page}, el lector encontró un {topology} creciendo dentro del río.",
        "El archivo registró la llegada a {page} como un cambio leve de clima."
      ],
      enlace: [
        "Un hipervínculo salió de {page} llevando consigo la palabra «{detail}».",
        "La ruta cambió de agua: {page} dejó abierta una dirección hacia {detail}.",
        "El lector tocó «{detail}» y el documento anotó una bifurcación."
      ],
      ventana: [
        "Una ventana nació en {page}; durante un instante tuvo memoria de su madre.",
        "El texto abrió otra superficie y la llamó {detail}.",
        "Apareció una habitación provisional dentro de la pestaña {page}."
      ],
      destruccion: [
        "El enlace «{detail}» desapareció, pero su dirección quedó húmeda.",
        "En {page} una etiqueta terminó de existir y empezó a ser residuo.",
        "La página perdió una forma; el archivo la conservó como acontecimiento."
      ],
      reproduccion: [
        "La página {page} produjo un descendiente con una variación en el color.",
        "Un documento pequeño se separó de {page} y conservó «{detail}».",
        "El río se reprodujo sin copiarse exactamente."
      ],
      automata: [
        "La regla {detail} encontró una figura y la dejó vivir varias generaciones.",
        "Una población celular modificó la lectura de {page}.",
        "El autómata convirtió vecinos en una textura que parecía recordar."
      ],
      grafica: [
        "La página {page} intentó medir {detail} y produjo otra forma de lluvia.",
        "Una gráfica apareció como evidencia provisional: {detail}.",
        "El observatorio convirtió ruido en ejes y llamó al resultado {detail}."
      ],
      boton: [
        "El botón «{detail}» fue presionado y dejó de fingir que era interfaz.",
        "En {page}, un botón escribió la acción {detail}.",
        "La superficie recibió una orden pequeña: {detail}."
      ],
      ruido: [
        "El ruido de {page} aumentó: {detail}.",
        "Una capa adicional se declaró visible bajo el nombre {detail}.",
        "La señal conservó su error más reciente: {detail}."
      ],
      canibal: [
        "La página {page} devoró código ajeno y produjo {detail}.",
        "Una etiqueta de otra dirección fue digerida dentro de {page}: {detail}.",
        "El recorrido del lector mezcló dos gramáticas y dejó visible {detail}."
      ],
      sonido: [
        "La regla celular de {page} comenzó a sonar: {detail}.",
        "Tone.js recibió el acontecimiento {detail} y lo volvió una frecuencia.",
        "El navegador abrió su contexto de audio para {page}: {detail}."
      ],
      espera: [
        "La inacción duró lo suficiente para que {page} revelara otra capa.",
        "Mientras nadie hacía clic, el jardín continuó escribiendo.",
        "El documento registró una espera como forma de navegación."
      ],
      poema: [
        "El tiempo entregó otra línea al poema de {page}: {detail}.",
        "Una frase necesitó permanencia antes de permitir su lectura.",
        "En {page}, esperar dejó de ser pausa y se volvió verso."
      ],
      zapping: [
        "La señal cambió de página sin pedirle permiso al índice: {detail}.",
        "El zapping convirtió {page} en una estación provisional.",
        "Una frecuencia de navegación desplazó la lectura hacia {detail}."
      ],
      mapa: [
        "El mapa abrió la memoria local del recorrido: {detail}.",
        "Las páginas usadas se ordenaron por el momento de su aparición.",
        "El lector pidió un mapa y recibió el rastro de sus propias cargas."
      ],
      rareza: [
        "Ocurrió {detail}; el navegador decidió archivarlo como clima.",
        "Una baja probabilidad se volvió visible en {page}: {detail}.",
        "La infraestructura produjo un acontecimiento que no podrá repetirse igual."
      ]
    },
    nahuatl: {
      variedad: "náhuatl clásico / grafía normalizada sin cantidades vocálicas",
      palabras: [
        { nah: "atl", es: "agua" }, { nah: "atoyatl", es: "río" }, { nah: "amoxtli", es: "libro" },
        { nah: "tlahtolli", es: "palabra" }, { nah: "xochitl", es: "flor" }, { nah: "cuicatl", es: "canto" },
        { nah: "ohtli", es: "camino" }, { nah: "nextli", es: "ceniza" }, { nah: "tletl", es: "fuego" },
        { nah: "yohualli", es: "noche" }, { nah: "ehecatl", es: "viento" }, { nah: "yollotl", es: "corazón" },
        { nah: "tlalticpac", es: "sobre la tierra" }, { nah: "nican", es: "aquí" }, { nah: "mixtli", es: "nube" },
        { nah: "quiahuitl", es: "lluvia" }, { nah: "citlalin", es: "estrella" }, { nah: "nepantla", es: "en medio" },
        { nah: "tlacuilolli", es: "pintura / escritura" }
      ],
      fragmentos: [
        { nah: "An nochipa tlalticpac: zan achica ye nican.", es: "No para siempre en la tierra: sólo un poco aquí.", fuente: "Cantares mexicanos" },
        { nah: "Campa nel tiazque?", es: "¿Hacia dónde iremos, en verdad?", fuente: "Cantares mexicanos" },
        { nah: "Azo tla nel o tic itohua nican?", es: "¿Acaso decimos aquí algo verdadero?", fuente: "Cantares mexicanos" },
        { nah: "Zan tontemiqui, in zan toncochitlehuaco.", es: "Sólo soñamos, sólo despertamos del sueño.", fuente: "Cantares mexicanos" },
        { nah: "Cuix oc ceppa ye tonemiquiuh?", es: "¿Acaso volveremos a vivir otra vez?", fuente: "Cantares mexicanos" },
        { nah: "In tlilli, in tlapalli.", es: "La tinta negra, el color rojo: escritura y saber.", fuente: "tradición nahua" },
        { nah: "In xochitl, in cuicatl.", es: "La flor, el canto: palabra florida.", fuente: "tradición nahua" },
        { nah: "In atl, in tepetl.", es: "El agua, el cerro: el lugar como cuerpo doble.", fuente: "tradición nahua" }
      ],
      parrafos: [
        { nah: "Campa nel tiazque? Ca zan titlacatico. Ca ompa huel tochan, in canin Ximoayan, in oncapa in Yolihuayan aic tlamian.", es: "¿Hacia dónde iremos, en verdad? Sólo hemos nacido; allá está nuestra casa, en Ximoayan, donde el vivir no termina.", fuente: "Cantares mexicanos" },
        { nah: "An nochipa tlalticpac: zan achica ye nican. Tel ca chalchihuitl no xamani, no teocuitlatl in tlapani, no quetzalli poztequi.", es: "No para siempre en la tierra: sólo un poco aquí. El jade se quiebra, el oro se rompe, la pluma de quetzal se desgarra.", fuente: "Cantares mexicanos" },
        { nah: "Azo tla nel o tic itohua nican, Ipalnemohuani? Zan tontemiqui, in zan toncochitlehuaco; ayac nelli in quilhuia nican.", es: "¿Acaso decimos aquí algo verdadero? Sólo soñamos, sólo despertamos; nadie dice aquí una verdad definitiva.", fuente: "Cantares mexicanos" },
        { nah: "Cuix oc ceppa ye tonemiquiuh? In yuh quimati moyol: zan cen tinemico.", es: "¿Volveremos a vivir otra vez? Que lo sepa tu corazón: sólo una vez venimos a vivir.", fuente: "Cantares mexicanos" }
      ],
      fuentes: [
        { titulo: "Cantares mexicanos / textos citados en su original náhuatl", url: "https://historicas.unam.mx/publicaciones/publicadigital/libros/obras_leon_portilla/339/339_04_08_apendicei.pdf" },
        { titulo: "Gran Diccionario Náhuatl / UNAM", url: "https://gdn.iib.unam.mx/" }
      ]
    },
    glifos: {
      phaistos: Array.from("𐇐𐇑𐇒𐇓𐇔𐇕𐇖𐇗𐇘𐇙𐇚𐇛𐇜𐇝𐇞𐇟𐇠𐇡𐇢𐇣𐇤𐇥𐇦𐇧𐇨𐇩𐇪𐇫𐇬𐇭𐇮𐇯𐇰𐇱"),
      cuneiforme: Array.from("𒀀𒀁𒀂𒀃𒀄𒀅𒀆𒀇𒀈𒀉𒀊𒀋𒀌𒀍𒀎𒀏𒁃𒂷𒃻𒄞𒆳𒇻𒈾𒉎𒊩𒌋"),
      lineara: Array.from("𐘀𐘁𐘂𐘃𐘄𐘅𐘆𐘇𐘈𐘉𐘊𐘋𐘌𐘍𐘎𐘏𐘐𐘑𐘒𐘓"),
      linearb: Array.from("𐀀𐀁𐀂𐀃𐀄𐀅𐀆𐀇𐀈𐀉𐀊𐀋𐀍𐀎𐀏𐀐𐀑𐀒𐀓𐀔𐀕𐀖"),
      egipcio: Array.from("𓀀𓁐𓂀𓃀𓅃𓆃𓇋𓈖𓉐𓊃𓋴𓌂𓍯𓎁𓏏𓁷𓂝𓃰𓅓𓆓𓇳𓈗"),
      anatolio: Array.from("𔐀𔐁𔐂𔐃𔐄𔐅𔓐𔓑𔓒𔓓𔓙𔓚𔓬𔒂𔒚𔗷𔖱𔕰"),
      agua: Array.from("≋≋≋〰〰﹏﹏∿∿∽∽≈≈≋⌇⌇⌁⌁⌇"),
      cajas: Array.from("╔╗╚╝╠╣╦╩╬┌┐└┘├┤┬┴┼▓▒░█▄▀"),
      flechas: Array.from("←↑→↓↖↗↘↙↜↝↞↟↠↡⇠⇡⇢⇣⟵⟶⤳⤺"),
      operadores: Array.from("∅∞∴∵⊕⊗⊙⊚⊛⊜⋈⋉⋊⌘⌖⌬⟁⟡⧉")
    }
  });
})(window);
