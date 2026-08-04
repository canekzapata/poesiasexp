# LOOP_STATE — NINGUNA PRUEBA VIAJA SOLA

## LOOP 06 · el lazo que se desbocaba
fecha: 2026-08-03 · rama: `claude/net-art-math-narrative-daqdt4`

---

## 0. DOS FALLOS REPORTADOS POR EL AUTOR

«Suena muy raro y inaudible, y no he logrado salir del menú principal, algo debe
estar superroto», con `BiquadFilterNode: state is bad` repetido en consola.

Los dos eran reales y los dos eran míos.

---

## 1. EL SONIDO SE MATABA SOLO

Antes de tocar nada hacía falta medir, así que se añadió una **sonda de nivel**
permanente (`N.sonido.nivel()` → RMS y pico en dBFS, con un `AnalyserNode`
colgado del limitador). Sin oídos, es la única forma honesta de saber si algo
suena. Lo que midió:

```
s 2→9    RMS  −2 → +52 dBFS     el lazo se dispara, +7 dB por segundo
s 10+    −Infinity              el filtro revienta y la cadena queda muda
```

**Causa:** la ganancia del lazo de los peines pasaba de 1. El paso-bajos que hacía
de amortiguación tenía Q por defecto, o sea un **pico de resonancia**, así que
`0.88 × pico > 1` y el peine se realimentaba sin fondo hasta que el biquad entró
en estado no numérico y arrastró consigo todo el grafo. Eso es exactamente lo que
oyó: la subida es «muy raro», la muerte es «inaudible».

**Corregido:** `lp.Q = 0.5` (sin pico, nunca amplifica), realimentación a
0.52–0.64, corte del amortiguador a `f×8`, envío 0.2 y salida 0.11. Medido
después: máximo −24.9 dBFS, mínimo −35.2, cero avisos, estable indefinidamente.

Y una segunda medida: con el suelo de respiración en 0.18 los valles caían a
−65 dBFS, que es silencio de verdad en cada ciclo. Respirar no es desaparecer:
suelo a 0.45, recorrido medido de 10.3 dB.

## 2. LA PUERTA NO SE VEÍA

Los tres vacíos del umbral funcionaban —el clic navegaba correctamente, se
comprobó— pero eran **cajas invisibles**: la única marca era un anillo punteado a
0.3 de alfa sobre el lienzo. Que el umbral no tenga botón de comenzar es
deliberado; que nadie encuentre la puerta, no.

Ahora: el anillo se dibuja a 0.5 con trazo más grueso, y **a los ocho segundos sin
que nadie cruce nada, los huecos dicen su nombre**. La primera imagen se conserva
pura esos ocho segundos —comprobado en la prueba— y después la obra enseña sus
puertas.

---

## 3. PRUEBAS NUEVAS, QUE SON GUARDIANES DE ESTOS DOS FALLOS

**71 comprobaciones** en verde.

- no hay filtros inestables (cero avisos de consola);
- el nivel nunca se desboca (máximo −24.9 dBFS);
- y nunca se muere (mínimo −35.2, ninguna muestra muda);
- se oye: el rango es de fondo razonable;
- la respiración se mueve (10.3 dB de recorrido);
- la primera imagen no se estropea con etiquetas;
- a los ocho segundos los huecos dicen su nombre;
- y cruzarlos lleva a otra página.

La prueba del nivel espera 3.6 s antes de medir: la rampa de entrada del maestro
dura 2.4 s y medir ahí es medir el arranque, no el nivel.

---

## 4. LO QUE ESTO ENSEÑA

Los loops 04 y 05 declararon «no puedo escuchar» y lo dejaron ahí. Era verdad,
pero incompleto: **no puedo oír, pero sí puedo medir**. Un `AnalyserNode` habría
detectado el desbocamiento en el mismo loop que lo introdujo. La sonda se queda
en el módulo y su prueba también.

---

## 5. LO QUE SIGO SIN PODER AFIRMAR

Que suene *bien*. El nivel es correcto y estable, medido; si el timbre gusta, si
el sujeto se reconoce, si la sala es demasiada o poca, sigue haciendo falta oírlo.

---

## 6. SIGUIENTE MUTACIÓN RECOMENDADA

1. Escucharla ahora que no se mata: decir si la sala (envío 0.2) es mucha o poca
   y si el conjunto pide más cuerpo.
2. **Contrasujeto y episodios**, que es lo que separa un canon de una fuga.
3. Que la cadencia cierre de verdad.
4. Después: contorno por página, poda con víctima, régimen F.

---

## LOOP 05 · el cuerpo y la sala
fecha: 2026-08-03 · rama: `claude/net-art-math-narrative-daqdt4`

---

## 0. POR QUÉ

«Me gusta pero creo que podemos hacer aún mejor música», y luego: la opción 1,
conducción de voces. Se hizo la conducción y, con ella, el salto que de verdad
cambia cómo suena: **el timbre y el espacio**. Un oscilador pelado sin resonancia
suena a generador de señal por muy buen contrapunto que toque.

Las tres cosas nuevas son operaciones espectrales, no adornos.

---

## 1. UNA NOTA ES UN ESPECTRO

Cada nota se sintetiza con cuatro parciales propios. Dos decisiones importan:

- **la inarmonicidad se hereda**: los multiplicadores salen del mismo
  estiramiento que deforma la serie del organismo, así que un expediente herido
  tiene notas inarmónicas. Medido: `1 · 2 · 3.01 · 4.02`.
- **el brillo cae solo**: los agudos entran con el ataque y duran menos que el
  fundamental. Medido: `0.32 · 0.18 · 0.16 · 0.14`. No es un filtro barrido, es
  cómo se apaga un cuerpo.

Además el brillo se pierde con la altura (`amp / (1 + f/2600)`), porque cuatro
armónicos hasta 4 kHz en una nota aguda son un chillido, no un timbre.

## 2. LA SALA ES EL ESPECTRO

Banco de seis peines —retardo `1/f`, realimentación por debajo de 0.9, con
paso-bajos en el lazo— afinados a los parciales vivos. No es un reverb: **la sala
resuena en las frecuencias de la fundamental herida**, y cuando un bit apaga un
parcial la sala deja de resonar ahí.

## 3. LA MODULACIÓN EN ANILLO COMO OPERACIÓN SEMÁNTICA

Desafinar una huella «inventada» la dejaba siendo el mismo objeto un poco corrido.
El anillo la convierte en otro: suma y diferencia, espectro fuera de la serie. El
índice crece con la incertidumbre —`verdadero 0 · degradado 0.24 · inventado
0.62`— y **suprime la portadora en proporción**, porque dejarla entera sonaba a
trémolo, que es exactamente lo contrario de lo que significa.

## 4. CONDUCCIÓN

- movimiento contrario cuando otra voz va en la misma dirección;
- sin unísonos accidentales entre voces distintas;
- **una voz canta una línea**: si una entrada cae en una voz ocupada, se muda a la
  que lleve más tiempo callada;
- cadencia espectral por familia: `2,4,8 → 1` y `3,6,12 → 3`, así que dos voces
  que caen en la misma familia se resuelven.

---

## 5. EL HUECO QUE DESTAPÓ UNA PRUEBA

La prueba de unísonos falló, y a medias tenía razón: yo había construido dos
entradas en la **misma** voz, y la regla las saltaba correctamente. Pero eso dejó
ver un hueco real: nada impedía que una voz cantara dos líneas a la vez. Tres
voces que pueden solaparse consigo mismas no son tres voces, son tres etiquetas.
Corregido con la mudanza de voz.

---

## 6. PRUEBAS

**62 comprobaciones** en verde. Las nuevas: cada nota trae su propio espectro; sus
parciales son inarmónicos heredados; el brillo cae al decaer; el anillo crece con
la incertidumbre; las voces se mueven en dirección contraria; una voz canta una
línea; las familias espectrales agrupan las octavas; hay banco de resonadores; las
notas están acotadas (tope 40) y se liberan al terminar; apagar desmonta también
la resonancia.

---

## 7. LO QUE SIGO SIN PODER AFIRMAR

**No puedo escuchar.** Todo lo de arriba está medido, no oído. En particular no sé
si la realimentación de los peines (0.72–0.88) es demasiada o poca, si el envío
0.34 ahoga el canto, si el anillo a 0.62 es agresivo, y si el conjunto cansa. Son
cuatro números que hay que mover con oídos.

---

## 8. PROBLEMAS CONOCIDOS

1. **Nada perceptivo verificado** (§7).
2. **No hay contrasujeto ni episodios.** Siempre entra el mismo tema: falta un
   segundo material y pasajes de transición hechos con fragmentos.
3. **No hay forma larga.** Nada empieza ni termina: no hay exposición, ni
   estrechos hacia el final, ni pedal.
4. **La cadencia se detecta pero no se resuelve**: `entrada.cadencia` se marca y
   nadie la usa todavía para cerrar una frase.
5. **El campo sigue respirando en bloque** (pendiente desde el loop 03).
6. Siguen pendientes: contorno por página, poda que elige víctima, regímenes C, D,
   F e I.

---

## 9. SIGUIENTE MUTACIÓN RECOMENDADA

1. **Cuatro números con oídos** (§7).
2. **Contrasujeto y episodios**: un segundo material derivado de la semilla que
   acompañe al sujeto, y episodios construidos por secuencia con fragmentos del
   tema. Es lo que separa un canon de una fuga.
3. **Que la cadencia cierre**: cuando dos voces caen en la misma familia, que la
   frase termine de verdad —resolución al fundamental, silencio, y sólo entonces
   la siguiente entrada—.
4. Después: contorno por página, poda con víctima, y régimen F.

---

## LOOP 04 · contrapunto espectral
fecha: 2026-08-03 · rama: `claude/net-art-math-narrative-daqdt4`

---

## 0. POR QUÉ ESTE LOOP

Crítica del autor sobre el loop 03: **«es muy abstracto»**, y una pregunta sobre
si convenía usar Tone.js «para hacer cosas bachianas pero en espectralismo».

Diagnóstico: el problema no era la librería. Tone.js está vendorizado tres veces
en el repositorio (340–376 KB, v15) y usarlo no rompería el offline, pero
ponerlo sin cambiar nada más habría sonado igual de abstracto. Lo que faltaba era
lo que la palabra «bachiano» nombra: **voces, un sujeto y ataques**. Un campo de
dieciséis parciales respirando juntos y entrando por desvanecimiento es una masa,
no un contrapunto.

Se siguió con Web Audio crudo porque lo único que hacía falta del lado técnico era
un planificador con anticipación —treinta líneas— y porque el modelo ya está
separado de la reproducción: si algún día conviene Tone.js, se cambia el
renderizador sin tocar `espectro.js` ni `voces.js`.

---

## 1. LA TRADUCCIÓN

Las huellas que vuelven deformadas **ya eran entradas canónicas sin saberlo**: un
sujeto que reaparece más tarde, en otra voz, transformado. Las escalas ×2.6 y
×0.42 que ya existían son literalmente aumentación y disminución. Lo que se añadió
es el vocabulario que faltaba, con una sola diferencia respecto del contrapunto de
teclado: **la transposición va por escalones de la serie armónica, no por
intervalos**. Una respuesta no está una quinta arriba: está dos parciales arriba.

| etapa del regreso | operación canónica |
|---|---|
| 0 | respuesta real, dos escalones arriba, en otra voz |
| 1 | aumentación o disminución |
| 2 | la respuesta baja de registro y pierde escalones |
| 3 | estrecho con el sujeto equivocado: entra con el contorno vecino |
| 4 | inversión, desafinada |

---

## 2. SISTEMAS NUEVOS

**`js/voces.js`** (modelo puro, sin audio). Tres registros —bajo 1–4, medio 4–9,
agudo 8–16—; un **sujeto** de 5 a 7 escalones con un salto en posición fija de la
semilla; el pulso tomado de la pausa mediana del visitante; `entradaPara(huella,
etapa)` y `notas(entrada)`, que resuelve cada escalón contra el espectro real.

**El sujeto se toca sobre el espectro herido.** Si un bit apagó el parcial 6, la
nota del tema que caía ahí no suena. Ésta es la unión entre las dos memorias: el
mensaje degradándose le hace agujeros al tema.

**`js/sound.js`**: dos planos —el campo sostenido atrás a 0.42, el canto
adelante—; planificador con anticipación de 150 ms contra el reloj del audio;
notas con **ataque real** (exponencial rápida, caída y cola) en vez de
desvanecimientos; entradas que imitan sin atropellarse (nunca antes de dos pulsos
de la anterior); el tema se dice una vez al encender para poder reconocerlo antes
de que empiece a volver deformado.

---

## 3. TRES BUGS MUSICALES REALES, ENCONTRADOS MIRANDO LOS NÚMEROS

1. **La inversión se aplastaba.** Un contorno de −6 sobre base 4 caía bajo el
   parcial 1 y el recorte repetía 56 Hz tres veces: eso no es un canon invertido,
   es un tropiezo. Ahora el contorno **se pliega** —rebota en el límite de la
   serie— y conserva su forma, que es lo que se reconoce.
2. **La aumentación no se aplicaba.** Si el modelo aún no había cambiado la
   escala, la etapa 1 sonaba idéntica al sujeto. Una respuesta que dura lo mismo
   que el sujeto no es una respuesta, es un unísono.
3. **El tema no perdía notas, y eso contradecía lo que yo mismo había escrito.**
   Medido: tras catorce bits perdidos seguía sonando entero. La causa: una herida
   posterior sobre el mismo parcial **sobrescribía** a la anterior, así que un
   parcial callado revivía. El mensaje no se cura. Ahora el daño se acumula, tres
   heridas sobre el mismo parcial lo callan, y la degradación es monótona:
   medido `5→5→…→5→4→4→4`, y en otra semilla el tema pierde de golpe la mitad de
   sus notas en el bit 12.

---

## 4. PRUEBAS

`tests/pruebas.mjs`, **53 comprobaciones** en verde. Las nuevas:

- el sujeto es el mismo en toda la semilla y tiene forma de tema;
- las cinco etapas entran en voces con registro propio;
- la etapa 1 aumenta o disminuye de verdad (duración distinta, medida);
- la etapa 4 invierte el contorno y **no se aplasta contra el grave**;
- el tema pierde notas al perderse bits **y el daño es monótono**;
- el contrapunto no ensucia la consola.

---

## 5. LO QUE SIGO SIN PODER AFIRMAR

Igual que en el loop 03: **no puedo escuchar**. Verifiqué el modelo, la cola de
notas, los ataques programados, el tope de voces y la desconexión limpia. No sé si
el sujeto se reconoce de oído, si las entradas se distinguen entre sí, si el campo
tapa al canto o si el equilibrio 0.42/1.0 entre planos es el correcto. Es lo
primero que hay que probar con oídos humanos, y es muy posible que haya que mover
ese equilibrio, el pulso y la tesitura de las voces.

---

## 6. PROBLEMAS CONOCIDOS

1. **Nada perceptivo verificado** (§5).
2. **Las tres voces no tienen conducción entre sí.** Cada entrada es independiente:
   no hay reglas de movimiento contrario, ni evitación de choques, ni cadencias.
   Es imitación, todavía no contrapunto estricto.
3. **El salto del daño es escalonado**: el tema puede perder tres notas de golpe
   cuando varios parciales llegan a la tercera herida a la vez.
4. **La etapa 3 (estrecho con contorno vecino) usa el mismo sujeto invertido en
   orden**, no un sujeto genuinamente distinto: falta que cada huella tenga su
   propio contorno derivado de su página.
5. Sigue todo lo del loop 03: clases que no suenan distinto, poda que no elige
   víctima, respiración única, regímenes C, D, F e I pendientes.

---

## 7. SIGUIENTE MUTACIÓN RECOMENDADA

**Escucha crítica, y con ella la conducción de voces.**

1. Que alguien la oiga y ajuste con datos reales: equilibrio campo/canto, pulso,
   tesituras, y si el sujeto se reconoce.
2. **Conducción**: que las tres voces se escuchen entre sí. Movimiento contrario
   cuando dos entradas coinciden, prohibición de unísonos accidentales, y una
   cadencia posible —que dos voces converjan en parciales de la misma familia
   (2, 4, 8) es una cadencia espectral perfectamente definible—.
3. **Un contorno por página**: que cada documento tenga su propio sujeto derivado
   de su clase de relación, para que el estrecho de la etapa 3 sea de verdad el
   tema equivocado.
4. Después, lo que ya estaba en cola: B con semejanza tímbrica real, la poda que
   elige qué regreso cierra, y el régimen F.

---

## LOOP 03 · el espectro también recuerda
fecha: 2026-08-02 · rama: `claude/net-art-math-narrative-daqdt4` (desde `main`)

---

## 0. QUÉ CAMBIÓ EL PLAN

El loop 02 recomendaba **F · repetir juntos**. No es lo que se hizo: apareció
`PROMPT_LOOP_MUSICA_ESPECTRAL.md` dentro de la carpeta de la obra, un objetivo
paralelo con su propio orden de trabajo, y ése manda. F queda en la cola.

Este loop cubre las **fases 1 a 3** del prompt espectral —auditoría, partitura y
prueba vertical— más su documentación. No integra todos los regímenes: el propio
prompt lo prohíbe hasta que la cadena vertical esté comprobada.

---

## 1. FASE 1 · AUDITORÍA (cerrada antes de escribir código)

### Qué datos existentes pueden alimentar el expediente espectral

Todo lo que sigue ya existía, es determinista y vive por semilla:

| dato | qué aporta |
|---|---|
| `m.bits.flips` — índice de carácter, posición de bit y causa | **la herida**: el carácter elige el parcial, el bit elige la operación |
| `m.codigos` — palabras de 12 bits, `distanciaMinima()` | la instrumentación del espectro y la rugosidad |
| `m.rutas` — página, permanencia, clase, causa | la escala temporal del expediente y el orden de los regresos |
| `m.copia.pausas` → `mediana`, `transiciones`, `gestoTop` | el periodo de la respiración y la duración con que la copia completa |
| `m.contradicciones` | parciales duplicados con desviación: los batimientos |
| `m.fragmentos` | parciales que se fueron con lo expulsado |
| `regimenes.E.estado.ops` | procesos fundidos: parciales que pierden presencia |
| `regimenes.J.estado.podadas` | vías de regreso cerradas |

### Qué se retira y qué se conserva

Se retira el modelo de **un pitido por evento**: era exactamente la «recompensa
sonora inmediata» que el prompt prohíbe, y hacía que el sonido fuera un
comentario del clic en vez de una memoria. Se conservan las tres relaciones
conceptuales que ya había —distancia mínima, bits→ruido, triángulo→batimiento—
pero reexpresadas como propiedades de un organismo sostenido, no como disparos.

### Dónde se perdía la continuidad

El `AudioContext` moría con cada página, así que la música reiniciaba en cada
navegación. **La continuidad no puede vivir en el grafo de audio**: vive en el
modelo. El grafo se reconstruye en cada página a partir del estado heredado.

### Modelo puro vs. reproducción

`js/espectro.js` no toca Web Audio y corre siempre, con bocina o sin ella.
`js/sound.js` sólo vuelve audible ese modelo. Así no hay dos narrativas.

### Integración con LA COPIA

No se construye un modelo conductual nuevo: se usa `N.copia.modelo()` —mediana,
gesto dominante, rutas evitadas—. La copia musical es la misma copia.

---

## 2. FASE 2 · PARTITURA DEL SISTEMA

**Objeto originario.** Una fundamental grave por semilla (55–99 Hz) y dieciséis
parciales con estiramiento inarmónico propio, `f_i = f0 · i^(1+s)`. Cada parcial
tiene amplitud, desviación, modo y **umbral**: cuánto hace falta para que se oiga.

**Vocabulario de transformaciones.** Cinco heridas, elegidas por la posición del
bit apagado: `callar`, `desafinar`, `duplicar` (dos parciales casi iguales: eso
*es* el batimiento, no un efecto), `formante`, `ruido` (banda centrada en el
parcial). El carácter del mensaje elige a cuál. Perder un bit cambia la
estructura, nunca el volumen.

**Escalas temporales.** Microtiempo: batimientos y bandas. Tiempo del gesto:
permanecer, interrumpir. Tiempo del expediente: los regresos entre páginas.
Tiempo de la copia: lo que termina cuando el visitante ya no está.

**Respiración.** El periodo lo da la pausa mediana del visitante: inhala,
acumula, cruza un umbral, decae y recomienza. La señal externa que organiza la
música es él.

**Clases de memoria musical.** Las mismas cinco de la memoria textual, con
comportamiento distinto: una huella `degradado` vuelve desafinada 22 centésimas;
una `inventado`, 55, y la bitácora la marca como algo que ya no puede asegurarse.

**Qué debe reconocer el visitante:** que algo que hizo vuelve, y que vuelve peor.
**Qué permanece oculto:** el cálculo, los umbrales, los nombres de las heridas.

---

## 3. FASE 3 · PRUEBA VERTICAL (implementada y comprobada)

La cadena completa que pedía el prompt, verificada por la vía real y no sólo por
la API:

1. **La fundamental herida** — `N.espectro.origen()` y `estado()`.
2. **Una acción significativa inscrita** — permanecer en una página inscribe una
   morfología que empieza a crecer.
3. **Su cruce o su corte** — si nadie interviene en nueve segundos, el parcial
   cruza el umbral y ya no lo desanda (invariante `un-parcial-fue-sostenido`); si
   llega un gesto antes, se interrumpe y lo que faltó queda como residuo.
4. **Su regreso degradado en otra página** — con espaciado: hacen falta al menos
   tres páginas desde el último regreso, porque un regreso en cada página sería un
   metrónomo y no una memoria. Cinco etapas: legible, otra escala de tiempo, menos
   parciales, contaminada por la huella de al lado, y por fin algo que la memoria
   ya no puede asegurar que ocurrió.
5. **La intervención de LA COPIA** — completa lo interrumpido con la duración
   media real del visitante.
6. **La inscripción causal** — cada etapa escribe su causa; la bitácora tiene una
   sección de expediente espectral con el trazo de los dieciséis parciales y la
   genealogía de las huellas; el acta imprime la genealogía musical y dice
   explícitamente que no afirma qué decía el mensaje.

Comprobado en navegador, sin tocar la API: esperar en `hueco` inscribió la huella,
el parcial 7 cruzó solo, quedó el invariante y apareció el rastro legible; navegar
a `interior`, esperar y hacer clic interrumpió la siguiente.

### Rastro para quien no oye

Toda condición audible tiene equivalente legible: una línea `ESPECTRO` en la
telemetría de todas las páginas, un rastro emergente con su dibujo cuando algo
cruza, se corta o vuelve, el trazo completo de parciales en la bitácora y la
genealogía en el acta. La obra sin audio conserva navegación, narrativa,
invariantes y salida.

---

## 4. BUG REAL CORREGIDO (y una corrección al loop 02)

En el loop 02 atribuí a «contención del servidor de pruebas» un fallo fantasma
en el que alguna página cargaba sin motor y sin salidas. **Era un bug de la
obra.** Con la caché caliente, los dieciocho módulos que `carga.js` inserta pueden
ejecutarse en una pausa del analizador *antes* de que la página haya registrado su
oyente de `npvs:cargado`: el aviso se disparaba sin nadie escuchando y el
documento quedaba muerto, con cero salidas. Por eso sólo ocurría en recorridos
largos y nunca en una carga aislada.

Arreglado: `carga.js` vuelve a avisar cuando el documento termina de analizarse, y
`shell.iniciar` es idempotente para que avisar dos veces no cuente la página dos
veces. Tres corridas completas seguidas sin un solo fallo.

---

## 5. LO QUE **NO** PUEDO AFIRMAR

La fase 5 del prompt pide escucha crítica. **No puedo escuchar.** Verifiqué que
el grafo se construye, que las voces están acotadas (16 + 3 bandas), que apagar
desconecta todo, que no hay autoplay y que no hay errores de consola, y comprobé
el modelo entero de forma determinista. No he verificado nada perceptivo:

- si los batimientos se perciben sin audífonos;
- si la densidad enmascara las causas;
- si el regreso se reconoce como el mismo material;
- si la espera produce información o aburrimiento;
- si el volumen y los graves son cómodos en altavoces reales.

Eso es lo primero que hay que probar con oídos humanos, y puede obligar a mover
umbrales, amplitudes y tiempos. No lo doy por bueno.

---

## 6. ESTADO DE LOS CRITERIOS DE ACEPTACIÓN DEL PROMPT

| # | criterio | estado |
|---|---|---|
| 1 | mismo expediente → mismo espectro | comprobado |
| 2 | navegar transforma un estado heredado | comprobado (f0 y sostenidos se heredan) |
| 3 | una acción regresa en otra página | comprobado |
| 4 | el regreso cambia según causa inscrita | comprobado |
| 5 | las clases producen comportamientos distintos | parcial: degradado e inventado difieren en desafinación; verdadero/inferencia todavía no |
| 6 | la copia actúa con hábitos reales | comprobado (duración media) |
| 7 | perder un bit modifica la estructura | comprobado |
| 8 | simplificar reduce una medida sonora y cobra una vez | parcial: apaga parciales; el cobro sigue siendo el del régimen E |
| 9 | podar detiene una recurrencia | comprobado en modelo; falta que la poda elija *qué* regreso cierra |
| 10 | el acta describe sin afirmar | comprobado |
| 11 | la obra sin audio conserva todo | comprobado |
| 12 | sin autoplay, fugas ni errores | comprobado |
| 13 | sin callejones | comprobado (y arreglado el bug que los producía) |
| 14 | pruebas del modelo determinista | comprobado, 44 comprobaciones |
| 15 | la escucha revela procesos | **no verificado**: no puedo escuchar |

---

## 7. PRUEBAS EJECUTADAS

`tests/pruebas.mjs`, **44 comprobaciones**, tres corridas seguidas en verde.
Las nuevas:

- el mismo expediente produce el mismo espectro; f0 en el registro elegido;
- perder un bit cambia el modo de un parcial, no su volumen;
- permanecer sostiene un parcial y deja invariante; interrumpir corta antes del umbral;
- una acción vuelve en otra página, con causa escrita y su invariante;
- los regresos sucesivos degradan la huella hasta inventarla (`verdadero → degradado → inventado`);
- la copia termina una morfología con la duración media del visitante;
- navegar hereda el espectro en vez de reiniciarlo;
- el expediente se calcula con la bocina apagada;
- no hay autoplay; tras el gesto explícito hay 16 voces acotadas; apagar desconecta todo;
- el acta incluye la genealogía musical y no afirma demostrar su contenido;
- **por la vía real**: permanecer 31 s sin intervenir inscribe la huella, el parcial
  cruza solo y aparece el rastro legible y dibujado.

---

## 8. PROBLEMAS CONOCIDOS

1. **Nada perceptivo está verificado** (ver §5). Es el problema principal.
2. **Las cinco clases todavía no suenan distinto.** `degradado` e `inventado` sí;
   `verdadero`, `inferencia` y `contradiccion` comparten comportamiento.
3. **La poda no elige qué regreso cierra.** Hoy cuenta: si hay más podas que
   huellas vivas, no vuelve nada. Debería ser una arista concreta la que sostenga
   una huella concreta.
4. **El regreso sólo suena como hinchazón de un parcial.** Falta que vuelva la
   *morfología* —su envolvente y su escala— y no sólo su altura.
5. **La respiración es única para todo el organismo.** *Périodes* pide ciclos que
   no coinciden; aquí todos los parciales respiran juntos.
6. **El circuito y la caja no tocan el espectro todavía** (fases 4 en adelante).
7. Siguen pendientes los regímenes **C**, **D** y **F**, y **I** sin superficie.
8. `escala` sigue redundante en `packing.js`.

---

## 9. SIGUIENTE MUTACIÓN RECOMENDADA

**Escucha crítica con oídos humanos, y con ella la fase 4 en su primer tramo.**

1. Antes que nada: alguien tiene que oírla. Recorridos de 2, 10 y 30 minutos
   anotando cuándo se reconoce una huella, cuándo su transformación se vuelve
   ilegible, y si el conjunto cansa. Ajustar umbrales, amplitudes y el rango de la
   fundamental con esos datos, no con los míos.
2. **B · distancia y contradicción** (primera prioridad de la fase 4): que la
   distancia Hamming gobierne de verdad la semejanza tímbrica entre dos huellas,
   no sólo un número de rugosidad global. Dos recuerdos a distancia 1 deberían
   sonar como el mismo material mal copiado.
3. **Que la poda elija su víctima**: cada arista sostiene una huella nominal, y
   retirarla cierra ese regreso concreto. Convierte el §8.3 en una operación con
   consecuencia legible.
4. Después, **E** (fundir procesos equivalentes también en el sonido) y **J**
   (el fracaso final como pérdida progresiva de memoria acústica), que es donde el
   apéndice musical se encuentra con el final que ya tiene la obra.
