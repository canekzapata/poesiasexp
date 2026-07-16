# ÍNDICE DEL RÍO
### el texto que todavía no ha sido encontrado

No es una página: es un **laberinto computacional**. Una máquina de lectura no
lineal donde un manuscrito ilegible sobrevive dentro de una red digital
averiada. Nadie sabe quién lo escribió, en qué lengua, ni si es poema,
contraseña, mapa, error o profecía. El visitante entra a buscar su significado;
cada interacción revela una hipótesis y destruye otra. Nunca hay traducción
definitiva.

> La recompensa por recorrer el laberinto no es comprender el texto antiguo,
> sino descubrir que el acto de buscarlo produjo otro texto.

## Abrir

```bash
python3 -m http.server 8000
```

Después `http://localhost:8000/poemario/indice_del_rio/`. También abre
`index.html` directo del disco. Sin bibliotecas externas, sin frameworks.

La semilla firma el azar en la URL: `?seed=mi-semilla&n=n0&z=0`. La misma
semilla entierra el mismo río. La URL guarda **semilla, nodo y profundidad**.

## Cómo se lee (no hay orden)

- **arrastrar** el fondo desplaza el campo; **la rueda** controla la profundidad/zoom
- **clic** en un enlace cruza; algunos enlaces **pliegan el espacio** en vez de conducir
- **clic** en un signo abre una **bifurcación**
- **mantener presionado** revela una traducción alternativa
- **clic** en dos fragmentos traza una **relación temporal** entre ellos
- **doble clic** rompe o duplica un nodo
- algunas palabras **siguen** al cursor; otras **huyen**
- el botón **Atrás** del navegador es el hilo de Ariadna (poco fiable)
- tras un rato de inactividad, el sistema **sigue excavando solo**

## Teclas

- `R` — otra excavación (otra semilla)
- `M` — mapa incompleto
- `T` — alternar traducciones
- `P` — imponer/imprimir la versión actual
- `Esc` — no sale: conduce a la cámara **AFUERA**

## Los siete loops

espacial · textual · temporal · semántico (la definición usa la palabra que
define) · gráfico (circuitos cerrados, espirales, diagramas imposibles) · de
lectura (el historial altera las interpretaciones) · falso (parece el inicio,
pero algo cambió de cauce). **Cada regreso deja un residuo.**

## Tres estratos de texto

1. **legible** — frases breves sobre lenguaje, fuego, tiempo, archivo, memoria, río, traducción y desaparición
2. **parcialmente legible** — OCR roto, palabras partidas, traducciones múltiples, sintaxis dañada
3. **materia** — glifos como alfabeto, índice, coordenada, enlace y clasificación

El alfabeto cifrado (egipcio, anatolio, lineal A/B, según la semilla) es
**decodificable**: la materia es una escritura real, no decorado. `T` la traduce.

## Sin final

Después de suficiente excavación aparece la cámara **EL SIGNIFICADO
PROVISIONAL**: el sistema compone una frase con los fragmentos que recorriste.
Parece reveladora unos segundos y luego se descompone en nuevos enlaces.

## Archivos

- `index.html` — el pliego
- `style.css` — el color como hipótesis; fuentes locales por `unicode-range`
- `script.js` — azar firmado, corpus, alfabeto, grafo, cámara, loops y memoria

Las fuentes de la materia (Noto Sans jeroglíficos egipcios y anatolios, lineal A
y lineal B) se reutilizan desde `../` (ya presentes en el poemario) por
`unicode-range`; si la pieza se sirve aislada, los glifos caen a fuentes del
sistema.

## Memoria imperfecta

Recuerda localmente rutas, fragmentos, traducciones y asociaciones. Al recargar,
algunos datos permanecen, otros mutan, y otros **afirman recordar acciones que
nunca ocurrieron**.

poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
