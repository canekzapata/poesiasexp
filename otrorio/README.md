# LABERINTO / otra internet dentro del mismo corpus

Una obra de net art generativo construida como archipiélago de documentos HTML.
La semilla no cambia únicamente el texto: decide el grafo, las topologías, las
paletas, las reglas celulares, las mutaciones y las páginas ocultas.

## Abrir

`index.html` funciona directamente con `file://`. Para una navegación más
predecible de iframes y ventanas también puede servirse como sitio estático:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080/`.

Al abrir `index.html` sin `?seed=`, el umbral crea una semilla privada del tipo
`rio-…` y la propaga por todas sus rutas. Una URL que ya contiene `?seed=`
conserva ese mundo: así se puede volver, compartir o continuar una lectura sin
reiniciarla.

## Regenerar

No tiene dependencias externas. Requiere únicamente Node.js 18 o posterior.

```bash
node generar-sitio.mjs
node generar-sitio.mjs --seed otra-semilla
node generar-sitio.mjs --seed otra-semilla --pages 48
```

Sin `--pages`, la semilla decide entre 62 y 104 documentos; el argumento admite
hasta 128. El mundo entregado usa la semilla `otra-agua-2026`: 96 páginas, 27
topologías y 12 nodos que el mapa
no revela.

Cada documento generado contiene dos hipervínculos HTML persistentes como
mínimo. Pueden existir muchas rutas destructibles, reproductoras o mutantes,
pero esas dos rutas no entran en la gramática de destrucción: el mundo siempre
conserva al menos una bifurcación real.

## Anatomía

- `index.html`: umbral celular; no es un panel de control.
- `paginas/`: internet local ya generada y navegable.
- `mapa.html`: índice de páginas usadas, directorio completo y dibujo del grafo.
- `afuera.html` y `error.html`: rutas laterales.
- `acontecimientos.html`: crónica local, imprimible y exportable como JSON.
- `reliquias.html`: amoxtli local de hallazgos; conserva frases, no puntos.
- `comentario.html`: comentario anotado incorporado al mundo como documento vivo.
- `manifest.json` / `manifest.js`: topología reproducible del mundo.
- `js/corpus.js`: materia verbal y glífica organizada por función visual.
- `js/automatas.js`: Wolfram 30/45/54/60/90/110, Conway, autómata cíclico y
  autómata tipográfico.
- `js/acontecimientos.js`: memoria textual de descubrimientos e interacciones.
- `js/graficas.js`: doce especies de gráficas generativas dibujadas en Canvas.
- `js/ruido.js`: campo de botones, lluvia tipográfica y amplificación visual.
- `js/rutas.js`: enlaces reales, ventanas, descendencia y memoria local.
- `js/mapa.js`: lectura visual de páginas usadas, visitas y permanencias.
- `js/genoma-paginas.js`: catálogo generado de etiquetas, clases, estilos, texto,
  fragmentos de código y configuraciones Canvas.
- `js/diagramas.js`: conexiones dibujadas, nodos ilegítimos y mutación interactiva
  de diagramas.
- `js/canibal.js`: digestión y recombinación del DOM en el lugar donde ya vive.
- `js/tlahtolli.js`: motor bilingüe para texto inicial, generado y canibalizado.
- `js/reliquias.js`: memoria por semilla de reliquias encontradas y sacrificadas.
- `js/poliglotas.js`: personajes lingüísticos que reaccionan al trayecto.
- `js/sonido.js`: primera gramática sonora generativa y optativa.
- `js/zapping.js`: cambios ocasionales y sembrados de estación/página.
- `vendor/Tone.js`: Tone.js 15.1.22 guardado localmente con su licencia MIT.
- `js/gramaticas.js`: comportamiento específico de cada especie de página.
- `js/motor.js`: mutaciones temporales, eventos raros, pausa y poda.
- `generar-sitio.mjs`: generador completo sin paquetes.

## Gestos

La obra responde a clic, doble clic, scroll, espera, formulario, botón Atrás y
recarga. Algunas rutas abren documentos reales; otras nacen dentro de iframes o
ventanas. `Esc` detiene la proliferación y las mutaciones. Las preferencias de
movimiento reducido desactivan la actividad continua.

El código limita a tres niveles la recursión de iframes, abre ventanas reales
sólo después de un gesto y sustituye pop-ups bloqueados por ventanas internas.

Las páginas de topología `formulario oracular` y sus descendientes de familia
`006` nacen con botones-poema. `+5` siembra cinco controles nuevos; los demás pueden aumentar el
ruido, cultivar ASCII, soltar texto, cambiar la escala, abrir una gráfica o
revelar el mapa de páginas usadas. Ese
campo flotante no se repite en las otras especies: cada una conserva sus propios
gestos e interfaces. También contienen el control que activa o calla Tone.js.

Las gráficas no son un tablero estadístico ni dependen de Chart.js: leen
cantidades reales del documento (enlaces, bloques, glifos, texto, regla celular,
visitas y tiempo) y las vuelven barras, líneas, dispersión, estratos, corrientes,
diagramas radiales, moiré, glitch, constelaciones, escritura, autómatas o
erosiones. Cada clic vuelve a medir; el doble clic desprende la figura de su eje.

## Autómatas, demora y zapping

Además del `autómata habitable`, existen el `telar de autómatas` —muchos paneles
con Wolfram, Conway, estados cíclicos y escritura celular— y el `archivo de
generaciones`, una cinta horizontal de transcripciones y superficies vivas.
Hay 66 paneles celulares en el mundo entregado; sólo una fracción se anima al
mismo tiempo para no multiplicar innecesariamente los ciclos de dibujo.

El `poema que exige permanencia` no coloca sus versos en la superficie al
cargar. Cuenta únicamente tiempo con la pestaña visible y materializa una línea
por intervalo. El avance se guarda por semilla y página: volver continúa la
demora, no la simula.

Quince páginas pueden actuar como estaciones de zapping. Tras una advertencia
breve cambian hacia otra página del corpus o, algunas veces, hacia el mapa. El
lector puede cancelar el cambio —si ya encontró una reliquia, la permanencia la
sacrifica—; no ocurre dentro de `iframe`, no se repite en
la misma estación durante la sesión y se detiene después de seis saltos. El
destino favorece páginas no usadas, ejerce una atracción adicional hacia las
ocultas y excluye el tramo reciente.

## Mapa de páginas usadas

El mapa lee la memoria local del recorrido. Su primera vista ordena las páginas
según fueron usadas y muestra número de cargas y permanencia acumulada; una
página cargada dentro de otra también cuenta. Las otras vistas muestran las
direcciones o sus relaciones, salvo las ocultas todavía no descubiertas. Sólo
después de usar las 96 el mapa dice toda la verdad. Aparece desde el umbral, junto al botón de
PDF en la crónica, en controles sembrados y como destino raro del zapping.

Cada documento mantiene una ruta estructural de largo alcance y una segunda
ruta recalculada al cargar. Esa salida consulta visitas y las últimas dieciocho
páginas: primero busca una dirección no usada y, si el mundo ya fue recorrido,
evita el tramo reciente. El grafo sigue siendo circular y retornable, pero deja
de premiar el circuito `000 → 001 → 002 → 017`.

## Diagramas y familias 006 / 013

Cuatro especies convierten el diagrama en materia poética. `diagrama habitable`
permite tocar dos cajas para dibujar una relación nueva y crear nodos ilegítimos
con doble clic. `ensayo convertido en diagrama` superpone texto continuo,
aperturas, flechas y faux-code a distintas velocidades. `oráculo descendiente de
006` hace del formulario una constelación lúdica; `mapa que hereda la
desaparición de 013` somete sus nodos y relaciones a la gramática de pérdida.

`006` y `013` conservan sus especies originales. Sus descendientes comparten una
marca genealógica visible en el mapa, pero cada generación recibe paleta,
vecindario, texto y comportamiento propios.

## Canibalismo de código y color vivo

No aparecen cápsulas, tarjetas ni ventanas que representen otra página. El
generador desarma cada documento en un genoma de etiquetas, clases, propiedades
CSS, textos, pequeños fragmentos HTML y modos de Canvas. Durante la lectura,
`js/canibal.js` selecciona código de otra dirección y lo digiere en el DOM
actual: puede cambiar una etiqueta, trasplantar una clase o propiedad, intercalar
hijos, repartir una estructura entre dos nodos o volver gráfica una zona que ya
existía. Canvas, autómatas, gráficas, `iframe`, imágenes, enlaces, botones,
formularios y contenedores completos son materia digestible. Sólo las dos rutas
persistentes quedan fuera para conservar una salida real. La memoria del
recorrido favorece código de páginas visitadas.

La topología `página caníbal primitiva` empieza casi vacía y se ensambla en el
navegador con decenas de primitivos tomados de esos genomas. Doble clic, scroll,
tiempo, seis gestos o la tecla `c` pueden provocar otra mordida.

Los fondos de bloques y estratos atraviesan animaciones de color generadas a
partir de la paleta de su página de origen. La preferencia de movimiento
reducido detiene estos ciclos.

La tipografía también forma parte de la semilla. La obra reutiliza tres fuentes
que ya pertenecían a `poesiasexp` (`Web437_EverexME_5x8`,
`Web437_IBM_Model3x_Alt4` y `AC437_COMPIS`) y canibaliza del laberinto anterior
cuatro escrituras arqueológicas (`anatolio`, `egipcio`, `lineara`, `linearb`).

## Tlahtolli y reliquias

El corpus incorpora vocabulario y pasajes identificados como náhuatl clásico,
con grafía normalizada sin cantidades vocálicas y glosas propias en español. La
materia se apoya en los *Cantares mexicanos* y el Gran Diccionario Náhuatl de la
UNAM; las direcciones de consulta viven al pie de `reliquias.html`. El motor no
se limita al HTML inicial: observa versos revelados por espera, descendientes,
botones y fragmentos recién digeridos por el caníbal.

Las reliquias aparecen sólo dentro de la ventana temporal de un clic o una
activación por teclado; cargar, esperar y ejecutar animaciones no puede
producirlas. Se guardan por semilla. El códice no muestra porcentaje, rango ni
meta: cada pieza conserva la frase en náhuatl, un fragmento de griego antiguo,
sus glosas editoriales, la página y el gesto que la hizo aparecer. Las
destrucciones voluntarias de las familias 013 dejan además una cicatriz estable
que vuelve al recargar con la misma semilla.

## Personajes lingüísticos

El inglés comenta la trayectoria y cuestiona el contrato UX/UI de enlaces,
botones y mapas. El francés responde mediante trabalenguas originales y fuerza
la superficie tipográfica. El portugués forma una corriente neológica,
telegráfica y parentética inspirada en la energía de Sousândrade, sin reproducir
sus versos. Estas tres voces sólo se materializan ante hover, clic o activación;
no son una capa de traducción automática.

El griego antiguo no circula como comentario: permanece reservado para las
reliquias. El corpus usa cuatro fragmentos de Heráclito —DK B12, B60, B119 y
B123— y declara las versiones en español como glosas editoriales propias.

## Sonido inicial

Tone.js no usa CDN ni samples. Tampoco se descarga al abrir cada documento: se
carga localmente sólo después de activar el sonido. La regla celular, la
topología y la semilla deciden escala, tempo, silencios, ruido, filtro y
retroalimentación. Los acontecimientos visuales —en especial canibalismo,
gráficas, autómatas, enlaces y destrucciones— producen variaciones audibles.

No hay autoplay. `entrar con sonido` aparece en el umbral y `escuchar el código`
en los formularios. La elección se recuerda localmente; en páginas posteriores
el contexto despierta con el siguiente gesto normal del lector. `Esc` silencia o
reanuda la capa sin convertir el sitio en un panel de instrumento.

Sólo la ventana principal posee el motor y el `AudioContext`. Los documentos
que viven dentro de `iframe` envían sus acontecimientos a esa superficie, de
modo que una constelación completa sigue siendo una sola criatura sonora. Al
abandonar la página se retiran los listeners y se desechan los nodos de audio.

### Consola y extensiones

Los mensajes que nombran `contentscript.js`, `ObjectMultiplex`,
`app-init-liveness` o `background-liveness` proceden de una extensión del
navegador, no de Tone.js. En particular, esa combinación está documentada en
MetaMask. Puede comprobarse abriendo la obra en un perfil sin extensiones. El
mensaje `Node cannot be found in the current page` pertenece a DevTools cuando
intenta revelar un nodo que ya cambió o fue retirado; en esta pieza el DOM muta
deliberadamente. El favicon local evita además la petición fallida a
`/favicon.ico`.

## Escrituras y especies visuales

El generador indexa cinco regímenes que pueden coexistir sin jerarquía fija:

- escritura literaria relativamente legible;
- escritura visual de escala extrema, desde palabra monumental hasta trama;
- faux-code literario usado como fondo, instrucción, textura u op art;
- elementos de bloque (`blockquote`, `pre`, `details`, `address`, listas,
  definiciones y figuras);
- esculturas y paisajes ASCII.

Las topologías `tormenta de escrituras`, `escultura ASCII`, `jardín
estratificado`, `observatorio gráfico del ruido` y `página caníbal primitiva` cruzan estos regímenes con
capas celulares, paletas semánticas y territorios. El jardín no importa dibujos
cerrados: utiliza la lógica de estratos y especies para producir ramas, agua,
raíces, glifos, faux-code y frases ancladas dentro de la misma superficie.

## Acontecimientos

Visitas nuevas, permanencias, líneas del poema, zapping, mapas, enlaces,
ventanas, destrucciones, reproducciones, canibalismo, sonido, autómatas y
eventos raros escriben una crónica en `localStorage`, separada por
semilla. Ciertas páginas ocultas revelan el enlace a
`acontecimientos.html`. Desde ahí la crónica puede imprimirse o guardarse como
PDF mediante el diálogo del navegador y descargarse como JSON.

La dirección para las siguientes fases sonoras está en
`adendas/sonido-y-acontecimientos.md`.
