# CANIBALIZA LOCochón

Este prototipo no empieza como índice. Es una superficie parasitaria que carga
obras existentes de `poesiasexp`, captura órganos vivos y los recombina.

## Qué hace

- carga `Estratos` fuera de cuadro y usa su canvas **mientras sigue animado**;
- recorta ese canvas en aproximadamente **1,000 mosaicos vivos** para el fondo;
- hace crecer **venas SVG de texto** sobre ese paisaje;
- muchas venas son enlaces `<a>` reales que conducen a la pieza donante;
- carga el SVG generado por `Las Letras / Espacio Escultórico`;
- arranca grupos y formas del SVG y los coloca dentro de ventanas;
- crea ventanas de navegador anidadas hasta tres niveles;
- deja dibujos de Estratos fuera de los límites de algunas ventanas;
- emite texto que se escribe y se derrama por la página;
- usa el corpus real de Otro Río si está disponible;
- convierte ciertos fragmentos y ventanas en enlaces `<a>` reales hacia su
  pieza donante;
- permite arrastrar, cerrar y reproducir ventanas.

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
   ├─ canibal.css
   ├─ canibal.js
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

- `C`: produce otra ventana.
- `R`: otra digestión completa.
- `Q`: baja el ruido.
- Doble clic en el fondo: produce una ventana.
- `+` en una barra: reproduce una ventana dentro de ella.
- `×`: destruye la ventana.
- Arrastrar la barra: desplaza una ventana principal.
- Clic en el contenido o en `ABRIR PIEZA ↗`: abre la obra donante.
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
