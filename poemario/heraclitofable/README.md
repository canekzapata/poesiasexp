# Heráclito Fable · πάντα ῥεῖ

Instrumento audiovisual en vivo (~20 min) sobre **Heráclito + CCRU + tecnochamanismo**.
No es un video: es algo que se **toca**.

Abre `index.html` en el navegador (Chrome/Firefox), pulsa **F** para pantalla completa,
click o cualquier tecla para abrir el río.

## La tesis (la mecánica *es* la filosofía)

- **Lo ilegible fluye** — *clusters palimpsesto*: 4+ glifos de escrituras distintas
  (árabe, CJK, devanagari, tamil, cirílico, diacríticos…) impresos casi encima para
  que sus trazos **choquen** y formen glifos imposibles. A veces gigantes (πάντα ῥεῖ).
- **Lo que estallas se vuelve legible** — πόλεμος: la tensión es padre de todo.
  Cada estallido con texto libera un fragmento a una *isla legible*.
- **Lo enorme habla** — cuando un texto llena la pantalla, el vocoder-oráculo
  lo canaliza en español (glosolalia técnica).
- El **futuro invade el presente**: los caracteres no caen, *avanzan hacia ti* (CCRU).

## Dramaturgia · 5 movimientos que tú pilotas

| Tecla | Movimiento | Estado |
|---|---|---|
| **1** | I · LOGOS | el río frío: glifos ilegibles, drone bajo. Deja fluir 1–2 min. |
| **2** | II · PÓLEMOS | la guerra: llegan textos, los estallas, nace sentido. |
| **3** | III · HIPERSTICIÓN | más rápido/grande, CCRU + Eshun, la máquina despierta. |
| **4** | IV · GLOSOLALIA | trance: textos enormes, el oráculo habla en lenguas. |
| **5** | V · CENIZA | colapso en cascada y retorno al río. |

La escalada la haces **tú**: si el público responde, aprietas; si quieres respirar, fluyes.

## El instrumento (controles)

| | |
|---|---|
| **click** | estallar un invasor |
| **1–5** | saltar de movimiento |
| **espacio** | ráfaga de invasores |
| **↑ ↓** | intensidad (velocidad + densidad) |
| **V** | **oráculo**: lee en voz alta algo que esté *ahora* en pantalla |
| **B** | invoca un texto enorme (que hablará al estallarlo) |
| **Enter** | trance instantáneo (glosolalia) |
| **C** | limpiar islas · **M** mute · **F** pantalla completa · **H** leyenda |

## Curar la pieza

- **Fragmentos**: edita `corpus.js`. Cada movimiento bebe de su propio pozo
  (`logos`, `polemos`, `hipersticion`, `glosolalia`, `ceniza`) + los `glyphs` ilegibles.
- **Sonido / dramaturgia**: `motor.js` — array `MOVES` (tasa de aparición, velocidad,
  drone, sesgo glifo/texto/enorme) y el objeto `Audio` (drone, estallido, voz-máquina).
- **Voz**: usa `speechSynthesis` en español. La calidad depende de las voces del sistema
  (en Chrome suele haber es-MX/es-ES). Ajusta `rate`/`pitch` en `Voice.speak`.

## Sonido (en vivo)

Todo por Web Audio API, sin samples: un **pad afinado a una escala distinta por
movimiento** (Logos = quintas abiertas; Pólemos = menor tenso; Hiperstición =
inestable; Glosolalia = suspendido; Ceniza = oscuro), sub para peso, el río
(ruido filtrado), un **pulso generativo** de campanas cuya densidad y tempo suben
con la intensidad, estallidos-campana afinados, y voz-máquina de formantes.
Hay un **compresor/limitador** de seguridad y un bus de espacio (delay con
realimentación) en la salida. La intensidad (↑↓) mueve filtro, tempo y volumen.

## Nota técnica

Autocontenido, sin dependencias externas. Audio vía Web Audio API.
Fuentes bitmap en `fonts/` para el texto legible (los `.TTF` de la raíz del repo
están corruptos; usé copias válidas). Los glifos palimpsesto usan las **fuentes
del sistema** (stack Noto/Unicode) para cubrir tantas escrituras como sea posible:
en el equipo donde presentes, verifica que tenga fuentes CJK/árabe/índicas
instaladas, o empaqueta Noto en `fonts/` (ver `futuro/TODO.md`).
Prueba el sonido en la sala **antes** — el navegador exige un gesto del usuario
para arrancar el audio (ya resuelto en el velo de entrada).

## Futuro

`futuro/TODO.md` — roadmap (gamificación: combos, glifo-jefe, palimpsesto que se
acumula, MIDI, mic reactivo). `futuro/mas-texto.js` — banco de fragmentos por
curar para crecer el corpus.
