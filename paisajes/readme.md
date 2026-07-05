# paisajes con unicode

un paisaje zurcido con escrituras, en la línea de [sutilezas](../sutileza):
tracery casero + caracteres de unicode + colores al azar sobre variables css.

## capas (de arriba a abajo)

- **cielo** — nubes de emoji (☁🌧⛈), lluvia egipcia 𓇲, trueno anatolio 𔓢 (TONITRUS), aves 𓅃𔒟
- **cordillera** — MONS anatolio 𔓬, colinas egipcias 𓈉𓈋𓈌, triángulos y cuñas de block elements
- **ladera** — sextantes y sombras de *symbols for legacy computing* (🬦🮘▓), con plantas, rocas, cabras y gente incrustadas
- **pradera** — plantas egipcias 𓇋𓆰, cosechas de lineal B (𐂎 trigo, 𐂐 oliva, 𐂖 vino), humanos 𓀠𔐀𐂀
- **río** — agua egipcia 𓈖𓈗, FLUMEN anatolio 𔓳, peces 𓆟🐠 en subíndice, barcas 𓊛

## archivos

- `lexico.js` — desglose semántico de los unicode: cada signo agrupado por lo que
  significa (peces, humanos, plantas, laderas...), no por bloque. egipcio por lista
  de Gardiner, anatolio por lista de Laroche, ideogramas de lineal B por su nombre
  propio, lineal A como pura textura indescifrada.
- `motor.js` — prng estilo fxhash, esquemas de color (momento del día × modo
  armónico), esquemas de animación por capa, mini-tracery y armado de las capas.
- `index.html` — fuentes, keyframes y contenedores de texto (h4 h5 h6 span font sub sup),
  cada uno con su propio pulso de color.

## rasgos de cada corrida

- **momento**: amanecer / mediodía / atardecer / noche (la noche saca luna 𓇹𔓜 y estrellas 𓇼)
- **paleta**: caos / mono / análogo / complemento / tríada
- **esquema por capa**: gradiente que se derrama / fondo pulsante / tinta pulsante / sombra pulsante / máscara de texto

clic para otro paisaje.

canekzapata.net · 2026
