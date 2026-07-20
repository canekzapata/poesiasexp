# laberinto

### generador de internet laberíntico

poesiasexp / canekzapata

Una obra de net art generativo. No una máquina de lectura, no un poemario con
navegación, no una interfaz estable que presenta textos: **un generador de
páginas web.** Cada semilla planta una internet local distinta —otra
arquitectura, otros colores, otras rutas, otra manera de perderse— hecha con el
mismo corpus. El poema ocurre en la forma que adopta el navegador.

> NO DISEÑAR UNA INTERFAZ QUE GENERE POEMAS.
> GENERAR PÁGINAS WEB CUYA INFRAESTRUCTURA SEA EL POEMA.

---

## abrir la pieza

La constelación ya viene escrita. No hace falta ejecutar nada:

- Abre **`index.html`** en un navegador (doble clic o desde un servidor estático).
- Entra por el **índice**, cruza el **mapa**, cae en el **error**, sal por
  **afuera**. Cada clic fabrica más laberinto.
- Los controles están enterrados en la tira de abajo: *otra semilla*, *copiar*,
  *reconstruir*, *manifiesto*, y las tres salidas.
- **`Esc`** detiene la proliferación (modo quieto). **Barra espaciadora** sube el
  ruido. Se respeta `prefers-reduced-motion`.

> Con `file://` casi todo funciona; algunos navegadores restringen ciertos
> iframes locales. Servido por HTTP (`python3 -m http.server` dentro de
> `laberinto/`) se ve completo.

## sembrar otra internet

```bash
node generar-sitio.mjs                 # una internet nueva (semilla al azar)
node generar-sitio.mjs --semilla río   # una internet reproducible
node generar-sitio.mjs --semilla río --n 48
```

Sin dependencias (Node ≥ 16). Reescribe `manifest.js`, `paginas/*.html` y las
cuatro puertas. **La misma semilla reconstruye la misma internet base**; la
navegación, la espera, las ventanas y la memoria producen después una historia
material distinta.

---

## qué decide cada semilla

Cuántas páginas existen (24–72), qué topología HTML tiene cada una, cómo se
relacionan, cuáles se encuentran, cuáles permanecen **ocultas** (~12 %, sólo
alcanzables por el mapa, por un evento raro o por su URL), qué regla celular las
gobierna, qué colores dominan, qué fragmentos del corpus aparecen y cuánta
infraestructura se vuelve poema.

### 14 topologías + mapa

`tabla` laberinto · `ventanas` arrastrables · `campo` absoluto · constelación de
`iframes` · `formulario` oracular · código `fuente` habitable · autómata
`celular` · `índice` explosivo · página casi `vacía` · `paisaje` de glifos ·
documento `vertical` imposible · `corredor` horizontal · `error` local · página
`reproductora` (engendra descendientes por `srcdoc`, blob descargable o nueva
semilla). El `mapa` lee el grafo real y lo vuelve índice —falso en parte.

Una página combina una a tres topologías: dos páginas comparten corpus sin ser
la misma plantilla, porque la variación afecta al propio DOM.

### los autómatas generan infraestructura

Reglas elementales (30, 45, 54, 60, 90, 110…). No son fondo de pantalla: una
fila del autómata decide qué celdas de una tabla existen, dónde aparece un
enlace, qué columna sobrevive, qué ventana nace.

### navegación desenfrenada

Hipervínculos HTML reales (href, hash, historial, botón atrás). Sobre ese
esqueleto, cada enlace añade una conducta: `normal`, abrir en `iframe` o
`ventana`, saltar a una `coordenada`, morir tras un uso (`perecedero`), heredar
el color de su destino (`cromatico`), cambiar de destino (`mutante`),
`multiplica`rse. El DOM sigue mutando después de cargar; los elementos
destruidos dejan residuo y se recuerdan (al volver, la página reconstruye sólo
una parte). Eventos raros —pocos, tardíos, improbables— cambian el régimen.

---

## anatomía

```
laberinto/
├── index.html            puerta / índice
├── mapa.html             el grafo como índice (falso en parte)
├── afuera.html           el borde del laberinto
├── error.html            el error como espacio navegable
├── paginas/000.html …    la constelación generada
├── manifest.js           el grafo (window.MANIFIESTO)
├── generar-sitio.mjs     el generador (Node, sin dependencias)
├── css/
│   ├── base.css          piso + una cara por gramática
│   └── mutaciones.css    estados del DOM tras cargar
├── js/
│   ├── rng.js            azar reproducible (mulberry32)   ── isomorfo
│   ├── automatas.js      autómatas celulares elementales  ── isomorfo
│   ├── paletas.js        color generativo (14 familias)   ── isomorfo
│   ├── corpus.js         banco material por función        ── isomorfo
│   ├── gramaticas.js     las topologías del DOM            ── navegador
│   ├── rutas.js          conducta de los enlaces           ── navegador
│   ├── motor.js          el navegador desenfrenado         ── navegador
│   └── barra.js          controles enterrados              ── navegador
└── fonts/                egipcio · anatolio · lineal A · lineal B
```

El generador (Node) **planta**: elige la semilla, decide el grafo, calcula la
paleta de cada página y escribe cada cáscara con su descriptor. El motor
(navegador) **construye**: lee el descriptor, compone las gramáticas y mantiene
el documento vivo. `rng.js`, `automatas.js`, `paletas.js` y `corpus.js` corren
en los dos lados, así que el color que el generador guarda en el manifiesto es
exactamente el que el navegador reproduce.

## el corpus

El repositorio como banco material, no como resumen. Los poemas de canek —la
sonda que escapa del sistema solar, el último robot bajo la tormenta de arena,
el helecho que murió en la cueva, los píxeles sin sombra, el ruido y la
entropía, el problema de la no-comunicación—, el léxico de glifos de PAISAJES
(jeroglíficos egipcios y anatolios, lineal A y B, sextantes y bloques), y los
ecos de la biblioteca (Heráclito y el río, el archivo, el virus de la palabra,
las ciudades invisibles, las luciérnagas, la teoría del color, ceros y unos).

Organizado en `corpus.js` por función visual: palabra monumental, texto de
enlace, fragmento, microtexto, contenido de ventana, celda, valor de atributo,
segmento de ruta, título de pestaña, error, alt text, comentario HTML, glifo,
color, coordenada, instrucción. El lenguaje aparece sólo parcialmente: en muchas
páginas domina la infraestructura, no el texto (65–80 % forma, 20–35 % lenguaje
legible).

---

*Debajo de la interfaz no hay obra: la interfaz es la obra.*
