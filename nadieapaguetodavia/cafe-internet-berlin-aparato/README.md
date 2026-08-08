# ~~NADIE APAGUE TODAVÍA~~
### aparato crítico de un poemario que no se conserva

Un poemario de cuarenta piezas escrito en Berlín en septiembre de 1997, durante
un día de montaje y una noche de exhibición en un café internet temporal. Nunca
se imprimió. Se perdió.

**Este libro no es ese libro. Es su aparato:** las notas, las variantes, los
cotejos y las lagunas de una edición crítica cuyo texto no llegó. Sobreviven
cinco testigos parciales y ninguno está de acuerdo con los otros.

> El índice completo existe porque Mara lo escribió al dorso del plano de la
> sala: era la única hoja lo bastante grande. Tenemos el mapa de la habitación
> y la lista de los poemas en las dos caras del mismo papel, y no tenemos los
> poemas.

## La operación

En un aparato crítico de papel, las variantes se presentan y quien lee las mira.
Aquí hay que elegir para que el verso exista, y elegir cuesta algo.

| | |
|---|---|
| **cotejo** | Un verso en desacuerdo no tiene texto hasta que alguien acepta una lectura. |
| **crédito** | Aceptar una lectura acredita a su testigo y desacredita a los que decían otra cosa en esa misma línea. El reparto es de suma cero: leer con ecuanimidad deja el aparato en pie. |
| **retiro** | Un testigo bastante desacreditado se cae del libro y se lleva los versos que sólo él sostenía. Esos huecos aparecen en rojo: no son pérdidas de 1997, son de esta lectura, y no se deshacen. |
| **consenso** | Dos testigos que dicen exactamente lo mismo no están en desacuerdo: se agrupan bajo una sigla compuesta —`CD`, `CP`— y nadie tiene que elegir. |
| **testimonio único** | Cuando sólo queda un testigo, el verso se acepta *sin cotejo*. El sello lo dice en el color del error, porque aceptar sin comparar no es lo mismo que decidir. |
| **laguna** | Donde nadie habla queda un hueco con su medida en signos. Sabemos cuánto falta y no qué falta. Un agujero no tiene contenido: tiene tamaño. |

## Los cinco testigos

Cada uno falla de una manera distinta. Ahí está el libro.

| | testigo | qué aporta | cómo falla |
|---|---|---|---|
| **C** | cuaderno de tapas negras | lo más cercano a la mano que escribía | son borradores; tachaba y seguía |
| **D** | disquete once, sin etiqueta | el único con hora de máquina | doce sectores muertos; donde muere el sector, muere el verso |
| **P** | juego de hojas | alguien las leyó de verdad: hay correcciones a mano | no sabemos de quién es la mano que mejoró los versos |
| **O** | OCR de 2003 | conserva páginas de `P` que después se perdieron | es una máquina: confunde `rn` con `m`, `l` con `1`, y a veces mejora |
| **R** | Hanna, 2011 | la única que sabe cómo sonaban | recuerda el efecto y reconstruye las palabras; ya había leído a los otros |

Elegir siempre a `C` produce un libro de borradores. Elegir siempre a `D`, un
libro agujereado. A `O`, un libro escrito por una máquina que se equivocó bien.
A `R`, un libro tibio e inventado. A `P`, un libro que alguien pulió sin firmar.
Al terminar, el aparato informa **a quién le creyó usted**: es la única
conclusión que ofrece, y es un retrato del lector, no de 1997.

## El folio 20v

La última pieza del índice, `morgen`, no tiene un solo testimonio: ni una cita,
ni una mención. Su folio está en blanco y admite escritura. Lo que se escriba
ahí entra al aparato como **testimonio T**, con su propia sigla, y tres notas de
piezas anteriores empiezan a citarlo como si siempre hubiera estado.

Es la hiperstición del libro ejecutada en vez de narrada: el poema que fabrica
la evidencia de la que dice provenir. No se envía a ningún servidor.

## Ejecutar

```bash
python3 -m http.server 8000
```

Después `http://localhost:8000/poemario/cafe-internet-berlin-aparato/`. También
abre `index.html` directo del disco. Sin bibliotecas externas, sin frameworks,
sin red.

`j` / `k` — pieza siguiente y anterior · `i` — índice · `m` — folio 20v

La bitácora de la lectura vive en la máquina de quien lee.
`olvidar esta lectura` la borra.

## Dos salidas que no pueden separarse

`construir-aparato.mjs` emite las versiones impresas desde el mismo `corpus.js`
que alimenta el pliego, para que la impresa y la ejecutable no puedan divergir.

```bash
node construir-aparato.mjs
# piezas 40 · versos 232 · lecturas 637 · en desacuerdo 154 · lagunas 7 · notas 141
```

La salida impresa es la **edición diplomática**: presenta todas las lecturas y no
resuelve ninguna, porque el papel no puede cobrar por una decisión. Es
deliberadamente incapaz de lo único que hace la máquina.

## Régimen de verdad

Tres niveles, separados sólo en el aparato final. El cuerpo conserva la
ambigüedad a propósito.

- **Documento** — el programa *Net Culture / Netzkultur* en el Podewil de Berlín,
  septiembre de 1997; *Form Art* de Alexei Shulgin, 1997; la propuesta de Scott
  Fahlman de `:-)` y `:-(` en 1982; los kaomoji erguidos en servicios japoneses
  desde mediados de los ochenta, con atribución individual menos firme; los
  MUD/MOO anteriores a 1997; los 176 signos de 12×12 píxeles de Kurita para
  i-mode entre 1998 y 1999, transmitidos como datos de carácter; la circulación
  de los comunicados zapatistas por redes digitales *y* por cadenas humanas.
- **Ficción plausible** — Mara, Hanna, Ileana, Rosa, el grupo, el café, el
  performance de impresión, `FACE TO FACE / WITHOUT A FACE`, Kifli, los cinco
  testigos y el poemario perdido.
- **Hiperstición** — el sobre que en 2001 rotula una hoja como `FIRST EMOJI /
  1997`; el trabajo 013 recibido de ninguna parte; el archivo fechado en 2001
  dentro de una copia cerrada en 1997; y el testimonio T que añade quien lee.

Las personas históricas entran por sus obras y con fecha. Que alguna estuviera
en esta sala esa noche no se afirma en ninguna parte: el visitante se llama `A.`
y el libro no ofrece certificado. Confundir «hizo esta obra en 1997» con «estuvo
en esta fiesta» es exactamente el error que un aparato crítico existe para no
cometer.

## Sobre el EZLN

En septiembre de 1997 el levantamiento de 1994 tiene tres años y los Acuerdos de
San Andrés, uno: es correo de esta temporada, no mitología. La pieza 27 desmonta
la frase «la selva entró directamente al módem» contando los catorce pasos que
hubo en medio, trece de los cuales son personas, y registra una decisión: lo que
no se pudo rastrear no se imprimió. El hueco correspondiente mide once
centímetros. No hay pasamontañas usados como textura.

## Archivos

- `corpus.js` — los cinco testigos, las 40 piezas y sus 637 lecturas
- `aparato.js` — la máquina de cotejar: crédito, retiro, huecos, folio 20v
- `index.html` — el pliego ejecutable
- `style.css` — cinco tintas para cinco maneras de fallar; el rojo es del editor
- `construir-aparato.mjs` — emite las dos salidas impresas desde el corpus
- `libro/frente.txt` · `libro/dorso.txt` — portada, ficha, umbral y aparato final
- `NADIE_APAGUE_TODAVIA_APARATO.txt` · `.md` — la edición diplomática

## Dos ediciones del mismo día

Ésta es la segunda. La primera —**Café internet, Berlín, 1997**, en
`poemario/cafe-internet-berlin/`— lee esa noche como un sistema de archivos
abierto muchos años después: la unidad es el archivo, con su ruta y su peso.

Aquí la unidad es **el verso en disputa**, y el libro que lo contenía no existe.

Ninguna corrige a la otra. Son dos ejecuciones de los mismos tres cuadernos de
trabajo, y el desacuerdo entre ellas es del mismo orden que el desacuerdo entre
`C`, `D`, `P`, `O` y `R`.

Serie **Cuadernos de Especulaciones Poéticas**.
poesiasexp · [canekzapata.net](https://canekzapata.net)
