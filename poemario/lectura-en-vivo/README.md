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

1. abrir en el navegador del escenario; `I` muestra el mapa completo de
   controles y `F` activa fullscreen;
2. `[ iniciar consola ]` → conceder el **micrófono** (antes de que
   entre el público; PLATAFORMA no lo usa y da tiempo);
3. `Shift+A` → correr la calibración guiada del vocoder con audífonos;
4. probar `T` (R-27 lee), `Y` (CORO habla), decir algo al micro
   (el vocoder responde), `K` dos veces (pánico y regreso), `B` dos
   veces (blackout);
5. si algo falla, la capa rota se apaga sola y las demás siguen:
   el HUD nunca miente (`micro: sin señal` es información, no drama).

## Las teclas

```
espacio / →  cuadro siguiente          ←         cuadro anterior
1–9, 0       saltar al cuadro (0=16)   R         re-sembrar (sólo en plataforma)
I             mapa de controles (en la portada)
T            R-27 lee el fragmento     Y         CORO lee el boletín
Shift+V      vocoder on/off            D         micro seco on/off (¡feedback!)
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

---
poesiasexp · [canekzapata.net](https://canekzapata.net) · 2026
