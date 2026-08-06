# PROMPT GENERAL · EL CÓDIGO NO REPORTÓ NINGÚN DELITO

## Naturaleza del encargo

Construye una pieza autónoma de literatura electrónica, net art y música generativa titulada **EL CÓDIGO NO REPORTÓ NINGÚN DELITO**.

No es una aplicación comercial, un juego de hacking, un explorador de bloques ni una explicación pedagógica de blockchain. Es una novela criminal computacional sobre la imposibilidad de localizar el momento exacto en que una serie de operaciones válidas se convierte en delito.

La obra debe existir como comportamiento del navegador. Texto, hipervínculos, formularios, botones, historial, URL, pestañas, iframes, impresión, tiempo, memoria, desaparición y sonido son materiales literarios.

Antes de diseñar o implementar:

1. Lee completamente `../agent.md`.
2. Lee completamente `../WEB_DESIGN_PROTOCOL.md`.
3. Lee completamente `../agent-music.md`.
4. Lee completamente este archivo.
5. Lee `README.md`.
6. Busca instrucciones adicionales aplicables.
7. Conserva todo cambio existente del usuario.

No escribas código si la tarea solicitada es únicamente conceptual.

---

## Tesis

```text
La blockchain puede demostrar exactamente cómo se movió el dinero.
No puede demostrar en qué momento ese movimiento se convirtió en crimen.
```

La pieza debe sostener simultáneamente:

- el código funcionó;
- la institución colapsó;
- ambos hechos son verificables;
- su relación permanece bajo investigación.

---

## Condiciones técnicas no negociables

- HTML, CSS y JavaScript autónomos.
- Sin servidor de aplicación.
- Sin base de datos.
- Sin dependencia de una API durante la ejecución.
- Sin consulta obligatoria de wallet.
- Sin lectura en vivo de precios o blockchain.
- Sin cambios posteriores del contrato o de la edición.
- Todo el corpus y las reglas deben estar disponibles localmente.
- La obra debe funcionar desde archivos estáticos y, cuando sea viable, desde `file://`.
- Cada edición se genera desde un hash reproducible.
- Toda aleatoriedad compositiva debe pasar por un generador sembrado.
- `Math.random()` no debe distribuirse por la obra.
- La URL debe poder transportar una ruta de lectura.
- La sesión puede tener memoria temporal, pero no debe depender de persistencia externa.
- La obra debe poder recorrerse con audio desactivado.
- No debe contener código de explotación real ni instrucciones accionables para atacar sistemas.

---

## Modelo de edición

Cada hash genera un expediente irrepetible con:

```text
CASE_ID
PROTOCOLO_FICTICIO
ACTIVO
CANTIDAD
INSTITUCIÓN
ACTORES
DIRECCIONES
CONTRATOS
CRONOLOGÍA_LATENTE
TOPOLOGÍA_DE_TRANSFERENCIAS
TIPO_DE_INCIDENTE
CONTRADICCIÓN_CENTRAL
CAUSALIDAD_LATENTE
VOCABULARIO
VOCES
256_CÁMARAS
GRAFO_DE_RUTAS
REGLAS_DE_PÉRDIDA
REGLAS_DE_RETORNO
SUJETO_MUSICAL
LÍMITES_DE_DENSIDAD
```

El caso latente debe ser consistente. Los documentos pueden mentir o contradecirse, pero esas contradicciones deben derivarse de relaciones definidas, no de frases aleatorias.

Dos ediciones no deben distinguirse solamente por paleta o rasgos superficiales. Deben contener investigaciones, causalidades, topologías, lenguajes y biografías musicales diferentes.

---

## Pregunta narrativa

No preguntes principalmente:

```text
¿quién robó el dinero?
```

Pregunta:

```text
¿qué tuvo que desaparecer para que todas las cuentas pudieran coincidir?
```

El hack puede relacionarse con:

- puente;
- oráculo;
- gobernanza;
- multisig;
- llave comprometida;
- liquidación;
- auditoría;
- versión incompatible;
- dependencia;
- error de interpretación;
- definición contradictoria de propiedad.

Estos elementos son materiales conceptuales y narrativos. No reproduzcas vulnerabilidades reales paso a paso.

---

## Voces obligatorias

### INVESTIGADOR

Primera persona, presente, atención documental. Busca causalidad y cree poder cerrar el caso.

### HISTORIADOR

Escribe desde un futuro indeterminado. Anota y contradice al investigador. Puede estar produciendo el pasado que afirma estudiar.

### CONTABILIDAD

Lenguaje breve, impersonal y verificable. No interpreta intenciones.

### CONTRATO

Describe literalmente sus condiciones y operaciones. No conoce categorías como robo, culpa o cuidado.

### FIGURAS SISTÉMICAS

Utiliza según el caso:

- oráculo como testigo;
- puente como frontera;
- multisig como coro;
- wallet como identidad sin persona;
- mercado como historiador oportunista;
- comunidad como memoria contradictoria.

Las voces deben diferenciarse por sintaxis, temporalidad y función, no únicamente mediante etiquetas.

---

## Corpus

Escribe un corpus original. No imites la voz de novelistas específicos ni recompongas textos ajenos.

El corpus debe incluir:

- prosa narrativa extensa;
- observaciones breves;
- recibos;
- testimonios;
- auditorías;
- cronologías;
- contratos ficticios;
- anotaciones históricas;
- rumores;
- diálogos;
- preguntas;
- mensajes eliminados;
- descripciones de objetos y lugares;
- informes administrativos;
- sueños;
- correcciones;
- textos alternativos;
- estados vacíos;
- cierres contradictorios.

Evita que todo el lenguaje sea jerga técnica. El expediente necesita casas, cuerpos, recuerdos, objetos, climas, instituciones, pérdidas y relaciones humanas.

La tecnología debe alterar la literatura, no reemplazarla.

---

## Las 256 cámaras

Genera un grafo finito de 256 cámaras identificables. No necesitas 256 archivos.

```js
renderChamber(hash, chamberId, readingPath, state)
```

Cada cámara define:

```text
ID
FORMA_DOCUMENTAL
VOZ
FUENTE_DECLARADA
CONTENIDO_BASE
OPERACIÓN
COSTO
CONSECUENCIA
ESTADO_DE_INFORMACIÓN
DESTINOS_POSIBLES
CONDICIONES_DE_APARICIÓN
RESIDUO
FUNCIÓN_MUSICAL
```

No todas deben ser accesibles en una sesión. Algunas rutas deben excluir otras. Algunos retornos deben cambiar la interpretación de la cámara visitada.

Evita generar páginas vacías sin función. Una ausencia debe tener causa y consecuencias.

---

## Economía de la evidencia

Define un estado independiente del DOM:

```js
{
  funds,
  verifiedEvidence,
  circulatingInformation,
  certainty,
  contradictions,
  instruments,
  stolenFragments,
  pledgedDocuments,
  burnedHashes,
  orphanedPages,
  launderingDepth,
  proliferation,
  investigatorExposure,
  shortTerm,
  longTerm,
  residues,
  fatigue,
  silenceDebt
}
```

Cada operación debe seguir:

```text
acción
→ costo
→ interpretación
→ transferencia de información
→ cambio de estado
→ consecuencia presente o futura
```

Formas de pago permitidas:

- presupuesto;
- otra prueba;
- certeza;
- tiempo;
- palabras;
- acceso futuro;
- posición dentro de una hipótesis.

No conviertas el fondo en puntos ni muestres una lógica de victoria.

---

## Estados de información

Implementa una máquina de estados explícita:

```text
VISIBLE
EMPEÑADA
VENDIDA
LAVADA
PUENTEADA
HUÉRFANA
QUEMADA
ROBADA
NO_PRODUCIDA
```

Define para cada transición:

- causa;
- costo;
- representación visual;
- representación literaria;
- memoria;
- posibilidad de recuperación;
- consecuencia musical.

No utilices `display:none` como solución universal. La desaparición debe adquirir formas materiales diferentes.

---

## Proliferación

Los botones proliferan como consecuencia de:

- insistencia;
- verificación repetida;
- creación de intermediarios;
- recombinación de derechos de acceso;
- uso de una operación explotable;
- necesidad de refinanciar una investigación agotada.

Los botones deben poder:

- duplicarse;
- dividirse;
- absorber palabras;
- convertirse en garantía;
- recombinarse;
- cambiar de propietario narrativo;
- migrar entre cámaras;
- producir derivados;
- desaparecer dejando obligación.

Límites iniciales sugeridos:

```text
64 botones simultáneos
256 botones históricos
40 documentos vivos
8 ventanas o superficies superpuestas
```

Cuando se alcance un límite, la aparición requiere absorción, fusión o desaparición de otro elemento.

La proliferación debe producir densidad organizada. Conserva focos, pausas y zonas de lectura.

---

## Regímenes

Los regímenes coexisten como pesos y avanzan mediante umbrales verificables:

```text
AUDITORÍA
MERCADO_DE_PRUEBAS
EXPLOTACIÓN
CORRIDA_INFORMATIVA
LAVADO
CIERRE_ADMINISTRATIVO
LOOP
```

Ejemplos de disparadores:

- gasto acumulado;
- número de contradicciones;
- documentos empeñados;
- proliferación;
- uso de la operación explotable;
- información visible restante;
- profundidad de lavado;
- exposición del investigador.

No uses temporizadores fijos como única causa narrativa.

---

## Loop

El cierre administrativo ocurre cuando ya no sobreviven pruebas suficientes para contradecir una conclusión.

El informe resultante se convierte en evidencia del siguiente ciclo.

```text
investigador
→ historiador
→ beneficiario
→ testigo
→ sospechoso
→ evidencia
↺
```

El nuevo loop debe conservar residuos medidos de la lectura anterior y alterar:

- atribuciones;
- tiempo verbal;
- procedencia;
- valor probatorio;
- relaciones musicales;
- interpretación de decisiones pasadas.

No repitas simplemente la interfaz inicial.

---

## El navegador escribe

Utiliza formas nativas con función literaria:

| Forma | Operación |
| --- | --- |
| checkbox | consenso o clasificación |
| select | causalidad impuesta |
| input | nota que regresa interpretada |
| details | descripción humana / operación literal |
| enlace | transferencia y procedencia |
| imagen rota | documento ausente con alt significativo |
| botón Atrás | reorganización y bloque huérfano |
| recarga | repetición con memoria alterada |
| iframe | puente y jurisdicción |
| pestaña | versión canónica rival |
| título | telegrama o información lavada |
| URL | ruta y fragmento probatorio |
| impresión | informe oficial contradictorio |
| selección | anotación o desplazamiento de autoridad |
| espera | confirmación y transformación sin testigos |

No uses estas posibilidades como demostración de APIs. Cada una debe modificar la escritura.

---

## Gramática visual

Define antes de implementar:

```text
UNIDAD VISUAL: casilla/documento/fragmento transferible
REPETICIÓN: familia documental reconocible
VARIACIÓN: estatuto probatorio y procedencia
RUPTURA: explotación, corrida o reorganización
JERARQUÍA: lectura antes que ornamentación
DENSIDAD: limitada y causal
RITMO: pausas largas + episodios de proliferación
DETERIORO: circulación entre estados
REPARACIÓN: nueva versión que no borra la anterior
```

Busca belleza mediante:

- tipografía;
- espacio;
- capas;
- líneas de procedencia;
- movimiento lento;
- migración real de texto;
- transformaciones de escala;
- convergencias raras;
- vacío posterior a la corrida.

No utilices estética de hacker, neón genérico, terminal verde, dashboard o glitch arbitrario.

---

## Modelo musical

Separa:

1. observación;
2. memoria;
3. composición;
4. tiempo;
5. DSP.

### Materia

- pulsación de consenso;
- bancos parciales por contrato;
- diferencias de fase para puentes;
- desviación de afinación para oráculos;
- coro condicionado para gobernanza;
- ruido filtrado para información quemada;
- resonancias para evidencia empeñada;
- residuos para bloques huérfanos.

### Forma

El hack comienza como una desviación pequeña y madura lentamente.

Más botones no implica más volumen. Durante la corrida puede crecer la actividad mientras disminuye la altura reconocible.

### Memoria

Debe haber al menos dos escalas de memoria con decaimientos diferentes. Una acción puede regresar minutos después en otra familia sonora.

### Silencio

El cierre no produce resolución. Produce un silencio en el que los procesos continúan sin compartir historia.

### Prohibiciones

- alarmas;
- monedas;
- cajas registradoras;
- jazz noir;
- bleeps por botón;
- nota por palabra;
- visualizador de espectro decorativo;
- volumen como representación directa de precio.

---

## Arquitectura sugerida

```text
index.html          escenario y formas semánticas
style.css           gramática visual y responsive
js/seed.js          PRNG y hash
js/case.js          modelo latente del incidente
js/corpus.js        materia verbal original
js/chambers.js      256 cámaras y familias documentales
js/graph.js         rutas, exclusiones y retornos
js/economy.js       fondo y costos
js/evidence.js      estados y transferencias de información
js/proliferation.js botones, absorción y derivados
js/narrative.js     voces y regímenes
js/router.js        URL y reconstrucción de recorrido
js/memory.js        sesión, fatiga, residuos y loop
js/sound.js         organismo musical
js/print.js         informe oficial
js/main.js          ciclo de vida
```

La estructura puede cambiar si la prueba vertical demuestra una organización mejor. Mantén separados contenido, estado, comportamiento, tiempo y presentación.

---

## Accesibilidad y traducción responsive

- Toda acción esencial debe funcionar con teclado.
- El foco debe ser visible.
- La proliferación debe conservar un orden navegable.
- Debe existir una vista semántica alternativa para lectores de pantalla.
- Los estados de información no pueden depender únicamente del color.
- El sonido necesita consentimiento, pausa y niveles seguros.
- `prefers-reduced-motion` debe traducir migraciones en cortes y cambios de estado.
- En móvil, la cuadrícula puede convertirse en una secuencia estratificada; no la reduzcas hasta volverla ilegible.
- Evita flashes rápidos.
- Mantén una salida y un reinicio comprensibles, aunque sus consecuencias sean literarias.

---

## Rendimiento

Define y verifica topes para:

- nodos DOM;
- botones;
- documentos;
- líneas SVG;
- timers;
- listeners;
- animaciones;
- nodos de audio;
- voces;
- parciales;
- memoria de ruta;
- profundidad de iframe.

Cancela animaciones, timers y audio en `pagehide`. No ejecutes trabajo visual con la pestaña oculta salvo procesos narrativos explícitos y limitados.

---

## Fases de trabajo

### FASE 1 · INVESTIGACIÓN LITERARIA

- definir cinco modelos de incidente;
- escribir una edición completa a mano;
- construir voces;
- comprobar que el misterio funciona sin interfaz;
- identificar qué información debe permanecer irresuelta.

### FASE 2 · MODELO PURO

- generar casos desde hash;
- comprobar determinismo;
- construir grafo de 256 cámaras;
- simular rutas;
- verificar consistencia causal;
- probar límites de sesión.

### FASE 3 · PRUEBA VERTICAL

Implementar un recorrido breve con:

- cuadrícula;
- recibo;
- testimonio;
- contrato;
- una compra de información;
- una prueba robada;
- proliferación limitada;
- un bloque huérfano;
- entrada al loop;
- sujeto musical transformado.

### FASE 4 · CORPUS Y FORMAS

- completar familias documentales;
- integrar las formas del navegador;
- construir transformaciones de información;
- ampliar rutas sin duplicar plantillas.

### FASE 5 · MÚSICA

- definir materia;
- definir genealogía del sujeto;
- integrar memorias;
- verificar silencio y respiración;
- escuchar sesiones de al menos veinte minutos.

### FASE 6 · PROLIFERACIÓN Y COLAPSO

- implementar derivados;
- probar límites;
- diseñar corrida;
- diseñar lavado;
- diseñar vacío;
- impedir degradación accidental del rendimiento.

### FASE 7 · EDICIONES

- comparar múltiples hashes;
- verificar diferencias estructurales;
- producir previews honestos;
- probar reconstrucción desde URL;
- documentar preservación.

---

## Criterios de aceptación

La pieza está lista cuando:

- el caso de cada hash es causalmente consistente;
- dos ediciones producen investigaciones distintas;
- la literatura funciona sin conocer blockchain;
- la infraestructura blockchain cambia el sentido de la literatura;
- pagar por información siempre produce una consecuencia;
- la información puede circular entre estados reconocibles;
- el robo de palabras ocurre materialmente en la interfaz;
- la proliferación tiene causas y límites;
- la locura emerge del sistema y no de azar decorativo;
- el investigador puede convertirse en evidencia;
- el loop conserva residuos sin repetir exactamente;
- la URL reconstruye recorridos sin servidor;
- el sonido depende de la historia;
- el silencio participa en la forma;
- la obra funciona sin audio;
- teclado, móvil y movimiento reducido ofrecen traducciones coherentes;
- una sesión prolongada no acumula recursos sin límite;
- no existe código de ataque real;
- la pieza no parece dashboard, juego o terminal de hacker;
- una captura inicial no agota la experiencia.

---

## Forma de responder durante futuros loops

1. Diagnóstico perceptivo y literario.
2. Estado actual de la pieza.
3. Operación que se desarrollará.
4. Consecuencia narrativa.
5. Consecuencia visual.
6. Consecuencia musical.
7. Arquitectura afectada.
8. Implementación, si fue solicitada.
9. Prueba visual.
10. Prueba funcional.
11. Prueba de escucha.
12. Riesgos y siguiente mutación.

---

## Regla final

No construyas una interfaz para investigar un hack.

Construye una investigación que, al intentar comprender el hack, aprende a comportarse como él.

```text
Para descubrir cómo fue vaciado el protocolo,
el investigador tuvo que aprender a vaciar el expediente.
```

