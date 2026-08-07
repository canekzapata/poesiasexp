# Cuadernos de Especulaciones Poéticas

## Protocolo Maestro

**Documento de producción · agosto de 2026**

Este protocolo reemplaza a los protocolos anteriores de poemarios fijos y generativos.
Organiza la creación de un cuaderno en tres momentos: declarar el problema, elegir el
modo de fijación, construir la arquitectura. No es un manual neutro. Es una herramienta
para hacer libros que leen lo que las computadoras escriben.

---

## 1. Antes de empezar

Leer obligatoriamente:

1. `MANIFIESTO_CEP.md`
2. `PORQUE_HACER_LIBROS.md`
3. Este protocolo.

El cuaderno no puede contradecir el manifiesto. Puede ser más específico.

---

## 2. Declarar el problema

Un cuaderno no empieza con un tema. Empieza con una pregunta material o formal.

Ejemplos de problemas válidos:

- ¿Qué pasa si una máquina lee un informe técnico y lo convierte en un libro de ficción administrativa?
- ¿Qué tipo de poema aparece si la computadora decide el orden de las páginas pero no el de las frases?
- ¿Puede un libro ser un sistema que produce una edición distinta cada vez que se abre?
- ¿Qué queda cuando la máquina repite una misma frase cien veces y el humano decide cuál de las repeticiones es el poema?
- ¿Cómo registrar el costo de una computación como parte de la composición de un libro?

La pregunta debe ser lo suficientemente concreta para saber cuándo el cuaderno falla.

---

## 3. Elegir el modo de fijación

El modo de fijación decide qué parte del libro queda estable y qué parte puede variar.

### 3.1 Fijación total

La edición publicada es una secuencia estable. El lector recibe un objeto fijo: PDF,
impresión, imágenes paginadas, libro físico.

- El azar puede usarse durante la composición, pero la edición final elige una secuencia determinada.
- El número de páginas es definido.
- El orden de lectura es fijo.
- Anomalías: seleccionadas y justificadas por su efecto en el conjunto.
- El lector no necesita modificar el archivo para completar la obra.
- La máquina debe quedar visible como procedimiento: el colofón registra qué se generó,
  qué se seleccionó, qué se descartó.

### 3.2 Fijación parcial

Hay reglas y materiales fijos, pero cada ejecución puede variar. La variación puede ser:

- **inicial**: la computadora produce una edición antes de que el lector la reciba;
- **durante la lectura**: la secuencia se compone mientras el lector avanza;
- **por interacción**: una acción del lector modifica materiales, orden, estado o reglas;
- **persistente**: la lectura deja una huella que afecta futuras sesiones o lectores.

Requisitos mínimos:

- una entrada clara y un título identificable;
- una forma de iniciar, reiniciar o cerrar la ejecución;
- semilla visible o registrable cuando exista azar;
- estado y cambios de estado explicables;
- funcionamiento razonable sin depender de servicios externos no declarados;
- alternativa legible para textos esenciales;
- ausencia de recolección de datos no necesaria para la obra;
- registro de navegador, versión, dependencias y fecha de prueba;
- captura o exportación de una salida representativa;
- instrucciones para ejecutar localmente cuando sea posible.

### 3.3 Fijación documental

El sistema mismo es el libro. No se busca una edición única, sino conservar el
mecanismo que hace posibles las ediciones.

- El código, las reglas, las semillas, los materiales y las capturas son la obra.
- Debe poder ejecutarse o estudiarse sin depender de servidores no declarados.
- El colofón debe describir cómo reproducir una ejecución y qué puede variar.
- Puede combinarse con una edición fija que documente una salida representativa.

---

## 4. Documentos de trabajo

Un cuaderno puede organizarse en tres documentos de trabajo. Esta división no es
obligatoria, pero evita que historia, especificación y materiales se solapen o crezcan
al mismo tiempo.

1. **Tema e historia** — el problema, la premisa, la pregunta central, el arco afectivo,
   las tensiones políticas y las reglas del mundo. Decide qué libro se quiere hacer y por qué.
2. **Tono y forma** — la voz, los tipos de enlace o secuencia, el sistema de anotaciones,
   la arquitectura de páginas, las formas recurrentes, el ritmo, el vocabulario permitido
   y prohibido. Decide cómo se hace.
3. **Mundo, material, voces y archivo** — elenco, espacio, objetos, tecnología, corpus,
   fuentes, procedencias, reglas de variación y reglas del archivo tardío. Decide con qué
   se hace y de qué está hecho.

A partir de estos tres documentos, el cuaderno se construye mediante:

- un **corpus** o fuente de materiales procesables (texto plano, JSON, CSV, scripts, imágenes, sonidos);
- un **motor** o procedimiento que transforma el corpus en páginas (prompt, generador, script, motor web, sistema de maquetación);
- una **ficha de entrada** y un **colofón** que enmarcan y responden por el libro;
- un **README** con el estado actual del proyecto;
- las **salidas** generadas: PDF, impresión, página web, ejecutable, capturas, etc.

El texto final del cuaderno no tiene que vivir en un documento de trabajo. Puede ser
generado a partir del corpus y el motor. El trabajo creativo está en diseñar la
arquitectura, no en transcribir poemas de antemano.

## 5. Arquitectura mínima

Todo cuaderno debe considerar, aunque pueda deformarlas:

1. **Portada o cubierta.** Primera operación del libro. Título, serie, temperatura,
   indicio del procedimiento.
2. **Aire inicial.** Página de guarda, vacío, demora, nota sin contexto, interrupción.
3. **Portadilla y ficha de entrada.** Situar el cuaderno sin agotarlo.
4. **Índice.** Puede ser convencional, incompleto, desplazado, contradictorio o poético.
5. **Umbral.** Instrucción breve sobre cómo leer, qué esperar, qué ignorar.
6. **Cuerpo.** Poemas, textos, imágenes, gráficas, pausas, repeticiones, anomalías.
7. **Zonas de silencio o suspensión.** Páginas donde algo no escrito tiene presencia.
8. **Anomalías.** Transgresiones deliberadas del sistema.
9. **Colofón ampliado.** Memoria técnica, ética y económica del libro.
10. **Página final.** Cierra, desvía, devuelve al índice, declara una imposibilidad o
    deja abierta la experiencia.

---

## 6. Materiales

Preparar:

- corpus, textos, notas, imágenes, datos, sonidos traducidos a texto;
- fuentes tipográficas con licencia de uso;
- capturas, fragmentos, palabras, instrucciones, errores;
- archivos de versiones y descartes;
- registro de procedencia, permisos y exclusiones éticas.

Diferenciar:

- material que puede citarse;
- material que solo puede transformarse;
- material que debe permanecer ausente.

---

## 7. El prompt como partitura

El prompt maestro debe declarar:

- qué libro se quiere hacer;
- qué materiales entran y cuáles quedan fuera;
- qué operaciones puede realizar la computadora;
- qué restricciones no puede romper;
- qué papel tienen el azar, el error y el silencio;
- cómo se construyen texto, gráfica, secuencia y espacio;
- qué hará el lector;
- qué condiciones materiales sostienen el trabajo;
- cómo circulará la edición;
- cómo se registrará la versión resultante.

El prompt no pide únicamente contenido. Pide comportamiento, estructura, ritmo,
materialidad y memoria.

---

## 8. Protocolo de anomalías

Una anomalía es una transgresión deliberada del sistema del libro. No es un error
accidental.

Pasos:

1. Definir las condiciones del libro (por ejemplo: ubicación, firma, margen, función,
   autorización, numeración, tipografía, color).
2. Decidir cuántas condiciones puede transgredir el cuaderno y en qué páginas.
3. Justificar cada transgresión por su efecto en el conjunto.
4. Registrarla en el colofón.

Reglas:

- No toda anomalía debe conservarse. Corregir lo que rompe el sistema sin producir
  pensamiento.
- No toda anomalía es poética. Conservar solo lo que hace visible la máquina, el
  sistema o la lectura.
- Una anomalía debe poder leerse como composición, no como error de imposición.

---

## 9. Generación y selección

1. Generar varias salidas. La primera es hipótesis; la segunda muestra repetición; la
   tercera puede mostrar el sistema.
2. Comparar y curar. Elegir no la más pulida, sino la que mejor hace visible la lógica
   del cuaderno.
3. Componer la secuencia. Revisar página por página: portada, aire, índice, umbral,
   cuerpo, pausas, gráficas, anomalías, colofón, final.
4. Registrar el accidente. Anotar qué apareció sin ser pedido, qué no pudo hacer el
   sistema, qué se corrigió y qué se decidió conservar.
5. Fijar la edición según el modo elegido.

---

## 10. Colofón ampliado

Todo cuaderno debe responder en el colofón:

- título, serie, fecha, versión y lugar de generación;
- quién propuso el problema y quién preparó los materiales;
- qué computadora, modelo, programa o código intervino;
- qué fuentes, archivos y corpus se usaron;
- qué trabajo, tiempo, dinero, cuidados e infraestructura lo hicieron posible;
- qué se conservó y qué se descartó;
- qué anomalías se conservaron y por qué;
- bajo qué licencia o régimen circula;
- qué no pudo hacer la máquina;
- cuál es la relación del lector con la edición.

En cuadernos que usan modelos de lenguaje, registrar también:

- modelo, versión, fecha de uso;
- número aproximado de tokens gastados;
- número de versiones generadas y descartadas;
- costo aproximado, si es posible;
- datos de entrenamiento relevantes o sus limitaciones éticas conocidas;
- qué partes fueron curadas, corregidas o reescritas por humanos.

---

## 11. Circulación

La forma de circulación es una decisión de composición.

Posibles modos:

- mercancía (venta);
- regalo;
- archivo;
- deuda;
- edición abierta;
- bien común;
- combinación.

El colofón debe declarar el modo elegido y qué produce ese modo de lectura.

---

## 12. Verificación

### Para cualquier cuaderno

- [ ] El problema está declarado.
- [ ] El modo de fijación está declarado.
- [ ] La arquitectura mínima está considerada.
- [ ] Las anomalías están justificadas y registradas.
- [ ] El colofón responde por todos los puntos.
- [ ] No se trata el texto como placeholder.
- [ ] No se agregan frameworks, animaciones o efectos genéricos sin razón concreta.

### Para fijación total

- [ ] Número exacto de páginas; ningún blanco no previsto.
- [ ] Secuencia de lectura fija; folios correctos según las reglas del diseño.
- [ ] Fuentes incrustadas; texto seleccionable.
- [ ] Acentos, comillas, rayas, caracteres especiales correctos.
- [ ] Márgenes y sangrados según especificación, incluyendo invasiones deliberadas.
- [ ] Prueba impresa o vista de miniaturas del PDF.
- [ ] Texto, imagen, gráfica y tipografía forman un solo sistema.

### Para fijación parcial o documental

- [ ] Funciona localmente sin servicios externos no declarados.
- [ ] Semilla visible o registrable.
- [ ] Estado explicable y observable.
- [ ] Inicio, reinicio y cierre definidos.
- [ ] No errores fatales en consola.
- [ ] No fugas de listeners, timers, nodos de audio ni requestAnimationFrame.
- [ ] Capturas o salidas representativas.
- [ ] Accesibilidad mínima: alternativa legible, respeto a `prefers-reduced-motion`,
  gesto explícito antes de audio.

---

## 13. Regla final

Hacemos libros para descubrir qué clase de escritura aparece cuando una computadora
puede ordenar materiales, administrar silencios, calcular repeticiones, inventar una
página y decidir que ya es hora de terminar.

La máquina no elimina la autoría. La distribuye, la desplaza y la vuelve responsable
de sus condiciones.

El procedimiento también debe poder leerse.
