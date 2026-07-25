# CANIBALIZA LOCochón

Este prototipo no es todavía el índice de `poesiasexp`. Es un organismo
parasitario más ligero: un campo de caracteres que deja entrar dibujos vivos,
letras y frases de otras piezas sin convertir todo en una cuadrícula de
ventanas.

## Qué hace

- usa un solo color de fondo y lo cubre con caracteres Unicode repetidos;
- carga `Estratos` fuera de cuadro y toma recortes de su canvas **mientras
  continúa animándose**;
- elimina aproximadamente el fondo de cada recorte para dejar sueltos los
  dibujos de Estratos;
- escala, estira y recolorea esos dibujos como especies independientes;
- carga el SVG de `Las Letras / Espacio Escultórico` y toma sus caracteres;
- distribuye glifos desde casi microscópicos (3 px) hasta monumentales
  (620 px);
- arroja palabras y frases del corpus de Otro Río desde letra pequeña hasta
  texto mayor que la pantalla;
- conserva sólo algunos recorridos lineales y, como accidente, cero o una
  ventana;
- convierte muchos injertos en enlaces `<a>` reales hacia la pieza donante;
- empieza con aire y se contamina lentamente mientras permanece abierta.

No hay letreros que expliquen cada objeto. El enlace se descubre al tocarlo.

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
   ├─ organismo.css
   ├─ organismo.js
   └─ README.md
```

Debe servirse por HTTP y desde el mismo origen. No abras `index.html` con doble
clic: el navegador no permitirá que la página lea el canvas y el SVG de los
iframes donantes.

Desde la raíz de `poesiasexp`:

```bash
python -m http.server 8000
```

Abre:

```text
http://localhost:8000/canibaliza-locochon/
```

## Controles

- `R`: otra digestión completa.
- `C`: arroja una especie grande tomada de Estratos.
- `G`: arroja un carácter monumental de Las Letras.
- `T`: arroja una frase monumental.
- Doble clic en el fondo: produce otra especie de Estratos.
- Clic en un carácter, dibujo o frase enlazada: abre la obra donante.

## Cómo canibaliza

Los motores actuales de `Estratos` y `Las Letras` son piezas completas. El
prototipo las carga en iframes invisibles del mismo origen:

```text
Estratos vivo → canvas → recorte → transparencia → recolor → especie enlazada
Las Letras viva → SVG → caracteres → cambio de escala → glifo enlazado
Otro Río → corpus → frase escrita → enlace a una pieza
```

Los fragmentos de Estratos marcados como vivos se vuelven a capturar
periódicamente, así que no son imágenes preparadas. El campo Unicode se dibuja
en un solo canvas fijo; las demás capas usan SVG, enlaces y unas pocas
secciones transparentes, no cientos de `div`.

## Ajustes rápidos

En `organismo.js`:

- `palette` controla los fondos y recoloreos;
- `unicode` controla el alfabeto del fondo;
- los conteos dentro de `digest()` controlan la densidad inicial;
- `mutationTimer` controla qué tan rápido se contamina;
- los rangos de `createGlyph()`, `createSpecies()` y `createPhrase()` controlan
  las escalas.

La dirección ahora es: **menos objetos iniciales, diferencias de escala mucho
mayores y crecimiento gradual**.
