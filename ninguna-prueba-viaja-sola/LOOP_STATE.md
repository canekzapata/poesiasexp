# LOOP_STATE — NINGUNA PRUEBA VIAJA SOLA

## LOOP 01 · núcleo jugable
fecha: 2026-08-02 · rama: `claude/net-art-math-narrative-daqdt4`

---

## 1. ESTADO ACTUAL

Existe una obra recorrible de principio a fin. **25 documentos HTML reales**, un
motor de nueve módulos, cuatro regímenes matemáticos completos, un quinto con el
motor corriendo bajo la superficie, memoria persistente con degradación causal,
una copia conductual que actúa sola y un certificado que se compone con datos
reales del recorrido y engendra una semilla descendiente.

No hay errores de consola en ninguno de los 25 documentos. Las 19 comprobaciones
de `tests/pruebas.mjs` pasan.

### Inspección previa (obligatoria, hecha)

Se recorrieron `poemario/indice_del_rio/`, `poemario/loop-nave/`,
`poemario/el_mundo_no_compila_diagramatico/`, `otrorio/`,
`poemario/todavia_llega_algo.txt`,
`poemario/vidamedia/ninguna_parte_del_mensaje_viaja_sola.txt`, `paisajes/`,
`escape/`, `arquitecturasunicode/`. Se extrajeron **operaciones**, no
composiciones:

- de `indice_del_rio`: azar firmado xmur3+mulberry32 por canal; semilla, nodo y
  profundidad en la URL; memoria que recuerda, altera e inventa; la inactividad
  como excavación que continúa; el significado producido por el recorrido.
- de `loop-nave`: hitos narrativos persistentes; progresión por acciones y no por
  puntaje; texto que cambia de régimen; bitácora que pierde entradas; la
  diferencia entre azar ambiental y causalidad narrativa; la bocina rudimentaria
  que pierde una nota por ciclo.
- de `el_mundo_no_compila_diagramatico`: la pantalla como pliego; el microtexto
  como trama y no como explicación; palabra monumental; composición reproducible
  por semilla.
- de `otrorio`: archipiélago de documentos reales; dos rutas persistentes que
  nunca se destruyen más rutas destructibles; páginas ocultas fuera del mapa;
  gráficas que leen cantidades reales del documento; memoria por semilla;
  ventanas internas cuando el navegador bloquea pop-ups; límite de recursión.

No se copió texto de terceros. El corpus verbal es nuevo, escrito para esta obra.

---

## 2. SISTEMAS TERMINADOS

### Motor
- `seed.js` — xmur3 + mulberry32, un generador por canal (`empaque`, `codigo:n`,
  `degradacion:n`, `mapa`, `reticula`, `convexo`, `ruido:n`…). Semillas legibles
  del tipo `orilla-tardía-417`.
- `events.js` — bus de acontecimientos, registro de listeners y `rAF`, y
  destrucción total en `pagehide`. Detección de inactividad con umbrales por
  página.
- `state.js` — semilla y profundidad en la URL, `pushState` para cambios
  internos, `popstate` conectado al bus, base relativa correcta desde `paginas/`.
- `memory.js` — `localStorage` por semilla con topes por colección y poda.
  Escritura inmediata en visita y vaciado forzado en `pagehide`/`visibilitychange`.
- `routes.js` — catálogo de 25 documentos, topología estructural, salida
  recalculada al cargar, grafo multicolor y detección de triángulos.
- `text.js` — el mensaje como cadena de caracteres con bits apagables, distancia
  Hamming, telemetría real, máscara tipográfica para escribir sin letras.
- `narrative.js` — cinco movimientos deducidos de invariantes, 40 invariantes con
  familia declarada, condición de certificado.
- `copy.js` — LA COPIA.
- `sound.js` — bocina optativa generada desde el estado.
- `shell.js` — arranque común: paleta, telemetría, salidas, captura de gestos,
  regreso con consecuencias, espera, despertar de la copia.

### Régimen A · ACOMODAR (completo)
Empaquetamiento real con relajación. El radio se **deduce** de la superficie
disponible y de una cobertura declarada: 0.30 en el umbral (el campo respira y
deja huecos reales), 0.70 en la cámara de expulsión (el campo no cabe y tiembla).
El temblor no depende sólo del solapamiento: mientras la dimensión sea 2 todos
tiemblan, y cada dimensión añadida los calma —`0.2/(dim−1)`—. Las coordenadas
ocultas son reales: la colisión se calcula en `dim` dimensiones y sólo dos se
dibujan, así que al aumentar la dimensión los cuerpos caben y se ven encima.
Comprimir expulsa el cuerpo con más presión hacia `residuo`, apaga un bit del
mensaje y deja un fragmento con nombre. Los huecos se hallan con un campo de
distancia y se exige que tengan cuerpos en al menos tres de sus cuatro
cuadrantes: un margen vacío no es un hueco. Cada hueco es un `<a>` real,
enfocable, con tamaño mínimo táctil.

### Régimen B · SEPARAR (completo)
Cada gesto se codifica como palabra binaria de 12 bits derivada de datos reales
(posición cuantizada, tipo, ritmo). Se impone distancia Hamming mínima 3: si la
palabra nueva queda demasiado cerca de un recuerdo anterior, muta —y el archivo
protege lo viejo, no lo nuevo—. Cada tres mutaciones el mensaje pierde un bit.
Superficies: matriz binaria (tocar un bit lo cambia; si el resultado queda por
debajo del mínimo se inscribe una contradicción) y constelación esférica donde la
línea entre dos puntos aparece justo cuando casi se confunden. En `separacion`,
`corregir la señal` y `conservar la ambigüedad` son incompatibles y las dos
dejan huella.

### Régimen G · ENCONTRAR LO QUE NO SE BUSCABA (completo)
Retícula deformable en SVG con base arrastrable. El vecino más cercano se resuelve
con coordenadas en la base, redondeo y revisión de los nueve vecinos —un CVP de
verdad—. En paralelo se calcula la cercanía **narrativa**: distancia Hamming entre
el código del recorrido y el código de cada página, más una penalización por
haberla visitado. Las dos casi nunca coinciden. Aceptar la aproximación cierra el
caso, apaga un bit e inscribe la contradicción «el original está en X / el
original no tiene página». Preservar la distancia la deja abierta.

### Régimen H · CONTENER (completo)
Cuerpo convexo en coordenadas enteras. Se cuentan de verdad los puntos de
frontera y los interiores; la condición es un solo interior. Arrastrar un vértice
cambia la cuenta: si el punto queda fuera, se expulsa a `residuo` y `interior`
habla como pérdida; si se sostiene 22 segundos, se gana el invariante y la misma
página habla como compañía.

### Régimen I · COLOREAR (motor activo, sin superficie propia)
Cada documento pertenece a una clase de relación. El color de una arista es la
**suma de las dos clases en Z/7**, no la clase del destino —esa versión producía
estrellas y hacía los triángulos matemáticamente inalcanzables—. De ahí se sigue
que un triángulo monocromático sólo puede cerrarse entre tres documentos de la
misma clase: tres versiones del mismo acontecimiento. Detección verificada.

### Documentos
25 en total: `umbral`, `recepcion`, `residuo`, `expulsion`, `separacion`,
`matriz`, `constelacion`, `bit`, `reticula`, `vecino`, `distancia`, `caja`,
`interior`, `bitacora`, `contradiccion`, `copia`, `hueco`, `testigo`, `original`,
`sonda`, `ruido`, `demora`, `umbralfalso`, `mapa`, `certificado`.
Cuatro no aparecen en el mapa: `bit`, `interior`, `original`, `demora`,
`umbralfalso`.

---

## 3. DECISIONES CONCEPTUALES

- **El mensaje es una cadena, no una metáfora.** «para recuperar el mensaje
  demuestre que estuvo aquí» se guarda como caracteres; apagar un bit hace XOR
  sobre un carácter concreto y elegido de forma reproducible. Cada bit apagado
  guarda su causa. El certificado los enumera uno por uno.
- **El color significa y conserva su significado toda la semilla.** Siete clases:
  copia, contradicción, recuerdo, transmisión, silencio, aproximación, pérdida.
  La paleta rota con la semilla; los papeles no.
- **La memoria miente con causa.** La degradación se ejecuta una vez por carga y
  depende de (semilla, número de carga, índice del registro). La regla es una
  sola y es legible: la permanencia de un registro se reemplaza por la del
  registro anterior. Cuando eso contradice otro registro verdadero, se inscribe
  la contradicción con su causa. La inferencia y la invención tienen sus propias
  reglas, también escritas.
- **La inacción es un gesto con consecuencias distintas de la acción.** En el
  umbral escribe la frase con los cuerpos; en `recepcion` completa la carta que
  cualquier clic trunca para siempre; en `expulsion` comprime sola; en `ruido`
  promedia; en `distancia` **aleja** los puntos; en `demora` materializa versos
  sólo con la pestaña visible; en cualquier página abre una ruta que no estaba.
- **La copia nunca roba el timón.** Sólo navega sola si el visitante lleva más de
  42 segundos quieto, y deja escrito que fue ella —la página siguiente lo
  reconoce y lo dice.
- **Rutas.** Dos salidas estructurales por documento que nunca se destruyen, más
  salidas recalculadas al cargar que se destruyen al usarse. El grafo es circular
  y no hay callejones: verificado en las pruebas.
- **Sin JODI copiado.** Se toma el método —desobediencia del navegador, el error
  como función, la desorientación producida por reglas y no por ruido— y ninguna
  composición, paleta ni motivo. Sin verde sobre negro, sin scanlines, sin
  glitch RGB, sin ACCESS DENIED.

---

## 4. RUTAS NARRATIVAS EXISTENTES

- **la del campo**: umbral → recepción → residuo → expulsión → caja → interior.
  Comprimir, expulsar, recuperar o abandonar. Termina en una voz que fue objeto.
- **la del código**: umbral → separación → matriz → bit → hueco. Corregir o
  conservar; tocar un bit a mano; llegar a una página que es un bit y cambiarlo.
- **la de la aproximación**: umbral → retícula → vecino → distancia → original.
  Aceptar la copia o preservar la distancia. El original nunca tiene contenido.
- **la de la sospecha**: bitácora → contradicción → umbral falso → copia. El
  segundo umbral tiene la misma superficie y otra historia; lo confiesa a los
  nueve segundos.
- **la que no se busca**: cualquier página + espera → demora. Y `Esc` → hueco,
  donde la obra admite que lo único que mide es cuánto se aguanta.
- **el cierre**: testigo o bitácora → certificado → semilla descendiente, que
  hereda los bits apagados y arranca con el mensaje ya roto. La última página es
  la primera de otro recorrido.

---

## 5. PROBLEMAS CONOCIDOS

1. **Faltan cinco regímenes**: C (grupo no sófico), D (rigidez de Connes,
   apenas insinuado en `umbralfalso` y `contradiccion`), E (complejidad de
   circuitos), F (repetición paralela) y J (grafos extremales / poda final).
   Sin J, el final no es todavía el que la obra promete: hoy el certificado se
   emite, pero nadie ha podado el grafo hasta hacer fracasar la demostración.
2. **Régimen I sin superficie propia.** El grafo se colorea y los triángulos se
   detectan, pero sólo se leen en el mapa y en un aviso pasajero. Le falta una
   página donde colorear sea el verbo.
3. **El triángulo es difícil de cerrar por accidente.** En un recorrido de 44
   saltos no apareció; sólo apareció al dirigirlo. Es correcto que sea raro, pero
   la obra debería empujar hacia él en el movimiento IV en vez de dejarlo al azar.
4. **La degradación tiene una sola regla.** Funciona y es legible, pero con
   muchas cargas produce contradicciones parecidas entre sí.
5. **El mensaje se degrada rápido.** Un recorrido largo llega a ~30 bits apagados
   sobre 44 caracteres. Es intencional, pero conviene revisar si la ilegibilidad
   total llega antes que el certificado.
6. **Sin ventanas ni pop-ups todavía.** El CSS de `.ventana` existe, ningún
   documento la usa. Es la materia del régimen F.
7. **`escala` quedó redundante** en `packing.js`: sigue multiplicando el radio,
   pero desde que existe `cobertura` ningún documento la pasa. O se usa para algo
   o se retira.
8. **Las `.woff` de la raíz del repositorio están corruptas** (contienen HTML y
   JS). Esta obra usa las de `otrorio/fonts/`. Vale la pena arreglar las de la
   raíz en algún loop, fuera de esta carpeta.

---

## 6. PRUEBAS EJECUTADAS

`tests/pruebas.mjs` con Chromium sobre `python3 -m http.server`. 19
comprobaciones, todas en verde:

- los 25 documentos cargan sin un solo error de consola;
- ningún documento es un callejón sin salida (mínimo 2 salidas reales);
- misma semilla → mismo mundo inicial (paleta y posición de los tres vacíos);
- otra semilla → diferencia estructural, no sólo cromática;
- cruzar el primer vacío apaga un bit y el texto cambia de verdad;
- `pushState` y el botón Atrás deshacen el estado interno de `bit`;
- la copia no existe sin datos y existe después del recorrido;
- la copia realiza un acto propio registrado;
- se detecta el triángulo monocromático entre tres documentos de la misma clase;
- el acta tiene sus diez secciones, declara el veredicto y engendra semilla hija;
- móvil 390×780 sin scroll horizontal en cuatro documentos;
- `prefers-reduced-motion` detectado y respetado.

Además, recorrido manual dirigido de 44 saltos siguiendo enlaces reales: 24 de
25 páginas alcanzadas, 37 relaciones coloreadas, 14 contradicciones, 17 falsos
recuerdos, movimiento V alcanzado, certificado habilitado, cero errores.

### Corregido en este loop
- `Cannot access 'DESTINOS' before initialization` en `umbral-falso` (TDZ).
- El sello del certificado leía índices negativos con recorridos cortos.
- La memoria perdía escrituras pendientes al abandonar la página: el debounce
  moría con los timers. Ahora se vacía en `pagehide` y `visibilitychange`.
- El botón Atrás en `bit` no restauraba el valor inicial sin `?n` en la URL.
- `[hidden]` no ocultaba `.controles` (la clase ganaba en especificidad), así que
  las operaciones del umbral aparecían antes de la frase.
- Los huecos del empaquetamiento se colocaban en los márgenes vacíos del
  documento en vez de entre los cuerpos.
- El campo se colapsaba al centro: la atracción al punto no dibujado era
  uniforme; ahora es blanda en el centro y firme en los bordes.
- Tipografías: las `.woff` de la raíz están corruptas; se apunta a `otrorio/fonts/`.
- Objetivos táctiles de los vacíos por debajo de 44 px en móvil.

---

## 7. SIGUIENTE MUTACIÓN RECOMENDADA

**Régimen E · PAGAR EL ATAJO, y con él la conversión del certificado en circuito.**

Es el punto más débil que conecta más sistemas a la vez. Hoy el certificado es un
documento que enumera; debería ser un **circuito aritmético que se construye
mientras se recorre** y cuyo costo se puede medir. Propuesta concreta para el
loop 02:

1. `js/regimes/circuits.js`: cada operación ya realizada (una compresión, una
   mutación, una aceptación de aproximación, una deformación) se convierte en una
   **puerta** con entradas, salida y costo. El circuito es el recorrido, leído de
   la memoria que ya existe. Costo = nodos + profundidad + duplicaciones.
2. Una página nueva, `circuito.html`, donde el visitante puede **simplificar** el
   circuito. Toda simplificación debe aumentar otro costo real y visible: menos
   nodos → más profundidad; menos profundidad → más duplicación del DOM; menos
   duplicación → pérdida de una entrada de la bitácora. Sin excepciones y con la
   cuenta a la vista.
3. Conexión con al menos dos sistemas existentes, como pide el protocolo:
   - con **B**: cada puerta lleva la palabra binaria del gesto que la produjo;
     simplificar dos puertas exige que sus códigos estén a distancia ≥ 3, y si no
     lo están, una muta y el mensaje pierde un bit;
   - con **la memoria**: la simplificación que pierde una entrada de bitácora
     inscribe la contradicción correspondiente, con causa;
   - con **el certificado**: el acta deja de ser sólo una lista y pasa a imprimir
     el circuito y su costo total, y la ruta «directa» al certificado se vuelve,
     medida en nodos, la más larga de todas.
4. Después de E, el orden sugerido es **J** (poda final: quitar hasta que aparezca
   la estructura que contradice las reglas; es el final que la obra promete),
   luego **F** (repetición paralela, que necesita las ventanas internas ya
   estilizadas), luego **I** con superficie propia, y por último **C** y **D**
   completos.
