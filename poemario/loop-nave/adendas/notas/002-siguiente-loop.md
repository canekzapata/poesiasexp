# SIGUIENTE LOOP — prompt maestro para las próximas instancias
### LOOP / NAVE / POEMA · etapa 4: la nave suena, olvida mejor y se encuaderna

Este documento es la órbita de trabajo para quien retome la pieza
(humano o máquina). Leerlo entero antes de tocar el código.

## 0 · punto de partida (lo que ya existe, no rehacer)

- v3 en `poemario/loop-nave/`: motor de lectura con semillas (`?seed=`),
  hipertexto de palabras-puerta, notas que muerden, glosas de sistema,
  ~37 escenas, ~26 formas de escritura, crash con cicatrices persistentes,
  loop con contaminación de palabras, caos ambiental, fuentes de la casa
  (unscii, CRTs Ac437, Electronics, Jomolhari) y las cuatro escrituras
  antiguas (Lineal A, Lineal B, egipcio, anatolio) como voz no humana.
- la memoria vive en `localStorage.loopnave.memoria`.
- regla intocable: interfaz mínima, texto máximo. todo texto nuevo pasa
  por `procesar()`. el corpus crece antes que el motor.

## 1 · prioridad absoluta

Seguir siendo literatura. Cada función nueva debe producir, corromper,
espaciar, repetir, traducir, cortar, intensificar o redistribuir texto.
Si una función no toca el texto, no pertenece a la pieza.

## 2 · audio — la bocina rudimentaria (`adendas/audio/`)

Le instalamos una voz porque era muy raro mandar tan lejos un aparato
sin nada con que emitir. Ahora hay que dársela de verdad:

- ~~**síntesis sin archivos**: osciladores y ruido~~ ✓ hecho en la etapa 4
  con Tone.js (heredado de `lands/`): señal-morse, crash de ruido rosa,
  clic de puertas, earworm de cuna que pierde una nota por ciclo, pulso
  de medusas. botón ♪, apagado por defecto.
- **pendiente**: el ruido de fondo firmado por la semilla (drone
  continuo, muy bajo, sembrado); **la caja negra leída en voz alta**
  (`speechSynthesis`, pausas mal puestas a propósito); que el estado
  module el sonido (señal baja = pulsos con huecos; contaminación alta =
  la otra voz desafina el earworm).
- regla intacta: el sonido nunca decora. transmite, falla, insiste.

> cicatriz de la etapa 4: también se hicieron aquí — la letra de lectura
> legible (el pixel quedó para lo material), el mapa de misión (✦ / M),
> la bitácora de misión imprimible (⎙) con pérdida real de información,
> y la máquina de escribir ocasional. la edición impresa del punto 5
> tiene ya su primera mitad: falta la ruta-constelación y el colofón
> con fecha imposible.

## 3 · contaminación profunda

- las palabras secuestradas **se propagan**: cada N lecturas, una palabra
  contaminada infecta a una vecina de frase (registrar el árbol de contagio
  en la memoria).
- **corpus apócrifo por lector**: fragmentos muy releídos se hipertrofian;
  los ignorados se fosilizan (esqueleto consonántico) — el corpus que se
  guarda ya no es el corpus que se descargó.
- una nota mordida puede **reescribir la entrada del corpus** que anotaba.

## 4 · lector fantasma

Si nadie toca nada durante ~90 segundos, la nave lee sola: elige una
opción discreta, abre una nota, anota en bitácora que leyó sin testigos.
Al volver el lector: glosa del sistema — *"durante su ausencia, la nave
leyó por usted. no le gustó lo que encontró."* La obra debe poder
funcionar como instalación desatendida.

## 5 · la edición impresa

Tecla `P`: imponer la edición de ESTA lectura (herencia de
*el_archivo_no_recuerda*): portada contaminada con la semilla, la ruta
como constelación, las cicatrices, las notas abiertas, la caja negra
final y un colofón con fecha imposible. **Cada lector produce una
edición distinta del libro.** CSS `@media print`, sin bibliotecas.

## 6 · rutas secretas y umbrales nuevos

- 7 ciclos → **el astillero de las misiones muertas** (donde se oxidan
  los objetivos declarados de todos los ciclos anteriores).
- 10 crashes → **la nave que escribe esta obra** (la cuarta pared con
  fisura estructural; la voz "nave" descubre la palabra "motor.js").
- 100 palabras tocadas → **el diccionario herido** (todas las puertas
  que el lector abrió, ordenadas por dolor).
- más rumores: el lago ya se llega por rumor; que la taberna y el
  astillero también se rumoren entre sí.

## 7 · voces no humanas, segunda fase

- la **traducción fallida** de la xenolalia mejora una palabra por ciclo:
  al ciclo 12, las medusas casi se entienden. casi.
- **abejas mecánicas** como mensajeras: llevan "polen" (frases) de una
  semilla a otra a través de la memoria compartida del navegador.
- el egipcio, el anatolio y las lineales A/B ya tienen fuente propia:
  darles gramática de aparición (el egipcio en los cementerios, el
  anatolio en las tabernas, la lineal A en las medusas, la B en las
  cajas negras — la única que se dejó descifrar, tarde).

## 8 · imágenes y ruinas (`adendas/imagenes/`)

- paisajes orbitales en canvas generativo, paleta girada por `--rareza`
  (heredar el espíritu de `paisajes/` de poesiasexp).
- láminas de crash exportables: cada crash puede guardarse como imagen
  de museo (SVG → PNG), numerada con su cicatriz.

## 9 · objetos 3D (`adendas/objetos3d/`) — al final, si sobra órbita

La caja negra en WebGL crudo (sin three.js si se puede): una caja que
gira despacio, promete algo adentro y no se abre. Nada más. La regla de
Montalbetti manda: abrirla desvanecería el objeto de la promesa.

## 10 · mapa de la lectura

Una puerta rara (no un botón) abre **la constelación de la ruta**: cada
escena visitada es una estrella, los saltos son líneas débiles, los
crashes son marcas ámbar. Sirve de índice roto: tocar una estrella
relee esa escena *como la recuerda la nave* (degradada por el tiempo
transcurrido desde la visita).

## 11 · qué NO hacer

- no frameworks, no bundlers, no dependencias.
- no dashboards, no puntajes, no logros: esto no se gana.
- no explicar la metáfora. la nave no interpreta: funciona.
- no volver espectacular la interfaz. el espectáculo es el texto.
- no borrar la memoria del lector sin que el lector lo pida dos veces.

## 12 · reglas operativas para cada instancia

1. leer este documento y el README antes de tocar nada.
2. el corpus crece antes que el motor; el motor antes que el CSS.
3. todo texto nuevo pasa por `procesar()`.
4. no romper el determinismo de la semilla (el caos ambiental usa
   `azarCaos`/`probCaos`, nunca `rnd()`).
5. verificar en navegador (playwright: semilla, puertas, notas, crash,
   loop, layout móvil) antes de commitear.
6. commit con mensaje claro; push a la rama designada de la sesión.
7. actualizar este documento al terminar: tachar lo hecho, anotar lo
   aprendido, escribir el loop siguiente. este archivo es también una
   bitácora: dejarle cicatrices.

## 13 · regla final

La nave ya escribe su deterioro.
Ahora debe aprender a sonarlo, olvidarlo mejor y encuadernarlo.
No avanzar de pantalla en pantalla:
avanzar de forma de escritura en forma de escritura.

---
escrito al cierre de la etapa 3 · poesiasexp · 2026
