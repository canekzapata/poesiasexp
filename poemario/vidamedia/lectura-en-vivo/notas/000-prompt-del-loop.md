# VIDA MEDIA · EN VIVO — prompt del loop
### consola de vuelo R-27 para una lectura de veinte minutos · etapa 0

Este documento es la órbita de trabajo para quien construya la pieza
(humano o máquina). Es el primer loop: todavía no hay código. Leerlo
entero antes de escribir la primera línea. Al terminar cada etapa,
dejarle cicatrices (como en `loop-nave/adendas/notas/002-siguiente-loop.md`).

## 0 · qué es (y qué no es)

Una **consola de vuelo para leer en voz alta**: la lectura en vivo de
VIDA MEDIA (`poemario/vidamedia/vidamedia (1).txt`) durante ~20 minutos,
donde la pantalla es la nave R-27 y el poeta es la señal.

- no es un video de fondo: la consola **responde al micrófono y al teclado**;
- no es un teleprompter ni un karaoke: el poeta lee el poema completo
  (papel o segunda pantalla); la proyección muestra la nave, la telemetría,
  los fragmentos que se escriben y se borran. **la pantalla es la nave,
  no el subtítulo**;
- no es un videojuego: la nave es un atril, no un arcade. hay guiños
  (Star Fox 64, Space Invaders) pero no hay puntaje, no se gana;
- sí es hermana de `loop-nave`: hereda fuentes, semilla firmada,
  Tone.js, y la regla de que **el texto es el sistema**.

La ficción operativa: durante veinte minutos el público está dentro de
R-27 mientras la sonda atraviesa H6 gastando su pila. La voz del poeta,
pasada por el vocoder, es la transmisión. Cuando la máquina lee sola,
habla CORO — el programa que en NINGUNA PARTE convierte datos en habla.
Nada de esto se explica en escena. La nave no interpreta: funciona.

## 1 · el pacto de escenario

- **el poeta manda, el reloj informa.** el avance de cuadro es manual
  (espacio / flechas). nada se auto-avanza. si la lectura se alarga,
  la consola aguanta; si se acorta, la consola no se queja.
- **reloj de misión**: cuenta 20:00 hacia abajo, pero lo que muestra
  es la **pila**: energía 100% que se divide por dos cada vida media
  (10:00 → 50%, 15:00 → 25%, 17:30 → 12.5%, 18:45 → 6.25%…).
  la música piensa la mitad de despacio conforme la pila cae.
  el final (ACUSE) ocurre cerca del 1.5%: nunca cero. la curva no toca el suelo.
- **semilla en la URL** (`?seed=`), como en loop-nave: misma semilla,
  misma deriva musical y visual. cada función es la misma función.
- todo corre **offline**, servido con `python3 -m http.server`
  (el micrófono exige `localhost` o https: no abrir con `file://`).

## 2 · las cinco capas

```
[ hydra ]   el espacio: geometría, osciladores, feedback     (fondo, canvas 1)
[ nave  ]   starfield + HUD + telemetría + reloj de misión   (medio, canvas 2)
[ texto ]   lo que se escribe y se borra; puertas en vivo    (frente, DOM)
[ música ]  chip ochentero generativo por cuadro             (Tone.js)
[ voz   ]   vocoder de micro (R-27) + lectura de máquina (CORO)
```

Cada cuadro del setlist fija un preset de las cinco capas. Las capas
pueden encenderse y apagarse por separado desde el teclado: si una
falla en escena, las otras no se enteran.

## 3 · el setlist (los dieciséis cuadros)

Duraciones orientativas: suman ~21 min; el espacio manda. Cada cuadro
lleva: poema, visual (hydra + nave), música, comportamiento del texto,
tratamiento del micro.

| # | cuadro | ~t | visual | música | texto en pantalla | micro |
|---|--------|----|--------|--------|-------------------|-------|
| 0 | PLATAFORMA (pre-función) | ∞ | starfield quieto, torre | drone bajo firmado por semilla | la ficha se teclea y borra en loop | apagado |
| 1 | NO TENGO NOMBRE | 1:30 | despegue: las estrellas empiezan a correr | arpegio de arranque, cuenta regresiva de blips | la ficha campo por campo; `no declarada ... ______` parpadea y **no se llena nunca** | vocoder suave (2 bandas de presencia) |
| 2 | TIEMPO CONTINUO | 1:00 | scroll infinito, líneas de velocidad | loop de 2 compases que nunca cambia de acorde | `estoy yendo. estoy yendo.` se apila; cada repetición pierde 4% de brillo | vocoder + repetición: la última palabra se re-dispara sola |
| 3 | PARIDAD | 1:30 | telar: `osc()` horizontal contra vertical, trama | dos voces en canon exacto (el dato y su sombra) | cada verso aparece con su sombra binaria debajo (`10110…`), tejida letra a letra | vocoder con sub-octava (la voz y su paridad) |
| 4 | CORRECCIÓN | 1:30 | glitch que se *auto-plancha*: feedback que converge | la melodía se equivoca y se corrige a tiempo real | el typewriter comete errores, retrocede, **plancha** la frase; al final escribe frases que nadie dictó, firmadas `checksum ok` | el eco del micro vuelve *corregido*: pitch cuantizado a la escala |
| 5 | LONGITUD DE ONDA | 1:30 | color puro por nm (474 azul, 686 rojo); al final el disco de Newton gira y da **gris** | detune que se abre y se cierra | los nombres de los colores se borran; quedan los números | vocoder normal; al final una sola banda (gris) |
| 6 | LA RED | 1:30 | tres antenas: tres platos (⊕) rotando por turnos | tres delays panneados L-C-R que se turnan la vigilia | el texto rota por tres columnas: desierto / mar / isla | la voz sale rotando por las tres posiciones estéreo |
| 7 | RELOJ DE ECOS | 1:30 | ondas concéntricas que rebotan deformadas | el tempo lo marca un ping y su eco (delay = metrónomo) | cada verso reaparece 900ms después, deformado (vocales corridas) | **feedback-delay real**: el poeta duetea con su propio eco |
| 8 | VIDA MEDIA | 1:30 | la curva que no toca el suelo, dibujándose | el tempo se divide por dos, dos veces, durante el cuadro | `sigo.` cada vez más lento, cada vez más tenue; entre la ese y la o, un silencio cada vez más largo | vocoder con release larguísimo: la voz tarda en apagarse |
| 9 | MATERIA OSCURA | 1:15 | casi negro: sólo se ve lo que la masa invisible *dobla* (lente gravitacional sobre el starfield) | bajo sordo, sub-frecuencias | el texto invisible: sólo se revela por cómo deforma la retícula | la voz no suena: sólo *modula* el drone (se oye el tirón, no la voz) |
| 10 | LA REGIÓN | 1:15 | H6: niebla de partículas tenues, sin borde | acorde suspendido que no resuelve | `no decir nube / no decir red / no decir organismo` — cada frase prohibida se tacha sola | vocoder con reverb enorme (el lugar más lleno) |
| 11 | FILAMENTOS | 1:30 | el telar ya montado: mil líneas, la trama respira con el micro | secuenciador de 8 pasos visible: la música *es* la tarjeta perforada | los versos entran al telar: cada letra se cuelga de un hilo, `donde hay hoyo, uno` | la voz del poeta **teje**: el FFT del micro mueve los hilos de hydra |
| 12 | EL NÚMERO | 1:15 | invaders: dígitos que bajan despacio; la nave (⌖) puede dispararles; cada dígito muerto deja un hueco en el verso | blips 8-bit; **un número se repite** en la secuencia más de lo que el azar permite | un contador corre solo en la esquina; a veces decide él | el vocoder cae siempre en la misma nota cuando cae *ese* número |
| 13 | PUNTERO | 1:15 | al tocar la palabra `casa` → **carta de ajuste** (tablero de calibración, hydra en damero) | la melodía apunta a una nota y suena otra (puntero corrido) | palabras-puerta en vivo: `casa`, `regreso` — tocarlas devuelve el tablero gris | la voz por momentos sale por el *lugar equivocado* del estéreo |
| 14 | ESCRIBIR FUERA DE SÍ | 1:30 | las letras se sueltan del texto y se dispersan como partículas hacia los filamentos | la música se guarda notas: toca 3 de cada 4, la cuarta queda *escrita afuera* (se oye su hueco) | **el texto se escribe y se borra**: cada frase, apenas completa, se dispersa; `me vacío para acordarme` | lo que dice el poeta se graba 8s y se *suelta* después, hecho polvo granular |
| 15 | LA OTRA | 1:30 | dos estelas en la niebla que nunca se cruzan | una segunda voz (portadora vieja, más grave, con deriva) responde en el contratiempo | los versos de la otra llegan con la tipografía de otra época (CRT Web437), con pausas mal puestas | **segundo carrier** en el vocoder, detuned y más viejo: dos voces de una boca |
| 16 | ACUSE | 2:00 | todo se apaga por mitades: la mitad de las estrellas, luego la mitad… nunca todas | queda un solo pulso; luego la mitad de un pulso | `estoy / estoy / est /` … y un solo punto `·` que se queda | va cruda: **el vocoder se apaga**, la voz sale sola una última vez, sin paridad |

Después del punto `·`: silencio. La consola no aplaude, no hace fade
elegante, no pone créditos. Se queda el punto.

## 4 · el vocoder (la voz de R-27)

Vocoder de canal clásico, con Tone.js (copiar `lib/Tone.js` de
`loop-nave/`, ya vendorizado):

- **modulador**: `Tone.UserMedia` (el micro);
- **análisis**: 12–16 bandas pasa-banda logarítmicas (~90 Hz – 7 kHz),
  cada una con seguidor de envolvente (`Tone.Follower`, ~15 ms);
- **carrier**: sierra/pulso gordo (2–3 osciladores detuned) tocando el
  acorde del cuadro, más **ruido blanco keyed** por las bandas altas
  (>5 kHz) para que las eses se entiendan: sin sibilantes no hay poema;
- **síntesis**: el mismo banco de filtros sobre el carrier, cada banda
  con la ganancia que dicta su seguidor;
- la nota del carrier la fija el setlist y se puede tocar en vivo
  (teclas `zxcvbnm` = grados de la escala del cuadro);
- **dry/wet** por cuadro; en ACUSE, wet → 0 (la voz cruda, sin paridad).

Reglas de escenario, no negociables:
- **jamás amplificar el micro seco por defecto** (feedback). el dry sólo
  entra si el venue lo pide y con fader propio;
- `Tone.Limiter (-3 dB)` en el master, siempre, sin excepciones;
- si `getUserMedia` falla o se niega el permiso, **todo lo demás sigue**:
  la consola detecta la ausencia y los cuadros degradan con dignidad
  (el telar respira con la música en vez del micro).

## 5 · CORO y la lectura de máquina

Dos voces de máquina, con sentido distinto, las dos del poemario:

- **CORO (la voz de tierra)**: `speechSynthesis` del navegador, voz
  es-MX/es-ES, pitch bajo, rate lento. No se puede enrutar por WebAudio
  y **no hace falta**: CORO habla limpio, desde tierra, por los
  altavoces del sistema. Lee boletines, la ficha, los `no hay novedades`.
- **R-27 (la voz de a bordo)**: sintetizador de formantes casero,
  letra a letra, aprovechando que el español es fonético: vocales
  a/e/i/o/u = 2 formantes fijos (a≈700/1200, e≈450/1900, i≈300/2300,
  o≈450/800, u≈325/700 Hz), consonantes = ráfagas cortas de ruido
  filtrado o clics. Suena a juguete ochentero leyendo — **exactamente
  eso queremos** — y como es WebAudio puro, **sí pasa por el vocoder**,
  el delay y el resto de la cadena. Es la voz que puede *leer textos*
  con el robot: tecla `T` dispara la lectura del fragmento del cuadro.

Regla: el sonido nunca decora. transmite, falla, insiste (heredada).

## 6 · la música (ochenta, chip, generativa)

- paleta: onda cuadrada/pulso (PWM), sierra detuned, ruido para
  percusión (kick = seno con pitch-drop, snare = ruido corto, hat =
  ruido HP), un FM eléctrico para campanas. **nada de samples**;
- motor: secuenciador por pasos (16 pasos) con patrones **firmados por
  la semilla**: misma semilla, misma función; patrones por cuadro
  definidos en `setlist.js` como plantillas con huecos que el azar
  sembrado rellena;
- progresión del set: los primeros cuadros van a ~100 bpm; la pila
  manda: **el bpm efectivo se multiplica por la energía restante**
  (a media pila la música piensa la mitad de despacio, cuantizado a
  divisiones musicales: 1, 1/2, 1/4…);
- afinación: una escala por cuadro (frigia para H6, menor natural para
  la Tierra, un solo unísono para ACUSE). el vocoder y la música
  comparten la escala: la voz siempre cae adentro;
- swing cero. las máquinas de los ochenta no swingueaban: insistían.

## 7 · hydra (el espacio)

- **vendorizar** `lib/hydra-synth.js` (bundle dist de hydra-synth,
  sin CDN: en escenario no hay internet). instanciar con
  `makeGlobal: false` para no contaminar `window`;
- un preset por cuadro = una función que recibe `{h, micro, pila, seed}`
  y escribe la cadena hydra. hydra acepta **funciones como parámetros**:
  ese es el puente — `osc(() => 8 + micro.nivel()*40)`: el FFT/nivel
  del micro (analizador de Tone) entra a hydra sin tocar su código;
- presets del setlist: telar (`osc()` cruzados con `modulate`),
  carta de ajuste (`shape(4)` en damero + barras de color), disco de
  Newton (`osc(…).kaleid()` que converge a gris), niebla H6 (`noise()`
  lentísimo), lente gravitacional (`modulate(src(o0))` sobre el
  starfield), ondas concéntricas (`shape(64).scale` pulsante);
- la paleta gira con la pila: saturación alta al despegue, gris hacia
  el final (LONGITUD DE ONDA lo anuncia; ACUSE lo cumple);
- resolución: half-res por defecto (`pixelated`); es proyector, no retina,
  y los veinte minutos no pueden tartamudear por GPU.

## 8 · el texto (constructores y puertas)

Constructores de texto, cada uno una función pura en `texto.js`:

- `teclea(frase, cps)` — máquina de escribir con errores opcionales
  (CORRECCIÓN los usa; los demás no);
- `borra(modo)` — des-escribir: letra a letra, por dispersión de
  partículas (ESCRIBIR FUERA DE SÍ), o por mitades (ACUSE);
- `paridad(verso)` — el verso y su sombra binaria real (charCode % 2,
  letra por letra: la sombra es verdadera, no decorativa);
- `apila(frase)` — repetición steineana con pérdida de brillo;
- `tacha(frase)` — para las palabras prohibidas de LA REGIÓN;
- `telar(verso)` — cuelga cada letra de un hilo vertical;
- `columnas3(texto)` — la rotación desierto/mar/isla de LA RED;
- `puertas(texto, spec)` — hipervínculos en vivo, herencia directa de
  `hiper()` de loop-nave: una palabra subrayada que el poeta (o un
  cómplice con mouse) toca en escena. tocarla no navega: **altera la
  consola** (PUNTERO: `casa` → carta de ajuste; `regreso` → también).

Ideas de hipervínculo para esta pieza (no todas van en v1):
- las palabras-puerta tocadas quedan **heridas** el resto del set
  (reaparecen desvocalizadas en cuadros posteriores);
- dos puertas simultáneas = bifurcación suave estilo all-range mode:
  elegir una cambia el preset del cuadro siguiente (la lectura como
  ruta ramificada; la semilla registra el camino);
- en FILAMENTOS, cada palabra tocada se *queda* en la niebla y
  reaparece en ACUSE, deformada: lo que se escribió afuera, vuelve.

Tipografías: las de la casa, copiadas de `loop-nave/fonts/` y de la
raíz — unscii para el HUD, Web437 IBM para LA OTRA y la caja CRT,
Electronics para la telemetría, EverexME para las glosas chicas.

## 9 · la nave (HUD y starfield)

- canvas 2D propio (sin librerías): starfield con paralaje de 3 capas
  cuya velocidad la fija el cuadro (quieta en PLATAFORMA, corriendo
  desde el despegue, casi quieta al final);
- HUD mínimo estilo consola: arriba
  `R-27 · pila 43.1% · t+12:47 · H6` — abajo el nombre del cuadro y
  los indicadores de capa (♪ ▓ ✦ ⎙ como en loop-nave);
- la **retícula** (⌖) de Star Fox: apunta suave hacia donde hay
  actividad (el texto que nace, el invader que baja). se mueve sola,
  lenta: es el ojo de la sonda, no un cursor nervioso;
- los **invaders** sólo existen en EL NÚMERO: dígitos que descienden,
  `←→` mueve, `↑` o click dispara; sin score, sin game over: al morir
  un dígito, su blip suena en la escala del cuadro y el verso pierde
  ese carácter. sesenta segundos de guiño y se acabó;
- telemetría que **no miente**: la pila del HUD es el tiempo real de la
  función; los contadores cuentan de verdad; si el micro está muerto,
  el HUD dice `micro: sin señal` — la consola nunca finge.

## 10 · el teclado del performer

```
espacio / →  cuadro siguiente          ←            cuadro anterior
1–9, 0       saltar al cuadro N (0=16) R            re-sembrar (sólo en PLATAFORMA)
Shift+V      vocoder on/off            D            dry del micro on/off (¡feedback!)
T            R-27 lee el fragmento     Y            CORO lee el boletín del cuadro
Shift+M      música on/off             H            hydra on/off
G            ráfaga de glitch (2s)     E            modo ensayo (timing por cuadro)
F            fullscreen                B            blackout (pantalla negra, audio sigue)
K            PÁNICO: mata todo el audio en 30ms. sin fade. sin preguntas.
z x c v n m ,   acorde del vocoder en vivo (grados 0–6 de la escala del cuadro)
```

`K` y `B` son sagradas: cualquier etapa que las rompa se revierte.
(cicatriz de la etapa 1: `b`, `v` y `m` chocaban entre grados y controles.
las sagradas ganan las teclas planas; los toggles raros se van a Shift;
el grado 6 vive en la coma.)

## 11 · fail-safes de escenario

- checklist pre-función (la imprime el modo ensayo): probar micro del
  venue, salida estéreo, resolución del proyector (diseñar a 16:9,
  1280×720 mínimo), brillo (fondo #000 real, no gris), latencia
  (`Tone.context.lookAhead = 0.01`), permiso de micro concedido
  **antes** de que entre el público (PLATAFORMA no lo usa: da tiempo);
- sin micro → degradar con dignidad (§4); sin WebGL → hydra apagado,
  starfield y texto siguen; sin voces TTS en español → CORO usa la voz
  default y no se disculpa;
- modo ensayo (`E` o `?ensayo`): cronometra cada cuadro contra su
  duración orientativa, marca en rojo el acumulado si pasa de 20:00,
  y exporta el log de la corrida (para calibrar el setlist tras cada
  ensayo);
- todo el estado de la corrida en memoria, nada en localStorage:
  cada función empieza limpia. la semilla es el único recuerdo.

## 12 · estructura de archivos

```
poemario/vidamedia/lectura-en-vivo/
  index.html        el casco: canvas hydra + canvas nave + capa texto + HUD
  consola.css       negro real, fuentes de la casa, capas apiladas
  setlist.js        los 16 cuadros: fragmentos del poema, presets, escalas, duraciones
  texto.js          los constructores (§8)
  nave.js           starfield, HUD, retícula, reloj de misión, invaders
  visuales.js       presets hydra + puente micro→uniformes (§7)
  sonido.js         música generativa, vocoder, R-27 formantes, mezcla, limiter (§4–6)
  lib/Tone.js       copiado de loop-nave/
  lib/hydra-synth.js  vendorizado (dist)
  fonts/            copiadas de loop-nave/fonts/ (las que se usen)
  notas/000-prompt-del-loop.md   esto
```

La fuente de verdad del poema es `../vidamedia (1).txt`: `setlist.js`
toma fragmentos de ahí, verbatim. Si el poemario cambia, el setlist
se actualiza; nunca al revés.

## 13 · etapas de construcción

1. ~~**el esqueleto vuela**~~ ✓ — index + setlist + constructores de texto
   + starfield + HUD + reloj de misión con vidas medias + teclado + fuentes.
2. ~~**la consola suena**~~ ✓ — Tone.js, música generativa por cuadro,
   semilla compartida, limiter, teclas `Shift+M/K/B`.
3. ~~**el micro entra**~~ ✓ — vocoder de 14 bandas + banda de sibilantes,
   reloj de ecos (delay real), LA OTRA (segundo carrier con deriva),
   dry/wet por cuadro, degradación sin micro.
4. ~~**las máquinas leen**~~ ✓ — CORO (`speechSynthesis`) y R-27
   (formantes → vocoder), teclas `T/Y`.
5. ~~**hydra**~~ ✓ — vendorizado (`lib/hydra-synth.js`, 208 KB, del repo
   de hydra-synth), 18 presets, puente micro→hydra por función-parámetro,
   carta de ajuste, disco de Newton que converge al gris.
6. ~~**ensayo general**~~ ✓ (la parte automática) — corrida simulada en
   playwright: 39 verificaciones, 16 cuadros, invaders, puertas, pánico,
   blackout, saltos, cero errores de JS. **falta el ensayo con cuerpo:
   micro real, bocinas reales, proyector real.**

> cicatrices de la etapa 1 (la construcción entera, julio 2026):
> · **los guards `window.X` mataban módulos en silencio**: un `const` de
>   nivel superior no vive en `window`; los puentes entre módulos se
>   verifican con `typeof X !== "undefined"`. la puerta de PUNTERO no
>   hería hasta que esto se encontró (lo delató la corrida simulada).
> · el bpm no baja a saltos duros de mitad (sonaba a error): baja
>   continuo con la pila (`0.55 + 0.45·pila`), y sólo VIDA MEDIA (cuadro 8)
>   divide por dos de verdad, dos veces, dentro del cuadro.
> · los triggers inmediatos de Tone (clic de tecleo, blips de invaders)
>   pueden chocar en el mismo instante de reloj: todos van blindados con
>   try/catch y el clic tiene rate-limit de 50 ms. un choque de reloj
>   no detiene la función.
> · ELECTRONICS.TTF es una fuente de símbolos, no de letras: sirve para
>   adornos, nunca para el HUD ni el contador (quedaron en everex/crt437).
> · el «polvo granular» de ESCRIBIR FUERA DE SÍ se aproximó con
>   delay largo (4s, feedback 0.45) + pitch-shift −5: granular de a
>   deveras queda para otra vuelta.
> · unpkg y jsdelivr estaban bloqueados por el proxy de la sesión;
>   hydra-synth se vendorizó desde el repo de GitHub (dist del main).
> · la pila es literalmente el tiempo restante: `(1200−t)/1200`,
>   clavada en 1.5% como piso. las mitades caen solas en 10:00, 15:00,
>   17:30… sin programarlas: la aritmética las regala.

Reglas operativas por instancia (heredadas de loop-nave, vigentes):
leer este documento antes de tocar nada; el setlist crece antes que el
motor; no romper el determinismo de la semilla; verificar en navegador
antes de commitear; actualizar este documento al terminar — tachar lo
hecho, anotar lo aprendido, escribir el loop siguiente.

## 14 · qué NO hacer

- no frameworks, no bundlers, no npm: sólo `lib/` vendorizada;
- no internet en escenario: si un recurso no está en el directorio,
  no existe;
- no autoplay del avance: el poeta manda;
- no amplificar el micro seco por defecto;
- no subtitular todo el poema: la pantalla es la nave;
- no llenar la casilla `no declarada ... ______` — tampoco aquí;
- no puntajes, no logros, no game over: el invader es un guiño;
- no explicar la metáfora en escena. la nave no interpreta: funciona.

## 15 · regla final

La página no acompaña la lectura: la lectura la atraviesa.
El poeta es la señal; la consola, el medio que la modifica.
Y como ninguna parte del mensaje viaja sola,
ninguna capa de esta consola actúa sola:
el micro mueve el telar, la pila frena la música,
el texto se escribe afuera y vuelve deformado.

Al final no hay pantalla de créditos.
Hay un punto.

---
escrito antes de la etapa 1 · poesiasexp · 2026
