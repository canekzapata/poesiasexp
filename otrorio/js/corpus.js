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
