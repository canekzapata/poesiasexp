# nefelógrafo

**instrumento de composición para poesía concreta**
poesiasexp / concretismopython / [canekzapata.net](https://canekzapata.net) · 2026

*néphos* (nube) + *gráphein* (escribir): el que escribe nubes.

no es una ia que escribe poemas. es algo entre imprenta, partitura,
atlas meteorológico y máquina combinatoria: python genera estructuras
con memoria léxica; el navegador deja aceptar, desplazar, borrar,
reordenar. el sistema no sustituye la decisión estética — la vuelve visible.

```
corpus
+ reglas lingüísticas
+ reglas geométricas
+ restricciones
+ azar controlado
+ intervención humana
= constructivismo generativo
```

cero dependencias: python 3.10+ y un navegador. nada más.

---

## empezar

```bash
python3 nefelografo.py                        # un poema al azar (imprime su semilla)
python3 nefelografo.py --tipo lluvia --semilla 42
python3 nefelografo.py --tipo halo --nucleo luz --animar
python3 nefelografo.py --esquizo 0.9          # sube la temperatura
python3 nefelografo.py --criba 24             # el mejor de 24 intentos
python3 nefelografo.py --atlas                # las seis especies, a atlas/
python3 nefelografo.py --palabra bruma        # la ficha léxica completa
python3 nefelografo.py --web                  # alimenta el editor web
python3 nefelografo.py --tipos                # lista las especies
```

cada corrida escribe un `.svg` (la lámina: texto editable, escala
infinita) y un `.json` (el poema con su memoria: coordenadas, capas,
variantes, etimologías) en `salidas/`. la misma semilla produce
exactamente el mismo poema: el azar está firmado.

después abre `web/editor.html` — sin servidor, directo del disco.

## las especies

la geometría no es decorativa: es isomórfica con el fenómeno.

| especie | isomorfismo |
|---|---|
| **poema-cúmulo** | agregación radial (filotaxis de girasol); el montón se erosiona en los bordes; el antepasado latino sostiene todo como marca de agua |
| **poema-cirro** | fibras finas oblicuas: las palabras adelgazadas a su esqueleto consonántico (`nube → nb`); una fibra es una deriva sonora entera |
| **poema-estrato** | estratigrafía etimológica: arriba el español expandido como aire, abajo el latín y el griego cada vez más densos — leer hacia abajo es excavar |
| **poema-lluvia** | la nube se condensa arriba (fusiones apretadas); las letras caen perdiéndose (evaporar); abajo el charco lee la palabra al revés |
| **poema-halo** | anillos concéntricos de tiempo: familia viva, antepasados latinos, y afuera el griego con los paralelos náhuatl y maya |
| **poema-ciclón** | la frase condensada gira en espiral y el giro la erosiona vuelta a vuelta; en el centro exacto, el ojo: la palabra intacta |

cada especie declara su comportamiento (`TIPO_CIRRO`, `TIPO_CUMULO`…)
y cada poema lleva **una** anomalía: el quiebre que crea tensión, en el
único color de la página (rojo constructivista). en el cúmulo es un
desprendimiento; en el estrato, un sondeo vertical que perfora las capas;
en la lluvia, una gota que sube; en el halo, un radio recto; en el
ciclón, lo que el giro expulsa; en el cirro, un nudo denso en el cielo ralo.

## restricciones

sin límites solo hay ornamento. el motor impone y reporta:

```
máximo 12 palabras-base          mínimo 30 % de vacío
máximo 3 familias tipográficas   una operación geométrica dominante
una anomalía                     una palabra-núcleo
una transformación fonética      una transformación etimológica
```

en el editor puedes romperlas: el ticker lo anuncia en rojo,
pero no te lo impide. romperlas es tu derecho.

## el corpus tiene memoria

~100 palabras curadas (nubes, atmósfera, agua, óptica, verbo) y ~80
palabras-puente por donde cruza la deriva sonora. cada entrada:

```json
{
  "forma": "nube",
  "silabas": ["nu", "be"],
  "raiz": "nub-",
  "familia": "nub",
  "etimologia": ["nūbēs (lat.)", "nebula (lat.)", "nephélē (gr.)"],
  "campo": ["atmósfera", "vapor", "suspensión"],
  "sonidos": ["n", "u", "b", "e"],
  "raiz_culta": ["nefo", "nubi"],
  "paralelos": {"náhuatl": "mixtli", "maya": "muyal"},
  "peso_visual": 4,
  "densidad": 0.45,
  "movimiento": "ascendente",
  "nota": "nūbēs y nebula parecen madre e hija; son vecinas que se copian los gestos"
}
```

el poema no elige palabras al azar sino por relaciones:

```
por familia:        nube · nublar · nuboso · nubilidad
por deriva sonora:  nube → sube → tuve → leve → breve → llueve
por transmutación:  aire + agua + tiempo → aerohidrocrono
por fusión:         vapor + poesía → vapoesía
                    agua + fonema → hidrofonema
                    color + nimbo → cromonimbo
```

y guarda las hipótesis hermosas: `nube` y `niebla` **no** son familia
(raíces distintas: *(s)neudh-* y *nebh-*) pero la poesía las confunde a
propósito; `umbral` no viene de la sombra sino de la puerta; el `cénit`
nació de una errata medieval; un `destello` es — la etimología lo jura —
una gota destilada de luz; la `bruma` era el día más corto del año;
`erosionar("eco")` repite el mito: primero se pierde el cuerpo, luego la voz.

consulta cualquier órbita: `python3 nefelografo.py --palabra destello`

## operaciones verbales

```python
from motor import morfologia as M

M.silabificar("atmósfera")        # ['at', 'mós', 'fe', 'ra']
M.cortar("atmósfera", 3)          # contra la sílaba: ['at', 'mó', 'sfe', 'ra']
M.erosionar("condensación")       # condensación / ondensació / ndensaci / densac / ensa / ns
M.evaporar("evaporación")         # pérdida gradual de letras (deja huecos)
M.expandir("nube")                # n u b e / n  u  b  e / n   u   b   e
M.condensar(["agua","aire","tiempo"], "fusion")   # aguairtiempo
M.fusionar("vapor", "poesía")     # vapoesía
M.esqueleto_consonantico("nube")  # nb        (cirro)
M.esqueleto_vocalico("nube")      # ue        (sedimento)
M.invertir("lluvia")              # aivull    (charco)
```

## gramática espacial

las unidades de composición viven en `motor/composicion.py`:
`nodo`, `eje`, `nube`, `orbita`, `caida`, `capa`, `repeticion`,
`interferencia`, `fractura`, `vacio`. una especie es un programa
hecho de estas operaciones:

```python
import random
from motor import lexico, composicion as C

lex = lexico.cargar()
rng = random.Random(42)
poema = C.Composicion("propio", 42, "vapor", ancho=900, alto=900)

C.nodo(poema, "vapor", tamano=64, fuente="sans")
C.nube(poema, ["aire", "bruma", "vaho"], 450, 380, sigma=140,
       rng=rng, densidad=0.7)
C.caida(poema, "lluvia", 300, 420, 820, rng=rng)
C.interferencia(poema, desplazamiento=(8, 5))
C.vacio(poema, 0.35)
C.aplicar_restricciones(poema, rng)
```

## el parámetro esquizo

`--esquizo 0..1` sube la temperatura del sistema: glosolalia
(palabras que no existen pero podrían: sílabas reales del corpus
recombinadas), interferencia (el poema superpuesto a sí mismo,
apenas corrido), derivas más largas. a 0.35 el instrumento está
sereno; a 0.9 el idioma sueña consigo mismo.

## el editor web

`web/editor.html` — terminal de fósforo verde, cero dependencias,
funciona desde `file://`. el poema llega incrustado (`--web`), por
`fetch` de `poema.json` si hay servidor, o arrastrando cualquier
`.json` generado.

```
arrastrar      mover la palabra
clic           mutar: la palabra gira por sus variantes
               (familia, antepasados, náhuatl, deriva sonora)
doble clic     editar a mano          rueda    crecer / encoger
r / R          girar ±15°             x        borrar
a animar · e esquizo · g rejilla · t tema noche/papel · v temblor
```

en modo **esquizo** el poema muta solo cada pocos segundos y los
antepasados se asoman como espectros que se esfuman. el ticker de
abajo susurra la memoria de la palabra que toques y vigila las
restricciones. `[guardar json]` y `[exportar svg]` descargan el
estado exacto, con la intervención humana incluida.

## arquitectura

```
corpus/     nubes · atmosfera · agua · optica · verbo · puentes · etimologias
motor/      morfologia · fonetica · lexico · semantica · geometria · composicion
reglas/     cumulo · cirro · estrato · lluvia · halo · ciclon  (+ registro)
salida/     svg (xml a mano) · json · png (si hay rasterizador)
web/        editor.html · viewer.js · poema.json
atlas/      una lámina svg por especie (semilla 42)
tests/      python3 tests/test_nefelografo.py  (o pytest)
```

los ejemplos del plan original son contrato de pruebas:
`erosionar("condensación")`, `expandir("nube")`, `aguairtiempo`,
`aerohidrocrono`, `vapoesía` y compañía deben dar exactamente eso.

## extender

**una palabra**: agrégala a su json en `corpus/` (las sílabas y los
sonidos se calculan solos si los omites; escríbelos solo para
contradecir al algoritmo, que también es un derecho poético).
dale familia, etimología, campo, movimiento y — si la tiene — su nota.

**una especie**: un archivo en `reglas/` con el decorador:

```python
from .base import especie

@especie("iridiscencia", (900, 600), {"orientacion": "tornasol"},
         "descripción breve")
def componer(lex, rng, semilla, nucleo=None, esquizo=0.35):
    ...devuelve una Composicion
```

queda registrada sola: `--tipos` la lista, `--atlas` la lamina.

## salida png / pdf

el svg es la salida verdadera. `--png poema.png` (o `.pdf`) intenta
con `cairosvg`, `rsvg-convert`, `inkscape` o chromium sin cabeza,
en ese orden; si no hay ninguno, lo dice y no finge.

## genealogía

noigandres y el plan piloto para poesía concreta (são paulo, 1958) ·
poema/proceso · el constructivismo que pinta una sola cosa roja ·
net.art de fósforo verde · la deriva y el rizoma. y las lenguas de
esta tierra: cada palabra del corpus que tiene doble en náhuatl o en
maya lo lleva consigo (`nube ~ mixtli ~ muyal`), porque el cielo de
acá ya tenía nombres.
