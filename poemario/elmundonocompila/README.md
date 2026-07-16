# EL MUNDO NO COMPILA
### poemario diagramático para una máquina sin exterior

Poemario digital **generativo, animado y potencialmente infinito**, construido como un
loop continuo de diagramas poéticos. Cada página es una *tentativa fallida de diagramar
el mundo mediante código*. El loop no repite el libro: demuestra que el mundo cambia
durante el intento de representarlo.

```
MUNDO → observa → CÓDIGO → modela → DIAGRAMA → simplifica → ERROR → modifica → MUNDO′ ↺
```

## Cómo verlo

Abrí `index.html` en cualquier navegador moderno. No hay dependencias ni build: sólo
HTML, CSS, SVG y JavaScript nativo. La página ocupa el **100 % de la ventana** y es
**responsive** (adapta su disposición a pantallas apaisadas, verticales o de teléfono
con coordenadas proporcionales y tipografías fluidas). La obra avanza sola, en un loop
sin principio ni final evidentes (≈ 24–40 composiciones por vuelta), conservando entre
5 % y 15 % de sus residuos visuales y textuales para la vuelta siguiente (memoria
imperfecta). El ritmo es lento, pensado para leerse con calma.

La interfaz es discreta: se oculta cuando el lector está quieto y reaparece al mover el
ratón o tocar la pantalla.

## Controles

| tecla | acción |
|-------|--------|
| `espacio` · `K` | pausar / reanudar |
| `→` · `N` | avanzar a la siguiente composición |
| `+` · `−` | velocidad de lectura (`−` más lento · `+` más rápido) |
| `R` | regenerar: nueva semilla, nueva tentativa del mundo |
| `S` | introducir una semilla (repetir una ejecución) |
| `P` | modo impresión → exportar a PDF (Guardar como PDF) |
| `?` · `H` | ayuda · `Esc` cierra |

La semilla queda en la URL (`?seed=…`), de modo que una ejecución puede repetirse
exactamente: **una misma semilla = una misma lectura**.

## Arquitectura

| archivo | función |
|---------|---------|
| `index.html` | escenario, página editorial, HUD, controles, raíz de impresión |
| `style.css` | estética: máquina esotérica, manual técnico imposible, terminal, fotocopia |
| `content.js` | azar sembrable + 12 categorías del mundo + tejedores de fragmentos |
| `diagrams.js` | sistema diagramático SVG (coordenadas proporcionales) + 22 familias de páginas + 10 funciones de flecha |
| `animation.js` | movimiento tipográfico/diagramático (trazado, mutación, caída, borrado) |
| `engine.js` | el director del loop con estado global persistente y memoria imperfecta |

### Las 12 categorías

`WORLD · BODY · CODE · WEATHER · LABOR · MEMORY · NETWORK · MATTER · ERROR · TIME · PROTOCOL · RESIDUE`

Cada fragmento mezcla al menos **tres** categorías. El clima, una frontera, una deuda,
una célula, el tráfico, una nube, una memoria, una guerra, un archivo y una instrucción
condicional pueden pertenecer al mismo sistema aunque ninguna escala coincida con otra.

### Las 10 funciones de flecha

`transformación · dependencia · transmisión · contradicción · retroalimentación ·
contagio · pérdida · demora · bifurcación · observación`

Se distinguen por trazo, punta, interrupción y velocidad. La leyenda existe, pero se
corrompe gradualmente y el diagrama termina desobedeciéndola.

### Memoria del generador (estado global)

El motor recuerda —de forma imperfecta— qué palabras repitió, qué nodos quedaron
abiertos, cuántos errores ocurrieron, qué página produjo más densidad, qué fragmentos
no encontraron conexión y **cuánto del mundo sigue sin representar**. Ese estado altera
las probabilidades de la página siguiente. Al cerrar cada vuelta el mundo se mueve
(deriva), el modelo olvida un poco, y la última página detecta una variable no resuelta,
contamina la portada y vuelve a empezar transformada:

```js
while (mundo !== mundo_modelado) {
    observar();
    diagramar();
    perder_algo();
}
```
