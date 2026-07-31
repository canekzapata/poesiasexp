# VIDA MEDIA · EN VIVO
### consola de vuelo R-27 para una lectura de veinte minutos

La lectura en vivo de VIDA MEDIA (`../vidamedia (1).txt`): la pantalla
es la nave, el poeta es la señal. Voz por vocoder (Tone.js), música
chip generativa firmada por semilla, visuales hydra, starfield con HUD,
granulación circular de la voz, textos que se escriben y se borran,
y dos voces de máquina: CORO
(la de tierra) y R-27 (formantes, por el vocoder).
Cada cuadro deja siete segundos de espacio para que entren primero
la nave, Hydra y la música; después comienza a aparecer el texto.

El diseño completo y sus cicatrices: [`notas/000-prompt-del-loop.md`](notas/000-prompt-del-loop.md).

## Cómo correrla

```bash
cd lectura-en-vivo
python3 -m http.server 8000
# → http://localhost:8000/
```

**No abrir con `file://`**: el micrófono exige `localhost` o https.
Todo es local (`lib/` trae Tone.js y hydra-synth): en escenario no
hace falta internet.

## El rito de antes de la función

`[ iniciar consola ]` ya no arranca la pieza: abre el **prevuelo**, una
ventana completa con nada corriendo debajo. La función empieza cuando
pulsas `[ comenzar la función → ]`, no antes.

1. abrir en el navegador del escenario; `I` muestra el mapa completo de
   controles y `F` activa fullscreen;
2. `[ iniciar consola ]` → conceder el **micrófono** (antes de que
   entre el público) → se abre el prevuelo;
3. ponte audífonos y **prueba con audio**, ahí mismo: `[ R-27 lee ]`,
   `[ CORO habla ]`, `[ la mezcla entera ]` (drone + máquina + tu voz,
   que es como va a sonar de verdad). Habla al micro: el vocoder ya
   responde y los medidores se mueven;
4. mira el renglón de salud: `carga: holgado · audio: sin cortes`. Si ahí
   dice que hay cortes, es ahora cuando se arregla, no en escena;
5. `[ comenzar secuencia ]` → la medición guiada: cuatro estaciones con
   un respiro antes de cada una, unos cuarenta segundos en total. Si la
   voz no despega del ruido de sala, la rechaza en vez de aplicar una
   ganancia falsa;
6. `K` dos veces (pánico y regreso), `B` dos veces (blackout), `Q` una
   vez (cerrar el micro: la tecla del acople y de la tos);
7. `[ comenzar la función → ]`.

Si algo falla, la capa rota se apaga sola y las demás siguen: el HUD
nunca miente (`micro: sin señal` es información, no drama).

`Shift+A` vuelve a abrir la calibración a media función, ya sin ventana
completa. `?directo` salta el prevuelo; `?auto` y `?turbo` lo saltan
solos, porque ahí no hay nadie a quien preguntarle.

## Las teclas

```
espacio / →  cuadro siguiente          ←         cuadro anterior
1–9, 0       saltar al cuadro (0=16)   R         re-sembrar (sólo en plataforma)
I             mapa de controles (en la portada)
T            R-27 lee el fragmento     Y         CORO lee el boletín
Q            cerrar/abrir el micro     D         micro seco on/off (¡feedback!)
Shift+V      vocoder on/off
Shift+M      música on/off             H         hydra on/off
Shift+A      calibración vocoder       Esc       cerrar calibración
G            ráfaga de glitch          E         modo ensayo (cronómetro)
A            auto-vuelo on/off         F         fullscreen
B            blackout (el audio sigue)
K            PÁNICO: mata el audio en 30 ms
z x c v n m ,   el acorde del vocoder en vivo (grados de la escala)
```

En EL NÚMERO (cuadro 12) las flechas son de la nave: `← →` mueve,
`↑` dispara a los dígitos. Sin puntaje. Es un guiño.

En LA REGIÓN, las palabras prohibidas (`nube · red`) quedan tocables
como residuo de las tachaduras: tocar una cambia cómo se ven y cómo
suenan los FILAMENTOS del cuadro siguiente. H6 se deja ver con el
parecido que le pusiste — y miente.

## La semilla y el ensayo

- `?seed=loquesea` — misma semilla, misma deriva musical y visual;
- `?ensayo` (o tecla `E`) — cronometra cada cuadro contra su duración
  orientativa y exporta el log de la corrida;
- `?calibra` (o `Shift+A`) — abre el prevuelo del micrófono: mide
  silencio, voz, vocales y sibilantes, aplica un ajuste y exporta
  `calibracion-vocoder-SEMILLA.json`. No graba ni conserva audio.
  Si la voz no supera el ruido por al menos 6 dB, o faltan vocales,
  sibilantes o espectro útil, rechaza la medición en vez de aplicar una
  ganancia o ecualización falsas;
  mientras siga pendiente, PLATAFORMA lo recuerda también en el HUD;
- `?auto` (o tecla `A`) — **auto-vuelo**: la consola avanza sola con
  las duraciones del setlist, la nave lee sola de vez en cuando, y al
  terminar ACUSE vuelve a la torre y empieza otra corrida. Para ensayar
  sin manos y para dejarla como instalación. Cualquier tecla de
  navegación devuelve el mando al poeta;
- `?turbo=20` — acelera el auto-vuelo (una corrida de 20 min en 1):
  para probar el arco completo sin esperarlo. También comprime la
  espera inicial de siete segundos;
- `?hq` — sube hydra de media resolución a 72% para proyectores y GPU
  ya probados. En escenario, sin ensayo previo, conviene dejarlo fuera;
- el reloj de misión es la **pila**: 20:00 que se dividen por dos en
  10:00, 15:00, 17:30… nunca llega a cero. ACUSE ocurre cerca del 1.5%.


## Si se traba

El audio de esta consola se planifica desde el hilo principal: cuando el
canvas, hydra o el DOM se comen un cuadro largo, la música llega tarde y
se corta. La consola ahora se defiende sola —afloja las visuales antes de
que el sonido lo pague, y lo dice en el HUD (`· apretado`, `· ligero`)—
pero en una máquina apretada hay tres perillas:

- `?ligero` — modo de bajo consumo desde el arranque: menos estrellas,
  hydra a menos cuadros y menos resolución. Nada de audio se pierde;
- `?bandas=N` — el ancho del vocoder, entre 8 y 20 (**18** por defecto,
  el timbre original). El banco pasó a filtros nativos y hoy dieciocho
  bandas pesan menos que ocho antes, así que bajarlo ya casi nunca hace
  falta; sigue siendo la concesión más audible si una máquina no da.
  La calibración se adapta al número que haya;
- `?latencia=ms` — cuánto se adelanta el planificador (**200** por
  defecto, 60–500). Subirla da más margen contra los tirones; **no**
  retrasa el micrófono, el vocoder ni el acorde en vivo, porque esos
  caminos son señal nativa. Lo único que se atrasa son los clics de
  tecleo y los blips. `?latencia=100` devuelve el ajuste anterior.

Orden recomendado si hay cortes: primero `?ligero`, luego bajar
`?bandas`, y sólo al final subir `?latencia`.

---
poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
