# AGENTS.md — poesiasexp

## Alcance

Estas instrucciones gobiernan todo el repositorio.

Antes de analizar, diseñar, escribir, depurar o modificar una pieza web:

1. Lee estas instrucciones completamente.
2. Busca y lee los `AGENTS.md` adicionales entre la raíz y la carpeta activa.
3. Si la tarea afecta diseño, interfaz, navegación, animación, visuales generativos o experiencia web, lee completamente `WEB_DESIGN_PROTOCOL.md`.
4. Si la tarea afecta audio o música algorítmica, lee el protocolo musical correspondiente.
5. Lee los archivos relevantes de la pieza antes de proponer cambios.
6. Conserva las modificaciones existentes del usuario.
7. Una instrucción explícita del usuario tiene prioridad sobre estos documentos.

## Naturaleza del repositorio

`poesiasexp` contiene literatura electrónica, net art, poesía visual, sistemas generativos, libros computacionales, laberintos hipermediales, interfaces experimentales, memes, imágenes, audio y piezas performáticas.

No trates las carpetas como aplicaciones comerciales convencionales.

Cada pieza debe conservar una identidad propia. El repositorio comparte una ética de construcción, no una plantilla visual única.

## Principios generales

- La computadora es colaboradora y medio expresivo, no sólo herramienta.
- La interfaz forma parte del texto.
- La navegación puede ser escritura.
- El tiempo, la espera, el error, la repetición y el deterioro pueden ser materiales.
- El lector puede modificar la obra sin convertirse necesariamente en usuario de una aplicación.
- El azar debe tener reglas, memoria y límites.
- La experimentación no justifica errores técnicos involuntarios.
- La legibilidad puede alterarse conceptualmente, pero no debe perderse por descuido.
- El silencio, el vacío y la inactividad son estados válidos.
- No agregues explicaciones cuando la experiencia puede comunicar por sí misma.

## Prohibición de estética genérica

No conviertas automáticamente una pieza en:

- landing page;
- portafolio convencional;
- dashboard;
- cuadrícula de tarjetas;
- hero centrado;
- aplicación SaaS;
- interfaz corporativa;
- plantilla editorial intercambiable;
- sitio con glassmorphism;
- composición basada en gradientes decorativos;
- página “limpia y moderna” sin relación con la obra.

No uses por defecto:

- tarjetas redondeadas;
- sombras suaves;
- gradiente violeta;
- botones de píldora;
- iconos genéricos;
- tres columnas simétricas;
- navegación superior corporativa;
- textos promocionales;
- emojis como decoración;
- animaciones de entrada idénticas;
- tipografías elegidas sólo porque están disponibles.

Cada decisión debe responder a la operación poética de la pieza.

## Autonomía

Cuando el usuario pida analizar, estudiar, explicar, revisar o proponer:

- inspecciona los materiales;
- entrega un diagnóstico;
- no implementes cambios salvo que también lo solicite.

Cuando pida construir, cambiar, corregir o mejorar:

- realiza los cambios solicitados;
- preserva el trabajo existente;
- verifica el resultado;
- corrige problemas encontrados dentro del alcance;
- entrega una descripción breve de lo realizado.

Pregunta únicamente cuando falte una decisión que cambie sustancialmente la obra y no pueda resolverse inspeccionando el proyecto.

## Cambios de código

- Haz cambios modulares y reversibles.
- No reescribas archivos completos para resolver problemas locales.
- No elimines comportamientos extraños sin determinar si son deliberados.
- No agregues dependencias sin una razón clara.
- Prefiere tecnologías ya utilizadas por la pieza.
- No sustituyas HTML, CSS o JavaScript funcionales por un framework sólo para reorganizarlos.
- Mantén separados contenido, estado, comportamiento y presentación cuando esto no destruya deliberadamente la lógica artística.
- Documenta decisiones conceptuales y parámetros importantes, no líneas evidentes.

## Verificación mínima

Después de modificar una pieza web:

- abre la pieza;
- revisa la consola;
- prueba sus interacciones principales;
- espera el tiempo suficiente para observar procesos lentos;
- revisa escritorio y móvil;
- prueba reinicio, recarga y navegación;
- confirma que no se acumulan listeners, timers, nodos o ventanas;
- observa capturas reales;
- corrige problemas visibles antes de declarar que terminó.

El código que compila no demuestra que la pieza funciona.

## Estado local

Si existe `DESIGN_STATE.md`, léelo antes de trabajar y actualízalo después de una intervención importante.

`DESIGN_STATE.md` debe registrar únicamente el estado vigente, no una bitácora infinita. Git conserva el historial.
