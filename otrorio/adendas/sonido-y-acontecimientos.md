# Adenda: sonido y acontecimientos

Este documento conserva la dirección de la capa sonora. La primera fase ya
forma parte del runtime mediante `js/sonido.js` y Tone.js 15.1.22 vendorizado;
las materias más complejas descritas abajo siguen siendo posibilidades.

## Estado actual

- activación optativa desde el umbral o los formularios y carga diferida de
  Tone.js únicamente después de ese gesto;
- recuerdo local de esa elección y despertar mediante el siguiente gesto;
- un único motor sonoro en la ventana principal; los `iframe` transmiten sus
  acontecimientos sin crear otros sintetizadores ni `AudioContext`;
- escala, tempo, swing e intervalo derivados de semilla, regla y topología;
- PolySynth/FM, ruido, pulso, filtro y delay con niveles conservadores;
- acontecimientos de canibalismo, gráficas, autómatas, enlaces y destrucciones
  convertidos en pequeñas variaciones sonoras;
- `Esc` como silencio reversible; pausa, retirada de listeners y disposición
  de los nodos al abandonar la página;
- ninguna dependencia de CDN, samples o red.

## Regla principal

El sonido no será fondo musical, ambientación ni recompensa. Será otra forma de
infraestructura: una consecuencia audible de relaciones que ya existen entre
páginas, autómatas, color, tiempo y memoria.

No habrá autoplay. La primera activación requerirá un gesto explícito y siempre
existirá una manera visible de callar la pieza. Tone.js deberá guardarse
localmente; la obra seguirá funcionando completa si el audio no carga.

La proliferación visual no implicará proliferación de motores de audio. Una
constelación de documentos puede alterar la partitura común, pero sólo la
ventana superior administra el transporte y el contexto sonoro.

## Materias sonoras posibles

- **Wolfram:** cada nueva fila funciona como secuenciador. Las células vivas no
  equivalen automáticamente a notas: seleccionan silencios, duraciones,
  filtros, paneo o aperturas de envolvente.
- **Conway:** nacimientos, supervivencias y muertes forman tres familias
  tímbricas. Una figura estable puede sostener un tono casi inmóvil; un
  oscilador o nave celular puede cruzar lentamente el estéreo.
- **Autómata cíclico:** los estados cromáticos pasan a un círculo de timbres,
  sin imponer una escala musical occidental fija.
- **Tipográfico:** longitud, puntuación y clase HTML de una frase pueden decidir
  ritmo, registro y articulación. El texto no se sintetiza como voz.
- **Ventanas:** abrir una ventana crea un espacio acústico pequeño. Cerrarla no
  reproduce un efecto de interfaz: elimina una voz del conjunto.
- **Rutas:** un enlace visitado varias veces acumula una resonancia muy leve. El
  botón Atrás puede recuperar una sombra, no repetir exactamente el sonido.

## Paletas y territorios

Las paletas no se traducirán a notas concretas. Cada slot semántico controlará
una dimensión: `paper` puede ser ruido o silencio; `ink`, densidad; `blue`,
profundidad; `red`, ataque; `green`, retroalimentación; `yellow`, brillo.

Los jardines aportan territorios acústicos: aire, bosque, litoral, abismo y
subsuelo. Son filtros y comportamientos, no bancos de sonidos naturalistas. Un
bosque no tiene que sonar a pájaros; puede sonar a una red que comparte señal.

## Relación con la crónica

Los acontecimientos guardarán una notación textual del sonido, nunca audio ni
datos pesados. Ejemplos:

- `la regla 110 abrió tres silencios azules`;
- `una ventana sostuvo un tono durante dos páginas`;
- `el archivo perdió el pulso que acompañaba a la ruta 017`;
- `Conway dejó una figura estable detrás del texto`.

Al imprimir la crónica, esta notación permitirá que la experiencia acústica
persista como literatura y no como transcripción técnica.

## Límites

- máximo de voces simultáneas;
- suspensión completa en pestañas ocultas;
- respeto de preferencias de movimiento y reducción sensorial;
- compresor/limitador final conservador;
- ninguna frecuencia extrema o cambio brusco de volumen;
- controles de silencio en el umbral y los formularios, además de `Esc`;
- el audio nunca desbloquea rutas necesarias.

Las siguientes fases deben ampliar `js/sonido.js` sin convertir la pieza en un
instrumento con panel de controles.
