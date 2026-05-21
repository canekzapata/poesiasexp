# circuito.live — v7

Pieza generativa de poesía experimental: un canvas a pantalla completa que
dibuja **diagramas de circuitos en ASCII** mezclados con **citas, glosas,
fórmulas y tickers** poéticos. El conjunto funciona como un instrumento de VJ
con escenas, tempo y sonido. Vive en `botcircuitos/7/` dentro del repositorio
`poesiasexp`.

## Archivos

| Archivo      | Qué es                                                                 |
|--------------|------------------------------------------------------------------------|
| `index.html` | La pieza completa: HTML + CSS + un único `<script>` con todo el motor.  |
| `tone.js`    | Tone.js 14.8.49, build UMD vendorizado (349 KB). **No editar.**         |
| `README.md`  | Este archivo.                                                          |

Las tipografías CP437 se cargan desde `../../aisentencesondigitalart/` (12
fuentes `.ttf`). Si esa carpeta no está al lado, las fuentes degradan a
`Courier New`.

## Cómo correrlo

Es estático, pero usa `@font-face` y carga `tone.js` por ruta relativa, así que
necesita un servidor (no `file://`):

```
cd botcircuitos/7
python3 -m http.server 8000
# abrir http://localhost:8000/index.html
```

No hay build, ni dependencias de npm, ni CDNs (la red del entorno los bloquea —
por eso Tone.js está vendorizado).

## Arquitectura (todo dentro del `<script>` de `index.html`)

El flujo de datos va en una dirección y está dividido en secciones rotuladas
con cabeceras `// ====`:

1. **POOLS** (línea ~52) — Todo el contenido textual: adjetivos, unidades,
   tipos de componente, fuentes, cargas, tickers, citas, glosas, fórmulas,
   kaomojis, epochs, pings. **Para agregar contenido se editan estos arrays —
   el motor no se toca.**
2. **GENERATOR** (~436) — Funciones puras que combinan pools en fragmentos.
   `FRAGMENTS` es un array de ~40 funciones, cada una devuelve un bloque de
   texto ASCII (un diagrama distinto: divisor de tensión, ADSR, cadena
   VCO→VCF→VCA, secuenciador de 16 pasos, grid de batería, LFO, vocoder, etc.).
3. **CANVAS + FONTS** (~961) — `TYPEFACES` (12 fuentes), `applyTypeface()`,
   medición y `resize()`.
4. **BLOCK** (~1023) — La unidad de display: texto + posición + vida +
   fade-in/out. Todo lo visible es un `Block` en el array `blocks`.
5. **ESCENAS** (~1105) — `SCENES`: 9 escenas (`terminal`, `mosaico`, `glitch`,
   `drone`, `cita`, `ticker`, `feedback`, `memoria`, `burst`). Cada una define
   ritmos de aparición, densidad, glitch, paleta y fuentes.
6. **AUDIO** (~1198) — Motor de sonido, ver abajo.
7. **SPAWNERS** (~1418) — Crean `Block`s concretos y disparan su sonido.
8. **SCHEDULER + LOOP** (~1584) — `tickScheduler` decide qué aparece según la
   escena; `loop` es el `requestAnimationFrame` con `update`/`render`.
9. **VJ CONTROLS** (~1677) — Teclado.
10. **ARRANQUE** (~1701) — `startScene('terminal')` + primer frame.

## Sistema de audio

Tres capas, todas opcionales y conmutables en vivo:

- **Bleeps / pings** — Synths de Tone.js. Los diagramas disparan bleeps cortos;
  las citas/glosas un ping suave. `audioDiagram()` / `audioCita()`.
- **Voz híbrida (vocoder)** — Las citas se leen en voz alta con la **Web Speech
  API** (`speechSynthesis`, pitch grave ~0.3–0.65 para timbre robótico).
  Debajo, un banco de filtros formantes de Tone.js (3 bandpass a 320/1100/2700
  Hz sobre una sierra) pulsa con `onboundary` → textura de vocoder.
  `speak()`, `vocoderStart/Pulse/Stop()`.
- **Percusión** — `Tone.Transport` + `Tone.Sequence` de 16 pasos. Patrones por
  escena en `PERC_PATTERNS` (`patBeats('x...x...')`). Instrumentos:
  `MembraneSynth` (kick), `NoiseSynth` (hi-hat y zap), `MetalSynth` (rim). El
  BPM sigue al control de tempo vía `percBpm()` / `syncPercTempo()`.

El audio **no arranca solo** (política de autoplay del navegador):
`initAudio()` se llama en el primer `keydown`/`click`. Es idempotente.

## Controles (teclado / VJ)

| Tecla   | Acción                                  |
|---------|-----------------------------------------|
| `SPACE` | drop (fragmento grande manual)          |
| `1`–`9` | saltar a escena                         |
| `+` `-` | tempo (también ajusta BPM de percusión) |
| `M`     | pausa                                   |
| `R`     | reset (limpia `blocks`)                 |
| `F`     | floaters                                |
| `S`     | sonido on/off                           |
| `P`     | percusión on/off                        |
| `T`     | ciclar tipografía CP437                 |

Click en el canvas = `initAudio()` + drop.

## Cómo extender (lo más común)

- **Más texto poético** → agregar strings a los arrays de `POOLS`. Cero cambios
  de motor.
- **Un diagrama nuevo** → agregar una función al array `FRAGMENTS` que devuelva
  un string ASCII multilínea.
- **Una escena nueva** → agregar una entrada a `SCENES` y un patrón homónimo a
  `PERC_PATTERNS`. La tecla numérica se asigna sola por orden de `SCENE_LIST`.
- **Otra fuente** → agregar `@font-face` en el `<style>` y el nombre a
  `TYPEFACES`.

Convención: el contenido es data en pools/arrays; el motor es genérico. Si para
agregar contenido hay que tocar el motor, probablemente falta un pool.

## Estado / pendientes

- v7 está completo y commiteado localmente: commits `49965b3` (motor de audio +
  voz) y `fb02a6c` (percusión, fuentes CP437, contenido nuevo).
- **Push pendiente** a `claude/add-tone-circuit-sounds-7eSKF`: tanto el proxy
  git como la integración GitHub MCP devuelven 403 (sin permiso de escritura).
  Se necesita push manual con credenciales del usuario, o habilitar escritura
  en la integración.
- En `main`, `tone.js` figura como placeholder de 1 byte; el archivo real
  (349 KB) solo existe en los commits sin pushear / entregados al usuario.
- Limitación conocida: no hay vocoder "real" de la salida de TTS — los
  navegadores no exponen el audio de `speechSynthesis` para reprocesarlo. La
  capa formante de Tone.js es una aproximación que corre en paralelo.
