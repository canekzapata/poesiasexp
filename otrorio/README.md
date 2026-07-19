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
usa la semilla `otra-agua-2026`: 34 páginas, 15 topologías y 4 nodos que el mapa
no revela.

## Anatomía

- `index.html`: umbral celular; no es un panel de control.
- `paginas/`: internet local ya generada y navegable.
- `mapa.html`: dibujo incompleto del grafo; omite deliberadamente ciertos nodos.
- `afuera.html` y `error.html`: rutas laterales.
- `manifest.json` / `manifest.js`: topología reproducible del mundo.
- `js/corpus.js`: materia verbal y glífica organizada por función visual.
- `js/automatas.js`: reglas elementales 30, 45, 54, 60, 90 y 110.
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
