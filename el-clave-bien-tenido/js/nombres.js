'use strict';
/* =====================================================================
   EL CLAVE BIEN TEÑIDO — nombres.js
   las 75 procedencias de *The Secret Lives of Color* (Kassia St. Clair),
   una por color con historia propia: un pigmento, un tinte o una idea,
   cada uno con su origen, su costo y su accidente.

   aquí no se cita el libro ni se cuenta ninguna de esas historias: sólo
   se toman los nombres, para que un color de esta pieza se llame «minio»
   o «woad» y no `#c4402a`. el ancla en OKLCH la puse yo — el libro no da
   coordenadas —, y nombrar es buscar el vecino más cercano en OKLab.

   por eso un nombre puede repetirse: dos colores distintos pueden caer
   cerca del mismo pigmento. eso no es un error, es lo que pasa con los
   nombres de color desde siempre.
   ===================================================================== */
(function (raiz) {

  /* familia · nombre · L · C · H(°). las familias son las del libro. */
  const NOMBRES = [
    ['blanco', 'blanco de plomo', 0.970, 0.005, 100],
    ['blanco', 'marfil', 0.950, 0.030, 95],
    ['blanco', 'plata', 0.850, 0.005, 250],
    ['blanco', 'cal', 0.980, 0.002, 0],
    ['blanco', 'isabelino', 0.900, 0.035, 80],
    ['blanco', 'tiza', 0.940, 0.008, 60],
    ['blanco', 'beige', 0.880, 0.045, 85],

    ['amarillo', 'rubio', 0.870, 0.090, 90],
    ['amarillo', 'amarillo de plomo y estaño', 0.880, 0.150, 98],
    ['amarillo', 'amarillo indio', 0.820, 0.170, 85],
    ['amarillo', 'amarillo ácido', 0.930, 0.200, 105],
    ['amarillo', 'amarillo de Nápoles', 0.860, 0.120, 92],
    ['amarillo', 'amarillo de cromo', 0.840, 0.190, 88],
    ['amarillo', 'gutagamba', 0.780, 0.170, 80],
    ['amarillo', 'oropimente', 0.800, 0.160, 83],
    ['amarillo', 'amarillo imperial', 0.850, 0.180, 95],
    ['amarillo', 'oro', 0.790, 0.130, 86],

    ['naranja', 'naranja de Holanda', 0.700, 0.190, 55],
    ['naranja', 'azafrán', 0.750, 0.160, 70],
    ['naranja', 'ámbar', 0.720, 0.150, 65],
    ['naranja', 'jengibre', 0.650, 0.140, 55],
    ['naranja', 'minio', 0.620, 0.190, 45],
    ['naranja', 'nude', 0.800, 0.060, 60],

    ['rosa', 'rosa Baker-Miller', 0.750, 0.100, 0],
    ['rosa', 'rosa Mountbatten', 0.600, 0.060, 350],
    ['rosa', 'pulga', 0.500, 0.080, 10],
    ['rosa', 'fucsia', 0.600, 0.250, 340],
    ['rosa', 'rosa shocking', 0.650, 0.270, 350],
    ['rosa', 'rosa fluorescente', 0.700, 0.280, 355],
    ['rosa', 'amaranto', 0.550, 0.200, 5],

    ['rojo', 'escarlata', 0.550, 0.220, 30],
    ['rojo', 'cochinilla', 0.500, 0.200, 25],
    ['rojo', 'bermellón', 0.580, 0.210, 38],
    ['rojo', 'rosso corsa', 0.520, 0.230, 32],
    ['rojo', 'hematita', 0.400, 0.080, 25],
    ['rojo', 'rubia', 0.450, 0.170, 22],
    ['rojo', 'sangre de drago', 0.380, 0.150, 28],

    ['morado', 'púrpura de Tiro', 0.350, 0.140, 330],
    ['morado', 'orchilla', 0.450, 0.130, 320],
    ['morado', 'magenta', 0.580, 0.280, 330],
    ['morado', 'malva', 0.600, 0.100, 310],
    ['morado', 'heliotropo', 0.650, 0.140, 305],
    ['morado', 'violeta', 0.450, 0.200, 300],

    ['azul', 'ultramar', 0.400, 0.200, 265],
    ['azul', 'cobalto', 0.450, 0.190, 262],
    ['azul', 'índigo', 0.320, 0.120, 275],
    ['azul', 'azul de Prusia', 0.300, 0.100, 255],
    ['azul', 'azul egipcio', 0.500, 0.140, 250],
    ['azul', 'glasto', 0.380, 0.090, 265],
    ['azul', 'azul eléctrico', 0.700, 0.160, 235],
    ['azul', 'cerúleo', 0.650, 0.120, 230],

    ['verde', 'cardenillo', 0.700, 0.100, 175],
    ['verde', 'absenta', 0.850, 0.160, 130],
    ['verde', 'esmeralda', 0.650, 0.170, 160],
    ['verde', 'verde Kelly', 0.600, 0.200, 145],
    ['verde', 'verde de Scheele', 0.680, 0.150, 140],
    ['verde', 'tierra verde', 0.550, 0.060, 150],
    ['verde', 'aguacate', 0.620, 0.100, 120],
    ['verde', 'celadón', 0.820, 0.060, 160],

    ['marrón', 'caqui', 0.620, 0.060, 95],
    ['marrón', 'ante', 0.780, 0.070, 80],
    ['marrón', 'barbecho', 0.680, 0.080, 75],
    ['marrón', 'bermejo', 0.450, 0.110, 50],
    ['marrón', 'sepia', 0.420, 0.070, 65],
    ['marrón', 'tierra de sombra', 0.380, 0.060, 62],
    ['marrón', 'momia', 0.350, 0.050, 55],
    ['marrón', 'topo', 0.500, 0.030, 70],

    ['negro', 'kohl', 0.220, 0.010, 280],
    ['negro', 'gris de Payne', 0.350, 0.030, 255],
    ['negro', 'obsidiana', 0.180, 0.010, 300],
    ['negro', 'tinta', 0.150, 0.020, 265],
    ['negro', 'carbón', 0.250, 0.005, 60],
    ['negro', 'azabache', 0.120, 0.005, 0],
    ['negro', 'melanina', 0.280, 0.030, 60],
    ['negro', 'negro de pez', 0.060, 0.002, 0]
  ].map(function (f) {
    return { familia: f[0], nombre: f[1], L: f[2], C: f[3], H: f[4] };
  });

  const API = { NOMBRES };

  raiz.CLAVE = raiz.CLAVE || {};
  raiz.CLAVE.nombres = API;
  if (typeof module === 'object' && module.exports) module.exports = API;

})(typeof globalThis !== 'undefined' ? globalThis : this);
