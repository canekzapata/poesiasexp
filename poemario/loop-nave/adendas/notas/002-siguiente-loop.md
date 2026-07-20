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
>
> cicatriz de las etapas 5–7: el registro científico (astrofísica,
> telemetría, espectros, exoquímica, exobiología, forense de sonda), la
> capa narrativa (tripulación, novela de a bordo, diálogos, el arco de
> `hallazgo` que avanza con la lectura) y la vuelta v7 (ecología,
> evolución, microbioma, fisiología humana, cosmología, tiempo profundo,
> dinámica orbital, y las poéticas: verso científico, haiku orbital,
> salmo de datos). la voz metaliteraria dejó de ser prevalente.
>
> cicatriz de la etapa 8 — el pacto de despegue y la astrología: la nave
> ya no arranca en el vacío. despierta en **plataforma**, atada a la torre,
> y hay un umbral real — puede revisarse todo (sistemas / cielo / carga)
> sin despegar, pero **despegar hay que pedirlo**: `estado.despegada`,
> `NAVEGABLES_TIERRA` / `poolNavegable()`, las escenas `revisionSistemas`,
> `lecturaDelCielo`, `cartaAstral`, `bodega`, `pedirDespegue`, `ascenso`,
> y el mapa que marca *en la torre, distancia 0* hasta el T−0. la capa
> astrológica corre junto a la astrofísica dura — `zodiaco` (con su
> astronomía real adentro), `aspectos`, `horoscopoNave`, `efemerides`,
> `climaEspacial`, `precesión` — y las secciones más antiguas del corpus
> recibieron injertos científico-astrológicos para pesar menos hacia lo
> metaliterario. el cielo se lee dos veces: con instrumento y con fe.
>
> cicatriz de la etapa 9 — la coherencia del arco y la biblioteca antigua:
> el hallazgo dejó de avanzar por *leer mucho* y ahora avanza por *hacer*.
> se añadió `memoria.hitos` (arco, despego, sonda, mensaje, muestra, contacto,
> omega), `marcarHito()`, `objetivoDeArco()` y `poolHaciaHito()` (gravedad
> narrativa); `faseDeHallazgo()` sólo sirve fases *ganadas* con hechos —para
> leer «la nave halla la sonda» hay que haber despegado y hallado la sonda,
> que sólo existe en `NAVEGABLES` (nunca en tierra)—. la cadena es una
> dependencia real: triangular → despegar → espectro → sonda → mensaje →
> muestra → responde → contacto → fusión → Ω. `cajaNegraAjena` se bifurca:
> núcleo de la sonda (con mensaje) o caja sin manifiesto de Tarabá (promesa
> vacía). el mapa y la plataforma muestran el rumbo del arco, sin puntajes.
> además, casi todos los estratos del corpus recibieron injertos de literatura
> antigua y de viaje interestelar transformados, no citados: Eneida (Palinuro,
> el suelo prometido que retrocede, las dos puertas del sueño, la rama dorada),
> Odisea (sirenas, la caja de los vientos, la tela de Penélope, el perro, nadie),
> Ilíada (el escudo grabado, el catálogo de las naves que callan), Píndaro,
> Églogas, el Libro de los Muertos (el peso del corazón, la barca de las doce
> horas, la confesión negativa), Dead astronauts, Ovni 78, Ciudades invisibles.
> verificado en navegador (playwright): el invariante del arco, la cadena de
> hitos, el despegue por la UI, la persistencia en localStorage, el layout
> móvil y una partida de 80 pasos sin errores de JS.
> cicatriz de la etapa 10 — legibilidad y viaje por semilla (feedback del
> lector: "a veces es muy difícil de leer" + "¿recordaremos por cada seed?"):
> (1) la memoria pasó a ser POR SEMILLA — `memoria.viajes[semilla]` (arco,
> ciclos, crashes, deterioro, cicatrices, contaminadas, etc.), `usarViaje()`,
> y sólo `memoria.museo` es global (crashes de todas las lecturas). la memoria
> vieja migra: lo acumulado al museo, el viaje limpio. así una semilla nueva
> despierta la nave entera y legible (antes el deterioro global de ciclo 8
> machacaba hasta el arranque). (2) el deterioro del texto se umbralizó:
> `intensidadDeterioro()` ~0 con la nave entera; los caracteres raros
> (`glifarPalabra`, la "estática") sólo con deterioro alto; las opciones-mando
> quedan legibles casi siempre. (3) la plataforma se despejó: abre con
> `[despegar]` y `[analizar la misión]` (escena `analizarMision` con
> `CORPUS.sobreLaObra` + la bitácora de hitos ✓/·); el resto se pliega dentro.
> verificado en navegador (27 asserts): arranque legible, menú, invariante del
> arco, per-seed (semillas no se heredan), degradación por umbral, migración
> v3→v4, partida de 80 pasos sin errores de JS.
> pendiente aún: audio de fondo sembrado, contaminación que se propaga entre
> palabras vecinas, lector fantasma, edición impresa (tecla P), rutas secretas
> nuevas (astillero a los 7 ciclos, cuarta pared a los 10 crashes, diccionario
> herido a las 100 puertas), la ruta-constelación que relee cada escena como la
> recuerda la nave, y un selector/galería de viajes por semilla (ver los seeds
> jugados y su avance). convendría también completar `fonts/` (faltan los CRT
> Ac437, las lineales A/B, el egipcio, el anatolio y unifont) —hoy degradan a
> fuentes de sistema.

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
