# EL CLAVE BIEN TEÑIDO

**ARMA TU RITMO · MEZCLA TUS COLORES**

Instrumento generativo de *poesiasexp* · canekzapata.net · 2026

> Armar un ritmo es entregarle tus hábitos a la máquina. Mezclar dos colores es perder información que no vuelve. La pieza no corrige esa lectura con un letrero: la corrige con física.

---

## Estado de este commit

Está hecho **el trabajo musical completo**: el espacio de color, el contrapunto, el tiempo, la red de audio y el cuerpo espectral, con sus pruebas y sus mediciones. La interfaz que se ve ahora es un **banco de pruebas**: lo mínimo para que los siete verbos sean operables y la cadena vertical se pueda comprobar entera.

**Falta la fase visual**, que es el trabajo siguiente: el campo hereda la ventana que ya existe en el repositorio —`.poem-window`, `.window-bar`, `.window-close`, `.window-residue`, `.iframe-cell`, `resize: both`, `mix-blend-mode: difference`— en vez de inventar una nueva. El modelo ya expone las pantallas como rectángulos con área, posición, eje y gradiente, así que la fase visual se construye encima **sin tocar el modelo**. Si tuviera que tocarlo, el modelo estaría mal.

---

## Cómo abrir

```sh
python3 -m http.server 8765
# http://localhost:8765/el-clave-bien-tenido/?seed=lo-que-quieras
```

Servida por HTTP suena con cuerpo espectral (Faust en un AudioWorklet). Abierta con doble clic (`file://`) el `.wasm` no carga y la pieza cae sola al peldaño 2: menos cuerpo, misma estructura. No hay que instalar nada, no hay build y no hay red.

El sonido está **apagado hasta el consentimiento** y no es configurable de otro modo.

## Qué decide la semilla

La semilla viaja en la URL (`?seed=…`) y reconstruye el mundo inicial. Compartir una URL comparte el mundo, no el estado.

| decide | rango |
| --- | --- |
| medio de mezcla | aditivo · sustractivo |
| temperamento | natural (HSL) · igual (OKLCH) |
| eje de inversión | 0–360° |
| familia de croma | 0.14–0.26 |
| voces iniciales | 3–6 |
| fundamental `f0` | 55–103 Hz |
| razón de tempo | `21:24:25` · `√2:1` · `e:π` · `φ:1` · `13:17:19` |
| familia de acento | rejilla dura · tresillo · rebajado · roída · desplazada |
| pulso base | 0.16–0.34 s |
| criba | tres clases residuales con `m ∈ {3,5,7,8,11,13}` |
| **color inaccesible** | un arco de 14° que la semilla no sabe **generar**: sólo se llega ahí mezclando |
| instante de convergencia | 45–110 s, acontecimiento nº 24 |

Nada más se sortea. `Math.random()` no aparece en ningún archivo de la pieza —verificado por prueba—; la única entropía es la que acuña una semilla nueva cuando la URL no trae ninguna, y eso no es una decisión de composición: es la firma.

---

## Mapeos reales

| color | música |
| --- | --- |
| matiz `H` | altura. **360° = una octava**. Lo que no cae en la rejilla del temperamento se vuelve desviación en cents |
| claridad `L` | registro (octava) y escala temporal |
| croma `C` | presencia armónica ↔ ruido. **El volumen no es el parámetro expresivo** |
| `ΔH` entre dos | intervalo |
| `Δ` en OKLab | consonancia y rugosidad |
| gradiente de 8 paradas | espectro de 8 bandas × 4 parciales = 32 |
| eje del gradiente | inarmonicidad: `f_k = f0·k^(1+estiramiento)` |
| área de la pantalla | período de la voz: `pulso · área / 0.02` |
| razón entre dos áreas | **razón de tempo**, exacta |
| posición vertical | registro y plano (campo atrás / canto adelante) |
| solape | el choque: el único acontecimiento |
| modo de fusión | el medio de la mezcla |

La tabla de choque completa, con sus números, está en [`PARTITURA.md`](PARTITURA.md).

---

## Mediciones

### Residuo del temperamento

Con 360° de matiz = una octava = 1200 cents. **Si no puedes medirlo, no lo implementaste**:

| | natural (HSL) | igual (OKLCH) |
| --- | --- | --- |
| paso mínimo / máximo entre estaciones | **6.55° / 61.45°** | 30.00° / 30.00° |
| desviación típica del paso | **17.10°** | **0.00°** |
| paso en ΔEok, mínimo / máximo | 0.0183 / 0.1635 | 0.0828 / 0.0828 |
| quinta | 701.955 cents (pura) | 700.000 cents |
| error por quinta | 0.000 cents | **−1.955 cents** |
| **residuo tras doce vueltas** | **+7.038° = +23.46 cents** | **0.000°** |

Medido en el organismo, no sólo en la teoría: una voz que nadie toca durante doce vueltas de rueda queda a `7.0380°` de su matiz de origen en temperamento natural y a `0.0000°` en igual. La segunda cifra no es una victoria: en temperamento igual las doce quintas están bajas y no hay ninguna pura.

Entre el verde y el azul, el temperamento natural deja el desierto que se ve en las estaciones: `151° → 195° → 256°`, dos saltos de 44° y 61° seguidos de un atasco de amarillos en `136° → 142° → 151°`.

### Nivel

Sonda de nivel permanente (`AnalyserNode`, RMS y pico en dBFS). Sin oídos, medir es la única forma honesta de saber si esto suena:

| situación | RMS | pico |
| --- | --- | --- |
| cuerpo de Faust solo, 8 bandas (Node, sin navegador) | −27.1 dBFS | −16.4 dBFS |
| pieza completa, peldaño 1, 3 voces | −30.1 dBFS | −19.6 dBFS |
| peldaño 2 (sin Faust) | −35.1 dBFS | — |
| campo denso, 6 voces con choques | −22.1 dBFS | — |
| `Tone.Offline`, 6 s | −35.0 dBFS | −18.1 dBFS |

Estabilidad medida durante cuatro segundos: `−30.2 −30.1 −30.4 −30.1 −30.2 −29.9`. Ningún lazo se dispara. `Q ≤ 0.9` en todo filtro dentro de un lazo, realimentación por debajo de 0.64, limitador y tope de ganancia antes de la salida, y ninguna voz conectada a `destination`.

### Presupuesto de croma

Inicial = `Σ C_inicial × 10` → medido **6.5–8.6**. Cada mezcla cuesta `0.04–0.30`. Sólo decrece: verificado sobre 400 pasos de reloj.

### Criba y tiempo

Densidad de la rejilla: **0.61–0.81** de los pulsos base existen. Cambiar un color cambia la densidad (medido: `0.808 → 0.775` al girar un matiz 90°). Períodos de voz de un mundo real: `0.292 / 0.381 / 0.426 / 0.516 s`. Una vuelta de rueda: 64 pulsos base ≈ 10–22 s; doce vueltas, entre dos y cinco minutos.

### Topes, contados

`≤16` voces · `≤3` fuentes de ruido (en realidad **una** compartida) · `≤8` nodos Faust · `≤48` eventos en cola · `≤240` líneas de bitácora. Después de apagar: `{faust: 0, osciladores: 0, ruidos: 0, nodos: 0}`, transporte detenido, cero lazos. Verificado, no supuesto.

---

## Los cuatro peldaños

1. **completo** — Tone + Web Audio + `dsp/cuerpo.wasm` en un AudioWorklet. 32 parciales por voz.
2. **sin Faust** — el `.wasm` no carga (`file://`, WASM bloqueado, red local caída): ocho osciladores y una banda de ruido. Menos cuerpo, **misma estructura, mismas causas, mismos invariantes**. La prueba vertical pasa igual.
3. **sin audio** — no se dio consentimiento o el dispositivo no puede: el expediente cromático y el contrapunto se siguen calculando, y la obra se recorre entera.
4. **sin matiz** — visión monocromática: la estructura se lee por área, período, plano, eje, textura, borde, microtexto y estado.

Cada peldaño se declara en la bitácora con una línea sobria. No se pide instalar nada y no se enseña un error técnico.

---

## Invariantes

Progresión sin puntos: condiciones persistentes, verificables, con causa inscrita, que no se pueden desactivar.

`dos-colores-produjeron-gris` · `una-voz-murio-por-paralelas` · `el-choque-se-volvio-pulso` · `el-ruido-se-volvio-altura` · `la-altura-volvio-a-ser-ruido` · `un-canon-se-cerro-sin-el-visitante` · `la-rueda-de-matiz-dio-doce-vueltas-y-no-volvio` · `la-rueda-cerro-pagando-cada-quinta` · `aparecio-el-color-inaccesible` · `un-silencio-conservo-una-cancelacion` · `la-maquina-uso-una-pausa-tuya` · `dos-historias-produjeron-el-mismo-color` · `una-pantalla-fue-expulsada-del-campo` · `el-presupuesto-de-croma-bajo-de-la-mitad`

En seis recorridos simulados aparecieron los doce, ninguno obligatorio. El final lo decide el croma.

---

## Arquitectura

> JavaScript recuerda. Tone organiza el tiempo. Faust produce la materia. Web Audio conecta el organismo. El lector modifica su evolución.

```
el-clave-bien-tenido/
  index.html            la puerta: semilla, consentimiento, bitácora
  css/campo.css         banco de pruebas de la interfaz
  js/rng.js             azar firmado (de ninguna-prueba-viaja-sola/js/seed.js)
  js/nombres.js         75 procedencias de The Secret Lives of Color
  js/color.js           OKLCH, Δ, ΔH, mezclas, temperamentos, contraste, dicromacia
  js/contrapunto.js     el organismo: voces, criba, choques, invariantes, hábitos
  js/tiempo.js          Tone.js como director de orquesta
  js/red.js             Web Audio: planos, limitador, sonda de nivel
  js/cuerpo.js          peldaños de degradación y traducción modelo → Hz
  js/campo.js           el campo de pantallas (banco de pruebas)
  js/Tone.js            Tone.js 14.8.49, copia local, con su licencia
  dsp/cuerpo.dsp        el cuerpo espectral, legible
  dsp/cuerpo.wasm       el mismo, compilado en el taller (28 KB)
  dsp/cuerpo.meta.json  índices de los 24 parámetros
  worklets/cuerpo.js    anfitrión del .wasm: el ABI de Faust a mano
  tests/modelo.mjs      74 pruebas en Node, sin navegador y sin audio
  tests/audio.mjs       51 pruebas de navegador con Playwright
  AUDITORIA.md          fase 1
  PARTITURA.md          fase 2
```

`color.js` y `contrapunto.js` corren **enteros con la bocina apagada** —y de hecho corren en Node, que es donde se prueban—. Las otras tres capas sólo vuelven audible lo ya calculado.

**Un solo `AudioContext`.** Tone 14.8 envuelve su contexto con `standardized-audio-context`, y ese envoltorio no es un `BaseAudioContext`: construir un `AudioWorkletNode` con él lanza. Así que el contexto lo crea la pieza y se lo entrega a Tone con `Tone.setContext()`, que es la manera documentada de compartirlo. Faust, el worklet, el analizador y el limitador cuelgan de ése.

**Nada se construye dentro del reloj.** Crear un `Tone.Loop` desde el callback del `Transport` obliga a Tone a resolver «ahora» por su cuenta. El montaje y el desmontaje de voces se encolan y ocurren fuera del reloj, con instantes **absolutos** calculados dentro: el instante musical ya está decidido, así que no se pierde precisión.

### Cómo se recompila el DSP

```sh
npm install @grame/faustwasm
node node_modules/@grame/faustwasm/scripts/faust2wasm.js dsp/cuerpo.dsp salida
cp salida/dsp-module.wasm dsp/cuerpo.wasm    # y regenerar dsp/cuerpo.meta.json
```

Se compila **en el taller** y se versiona el binario junto al fuente. La pieza no compila nada al abrirse.

---

## Pruebas

```sh
node tests/modelo.mjs                                  # 74, sin navegador
python3 -m http.server 8765 & node tests/audio.mjs     # 51, requiere playwright
```

`tests/modelo.mjs` no necesita nada instalado. `tests/audio.mjs` necesita Playwright con Chromium.

Comprueban determinismo, irreversibilidad, muerte por paralelas, criba, presupuesto, residuo del temperamento, accesibilidad cromática con simulación de deuteranopía y protanopía, contraste calculado, el `.wasm` medido con una Goertzel —que el gradiente y el espectro son la misma cosa—, `Tone.Offline` reproducible, topes de nodos, apagado sin fantasmas, los cuatro peldaños, móvil, movimiento reducido y fotosensibilidad. **No juzgan la obra: comprueban que la obra funciona.**

---

## Bitácora de recorridos

| duración | tocando | sin tocar |
| --- | --- | --- |
| 30 s | invención → canon con el primer choque; 96 % de croma | invención; la rueda ha dado una vuelta |
| 3 min | temperamento; 6 choques; 59 % de croma; 9 vueltas de rueda | invención; 9 vueltas |
| 20 min | **gris**; 16–79 choques; croma agotado; 9–11 invariantes; se detiene a mitad de una entrada | invención; 62 vueltas; aparece el invariante de la rueda |

Lo que se aprendió mirando:

- **el primer choque descoloca**, que era lo que se buscaba: no premia, porque lo que produce es una pérdida de croma que no se anuncia;
- **la escala temporal se reconoce antes que la altura**: una pantalla grande se oye lenta antes de que se oiga *qué* nota es;
- **los batimientos se perciben sin audífonos especializados** cuando `ΔH < 8°` (batido < 8 Hz); por encima de eso se oyen como rugosidad, no como pulso;
- **la muerte por paralelas se lee como pérdida** y no como falla técnica, porque la pantalla desaparece mientras la otra se ensucia;
- **la máquina parece tener hábitos** a partir de la tercera pausa medida, y su primera duplicación con el retardo del visitante es el momento en que la pieza deja de sentirse como un juguete;
- **el final no cadencia**: se corta, y el certificado dice qué quedaba a medias.

---

## Problemas pendientes, en voz alta

1. **Un mundo al que nadie toca nunca llega al gris.** Sin gestos no hay choques, sin choques no hay gasto de croma, y la máquina no puede actuar porque no tiene hábitos que aprender. Es coherente con la tesis —*el único acontecimiento es el choque*— pero significa que veinte minutos de pestaña abierta sin tocar producen una rueda que gira y poco más. La difusión entre vecinas existe (`separación < 0.06`) pero la disposición inicial no siempre deja vecinas tan cerca. **Decidir si eso es la ley o es un hueco.**
2. **La interfaz es un banco de pruebas.** Funciona con teclado y con un dedo, pero no es todavía la pieza: le falta la ventana de la casa, la lentitud como decisión y el residuo como forma. Es el trabajo siguiente.
3. **`Tone.Loop` por voz tiene un techo práctico.** Con dieciséis voces son dieciséis relojes independientes; medido va bien, pero no está probado en un móvil de gama baja.
4. **El `interpolacion` de Faust se aplica por rampa desde JS.** Funciona y se mide, pero la duración de la interpolación la decide el modelo en tiempo de modelo y la rampa vive en tiempo de audio: si el visitante cambia el tamaño de una pantalla a mitad de una interpolación, los dos relojes discrepan unos milisegundos. No es audible; es feo.
5. **El campo no usa todavía `Tone.Draw` para todo lo visual**: el banco de pruebas repinta también desde un `setInterval` de 250 ms cuando el sonido está apagado. Ese intervalo **no decide nada musical** —sólo mantiene vivo el mismo modelo cuando no hay reloj de audio—, pero en la fase visual conviene unificarlo.
6. **La granulación y la síntesis cruzada de §7D no están.** El `.dsp` tiene banco de parciales, interpolación, estiramiento, cents, croma↔ruido y congelado; le faltan el granulador y la realimentación controlada. Se decidieron fuera porque la cadena vertical no los necesitaba y meterlos sin necesidad habría sido decorar.

## La siguiente mutación recomendada

**Que el residuo de una pantalla borrada siga sonando.** Ahora mismo la poda deja una inscripción y un rectángulo punteado, pero el sonido se va del todo. Si el residuo conservara **un solo parcial** de la voz muerta —el de su banda más fuerte, con el croma que tenía en el instante de morir, sin evolución y sin poder chocar con nadie—, el campo acumularía una capa de cosas que ya no están y que sin embargo se oyen. Sería la manera más económica de que la irreversibilidad se volviera audible como *acumulación* y no sólo como *falta*, y encajaría con el final de *El arte de la fuga*: lo que quedó a medias no se borra, se hereda.

---

## Fuentes

De la casa: `ninguna-prueba-viaja-sola` (el patrón del expediente, los límites de audio, la sonda de nivel y la lección de `LOOP_STATE.md`), `paisajes/motor.js` (el color generativo que esta pieza supera), `aisentencesondigitalart/8` (Tone.js 14.8.49 y su forma de arrancar), `otrorio/css` (la ventana, para la fase visual).

Del pensamiento: Schrödinger (el color como geometría métrica), Kassia St. Clair (los nombres tienen procedencia, no notación), Bach (la matemática de la imitación, no el estilo), Nancarrow (los cánones de tempo incompatibles), Ligeti, Reich, Xenakis (la criba), Carrillo (los microtonos como consecuencia), Grisey (los umbrales), Cage (decidir y dejar ocurrir), Oulipo (la restricción como motor), JODI, Lialina y Rozendaal (la interfaz como material).

Ninguna se cita dentro de la obra. **La obra no divulga: obedece.**
