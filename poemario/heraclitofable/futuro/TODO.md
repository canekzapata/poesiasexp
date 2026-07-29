# Heráclito Fable · futuro

Cosas por hacer, en orden aproximado de jugo/esfuerzo. Lo marcado ✅ ya está.

## Hecho
- ✅ Proyección pseudo-3D (glifos que llegan desde el punto de fuga).
- ✅ Estallar con click → libera fragmento legible (πόλεμος genera sentido).
- ✅ Vocoder-oráculo: lee en español; tecla **V** lee algo que esté en pantalla.
- ✅ 5 movimientos piloteables (Logos→Ceniza).
- ✅ **Palimpsesto**: clusters de 4+ glifos multiescritura que chocan; a veces gigantes.
- ✅ Música en vivo: pad afinado a escala por movimiento, sub, río, pulso
  generativo, estallidos-campana, compresor y bus de espacio.
- ✅ Animaciones WebKit sobre el texto (color / pulso / deriva).

## Gamificación (siguiente ola)
- [ ] **Combos / cadena**: estallar varios seguidos sube un multiplicador que
  acelera el pulso musical y agranda las islas. Feedback puramente sonoro-visual,
  sin números (o números como glifo).
- [ ] **Vidas / erosión**: cada invasor que llega sin estallar "quema" un borde
  de la pantalla (grieta acumulativa). Demasiadas → colapso a Ceniza.
- [ ] **Glifo-jefe**: cada tantos, un cluster enorme que hay que estallar 3 veces;
  al morir suelta un fragmento largo y dispara trance.
- [ ] **Modo palimpsesto puro**: los estallidos NO borran, dejan el glifo impreso
  y se van acumulando en un lienzo (palimpsesto real que se escribe encima).
- [ ] **Puntería por proximidad**: los grandes (cerca) valen menos, los pequeños
  (lejos, difíciles) sueltan fragmentos más raros del corpus.

## Control / performance
- [ ] **MIDI in**: mapear un controlador (pads = movimientos, knob = intensidad,
  fader = filtro del pad). Web MIDI API.
- [ ] **Mic reactivo**: tu voz al micro modula el filtro/tremolo del drone
  (AnalyserNode) — el vocoder responde a ti en tiempo real.
- [ ] **Preset de set**: guardar un guion de tiempos/estados y dispararlo con
  una sola tecla como red de seguridad si te trabas en vivo.
- [ ] **Salida a proyector**: modo "pantalla limpia" (oculta HUD) con **H** ya
  existe; falta separar HUD a una segunda ventana (control en laptop, arte en
  proyector) vía BroadcastChannel.

## Texto / corpus
- [ ] Integrar `futuro/mas-texto.js` a `corpus.js` cuando esté curado.
- [ ] Fragmentos en griego pronunciados por una voz `el-GR` (si existe) para el
  trance bilingüe.
- [ ] Extraer automáticamente frases cortas de los .txt del repo (Eshun,
  Burroughs, Mil mesetas) con un script y filtrarlas a mano.

## Sonido (afinar)
- [ ] Reverb real con `ConvolverNode` + impulso corto (ahora es delay-feedback).
- [ ] Que la escala del pulso module por movimiento (frigio en Pólemos, tonos
  enteros en Hiperstición) — hoy es pentatónica global.
- [ ] Sidechain: el pad "respira" con cada estallido (ducking rítmico).

## Tipografía / cobertura
- [ ] Empaquetar Noto (Sans + CJK + Arabic + Devanagari) en `fonts/` para
  garantizar la colisión palimpsesto en cualquier máquina (hoy depende de las
  fuentes del sistema del equipo donde se presente). Ojo con el peso (usar subset).
