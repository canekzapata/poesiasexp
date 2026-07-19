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
usa la semilla `otra-agua-2026`: 52 páginas, 19 topologías y 6 nodos que el mapa
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
- `js/fragmentos-paginas.js`: catálogo generado de órganos HTML de las páginas.
- `js/mezclador.js`: injertos, recomposición por recorrido y ciclos cromáticos.
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
gestos e interfaces.

Las gráficas no son un tablero estadístico ni dependen de Chart.js: leen
cantidades reales del documento (enlaces, bloques, glifos, texto, regla celular
y memoria) y las vuelven barras, líneas, dispersión, estratos, corrientes o
diagramas radiales. Cada clic sobre un Canvas vuelve a medir y mutar la figura.

## Injertos y color vivo

El generador guarda fragmentos HTML reales de cada página —bloques, `divs`,
ventanas, esculturas y gráficas— en un catálogo local. Durante la lectura,
`js/mezclador.js` toma órganos de otras direcciones y los recompone sobre el
documento actual. La memoria del recorrido favorece páginas ya visitadas; otras
veces se anticipa a una página que todavía no fue abierta. Doble clic, scroll,
tiempo e interacción pueden producir o desplazar injertos.

Los fondos de bloques y estratos atraviesan animaciones de color generadas a
partir de la paleta de su página de origen. La preferencia de movimiento
reducido detiene estos ciclos.

La tipografía también forma parte de la semilla. La obra reutiliza tres fuentes
que ya pertenecían a `poesiasexp`: `Web437_EverexME_5x8`,
`Web437_IBM_Model3x_Alt4` y `AC437_COMPIS`.

## Escrituras y especies visuales

El generador indexa cinco regímenes que pueden coexistir sin jerarquía fija:

- escritura literaria relativamente legible;
- escritura visual de escala extrema, desde palabra monumental hasta trama;
- faux-code literario usado como fondo, instrucción, textura u op art;
- elementos de bloque (`blockquote`, `pre`, `details`, `address`, listas,
  definiciones y figuras);
- esculturas y paisajes ASCII.

Las topologías `tormenta de escrituras`, `escultura ASCII`, `jardín
estratificado` y `observatorio gráfico del ruido` cruzan estos regímenes con
capas celulares, paletas semánticas y territorios. El jardín no importa dibujos
cerrados: utiliza la lógica de estratos y especies para producir ramas, agua,
raíces, glifos, faux-code y frases ancladas dentro de la misma superficie.

## Acontecimientos

Visitas nuevas, esperas, enlaces, ventanas, destrucciones, reproducciones,
injertos, autómatas y eventos raros escriben una crónica en `localStorage`, separada por
semilla. Ciertas páginas ocultas revelan el enlace a
`acontecimientos.html`. Desde ahí la crónica puede imprimirse o guardarse como
PDF mediante el diálogo del navegador y descargarse como JSON.

El diseño de la futura capa sonora —todavía no implementada— está en
`adendas/sonido-y-acontecimientos.md`.
