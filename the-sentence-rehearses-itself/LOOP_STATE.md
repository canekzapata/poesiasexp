# LOOP STATE — the sentence rehearses itself

Registro de análisis y trabajo pendiente. La regla de este archivo: anexar, no
reemplazar. La historia anterior nunca se borra.

---

## Crítica (read-only, `critique` · dedicada a esta pieza)

Resultado de una revisión conceptual por un agente crítico. No hubo mutación de
código; esto es diagnóstico y prospectiva.

### Qué la pieza hace realmente
Una oración única, determinista desde la semilla en la URL, que no deja de
reordenarse. El mismo token (por id, no por grafía) atraviesa 19 formas verbales
y 8 arreglos computacionales (estrofa, árbol de análisis, grafo de relaciones,
tabla, poema-función «ejecutable», plot de historia, partitura, campo de
residuos) mientras nueve memorias decaen a ritmos distintos y seis regímenes
(NOMBRAR, RELACIONAR, REPETIR, RAMIFICAR, MAL-RECORDAR, VOLVER) sesgan a la vez
forma, layout, color y melodía. El melos deriva del hash de la semilla y solo se
transforma por eventos *causados*.

Máquinas reales (no decoración):
- `give(x,y)` — calcula una distancia real de árbol y entrega ese número como
  regalo en lugar del sustantivo.
- `name(x)` — desciende `window → the one that was window → the one → one → it`
  subiendo ambigüedad (la operación Stein como procedimiento).
- `returnProbability()` — se grafica *y* es el número contra el que lanza la
  gramática; el plot es la foto de una decisión, con realimentación de la
  pendiente de insistencia.

### Dicho pero aún no encarnado
1. **La tesis no está renderizada.** El subtítulo es «a grammar that can hear the
   difference between repeating and returning», pero en pantalla un retorno y una
   repetición se ven iguales. La distinción existe en `memory.touch`
   (gap < 25 s = repetición; gap ≥ 25 s = retorno, `returns++`). La clase
   `.is-returning` se añade en `diagrams.js` pero no tiene CSS ni se limpia
   nunca: **señal muerta para la afirmación central**.
2. «Algunas consecuencias llegan en minutos» es medio cierto: las intenciones del
   lector resuelven en el tic gramatical (~9.5 s base); solo el retorno de
   residuos (semivida 2400 s) tarda minutos.
3. Las formas visuales son diagramas estándar (árbol, tabla, gráfico de líneas).
   El motor es más rico que la superficie: lo novedoso está poco renderizado, lo
   genérico está completamente renderizado.

### Operación a intensificar
**`name`.** Desciende hasta «it» y se detiene (`nameStage` capado en
`stages.length - 1`). Ese piso es un callejón sin salida: una vez «it», nombrar
ya no hace nada. No debería parar en el pronombre; debería entregar a
`dropReferent` (el pronombre sigue señalando tras irse el referente) o derivar en
ausencia/residuo — encadenando el bucle Stein (nombrar → perder la cosa → la
cosa vuelve distinta) que ya está implícito en el código.

### Operación genérica a remover o transformar
**Reordenamiento de columnas de la tabla.** Es un affordance de hoja de cálculo
con justificación poética post-hoc: un `switch` hardcodeado sin causa
(`insistence`→`repeat`, `returns`→`misremember`, etc.). O bien derivar la
operación de los datos reales de la columna (la columna que más disiente, al
moverse primero, fuerza el cambio de papel más fuerte), o bien quitar el
reordenamiento y dejar la tabla como superficie de lectura.

### Contradicciones accidentales a corregir
- **La ausencia la decide `Math.random()`.** En `main.js`, el residuo «dicho
  mientras estabas fuera» se elige con azar no sembrado
  (`phraseMemory[...]`). Es el único evento semántico con memoria decidido al
  azar, en un sistema cuya premisa es que todo es causado. Debería usar la
  memoria, que existe exactamente para esa decisión.
- Señal muerta `.is-returning` (ver tesis).
- Drift de documentación: README dice «dieciséis transformaciones causales»; el
  código define catorce en `T`.

### Contradicciones a preservar (son la pieza)
- `give` entrega un número en vez de un sustantivo.
- La ausencia no es pausa: algo se dijo mientras no (solo) mirabas y ya es
  residuo.
- La melodía existe aunque nunca se oiga; la obra es completa con el sonido
  apagado.
- `name` conserva identidad mientras pierde grafía (mantiene token id y presión,
  disolviéndose hacia «it»).

---

## Trabajo pendiente (prospectiva) — ordenado por palanca conceptual

1. **Renderizar la distinción repetición/retorno.** Cablear la `.is-returning`
   existente (`returns++`) para que una palabra que regresa tras un hueco real,
   cargando historia acumulada, llegue con un gesto visiblemente distinto de una
   repetición rápida (un rastro de dónde estuvo, o una marca de lo que ahora
   carga). Convierte la afirmación central de hecho computacional a experiencia.
   Es la mutación de mayor palanca.
2. **Extender `name` más allá de «it».** Al agotar el descenso, pasarla a
   `dropReferent` o a silencio/residuo, encadenando las dos operaciones que nunca
   se encuentran. Intensifica la operación más cargada.
3. **Hacer causado el reordenamiento de columnas (o quitarlo).** Derivar la
   operación de la disensión real de la columna en vez del `switch` fijo, o
   desactivar el reordenamiento.
4. **Correcciones menores:** eliminar `Math.random()` de la elección del residuo
   de ausencia; resolver la `.is-returning` muerta; alinear el conteo de
   transformaciones (14 vs 16) entre código y README.

Regla para futuras sesiones: una mutación por loop, con evidencia; anexar aquí
el resultado. No borrar historia previa.

---

## Visión del poeta-crítico — variedad y objetivos (read-only, sin mutación)

Lectura poética-crítica con foco en **variedad** y en cumplir los objetivos de la
pieza («nada se repite en las mismas condiciones»; el lector influye sin
controlar; la misma palabra vuelve deletreada igual con otra historia).

### Cómo se ve hoy
Motor rico, superficie estrecha. La variedad no falta en la máquina (19 formas,
9 memorias, 6 regímenes, 8 arreglos, 11 operaciones) sino en lo que se vuelve
visible y audible dentro del tiempo de una lectura. Tres cuellos:
1. La variedad se acumula en secreto: repetición y retorno idénticos en pantalla.
   La historia que una palabra carga no se muestra → variedad como *material*, no
   como *historia*.
2. Las operaciones terminan, no singularizan: `name` muere en «it»; funciones con
   un fin, no trayectos; falta leer la gramática como organismo que se pierde.
3. Cadencia demasiado resolutiva (~9.5 s): el lector administra frecuencia; la
   espera «no hacer nada también es una operación» aún no es material.

### Operaciones futuras posibles (encadenan recursos ya existentes; sin inventar
maquinaria nueva)

**A. Que lo que vuelve se distinga (mayor palanca).**
Renderizar la `.is-returning` existente: una palabra que regresa tras un hueco
real llega con un rastro (sombra de su sitio anterior, tratamiento distinto de su
ambigüedad); una repetición rápida solo presiona. No añade material: convierte
acumulación en variedad. La más fiel al objetivo central.

**B. Convertir las operaciones en autómatas, no en funciones.**
`name` no se detiene en «it»: pasa a `dropReferent` (el pronombre sigue señalando
lo que ya no está) o a silencio/residuo. Variedad OULIPO + celular: una operación
engendra la siguiente — nombrar → perder → mal-recordar → devolver distinto. El
bucle de Stein completo, ya implícito.

**C. Derivar la operación de la columna de sus datos (o matar el reordenamiento).**
Hoy es un `switch` post-hoc sin causa. Si al mover una columna la operación sale
de su disensión real (la que más disiente fuerza el cambio más fuerte), la tabla
se vuelve superficie que discute y cada lectura reorganiza la gramática distinto.

**D. Hacer causada la ausencia.**
La decisión del residuo «mientras estabas fuera» con `Math.random()` es el único
azar en un sistema todo-causado. Pasarla por la memoria restaura coherencia y
hace cada ausencia distinta por historia, no por suerte.

**E. Derretir la cadencia.**
Intervalos variables derivados de insistencia/silencio: en la pausa el reloj se
ralentiza y el organismo cambia distinto. La espera escribe — segundo eje de
variedad (tiempo) además del espacial.

**F. Abrir el registro «sung» (declarado completo).**
Agregar el formante vocálico: variedad de materia tímbrica que los demás registros
no tocan; atajo hacia los conceptos poco encarnados (false return y recognition,
que solo ocurren pasado ~4 min).

### Lo que NO se ve deseable
Multiplicar material lingüístico o añadir voz narrativa. La variedad del proyecto
es *las mismas cosas volviendo con más presión y más historia*, no *más cosas*.

Preferencia de arranque: mutación **A** (renderizar repetición/retorno), con
evidencia antes de decidir.
