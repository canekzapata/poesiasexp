# -*- coding: utf-8 -*-
"""
ciclon.py — poema-ciclón: la espiral que devora la frase
poesiasexp / concretismopython

kýklos: círculo. una frase condensada (los parientes del núcleo
fundidos en una sola palabra larga) gira en espiral hacia adentro,
y el giro la va erosionando: en cada vuelta pierde letras, hasta
llegar hecha sílabas al borde del centro. en el centro exacto, el
ojo: el núcleo intacto, quieto, diminuto. anomalía: un fragmento
expulsado por la tangente.
"""

from __future__ import annotations

import math
import random

from motor import composicion as C, geometria as G, morfologia as M, semantica as S
from .base import especie, elegir_nucleo, toque_esquizo

TIPO_CICLON = {
    "orientacion": "espiral",
    "densidad": "creciente hacia el centro",
    "fragmentacion": "progresiva",
    "repeticion": "en vueltas",
    "movimiento": "giro",
}


@especie("ciclon", (900, 900), TIPO_CICLON,
         "espiral: el giro erosiona la frase; en el centro, el ojo intacto")
def componer(lex, rng: random.Random, semilla: int, nucleo: str | None = None,
             esquizo: float = 0.35) -> C.Composicion:
    nucleo = elegir_nucleo(lex, rng, nucleo,
                           ("ciclón", "huracán", "tormenta", "torbellino", "remolino"))
    comp = C.Composicion("ciclon", semilla, nucleo, esquizo, 900, 900)
    sequito = S.constelacion(lex, nucleo, 5, rng)
    cx, cy = comp.ancho / 2, comp.alto / 2

    # la frase condensada: los parientes fundidos en una palabra larga
    ingredientes = [nucleo] + sequito[:2]
    frase = M.condensar(ingredientes, modo="fusion")
    transmutada = S.transmutar(lex, ingredientes[:2])
    comp.anotar(f"frase condensada: {' + '.join(ingredientes)} = {frase}")
    comp.anotar(f"transformación etimológica: transmutación culta «{transmutada}»")

    # las fichas de la espiral: la frase se erosiona vuelta a vuelta
    etapas = M.erosionar(frase)
    fichas: list[tuple[str, str | None]] = []
    for palabra in sequito[:3]:
        fichas.append((palabra, None))
    fichas.append((frase, "portmanteau"))
    fichas.append((transmutada, "transmutación"))
    for etapa in etapas[1:]:
        fichas.append((etapa, "erosión"))
    while len(fichas) < 20:
        silabas = M.silabificar(nucleo)
        fichas.append((rng.choice(silabas), "erosión"))
    comp.anotar("transformación fonética: el giro erosiona la frase")

    puntos = G.espiral(cx, cy, len(fichas), 345, 64, vueltas=3.1,
                       desfase=rng.uniform(0, 360))
    for (texto, transformacion), (x, y, rot, frac) in zip(fichas, puntos):
        base = nucleo if transformacion in ("erosión", "portmanteau", "transmutación") else texto
        comp.agregar(texto, x, y, base=base, rotacion=rot,
                     tamano=round(25 - 13 * frac, 1),
                     opacidad=round(0.9 - 0.25 * frac, 2),
                     fuente="sans", capa="espiral",
                     transformacion=transformacion,
                     animacion="giro")

    # el ojo: el núcleo intacto, quieto
    C.nodo(comp, nucleo, cx, cy, tamano=15, fuente="serif", capa="nucleo")
    comp.anotar("en el centro exacto, el ojo: la palabra intacta")

    # anomalía: el fragmento expulsado por la tangente
    def expulsado(comp, rng):
        fragmento = M.cortar(frase, 2, rng)[0]
        angulo = rng.uniform(0, 360)
        r = 396
        x = cx + r * math.cos(math.radians(angulo))
        y = cy + r * math.sin(math.radians(angulo))
        rot = (angulo + 90) % 360
        if 90 < rot < 270:
            rot += 180
        return comp.agregar(fragmento, x, y, base=nucleo,
                            rotacion=round(rot % 360, 1), tamano=19,
                            fuente="mono", transformacion="expulsión",
                            animacion="deriva")
    C.imponer_anomalia(comp, rng, expulsado)
    comp.anotar("anomalía: lo que el giro expulsa")

    toque_esquizo(comp, lex, rng)
    C.aplicar_restricciones(comp, rng)
    C.rellenar_variantes(comp, lex, rng)
    return comp
