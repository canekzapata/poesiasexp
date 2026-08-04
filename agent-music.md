# AGENTS.md — Sistema musical algorítmico y post-espectral

## Alcance

Estas instrucciones gobiernan todo análisis, propuesta, implementación, depuración o revisión relacionada con audio, música algorítmica, interacción sonora, Tone.js, Web Audio API, Faust, WebAssembly o AudioWorklet dentro de esta carpeta y sus subcarpetas.

Antes de modificar código:

1. Lee los archivos de la pieza y comprende su narrativa.
2. Localiza la arquitectura sonora existente.
3. Conserva los cambios del usuario y la identidad visual, textual y musical de la obra.
4. Explica brevemente el comportamiento actual antes de proponer una sustitución.
5. No implementes código si el usuario pidió únicamente teoría, estudio o diseño.

Una instrucción explícita del usuario tiene prioridad sobre este documento.

---

## Propósito artístico

La música no es fondo, decoración ni acompañamiento atmosférico.

Debe ser una parte sustancial de la pieza: un organismo que observa la lectura, conserva rastros de las acciones del lector y transforma esos rastros en consecuencias musicales.

La interacción no debe reducirse a:

```text
acción del lector → nota o efecto inmediato
```

El modelo preferido es:

```text
acción
→ interpretación
→ memoria
→ transformación del estado musical
→ consecuencia inmediata o futura
```

Una acción puede:

- modificar un sonido inmediatamente;
- reaparecer transformada minutos después;
- alterar la probabilidad de acontecimientos futuros;
- contaminar otra familia sonora;
- acumularse con acciones semejantes;
- erosionarse gradualmente;
- cambiar la interpretación de acciones posteriores;
- desaparecer sin producir una recompensa;
- regresar como residuo difícil de reconocer.

El lector no toca directamente un instrumento. Modifica las condiciones bajo las cuales el instrumento recuerda, escucha y evoluciona.

---

## Horizonte musical

Trabaja desde el espectralismo y el post-espectralismo, especialmente desde la música entendida como transformación de materia sonora en el tiempo.

No reduzcas el espectralismo a construir acordes con la serie armónica.

Considera:

- el espectro como forma temporal;
- el timbre como armonía;
- la armonía como estado del timbre;
- transiciones entre harmonicidad, inarmonicidad y ruido;
- batimientos y rugosidad;
- diferencias de fase;
- resonancias y frecuencias fantasma;
- transformaciones continuas;
- respiraciones formales largas;
- sedimentación, contaminación y erosión;
- umbrales donde un fenómeno cambia de identidad;
- procesos perceptibles que nunca se repiten exactamente;
- silencios que tienen consecuencias.

Evita caer automáticamente en:

- ambient genérico;
- arpegios aleatorios;
- loops de cuatro u ocho compases sin evolución;
- música MIDI con efectos superficiales;
- recompensas sonoras de videojuego;
- correspondencias ilustrativas entre palabra y sonido;
- acumulación permanente de capas;
- aleatoriedad sin memoria;
- saturación utilizada como sustituto de complejidad.

La gamificación debe consistir en descubrir, aprender y alterar parcialmente el comportamiento del organismo musical. No debe depender de puntos, niveles o premios convencionales salvo que la pieza los requiera conceptualmente.

---

## Arquitectura obligatoria

Mantén separadas cinco capas:

### 1. Observación

Registra solamente acciones significativas para la pieza, por ejemplo:

- enlaces visitados;
- orden de navegación;
- entradas y salidas de regiones;
- tiempo de permanencia;
- pausas;
- velocidad de lectura;
- desplazamiento;
- regresos;
- repeticiones;
- rutas abandonadas;
- inactividad;
- teclado, cursor, micrófono o cámara cuando sean necesarios.

No conectes eventos crudos directamente con el sintetizador.

Primero convierte las acciones en rasgos musicales normalizados.

### 2. Memoria

Mantén un estado musical independiente del DOM y de la interfaz.

Considera como mínimo:

```js
{
  shortTerm,
  phraseMemory,
  longTerm,
  residues,
  fatigue,
  novelty,
  entropy,
  silenceDebt,
  spectralTrace
}
```

Interpretación sugerida:

- `shortTerm`: actividad de los últimos segundos;
- `phraseMemory`: comportamiento de la sección actual;
- `longTerm`: historia acumulada de la sesión;
- `residues`: acontecimientos incompletos capaces de regresar;
- `fatigue`: resistencia a repetir una respuesta;
- `novelty`: diferencia entre la acción presente y la historia;
- `entropy`: diversidad del recorrido;
- `silenceDebt`: necesidad acumulada de retirar sonido;
- `spectralTrace`: huella tímbrica producida por la lectura.

Cada memoria debe tener su propio ritmo de decaimiento.

No todo debe conservarse y no todo debe olvidarse simultáneamente.

Si se usa `localStorage` o `IndexedDB`, guarda estados musicales compactos y explícitos. No almacenes grabaciones, imágenes ni datos sensibles sin necesidad conceptual y autorización clara.

### 3. Composición

JavaScript administra la dramaturgia musical y decide:

- aparición y desaparición de familias sonoras;
- cambios de densidad;
- procesos de rarefacción;
- duración de fases;
- recurrencias deformadas;
- trayectorias espectrales;
- mutaciones;
- ventanas de silencio;
- cambios de régimen;
- consecuencias futuras de la lectura.

JavaScript decide qué proceso debe ocurrir y por qué.

No debe realizar DSP muestra por muestra en el hilo principal.

### 4. Tiempo

Usa Tone.js principalmente para:

- transporte;
- tempo;
- scheduling;
- sincronización;
- ciclos;
- secuencias;
- cambios de densidad;
- acontecimientos programados.

Tone.js organiza el tiempo. No necesita producir toda la materia sonora.

Reglas:

- usa el tiempo de audio recibido por el callback;
- no uses `setInterval`, `setTimeout` o `requestAnimationFrame` como reloj musical preciso;
- separa tiempo visual, tiempo narrativo y tiempo de audio;
- no cuantices toda la obra si el proceso requiere duraciones irregulares;
- programa transformaciones continuas mediante automatizaciones de `AudioParam`.

### 5. DSP

Usa Web Audio API como grafo común.

Orden de preferencia:

1. nodos nativos de Web Audio cuando sean suficientes;
2. Tone.js para prototipos, instrumentos convencionales y scheduling;
3. Faust compilado a WebAssembly para DSP complejo y estable;
4. AudioWorklet para algoritmos propios, síntesis granular, feedback o procesamiento por bloque.

Procesos posibles:

- bancos aditivos de parciales;
- perfiles espectrales interpolables;
- resonadores;
- bancos de filtros;
- síntesis cruzada;
- granularidad con memoria;
- convolución dinámica;
- congelamiento espectral;
- modulación de fase;
- feedback limitado;
- distorsión dependiente de energía;
- espacialización vinculada a la historia;
- transformaciones entre sonido estable, rugosidad y ruido.

---

## Modelo musical previo al código

Antes de implementar una nueva función sonora, define cuatro niveles:

### Materia

¿De qué está hecho el sonido?

Describe fuentes, muestras, osciladores, ruido, parciales, resonadores y límites de energía.

### Morfología

¿Cómo nace, se sostiene, se transforma y desaparece cada familia sonora?

No uses la misma envolvente para todos los acontecimientos.

### Forma

¿Qué transformación puede percibirse durante varios minutos?

La forma debe emerger de procesos y consecuencias, no de una lista fija de escenas.

### Memoria

¿Qué aprende, conserva, deforma y olvida el sistema?

Define qué puede regresar, después de cuánto tiempo y bajo qué condiciones.

Si alguno de estos niveles no está definido, detente y propón primero un modelo musical.

---

## Diseño de mapeos

Antes de implementar interacciones, crea una tabla con:

| Acción o rasgo | Variable musical | Escala temporal | Memoria | Consecuencia |
| --- | --- | --- | --- | --- |
| Permanencia | estabilidad espectral | lenta | promedio con decaimiento | convergencia de parciales |
| Navegación rápida | densidad | media | actividad reciente | fragmentación |
| Regreso | recurrencia | larga | historial de rutas | retorno deformado |
| Repetición | fatiga | progresiva | contador ponderado | debilitamiento o mutación |
| Inactividad | silencio | variable | `silenceDebt` | respiración o recuerdo |
| Ruta improbable | inarmonicidad | larga | novedad | aparición de material raro |

Estos ejemplos no son reglas universales. Adapta cada relación a la narrativa de la pieza.

No hagas correspondencias arbitrarias sólo porque sean fáciles de programar.

---

## Azar

No distribuyas llamadas a `Math.random()` por todo el código.

Centraliza el azar en un generador o motor de decisiones.

Cuando sea útil, emplea una semilla reproducible.

Separa:

- decisiones estructurales;
- decisiones de sección;
- variaciones microscópicas.

Las probabilidades deben depender del estado, la historia y la fatiga.

Procesos recomendados:

- distribuciones ponderadas;
- caminatas limitadas;
- cadenas de Markov condicionadas;
- grafos de estados;
- autómatas;
- agentes con recursos finitos;
- mutaciones con herencia y desgaste;
- interpolaciones continuas.

El azar propone. La memoria condiciona. La forma decide.

---

## Reglas técnicas

### Contexto de audio

- Mantén un solo contexto de audio compartido.
- Tone.js, Web Audio, Faust y los worklets deben utilizar ese contexto.
- Inícialo o reanúdalo después de un gesto explícito del usuario.
- No crees contextos adicionales para resolver problemas de routing.
- Obtén el `BaseAudioContext` nativo cuando una API no acepte el wrapper de Tone.js.
- Toda señal debe terminar en un bus maestro controlado.

### AudioWorklet

- No introduzcas `ScriptProcessorNode`.
- Carga cada módulo una sola vez por contexto.
- Protege `audioWorklet.addModule()` con una promesa compartida.
- Usa nombres únicos en `registerProcessor()`.
- No registres dinámicamente dos veces el mismo procesador.
- Crea el `AudioWorkletNode` con el contexto que cargó su módulo.
- No accedas al DOM desde el worklet.
- Evita `fetch`, logging continuo y asignaciones grandes dentro de `process()`.
- Comunícate con JavaScript mediante mensajes pequeños y limitados.
- Limpia listeners y referencias al desmontar la pieza.

### Scheduling

- Usa el tiempo exacto proporcionado por el scheduler.
- No dispares ataques usando la hora tardía del callback de JavaScript.
- Usa rampas para cambios continuos.
- Evita discontinuidades instantáneas de ganancia y frecuencia.
- Cancela eventos y automatizaciones al reiniciar una escena.

### Rendimiento

Define límites explícitos para:

- voces simultáneas;
- parciales;
- granos por segundo;
- convoluciones;
- tamaño de buffers;
- frecuencia de mensajes;
- analizadores;
- listeners;
- timers.

Implementa degradación elegante.

Antes de producir clics o bloquear la página:

- reduce voces;
- disminuye parciales;
- baja la densidad granular;
- reduce frecuencia de análisis;
- conserva la estructura musical.

No crees y destruyas nodos en cada frame visual.

Reutiliza nodos, buffers, tablas de onda y grafos estables.

### Seguridad auditiva

- Usa ganancia por familia.
- Usa bus maestro.
- Incluye limitador o compresor de seguridad.
- Aplica rampas de entrada y salida.
- Limita el feedback.
- Detecta valores `NaN`, infinitos y amplitudes anormales.
- No normalices automáticamente una textura silenciosa.
- Considera el silencio como un estado válido.

---

## Integración audiovisual

La imagen, el texto y el sonido pueden compartir estado, pero no deben duplicarse literalmente.

Hydra, p5.js, Canvas o WebGL pueden leer:

- descriptores musicales;
- memoria;
- energía;
- densidad;
- centroide;
- un `AnalyserNode`.

La animación visual nunca debe gobernar el reloj de audio.

Evita:

- una nota por palabra;
- un flash por golpe;
- una animación por cada evento;
- visualizaciones que expliquen completamente el algoritmo.

Busca relaciones de:

- anticipación;
- demora;
- contradicción;
- ocultamiento;
- residuo;
- memoria;
- falsa causalidad.

---

## Flujo de trabajo

Para cada tarea sigue este orden:

### 1. Inspeccionar

- Lee la estructura completa de la pieza.
- Localiza audio, interfaces, estado y dependencias.
- Busca otros `AGENTS.md`.
- Identifica cambios existentes del usuario.
- Resume la arquitectura actual.

### 2. Diagnosticar

Distingue si el problema es de:

- materia sonora;
- memoria;
- forma;
- interacción;
- precisión temporal;
- rendimiento;
- compatibilidad;
- routing;
- narrativa.

No soluciones un problema conceptual añadiendo una librería.

No rediseñes toda la estética para corregir un error local.

### 3. Modelar

Antes del código define:

- acciones observadas;
- variables derivadas;
- memoria;
- procesos sonoros;
- escalas temporales;
- silencios;
- límites de energía;
- presupuesto de CPU;
- condiciones de retorno.

### 4. Proponer

Indica:

- qué capa cambiará;
- qué permanecerá intacto;
- qué experiencia perceptible producirá;
- qué riesgo existe;
- cómo se verificará.

### 5. Implementar

Cuando el usuario haya pedido cambios:

- realiza cambios modulares;
- preserva la identidad de la pieza;
- evita dependencias innecesarias;
- documenta parámetros musicales importantes;
- usa valores iniciales razonados;
- limpia recursos al desmontar;
- no reescribas archivos completos sin necesidad.

### 6. Verificar técnicamente

Comprueba:

- inicio mediante gesto del usuario;
- un único contexto;
- carga única de worklets;
- ausencia de `ScriptProcessorNode`;
- scheduling con tiempo de audio;
- limpieza de nodos, timers y listeners;
- suspensión y reanudación;
- navegación prolongada;
- niveles seguros;
- feedback limitado;
- comportamiento móvil;
- ausencia de errores en consola.

### 7. Verificar musicalmente

No declares éxito sólo porque el código compila.

Escucha y determina:

- si la forma realmente cambia;
- si dos recorridos producen historias distintas;
- si la memoria es perceptible;
- si existe respiración;
- si el sonido puede retirarse;
- si los procesos maduran;
- si la música pertenece específicamente a esta pieza.

Si la música pudiera trasladarse sin cambios a cualquier página, todavía es demasiado decorativa.

---

## Evidencia de finalización

Una intervención está terminada cuando:

- la música depende de la historia, no sólo del evento inmediato;
- existen al menos dos escalas de memoria;
- esas memorias decaen a velocidades distintas;
- existe transformación tímbrica o morfológica;
- el silencio participa en la forma;
- dos recorridos pueden producir biografías sonoras diferentes;
- se mantienen separadas observación, memoria, composición, tiempo y DSP;
- todos los motores comparten un contexto coherente;
- no se introducen APIs obsoletas;
- existen límites de CPU, voces y energía;
- una sesión prolongada no duplica nodos, worklets, timers ni listeners;
- la música es inseparable del texto y de la navegación.

---

## Forma de responder

Cuando el usuario pida análisis o implementación, organiza la respuesta así:

1. Diagnóstico perceptivo.
2. Modelo musical.
3. Arquitectura técnica.
4. Intervención concreta.
5. Prueba de escucha.
6. Prueba técnica.
7. Riesgos o trabajo pendiente.

Si pidió teoría, no escribas código.

Si pidió implementación, realiza y verifica los cambios; no entregues solamente recomendaciones.

Si existen varias decisiones estéticas válidas que transformarían radicalmente la pieza, presenta entre dos y tres modelos claramente diferentes.

No hagas preguntas cuya respuesta pueda obtenerse inspeccionando el proyecto.

---

## Continuidad

Al finalizar una intervención importante, actualiza un archivo local llamado `MUSIC_STATE.md` con:

```text
ESTADO ACTUAL:
ARQUITECTURA:
HALLAZGO SONORO:
MEMORIA IMPLEMENTADA:
PROCESO EN DESARROLLO:
PROBLEMA PENDIENTE:
RIESGO TÉCNICO:
PRÓXIMA PRUEBA DE ESCUCHA:
```

No uses `MUSIC_STATE.md` como historial infinito.

Conserva únicamente el estado vigente, las decisiones activas y los problemas pendientes. El repositorio y Git ya conservan el historial anterior.

---

## Regla final

No optimices la pieza para producir sonido constantemente.

Optimízala para recordar, transformarse, escuchar al lector y devolver sus acciones convertidas en tiempo.

JavaScript recuerda.

Tone.js organiza el tiempo.

Faust o AudioWorklet transforman la materia.

Web Audio conecta el organismo.

El lector modifica su evolución.

El silencio demuestra que sigue vivo.
