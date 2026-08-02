# NINGUNA PRUEBA VIAJA SOLA
### diez maneras de no demostrar que una señal estuvo aquí

Una sola criatura navegable, no una colección de demos. Al abrirla, el navegador
recibe una señal incompleta. Una infraestructura llamada **TESTIGO** afirma que
para recuperar el mensaje hay que demostrar que estuvo aquí, y somete la señal
—y al visitante— a una serie de operaciones matemáticas. El visitante cree que
debe reunir fragmentos. Es una interpretación incorrecta pero útil: cada
operación modifica el mensaje, la topología de la obra, la memoria y aquello que
la máquina considera una prueba.

La matemática no es el tema ilustrado. Es la ley física del documento: el
empaquetamiento decide dónde hay enlaces, la distancia entre códigos decide qué
recuerdos mutan, la búsqueda del vector más cercano decide qué dirección se
ofrece como original, el cuerpo convexo decide qué se conserva y qué se expulsa,
y el grafo multicolor decide cuándo tres páginas dejan de ser independientes.

En diálogo con `poesiasexp` —`indice_del_rio`, `loop-nave`,
`el_mundo_no_compila_diagramatico`, `otrorio`— y con los diez avances
matemáticos publicados por OpenAI en 2025 como material conceptual, no como
contenido a divulgar.

## Abrir

```bash
python3 -m http.server 8000
```

Después `http://localhost:8000/ninguna-prueba-viaja-sola/`. También abre
`index.html` directo del disco. Sin frameworks, sin dependencias, sin red, sin
backend, sin telemetría.

La semilla firma el azar y viaja en la URL: `?seed=mi-semilla&z=3`. La misma
semilla entrega el mismo mundo inicial; el recorrido lo cambia a partir de ahí.
Una URL con semilla se puede compartir: quien la abra empieza en el mismo mundo,
no en el mismo estado.

## Cómo se recorre

No hay botón de comenzar. Hay tres vacíos entre los círculos, y cada vacío es un
enlace. Al cruzar el primero, la frase pierde un bit —el mismo bit, en la misma
cadena, para siempre en esa semilla.

- **arrastrar** un cuerpo lo mueve y estorba a los demás
- **comprimir** el campo expulsa un cuerpo hacia otra página
- **una dimensión más** hace que quepan, al precio de verse encima
- **escribir en un vacío** convierte la frase en un cuerpo que ahora ocupa lugar
- **tocar un bit** de la matriz acerca o aleja dos recuerdos
- **arrastrar las asas** de la retícula cambia cuál dirección es la más cercana
- **mover una cara** de la caja cambia cuántos puntos caben adentro
- **fundir puertas** del circuito lo abarata, y lo cobra en la memoria
- **retirar relaciones** poda el grafo hasta que la ley del aparato se cae
- **no hacer nada** también es una operación: la espera escribe, comprime,
  promedia, abre rutas y elige por ti

Teclas: `M` mapa · `B` bitácora · `Esc` hueco · `R` otra semilla.

## Progresión sin puntaje

No hay puntos, vidas, insignias ni "nivel completado". La obra avanza por
**invariantes**: condiciones persistentes que ya no se pueden deshacer —haber
producido dos recuerdos incompatibles, haber sostenido un punto dentro del
cuerpo, haber creado una copia que actúa sola, haber aceptado una aproximación
en lugar del original, haber dejado que la inactividad complete una
transformación.

El certificado se emite con seis invariantes de al menos cuatro familias
distintas. Se puede llegar por caminos muy diferentes; no hay una secuencia
correcta. Y se emite igual sin ellos, diciendo menos: cerrar el expediente
tampoco demostraría el contenido.

## Los regímenes

| | operación | estado en esta versión |
|---|---|---|
| A | ACOMODAR — empaquetamiento de esferas | completo |
| B | SEPARAR — códigos binarios y esféricos | completo |
| E | PAGAR EL ATAJO — complejidad de circuitos | completo |
| G | ENCONTRAR LO QUE NO SE BUSCABA — vector más cercano | completo |
| H | CONTENER — cuerpo convexo con un solo interior | completo |
| J | QUITAR HASTA QUE APAREZCA LA ESTRUCTURA — poda y degeneración | completo |
| I | COLOREAR SIN FORMAR EL TRIÁNGULO — Ramsey multicolor | motor activo, sin superficie propia |
| C · D · F | | pendientes (ver `LOOP_STATE.md`) |

## Memoria

Todo se guarda en `localStorage`, separado por semilla, bajo `npvs.<semilla>`.
La memoria distingue internamente **recuerdo verdadero**, **degradado**,
**inferencia**, **inventado** y **contradicción**. No miente al azar: cada falsa
memoria tiene una causa reproducible que queda escrita junto a ella y se puede
leer en la bitácora y en el certificado.

Después de suficiente recorrido nace **LA COPIA**: un modelo conductual mínimo
hecho con frecuencias, transiciones, ritmos, direcciones y rutas evitadas. No usa
IA externa ni finge ser una persona. Actúa sola —inserta frases, evita rutas,
elige colores y, si el visitante lleva rato quieto, cruza un enlace sin él.

## Sonido

Optativo y silencioso por defecto. Empieza sólo después de un gesto explícito
(`encender bocina`) y se genera con el estado: la distancia mínima entre códigos
afina el pulso, el ruido revela la banda que los bits perdidos abrieron, el
triángulo suena como dos osciladores en diferencia de fase. La obra completa
funciona sin audio.

## Archivos

```
ninguna-prueba-viaja-sola/
  index.html            el umbral: campo de empaquetamiento y tres vacíos
  mapa.html             el mapa que no conoce todas las direcciones
  certificado.html      el acta y la semilla descendiente
  paginas/              24 documentos más
  css/base.css          papel, tinta, los siete colores de relación
  css/regimes.css       el cuerpo de cada régimen
  css/print.css         el acta y la bitácora en papel
  js/seed.js            azar firmado por canal
  js/events.js          bus, limpieza de ciclos, inactividad
  js/state.js           semilla y profundidad en la URL, pushState, popstate
  js/memory.js          memoria por semilla con degradación causal
  js/routes.js          catálogo, clases de relación, grafo multicolor
  js/text.js            el mensaje como bits, telemetría, máscara tipográfica
  js/narrative.js       cinco movimientos e invariantes
  js/copy.js            LA COPIA
  js/sound.js           bocina rudimentaria
  js/shell.js           lo que toda página comparte
  js/carga.js           carga ordenada de módulos
  js/regimes/           packing · codes · lattice · convex · circuits · extremal
  corpus/fragments.js   materia verbal
  fonts/                Apercu y los dos Web437, para que la obra viaje sola
  tests/pruebas.mjs     pruebas de navegador
  LOOP_STATE.md         estado, decisiones y siguiente mutación
```

## Pruebas

```bash
python3 -m http.server 8765
node tests/pruebas.mjs
```

Comprueban consola limpia en los 27 documentos, ausencia de callejones sin
salida, determinismo por semilla, pérdida de bits, `pushState`/Atrás, aparición
de la copia, detección de triángulos monocromáticos, que simplificar el circuito
abarate el grafo y lo cobre en el expediente, que podar hasta el bosque refute la
ley, que la bitácora se erosione sin disolverse, composición del acta con datos
reales, móvil y `prefers-reduced-motion`.

## Tipografías

Apercu para la lectura; Web437 IBM Model3x y Web437 EverexME para telemetría,
glosas y microtexto. Las tres viven en `fonts/` dentro de esta carpeta, de modo
que la obra funciona suelta, y `base.css` declara además la ruta original dentro
de `poesiasexp` como respaldo. Las copias de esas dos `.woff` en la raíz del
repositorio están corruptas: esta obra usa las de `otrorio/fonts/`.

poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
