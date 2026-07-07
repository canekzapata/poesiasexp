# paisajes con unicode

un paisaje zurcido con escrituras, en la línea de [sutilezas](../sutileza):
tracery casero + caracteres de unicode + colores al azar sobre variables css.

## capas superpuestas (de atrás hacia adelante)

1. **cielo** — el fondo total: astro (☀𓇳𔓙 o 🌙𓇹𔓜), nubes ☁🌧⛈, satélites 🛰🛸,
   aves 𓅃𔒟, lluvia egipcia 𓇲, trueno anatolio 𔓢 (TONITRUS)
2. **montañas** — block elements con dirección: la ladera izquierda sube ◢🭇🭃,
   la cumbre ▲🭯 (o meseta de macizo █▓), la ladera derecha baja ◣🬼🭏;
   faldas con rocas, bestias y signos de lineal A incrustados
3. **nubes y pájaros** — por delante de los picos
4. **vida** — humanos en actividades 𓀤𓀠𓁐𔐀, con plantas 𓇋𐂎🌾, bestias 𓃒𔑺𐂂 y vasijas 𐃟
5. **agua** — al frente: agua egipcia 𓈖𓈗, FLUMEN anatolio 𔓳, peces 𓆟🐠 en subíndice, barcas 𓊛⛵

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
