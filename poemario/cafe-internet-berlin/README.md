# CAFÉ INTERNET, BERLÍN, 1997
### reconstrucción imposible de un directorio llamado `morgen`

Un día de montaje y una noche de exhibición en un café internet temporal de
Berlín, el viernes 5 de septiembre de 1997. Diez monitores, una sola línea
telefónica, un performance de impresión entre Cusco, San Cristóbal de Las Casas
y Berlín, y una amistad que es la verdadera infraestructura de todo.

El libro no cuenta esa noche: **edita lo que quedó de ella**. Tres soportes
incompletos, ninguno de acuerdo con los otros, abiertos por alguien que en 2001
todavía no ha decidido si estuvo ahí.

> La noticia más importante de una noche sobre comunicación planetaria
> es que el perro cenó.

## Dos versiones

| | |
|---|---|
| **`CAFE_INTERNET_BERLIN_1997.txt`** | el manuscrito, en la tipografía de la casa. 48 piezas numeradas + 4 de raíz, con su aparato y su colofón. |
| **`CAFE_INTERNET_BERLIN_1997.md`** | la misma edición, legible en cualquier visor o en GitHub. |
| **`index.html`** | la versión ejecutable. Las rutas se recorren, los enlaces recuerdan, la nota 6 se llena al llegar, la nota del autor crece y `morgen/` no termina de cargar nunca. |

```bash
python3 -m http.server 8000
```

Después `http://localhost:8000/poemario/cafe-internet-berlin/`. También abre
`index.html` directo del disco. Sin bibliotecas externas, sin frameworks.

## La operación

El poemario es un sistema de archivos usado durante un día y reabierto muchos
años después. La unidad no es «el poema»: es **el archivo**, con su ruta, su
peso, su fecha y su soporte. Ninguno aparece sin procedencia.

Cinco directorios y un residuo:

```text
/cafe_berlin_1997
├── 00_README.TXT · montage.log · adressen.txt · kasse.xls
├── montage/      01–14   mañana y tarde. todavía puede nombrarse cada cable
├── public_html/  15–28   apertura. más densa socialmente, menos estable
├── spool/        29–35   no hay poemas terminados: hay trabajos
│                         enviado · recibido · retenido · atascado · cancelado
├── nachtkopie/   36–43   la sala se vacía mientras el archivo se multiplica
└── morgen/       44–48   fechas imposibles y una página que sigue esperando
```

## Enlaces con retórica

Un enlace no es sólo un destino. Cada uno declara qué hace:

| | tipo | qué hace |
|---|---|---|
| `→` | continuación | la frase empieza aquí y termina en otra pieza |
| `⌐` | procedencia | por qué manos pasó esto antes de llegar |
| `↮` | contradicción | la nota niega la fecha, el nombre o la escena |
| `⏎` | performativo | seguirlo ejecuta algo |
| `✕` | roto fértil | no oculta la pérdida: la vuelve legible |
| `⟳` | apócrifo | dice 1997 y lleva a después |
| `♥` | cuidado | ni teoría ni obra: el perro, el turno, avisar al llegar |

**128 enlaces, 168 notas, siete retóricas.** Un enlace visitado no vuelve a ser
nuevo: guarda cuántas veces se cruzó.

## Lo que hace la máquina y el papel no

- **Carga por franjas.** Una imagen de 61 KB tardaba once minutos en 1997.
  Aquí tarda segundos y se interrumpe con clic o `Esc`. La espera es material,
  no castigo.
- **La nota 6.** La pieza 01 tiene una nota en blanco: hay llamada, hay espacio
  reservado, no hay texto. Se llena al abrir el atasco de las 21:17 (pieza 33).
  Es la única operación del libro que ocurre fuera del cuerpo de los dos poemas
  que la producen.
- **La nota invasora.** `morgen/notas_del_autor_2001.txt` crece con cada
  lectura hasta ocupar más que los poemas que comenta. En la octava, el editor
  confiesa algo que reordena el libro entero. En la novena, lo retira.
- **`morgen/index.html`.** La etiqueta `<li>` quedó abierta en 1997. La barra
  llega a 87% y sigue intentando. No da error. Espera.
- **Bitácora local.** La ruta del lector se guarda en esta máquina y **no se
  envía a ningún servidor**. `olvidar esta lectura` la borra.

## Teclas

`j` / `k` — archivo siguiente y anterior · `Esc` — completar la carga
`n` — 404 · `m` — morgen · `♥ kifli` — disponible desde cualquier página

## La caja

`montalbetti.md`, en este mismo `poemario/`, sostiene que una caja cerrada
promete algo adentro, y que lo prometido no es lo que hay: al abrirla, el
objeto de la promesa se desvanece. Es la operación del libro entero. Por eso
Mara cierra la impresora sin sacar la hoja (33), por eso el disquete once se
queda sin etiqueta (42), por eso un `404` es la dirección exacta de una
ausencia (28), y por eso la última pieza (48) es la única que no proviene de
ningún soporte de 1997: la escribe quien levantó la tapa.

## Régimen de verdad

El libro distingue tres niveles y sólo los separa en el aparato final; el
cuerpo conserva la ambigüedad.

- **Documento** — Fahlman y `:-)` en 1982; los kaomoji desde mediados de los
  ochenta; *Form Art* de Shulgin en 1997; los MUD/MOO anteriores; los 176 emoji
  de Kurita para i-mode entre 1998 y 1999; el programa del Podewil.
- **Ficción plausible** — Mara, el grupo, el café, el performance de
  impresoras, la pieza `FACE TO FACE / WITHOUT A FACE`.
- **Hiperstición** — la frase del margen de la hoja atascada; el sobre que
  rotula un GIF de 2001 como «FIRST EMOJI / 1997»; el trabajo 013 recibido de
  ninguna parte; el directorio `morgen` creado cuando no había nadie.

La hiperstición no autoriza a mentir en las notas históricas. Depende de que se
pueda distinguir investigación, invención y contaminación temporal.

## Sobre el EZLN

En 1997 el levantamiento es de hace tres años y los Acuerdos de San Andrés del
año pasado: es correo de esta semana, no mitología. La pieza 27 desmonta la
frase «la selva entró directamente al módem» contando los catorce pasos que
hubo en medio, trece de los cuales son personas. La 35 registra la cadena de
custodia. No hay pasamontañas como textura.

## Archivos

- `CAFE_INTERNET_BERLIN_1997.txt` · `.md` — el libro, en dos salidas
- `construir-libro.mjs` — las emite desde `corpus.js`, para que la versión
  impresa y la ejecutable no puedan separarse. `node construir-libro.mjs`
- `libro/frente.txt` · `libro/dorso.txt` — portada, ficha, umbral, aparato y
  colofón: lo único del libro que no viene del corpus
- `index.html` — el pliego
- `corpus.js` — las 52 lexias, con soporte, notas y rutas
- `motor.js` — carga por franjas, memoria de enlaces, nota 6, nota invasora
- `style.css` — el color clasifica: gris de sala, beige de papel, y verde,
  cian, magenta y ámbar como señal, nunca como baño nostálgico
- `01_temas_e_historia.md` · `02_tono_y_forma.md` ·
  `03_mundo_material_voces_y_archivo.md` — los tres cuadernos de trabajo de los
  que salió todo esto

Serie **Cuadernos de Especulaciones Poéticas**.
poesiasexp · [canekzapata.net](https://canekzapata.net)
