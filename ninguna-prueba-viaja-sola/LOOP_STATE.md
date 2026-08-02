# LOOP_STATE — NINGUNA PRUEBA VIAJA SOLA

## LOOP 02 · el circuito y la poda
fecha: 2026-08-02 · rama: `claude/net-art-math-narrative-daqdt4`

---

## 1. ESTADO ACTUAL

**27 documentos HTML reales**, once módulos de motor, **seis regímenes
matemáticos completos** (A, B, E, G, H, J) y un séptimo con el motor corriendo
bajo la superficie (I). La obra ya tiene el final que prometía: la ley que
organizaba el expediente puede caerse, y su caída es la salida.

36 comprobaciones de `tests/pruebas.mjs` en verde, cero errores de consola en los
27 documentos.

### Lo que hizo este loop

El loop 01 recomendaba **E solo**, dejando **J** para después. Se hicieron los dos
juntos, y fue la decisión correcta: son el mismo objeto visto dos veces —la prueba
construida como máquina y la prueba desmontada hasta que se cae—. E sin J dejaba
la promesa central de la obra sin cumplir: el certificado se emitía, pero nadie
había podado nada y ninguna demostración fracasaba.

---

## 2. SISTEMAS TERMINADOS EN ESTE LOOP

### Régimen E · PAGAR EL ATAJO (completo)

`js/regimes/circuits.js` + `paginas/circuito.html`.

El recorrido leído como circuito aritmético. **El cableado no es azar**: cada
puerta cuelga de aquello de lo que depende —una página, de la página desde la que
se llegó; un fragmento, de la página que lo expulsó; una contradicción, de las dos
cosas que no concuerdan—. De ahí sale la duplicación real: si el recorrido repitió
un tramo, el circuito calcula dos veces lo mismo.

Cuatro medidas, todas reales y medidas *después* de operar: nodos, profundidad
(camino más largo), duplicación (subexpresiones con firma idéntica) y **cable**
(píxeles de conexión efectivamente dibujados en pantalla).

Tres operaciones:

- **fundir las puertas repetidas** — eliminación de subexpresiones comunes de
  verdad, con una retención que reparte la salida;
- **acortar el camino más largo** — cortocircuita la entrada menos profunda de la
  puerta crítica;
- **quitar las repetidas sin repartidor** — adelgaza sin pagar el reparto.

### La corrección conceptual que cambió el régimen

La primera implementación intentaba cumplir el eslogan «todo atajo aumenta otra
medida» y quedó **inerte**: las tres operaciones sólo cobraban, ninguna conseguía
nada, y pulsar los botones no enseñaba nada porque el resultado tenía siempre la
misma forma. Bajar el listón de la firma para fabricar coincidencias habría sido
falsear la matemática: dos puertas no calculan lo mismo porque se parezcan.

Lo que se hizo fue lo contrario: **dejar que simplificar funcione**, porque
funciona, y mover el cobro a donde el régimen sí lo tiene. Al calcular una sola
vez lo que ocurrió varias, la memoria deja de distinguir esos pasos: los registros
fundidos quedan degradados con su causa escrita y se inscribe la contradicción
correspondiente. El circuito se vuelve elegante exactamente en la medida en que el
expediente se vuelve pobre. Si no había nada que perder en la memoria, el saldo lo
paga el mensaje con un bit.

`aplanar` tampoco promete: mide la profundidad antes y después y, si no bajó, lo
dice —«había más de un camino igual de largo: acortar uno no acorta el circuito»—,
que es exactamente lo que significa que la profundidad sea un máximo.

Conexiones con lo existente, como pide el protocolo:
- con **B**: cada puerta lleva la palabra binaria del gesto que la produjo; fundir
  dos que estén a distancia menor que la mínima muta una y apaga un bit;
- con **la memoria**: el cobro son registros degradados y contradicciones con causa;
- con **el certificado**: el acta imprime el circuito y su costo.

### Régimen J · QUITAR HASTA QUE APAREZCA LA ESTRUCTURA (completo)

`js/regimes/extremal.js` + `paginas/poda.html`.

TESTIGO enuncia una ley y la presenta como inevitable:

> NINGUNA PRUEBA ADMISIBLE ES UN BOSQUE: TODA PRUEBA CONTIENE AL MENOS UN REGRESO.

La ley es verdadera como enunciado sobre grafos —la degeneración vale 1 si y sólo
si el grafo es un bosque—, y es refutable como afirmación sobre pruebas. El
visitante retira relaciones del grafo multicolor que su propio recorrido coloreó.
La degeneración se calcula con el pelado clásico de grado mínimo. Si consigue
dejarlo en degeneración 1 **sin desprender ningún documento**, el contraejemplo
está construido y la demostración cae.

Podar cuesta: cada relación retirada deja sin causa el registro que la produjo, y
si sostenía un triángulo monocromático, el triángulo deja de existir aunque conste
que existió —con su contradicción inscrita—. Desprender documentos no refuta nada:
sólo rompe el expediente, y la página lo dice.

El final escala con lo construido: un recorrido corto tiene un solo ciclo y cae
con una poda; uno largo tiene muchos y cuesta varias. No se admite refutar sin
haber tenido antes una prueba que demoler (mínimo seis relaciones y degeneración
≥ 2 en el grafo original).

### El certificado, ahora con tres actas

- **expediente abierto** — faltan invariantes;
- **cerrado** — hay evidencia de cuatro familias;
- **LA DEMOSTRACIÓN FALLÓ** — sólo tras la refutación, y es la única que se lee
  como salida.

El acta imprime el circuito con su costo y el estado de la poda. La semilla
descendiente hereda si la ley ya se cayó: en ese mundo TESTIGO enuncia igual una
ley que alguien, antes, ya refutó.

---

## 3. CORRECCIONES DE FONDO HECHAS ESTE LOOP

1. **La memoria se disolvía sola.** Medida real: tras veinte saltos quedaban 2
   registros verdaderos de 22, con 11 invenciones. La degradación tiraba una
   moneda por registro y por carga, y cada navegación es una carga, así que la
   erosión compuesta borraba la bitácora entera y con ella la distinción
   verdadero/degradado/inventado sobre la que se sostiene todo el sistema. Ahora
   se degrada **como mucho un registro por carga**, siempre el más viejo en pie,
   nunca los tres últimos; la invención tiene techo (4) y sólo ocurre cada seis
   cargas. Medida nueva: 14 verdaderos, 8 degradados, 1 inventado.
2. **El rejuego cobraba dos veces.** Reconstruir el circuito rejuega las
   simplificaciones guardadas, y esas operaciones tenían efectos sobre la memoria:
   cada recarga volvía a degradar registros y a apagar bits. Ahora el rejuego es
   sin efectos: el costo se paga una sola vez, cuando se decide.
3. **Un módulo caído dejaba la página sin salidas.** `carga.js` reintenta una vez
   y, si tampoco, escribe a mano cuatro direcciones y un aviso honesto. Ninguna
   página de la obra es un callejón, tampoco cuando falla.
4. **El circuito se apelmazaba en una columna.** Ahora se lee de izquierda a
   derecha: la profundidad ocupa el eje largo, las entradas al principio y la
   prueba al final.

---

## 4. DECISIONES CONCEPTUALES

- **La matemática manda sobre el eslogan.** Dos veces en este loop el código
  contradijo la frase que lo describía; las dos veces se cambió la frase, no la
  matemática. El régimen E dice ahora lo que su máquina hace: simplificar
  funciona, y el ahorro se descuenta del expediente.
- **El final es una resta.** No se gana añadiendo la décima pieza: se gana
  quitando hasta que aparece la estructura que la máquina había declarado
  imposible. Y la salida no devuelve al exterior: emite un acta y una semilla
  descendiente.
- **Refutar exige haber construido.** No se puede tumbar una ley sobre pruebas sin
  haber tenido una prueba. El precio del final es proporcional al recorrido.
- **La elegancia es una forma de pobreza.** El circuito más limpio es el de la
  memoria más borrosa. Es la misma economía que en el resto de la obra:
  comprimir expulsa, corregir pierde ambigüedad, aproximar aleja del original.

---

## 5. RUTAS NARRATIVAS EXISTENTES

A las seis del loop 01 se suma **la del costo**:

- expulsión o bitácora o TESTIGO → **circuito** → **poda** → certificado.
  Se ve la prueba como máquina, se la simplifica pagando con la memoria, se la
  poda hasta que la ley se cae, y el fracaso emite el acta.

`poda` no aparece en el mapa: se llega por el circuito, o por espera, o por el
recálculo de salidas. `circuito` sí está en el mapa y es ahora una de las salidas
estructurales de `bitacora`, `expulsion` y `testigo`.

---

## 6. PROBLEMAS CONOCIDOS

1. **Faltan tres regímenes**: C (grupo no sófico), D (rigidez de Connes, todavía
   sólo insinuado en `umbralfalso` y `contradiccion`) y F (repetición paralela).
2. **Régimen I sin superficie propia.** El grafo se colorea, los triángulos se
   detectan y ahora además se pueden deshacer podando, pero sigue sin haber una
   página donde colorear sea el verbo.
3. **El circuito de un recorrido corto es pobre.** Con pocas páginas visitadas hay
   pocas puertas y casi nada que fundir; la página lo dice, pero el primer
   visitante que llegue directo al circuito verá poco.
4. **`aplanar` casi nunca baja la profundidad** en circuitos anchos, porque hay
   muchos caminos máximos. Es cierto y está dicho, pero convendría que la página
   mostrara cuántos caminos críticos hay, para que se entienda por qué.
5. **El cable sólo se mide cuando se dibuja.** En el acta se mide al imprimir; si
   nunca se abrió `circuito.html`, la primera medida de cable es 0.
6. **`escala` sigue redundante** en `packing.js`.
7. **Las `.woff` de la raíz del repositorio están corruptas** (contienen HTML y
   JS). La obra usa las suyas en `fonts/`. Arreglar las de la raíz queda fuera de
   esta carpeta.
8. **El servidor de pruebas de un solo hilo produce fallos fantasma.** Con
   `python3 -m http.server` bajo carga, alguna página cargaba sin motor. No es de
   la obra —con un servidor concurrente no ocurre— pero fue lo que llevó a
   escribir la salida de emergencia, así que sirvió.

---

## 7. PRUEBAS EJECUTADAS

`tests/pruebas.mjs`, 36 comprobaciones, todas en verde, dos corridas seguidas:

- los 27 documentos cargan sin un solo error de consola;
- ningún documento es un callejón sin salida;
- determinismo por semilla y diferencia estructural entre semillas;
- cruzar el primer vacío apaga un bit y el texto cambia;
- `pushState` y Atrás deshacen el estado interno;
- la copia no existe sin datos, existe después y actúa;
- se detecta el triángulo monocromático;
- **el circuito tiene puertas deducidas del recorrido** (50 nodos, profundidad 20);
- **el recorrido repetido produce duplicación real** (27);
- **la simplificación abarata el circuito** (50 → 38 nodos);
- **y se cobra fuera de él** (15 → 12 registros verdaderos, 10 bits apagados);
- **el mismo expediente produce el mismo circuito** (determinismo del régimen E);
- **el efecto de la simplificación sobrevive a la recarga** (duplicación 27 → 15);
- **el grafo empieza con al menos un regreso** y la ley se sostiene;
- **podar sin desprender lleva el grafo a bosque** (degeneración 1, 0 sueltos);
- **la ley queda refutada, deja hito y empuja al movimiento V**;
- **el acta cambia de veredicto tras el fracaso** e imprime circuito y poda;
- **la bitácora se erosiona sin disolverse** (14 verdaderos, 8 degradados, 1 inventado);
- móvil 390×780 sin scroll horizontal y `prefers-reduced-motion` respetado.

Además, comprobación aparte de la salida de emergencia: bloqueando un módulo, la
página se recupera con el reintento; bloqueando también el reintento, el documento
conserva cuatro direcciones reales y avisa de lo que pasó.

---

## 8. SIGUIENTE MUTACIÓN RECOMENDADA

**Régimen F · REPETIR JUNTOS, con ventanas internas correlacionadas.**

Es el punto más débil que conecta más sistemas, y es el único régimen que exige
una materia que la obra todavía no usa: **más de una superficie a la vez**. El CSS
de `.ventana` existe desde el loop 01 y ningún documento la ha abierto.

Propuesta concreta para el loop 03:

1. `js/ventanas.js`: ventanas internas arrastrables y cerrables, con límite duro
   de tres simultáneas y destrucción correcta de listeners al cerrarse. Pop-up
   real sólo tras gesto explícito; si el navegador lo bloquea, ventana interna
   equivalente, sin que la experiencia cambie.
2. `js/regimes/repetition.js` + `paginas/repeticion.html`: una decisión aparece
   simultáneamente en dos o tres ventanas. Las copias **no se comunican**: cada
   una decide con su propia semilla derivada, pero comparten una correlación
   fijada de antemano por la semilla madre. Elegir en una determina qué es posible
   en las otras sin que nada viaje entre ellas —que es exactamente el punto, y se
   puede implementar sin imaginería cuántica: dos generadores correlacionados y
   una tabla de compatibilidad.
3. Repetir la decisión varias veces cambia **exponencialmente** la probabilidad de
   que la señal sobreviva: la página lo muestra como una barra de supervivencia
   que se calcula, no que se anima.
4. Conexiones obligatorias:
   - con **E**: cada repetición añade una puerta al circuito, así que ensayar sale
     caro en nodos —repetir para entender engorda la prueba—;
   - con **J**: las relaciones nacidas de ventanas correlacionadas son las más
     difíciles de podar sin desprender documentos, porque llegan de a pares;
   - con **la copia**: si el visitante deja una ventana abierta y se va, la copia
     decide en ella.
5. Después de F, el orden sugerido es **I** con superficie propia (colorear como
   verbo), luego **D** completo (dos recorridos no isomorfos con la misma
   superficie, hoy sólo insinuado) y por último **C** (grupo no sófico: la página
   que ninguna aproximación finita del archivo puede simular).
