# MODO TEXTO

**Un laberinto de caracteres que se recorre en primera persona.**
poesiasexp · canekzapata.net · 2026

Abrir `index.html`. No hay build, ni paquetes, ni red, ni cuentas, ni
telemetría. Todo sucede dentro del navegador.

---

## Qué es

Una rejilla de caracteres —una sola— que se comporta como espacio construido.
El documento no *representa* una terminal: la terminal **es** el edificio, y el
edificio se mira desde adentro.

La aportación de esta pieza frente al resto del repositorio es **profundidad**.
`arquitecturasunicode/` ve el edificio desde afuera, como lámina; `laberinto/`
y `otrorio/` navegan documentos; `escape/` es una terminal de menús;
`estratos/` y `paisajes/` dibujan en canvas libre. Aquí no hay páginas, no hay
dibujo libre y no hay afuera: hay un plano continuo, hecho sólo de celdas, con
fondo, lejanía, oclusión y horizonte.

Quien recorre esto es alguien, no una cámara. Entró por su propio pie y ahora
busca por dónde se sale. El edificio no lo odia: lo contiene, que es peor. Por
eso el léxico habla de la entrada, de la salida y de quedarse, y baja de tono
conforme se baja de nivel: en la planta alta todavía cree que hay puerta; en el
fondo, la puerta ya es sólo una palabra que aprendió afuera.

Se mira mucho más de lo que se lee. Por regla dura, **al menos el 85% de los
caracteres en pantalla son materia no léxica** —bloques, semigráficos, tramas,
marcos, alfabetos ilegibles—. La frase completa no se regala: se gana con
quietud.

---

## El sistema

### El plano único
Todo ocurre en una matriz de celdas de entre 80×25 y 160×50, dimensionada al
abrir según la ventana y la métrica de la fuente que eligió la semilla. Cada
celda guarda carácter, tinta, papel, atributo (normal / intenso / parpadeo /
invertido) y una marca de origen: qué sistema la escribió. Se pinta en un solo
`<canvas>` con `image-rendering: pixelated`, repintando únicamente las celdas
que cambiaron. Cada glifo se estira o se encoge para ocupar exactamente su
celda: así los bloques no dejan junturas, los sextantes de unscii —que miden
menos que las CP437— cuadran, y las inscripciones en phags-pa —que miden el
doble— caben. Nada ocurre fuera de la rejilla, ni medio pixel: si algo debe
verse curvo, se aproxima con caracteres.

Al redimensionar la ventana el laberinto **no se regenera**: se re-encuadra.

### La cámara de texto
El corazón técnico. Por cada columna de celdas del panel CÁMARA se lanza un
rayo (DDA sobre la rejilla del laberinto) y se obtienen distancia, material y
cara golpeada. La distancia se traduce en altura de columna y en densidad de
signo: `█ ▓ ▒ ░ · espacio`. La niebla no es un degradado, es una **rampa de
caracteres**, y sus escalones están donde la profundidad se nota (1.35, 2.7,
5.2, 9.8 y 17 casillas). Las caras norte/sur usan una trama distinta de las
este/oeste, para que las esquinas se lean sin sombra. Suelo y techo tienen
rampas propias y más cortas; el techo es la parte menos informada del cuarto.

El movimiento no es continuo: se avanza celda por celda y se gira en pasos de
15° o 30°, con una interpolación de 110–120 ms. La cámara corre a unos doce
fotogramas por segundo. Se busca la cadencia de una máquina lenta.

### La quietud condensa
Es la tesis de la pieza: **el ruido se vuelve lenguaje cuando el visitante deja
de moverse.**

- a los 4 s sin entrada, las celdas de un muro cercano empiezan a migrar,
  carácter por carácter, hacia una frase;
- a los 8 s la frase está completa y legible;
- al primer movimiento se deshace, más rápido de lo que se hizo;
- la frase leída queda en el REGISTRO. Es la **única** forma de acumular texto.

La misma frase no se ofrece dos veces por sesión. Cuando el léxico se agota,
las frases empiezan a mezclarse entre sí: esa degradación es parte del poema.

**Una frase nunca se recorta.** Si no cabe a lo ancho del muro se parte en
renglones —hasta tres, que es lo que permite la regla de proporción— y si aun
así no cabe, el bloque se ensancha. Lo mismo en el REGISTRO: lo que no cabe baja
al renglón siguiente con sangría. Media frase no dice la mitad, dice otra cosa,
y eso el edificio no lo dice. Está verificado en `tests/smoke.js` sobre las 111
frases del léxico a 61 anchos distintos: ninguna pierde una letra, y una palabra
sólo se parte cuando literalmente no cabe.

Quien corre ve arquitectura. Quien se detiene lee.

### La TUI habitable
Los paneles no son composición: son órganos. El reparto de la rejilla es real
—un árbol binario de particiones, sin superposiciones ni transparencias— y los
rects vecinos comparten su celda de frontera, de modo que las uniones caen
solas en `├ ┬ ╬`. Al ampliar un panel, otro pierde celdas.

| panel | facultad que otorga |
|---|---|
| CÁMARA | la vista. No se puede cerrar. |
| PLANTA | la memoria cartográfica |
| REGISTRO | la narración de lo ocurrido |
| INSPECTOR | el nombre de las celdas |
| PROFUNDIDAD | la medida del fondo (y miente) |

**Cerrar un panel cuesta.** Sin PLANTA el mapa deja de escribirse; sin
REGISTRO nada de lo que pase queda contado; sin INSPECTOR las celdas dejan de
tener nombre. Queda un residuo de una celda en la orilla derecha, que puede
recuperarse, pero lo perdido mientras estuvo cerrado no vuelve.

### Las siete arquitecturas
La semilla elige una, y cada una tiene su mano tipográfica:

| clave | procedimiento | se reconoce por |
|---|---|---|
| excavado | recursive backtracker con sesgo recto | corredores largos, callejones profundos, muros densos |
| tejido | Kruskal | retícula pareja, muchas bifurcaciones cortas, juntas dobles |
| sesgado | sidewinder | el mundo entero se inclina a una esquina; se siente corriente |
| caverna | autómata celular 4-5 | cuartos orgánicos sin ángulos rectos |
| distritos | Voronoi sobre la rejilla | barrios con material propio y frontera de una celda |
| concéntrico | anillos con vanos desalineados | se avanza girando; el centro puede estar vacío |
| dañado | cualquiera de las anteriores | 3–7% de muros que no deberían existir |

Todas son conexas: siempre hay ruta entre dos puntos. Todas tienen bucles
verdaderos, así que volver por donde se vino a veces no devuelve al mismo
lugar. Hay entre uno y tres **umbrales** que bajan de nivel; bajar no es
progresar, es cambiar de gramática. **No hay salida. Hay profundidad.**

### Materiales y erosión
Ocho materiales —cal, ladrillo, sextante, esquirla, hollín, papel, hueso,
cuadrante—, cada uno con seis signos como máximo, una junta y **su propio
autómata**, tomado de `../otrorio/js/automatas.js`: Wolfram 30 y 45 desmoronan,
110 construye, 90 dibuja triángulos, Conway abre huecos, el cíclico hace ondas.

La erosión es lenta: una generación cada dos a cinco segundos, no por
fotograma. Está acotada a 24 celdas alteradas por minuto, para que el mundo se
degrade sin disolverse, y **ninguna modificación estructural se acepta si
desconecta el laberinto**: se verifica por componentes conexas y se revierte.

Frotar un muro con el ratón acelera su autómata localmente. Frotar mucho
**abre un paso que el generador no previó**; el laberinto lo acepta y recalcula
sus rutas, y la PLANTA lo marca con `¤`, porque no lo hizo el arquitecto.

### Los cuerpos de lasletras
`lasletras/` (ESPACIO ESCULTÓRICO) no guarda sólo la lámina proyectada: cada
punto de su superficie conserva `rawX`, `rawY` y `z` —la nube antes de
proyectar— y el glifo con el que está escrito. Sus esculturas ya son volumen, y
su materia ya es tipográfica. Aquí no se les inventa la tercera dimensión: se
deja de aplanarlas.

Entran como **monumentos dispersos**. Cada nivel construye una escultura, la
rompe por su eje más largo en fragmentos —el obelisco roto del catálogo,
repartido en vez de apilado— y siembra uno por cada dieciocho casillas
transitables, unos treinta por mundo. Dónde importa tanto como cuántos: se
puntúa cada casilla por la longitud de la recta despejada que la atraviesa y se
siembra sobre todo en las líneas de visión, porque un cuerpo en un pasillo
largo se ve desde lejos y el mismo cuerpo en un fondo de callejón sólo existe
si vas a dar con él. Uno de cada cinco sí queda al fondo de un callejón, porque
encontrárselo ahí vale. Cada fragmento se voxela en una caja de 6×6×N dentro de
una casilla, y cada vóxel se queda con el glifo del punto que cayó en él: la
escultura sigue estando escrita.

Medido con un caminante que recorre el laberinto de verdad, sobre 30 semillas y
300 pasos: hay un cuerpo en pantalla en el 17% de los fotogramas, el primero
aparece hacia el paso 28, y 28 de cada 30 semillas muestran alguno.

Son **atravesables**: pura aparición, se ven y no se tocan. No alteran el
trazado ni la conectividad, y caminar a través de una queda anotado en el
REGISTRO. Miden entre una y cuatro alturas de muro, así que **sobresalen por
encima de la línea del techo**: son el único sitio de la obra donde hay algo
que mirar hacia arriba.

El trazador no los detiene. Mientras el rayo cruza su casilla, anota la entrada
y el punto medio de la travesía; al pintar la columna se recorre la pantalla y
se pregunta a qué altura del mundo mira cada fila, de modo que no quedan huecos
cuando el cuerpo está lejos. Conservan su propia grafía hasta unas cinco
casillas; más allá se rinden a la misma rampa de niebla que todo lo demás. Sus
letras entran al presupuesto léxico del §2 igual que los muros escritos.

La PLANTA los marca con `♦`.

### Los celadores
Lo que se mueve por el laberinto y no eres tú.

Vienen de **palimpsesto**: cuatro caracteres de escrituras distintas impresos
casi encima, hasta que sus trazos chocan y nace un glifo imposible. En una
pantalla de texto eso no necesita superposición: un glifo base más tres
diacríticos combinantes son cuatro caracteres que ocupan **una sola celda**. El
palimpsesto cabe entero en la rejilla. Los pozos de escritura —trece, de griego
a rovas— se toman de `../poemario/heraclitofable/corpus.js`, que es donde vive.

Hay entre tres y siete por nivel. Rondan una casilla cada 720 ms y **no te
persiguen: te huyen** cuando te acercan a seis casillas, así que hay que
acorralarlos. Mientras rondan **se comen tu mapa**: cada casilla por la que
pasan pierde un grado de recuerdo en la PLANTA.

Alcanzar uno —pisar su casilla— hace dos cosas: suelta una frase del léxico de
**salida**, que es lo único en toda la obra que habla de la puerta en presente,
y **devuelve las casillas que se había tragado**. Es el único bucle de la pieza
que se parece a un juego, y su premio es lenguaje.

Su signo cambia mientras andan: uno de los cuatro caracteres se rehace en cada
paso, porque el palimpsesto nunca termina de decidirse. En la PLANTA parpadean;
`Esc` los detiene como a todo lo demás.

### Niebla, memoria y deterioro
La PLANTA nace vacía: la cartografía es un subproducto del cuerpo. Lo recordado
se degrada —de material específico a `░`, de `░` a punto, de punto a nada— si
no se revisita. Volver a un lugar olvidado no restituye el recuerdo anterior:
escribe uno nuevo, que puede contradecir al viejo.

`localStorage`, indexado por semilla, guarda celdas visitadas, frases leídas,
muros perforados, paneles cerrados, regiones corrompidas y tiempo total. Al
volver, el mundo aparece con sus cicatrices. Un laberinto muy recorrido se
genera más poroso; uno abandonado, más denso.

**Olvidar** es un gesto de la obra, no una opción de configuración: la tecla
`O` borra la memoria de esa semilla, en el acto y sin preguntar dos veces.

### Volcado de núcleo
El error no es una pantalla aparte: es un cambio de régimen del espacio. Cada
tanto —raro, y siempre ligado a algo que el visitante hizo, sobre todo a
perforar un muro— una región del laberinto se corrompe y sus celdas empiezan a
mostrar el estado interno del programa: direcciones, columnas hexadecimales que
casi cuadran, nombres de variables, fragmentos de la semilla, entreverados con
el léxico. Dura unos siete segundos. Es el único momento en que la obra puede
volverse densamente textual.

Es un poema, no un letrero de error: los errores suenan aburridos y reales.
Después, la región queda de otro material. El daño es permanente para esa
semilla.

### Color
16 tintas + 16 papeles, como un adaptador de texto. Sin alfa, sin mezcla: un
cambio de color es un cambio de estado. El conflicto entre codificar
profundidad y material se resuelve así: **la tinta dice de qué está hecho el
muro, el papel dice a qué distancia está.**

Ocho familias cromáticas: riso colorido, papel de archivo, copia carbón, plano
azul, cartulina ácida, noche de terminal, ámbar de fósforo y monocromo verde.
El verde sobre negro pesa 1 de 19: sale en el 5% de las semillas, nunca más del
10% (verificado en `tests/smoke.js`). Con `prefers-contrast: more` se sirve una
familia de alto contraste.

El atributo *parpadeo* se usa con avaricia: prácticamente sólo el cursor.

---

## Controles

### Teclado
| tecla | qué hace |
|---|---|
| `↑` `↓` / `W` `S` | avanzar y retroceder, una celda por vez |
| `←` `→` / `A` `D` | girar 15° o 30°, según la semilla |
| `Q` `E` | desplazamiento lateral |
| `Espacio` | tocar el muro de enfrente |
| `Enter` | bajar por un umbral; o recuperar un panel cerrado |
| `Tab` / `Shift+Tab` | cambiar de panel activo |
| `Ctrl` + flechas | redimensionar el panel activo |
| `Alt` + flechas | intercambiar el panel activo con su vecino |
| `X` / `Supr` | cerrar el panel activo |
| `Esc` | detener toda proliferación (y reanudarla) |
| `?` / `H` | la hoja de controles |
| `R` | desplegar la ficha de rasgos |
| `M` | altavoz de PC |
| `O` | olvidar |
| `P` | imprimir la constancia del recorrido |
| `Shift+S` | exportar PNG a 2× |
| `Shift+A` | exportar `.ans` |
| `Shift+T` | exportar `.txt` |
| `Shift+J` | exportar `.json` |
| `Shift+V` | exportar el último volcado de núcleo |

Las exportaciones llevan `Shift` porque `S`, `A` y `T` caminan: el cuerpo tiene
prioridad sobre el archivo.

### Ratón y tacto
- clic en la CÁMARA: camina hacia esa columna (gira primero si hace falta);
- arrastre sobre un muro en la CÁMARA: lo **frota**;
- clic en la PLANTA: mira hacia esa coordenada, sin teletransportar;
- arrastrar la barra de título: intercambia dos paneles;
- arrastrar la esquina `◢`: redimensiona;
- la `×` de la barra cierra el panel; el `▌` de la orilla lo recupera;
- la `§` de la esquina superior derecha despliega los rasgos, y la `?` de
  debajo abre la hoja de controles;
- en pantallas táctiles aparecen dos pastillas `◄ ►` en las esquinas inferiores
  de la CÁMARA. Ningún gesto necesita dos dedos.

---

## Semilla y rasgos

`?seed=` en la URL, con el mismo `rng.js` (xfnv1a + mulberry32) que
`arquitecturasunicode/`: es el mismo azar firmado del resto del repositorio.
Sin semilla se genera una y se escribe en la URL sin recargar, para que
cualquier recorrido pueda compartirse.

La misma semilla reconstruye exactamente arquitectura, materiales, paleta,
fuente, reparto de paneles, ubicación de umbrales e inscripciones. La semilla
**no** determina lo que hizo el visitante: la memoria es otra capa.

### Semillas cargadas
El sesgo es real y está aquí documentado. Una semilla que contenga:

| palabra | efecto |
|---|---|
| `río` / `rio` | arquitectura **caverna**, paleta **plano azul** |
| `luciérnaga` | paleta **riso**, más parpadeo |
| `virus` | arquitectura **dañado** |
| `hueco` | +0.16 de porosidad: más bucles, menos callejones |
| `regresa` | arquitectura **concéntrico** |
| `noche` | paleta **noche de terminal** |

### Anomalía
**Una por semilla**, y la obra nunca la nombra. Puede ser que el horizonte
respire, que una casilla de la PLANTA muestre siempre otro material, que girar
al norte cueste un paso de más, que cada 91 pasos el papel se invierta una vez,
que exista un muro que jamás se erosiona, que la tira de PROFUNDIDAD se
adelante, que el cursor lata más lento de lo que debería, o que un material
hable con el léxico de otro.

La ficha de rasgos (`R` o la celda `§`) muestra arquitectura, material
dominante, paleta, fuente, número de niveles, nivel actual, tamaño de la
rejilla, cuántos cuerpos escultóricos hay y la semilla. La anomalía no aparece ahí.

---

## Exportación e impresión

- **PNG** a 2×, con el pixelado intacto;
- **`.ans`**: la pantalla actual en ANSI real, con secuencias de escape de
  color y bytes CP437, abrible en un emulador de terminal o en un visor de ANSI
  art. Lo que no cabe en CP437 —sextantes, cuadrantes sueltos, diagonales— se
  aproxima al signo más cercano: la salida es más pobre, no otra cosa;
- **`.txt`**: sólo caracteres, sin color. La versión más portátil del cuarto;
- **`.json`**: semilla, rasgos, estado del laberinto, celdas visitadas, frases
  leídas;
- **volcado de núcleo** como texto, con hoja de impresión propia;
- al **imprimir** sale la constancia del recorrido: la planta tal como se
  recuerda, la ficha de rasgos y las frases leídas en esa sesión. Papel blanco,
  tinta negra, monoespaciada, sin fondos.

---

## Accesibilidad y rendimiento

- **espejo accesible**: un `<pre>` fuera de pantalla con `aria-live="polite"`
  que dice en una línea hacia dónde se mira, qué hay enfrente y qué frase
  acaba de condensarse. No es una vista: es la obra dicha en voz baja;
- todo lo que se hace con ratón se puede hacer con teclado, incluido mover,
  redimensionar y cerrar paneles;
- el foco se dibuja con caracteres: el panel activo lleva el marco doble;
- `prefers-reduced-motion`: sin parpadeo, sin interpolación de movimiento, y la
  condensación se resuelve en un solo paso. La obra sigue completa así;
- `prefers-contrast`: familia de alto contraste;
- funciona en teléfono: la rejilla se hace más chica (unas 39×50 en un
  teléfono en vertical) en lugar de escalarse, para no volverse borrosa, y
  aparecen pastillas táctiles;
- el bucle se pausa con `document.hidden`, y sólo se repintan las celdas
  sucias. El uso de memoria es estable: no se acumulan temporizadores ni
  observadores al cerrar paneles o cambiar de nivel.

---

## Archivos

```
modotexto/
├─ index.html            rejilla, canvas, espejo accesible, constancia
├─ css/pantalla.css      fuentes, celdas, impresión, alto contraste
├─ js/rng.js             xfnv1a + mulberry32 (compartido con el repo)
├─ js/rejilla.js         matriz de celdas, atributos, marcos, pintado sucio
├─ js/materiales.js      juegos de signos, tramas, autómatas y paletas
├─ js/laberinto.js       las siete arquitecturas, conectividad, umbrales
├─ js/esculturas.js     los cuerpos de lasletras, fragmentados y voxelados
├─ js/celadores.js      el palimpsesto que ronda, huye y se come el mapa
├─ js/camara.js          trazador de rayos en modo texto, rampas, muros escritos
├─ js/paneles.js         TUI habitable, fusión de marcos, cierre y residuo
├─ js/lexico.js          frases curadas por profundidad y material
├─ js/condensacion.js    quietud → lenguaje → disolución
├─ js/memoria.js         niebla, deterioro, localStorage por semilla
├─ js/volcado.js         corrupción de región y poema de núcleo
├─ js/exportar.js        PNG, ANS, TXT, JSON, impresión
├─ js/sonido.js          altavoz de PC, opcional
├─ js/app.js             bucle, entrada, estado, URL
├─ tests/smoke.js        determinismo, conectividad, proporción visual/textual
└─ README.md
```

Las fuentes no se duplican: se toman por ruta relativa de `../psfx/`, con la
misma economía de préstamo que usa `vent/`. Los autómatas se toman de
`../otrorio/js/automatas.js` y los cuerpos escultóricos de
`../lasletras/js/`. Por eso la pieza vive dentro del repositorio y no como
carpeta suelta: abierta suelta funciona igual, pero sin erosión y sin cuerpos.

### Pruebas

```sh
cd modotexto && node tests/smoke.js
```

Sin dependencias. Comprueba: el préstamo de `LabAutomata`; determinismo por
semilla (incluida la pantalla inicial, celda por celda); **conectividad de
1000 laberintos**; que las siete arquitecturas aparezcan; que ninguna semilla
pase del 15% de caracteres léxicos ni de tres líneas legibles simultáneas en la
pantalla inicial; que el verde sobre negro no rebase su cuota y que ninguna
familia cromática domine; que haya una anomalía por semilla y una sola; que los
marcos de los paneles se fundan; que los sesgos de semillas cargadas se
cumplan; que perforar no desconecte y que bajar de nivel cambie de gramática;
que el léxico se agote y empiece a mezclarse; y que los cuerpos de lasletras se
siembren, sean deterministas, no caigan dentro de un muro, no tapen un umbral,
no desconecten nada y no rompan la proporción cuando están en pantalla; que
ninguna frase pierda una letra al envolverse, a ningún ancho; y que los
celadores ronden sólo por el aire, se detengan con `Esc`, lleven un signo de
verdad apilado y suelten una frase de salida al ser alcanzados.

La hoja de controles y la ficha de rasgos son las dos únicas cosas que pueden
pasarse de la regla de proporción, y sólo mientras están abiertas: las abre el
visitante, no la obra.

Las secciones masivas (conectividad, arquitecturas, paletas, anomalías) corren
con `esculturas: false`: no miran los cuerpos y así se ahorran una construcción
de `lasletras` por mundo. La suite completa tarda unos 26 s.

---

## Créditos y fuentes

Obra de **canek zapata**, dentro de *poesía sexperimental* (`poesiasexp`).

### Tipografías
De `../psfx/`: `Px437_IBM_VGA_9x8-2x`, `Px437_IBM_XGA-AI_12x20`,
`Px437_NEC_APC3_8x16-2x`, `Px437_ToshibaTxL2_8x16`, `Px437_Wang_Pro_Mono`,
`PxPlus_HP_100LX_6x8`, `PxPlus_HP_150_re`, `PxPlus_Rainbow100_re_80`,
`Ac437_TsengEVA_132_6x14` — reconstrucciones de fuentes de mapa de bits de
hardware de texto reales, del proyecto **Oldschool PC Font Resource** de
VileR (int10h.org). Cada una tiene una métrica de celda distinta, y esa
diferencia cambia las dimensiones del laberinto.

Para las inscripciones ilegibles: `phagspa.ttf`,
`NotoSansEgyptianHieroglyphs`, `SuttonSignWritingLine`.

### Código reutilizado del repositorio
- `arquitecturasunicode/js/rng.js` — xfnv1a + mulberry32, copiado tal cual para
  compartir el mismo azar firmado;
- `otrorio/js/automatas.js` — Wolfram, Conway y autómata cíclico, tomados por
  ruta relativa como erosión de muros;
- `lasletras/js/architecture.js` y `corpus.js` — el motor del ESPACIO
  ESCULTÓRICO, del que salen los cuerpos que habitan los corredores. Se usa su
  nube 3D, no su proyección;
- `poemario/heraclitofable/corpus.js` — los pozos de escritura del
  **palimpsesto**, de donde salen los signos imposibles de los celadores;
- `sutileza/css/unscii-16-full.woff` — detrás de la CP437 en la pila de
  fuentes, para los sextantes y los octantes que las Px437 no cubren;
- `vent/` — la economía de préstamo de fuentes entre carpetas hermanas;
- `paisajes/lexico.js` y `estratos/lexicon.js` — la disciplina de organizar el
  léxico por función y no por tema;
- `escape/hatch.js`, `indice/organismo.js`, `laberinto/js/rutas.js` — la
  gramática de memoria local, residuos y consecuencias entre sesiones.

### Corpus
El léxico de `js/lexico.js` está **curado a mano**. No se cargan los `.txt` del
repositorio ni se vuelcan páginas de libros ajenos: se extrajo tono y campo
semántico de

- William S. Burroughs, *Nova Express* y *Word Virus*;
- Gilles Deleuze y Félix Guattari, *Mil mesetas*;
- Georges Didi-Huberman, *Supervivencia de las luciérnagas*;
- Kodwo Eshun, *More Brilliant Than the Sun*;
- Zach Blas, Melody Jue y Jennifer Rhee (eds.), *Informatics of Domination*;
- Donna Haraway, *Staying with the Trouble*;
- Rosalind Krauss, *The Optical Unconscious*;
- los escritos sobre John Cage compilados por Bernstein y Hatch.

Las únicas citas literales son cuatro, todas de tres a cinco palabras, y
aparecen raramente cuando el léxico propio ya se agotó:

- «storm the reality studio», «rub out the word forever» y «the nova police» —
  William S. Burroughs;
- «it arrives from the future» — Kodwo Eshun.

---

## Lo que esta pieza no hace

Sin verde fósforo como identidad, sin lluvia de katakana, sin glitch ni
aberración RGB ni VHS, sin curvatura de CRT, sin viñeta, sin bloom, sin líneas
de barrido encima de una página normal, sin máquina de escribir, sin calaveras
ASCII, sin `>_` decorativo, sin `[OK]`, sin ventanas de Windows 95 de pegatina,
sin mensajes de hacker, sin cuentas regresivas, sin `ACCESS DENIED`, sin panel
de sliders como primera pantalla, sin botones de «próximamente», sin galería de
variaciones, sin `lorem ipsum`, y sin explicarse por dentro.

La influencia del modo texto está en la lógica —resolución, métrica, atributos,
celdas, límites de color— no en la nostalgia.
