# FASE 1 · AUDITORÍA

*el clave bien teñido · qué se hereda del repositorio, qué se retira, qué se construye*

---

## 1 · Lo que ya existe en la casa y se reutiliza tal cual

| origen | qué es | cómo entra aquí |
| --- | --- | --- |
| `ninguna-prueba-viaja-sola/js/seed.js` | `xmur3` + `mulberry32`, un generador por canal (`seed :: canal`) | copiado íntegro a `js/rng.js`. Se le quita el único `Math.random()` que quedaba (estaba en `nueva()`, para acuñar semillas nuevas) y se sustituye por `crypto.getRandomValues`, para que el grep de la prueba 2 dé cero en toda la carpeta |
| `ninguna-prueba-viaja-sola/js/espectro.js` | el patrón entero: un modelo que corre con la bocina apagada, expediente con `causa`/`genealogía`/`clase de memoria`, migración defensiva de `localStorage`, `medidas()` y `linea()` para el canal textual | es el molde de `js/color.js` y `js/contrapunto.js`. Se hereda la disciplina, no el código: aquí el expediente es cromático y las clases de memoria son cinco (`verdadero · degradado · inferido · inventado · contradictorio`) |
| `ninguna-prueba-viaja-sola/js/sound.js` | topes (`MAX_VOCES 16`, `MAX_RUIDO 3`, `MAX_COLA 48`), dos planos (`campo`/`canto`), compresor + tope de ganancia, `nivel()` con RMS y pico en dBFS, apagado que desconecta todo | `js/red.js` los hereda uno por uno, más el tope nuevo `≤8 nodos Faust`. La sonda de nivel se conserva sin cambios: es el único instrumento honesto que tengo |
| `ninguna-prueba-viaja-sola/LOOP_STATE.md` | «no puedo oír, pero sí puedo medir». El accidente del peine con `Q` por defecto: `0.88 × pico > 1`, +7 dB/s hasta reventar | ley aquí: `Q ≤ 0.5` en cualquier paso-bajos dentro de un lazo, realimentación `≤ 0.64`, y una prueba que mide el nivel del render offline en vez de suponerlo |
| `aisentencesondigitalart/8/tone.js` | **Tone.js 14.8.49** — la única copia de esa versión en el repo (`lands/Tone.js` y `poemario/loop-nave/Tone.js` son 14.7.40) | copiada a `js/Tone.js` con `Tone.js.LICENSE.txt` y `Tone-LICENSE.md` (tomados de `otrorio/vendor/`). Sin CDN, sin npm |
| `aisentencesondigitalart/8/index (16).html` | `Tone.start()` tras gesto, `Tone.Limiter`, `Tone.Gain`, `Tone.now()` | la forma de arrancar de `js/tiempo.js` |
| `ninguna-prueba-viaja-sola/tests/pruebas.mjs` | pruebas de navegador con Playwright: consola limpia, determinismo por semilla, móvil, movimiento reducido | `tests/audio.mjs` copia la estructura (`ok(...)`, `fallos`, salida legible) y le añade `Tone.Offline`, conteo de nodos y sonda de nivel |
| raíz `prompt.md`, `README.md`, `otrorio/css/base.css` | `.poem-window`, `.window-bar`, `.window-close`, `.window-residue`, `.iframe-cell`, `resize: both`, `mix-blend-mode: difference` | **queda anotado para la fase visual**, que es el trabajo siguiente. El campo de pantallas hereda ese CSS en vez de inventar una ventana nueva |

## 2 · Lo que existe y se retira

| origen | por qué no entra |
| --- | --- |
| `paisajes/motor.js` — `MODOS` (`caos`, `mono`, `analogo`, `complemento`, `triada`) y `hsl()` | es color generativo **por familia armónica**, decidido con `rand()` sobre HSL. Aquí el matiz no se elige por familia: se deriva por operación bachiana sobre un color existente, y el espacio de verdad es OKLCH. Los `MODOS` se superan, no se ignoran: `complemento` sobrevive convertido en la **inversión sobre el eje de la semilla** (§4), que no siempre es el opuesto, y `triada` sobrevive como el **triángulo monocromático** de la regla de choque 4 |
| `estratos/estratos.js` — semilla tipo fxhash | misma idea que `seed.js` pero acoplada a esa pieza; `seed.js` ya es la versión limpia |
| `Tone.Sampler`, `Tone.Player`, `Tone.Pattern`, utilidades de azar de Tone | §7C las prohíbe. No hay samples y la librería no compone |
| Strudel, RNBO, WebChucK | §7 los descarta del núcleo. Ninguno se instala |

## 3 · Lo que se construye nuevo

| archivo | capa | qué hace |
| --- | --- | --- |
| `js/rng.js` | JS puro | azar firmado por semilla y canal |
| `js/nombres.js` | JS puro | las 75 procedencias de *The Secret Lives of Color* con anclas en OKLCH; nombrar un color es buscar el vecino más cercano en OKLab |
| `js/color.js` | JS puro | OKLCH ↔ OKLab ↔ sRGB, `Δ` (ΔEok), `ΔH`, mezcla aditiva / sustractiva / de diferencia, gama, contraste WCAG calculado, simulación de deuteranopía y protanopía, los dos temperamentos con su residuo medido |
| `js/contrapunto.js` | JS puro | el organismo: voces-pantalla, criba, razones de tempo por área, las siete operaciones, la tabla de choque, presupuesto de croma, invariantes, los cinco movimientos, hábitos del visitante |
| `js/tiempo.js` | Tone.js | `Transport` + un `Tone.Loop` por voz con **intervalo en segundos** (la notación `"4n"` mata a Nancarrow), `Tone.Draw` para lo visual, `Tone.Offline` para la prueba sin oídos |
| `js/red.js` | Web Audio | grafo, dos planos, limitador, analizador, sonda de nivel, topes contados, `dispose()` real |
| `js/cuerpo.js` | puente | elige el peldaño de degradación y construye el cuerpo de cada voz: nodo Faust si el `.wasm` cargó, osciladores + ruido filtrado si no |
| `dsp/cuerpo.dsp` + `dsp/cuerpo.wasm` | Faust/WASM | 32 parciales con gemelo desafinado, dos espectros y su interpolación, estiramiento, desviación en cents, croma como cruce parciales↔ruido, congelado |
| `worklets/cuerpo.js` | AudioWorklet | anfitrión del `.wasm` de Faust: 130 líneas de ABI explícita en vez de 700 KB de runtime de terceros |
| `tests/modelo.mjs` | prueba | determinismo, irreversibilidad, paralelas, criba, presupuesto, temperamento, accesibilidad cromática. Corre en Node, sin navegador y sin audio |
| `tests/audio.mjs` | prueba | Playwright: consola limpia, `Tone.Offline` reproducible, nivel medido, topes de nodos, apagado sin fantasmas, los cuatro peldaños |

## 4 · Capa por capa: qué hace la herramienta y qué me toca a mí

Esta es la parte de la auditoría que evita confundir una librería con una composición.

| capa | lo que la herramienta hace por mí | **lo que tengo que escribir a mano** |
| --- | --- | --- |
| **JS puro** | nada. No hay librería de color perceptual ni de contrapunto | todo: las conversiones OKLab (Ottosson), la métrica ΔEok, el ángulo corto de matiz, las dos reglas de mezcla, el mapeo de gama por bisección, el contraste WCAG, las matrices de dicromacia, el expediente, la genealogía, el presupuesto |
| **Tone.js** | reloj de audio con anticipación, `Transport`, `Loop`, `Draw`, `Offline`, rampas programadas contra el reloj del audio | **la criba** (Tone cuenta pulsos; qué pulso *existe* lo decide la unión de clases residuales), **las razones irracionales** (un `Loop` por voz con intervalo en segundos calculado por mí; Tone no sabe de `21:24:25`), **el punto de convergencia** del canon de tempo, **el desfase** de Reich, **los cents** de Carrillo, y decidir *cuándo* una mutación es musicalmente coherente |
| **Faust** | el DSP: banco de osciladores de tabla, interpolación, filtros, compilación a WASM con parámetros nombrados | **la elección de qué parámetros existen** (si un parámetro no tiene equivalente en el expediente cromático, no debe existir), el mapeo matiz→Hz, croma→ruido, gradiente→amplitudes de banda, y el hecho de que Faust **no decide nada**: recibe valores |
| **Web Audio** | nodos, enrutamiento, `AnalyserNode`, `DynamicsCompressor` | los topes, los dos planos, el `dispose()` completo, el `Q ≤ 0.5`, la sonda en dBFS, y no conectar jamás una voz a `destination` |
| **AudioWorklet** | hilo de audio propio, `process()` a 128 muestras | el ABI de Faust a mano: reservar memoria, colocar el struct del DSP en 0, los buffers después de `size`, resolver las importaciones de `env.*`, leer las direcciones de los parámetros de `cuerpo.meta.json`, y registrar el módulo **una sola vez por contexto** |

## 5 · Comprobaciones del entorno

| pregunta | respuesta medida |
| --- | --- |
| ¿hay compilador Faust? | **sí**: `@grame/faustwasm` compila `.dsp → .wasm` en Node, sin red, Faust 2.86.2. Se compila **en el taller** y se versiona el binario; la pieza no compila nada al abrirse |
| ¿el `.wasm` carga por HTTP? | sí, con `Content-Type: application/wasm` o vía `WebAssembly.instantiate(await (await fetch(...)).arrayBuffer())`, que es lo que uso: no depende del MIME que sirva el servidor |
| ¿y por `file://`? | **no**: `fetch()` sobre `file://` da `Failed to fetch`, y `addModule()` de un worklet local también falla por CORS. Por eso el **peldaño 2 tiene que existir de verdad** — abrir la pieza con doble clic es un caso real, no hipotético — y por eso `index.html` dice, sobrio, que servida por HTTP suena con más cuerpo |
| ¿Tone 14.8.49 en el repo? | sí, `aisentencesondigitalart/8/tone.js`. Las otras dos copias son 14.7.40; el prompt las daba por equivalentes y no lo son |
| ¿Playwright? | sí, global, con Chromium en `/opt/pw-browsers`. `tests/audio.mjs` lo usa sin descargar nada |

## 6 · Decisiones que esta auditoría deja cerradas

1. **OKLCH es el estado; el hex es salida.** Ninguna estructura guarda hex.
2. **Un solo `AudioContext`**: el de Tone (`Tone.getContext().rawContext`). Faust, el worklet, el analizador y el limitador cuelgan de ése.
3. **El worklet es anfitrión, no autor.** El DSP lo escribe Faust; el worklet sólo le da un hilo y le pasa parámetros. Escribo el ABI a mano en vez de versionar el runtime de `faustwasm` porque 130 líneas legibles envejecen mejor que 700 KB minificados, y esta pieza tiene que seguir siendo modificable dentro de diez años.
4. **La fase visual va después.** Este documento y el código que lo acompaña cierran el trabajo musical: color, contrapunto, tiempo, red y cuerpo. El campo de pantallas —que es donde el CSS de `.poem-window` entra— se construye sobre este modelo **sin tocarlo**, porque el modelo ya expone las pantallas como rectángulos con área, posición y gradiente. Si el campo tuviera que cambiar el modelo, el modelo estaría mal.
