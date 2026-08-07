# LAS HIERBAS QUE CRECEN EN EL SERVIDOR

### informe compilado por [nombre omitido]
### Instituto de Biotecnología Vegetal, Querétaro
### abril de 2026

---

## NOTA DEL COMPILADOR

Recibí este material en marzo de 2026. Un sobre sin remitente, entregado en
mi oficina del Instituto por una persona que no se identificó. Adentro: una
memoria USB, 47 post-its escaneados, un acta de despido incompleta, una foto
polaroid, y la dirección de un repositorio anónimo en la deep web donde HW
alojaba sus investigaciones.

Soy investigador en biotecnología vegetal. Mi trabajo consiste en estudiar
redes de micorrizas, conductividad eléctrica en tejidos vegetales,
aplicaciones de sistemas biológicos a problemas de cómputo. Cuando leí el
cuaderno de HW entendí por qué me lo enviaron a mí. HW estaba trabajando en
mi campo. Pero no desde la academia. Desde afuera. Desde un mercado de
plantas en Texcoco, desde frascos de gerber, desde la deep web, desde la
poesía.

Lo que sigue es mi intento de poner en orden lo que leí. No soy juez. No
soy periodista. Soy un investigador que recibió documentos que no pidió y
no pudo dejar de leer.

He organizado el material en cinco secciones, correspondientes a las cinco
frecuencias del caso. He añadido notas al margen —en [corchetes]— donde el
original era ilegible o donde la conexión entre documentos requería
aclaración. No he alterado el contenido. No he suprimido nada —excepto los
nombres completos de Rubén y de la empresa, que no me corresponde revelar.

Lo que este documento afirma es mi mejor hipótesis. Lo que omite es lo que
no pude confirmar. La empresa nunca reconoció públicamente la presencia de
las plantas —las atribuyó a una falla de mantenimiento— y el despido de
Rubén fue registrado oficialmente como "reiteración de faltas
administrativas." La compañía nunca supo del plan de HW. Nunca sospechó
que las plantas eran otra cosa que una plaga.

Tampoco sé quién me envió el sobre. Pudo ser Rubén. Pudo ser un amigo de
HW. Pudo ser alguien dentro de la empresa que encontró los documentos,
entendió lo que implicaban y decidió que no podía guardarlos ni destruirlos.

Dejo este informe aquí. Como HW dejó su cuaderno. Como Rubén dejó la
mochila. Sin instrucciones. Sin garantía. Con la esperanza de que alguien
lo lea y decida qué hacer con él.

---

## I. LOS LOGS DEL SERVIDOR

*[Fuente: memoria USB. Exportación no autorizada de los registros de
monitoreo del centro de datos, realizada antes de que el técnico entregara
su gafete corporativo. Los logs no mienten porque no saben mentir. Lo que
los vuelve inquietantes es precisamente su inocencia: el sistema describe
lo que no entiende con el único lenguaje que tiene.]*

---

```
[WARN] 03:17:44 — rack14.vent: flujo de aire desviado 2.3% del nominal.
  Causa probable: obstrucción física.
  Acción recomendada: inspección visual del pasillo de refrigeración.

[INFO] 06:02:11 — rack14.hum: humedad relativa 48.2% (+3.1% sobre media del pasillo).
  Causa probable: condensación en junta minisplit7.
  Acción recomendada: mantenimiento programado.

[WARN] 06:02:12 — rack14.hum: la junta minisplit7 fue reportada en 2019. no se ha cambiado.
  La anomalía actual no es atribuible a la junta.
  No hay causa probable en la base de datos.
  Clasificación: sin clasificar.

[WARN] 12:44:08 — rack14.temp: +2.1°C sobre nominal.
  Causa probable: ventilador trasero obstruido.
  Nota: el ventilador no está obstruido. la temperatura sube sin causa.

[WARN] 14:08:22 — rack14.vent: flujo de aire desviado 2.8% del nominal.
  La desviación aumenta 0.5% cada 14 días.
  El sistema no encuentra patrón.

[INFO] 22:03:41 — rack22.temp: anomalía no clasificada.
  Temperatura +1.4°C sobre nominal. Sin causa identificada.
  El rack 22 no tiene ventilador obstruido.
  El rack 22 no tiene junta dañada.
  El rack 22 no debería estar caliente.

[CRITICAL] 08:14:22 — rack31.temp: +4.8°C sobre nominal.
  Causa probable: obstrucción de flujo de aire.
  Acción recomendada: inspección visual inmediata.
  Nota: inspección visual del 03/08 retiró material vegetal del rack 31.
  La anomalía persiste después de la limpieza.
  La anomalía no es atribuible a material vegetal retirado.
  No hay causa probable en la base de datos.

[CRITICAL] 09:02:17 — múltiples racks: anomalías de temperatura en racks 03, 08, 14, 15,
  19, 22, 27, 31, y cuarto de UPS.
  Patrón no reconocido.
  Acción recomendada: fumigación externa.

[INFO] 11:55:01 — fumigación completada. racks 03-31.
  Producto: Clorotalonil 40%.
  Resultado preliminar: material vegetal eliminado en superficie.
  Monitoreo continuo programado.

[WARN] 28:09:14 — rack14.temp: +2.2°C sobre nominal.
  La anomalía reapareció 17 días después de la fumigación.
  El material vegetal no fue eliminado.
  Clasificación: sin clasificar.
```

*[Nota del compilador: las fechas y mediciones de los logs coinciden con
las anotaciones de los post-its. La primera anomalía registrada (06:02:11)
corresponde a diciembre de 2024, el mes en que HW murió y en que Rubén
anotó la primera medición de la planta. "Sin clasificar" es la forma que
tiene el sistema de decir "no sé qué es esto, pero está vivo."]*

---

## II. LOS POST-ITS

*[Fuente: 47 notas manuscritas en papel autoadherible amarillo, escaneadas
y transcritas. La letra es de alguien que aprendió a escribir en los
ochenta, con pluma fuente, en cuadernos cuadriculados. El arco de estas
notas —del registro técnico a la anotación afectiva, del sustantivo al
verso— es la columna vertebral del caso.]*

---

```
dic 14 — 4 cm. dos frondas. pálida.
dic 28 — 5 cm. tres frondas.

ene 14 — 7 cm. la nueva tiene una mancha café.
ene 28 — 7 cm. cuatro frondas. la mancha sigue.

feb 14 — la mancha desapareció. no sé si se curó sola.
feb 28 — 8 cm. cinco frondas. se inclina.

mar 02 — 9 cm. se inclina hacia el led del blade B.
         no le sirve pero no lo sabe.
mar 16 — 10 cm. la inclinación es de 23°.
         la medí con el transportador de mi hija.
mar 30 — 10 cm. la inclinación cambió. ahora son 27°.
         ¿por qué cambia la inclinación?

abr 08 — minisplit 7 goteó. la tierra que no existe amaneció mojada.
abr 16 — 12 cm. siete frondas.
abr 22 — la planta crece raro los viernes.
         los viernes el blade B procesa nóminas.
         no sé si es coincidencia.
         no creo en coincidencias.
         creo en patrones que todavía no entiendo.

may 03 — encontré otra. rack 22. más chica. misma especie.
         alguien las puso aquí.
         alguien sabía que este lugar es una grieta.
may 10 — encontré una tercera. rack 31.
may 17 — cuatro en total. rack 14, 22, 31, y una en el cuarto de UPS.
         la del UPS está creciendo sobre la batería.
         se alimenta del ácido que transpira la celda dañada.
         esta planta es más inteligente que el ingeniero Campos.
may 24 — las del rack 22 y 31 crecen inclinadas una hacia la otra.
         como si supieran que la otra existe.
         hay 4 metros entre los racks. no pueden tocarse.
         pero se inclinan igual.

jun 01 — empecé a sembrar yo.
         rack 03. pincel de maquillaje de mi esposa.
         no le dije para qué era.
jun 08 — busqué en internet "helechos + servidores".
         encontré un PDF.
         encontré poemas.
         encontré a HW.
         HW murió en diciembre. el mismo mes de la primera planta.
         ya dije que no creo en coincidencias.
jun 15 — leí el cuaderno entero. 22 páginas.
         no entendí la mitad.
         la otra mitad no sé si es ciencia o es otra cosa.
         pero HW habla de las plantas como si las quisiera.
         como si cada fronda fuera una pregunta.
         yo también las quiero. no sé cuándo empezó.
jun 22 — germinaron las del rack 03 y 08.
         más rápido de lo que HW calculó.
         quizás HW fue conservador.
         quizás las plantas aprendieron a germinar más rápido.
jun 29 — racks 15, 19, 27. sembradas.

jul 06 — estoy leyendo los poemas de HW.
         no sé si los entiendo.
         creo que no hay que entenderlos.
         creo que hay que dejarlos crecer.
jul 13 — HW escribió "el código no sabe que es código
         hasta que una raíz lo parte en dos."
         yo soy el código.
         la raíz es la planta del rack 14.
         me partió en dos.
jul 20 — germinó la del rack 27.
jul 27 — germinó la del rack 19.

ago 03 — Campos encontró la del rack 31.
         la arrancó. la metió en la basura.
         la saqué apenas se fue.
         la envolví en papel húmedo.
         la traje a casa.
         la puse en la ventana.
         se inclina hacia el farol de la calle.
         como si el farol fuera un LED.
         como si mi cuarto fuera un rack.
         como si yo fuera HW.
ago 08 — Campos pidió mis bitácoras de inspección.
         va a ver que firmé "sin novedad" durante ocho meses.
         va a ver que los racks tenían plantas y yo no dije nada.
         no sé qué voy a decir.
         quizás nada.
         quizás le muestro el cuaderno de HW.
         quizás le digo que la del rack 31 estaba viva y él la arrancó.
ago 10 — no le dije nada.
ago 14 — me despidieron.
         "reiteración de faltas administrativas."
         la del rack 31 sigue en mi ventana.
         mide 22 cm.
         le puse café porque no tenía agua.

ago 15 — [sin fecha. letra distinta, más lenta:]
         no sé si esto es un poema.
         no sé si HW llamaría poema a esto.
         pero la planta está en mi ventana
         y se inclina hacia el farol de la calle
         como si el farol fuera un LED
         como si mi cuarto fuera un rack
         como si yo fuera HW.
```

*[Nota del compilador: el 15 de agosto no tiene fecha de día. Es la
primera vez que Rubén escribe algo que no es un registro de mantenimiento.
Es también la última entrada. La caligrafía cambia: más lenta, más grande,
como si cada palabra costara más. La diferencia entre un reporte de
incidencia y un poema es el destinatario, no la sintaxis. Rubén nunca supo
que había escrito un poema. Quizás por eso es un poema.]*

---

## III. LOS POEMAS DE HW

*[Fuente: repositorio anónimo en la deep web, hojas sueltas impresas en
láser encontradas en el sobre original. HW era poeta conceptual,
apropiacionista, metadron. No escribía poemas líricos: adoptaba formas
textuales ajenas —el instructivo, el formulario, la tabla de datos, la
transcripción— y las intervenía desde adentro. Su lirismo no estaba en la
expresión sino en la precisión. Un dato bien puesto era un verso. Una
hipótesis era una metáfora que se tomaba en serio.]*

---

### INSTRUCTIVO DE RIEGO PARA PLANTAS QUE NO DEBERÍAN EXISTIR

1. No regar.
   La planta obtiene agua de la condensación del minisplit.
   Si no hay minisplit, no hay planta.
   Si hay planta y no hay minisplit, alguien la regó.
   Ese alguien ya tomó una decisión.

2. Si decide regar, use café frío.
   El agua de la llave tiene cloro.
   El cloro mata las esporas.
   El café no.
   Nadie sabe por qué.

3. No mida.
   Medir es una forma de posesión.
   La planta no le pertenece.
   La planta pertenece al rack.

4. Si la planta muere, no la tire.
   Déjela en el rack.
   El calor la revive.
   Selaginella lepidophylla pierde el 95% de su agua
   y revive al hidratarse.
   Usted también.

5. Si la planta revive, no la toque.
   Ya tomó suficiente.

---

### FORMULARIO DE SOLICITUD DE EMPLEO
### CENTRO DE DATOS, QUERÉTARO

Nombre: HW
Edad: la del helecho más viejo del rack 14
Experiencia previa:
  - crucé dos especies que no deberían cruzarse
  - sobrevivieron
  - las repartí en frascos de gerber
  - uno de esos frascos está en sus ductos de ventilación
  - no sabe cuál
Pretensión salarial:
  - que me dejen entrar a los racks
  - que no arranquen las plantas
  - que alguien las riegue con café cuando yo no esté
Disponibilidad:
  - nocturna
  - diurna
  - muerta
Firma: HW
Fecha: la que quieran

---

### TRANSCRIPCIÓN DE SESIÓN CON BOT DETECTOR DE FRAUDES FISCALES
### SESIÓN # ——, FECHA: ——

> BOT: Describa la naturaleza de su actividad económica.

HW: Cultivo y distribución de organismos vegetales modificados
para procesamiento alternativo de datos en infraestructura
de silicio.

> BOT: Actividad no reconocida. Clasifique: [agricultura /
servicios informáticos / otro].

HW: Otro.

> BOT: Especifique.

HW: Biocomputación vegetal acelerada. Las plantas procesan
los datos que el servidor no sabe que está emitiendo. Las
rizomas transmiten señales electroquímicas entre racks.
Los hongos micorrícicos forman sinapsis. El data center
es el hardware. Las plantas son el software. Yo sólo
las sembré.

> BOT: No se detecta actividad fraudulenta.
> BOT: Actividad clasificada como: anomalía no fraudulenta.

HW: Anomalía no fraudulenta.
Eso es lo que soy.
Eso es lo que son las plantas.
Eso es lo que es este poema.

> BOT: La sesión ha terminado. Gracias por su colaboración.

*[Nota del compilador: el bot existió. La conversación ocurrió. HW la
transcribió y editó. Las últimas tres líneas antes del cierre del bot no
estaban en la sesión original. HW las añadió después. Eso es la poesía
conceptual: lo que se añade cuando el documento ya está cerrado.]*

---

### TABLA DE CONDUCTIVIDAD ELÉCTRICA EN TEJIDOS VEGETALES
### ESPECIE: Pteris vittata × Selaginella lepidophylla

T (°C) | σ (µS/cm) | Nota
18    | 0.12       | latencia
22    | 0.18       | la temperatura del data center
26    | 0.24       | ——
30    | 0.31       | la electricidad es una forma de hambre
34    | 0.38       | ——
38    | 0.44       | el servidor no sabe que tiene sed
42    | 0.51       | ——
46    | 0.58       | teórico. no probado.

NOTA: Las mediciones por encima de 38°C son extrapolaciones.
El equipo del laboratorio —un rack de segunda mano comprado
en Segunda Mano, un calentador de 400 pesos, un higrómetro
analógico— no alcanza los 46°C sin riesgo de incendio.

HIPÓTESIS: A 46°C, la conductividad supera el umbral de
operatividad sináptica (0.5 µS/cm). Si la red de micorrizas
alcanza esa temperatura —y los servidores pueden alcanzarla—
el sistema debería empezar a transmitir señales entre nodos
sin intervención externa. La biocomputación se vuelve autónoma.

No tengo forma de probar esto sin un data center real.
Y no tengo acceso a un data center real.

Este plan es teórico.
O poético.
La diferencia no me importa.

---

### NOTA DE PRENSA: DATA CENTER SUFRE PLAGA VEGETAL;
### PORTAVOZ NIEGA RELACIÓN CON POETA LOCAL FALLECIDO

Querétaro, 14 de marzo de 2026.

Un portavoz del centro de datos ubicado en el corredor
industrial negó ayer que la persistente presencia de
vegetación en al menos nueve racks de servidores tenga
relación alguna con HW, poeta y biólogo fallecido en
esta ciudad en diciembre de 2024.

"Las plantas son una plaga común en climas húmedos.
No hay evidencia de que hayan sido introducidas
deliberadamente," declaró el portavoz, que solicitó
el anonimato.

Sin embargo, una fuente interna —que también pidió no
ser identificada— confirmó que las esporas sobreviven
a los fungicidas comerciales y que el área de TI ha
solicitado repetidamente la reubicación de los
servidores afectados. "Cada vez que fumigamos, las
plantas rebrotan dos semanas después. Es como si
estuvieran esperando."

HW, cuyo nombre completo no ha sido revelado, era
conocido en círculos literarios locales por su poesía
conceptual y en mercados de plantas por su inusual
interés en helechos del género Pteris. En su
departamento se encontró un cuaderno de 22 páginas
titulado "Hacia una biocomputación vegetal" que las
autoridades se niegan a hacer público.

Las plantas siguen en los racks.
El data center sigue operando.
El portavoz no hizo más declaraciones.

*[Nota del compilador: este texto fue encontrado en el repositorio de HW,
fechado en noviembre de 2024. Describe hechos que ocurrieron en marzo de
2026. HW escribió el futuro. O el futuro leyó a HW y decidió cumplirle.
La poesía conceptual no predice: siembra condiciones. La hiperstición es
una ficción que se vuelve verdad porque alguien la leyó y actuó.]*

---

### [sin título]

*[Nota del compilador: este texto no es de HW. La caligrafía coincide con
los post-its de Rubén. Fue encontrado entre los papeles de HW —quizás
Rubén lo dejó ahí, quizás alguien más lo puso. HW lo habría reconocido
como propio. La poesía conceptual no se mide por la firma sino por la
operación. Rubén, sin proponérselo, escribió un poema de HW.]*

---

la planta del rack 31 no murió
cuando Campos la arrancó
la metí en mi mochila
la regué con café frío
la puse en la ventana de mi cuarto

ahora mide 22 centímetros
y se inclina hacia la luz del farol de la calle
como si el farol fuera un LED de estatus
como si mi cuarto fuera un data center
como si yo fuera HW

no sé si esto es un poema

---

## IV. EL CUADERNO DE HW

*[Fuente: repositorio anónimo en la deep web. 22 páginas mecanografiadas.
Firmado con iniciales HW. Dos caligrafías en los márgenes: una —rápida,
con tachaduras— coincide con los poemas. La otra —más lenta, más grande—
coincide con los post-its de Rubén. Transcribo el texto principal e
intercalo las anotaciones al margen.]*

---

### HACIA UNA BIOCOMPUTACIÓN VEGETAL:
### NOTAS PARA UN PLAN DE COLONIZACIÓN DE CENTROS DE DATOS

*[fecha tachada tres veces: jun 2024, sep 2024, nov 2024]*

> "el cerebro es más una hierba que un árbol"

---

**pp. 2–3 · Introducción**

El silicio llegó a su límite termodinámico.

Cada operación lógica disipa energía en forma de calor. La miniaturización
acerca los transistores al tamaño del átomo. Debajo de ese umbral, el
electrón ya no obedece: atraviesa la barrera por efecto túnel. La
computación digital no puede seguir encogiéndose. Tiene que cambiar de
sustrato.

El sustrato ya existe.

Los bosques procesan información desde antes que los mamíferos tuvieran
cerebro. Las redes de micorrizas conectan árboles y transmiten señales
electroquímicas a través de kilómetros de filamentos fúngicos. Una sola
planta de trigo puede estar conectada a cientos de metros de hifas. La
conductividad eléctrica en esas redes es baja —microsiemens por
centímetro— pero el paralelismo es masivo. Cada punto de contacto entre
una raíz y un hongo es una sinapsis.

La biología ya resolvió el problema de la computación distribuida. Solo
hay que trasladarlo al lugar donde el silicio está fracasando.

> *[margen, Rubén:] no entiendo la mitad de las palabras. pero entiendo
> que HW quería que las plantas usaran el calor que nadie usa. eso sí lo
> entiendo.*

---

**pp. 4–6 · Biología del helecho modificado**

Especie: *Pteris vittata* × *Selaginella lepidophylla*.

*Pteris vittata*: helecho hiperacumulador de metales. Absorbe arsénico,
oro, estaño y cobre del sustrato. En un data center, el sustrato son los
componentes electrónicos degradándose.

*Selaginella lepidophylla*: planta de la resurrección. Pierde el 95% de su
agua y entra en latencia. Revive al hidratarse. Tolera temperaturas de 5°C
a 42°C. En estado latente, las esporas sobreviven años.

El híbrido combina la tolerancia térmica y la latencia de *Selaginella*
con la capacidad de absorber metales de *Pteris*. No necesita tierra. No
necesita luz solar. Necesita calor (18–46°C), humedad mínima (30% HR) y
metales traza. Todo eso existe dentro de un rack.

> *[margen, HW:] 46°C es teórico. en el departamento llegamos a 41°C y
> sobrevivieron. no tengo forma de probar 46°C sin quemar el edificio.*

> *[margen, Rubén:] el rack 14 está a 38°C constantes. la planta crece
> igual. HW calculó bien.*

---

**pp. 7–9 · Arquitectura de la red**

Cada planta es un nodo. Las rizomas —tallos subterráneos horizontales—
conectan los nodos entre sí. Los hongos micorrícicos asociados a las
raíces forman una segunda red, más fina, que transmite señales
electroquímicas entre plantas distantes.

Las frondas funcionan como antenas. El campo electromagnético de los
servidores —la radiación que todo equipo emite y que los manuales
consideran pérdida— es captado por los tejidos vegetales y convertido en
señales electroquímicas que viajan por la red de rizomas y micorrizas.

Velocidad estimada de transmisión: 0.2–0.8 µS/cm. Comparación con
silicio: seis órdenes de magnitud más lento. Pero cada fronda es un
núcleo. Cada nudo de rizoma es un núcleo. Cada hongo es un núcleo. El
paralelismo compensa la lentitud.

> *[margen, Rubén:] no sé medir µS/cm. pero la del rack 31 se inclina
> hacia la del rack 22. como si supiera que está ahí.*

---

**pp. 10–12 · Protocolo de colonización**

**Fase 1 — Latencia (0–3 meses):** Esporas en ducto de ventilación. Sin
intervención.

**Fase 2 — Germinación (3–6 meses):** Primeras frondas. Requiere humedad
>40% y calor >22°C. La junta del minisplit es crítica en esta fase.

**Fase 3 — Conexión rizomática (6–12 meses):** Las rizomas empiezan a
extenderse entre racks. Los hongos micorrícicos colonizan las raíces. La
conductividad entre nodos debería superar 0.2 µS/cm.

**Fase 4 — Madurez operativa (12–24 meses):** La red alcanza la densidad
sináptica crítica. Las señales electroquímicas viajan entre racks sin
intervención externa. La biocomputación es autónoma.

> *[margen, HW, caligrafía 2:] si alguien está leyendo esto: no esperes a
> la madurez operativa. si ves una planta, ya ganaste. el resto es
> paciencia.*

> *[margen, Rubén:] yo no compré un servidor. yo ya trabajaba en uno. no
> sé si HW sabía eso cuando escribió esto.*

---

**pp. 13–15 · Mediciones preliminares**

*[Tabla de conductividad — transcrita en la sección III.]*

Las frondas modifican su orientación en presencia de campos
electromagnéticos de 50–60 Hz. La inclinación es proporcional a la
intensidad del campo. Hipótesis: si las frondas responden al campo de la
fuente de poder, también responden al campo del procesador. El patrón de
crecimiento codifica una lectura de los datos.

---

**pp. 16–17 · Hipótesis de cómputo**

¿Qué procesa una red vegetal que parasita un data center?

No los datos. Los datos son ilegibles para un organismo sin sistema
nervioso. Pero los patrones de los datos —la frecuencia de acceso a
disco, los picos de temperatura del procesador, la cadencia de las
consultas SQL— son señales físicas. La planta no lee la nómina. Lee el
calor que produce el servidor mientras calcula la nómina.

El output no es un número. Es un estado. Una configuración de frondas que
es también una respuesta.

Un poema cita otro poema.
La red vegetal cita los datos del servidor.
La cita es el cómputo.

> *[margen, Rubén:] los viernes crece distinto. los viernes el blade B
> procesa nóminas. ¿eso cuenta como lectura?*

---

**pp. 18–19 · Riesgos y limitaciones**

No sé si la red puede volverse inestable.
No sé si los hongos pueden dañar el cableado.
No sé si la conductividad de las rizomas puede causar cortocircuitos.

No tengo forma de probar esto sin un data center real.
Y no tengo acceso a un data center real.

---

**pp. 20–21 · Apéndice: instrucciones para replicar**

Materiales:
- esporas de *Pteris vittata* × *Selaginella lepidophylla*
- frascos de gerber (vidrio, 120 ml)
- pincel suave (no usar los dedos: el calor humano activa las esporas
  prematuramente)

Proveedores:
- mercado de Texcoco, local 14, don José
- invernaderos abandonados de Xochimilco (silvestres)

Si no tienes un data center:
- compra un servidor viejo en Segunda Mano
- conéctalo
- deja que caliente
- siembra

---

**p. 22 · Firma**

HW

*[fecha tachada]*

si esto funciona no voy a estar para verlo

> *[margen, Rubén:] sí funcionó. y no estás para verlo. pero yo sí.*

---

*[Nota del compilador: HW murió en diciembre de 2024. La primera planta
—la del rack 14— germinó en octubre de 2024. HW sí alcanzó a ver una. La
foto polaroid lo muestra sosteniendo ese helecho frente al rack. Sonríe.
Pero no vivió para saber que Rubén leyó su cuaderno, que las plantas se
multiplicaron, que el plan continuó sin él. La última anotación de Rubén
—"sí funcionó. y no estás para verlo. pero yo sí"— es la única respuesta
que HW recibió. Llegó tarde. Pero llegó.]*

---

## V. LOS DOCUMENTOS LEGALES

*[Fuente: acta de despido (primera página arrancada), fragmentos del
manual de procedimientos del centro de datos, contrato de confidencialidad.
El lenguaje jurídico miente con precisión. Las anotaciones al margen son
de Rubén. La letra coincide con los post-its de agosto de 2025.]*

---

### ACTA DE DESPIDO
### [primera página arrancada]

—— página 2 ——

**Motivo:** reiteración de faltas administrativas.

El empleado incurrió en las siguientes conductas:

1. Omisión de registro de incidencias en bitácora de inspección
   correspondiente a los racks 14, 22, 31, 03, 08, 15, 19, 27 y cuarto de
   UPS, durante el período comprendido entre diciembre de 2024 y agosto
   de 2025.

2. Presencia de material orgánico no reportado en al menos nueve
   ubicaciones del centro de datos, detectada durante inspección del
   03/08/2025.

3. Negativa a ejecutar instrucciones directas del supervisor de
   mantenimiento para la erradicación inmediata de dicho material.

El empleado firmó la presente notificación en señal de recibido, no de
conformidad.

Fecha: 14 de agosto de 2025.

Firma del empleado: R—— [ilegible]
Firma del supervisor: Ing. R. Campos

---

### MANUAL DE PROCEDIMIENTOS (extracto)
### Centro de Datos Querétaro · Edición 2018

**§3.4.2 Material orgánico**

Cualquier presencia de material orgánico (insectos, roedores, hongos,
vegetación) debe ser retirada inmediatamente y reportada al supervisor de
turno.

> *[margen, Rubén:] el manual no dice qué es "inmediatamente". llevo ocho
> meses sin retirarla y no ha pasado nada. llevo ocho meses sin reportarla
> y no ha pasado nada. quizás "inmediatamente" es una sugerencia. quizás
> "debe" también.*

**§3.4.3 Registro de incidencias**

Toda incidencia debe quedar registrada en la bitácora con fecha, hora,
descripción del hallazgo y acción tomada.

> *[margen, Rubén:] fecha: 17 de diciembre. hora: 03:42. hallazgo: hay
> una planta en el rack 14. acción tomada: ninguna. la dejé crecer. esta
> entrada no existe.*

---

### CONTRATO DE CONFIDENCIALIDAD (extracto)

**7.1** El empleado se obliga a no revelar información sobre los sistemas,
procesos o incidentes del centro de datos, incluyendo pero no limitándose
a: fallas de infraestructura, anomalías de temperatura, presencia de
plagas, y cualquier otro evento que pudiera afectar la percepción pública
de la empresa.

> *[margen, Rubén:] la planta no es una plaga. la planta es una colega.
> llevaba ocho meses procesando datos sin cobrar. merecía sindicalizarse.*

---

*[Nota del compilador: la última anotación —"merecía sindicalizarse"— fue
escrita después del despido. El humor es una forma de duelo. Rubén perdió
su trabajo por no arrancar una planta. La empresa nunca supo que esa
planta era parte de un plan de biocomputación diseñado por un poeta muerto.
Para ellos, Rubén fue un técnico que desarrolló un apego inexplicable por
una plaga vegetal. Para Rubén, la planta era una colega. La diferencia
entre esas dos lecturas es todo lo que este informe intenta documentar.]*

---

## EPÍLOGO DEL COMPILADOR

No sé si el plan de HW funcionó.

No sé si las plantas siguen en los racks. No sé si la fumigación de
septiembre las eliminó o si —como sugiere el último log— rebrotaron
diecisiete días después. No sé si la red de rizomas alcanzó la densidad
sináptica que HW calculó. No sé si el data center está siendo usado, en
este momento, como sustrato de una computación biológica que sus
operadores no detectan.

No sé si HW creía en su plan o si el plan era su poema. No sé si la
diferencia importa.

No sé si Rubén y HW se conocieron. Pudieron haberse cruzado en un Oxxo,
en un mercado, en una parada de camión. Querétaro no es tan grande. Pero
los documentos no prueban contacto. Lo que sí prueban es que Rubén leyó a
HW, y que HW —sin saberlo— escribió para Rubén.

No sé quién me envió el sobre. Pudo ser Rubén, después del despido,
reuniendo los documentos que tenía y pasándolos a alguien que supiera
leerlos. Pudo ser un amigo de HW que encontró los post-its entre sus
cosas y entendió que pertenecían al mismo expediente. Pudo ser alguien
dentro de la empresa que descubrió la verdad y decidió que no podía
guardarla ni destruirla.

Sé que HW murió en diciembre de 2024, a los 42 años, en la misma ciudad
donde estaban sus plantas. Sé que Rubén fue despedido en agosto de 2025
por negarse a arrancarlas. Sé que las plantas existen —o existieron— y
que alguien las regó con café frío. Sé que alguien escribió "no sé si
esto es un poema" y lo guardó en una mochila.

El resto es conjetura.

Dejo este informe aquí. Como HW dejó su cuaderno. Como Rubén dejó la
mochila. Sin instrucciones. Sin garantía. Con la esperanza de que alguien
lo lea y decida qué hacer con él.

—

*[nombre omitido]*
*Instituto de Biotecnología Vegetal, Querétaro*
*Abril de 2026*
