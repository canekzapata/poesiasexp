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

Sin `--pages`, la semilla decide entre 24 y 72 documentos. El mundo entregado
usa la semilla `otra-agua-2026`: 34 páginas, 18 topologías y 4 nodos que el mapa
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
- `js/rutas.js`: enlaces reales, ventanas, descendencia y memoria local.
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

## Escrituras y especies visuales

El generador indexa cinco regímenes que pueden coexistir sin jerarquía fija:

- escritura literaria relativamente legible;
- escritura visual de escala extrema, desde palabra monumental hasta trama;
- faux-code literario usado como fondo, instrucción, textura u op art;
- elementos de bloque (`blockquote`, `pre`, `details`, `address`, listas,
  definiciones y figuras);
- esculturas y paisajes ASCII.

Las topologías `tormenta de escrituras`, `escultura ASCII` y `jardín
estratificado` cruzan estos regímenes con capas celulares, paletas semánticas y
territorios. El jardín no importa dibujos cerrados: utiliza la lógica de
estratos y especies para producir ramas, agua, raíces, glifos, faux-code y
frases ancladas dentro de la misma superficie.

## Acontecimientos

Visitas nuevas, esperas, enlaces, ventanas, destrucciones, reproducciones,
autómatas y eventos raros escriben una crónica en `localStorage`, separada por
semilla. Ciertas páginas ocultas revelan el enlace a
`acontecimientos.html`. Desde ahí la crónica puede imprimirse o guardarse como
PDF mediante el diálogo del navegador y descargarse como JSON.

El diseño de la futura capa sonora —todavía no implementada— está en
`adendas/sonido-y-acontecimientos.md`.
