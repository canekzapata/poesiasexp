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
- **entrada**: filtro pasa-altas a 82 Hz, compresión 3:1 y puerta lenta
  calibrable según el ruido de la sala;
- **análisis**: 18 bandas pasa-banda logarítmicas (95 Hz – 7.2 kHz),
  cada una con seguidor de envolvente (`Tone.Follower`, ~15 ms);
- **carrier**: sierra/pulso gordo (2–3 osciladores detuned) tocando el
  acorde del cuadro, más **ruido blanco keyed** por las bandas altas
  (>5 kHz) para que las eses se entiendan: sin sibilantes no hay poema;
- **consonantes**: dos bancos de ruido, uno para fricción media
  (`f/j/ch`) y otro para aire alto (`s/z`);
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
Shift+A      calibración vocoder       Esc          cerrar calibración
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
  rendimiento.js    vigía de fluidez: afloja las visuales antes que el audio
  sonido-nucleo.js  contexto, cachés de nota, helpers de parámetro, medidores
  sonido-musica.js  instrumentos + las 17 piezas del setlist (§6)
  sonido-vocoder.js micro, banco de canales, portadoras, calibración (§4)
  sonido-r27.js     la voz de formantes (§5)
  sonido.js         la mesa: master, buses, efectos de voz, pánico
  granular-worklet.js  búfer circular + granos Hann de ESCRIBIR FUERA DE SÍ
  calibracion.js    prevuelo guiado del micro + exportación JSON
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
3. ~~**el micro entra**~~ ✓ — vocoder de 18 bandas + dos bancos de consonantes,
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
> · ~~el «polvo granular» de ESCRIBIR FUERA DE SÍ se aproximó con
>   delay largo (4s, feedback 0.45) + pitch-shift −5: granular de a
>   deveras queda para otra vuelta.~~ cerrado en la vuelta 5.
> · unpkg y jsdelivr estaban bloqueados por el proxy de la sesión;
>   hydra-synth se vendorizó desde el repo de GitHub (dist del main).
> · la pila es literalmente el tiempo restante: `(1200−t)/1200`,
>   clavada en 1.5% como piso. las mitades caen solas en 10:00, 15:00,
>   17:30… sin programarlas: la aritmética las regala.

> cicatrices de la vuelta 2 — más compleja la música, más complejo el
> espacio (julio 2026, a pedido del poeta):
> · **la música dejó de vivir en la raíz**: progresiones de acordes por
>   cuadro (`triada()`, grados de la escala), un arpegiador de cuadrada
>   con bitcrusher, un pad de sierras gordas con chorus, y el **pump
>   ochentero**: `golpeKick()` agacha la mezcla entera en cada kick.
>   el filtro maestro (`musFilter`) abre y cierra como un iris en los
>   cuadros lentos.
> · cada música ganó dramaturgia propia: el canon de PARIDAD es ahora
>   de tres voces (la voz, su copia, y el retrógrado en el bajo — el
>   revés de la trama); el snare firma el checksum en CORRECCIÓN;
>   FILAMENTOS teje dos tarjetas perforadas entrelazadas y el hat
>   marca donde NO hay hoyo; en LA RED la melodía y el arpegio rotan
>   el estéreo en turnos opuestos.
> · **la memoria vuelve rota**: TIEMPO CONTINUO guarda su riff
>   (`motivoGuardado`) y ACUSE lo devuelve a media velocidad, perdiendo
>   la mitad de las notas, apenas audible bajo el pulso.
> · hydra ganó tres puentes de audio nuevos: `SONIDO.grave()` y
>   `SONIDO.agudo()` (dos medidores con filtros sobre el micro: la voz
>   grave dobla, las eses dispersan) y `SONIDO.beat()` (el golpe del
>   kick decayendo, para que la luz pulse con la banda).
> · los presets envejecen por dentro (t0 local): el glitch de
>   CORRECCIÓN se plancha por vidas medias, la niebla de LA REGIÓN se
>   densifica, las estelas de LA OTRA se separan, ACUSE baja por
>   escalones. la carta de ajuste ganó sus barras de color.
> · **lección de feedback**: `add(src(o0))` acumula hasta lavar la
>   pantalla a blanco; para estelas persistentes usar `blend(src(o0))`
>   —promedia y se acota solo— o `add` con oscurecimiento fuerte.
> · pendiente de esta vuelta: el ensayo con cuerpo sigue faltando, y
>   las mezclas (volúmenes relativos de arp/pad/banda) se calibran con
>   bocinas reales, no con capturas.

> cicatrices de la vuelta 3 — el auto-vuelo y la bifurcación:
> · **auto-vuelo** (`?auto` / tecla `A`): la consola avanza sola con
>   las duraciones del setlist; la nave lee sola (R-27, a veces por
>   cuadro, siempre en ACUSE); tras el punto final, vuelve a la torre,
>   reinicia la corrida (pila, heridas, filamentos, rumbo) y despega
>   otra vez — la pieza funciona como instalación desatendida, la
>   herencia directa del «lector fantasma» de loop-nave. cualquier
>   tecla de navegación imprime «el poeta retoma el mando» y lo apaga.
> · `?turbo=N` divide las duraciones: una corrida completa de 20 min
>   se ensaya (y se testea) en uno. con turbo, la nave no lee en voz
>   alta: leer rápido no es leer.
> · **la bifurcación** (idea sembrada en §8): en LA REGIÓN las palabras
>   prohibidas quedan tocables como residuo de sus tachaduras
>   (`nube · red · organismo`); tocar una fija `ESTADO.rumbo` y los
>   FILAMENTOS siguientes se ven y se suenan con ese parecido: nube =
>   hilos ahogados en niebla y trama floja con pad; red = rejilla
>   rígida y tarjeta apretada con hat duro. organismo no es puerta:
>   hay parecidos que ni tocándolos.
> · verificado: suite nueva de auto-vuelo y bifurcación (11 asserts)
>   + regresión completa (39 asserts), cero errores de JS.
> · lección del test: probar la bifurcación con el auto encendido y
>   turbo alto es probar humo — la nave se va de la región antes de
>   que las tachas pinten las puertas. primero el mando, luego el dedo.

> cicatrices de la vuelta 4 — el espacio gana profundidad:
> · hydra dejó de recibir el audio crudo: nivel, graves, agudos y beat
>   se leen una vez por frame y llegan suavizados. los golpes todavía
>   cortan, pero la voz hace respirar la imagen en vez de sacudirla.
> · cada preset tiene ahora una fase derivada de `semilla + cuadro`.
>   se añadieron segundos y terceros estratos, moiré diagonal, órbitas,
>   lóbulos de antena, espectros, memoria y velocidades que no coinciden.
>   `G` sigue siendo caos, pero incluso su caos tiene una firma.
> · el canvas pasó de 240 a 320 estrellas con temperatura, centelleo y
>   estelas por profundidad. la instrumentación ya no es un marco
>   repetido: PARIDAD muestra pares; LA RED escucha por tres estaciones;
>   H6 arma 34 nodos y cambia entre niebla, red y polvo; LA OTRA sostiene
>   dos trayectorias que se separan sin cruzarse; ACUSE divide el campo.
> · la retícula ganó arcos de nivel/graves y coordenadas hexadecimales.
>   sigue siendo el ojo lento de la sonda: el audio cambia su abertura,
>   no la convierte en cursor nervioso.
> · la complejidad conserva media resolución por defecto. `?hq` la sube
>   a 72% sólo para una GPU ya ensayada; riqueza no debe significar una
>   función que tartamudea.
> · verificación de esta vuelta: sintaxis limpia; 18 presets ejecutados
>   contra una cadena hydra instrumentada (68 parámetros dinámicos);
>   17 cuadros recorridos sobre canvas simulado (14,990 operaciones),
>   sin excepciones. sigue pendiente mirar y calibrar esta vuelta en
>   navegador, bocinas y proyector reales.

> cicatrices de la vuelta 5 — la memoria se vuelve grano:
> · `granular-worklet.js` mantiene un búfer circular estéreo de ocho
>   segundos fuera del hilo visual. genera hasta 48 granos simultáneos,
>   con lectura interpolada, ventanas Hann, pitch, deriva, paneo,
>   jitter y feedback moderado. no usa samples ni internet.
> · el búfer escucha siempre la salida del vocoder, pero no habla fuera
>   de ESCRIBIR FUERA DE SÍ. al entrar, devuelve fragmentos de unos
>   3.6 segundos atrás: lo que la voz acababa de considerar presente.
> · cada `borra("particulas")` congela 260 ms de memoria y dispara una
>   ráfaga más corta, densa, grave y abierta en estéreo. texto y audio
>   comparten ahora el mismo gesto de dispersión.
> · la semilla firma también el orden de los granos. `K` cierra su
>   densidad además del master y la recupera sólo si el cuadro granular
>   sigue activo. el limiter de −3 dB continúa siendo la última puerta.
> · sin AudioWorklet, la consola conserva automáticamente el antiguo
>   pitch-shift + feedback-delay: degradar con dignidad sigue siendo
>   más importante que presumir una función.
> · verificación aislada del procesador: 46,080 muestras sintéticas,
>   30,803 muestras de salida no nulas, energía finita y continuidad
>   después de callar la entrada. pendiente: nivel, densidad y feedback
>   se afinan con una voz, bocinas y sala reales.

> cicatrices de la vuelta 6 — la sala entra al vocoder:
> · la entrada ganó pasa-altas a 82 Hz, compresión 3:1 y una puerta
>   lenta. el micro seco continúa por defecto en cero; la mejora de
>   inteligibilidad no cambia la regla de feedback.
> · el banco creció de 14 a 18 bandas logarítmicas entre 95 Hz y
>   7.2 kHz. cada banda conserva su medidor y su compensación limitada:
>   la calibración puede ayudarla, nunca volver plana una voz.
> · las consonantes se dividieron en dos materias: fricción media para
>   `f/j/ch` y aire alto para `s/z`. ambas usan ruido blanco modulado
>   por la voz y pueden calibrarse por separado.
> · `?calibra` / `Shift+A` abre un prevuelo de cuatro estaciones:
>   silencio, voz real de lectura, vocales largas y sibilantes. muestra
>   entrada cruda, entrada procesada, vocoder, salida y las 18 bandas.
> · la medición calcula ruido de sala, pico robusto, margen señal/ruido,
>   gain, umbral y compensaciones suaves. exporta sólo números en
>   `calibracion-vocoder-SEMILLA.json`: nunca graba ni conserva audio.
> · durante el prevuelo la música baja y el vocoder se deja oír; al
>   cerrar, cada cuadro recupera su wet original. `Esc`, `K`, `B` y `F`
>   siguen disponibles; navegación y números se bloquean para que una
>   barra de espacio no mande la sonda al siguiente cuadro.
> · verificación de cálculo con sala sintética: ruido −44.4 dB, margen
>   31 dB, gain propuesto 2.49×, 18 compensaciones y dos sibilantes
>   dentro de límites. pendiente: correr el JSON con el micrófono,
>   interfaz, bocinas y sala que usarán la pieza.

> cicatrices de la vuelta 7 — el contexto deja de fingir:
> · el granulador ya no entrega el wrapper de Tone al constructor
>   global de `AudioWorkletNode`. carga y crea el nodo por las fábricas
>   del contexto de Tone, que resuelven el `BaseAudioContext` nativo y
>   deduplican el módulo `r27-granular`.
> · LA REGIÓN cambió `Freeverb` por una convolución larga. conserva la
>   cola espacial, pero deja de registrar varias veces el procesador
>   interno `feedback-comb-filter` de Tone 14.7.40.
> · el botón de arranque quedó bajo cerrojo: `Enter` y el `click` que
>   produce el mismo Enter ya no pueden construir dos grafos de audio
>   simultáneos ni registrar dos veces un worklet.
> · un fallo de audio ya no detiene el viaje: el texto, la nave y Hydra
>   siguen navegables mientras la consola deja el error en diagnóstico.
> · la calibración rechaza una voz que quede debajo del ruido o no logre
>   6 dB de margen. el JSON `bj0d` lo hizo visible: −58.9 dB de voz
>   contra −50.3 dB de sala no era una calibración; era una entrada
>   equivocada o una fase sin voz. ahora esos números se exportan, pero
>   no se aplican al vocoder.
> · todos los cuadros esperan siete segundos antes de ejecutar su
>   primer gesto textual. la nave, Hydra y el sonido reciben ese espacio
>   de entrada; `?turbo=N` comprime también la espera para los ensayos.

> cicatrices de la vuelta 8 — el audio recupera prioridad:
> · `T` normaliza una vez el texto y agenda R-27 por tramos cortos. una
>   lectura nueva cancela también frecuencias, formantes y Q pendientes;
>   el autorepeat ya no puede amontonar voces ni reconstruir la música.
> · las 18 bandas del vocoder se conservan, pero su calibración comparte
>   un solo FFT en vez de veinte medidores. NAVE e Hydra comparten además
>   una lectura de sensores a 30 Hz. tres puertas raíz silencian el banco
>   cuando no se usa sin reconstruir decenas de conexiones WebAudio.
> · el prevuelo toma una sola muestra cada 50 ms para medir y pintar. bajo
>   su cubierta la nave se congela y Hydra baja temporalmente a 12 fps.
> · el granulador lee sus parámetros k-rate una vez por bloque, compacta
>   los granos sin crear arreglos y reutiliza los objetos terminados. su
>   contador se acorta al subir density: ya no hereda pausas de cinco
>   segundos. el fallback conserva memoria con un delay liviano y sólo
>   crea el pitch pesado cuando ESCRIBIR FUERA DE SÍ lo necesita.
> · `Shift+M` silencia ahora también drones y colas, no sólo el Transport;
>   los gestos de audio intentan reanudar un contexto suspendido. cada
>   cuadro restablece también el volumen del kick y la afinación temporal.
> · la portada ganó un mapa de teclas con `I`. recuerda audífonos y
>   `Shift+A`; PLATAFORMA mantiene el aviso hasta una calibración válida.
>   la medición exige señal útil en voz, vocales, aire y espectro antes de
>   aplicar compensaciones.
> · Corrección de operación: el propio calibrador también libera `Shift+A`
>   para poder cerrarlo; antes conservaba por error la excepción de `Shift+C`
>   y dejaba la música atenuada y la navegación bloqueada.
> · La voz pasa por un protector propio antes de mezclarse con la música;
>   eco y reverb tienen retornos con fundido corto al cambiar de cuadro.
>   así el vocoder ya no obliga al limiter final a bajar toda la base.

> cicatrices de la vuelta 9 — el audio deja de trabarse:
> · `sensores()` reasignaba una constante. la excepción saltaba treinta
>   veces por segundo dentro del bucle de dibujo: la nave dejaba de
>   pintarse después del primer cuadro, el puente de audio a Hydra moría
>   con su `requestAnimationFrame` y el hilo principal se iba en lanzar y
>   registrar errores. era la causa mayor del atoro, y no se veía porque
>   cada capa fallaba en silencio, como estaba diseñada para fallar.
> · `sonido.js` se repartió en cinco archivos —núcleo, música, vocoder,
>   R-27 y la mesa—. la mesa es otra vez una mesa: buses, efectos de voz
>   y pánico. nada más.
> · el ancho del vocoder es un parámetro de escenario, no un número
>   clavado: `?bandas=` entre 8 y 20, catorce por defecto. la Q y la
>   compensación de presencia se deducen del espaciado, así que ocho o
>   veinte canales cubren el mismo espectro sin agujeros ni chillido.
>   dieciocho siguen disponibles para una máquina que las aguante.
> · la convolución de LA REGIÓN sólo existe en LA REGIÓN. antes corría
>   los veinte minutos completos con el envío en cero: bajar una ganancia
>   no apaga un convolver, hay que soltarle la entrada.
> · `?latencia=` gobierna la anticipación del planificador de Tone; el
>   valor sube de 100 a 200 ms. no retrasa el micro ni el acorde en vivo
>   —esos caminos son nativos— pero le da al hilo principal el doble de
>   margen para llegar tarde sin que la música se corte.
> · el cielo se pinta por lotes de color y opacidad. antes eran
>   trescientas veinte llamadas a `stroke` y trescientas veinte cadenas
>   `rgba()` nuevas por cuadro: basura pura, sesenta veces por segundo.
>   las estrellas también renacen en su sitio, sin objetos nuevos.
> · MATERIA OSCURA leía el rectángulo de cada letra y le escribía el
>   transform en el mismo bucle: un recálculo de disposición por letra y
>   por cuadro. el sitio se mide una sola vez.
> · el granulador tabula la ventana Hann y tiene camino corto: dieciséis
>   de los diecisiete cuadros no piden granos y aun así el búfer debe
>   seguir recordando. ahora eso casi no cuesta.
> · `rendimiento.js` vigila la fluidez y afloja las visuales antes de que
>   el sonido lo pague: menos estrellas, Hydra más lenta y más chica. Mide
>   contra el ritmo propio de la pantalla —un proyector a treinta hercios
>   no está ahogado, sólo va a treinta— y no vuelve a subir la calidad si
>   ya tuvo que bajarla dos veces al mismo nivel. `?ligero` lo fija desde
>   el arranque. el HUD lo dice, porque el HUD nunca miente.

> cicatrices de la vuelta 10 — medir en vez de suponer:
> · un perfil de CPU dijo que el hilo principal estaba 39% ocioso y el JS
>   de la consola no llegaba al 2%. El atoro no estaba ahí. Contar los
>   nodos del grafo fue lo que lo encontró: 1513 vivos al arrancar y
>   ~600 nacidos por segundo.
> · `Tone.Filter` cuesta QUINCE nodos nativos —catorce son el cableado de
>   parámetros automatizables que en el banco nunca se automatizan—
>   contra uno de un BiquadFilter nativo. Con dos filtros por banda, el
>   vocoder se llevaba treinta y seis nodos por canal. Ahora ocho.
>   Dieciocho bandas pesan hoy menos que ocho la semana pasada, así que
>   dieciocho vuelven a ser el default: el timbre original, más barato.
> · el mismo tratamiento a los filtros que nunca se mueven (los dos taps
>   de medición, el paso alto del micro, el del hat) y un techo de ocho
>   voces al pad, que traía treinta y dos. 1513 → 1041 nodos.
> · la rotación de nodos por nota (~600/s) es cómo funciona Tone: cada
>   `triggerAttack` reconstruye osciladores y fuentes. No se toca. Queda
>   anotado para quien vuelva a medir y crea haber encontrado algo.
> · el reloj de audio contra el reloj de pared da la medida honesta de un
>   corte: el reloj de audio sólo avanza con las muestras que de verdad
>   se rindieron. Un atoro del hilo principal no ensucia la cuenta —los
>   dos relojes llegan tarde por igual—, así que ahí sólo aparecen los
>   cortes reales. Ahora manda sobre el vigía de fluidez: un corte pesa
>   más que cualquier medida de cuadros, porque es el síntoma que se vino
>   a curar y no un indicio de él.
> · `Q` cierra el micro en veinticinco milisegundos, con o sin Shift
>   —cuando hay acople no se piensa en modificadores—. La puerta va antes
>   de la ganancia de calibración, así que cerrarla no discute con lo
>   medido, y R-27 entra al vocoder por otro lado: sigue hablando con la
>   boca tapada. Vive también dentro de la calibración: una medición
>   nunca vale más que poder callar un acople.
> · el prevuelo es ahora una ventana completa **antes** de todo, y la
>   pieza ya no corre debajo mientras se mide. Trae las voces para
>   probarlas de verdad (R-27, CORO y la mezcla entera, que es como va a
>   sonar), el estado del micro y un renglón de salud que dice si esta
>   máquina va a aguantar. La función arranca cuando el poeta pulsa
>   `[ comenzar la función → ]`, no cuando carga la página.
> · las cuatro estaciones pasaron de 17 s a unos 40, con un respiro de
>   dos segundos y medio antes de cada una: medir a alguien que todavía
>   está entendiendo qué le piden es medir su titubeo.
> · `?directo` salta el prevuelo. `?auto` y `?turbo` lo saltan solos:
>   instalación desatendida y ensayo comprimido no tienen a quién
>   preguntarle.

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
