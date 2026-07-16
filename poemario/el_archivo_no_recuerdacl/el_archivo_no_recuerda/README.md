# EL ARCHIVO NO RECUERDA HABER SIDO LEÍDO
### poemario arqueológico para una máquina que confunde lectura con clima

No es otro generador de páginas. Es **un único campo diagramático continuo**
donde cada lectura modifica irreversiblemente el archivo. El libro intenta
archivar la lectura mientras la lectura todavía está ocurriendo; al hacerlo,
fabrica un lector que nunca coincide del todo con quien está frente a la
pantalla.

> el libro comienza a recordar una lectura que el lector no reconoce como propia.

## Abrir

```bash
python3 -m http.server 8000
```

Después `http://localhost:8000/poemario/el_archivo_no_recuerda/`.
También abre `index.html` directo del disco en navegadores que permitan
scripts locales. Sin bibliotecas externas.

La semilla se fija en la URL: `index.html?seed=mi-semilla` — el azar está
firmado: la misma semilla entierra el mismo archivo.

## El nuevo loop

```
ARCHIVO enterrado → LECTOR excava → FRAGMENTOS se enlazan →
SISTEMA predice la lectura → LECTOR contradice o confirma →
CONTRAARCHIVO mutado → RESIDUOS se entierran → ARCHIVO′ → …
```

Los diagramas nacen de acciones, no de plantillas elegidas. La interacción no
controla la obra: es la materia que la obra intenta representar. El PDF final
es el registro de una lectura particular.

## Ocho estados, no ocho páginas

El campo pasa por ocho modos por vuelta. El tiempo ambiente los avanza, pero
la **acción que caracteriza a cada estado lo adelanta**.

1. **Futuro anterior** — abre con residuos de acciones que aún no hiciste; el
   sistema genera una lectura prevista a partir de la semilla.
2. **Celda** — aparece un espacio delimitado; el texto se acumula afuera. La
   quietud activa este estado: no tocar también escribe.
3. **Caja** — adentro/afuera dejan de ser posiciones estables. Arrastrar una
   frontera cambia qué palabras son poema y cuáles metadatos.
4. **Excavación** — el movimiento vertical descubre estratos: frase,
   instrucción, esqueleto consonántico, error OCR, glifo, residuo. La geometría
   es la operación lingüística.
5. **Enlace** — tocar dos fragmentos dibuja una relación (demora, contagio,
   contradicción, pérdida, herencia, eco) y modifica ambos textos. Conectar
   produce una tercera cosa.
6. **Presente continuo** — permanecer sobre una palabra la repite; cada
   repetición pierde, desplaza o intercambia una letra. La atención deforma.
7. **Arqueología futura** — lo borrado reaparece atribuido erróneamente a otra
   época. La sesión se trata como ruina encontrada siglos después.
8. **Profecía fallida** — el libro anuncia tu próximo gesto. Si acierta, la
   interfaz se vuelve más autoritaria; si falla, la leyenda pierde integridad.
   Después se repliega y comienza otra vuelta con los restos.

## Interactividad (la lectura es la materia)

| gesto | operación |
|---|---|
| **mover el cursor** | sonda: la velocidad determina erosión (rápido) o revelado (lento) |
| **detenerse** | acumula repetición y presión tipográfica |
| **seleccionar dos fragmentos** | crea una relación irreversible que altera ambos |
| **arrastrar** | mueve fronteras, cajas y categorías |
| **scroll / ↑ ↓** | excava capas temporales; no “baja” por una página |
| **redimensionar la ventana** | recalcula la topología y rompe conexiones |
| **salir de la pestaña** | produce un abandono que el sistema interpreta como estrato |
| **no hacer nada** | activa un lector fantasma para que la obra siga siendo autónoma |

## Memoria verdadera

Cada fragmento carga cuatro valores que la lectura modifica de forma
irreversible:

```js
{ atencion: 0, daño: 0, conexiones: [], edad: 0 }
```

Al terminar una vuelta el archivo se muta a sí mismo (**el contraarchivo**):

- lo muy observado se **hipertrofia**;
- lo ignorado se **fosiliza** (esqueleto consonántico);
- lo borrado regresa como **signo** (glifo);
- lo conectado **hereda** palabras de sus vecinos;
- lo mal predicho **corrompe la leyenda**;
- permanece entre **5 % y 15 %**, elegido por la historia de esa lectura y
  **no al azar** (un puntaje sobre atención, enlaces, daño y edad).

## El color es clima (no decorado)

Cada lectura genera su propia **armonía cromática** — como los paisajes de
poesiasexp: momento del día (amanecer, mediodía, atardecer, noche, tormenta) ×
modo armónico (caos, mono, análogo, complemento, tríada, tétrada) → 24 tonos
HSL reproducibles por la semilla. El archivo no tiene un color fijo: tiene el
**tiempo atmosférico** que le tocó a esta excavación.

Detrás de todo respira un **canvas vivo**: la lectura convertida en clima. Un
campo de presión/temperatura en bandas (como un mapa meteorológico) que fluye
con el tiempo y se deforma con la memoria — donde prestaste atención sube la
presión, donde erosionaste hay turbulencia, los enlaces trazan frentes. Encima
deriva un **viento de glifos** (braille, bloques, ondas). La máquina confunde,
literalmente, tu lectura con clima, y el oráculo la reporta como pronóstico
—con humor: memes, errores del sistema y citas mal atribuidas al año 8888.

## Diagramas y gráficas

La lectura se grafica en tiempo real: **calor por campo** (barras de atención
por operación), **rosa de acciones** (diagrama radial de tu historial de
gestos), **integridad por vuelta** (línea de la leyenda que se corrompe) y, en
cada fragmento, una **mini-gráfica en braille** de su memoria (atención · daño ·
edad · enlaces). Los diagramas nacen de tus acciones, no de plantillas.

## Forma visual

`100vw × 100dvh` como pliego deformable · lectura **no lineal**: se explora, no
se pasa · ilegibilidad local, legibilidad estructural · texto **compresible e
incompresible** (la atención comprime la letra) · fragmentos coloreados que
derivan y respiran · tipografía monumental, diagramas funcionales y microtexto
como trama · casi nada de HUD · las instrucciones aparecen dentro del poema y se
corrompen · densidad extrema producida por acumulación causal · clic = otra
excavación, otra semilla, otro clima (estilo fxhash, azar firmado).

## Imposición (`P`)

Después de una vuelta, el sistema impone ~16 láminas A4 con la arqueología de
esa sesión: portada contaminada, seis láminas estratigráficas (el mismo campo
excavado capa a capa), las láminas de enlace con los vínculos que produjiste,
la arqueología de los residuos y un colofón con el registro de tu lectura.
**Cada lector produce una edición distinta del libro.**

## Controles

- `R` — otra excavación (otra semilla)
- `P` — imponer la edición impresa de esta lectura
- `F` — pantalla completa
- `↑ ↓` — excavar estratos

## Qué toma del corpus

No hay nombres ni citas visibles. De cada texto del poemario se hereda **una
operación formal**, no un contenido:

| material | operación |
|---|---|
| poemas de canek | sonda, transmisión, distancia, máquina de compañía |
| Li Po 4444 a.C. | cronología imposible, traducción llegada desde el futuro |
| Macedonio | la novela como procedimiento que altera su propia lectura |
| Cajas | adentro/afuera como operación, no como tema |
| Kodwo Eshun | arqueología futura, contramemoria, archivo incompleto |
| Ted Nelson | enlaces que cambian el documento en lugar de conducir fuera |
| Stein | repetición, duración, presente continuo |
| monjes egipcios | celda, retiro, atención, desierto, ritual temporal |

## Archivos

- `index.html` — el pliego
- `style.css` — el color como clima, todo animado
- `content.js` — el corpus reducido a operaciones formales + glifos, clima y humor
- `archive.js` — el modelo de datos, su memoria y el contraarchivo
- `palette.js` — la armonía cromática de cada lectura (momento × modo)
- `climate.js` — la lectura convertida en clima (canvas generativo)
- `field.js` — el campo diagramático: fragmentos, grafo y gráficas
- `reader.js` — la lectura como materia (interacción + ocho estados)
- `print.js` — la imposición de la edición de esta lectura

poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
