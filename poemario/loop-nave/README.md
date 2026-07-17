# LOOP: una nave que escribe su deterioro
### máquina de literatura navegable

No es una aplicación narrativa. No es un videojuego. No es sólo una página.
Es una **nave hecha de escritura**: un híbrido de libro experimental,
hipertexto, videojuego narrativo mínimo, poema generativo, bitácora, archivo
técnico, consola dañada y elige-tu-propia-historia roto, en HTML, CSS y
JavaScript vanilla, donde la interfaz es mínima y el texto es maximalista.

La obra cuenta, de manera no lineal, la historia de una nave que inicia una
misión, se interna en el espacio, encuentra fenómenos, recibe señales, se
deteriora, puede crashear, puede ser tomada, puede recordar mal y puede
volver al inicio con pérdida o exceso de memoria. El lector decide, pero el
azar, el daño y la memoria de la nave también deciden.

**El texto es el sistema.** Un párrafo puede ser una escena. Una palabra
puede ser una puerta. Una nota puede ser una trampa. Un hipervínculo puede
ser una avería. Un crash puede ser un capítulo.

```
la nave viaja porque el texto cambia de régimen:
bitácora → nota → señal → informe → poema concreto → crash →
caja negra → loop → prosa larga → archivo → decisión → silencio ↺
```

## Cómo correrla

Abrir `index.html` en cualquier navegador moderno. Sin dependencias, sin
build. También se puede servir:

```bash
python3 -m http.server 8000
# → http://localhost:8000/loop-nave/
```

### Cómo se lee

- **botones**: las decisiones de siempre (también responden a las teclas `1`–`9`);
- **palabras subrayadas**: puertas. Tocarlas abre notas, glosas, escenas,
  inserta texto nuevo, altera el estado de la nave o —rara vez— crashea.
  Releer una palabra herida la degrada en el lugar;
- **llamadas ¹ ² ³**: abren notas en el margen. Las notas expanden,
  contradicen o infectan. Abrir la misma nota demasiadas veces tiene
  consecuencias (las notas muerden);
- **menú narrativo**: cuando el texto pregunta *¿qué hace la nave?*, las
  líneas numeradas son las opciones reales, clicables desde adentro del texto;
- **`R`**: otra semilla, otra deriva; **`M`**: el mapa;
- a veces el texto llega **tecleándose**, como si alguien lo escribiera
  ahora, del otro lado del casco;
- todo queda en pantalla: el texto scrollea en su región, las notas
  acompañan al margen, las opciones no se van nunca.

### Los útiles (abajo a la derecha)

- **♪** — enciende la **bocina rudimentaria** (Tone.js, heredado de
  `lands/`): la señal suena como morse defectuoso, el crash como ruido
  rosa que se cae de frecuencia, las puertas hacen un clic administrativo,
  el loop toca una canción de cuna que pierde una nota por ciclo, y las
  medusas pulsan bajo y lento. Apagada por defecto: la nave entiende el
  pudor.
- **✦** — abre el **mapa de misión**: una ventanita muy unicode con la
  Tierra (⊕), la nave (⌖) cada vez más lejos, la estela del camino (con
  huecos si la memoria está baja), la cortina de la heliopausa (∿), los
  crashes (×) y las marcas de los encuentros. El mapa finge saber dónde
  está la nave.
- **⎙** — **imprime la bitácora de misión**: el documento que el sistema
  va conservando con lo que se ve — misiones, escenas, señales, daños,
  puertas tocadas, notas abiertas, crashes. Y con lo que se pierde: los
  impactos, la memoria baja y los borrados voluntarios dañan o borran
  entradas para siempre (`[entrada perdida: impacto]`). Se imprime lo que
  sobrevivió; lo demás también existió.

### Semillas

El azar está firmado: la semilla queda en la URL (`?seed=…`) — misma
semilla, misma deriva. Las decisiones del lector y la memoria acumulada en
`localStorage` también condicionan la lectura: la semilla firma, no
encadena. La memoria de la obra vive bajo la clave `loopnave.memoria`; para
olvidar de verdad hay que borrar los datos del sitio. La obra no ofrece ese
botón a propósito.

## Estructura de archivos

```
loop-nave/
  index.html      el casco: [estado] [lectura | notas] [opciones] [pie]
  style.css       interfaz mínima / texto máximo; tipografías por régimen
  corpus.js       el libro-base: toda la materia verbal
  motor.js        el motor de lectura
  README.md       esto
  fonts/          las letras de la casa (ver abajo)
  adendas/
    audio/        (futuras señales sonoras)
    imagenes/     (futuros paisajes orbitales, capturas, ruinas visuales)
    objetos3d/    (futuros objetos WebGL)
    notas/        bitácora del proyecto + el siguiente loop
```

## Las letras

Cada régimen de escritura lleva su propia fuente, todas heredadas de
poesiasexp (`fonts/`):

| fuente | papel |
|---|---|
| unscii-16-full | la consola base: cuerpo, poemas concretos, glifos |
| Web437 IBM Model3x | el CRT de la caja negra |
| Web437 EverexME | el micro-pixel del estado y las glosas |
| Electronics | el display de la señal recibida |
| Jomolhari | la serifa de libro lejano: prosa, cartas, sueños, Tierra |
| Noto Lineal A | la voz no humana (la que nadie descifró) |
| Noto Lineal B | la voz no humana (la que se descifró, tarde) |
| Noto Egipcio | la voz no humana (la lengua de los muertos con burocracia) |
| Noto Anatolio | la voz no humana (la piedra que habla en perfil) |
| Ac437 × 15 | el cementerio de monitores: cada crash se imprime en un CRT distinto |
| unifont | la red de seguridad de todos los glifos |

La letra de lectura (cuerpo, opciones, notas) es un stack de sistema
legible; el pixel de unscii queda para lo material: poemas concretos,
constelaciones, glitch y el mapa. La prioridad es leer.

## Cómo funciona `corpus.js`

`corpus.js` declara un objeto global `CORPUS`: el libro-base, más libro que
base de datos. Estratos: misiones (sanas, heridas, raras, imposibles),
bitácoras, objetos, fenómenos, daños, señales, planetas, estrellas, naves,
sondas, intrusiones, caja negra (frases estables, causas, recomendaciones),
motivos de crash, recuerdos de la Tierra, sueños, instrucciones rotas,
diagnósticos, finales falsos, conectores, partículas, **notas** (y notas
intrusas, y notas del editor orbital), **glosas de sistema**, **archivos
encontrados**, **enciclopedia falsa**, **cartas**, **manuales**, **errores
404**, **palabras-puerta**, palabras contaminables con sus dobles, prosa
larga con ranuras `{objeto} {fenomeno} {recuerdo}…`, poemas visuales, glifos
y jerga técnica.

**El registro científico** (etapa 5): junto a la voz literaria corre ahora
una capa dura de discurso de misión — astrofísica (`astrofisica`,
`cuerposDuros`), telemetría cruda (`telemetria`), espectroscopía y
biosignaturas (`espectros`), exoquímica (`exoquimica`), y exobiología con
anatomía y fisiología de lo hallado (`exobiologia`, `autopsiaSonda`). El
hallazgo importa por su cuerpo, no sólo por su lenguaje: una atmósfera en
desequilibrio químico, un organismo con hemolinfa de vanadio, una sonda con
su forense de fatiga de materiales. Los `informesCientificos` son plantillas
con ranuras (`{astro} {espectro} {exobiologia} {autopsia} {cuerpo}
{instrumento}`) que el motor rellena desde ese material. La pieza busca ser
más ciencia ficción que metaliteratura: la nave mide antes de interpretar.

**La capa narrativa** (etapa 6): a la pieza le faltaba historia. Ahora, junto
a lo literario y lo científico, corre un hilo narrativo original —una
**tripulación** con roles (Ihara la exobióloga, el comandante Voss, Okonkwo
que le habla a los instrumentos, Mercè la médica, la Dra. Lin, los once mil
durmientes en criogenia), una **novela de a bordo** (prosa de gente
conviviendo con la ciencia), **diálogos** cortos, y sobre todo un **arco de
hallazgo** (`hallazgo`) que *avanza con la lectura*: de la anomalía a 3.2σ
hasta el contacto y la fase Ω, servido por fases según cuánto se ha leído,
que la memoria baja desordena. Inspirado en procedimientos de escritura
hallada y novela de a bordo (nada se copia de las fuentes: el material es
propio). Casi toda escena suma ahora un registro científico o narrativo:
la voz metaliteraria dejó de ser prevalente.

Hereda del poemario de este repositorio:

| material | qué aporta |
|---|---|
| poemas de canek | el robot perdido, la sonda con bocinas, ruido y entropía, el planeta tímido, el helecho |
| vocabulario.js (VENT) | las frases zen-orbitales, el léxico interplanetario, los glifos |
| Montalbetti (*Cajas*) | la caja cerrada que promete algo adentro — operación, no cita |
| Stein | la repetición como presente continuo |
| Ted Nelson | el enlace que cambia el documento en lugar de conducir fuera |
| Eshun | la arqueología futura (el museo de crashes) |
| Macedonio / Pierre Herrera | la novela que altera su propia lectura |
| monjes egipcios | la celda, la vigilia, el desierto |

**Cómo se modifica el corpus:** editar los arreglos de `CORPUS`. Cada string
es una unidad recombinable. La prosa larga acepta las ranuras `{objeto}`,
`{fenomeno}`, `{palabra}`, `{recuerdo}`, `{conector}`, `{dano}`, `{planeta}`.
Para hacer secuestrable una palabra, agregarla a `CORPUS.contaminables`; para
volverla puerta, a `CORPUS.palabrasPuerta`.

## Cómo funciona `motor.js`

No un game engine: un **motor de lectura**, en quince secciones:

0. **semilla** — `xmur3` + `mulberry32`; `?seed=` en la URL; `sembrar()` al
   arrancar y en cada ciclo; `nuevaSemilla()` con la tecla `R`.
1. **azar** — `azar`, `probabilidad`, `prob`, `barajar` (sembrados) y
   `azarCaos`/`probCaos` (libres, para el caos ambiental: no gastan la
   semilla narrativa).
2. **memoria** — `localStorage`: ciclos, crashes, deterioro, cicatrices,
   palabras contaminadas, frases recuperadas, encuentros, notas abiertas,
   palabras tocadas.
3. **estado** — energía, casco, memoria, señal, coherencia, contaminación,
   deriva, voz, tomada… `desgastePaso()` cobra cada escena;
   `alterarEstado(cambios)` es la moneda de todas las consecuencias.
4. **contaminación** — palabras secuestradas que persisten entre ciclos.
5. **degradación** — `degradarTexto` (vocales, repetición steineana,
   glifos, letras cambiadas), `cortarSenal`, y la tubería `procesar()` =
   degradar → cortar → **hipertextualizar** → contaminar.
6. **hipertexto** — `hiper(texto, spec)` construye enlaces explícitos;
   `hipertextualizar()` siembra puertas en palabras del texto;
   `seguirHipervinculo()` ejecuta: `nota`, `glosa`, `fx` (alterar estado),
   `insertar` (el texto brota), `escena` (saltar), `recordar`, `crash`.
   Un enlace no es navegación: es tocar una palabra que altera la lectura.
7. **notas** — `llamadaNota()` cuelga ¹ ² ³; `abrirNota()` pinta en el
   margen y lleva la cuenta: a la tercera apertura la nota advierte, a la
   cuarta muerde (`crashMenor`). Fuentes: notas, notas intrusas (cuando la
   contaminación sube), notas del editor orbital.
8. **glosas** — `generarGlosa()`: comentarios automáticos del sistema sobre
   el texto, con ranuras `{palabra}` y `{n}`.
9. **formas de escritura** — bitácora, informe/diagnóstico, poema concreto,
   columna de deterioro, señal recibida, prosa galáctica, tabla rota,
   constelación verbal, texto orbital, exceso, silencio, eco terrestre,
   caja negra, repetición de memoria, voz intrusa, **archivo encontrado**,
   **enciclopedia falsa**, **carta**, **manual**, **nota del editor**,
   **error 404**, **letanía**, **interrogatorio**, **voz no humana**
   (xenolalia en Lineal A/B, egipcio y anatolio, con traducción fallida),
   **brindis**, y las formas científicas — **informe científico**,
   **telemetría**, **espectrograma** (con banda de absorción en bloques),
   **disección exobiológica**, **forense de sonda**, **carta astronómica**,
   y las formas narrativas — **tripulación**, **novela de a bordo**,
   **diálogo**, **fase de hallazgo** (el arco que avanza) — todas
   despachables con `generarTexto(tipo)`.
10. **misiones** — mutan con ciclos y crashes: sanas → heridas → raras →
    imposibles.
11. **escenas** — más de treinta y cinco nodos, ahora también: documentos
    laterales, enciclopedia de a bordo, carta a central, **heliopausa** (la
    frontera del idioma), **cementerio orbital**, **taberna del asteroide**
    (se paga con recuerdos, el cambio se da en brindis) y **el lago de
    medusas**, al que no se llega por azar: se llega por rumor; y los nodos
    que la memoria desbloquea (jardín a los 3 ciclos, museo de crashes a
    los 4 crashes); y las escenas científicas — **tránsito espectral**
    (leer una atmósfera de lejos), **hallazgo exobiológico** (el cuerpo, no
    la lengua), **forense de sonda**, **campo de polvo / condritos** y
    **muestra en cuarentena** (bioseguridad y la palabra *vivo*); y la
    escena narrativa **guardia de a bordo** (la vida de la tripulación
    entre medición y medición).
12. **navegación** — `elegir` → `aplicarConsecuencias` →
    `determinarSiguienteEscena`: primero el daño (`probabilidadCrash`),
    luego la contaminación, luego la memoria baja, luego la traición de la
    opción, y sólo al final la promesa del botón.
13. **render** — la rejilla todo-en-pantalla; la memoria baja repite, la
    contaminación interrumpe, la energía recorta, la coherencia baraja; el
    estado deforma la página entera (clases en `<body>`) y el título de la
    pestaña.
14. **caos ambiental** — la página sigue escribiéndose sola: cada tantos
    segundos una palabra visible se deteriora en el lugar o brota una glosa.
    Crece con el deterioro acumulado.

### Cómo funciona el crash

El crash no es "perdiste": es un modo literario. Cualquier transición puede
crashear — incluso el paso dos, incluso un clic sobre una palabra. Hay
crashes mayores (numerados de por vida, dejan **cicatriz** en
`localStorage`, a veces contaminan una palabra) y **crashes menores** (una
nota que muerde, un párrafo lastimado). Después el lector puede leer la caja
negra, reiniciar con cicatriz, recuperar señal o forzar la continuación.

### Cómo funciona el loop

Cada vuelta modifica la obra: suben `ciclos` y `deterioro`; puede
contaminarse otra palabra; el estado arranca más gastado; la misión muta;
las cicatrices se listan en la apertura; los colores giran (`--rareza`); la
semilla se re-siembra con el ciclo; y a ciertos umbrales aparecen nodos
nuevos. La obra se vuelve más rara con cada vuelta. Esa es la idea.

## Cómo se agregan nuevas escenas

Añadir una función al objeto `ESCENAS` en `motor.js`:

```js
ESCENAS.miNodo = function () {
  return {
    titulo: "MI NODO",
    bloques: [
      b("apertura", "<p>" + procesar("texto con puertas sembradas solas") +
        " o con una " + hiper("puerta explícita", { acc: "insertar", arg: "carta" }) +
        llamadaNota("una nota colgada a mano") + "</p>"),
      generarTexto("constelacion"),
    ],
    menu: true,   // las opciones también aparecen dentro del texto
    opciones: [
      op("[seguir el ruido]", ["cumulo", "senal"], { energia: -4 }),
      op("[mentir en la bitácora]", ["escenaOlvidada"], { memoria: -3 }, { traicion: 0.3 }),
    ],
  };
};
```

y agregar `"miNodo"` a `NAVEGABLES` si debe ser alcanzable por azar, por
traición o por puerta. Cada opción es un **verbo de lectura** con
consecuencias: `destinos`, `fx`, `traicion`, `especial`.

Regla operativa de toda escena nueva: ¿qué forma de escritura explora?,
¿qué hipervínculos contiene?, ¿qué notas abre?, ¿puede fallar?, ¿qué cambia
tras varios ciclos?, ¿qué parte se genera, cuál se deteriora, qué deja en
memoria?

## Cómo se agregan nuevas formas de escritura

Escribir una función que devuelva `b(clase, html)` en la sección 9,
registrarla en `generarTexto()`, darle su clase (y su tipografía) en
`style.css`, y pasar el texto por `procesar()` — así el deterioro, la señal,
las puertas y la contaminación pueden escribir encima.

## La carpeta `adendas/`

Preparada para expansiones: `audio/` (la bocina rudimentaria, ruido de fondo
firmado por semilla), `imagenes/` (paisajes orbitales, láminas de crashes),
`objetos3d/` (la sonda muerta en WebGL), `notas/` (bitácora del proyecto).
Nada de esto es necesario para leer la obra hoy: son órganos que la nave
podrá crecer después. Regla: ninguna adenda debe volver espectacular la
interfaz; todo lo nuevo entra al servicio del texto.

## Qué se espera después

El plan completo de la siguiente etapa vive en
[`adendas/notas/002-siguiente-loop.md`](adendas/notas/002-siguiente-loop.md):
audio con WebAudio (la bocina rudimentaria, el earworm del loop),
contaminación que se propaga entre palabras, el lector fantasma, la edición
impresa de cada lectura (`P`), rutas secretas nuevas (el astillero, la
cuarta pared, el diccionario herido), la gramática de aparición de las
escrituras antiguas, el mapa-constelación de la ruta. Ese documento es el
prompt maestro para la próxima instancia — y también una bitácora: se le
dejan cicatrices al terminar cada etapa.

## Regla final

No construir una obra sobre una nave: construir una nave hecha de escritura.
No construir una historia que se lee: construir una lectura que se accidenta.
No avanzar de pantalla en pantalla: avanzar de forma de escritura en forma
de escritura.

---

poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
