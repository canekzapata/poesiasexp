


// Función para generar una oración
// Posiciones aleatorias para centrar la imagen
const posicionesX = ['left', 'right', 'center'];
const posicionesY = ['top', 'center'];

const randomValue = fxrand();  // Usando fxrand en lugar de Math.random

let fontFamilies = [];

fetch('fonts/fonts.css')
    .then(response => response.text())
    .then(data => {
        // Extraer todas las familias de fuentes del archivo CSS usando una expresión regular
        const fontRegex = /font-family:\s*"([^"]+)"/g;
        let match;
        while (match = fontRegex.exec(data)) {
            fontFamilies.push(match[1]);
        }
    })
    .catch(error => {
        console.error("Error al cargar las fuentes:", error);
    });

fetch('imagen/lista_imagenes.txt')
    .then(response => response.text())
    .then(data => {
        const imagenes = data.trim().split('\n');
        const imagenAleatoria = imagenes[Math.floor(fxrand() * imagenes.length)];

        // Establecer posición aleatoria
        const posicionX = posicionesX[Math.floor(fxrand() * posicionesX.length)];
        const posicionY = posicionesY[Math.floor(fxrand() * posicionesY.length)];

        const fondo = document.getElementById('fondo');

        // Aplicar la imagen de fondo al contenedor
        fondo.style.backgroundImage = `url('imagen/${imagenAleatoria}')`;
        fondo.style.backgroundPosition = `${posicionX} ${posicionY}`;

        // Aplicar un zoom aleatorio a veces
        if (fxrand() < 0.6) { // 50% de probabilidad de zoom
            const zoom = 1 + (fxrand() * 1.9); // Un zoom aleatorio entre 1 (sin zoom) y 1.9 (90% de zoom)
            fondo.style.backgroundSize = `${zoom * 100}%`;
        } else {
            fondo.style.backgroundSize = 'cover';
        }



        function cargarFuentes(fontFamilies) {
    const fuentes = fontFamilies.map(family => {
        const fuente = new FontFace(family, `url(fonts/${family}.ttf)`);
        return fuente.load();
    });

    return Promise.all(fuentes);
}

        // Decidir qué animación aplicar y su duración
        const tipoAnimacion = fxrand() < 0.5 ? "hueRotateFull" : "hueRotateMaxAndBack";
  const duracionAnimacion = (fxrand() * 10) + 5; // Duración aleatoria entre 5 y 15 segundos

  // Si se elige hueRotateMaxAndBack, establece un valor aleatorio para --max-rotation
  if (tipoAnimacion === "hueRotateMaxAndBack") {
      const maxRotation = Math.floor(fxrand() * 187); // Valor entre 0 y 360
      fondo.style.setProperty('--max-rotation', `${maxRotation}deg`);
  }

  fondo.style.animation = `${tipoAnimacion} ${duracionAnimacion}s infinite`;
    })
    .catch(error => {
        console.error("Error al cargar la lista de imágenes:", error);
    });

function generadorTexto(oraciones, extender = false, agregarSecundaria = false, fusionar = false) {
    const randomIndex = Math.floor(fxrand() * oraciones.length);
    let oracion = oraciones[randomIndex];
    const textoGenerado = document.getElementById('textoGenerado');
        if (fontFamilies.length > 0) {
            const randomFont = fontFamilies[Math.floor(fxrand() * fontFamilies.length)];
            textoGenerado.style.fontFamily = randomFont;
        }
        const colores = ['rgba(0,250,102,1)', 'yellow', '#1589FF'];
            const randomColor = colores[Math.floor(fxrand() * colores.length)];
            textoGenerado.style.color = randomColor;

        if (extender && randomIndex + 1 < oraciones.length) {
          oracion += " " + oraciones[randomIndex + 1];
      }

      if (agregarSecundaria) {
          const oracionSecundaria = oraciones[Math.floor(fxrand() * oraciones.length)];
          oracion += " " + oracionSecundaria;
      }

      if (fusionar) {
            const palabras = oracion.split(' ');
            if (palabras.length > 1) {
                const puntoCorte = Math.floor(fxrand() * (palabras.length - 1));
                const oracionInicio = palabras.slice(0, puntoCorte).join(' ');
                const oracionFusion = oraciones[Math.floor(fxrand() * oraciones.length)].toLowerCase();
                oracion = oracionInicio + " " + oracionFusion;
            }
        }

      // Llamada a agregarSaltoLineaAleatorio después del bloque fusionar
      oracion = agregarSaltoLineaAleatorio(oracion);

      return oracion;
  }

  function ajustarTamañoFuente() {
      const contenedor = document.getElementById('textoGenerado');
      let minFontSize = 3.2; // tamaño mínimo de fuente en vmax (equivalente al 3.7% del lado más grande del viewport)
      let maxFontSize = 4.2; // tamaño máximo de fuente en vmax
      let currentFontSize = (minFontSize + maxFontSize) / 2;

      while (maxFontSize - minFontSize > 0.05) {  // Ajustando la tolerancia para vmax
          contenedor.style.fontSize = `${currentFontSize}vmax`;

          if (contenedor.offsetHeight > window.innerHeight * 0.55) {
              maxFontSize = currentFontSize;
          } else {
              minFontSize = currentFontSize;
          }

          currentFontSize = (minFontSize + maxFontSize) / 2;
      }

      contenedor.style.fontSize = `${currentFontSize}vmax`;

      // Ajustar la posición vertical del contenedor
      if (contenedor.offsetHeight <= window.innerHeight * 0.42) {
          contenedor.style.top = "42%";
          contenedor.style.bottom = "auto";
      } else if (contenedor.offsetHeight <= window.innerHeight * 0.30) {
          contenedor.style.top = "30%";
          contenedor.style.bottom = "auto";
      } else {
          contenedor.style.top = "3%";
          contenedor.style.bottom = "auto";
      }
  }

  function agregarSaltoLineaAleatorio(oracion) {
      // Probabilidad global de activar la función de corte
      if (fxrand() > 0.6) {
          return oracion; // Regresa la oración original sin cambios
      }

      const palabras = oracion.split(' ');
      let nuevaOracion = '';
      let palabrasEnLineaActual = 0;

      palabras.forEach((palabra, index) => {
          nuevaOracion += palabra + ' ';
          palabrasEnLineaActual++;

          // Si ya se tienen 4 o más palabras y hay una probabilidad del 20% de corte, se agrega el salto de línea
          if (palabrasEnLineaActual >= 4 && fxrand() < 0.2) {
              nuevaOracion += "<br>";
              palabrasEnLineaActual = 0;
          }
      });

      // Eliminar el último espacio
      nuevaOracion = nuevaOracion.trim();

      return nuevaOracion;
  }
// Función para generar el texto y mostrarlo en el contenedor
function generarTexto() {
    fetch('lands.txt')
    .then(response => response.text())
    .then(data => {
        let oraciones = data.match(/[A-Z][^.]*\./g);
        oraciones = oraciones.filter(oracion => {
            const numPalabras = oracion.split(' ').length;
            return numPalabras <= 90 && numPalabras >= 10;
        });
        const texto = generadorTexto(oraciones, true, true, true);

        // Envolver el texto en un elemento <a> y agregar el evento de clic
        const link = document.createElement('a');
        link.innerHTML = texto;
        link.href = '#'; // Esto es necesario para que el elemento sea un hipervínculo funcional
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Esto previene que el hipervínculo siga el valor de 'href'
            location.reload(); // Recargar la página
        });

        const contenedor = document.getElementById('textoGenerado');
        contenedor.innerHTML = ''; // Limpiar el contenedor
        contenedor.appendChild(link); // Agregar el hipervínculo al contenedor

        ajustarTamañoFuente();
    })
    .catch(error => {
        console.error("Error al cargar el archivo:", error);
    });
}



    document.addEventListener('DOMContentLoaded', (event) => {
        generarTexto();
    });

    const oscillatorTypes = ["sine", "triangle", "square" ];

  const randomOscillatorType = oscillatorTypes[Math.floor(fxrand() * oscillatorTypes.length)];

  const organSettings = {
      oscillator: {
          type: randomOscillatorType
      },
      envelope: {
          frequency:4.5,
          attack: 2.84,
          decay: 1.6,
            frequency: 3.5,
          sustain: 0.2,
            delayTime: 1.5,
          feedback: 0.3,
            echo: 1.5,
          release: 0.91,
              spread: 90,
          		phase: 23

      }
  };


    const synthMelody = new Tone.FMSynth(Tone.Synth, organSettings).toDestination();

    // Crea el efecto de chorus
    const chorus = new Tone.Chorus({
        frequency:18.5,
        delayTime: 2.5,
        depth: 0.3,
        feedback: 0.3,
        type: "sine",
        echo: .6,
        spread: 30
    }).toDestination().start();

    const bassOrganSettings = {
      oscillator: {
          type: randomOscillatorType
      },
      envelope: {
          attack: 0.7,
          decay: 0.4,
          sustain: 0.4,
            delayTime: 2.5,
            spread: 30,

          release: 1,

      }
  };

  // 2. Crear los efectos
  const reverb = new Tone.MonoSynth(0.3).toDestination();
  const delay = new Tone.FeedbackDelay(0.5);

const useReverbAndDelay = fxrand() < 0.5;
const useChorus = fxrand() < 0.5;

const synthBass = new Tone.PolySynth(bassOrganSettings).toDestination();

if (useChorus) {
    synthBass.connect(chorus);
}
    // Crea el sintetizador para el bajo y lo conecta al chorus

    const scales = {
      "C Major": ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"],
      "A Minor": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
      "G Major": ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"],
      "A Melodic Minor": ["A3", "B3", "C4", "D4", "E4", "F#4", "G#4", "A4"],
      "D Major": ["D3", "E3", "F#3", "G3", "A3", "B3", "C#4", "D4"],
      "E Minor": ["E3", "F#3", "G3", "A3", "B3", "C4", "D4", "E4"],
      "Bb Major": ["Bb3", "C4", "D4", "Eb4", "F4", "G4", "A4", "Bb4"],
      "F Major": ["F3", "G3", "A3", "Bb3", "C4", "D4", "E4", "F4"],
      "E Major": ["E3", "F#3", "G#3", "A3", "B3", "C#4", "D#4", "E4"],
      "B Minor": ["B3", "C#4", "D4", "E4", "F#4", "G4", "A4", "B4"],
      "Pop Major": ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4"],
    "Pop Minor": ["A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4"],
    "Indie Folk Major": ["G3", "A3", "B3", "C4", "D4", "E4", "F#4", "G4"],
    "Whole Tone": ["C3", "D3", "E3", "F#3", "G#3", "A#3"], // Escala de tono entero, común en música impresionista
   "Diminished": ["C3", "D3", "D#3", "F3", "F#3", "G#3", "A3", "B3"], // Escala disminuida
   "Hindu": ["C3", "D3", "E3", "F3", "G3", "A3", "Bb3", "C4"], // Escala hindú
   "Phrygian Dominant": ["C3", "Db3", "E3", "F3", "G3", "Ab3", "Bb3", "C4"], // Modo frigio dominante, común en música árabe y flamenca
   "Double Harmonic": ["C3", "Db3", "E3", "F3", "G3", "Ab3", "B3", "C4"], // Escala con un sonido "exótico" o "medio oriental"
   "Lydian Augmented": ["C3", "D3", "E3", "F#3", "G#3", "A3", "B3", "C4"], // Escala del modo lidio aumentado
       "Harmonic Minor": ["C3", "D3", "Eb3", "F3", "G3", "Ab3", "B3", "C4"], // Escala menor armónica
       "Neapolitan Major": ["C3", "Db3", "Eb3", "F3", "G3", "A3", "B3", "C4"], // Escala mayor napolitana
       "Neapolitan Minor": ["C3", "Db3", "Eb3", "F3", "G3", "Ab3", "B3", "C4"], // Escala menor napolitana
       "Hungarian Gypsy": ["C3", "D3", "E3", "F#3", "G3", "Ab3", "B3", "C4"], // Escala gitana húngara
       "Persian": ["C3", "Db3", "E3", "F3", "G3", "Ab3", "B3", "C4"], // Escala persa
       "Balinese": ["C3", "Db3", "Eb3", "F#3", "G3", "Ab3", "B3", "C4"] // Escala balinesa


  };

  const chordProgressions = {
      "C Major": ["C3", "F3", "G3", "C3"],
      "A Minor": ["A3", "D4", "E4", "A3"],
      "G Major": ["G3", "C4", "D4", "G3"],
      "A Melodic Minor": ["A3", "D4", "E4", "A3"],
      "D Major": ["D3", "G3", "A3", "D3"],
      "E Minor": ["E3", "A3", "B3", "E3"],
      "Bb Major": ["Bb3", "Eb4", "F4", "Bb3"],
      "F Major": ["F3", "Bb3", "C4", "F3"],
      "E Major": ["E3", "A3", "B3", "E3"],
      "B Minor": ["B3", "E4", "F#4", "B3"],
      "Pop Major": ["C3", "G3", "Am3", "F3"], // I-V-vi-IV
    "Pop Minor": ["Am3", "F3", "C3", "G3"], // vi-IV-I-V
    "Indie Folk Major": ["G3", "D4", "Em3", "C3"], // I-V-vi-IV
    "Whole Tone": ["C3", "D#3", "F#3", "A#3"],
    "Diminished": ["C3", "D#3", "F#3", "A3"],
    "Hindu": ["C3", "F3", "G3", "Bb3"],
    "Phrygian Dominant": ["C3", "Db3", "E3", "G3"],
    "Double Harmonic": ["C3", "Db3", "G3", "Ab3"],
    "Lydian Augmented": ["C3", "F#3", "G#3", "A3"],
"Harmonic Minor": ["C3", "D3", "Eb3", "B3"],
"Neapolitan Major": ["C3", "Db3", "F3", "A3"],
"Neapolitan Minor": ["C3", "Db3", "G3", "B3"],
"Hungarian Gypsy": ["C3", "F#3", "G3", "Ab3"],
"Persian": ["C3", "Db3", "E3", "Ab3"],
"Balinese": ["C3", "Db3", "F#3", "B3"]

  };

    // Selecciona una escala y progresión de acordes al azar
    const randomScaleName = Object.keys(scales)[Math.floor(fxrand() * 5)];
    const selectedScale = scales[randomScaleName];
    const selectedProgression = chordProgressions[randomScaleName];

    function generateMelody(scale, progression) {
        let melody = [];
        let lastNote = -1;
        let currentNote;

        for (let chord of progression) {
            for (let i = 0; i < 6; i++) {
                do {
                    currentNote = Math.floor(fxrand() * scale.length);
                } while (Math.abs(lastNote - currentNote) > 2 || currentNote === lastNote);

                melody.push(scale[currentNote]);
                lastNote = currentNote;
            }
        }

        return melody;
    }

    function generateCounterpoint(scale, progression) {
        let bassLine = [];
        let currentNote;

        for (let chord of progression) {
            currentNote = chord;
            bassLine.push(currentNote);

            // Añadir algunas variaciones
            for (let i = 0; i < 3; i++) {
                const variation = fxrand() < 0.5 ? 1 : -1;
                const index = scale.indexOf(currentNote);
                if (index + variation >= 0 && index + variation < scale.length) {
                    currentNote = scale[index + variation];
                    bassLine.push(currentNote);
                } else {
                    bassLine.push(currentNote);
                }
            }
        }

        return bassLine;
    }

    function playMelodyAndCounterpoint() {
    const melody = generateMelody(selectedScale, selectedProgression);
    const counterpoint = generateCounterpoint(selectedScale, selectedProgression);

    let time = 0;

    melody.forEach((note, index) => {
        synthMelody.triggerAttackRelease(note, "16n", time);
        // Solo se tocan las notas de contrapunto si el índice es múltiplo de 4 (0, 4, 8, 12)
        if (index % 4 === 0) {
            synthBass.triggerAttackRelease(counterpoint[index / 4], "8n", time);
        }
        time += Tone.Time("16n").toSeconds();
    });
}

    window.addEventListener("load", async () => {
        await Tone.start();
        playMelodyAndCounterpoint();
    });


      const melody = generateMelody(selectedScale, selectedProgression);
      const counterpoint = generateCounterpoint(selectedScale, bassLine);

      console.log("Escala de la melodía:", randomScaleName);
      console.log("Progresión de acordes de la melodía:", selectedProgression);

      console.log("Escala del bajo:", randomScaleName);
      console.log("Progresión de acordes del bajo:", bassLine);

      if (useReverbAndDelay) {
          console.log("Aplicando Reverb y Delay al bajo.");
      }
      if (useChorus) {
          console.log("Aplicando Chorus al bajo.");
      }
