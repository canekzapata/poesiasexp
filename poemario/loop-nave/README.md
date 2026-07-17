# LOOP: una nave que escribe su deterioro
### pieza de literatura generativa para navegador

No es una aplicación narrativa. No es un videojuego. No es sólo una página.
Es una **nave hecha de escritura**: una pieza de literatura electrónica en
HTML, CSS y JavaScript vanilla donde la interfaz es mínima y el texto es
maximalista — abundante, mutante, recombinatorio, capaz de fallar.

La obra cuenta, de manera no lineal, la historia de una nave que inicia una
misión, se interna en el espacio, encuentra fenómenos, recibe señales,
se deteriora, puede crashear, puede ser tomada, puede recordar mal y puede
volver al inicio con pérdida o exceso de memoria. El lector decide, pero el
azar, el daño y la memoria de la nave también deciden.

```
la nave inicia misión → la misión se abre → el lector decide →
el azar desvía → aparece un fenómeno → la nave registra →
el registro modifica la nave → puede haber crash temprano →
el lenguaje se contamina → otra voz puede entrar →
la caja negra resume → el loop reinicia con cicatriz ↺
```

No construimos una historia que se lee: construimos **una lectura que se
accidenta**.

## Cómo correrla

Abrir `index.html` en cualquier navegador moderno. Sin dependencias, sin
build: HTML, CSS y JavaScript nativo. También se puede servir:

```bash
python3 -m http.server 8000
# → http://localhost:8000/loop-nave/
```

Las opciones responden al clic y a las teclas `1`–`5`. La memoria de la obra
vive en `localStorage`: para empezar de cero de verdad hay que borrar los
datos del sitio (la clave es `loopnave.memoria`). La obra no ofrece ese botón
a propósito: olvidar no debería ser tan fácil.

## Estructura de archivos

```
loop-nave/
  index.html      el casco: tres franjas (estado, lectura, opciones)
  style.css       interfaz mínima / texto máximo
  corpus.js       el libro-base: toda la materia verbal
  motor.js        el corazón: estado, azar, escenas, crash, loop, render
  README.md       esto
  adendas/
    audio/        (futuras señales sonoras)
    imagenes/     (futuros paisajes orbitales, capturas, ruinas visuales)
    objetos3d/    (futuros objetos WebGL)
    notas/        bitácora del proyecto
```

## Cómo funciona `corpus.js`

`corpus.js` declara un objeto global `CORPUS`: el libro-base. No es una
lista de palabras sino un depósito estratificado: misiones (sanas, heridas,
raras, imposibles), bitácoras, objetos, fenómenos, daños, señales, planetas,
estrellas, naves, sondas, intrusiones, caja negra (frases estables, causas,
recomendaciones), motivos de crash, recuerdos de la Tierra, sueños,
instrucciones rotas, diagnósticos, finales falsos, conectores, partículas
(sílabas, prefijos, sufijos), palabras contaminables con sus dobles, prosa
larga con ranuras `{objeto} {fenomeno} {recuerdo}…`, poemas visuales fijos,
glifos y jerga técnica.

Hereda del poemario de este repositorio:

| material | qué aporta |
|---|---|
| poemas de canek | el robot perdido, la sonda con bocinas, ruido y entropía, el planeta tímido, el helecho |
| vocabulario.js (VENT) | las frases zen-orbitales, el léxico interplanetario, los glifos |
| Montalbetti (*Cajas*) | la caja cerrada que promete algo adentro — operación, no cita |
| Stein | la repetición como presente continuo |
| Ted Nelson | el enlace que cambia el documento |
| Eshun | la arqueología futura (el museo de crashes) |
| Macedonio / Pierre Herrera | la novela que altera su propia lectura |
| monjes egipcios | la celda, la vigilia, el desierto |

**Cómo se modifica el corpus:** editar los arreglos de `CORPUS`. Cada string
es una unidad recombinable; el motor no distingue entre una frase escrita
ayer y una de hace mil años. La prosa larga acepta las ranuras `{objeto}`,
`{fenomeno}`, `{palabra}`, `{recuerdo}`, `{conector}`, `{dano}`, `{planeta}`.
Para hacer secuestrable una palabra nueva, agregarla a `CORPUS.contaminables`
con su lista de dobles.

## Cómo funciona `motor.js`

El motor está organizado en once secciones:

1. **azar** — `azar(lista)`, `probabilidad(min, max)`, `prob(p)`, `barajar`.
2. **memoria** — `cargarMemoria()` / `guardarMemoria()` sobre `localStorage`:
   ciclos, crashes totales, deterioro, cicatrices, palabras contaminadas,
   frases recuperadas, encuentros.
3. **estado** — el objeto `estado`: energía, casco, memoria, señal,
   coherencia, contaminación, deriva, ciclos, crashes, ruta, cicatrices,
   archivo, voz, tomada. Cada escena cuesta algo (`desgastePaso`).
4. **contaminación** — `contaminarPalabra()` secuestra una palabra del
   corpus y la reemplaza por su doble en todo texto futuro, ciclo tras ciclo.
5. **degradación** — `degradarTexto(texto, intensidad)` (pérdida de vocales,
   repetición steineana, glifos, letras cambiadas), `cortarSenal()` (la señal
   baja agujerea el texto con `···`), `procesar()` es la tubería completa.
6. **formas de escritura** — `bitacora()`, `informe()`, `poemaConcreto()`,
   `columnaDeterioro()`, `senalRecibida()`, `prosaGalactica()`, `tablaRota()`,
   `constelacionVerbal()`, `textoOrbital()`, `textoExceso()`,
   `textoSilencio()`, `ecoTerrestre()`, `menuNarrativo()`, `cajaNegraTexto()`,
   `repeticionDeMemoria()`, `vozIntrusa()` — todas despachables con
   `generarTexto(tipo)`.
7. **misiones** — `generarMision()` elige según ciclos y crashes: la misión
   se vuelve herida, rara y finalmente imposible.
8. **escenas** — el objeto `ESCENAS`: más de treinta nodos literarios
   (inicio, despegue, órbita baja, primer silencio, cúmulo, campo magnético,
   anomalía temporal, señal, sonda muerta, sonda eco, planeta, planeta que
   no debe leerse, estrella excesiva, eclipse, nave espejo, micrometeoritos,
   avería, sueño, archivo terrestre, intrusión, toma de control, error de
   navegación, deriva, silencio, escena olvidada, aterrizaje, crash, caja
   negra, loop, finales falsos y en blanco, y dos nodos que la memoria
   desbloquea).
9. **navegación** — `elegir(opcion)` → `aplicarConsecuencias()` →
   `determinarSiguienteEscena()`: primero decide el daño
   (`probabilidadCrash()`), luego la contaminación, luego la memoria baja,
   luego la traición de la opción, y sólo al final la promesa del botón.
10. **render** — `renderEscena(nombre)` pinta título, bloques y opciones;
    la memoria baja inserta repeticiones, la contaminación alta interrumpe
    con la otra voz, la energía baja recorta bloques, la coherencia baja
    baraja las opciones y les come vocales. El estado también deforma la
    página entera (clases en `<body>`) y el propio título de la pestaña.
11. **arranque** — teclado y `DOMContentLoaded`.

### Cómo funciona el crash

El crash no es "perdiste": es un modo literario. Cualquier transición puede
crashear — incluso el paso dos. `probabilidadCrash()` crece con el casco
perdido, la deriva, los pasos del ciclo y los ciclos acumulados. Al crashear:
se numera el crash (número de por vida, no de sesión), se registra una
**cicatriz** en `localStorage`, a veces se contamina una palabra, y el texto
del crash se genera desde `CORPUS.crashes`. Después el lector puede leer la
caja negra, reiniciar con cicatriz, intentar recuperar señal o forzar la
continuación.

### Cómo funciona el loop

El loop no es reiniciar: cada vuelta modifica la obra. Al volver al inicio
suben `ciclos` y `deterioro`; puede contaminarse otra palabra; el estado
inicial del ciclo siguiente arranca más gastado; la misión muta (de
`misiones` a `misionesHeridas` a `misionesRaras` a `misionesImposibles`);
las cicatrices se listan en la apertura; los colores de la página giran con
el deterioro acumulado (`--rareza`); y a partir de ciertos umbrales aparecen
nodos nuevos: **el jardín que desobedece** (3 ciclos) y **el museo de
crashes** (4 crashes). La obra se vuelve más rara con cada vuelta. Esa es la
idea.

## Cómo se agregan nuevas escenas

Añadir una función al objeto `ESCENAS` en `motor.js`:

```js
ESCENAS.miNodo = function () {
  return {
    titulo: "MI NODO",
    bloques: [
      b("apertura", "<p>" + procesar("texto de la escena") + "</p>"),
      generarTexto("constelacion"),
    ],
    opciones: [
      op("[seguir]", ["cumulo", "senal"], { energia: -4 }),
      op("[dudar]", ["escenaOlvidada"], { memoria: -3 }, { traicion: 0.3 }),
    ],
  };
};
```

y agregar `"miNodo"` a `NAVEGABLES` si debe ser alcanzable por azar o por
traición. Toda opción acepta: `destinos` (se elige uno al azar), `fx`
(cambios de estado), `traicion` (probabilidad de entregar otro destino) y
`especial` (`"crash"`, `"loop"`, `"reiniciar"`, `"sobrevivir"`, …).

## Cómo se agregan nuevas formas de escritura

Escribir una función que devuelva `b(clase, html)` en la sección 6 de
`motor.js`, registrarla en `generarTexto()`, y darle su clase en `style.css`
(la interfaz permanece sobria; el bloque puede ser todo lo excesivo que la
escritura pida). Pasar todo texto por `procesar()` para que el deterioro, la
señal y la contaminación puedan escribir encima.

## La carpeta `adendas/`

Queda preparada para expansiones futuras de la pieza:

- `adendas/audio/` — señales sonoras: la bocina rudimentaria de la sonda,
  ruido de fondo, transmisiones encontradas.
- `adendas/imagenes/` — paisajes orbitales, capturas, mapas, ruinas visuales.
- `adendas/objetos3d/` — objetos WebGL: la sonda muerta, la caja negra,
  el cúmulo.
- `adendas/notas/` — bitácora del desarrollo y planes.

Nada de esto es necesario para leer la obra hoy: son órganos que la nave
podrá crecer después.

## Qué se espera ahora

Primera etapa (esta): estructura simple, interfaz mínima, corpus inicial
amplio, motor generativo, navegación aleatoria con decisiones, estado de
nave, sistema de crash, sistema de loop, memoria con `localStorage`, y más
de treinta nodos (los ocho mínimos — inicio, despegue, cúmulo, señal,
planeta, avería, crash, caja negra / loop — están todos, con compañía).

## Qué se espera después

Expandir el corpus; más escenas y más formas de escritura; audio, imágenes
y objetos 3D en `adendas/`; modos visuales más complejos; memoria más
persistente; rutas secretas adicionales; escenas que sólo aparezcan tras
muchos ciclos o muchos crashes; voces no humanas; contaminación más profunda
del corpus (que las palabras secuestradas se propaguen entre sí); permitir
que la obra se vuelva más extraña con el tiempo, sin pedir permiso.

## Regla final

No construir una obra sobre una nave: construir una nave hecha de escritura.
No construir una historia que se lee: construir una lectura que se accidenta.
La interfaz casi mínima; el texto como espectáculo, motor, materia, ruina,
viaje y loop.

---

poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
