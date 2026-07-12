# -*- coding: utf-8 -*-
"""
cumulo.py — poema-cúmulo: agregación radial
poesiasexp / concretismopython

cumulus: montón. las palabras se apilan alrededor del núcleo en
filotaxis de girasol; el montón se deshilacha en los bordes
(erosión: la nube pierde letras donde toca el cielo). detrás del
núcleo, su antepasado latino sostiene el montón como marca de agua.
anomalía: un desprendimiento — una palabra arrancada hacia la esquina.
"""

from __future__ import annotations

import random

from motor import composicion as C, geometria as G, morfologia as M, semantica as S
from .base import especie, elegir_nucleo, limpia, toque_esquizo

TIPO_CUMULO = {
    "orientacion": "radial",
    "densidad": "alta",
    "fragmentacion": "media",
    "repeticion": "compacta",
    "movimiento": "ascendente",
    "trazo": "grueso",
}


@especie("cumulo", (900, 900), TIPO_CUMULO,
         "agregación radial: el montón de palabras se deshilacha en los bordes")
def componer(lex, rng: random.Random, semilla: int, nucleo: str | None = None,
             esquizo: float = 0.35) -> C.Composicion:
    nucleo = elegir_nucleo(lex, rng, nucleo, ("nube", "cúmulo", "vapor", "cumulonimbo"))
    comp = C.Composicion("cumulo", semilla, nucleo, esquizo, 900, 900)
    palabra_nucleo = lex.palabra(nucleo)
    sequito = S.constelacion(lex, nucleo, 8, rng)
    cx, cy = comp.ancho / 2, comp.alto / 2

    # el antepasado como marca de agua: sostiene el montón desde atrás
    if palabra_nucleo.etimologia:
        ancestro = limpia(palabra_nucleo.etimologia[-1])
        comp.agregar(ancestro, cx, cy + 10, base=nucleo, tamano=110,
                     opacidad=0.09, fuente="serif", capa="eco",
                     transformacion="etimología")
        comp.anotar(f"transformación etimológica: «{ancestro}» sostiene el montón")

    # el núcleo, en el corazón del girasol
    C.nodo(comp, nucleo, cx, cy, tamano=58, fuente="sans",
           animacion="ascenso")

    # el montón: cada palabra del séquito repetida de manera compacta
    fichas: list[str] = []
    for f in sequito:
        fichas.extend([f] * rng.choice((3, 4)))
    rng.shuffle(fichas)
    puntos = G.filotaxis(len(fichas), cx, cy, paso=46.0,
                         desfase=rng.uniform(0, 360))
    for f, (x, y, frac) in zip(fichas, puntos):
        texto = f
        transformacion = None
        opacidad = round(0.95 - 0.45 * frac, 2)
        if frac > 0.72:
            # el borde se deshilacha: erosión fonética
            etapas = M.erosionar(f)
            texto = etapas[min(len(etapas) - 1, rng.choice((1, 2, 2)))]
            transformacion = "erosión"
            opacidad = round(opacidad * 0.85, 2)
        movimiento = lex.palabra(f).movimiento
        comp.agregar(texto, x, y, base=f,
                     tamano=round(30 - 17 * frac, 1),
                     opacidad=opacidad, fuente="sans", capa="campo",
                     transformacion=transformacion,
                     animacion="ascenso" if movimiento == "ascendente" else None)
    comp.anotar("transformación fonética: erosión en el borde del montón")

    # anomalía: el desprendimiento
    def desprendimiento(comp, rng):
        arrancada = rng.choice(sorted(sequito)) if sequito else nucleo
        esquina_x = rng.choice((comp.ancho * 0.12, comp.ancho * 0.88))
        esquina_y = rng.choice((comp.alto * 0.10, comp.alto * 0.90))
        return comp.agregar(arrancada, esquina_x, esquina_y, base=arrancada,
                            rotacion=rng.choice((-90, 90, 24)),
                            tamano=21, fuente="sans",
                            transformacion="desprendimiento")
    C.imponer_anomalia(comp, rng, desprendimiento)
    comp.anotar("anomalía: un desprendimiento se aleja del montón")

    toque_esquizo(comp, lex, rng)
    C.aplicar_restricciones(comp, rng)
    C.rellenar_variantes(comp, lex, rng)
    return comp
