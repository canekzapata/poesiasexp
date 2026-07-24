# CANIBALIZA LOCochón

Este prototipo no empieza como índice. Es una superficie parasitaria que carga
obras existentes de `poesiasexp`, captura órganos vivos y los recombina.

## Qué hace

- carga `Estratos` fuera de cuadro y usa su canvas **mientras sigue animado**;
- recorta ese canvas en aproximadamente **1,000 mosaicos vivos** para el fondo;
- el fondo cambia de color, gradiente y modo de mezcla durante la visita;
- hace crecer **venas SVG de texto** sobre ese paisaje;
- muchas venas son enlaces `<a>` reales que conducen a la pieza donante;
- carga el SVG generado por `Las Letras / Espacio Escultórico`;
- arranca grupos y formas del SVG y los deja flotando sin marco;
- corta canvas, SVG e iframes mediante polígonos, círculos y elipses;
- emite texto monumental que se escribe y atraviesa varias capas;
- añade líneas, polígonos y wireframes que no pertenecen a ninguna caja;
- usa el corpus real de Otro Río si está disponible;
- convierte fragmentos, textos y venas en enlaces `<a>` reales hacia su
  pieza donante;
- conserva sólo una o dos ventanas reconocibles como accidentes raros.

## Instalación

Copia la carpeta completa dentro de la raíz del repositorio:

```text
poesiasexp/
├─ estratos/
├─ lasletras/
├─ otrorio/
├─ laberinto/
├─ poemario/
├─ escape/
└─ canibaliza-locochon/
   ├─ index.html
   ├─ collage.css
   ├─ collage.js
   └─ README.md
```

Debe servirse por HTTP y desde el mismo origen. No abras `index.html` con doble
clic: el navegador no permitirá leer el canvas y el SVG de los iframes.

Desde la raíz de `poesiasexp`:

```bash
python -m http.server 8000
```

Abre:

```text
http://localhost:8000/canibaliza-locochon/
```

## Controles

- `C`: produce un recorte grande de otra pieza.
- `R`: otra digestión completa.
- `T`: arroja texto monumental.
- Doble clic en el fondo: produce otro recorte.
- Clic en cualquier fragmento: abre la obra donante.
- Clic sobre una vena textual: sigue la vena hasta su obra de origen.

## Por qué usa iframes donantes

Los motores actuales de `Estratos` y `Las Letras` son piezas completas y
monolíticas. Sus funciones viven dentro de closures; importarlas parcialmente
exigiría refactorizar primero ambos proyectos.

El prototipo carga cada pieza completa en un iframe invisible del mismo origen:

```text
Estratos vivo ── canvas ──┐
                          ├─ recortes / repeticiones / injertos
Las Letras viva ─ SVG ────┘
```

Esto permite una canibalización visual real inmediatamente. No son capturas
preparadas ni imitaciones.

La unidad visual principal ya no es una ventana o un `div`: es un recorte
irregular enlazado. Las ventanas aparecen rara vez, como otro material más.

## Siguiente mutación

Después de comprobar visualmente qué injertos funcionan, conviene extraer una
API mínima de cada donante:

```js
window.PoesiasexpOrgans = {
  estratos: {
    drawTerritory(ctx, options) {},
    drawSpecies(ctx, name, options) {}
  },
  lasLetras: {
    buildBody(svg, name, options) {},
    buildCrown(svg, name, options) {}
  }
};
```

Entonces el caníbal podría pedir literalmente:

```js
drawTerritory("pantano");
buildBody("esfera-monumental");
buildCrown("voluta");
```

El prototipo actual sirve para descubrir esa gramática mediante exceso,
superposición y accidentes antes de formalizarla.
