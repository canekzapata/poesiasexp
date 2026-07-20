# LABERINTO / otra internet dentro del mismo corpus

Una obra de net art generativo construida como archipiélago de documentos HTML.
La semilla no cambia únicamente el texto: decide el grafo, las topologías, las
paletas, las reglas celulares, las mutaciones y las páginas ocultas.

## Abrir

`index.html` funciona directamente con `file://`. Para una navegación más
predecible de iframes y ventanas también puede servirse como sitio estático:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080/`.

## Regenerar

No tiene dependencias externas. Requiere únicamente Node.js 18 o posterior.

```bash
node generar-sitio.mjs
node generar-sitio.mjs --seed otra-semilla
node generar-sitio.mjs --seed otra-semilla --pages 48
```

Sin `--pages`, la semilla decide entre 32 y 72 documentos. El mundo entregado
usa la semilla `otra-agua-2026`: 52 páginas, 20 topologías y 6 nodos que el mapa
no revela.

Cada documento generado contiene dos hipervínculos HTML persistentes como
mínimo. Pueden existir muchas rutas destructibles, reproductoras o mutantes,
pero esas dos rutas no entran en la gramática de destrucción: el mundo siempre
conserva al menos una bifurcación real.

## Anatomía

- `index.html`: umbral celular; no es un panel de control.
- `paginas/`: internet local ya generada y navegable.
- `mapa.html`: dibujo incompleto del grafo; omite deliberadamente ciertos nodos.
- `afuera.html` y `error.html`: rutas laterales.
- `acontecimientos.html`: crónica local, imprimible y exportable como JSON.
- `manifest.json` / `manifest.js`: topología reproducible del mundo.
- `js/corpus.js`: materia verbal y glífica organizada por función visual.
- `js/automatas.js`: Wolfram 30/45/54/60/90/110, Conway, autómata cíclico y
  autómata tipográfico.
- `js/acontecimientos.js`: memoria textual de descubrimientos e interacciones.
- `js/graficas.js`: seis especies de gráficas generativas dibujadas en Canvas.
- `js/ruido.js`: campo de botones, lluvia tipográfica y amplificación visual.
- `js/rutas.js`: enlaces reales, ventanas, descendencia y memoria local.
- `js/genoma-paginas.js`: catálogo generado de etiquetas, clases, estilos, texto,
  fragmentos de código y configuraciones Canvas.
- `js/canibal.js`: digestión y recombinación del DOM en el lugar donde ya vive.
- `js/sonido.js`: primera gramática sonora generativa y optativa.
- `vendor/Tone.js`: Tone.js 15.1.22 guardado localmente con su licencia MIT.
- `js/gramaticas.js`: comportamiento específico de cada especie de página.
- `js/motor.js`: mutaciones temporales, eventos raros, pausa y poda.
- `generar-sitio.mjs`: generador completo sin paquetes.

## Gestos

La obra responde a clic, doble clic, scroll, espera, formulario, botón Atrás y
recarga. Algunas rutas abren documentos reales; otras nacen dentro de iframes o
ventanas. `Esc` detiene la proliferación y las mutaciones. Las preferencias de
movimiento reducido desactivan la actividad continua.

El código limita a tres niveles la recursión de iframes, abre ventanas reales
sólo después de un gesto y sustituye pop-ups bloqueados por ventanas internas.

Las páginas de topología `formulario oracular` nacen con entre diez y dieciséis
botones-poema. `+5` siembra cinco controles nuevos; los demás pueden aumentar el
ruido, cultivar ASCII, soltar texto, cambiar la escala o abrir una gráfica. Ese
campo flotante no se repite en las otras especies: cada una conserva sus propios
gestos e interfaces. También contienen el control que activa o calla Tone.js.

Las gráficas no son un tablero estadístico ni dependen de Chart.js: leen
cantidades reales del documento (enlaces, bloques, glifos, texto, regla celular
y memoria) y las vuelven barras, líneas, dispersión, estratos, corrientes o
diagramas radiales. Cada clic sobre un Canvas vuelve a medir y mutar la figura.

## Canibalismo de código y color vivo

No aparecen cápsulas, tarjetas ni ventanas que representen otra página. El
generador desarma cada documento en un genoma de etiquetas, clases, propiedades
CSS, textos, pequeños fragmentos HTML y modos de Canvas. Durante la lectura,
`js/canibal.js` selecciona código de otra dirección y lo digiere en el DOM
actual: puede cambiar una etiqueta, trasplantar una clase o propiedad, intercalar
hijos, repartir una estructura entre dos nodos o volver gráfica una zona que ya
existía. La memoria del recorrido favorece código de páginas visitadas.

La topología `página caníbal primitiva` empieza casi vacía y se ensambla en el
navegador con decenas de primitivos tomados de esos genomas. Doble clic, scroll,
tiempo, seis gestos o la tecla `c` pueden provocar otra mordida.

Los fondos de bloques y estratos atraviesan animaciones de color generadas a
partir de la paleta de su página de origen. La preferencia de movimiento
reducido detiene estos ciclos.

La tipografía también forma parte de la semilla. La obra reutiliza tres fuentes
que ya pertenecían a `poesiasexp`: `Web437_EverexME_5x8`,
`Web437_IBM_Model3x_Alt4` y `AC437_COMPIS`.

## Sonido inicial

Tone.js no usa CDN ni samples. Tampoco se descarga al abrir cada documento: se
carga localmente sólo después de activar el sonido. La regla celular, la
topología y la semilla deciden escala, tempo, silencios, ruido, filtro y
retroalimentación. Los acontecimientos visuales —en especial canibalismo,
gráficas, autómatas, enlaces y destrucciones— producen variaciones audibles.

No hay autoplay. `entrar con sonido` aparece en el umbral y `escuchar el código`
en los formularios. La elección se recuerda localmente; en páginas posteriores
el contexto despierta con el siguiente gesto normal del lector. `Esc` silencia o
reanuda la capa sin convertir el sitio en un panel de instrumento.

Sólo la ventana principal posee el motor y el `AudioContext`. Los documentos
que viven dentro de `iframe` envían sus acontecimientos a esa superficie, de
modo que una constelación completa sigue siendo una sola criatura sonora. Al
abandonar la página se retiran los listeners y se desechan los nodos de audio.

### Consola y extensiones

Los mensajes que nombran `contentscript.js`, `ObjectMultiplex`,
`app-init-liveness` o `background-liveness` proceden de una extensión del
navegador, no de Tone.js. En particular, esa combinación está documentada en
MetaMask. Puede comprobarse abriendo la obra en un perfil sin extensiones. El
mensaje `Node cannot be found in the current page` pertenece a DevTools cuando
intenta revelar un nodo que ya cambió o fue retirado; en esta pieza el DOM muta
deliberadamente. El favicon local evita además la petición fallida a
`/favicon.ico`.

## Escrituras y especies visuales

El generador indexa cinco regímenes que pueden coexistir sin jerarquía fija:

- escritura literaria relativamente legible;
- escritura visual de escala extrema, desde palabra monumental hasta trama;
- faux-code literario usado como fondo, instrucción, textura u op art;
- elementos de bloque (`blockquote`, `pre`, `details`, `address`, listas,
  definiciones y figuras);
- esculturas y paisajes ASCII.

Las topologías `tormenta de escrituras`, `escultura ASCII`, `jardín
estratificado`, `observatorio gráfico del ruido` y `página caníbal primitiva` cruzan estos regímenes con
capas celulares, paletas semánticas y territorios. El jardín no importa dibujos
cerrados: utiliza la lógica de estratos y especies para producir ramas, agua,
raíces, glifos, faux-code y frases ancladas dentro de la misma superficie.

## Acontecimientos

Visitas nuevas, esperas, enlaces, ventanas, destrucciones, reproducciones,
canibalismo, sonido, autómatas y eventos raros escriben una crónica en `localStorage`, separada por
semilla. Ciertas páginas ocultas revelan el enlace a
`acontecimientos.html`. Desde ahí la crónica puede imprimirse o guardarse como
PDF mediante el diálogo del navegador y descargarse como JSON.

La dirección para las siguientes fases sonoras está en
`adendas/sonido-y-acontecimientos.md`.
