declare name "cuerpo";
declare author "el clave bien teñido";
declare description "el cuerpo espectral de una voz-pantalla: 32 parciales repartidos en las 8 bandas de un gradiente, con su gemelo desafinado, interpolación entre dos espectros, estiramiento, desviación en cents y cruce continuo hacia el ruido cuando el croma se va.";

// =====================================================================
// EL CLAVE BIEN TEÑIDO — cuerpo.dsp
//
// aquí vive la materia y NADA MÁS. este archivo no sabe qué es una
// pantalla, ni una semilla, ni un choque: recibe valores y los suena.
// toda variación viene del modelo (color.js, contrapunto.js).
//
// los parámetros llevan los nombres del modelo, no los del DSP. si un
// parámetro no tiene equivalente en el expediente cromático, no existe:
// por eso no hay «cutoff», ni «resonance», ni «attack».
//
//   f0             fundamental en Hz, derivada del matiz y del registro
//   estiramiento   armónico ↔ estirado ↔ comprimido (eje del gradiente)
//   desviacion     cents: lo que el matiz no acierta a caer en la rejilla
//   croma          1 parciales definidos · 0 banda de ruido sin altura
//   rugosidad      el gemelo desafinado de cada parcial: batimientos
//   congelado      1 detiene la evolución de todos los parámetros
//   interpolacion  0 espectro A · 1 espectro B — la mezcla de dos colores
//   a0..a7         amplitudes de las ocho paradas del gradiente actual
//   b0..b7         amplitudes de las ocho paradas del gradiente destino
//   ganancia       amplitud de la voz, puesta por la red, no por el DSP
//
// se compila en el taller y se versiona el .wasm al lado de este fuente:
//     faust2wasm cuerpo.dsp
// la pieza no compila nada al abrirse.
// =====================================================================

import("stdfaust.lib");

N = 32;                 // parciales
B = 8;                  // bandas = paradas del gradiente
M = N / B;              // parciales por banda

// congelar es dejar de interpolar: la constante de tiempo se va a ocho
// segundos y el espectro se sostiene sin evolucionar.
congelado = hslider("congelado", 0, 0, 1, 1);
lisa = si.smooth(ba.tau2pole(0.06 + congelado * 8.0));

f0            = hslider("f0", 110, 20, 4000, 0.001) : lisa;
estiramiento  = hslider("estiramiento", 0, -0.15, 0.15, 0.0001) : lisa;
desviacion    = hslider("desviacion", 0, -150, 150, 0.01) : lisa;
croma         = hslider("croma", 1, 0, 1, 0.0001) : lisa;
rugosidad     = hslider("rugosidad", 0, 0, 1, 0.0001) : lisa;
interpolacion = hslider("interpolacion", 0, 0, 1, 0.0001) : lisa;
ganancia      = hslider("ganancia", 0, 0, 1, 0.0001) : lisa;

// la desviación en cents no es un efecto: es un matiz que cayó entre dos
// pasos de la rejilla del temperamento.
cents = pow(2.0, desviacion / 1200.0);

// frecuencia del parcial k. con estiramiento 0 la serie es armónica;
// positivo la estira (campana), negativo la comprime.
fk(k) = f0 * pow(float(k + 1), 1.0 + estiramiento) * cents;

// un parcial y su gemelo. el gemelo es lo que produce el batimiento
// cuando dos matices vecinos chocan: dos parciales casi iguales, no un
// trémolo añadido encima.
parcial(k) = (os.osc(f) + os.osc(fg) * rugosidad * 0.7) * vivo
with {
    f  = fk(k);
    fg = f * (1.0 + rugosidad * 0.006 * float(k + 1));
    // nada por encima de Nyquist: un parcial que no cabe no suena, no
    // se pliega.
    vivo = (f < (ma.SR / 2.2));
};

// la banda j del gradiente: su amplitud es el croma de la parada j, y va
// del espectro A al B. interpolar dos gradientes ES interpolar dos
// espectros, y es esta línea.
banco = par(j, B,
    ((1.0 - interpolacion) * (hslider("a%j", 0.5, 0, 1, 0.0001) : lisa)
     + interpolacion       * (hslider("b%j", 0.5, 0, 1, 0.0001) : lisa))
    * (par(m, M, parcial(j * M + m)) :> _) / float(M)
) :> _ / float(B);

// croma cero es ruido sin altura: no hay intervalo posible. la banda se
// centra en la fundamental y se ensancha con la rugosidad. Q bajo: este
// repositorio ya se desbocó una vez por un filtro con pico.
ruido = no.noise : fi.resonbp(fc, q, 1.0) * 0.5
with {
    fc = max(40.0, min(9000.0, f0 * 3.0));
    q  = 0.6 + rugosidad * 1.2;
};

voz = (croma * banco + (1.0 - croma) * ruido) * ganancia * 0.9;

process = voz;
