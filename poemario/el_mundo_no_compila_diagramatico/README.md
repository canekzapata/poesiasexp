# EL MUNDO NO COMPILA
## edición diagramática fullscreen

Poemario generativo, animado y potencialmente infinito en HTML, CSS y JavaScript nativo.

Esta edición abandona deliberadamente la lógica de interfaz. La pantalla completa funciona como pliego editorial, sangrado, mesa de montaje y campo de colisión. Los registros laterales, variables, mediciones y trazas ya no se ordenan para ser consultados: se convierten en materia tipográfica.

## Abrir

```bash
python3 -m http.server 8000
```

Después abre `http://localhost:8000`.

También puede abrirse `index.html` directamente en navegadores que permitan scripts locales.

## Controles

- `espacio`: pausa / continúa
- `→`: avanza
- `R`: regenera con otra semilla
- `F`: pantalla completa
- `P`: genera una vuelta completa para impresión o PDF
- campo `semilla`: repite una ejecución

La semilla puede fijarse en la URL:

`index.html?seed=mi-semilla`

## Cambios de esta edición

- 100 % del ancho y alto de la ventana.
- Ocho gramáticas de pliego que desplazan, cortan o invierten el aparato gráfico.
- Mayor densidad de nodos, relaciones y fragmentos.
- Palabras monumentales de hasta varios cientos de píxeles.
- Microtexto usado como trama y no como explicación.
- El antiguo panel lateral fue degradado en capas, franjas, números, columnas y bloques móviles.
- Más peso generativo para redes, señales, coordenadas, causalidades, errores y desbordamientos.
- La orientación vertical comprime y recorta el pliego; no lo convierte en una interfaz móvil.
- La salida impresa conserva una composición A4 separada.

## Archivos

- `index.html`
- `style.css`
- `content.js`
- `engine.js`
- `diagrams.js`
- `animation.js`

No requiere bibliotecas externas.
