# FASE 2 · PARTITURA DEL SISTEMA

*el clave bien teñido · color, contrapunto, choque e isomorfismo pantalla ↔ voz*

> El color no ilustra la música y la música no sonifica el color. **El color es la partitura, y el único acontecimiento musical es el choque.**

---

## 1 · El espacio y sus métricas

Estado de verdad: **OKLCH**. `L` ∈ [0,1] claridad perceptual, `C` ∈ [0, ~0.37] croma, `H` ∈ [0,360) matiz. El hex es salida; nunca estado.

| símbolo | qué es | cómo se calcula | qué decide |
| --- | --- | --- | --- |
| `Δ(a,b)` | distancia cromática | euclidiana en OKLab (ΔEok) | consonancia, rugosidad, vecindad, confusión |
| `ΔH(a,b)` | distancia de matiz | ángulo corto en grados | **intervalo** |
| `C_GRIS` | umbral del gris | `0.02` | debajo de él no hay altura posible: es ruido |
| `C_MAX` | croma de referencia | `0.37` | normaliza `C → croma` del DSP |
| `1200/360` | cents por grado | `3.333…` | **360° de matiz = una octava** |

### Las tres reglas de mezcla

Todas operan en **luz lineal**, no en sRGB con gama, porque la mezcla es física y no cosmética.

| medio | operación | hacia dónde va | modo de fusión CSS |
| --- | --- | --- | --- |
| **aditivo** | `min(1, x·2(1−p) + y·2p)` — con `p=0.5` es la suma literal | hacia el blanco y hacia el ruido | `screen` |
| **sustractivo** | `x^(1.5−p) · y^(0.5+p)` — con `p=0.5` es el producto | hacia el lodo | `multiply` |
| **diferencia** | `|x − y|` | hacia el negro por cancelación de canal | `difference` |

**Costo de una mezcla** (siempre positivo, siempre se cobra):

```
costo = max(0.004, (C_a + C_b)/2 − C_resultado + 0.35·Δ(a,b))
```

**Cancelación**: si `|ΔH − 180| < 12` y el medio no es aditivo y el croma resultante cae por debajo de `0.35 × min(C_a, C_b)`, hay cancelación. No está programada aparte: es lo que hace el producto de dos complementarios en luz lineal. Medido: con `C≈0.2` la ventana de cancelación real va de **ΔH 170° a 190°**.

---

## 2 · Temperamento

Con **360° = una octava = 1200 cents**:

| | **natural (HSL)** | **igual (OKLCH)** |
| --- | --- | --- |
| las doce estaciones | matices HSL cada 30°, leídos en OKLCH | matices OKLCH cada 30° |
| paso mínimo / máximo | **6.55° / 61.45°** (σ 17.10°) | 30° / 30° (σ 0°) |
| paso en ΔEok, mín / máx | 0.0183 / 0.1635 (σ 0.0455) | 0.0828 / 0.0828 (σ 0) |
| la quinta | **pura**: 701.955 cents = 210.5865° | **temperada**: 700 cents = 210° |
| error por quinta | 0.000 cents | **−1.955 cents**, en las doce |
| doce vueltas de rueda | **+7.038° = +23.46 cents** (la coma) | **0.000°** |
| desviación máxima al cuantizar | ±30.7° ≈ ±102 cents | ±15° = ±50 cents |
| invariante que abre | `la-rueda-de-matiz-dio-doce-vueltas-y-no-volvio` | `la-rueda-cerro-pagando-cada-quinta` |

La elección se hace **una vez por semilla y no se explica**. Cambia (1) qué colores son vecinos —el umbral de vecindad es perceptual, `Δ < 0.10`, y en natural las estaciones no están a la misma distancia—, (2) qué desviación en cents produce cada matiz, y (3) si la rueda cierra.

**Altura de una voz**: `f = f0 · 2^(octava + H_estación/360) · 2^(cents/1200)`, con `octava = round(L·4) − 1 ∈ [−1,3]` y `f0 ∈ [55, 103) Hz` de la semilla. Los microtonos de Carrillo no se eligen: son el resto de la cuantización.

---

## 3 · Isomorfismo pantalla ↔ voz, con números

| lo que se ve | lo que es | número |
| --- | --- | --- |
| **gradiente** de 8 paradas | espectro de 8 bandas × 4 parciales = **32 parciales** | amplitud de la banda `j` = `C_parada_j / 0.37` |
| **eje** del gradiente (0–360°) | inarmonicidad | `estiramiento = sin(eje)·0.06`; `f_k = f0·k^(1+estiramiento)` |
| **animación** del gradiente | movimiento espectral | el eje gira 3° por ciclo de la voz; congelada, no gira |
| **tamaño** (área normalizada) | escala temporal | `período = pulso_base · área / 0.02` — la **razón de tempo es la razón de áreas**, exacta |
| **posición vertical** | registro `L` y plano | `L = 1 − y − h/2`; `y < 0.5` → campo (ganancia 0.42), `y ≥ 0.5` → canto (1.0) |
| **posición horizontal** | panorama | `pan = (x − 0.5)·1.7`, tope ±0.85 |
| **solape** | el choque | área de intersección > 0 |
| **modo de fusión** | el medio | `screen`/`multiply`/`difference` = aditivo/sustractivo/diferencia |
| **borde** | clase de memoria | sólido · discontinuo · punteado · doble · acanalado |
| **textura diagonal** | rugosidad | opacidad = `min(0.7, rugosidad)` |
| **microtexto** | período, plano, bandas vivas | el mismo dato sin usar el matiz |

Pulso base: `0.16–0.34 s` por semilla. Períodos de voz típicos medidos: `0.292 / 0.381 / 0.426 / 0.516 s` (razón 13:17:19).

---

## 4 · Tabla de choque

| condición | criterio numérico | audible | visible | inscripción |
| --- | --- | --- | --- | --- |
| **matices vecinos** | `ΔH < 18°` y `Δ < 0.10` | batimiento de `0.9·ΔH` Hz; rugosidad +0.12 | los dos matices se acercan un 18 % del camino; aparece la textura | `choque · batimiento de N Hz · ΔH · Δ` |
| **complementarios** | `|ΔH − 180| < 12°` | tono de diferencia = `|f_a − f_b|` Hz | mezcla hacia el lodo | `choque · tono de diferencia de N Hz` |
| **cancelación** | lo anterior + medio no aditivo + `C < 0.35·min(C)` | el silencio **con residuo** | croma colapsado | `cancelacion` + invariante `un-silencio-conservo-una-cancelacion` |
| **paralelas** | `ΔH < 4°`, `|ΔL| > 0.015`, las dos `L` moviéndose >0.004 en el mismo sentido **dos evaluaciones seguidas**, y vecinas (`separación < 0.06`) | **una voz menos**, para siempre | la pantalla desaparece; la otra gana rugosidad +0.2 | `muerte` + invariante `una-voz-murio-por-paralelas` |
| **triángulo monocromático** | tres mutuamente adyacentes, misma estación | se instala una recurrencia con período = media de los tres | — | `recurrencia` + invariante `el-choque-se-volvio-pulso` |
| **grafo no coloreable** | coloración exacta por retroceso con `k = max(2, ⌈12·croma_restante/croma_inicial⌉)` | una voz se apaga | la pantalla de mayor grado se va | `expulsion` + invariante |
| **croma bajo en los dos** | `C_a < 0.02` y `C_b < 0.02` | ruido sin altura | gris | invariante `la-altura-volvio-a-ser-ruido` |
| **tercer choque del mismo par** | conteo ≥ 3 | **erosión**: una banda menos cada vez | borde discontinuo (clase `degradado`) | `erosion` |
| **choque con inventado** | clase de memoria | suena igual | borde doble | `duda · este choque no puede afirmarse` |

Y una regla de conservación sin excepciones:

> **El croma total por semilla es finito y sólo decrece.** Presupuesto inicial = `Σ C_inicial × 10` (medido: 6.5–8.6). Mezclar gasta; separar no devuelve.

**Difusión**: dos pantallas a menos de `0.06` sin tocarse contaminan sus matices a razón de `(0.06 − separación) · dt · 0.06`. Esperar produce información.

---

## 5 · La criba

La rejilla de tiempo no es un compás: es una unión de clases residuales `n ≡ b (mod m)`.

- **tres clases de la semilla**, con `m ∈ {3,5,7,8,11,13}`;
- **una clase por voz viva**: `m = 3 + (estación mod 9)`, `b = round(L·(m−1)) mod m`.

Cambiar un color cambia qué pulsos existen. Densidad medida: **0.61–0.81** de los pulsos base sobreviven. Sobre esa rejilla se reparte un patrón de acento (rejilla dura, tresillo, rebajado, roída, desplazada) que **no se puede nombrar desde la interfaz**.

## 6 · Cánones de tempo

Familias de razón por semilla: `21:24:25`, `√2:1`, `e:π`, `φ:1`, `13:17:19`. Las áreas iniciales llevan la razón; los períodos la heredan exactamente.

**Punto de convergencia**: las fases se resuelven, no se sortean. Con `fase_i = t_conv − k·T_i`, todas las voces coinciden en el acontecimiento número `k = 24`, en un instante `t_conv ∈ [45, 110] s`, **una sola vez**. Comprobado: cero coincidencias en los 4000 acontecimientos siguientes.

---

## 7 · Clases de memoria

| clase | cuándo | borde |
| --- | --- | --- |
| `verdadero` | de la semilla o de una operación exacta | sólido |
| `degradado` | erosionado por repetición (3.er choque del mismo par) | discontinuo |
| `inferido` | la copia canónica llegó cuando su original ya había cambiado; o lo produjo la máquina | punteado |
| `inventado` | mezcla con un ascendiente inventado | doble |
| `contradictorio` | dos genealogías distintas produjeron colores a `Δ < 0.012` | acanalado |

Un color sin causa es un bug. Todos llevan `origen`, `causa`, `genealogía` y `clase`.

---

## 8 · Los cinco movimientos y sus disparadores

| | movimiento | disparador (número, no gusto) |
| --- | --- | --- |
| I | **invención** | estado inicial: 3–6 pantallas, croma alto, matices separados, cero choques |
| II | **canon** | el primer choque |
| III | **temperamento** | una copia canónica audible **y** (rueda ≥ 3 vueltas **o** apareció un color contradictorio) |
| IV | **desorden** | audibles ≥ max(5, voces_iniciales+1) **o** ≥2 recurrencias, **y** croma restante < 60 % |
| V | **gris** | croma restante = 0 → la pieza **se detiene a mitad de una entrada** |

Los movimientos no retroceden. Medido en recorridos simulados: 30 s → invención/canon; 3 min → temperamento (≈59 % de croma); 20 min → gris (9–11 invariantes).

---

## 9 · Invariantes implementados (12)

`dos-colores-produjeron-gris` · `una-voz-murio-por-paralelas` · `el-choque-se-volvio-pulso` · `el-ruido-se-volvio-altura` · `la-altura-volvio-a-ser-ruido` · `un-canon-se-cerro-sin-el-visitante` · `la-rueda-de-matiz-dio-doce-vueltas-y-no-volvio` · `la-rueda-cerro-pagando-cada-quinta` · `aparecio-el-color-inaccesible` · `un-silencio-conservo-una-cancelacion` · `la-maquina-uso-una-pausa-tuya` · `dos-historias-produjeron-el-mismo-color` · `una-pantalla-fue-expulsada-del-campo` · `el-presupuesto-de-croma-bajo-de-la-mitad`

Ninguno es obligatorio para llegar al final: el final lo decide el croma. Ninguno se anuncia antes de ocurrir.

---

## 10 · Los hábitos

- **pausas**: las últimas 40 diferencias entre gestos; se usa la **mediana**.
- **tendencia**: `sumar` o `restar`, por conteo.
- **matices evitados**: estaciones que ningún gesto tocó.
- **nunca agrandadas**: pantallas que el visitante no redimensionó.

Con **tres pausas medidas**, la máquina puede actuar. Lo hace cuando el silencio supera `2 × mediana`: superpone el par más cercano que el visitante no juntó, o duplica la pantalla que más modificó **usando su pausa mediana como retardo canónico**. Todo lo que produce queda marcado `inferido`.

---

## 11 · Qué debe llegar a reconocer el visitante, y qué no

**Debe poder reconocer** (sin que nadie se lo diga): que nada suena hasta que dos cosas se tocan; que hay pantallas más lentas que otras y que el tamaño tiene que ver; que una pantalla que se detiene sostiene algo; que algo se pierde al mezclar y no vuelve; que en algún momento el campo empezó a hacer cosas que él no pidió; que el final no es una victoria.

**Debe permanecer oculto**: los nombres de los invariantes; el presupuesto de croma como número; la criba; las razones de tempo; el temperamento elegido; el arco de matiz inaccesible; el instante de la convergencia; que sus pausas se están midiendo.

**No se explica nunca dentro de la obra**: teoría del color, contrapunto, cribas, temperamento.
