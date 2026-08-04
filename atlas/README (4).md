# ATLAS DE LO ILEGIBLE
### un archivo poético en cadena que intenta leerse a sí mismo

net.art generativo para el bootloader **SVG-JS** de `bootloader.art`.

No es un mapa bonito sobre un poema. Es un poema que se volvió mapa, un mapa
que se volvió archivo, y un archivo que escucha, cambia de color, pierde notas,
hace crecer rutas, destruye clasificaciones y sigue intentando leerse.

> Un archivo intentó organizar todos los textos de `poesiasexp`. No pudo decidir
> si eran poemas, mapas, programas, citas, errores, mensajes de una sonda,
> memorias, instrucciones o cuerpos. Así que construyó un atlas. El atlas empezó
> a enlazar fragmentos con fragmentos. Las notas produjeron notas. Los autómatas
> celulares ocuparon los huecos y comenzaron a clasificar el texto según reglas
> que nadie pidió. La clasificación se volvió paisaje. El paisaje, interfaz. La
> interfaz, memoria. **El visitante llega cuando esto lleva mucho tiempo pasando.**

---

## Qué se publica

| archivo | qué es |
| --- | --- |
| `atlas.js` | **la obra**. El código que corre en el bootloader. |
| `index.html` | el banco de pruebas: emula `BTLDR.svg` y `BTLDR.rnd()` para verla fuera de la cadena. |

En la cadena sólo va `atlas.js`. El entorno provee `BTLDR.svg` (la raíz SVG ya
montada) y `BTLDR.rnd()` (azar firmado por la semilla del token). Si `BTLDR` no
existe —al abrir el HTML en disco— la pieza se lo inventa a partir de la URL y
corre igual.

```bash
python3 -m http.server 8000
# → http://localhost:8000/poemario/atlas-de-lo-ilegible/
```

Sin `?seed=` el banco de pruebas sortea una semilla y **la escribe en la URL**,
para que la excavación siga siendo repetible. Con `?seed=lo-que-quieras` repite
exactamente esa. `R` sortea otra. Esa tecla y ese sorteo viven en `index.html`,
no en la obra: es la mesa donde la obra se prueba.

**Si la pieza sale siempre igual**, mira arriba a la derecha, donde dice
`azar: …`. Debe decir `btldr`. Si dice `por-omision`, el bootloader no fue
encontrado y la pieza está corriendo con su semilla de respaldo — el mismo dato
está en `data-fuente-semilla` de la raíz SVG. `atlas.js` busca `BTLDR` por el
nombre desnudo, no por `window.BTLDR`, precisamente porque una ligadura léxica
(`const BTLDR = …`, o el parámetro de un envoltorio) no crea propiedad en
`window` y dejaría a la obra congelada en una sola excavación.

Peso: ~110 KB en claro, ~35 KB comprimido. Más de la mitad es corpus: los
fragmentos son la carga útil, no el decorado. Si un mint exige menos, la palanca
es `C.pasajes` — pero recortarla recorta la lectura sostenida, que es la única
defensa de la pieza contra volverse ruido bonito.

## Restricciones cumplidas

- SVG en línea y JavaScript vanilla. Sin APIs remotas, sin servidores, sin red.
- Sin imágenes, tipografías ni bibliotecas remotas. Sin `Math.random()`. Sin `Date.now()`.
- El azar se cosecha una sola vez de `BTLDR.rnd()` y de ahí salen corrientes
  nombradas (`topologia`, `color`, `musica`, `texto`, `automata`, `prehistoria`).
  Por eso **el orden en que toques las cosas no altera la estructura base**.
- La misma semilla reproduce topología, selección de texto, sistema de color y
  partitura. *Verificado*: dos cargas de la misma semilla dan una huella
  idéntica de rutas, nodos, colores y texto legible.
- La interacción muta; no destruye. No hay estado del que no se pueda seguir leyendo.
- El árbol SVG es parte del poema: grupos con nombre, máscaras, símbolos,
  `<use>`, `tspan` y atributos `data-*` que se pueden leer con el inspector —
  y que la obra misma expone con el verbo `source`.

## El corpus

Nada aquí es relleno. Todo sale de `poesiasexp`:

- `poemario/indice_del_rio/` — el estrato legible, las glosas, las definiciones
  circulares, los lectores anteriores, el humor de archivo, el código como verso;
- `poemario/navenotripulada.txt` — *NADIE A BORDO*: las transmisiones, el retraso
  creciente, la señal con huecos, la antena y la bocina rudimentaria;
- `poemario/vidamedia/ninguna_parte_del_mensaje_viaja_sola.txt` — R-27, el programa
  CORO, la ficha del objeto, la región **H6** definida como una falta de hidrógeno;
- `poemario/poemas de canek.txt` — *Los pixeles y la luna*, *sobre la aurora*,
  *el Planeta 9*;
- `poemario/lipo.md` — *Some poems that Li Po conveyed to me…*;
- `poemario/montalbettmsmds.md` — la caja que promete algo adentro, el desfase
  entre decir y ver, la ceguera del poema;
- `poemario/tednelson.txt` y el Landow — el vínculo que no lleva a otra parte:
  hace otra parte;
- `poemario/egipto.txt` — la celda, la soledad, las horas cantadas;
- `poemario/heraclitofable/corpus.js` — πάντα ῥεῖ, y el río en el que entramos
  y no entramos;
- `poemario/vocabulario.js` (VENT) — el habla del paisaje orbital;
- `poemario/el_mundo_no_compila_diagramatico/`, `automatas.js`, `elarchivono/` —
  la gramática de aparato: siglas, unidades, tablas rotas, reclasificaciones.

El corpus genera **todo**: las rutas, la topología, los campos de color, las
clasificaciones, las mutaciones, las voces, la estructura musical, los errores,
la memoria y los silencios.

## Gramática hipertextual

Cada frase es una ruta. Cada palabra es un nodo. Cada signo de puntuación es una
juntura. Cada silencio es una región que falta. Cada error es una coordenada
nueva. **Un enlace no navega: opera.**

`transport` · `insert` · `erode` · `cite` · `infect` · `fold` · `duplicate` ·
`reclassify` · `remember` · `forget` · `seed` · `recolor` · `close` · `open` ·
`disobey` · `return` · `scar` · `source` · `selector` · `void`

Los atributos son parte del poema y son visibles:

```
data-action  data-target  data-rule  data-memory  data-cost  data-seed  data-state
```

El hash participa del estado: `#region=río&depth=4&memory=scar&rule=90&seed=3bbf2326`

Dos que conviene conocer antes de tocar nada:

- **`disobey`** hace siempre lo que pide el nodo *siguiente*. No es azar: es una
  regla constante. Hay rutas que no se comportan como se anuncian.
- **`void`** no hace nada. Lo apunta. Varios ciclos después, una ruta que no
  tocaste cambia sola y una nota lo declara. *Lo que no ocurre también se acumula.*

## Sistema de color

No hay paletas. Hay una **ecología cromática** por token: tono base, deriva de
tono a lo ancho, flujo a lo hondo, contraste, temperatura (fuego/agua),
crominancia, probabilidad de ruptura, luminosidad de fondo y de grano.

El color se calcula en **OKLCH** y se convierte a sRGB a mano, para que la
luminosidad sea perceptual y dos regiones puedan chocar sin volverse barro.

Cada región recibe un régimen —`análogo`, `complementario`, `tríada`,
`monocromo`, `cálido-frío`, `espectral`, `pastel contaminado`, `casi negro`,
`señal`, `archivo pálido`— y lo habita. Encima, el color **expresa estado**:

enlace sin leer · visitado · ruta olvidada · cita verdadera · cita falsa · texto
contaminado · memoria · autómata activo · profundidad · densidad · espera ·
cicatriz · colapso · silencio.

Reglas del clima: si una región **pierde memoria, se desatura**. Si su **autómata
trabaja, el color se afila**. La hondura oscurece. El silencio apaga la
crominancia. El hueco casi no tiene color, porque casi no tiene nada.

Cada token produce una ecología distinta. No hay «una de seis paletas».

## Autómatas celulares

No son fondo: gobiernan el atlas.

Reglas 30 (proliferación y pérdida de clasificación), 45 (traducción desplazada),
54 (tráfico entre rutas), 60 (citas y regresos), 90 (archivo, simetría y
ausencia) y 110 (cómputo persistente). **La regla de cada región la elige el hash
de una cita.**

La retícula del autómata **es** la retícula del campo cromático: 96 × 54 celdas.
La generación fluye hacia abajo, como el río, y **la primera fila son las vocales
de una frase**. Sembrar (`seed`) un enlace cambia esa fila; el campo entero
responde algunos ciclos después.

- una celda viva **revela una letra** (máscara `#mascara-celular` sobre la capa de materia);
- una celda muerta **cierra un paso**; las cicatrices no vuelven a encenderse;
- el silencio **apaga celdas**: las regiones mudas restan pasos también en la música;
- el hueco no computa: no hay hidrógeno que encender;
- el autómata **lee una región del SVG y responde a ella** — la fila bajo la
  cabeza de lectura escribe el ritmo del compás siguiente.

## Música

Web Audio nativo. Sin Tone.js, sin muestras: osciladores, filtros, envolventes,
retardos y ruido —y el ruido está firmado por la semilla, nunca por `Math.random`.

Vocabulario heredado de `poemario/lectura-en-vivo/` y `loop-nave/`: onda de
pulso con ancho variable, sierras desafinadas, bombo senoidal con caída de tono,
caja de ruido corto, hats de ruido pasa-altos, campana FM (`harmonicity 5.07`),
bajo cuadrado, arpegios pasados por un bitcrusher de curva, pad de sierras con
coro pobre, ping-pong delay, drones, filtrado espectral por profundidad,
movimiento estéreo, y **el silencio como evento compositivo**.

Patrones de 16 pasos, firmados. Lo visual y lo sonoro comparten valores:

| estructura | música |
| --- | --- |
| densidad de palabras | densidad de notas |
| longitud de la ruta | longitud de la frase |
| regla celular | conducta rítmica |
| región de silencio | pasos eliminados |
| pérdida de memoria | notas que faltan, ritmo a mitad de velocidad |
| nodo de cita | eco y cola de retardo |
| ruta duplicada | canon a cuatro pasos |
| erosión | tiempos faltantes |
| zona de archivo | drone |
| autómata activo | patrón más rápido y afilado |
| profundidad | filtrado y registro |

Un modo por región (dórico, frigio, eólico, lidio, pentatónica, japonesa, tonos
enteros, armónica). **La melodía la escribe la ruta**: la longitud de cada
palabra es un grado de la escala.

El audio arranca sólo tras un gesto directo. El interruptor no es un reproductor:
es la **bocina rudimentaria** de *NADIE A BORDO*, abajo en el pliego —
`◌ le pusimos una antena y una voz —`. También responde a `espacio` o `S`.

**La versión muda es una obra completa**: la partitura se dibuja siempre, con sus
pulsos, su rejilla y sus pasos faltantes. Nunca se finge un sonido que no suena.

## Cómo se lee

- **clic** en una palabra: ejecuta su verbo (el verbo está en `data-action`);
- **clic** en el campo: entra en la región tocada — salvo **H6**, que está cerrada;
- **rueda** o `↑` `↓`: profundidad (0–7). Filtra el sonido, oscurece el campo, desenfoca el borde;
- `←` `→`: cruzar de región;
- `M`: plegar el mapa · `F`: exponer la fuente · `espacio` / `S`: la bocina;
- si nadie toca nada, **el sistema sigue excavando solo**.

## Los primeros treinta segundos

Sin logo, sin título, sin explicación. Se entra por una capa intermedia. Lo que
hay desde el primer cuadro: una frase legible sostenida (un pasaje entero, no un
verso suelto); tres acciones subrayadas dentro de ese texto; el campo celular
transformándose; la marca de que el documento recuerda («*releído 6 veces*»,
notas heredadas de una sesión que no ocurrió); una región inaccesible que sí está
nombrada (H6); una anomalía cromática que ya venía de antes; un nodo efímero que
aparece y desaparece; el pulso de la partitura; y al menos una ruta que hace otra
cosa de la que anuncia.

La confusión debería producir curiosidad, no parálisis. Por eso nunca se vuelve
todo ilegible al mismo tiempo: el estrato legible se daña despacio, y `return`
y `scar` reparan —sin restituir.

---

poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
