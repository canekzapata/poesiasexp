# -*- coding: utf-8 -*-
"""
halo.py — poema-halo: anillos concéntricos de tiempo
poesiasexp / concretismopython

hálōs: la era de trilla, el círculo del trigo. el núcleo en el
centro y, alrededor, anillos que son épocas: primero la familia
española, después los antepasados latinos, al final el anillo
exterior con el griego y los paralelos náhuatl y maya — cuanto
más lejos del centro, más antigua la voz, más tenue la luz.
anomalía: un radio — la palabra recta que atraviesa los anillos
(radius: la vara de luz de la rueda).
"""

from __future__ import annotations

import math
import random

from motor import composicion as C, geometria as G, semantica as S
from .base import especie, elegir_nucleo, limpia, toque_esquizo

TIPO_HALO = {
    "orientacion": "circular",
    "densidad": "baja",
    "fragmentacion": "nula",
    "repeticion": "orbital",
    "movimiento": "giro",
    "profundidad": "tiempo hacia afuera",
}


@especie("halo", (900, 900), TIPO_HALO,
         "anillos concéntricos: cuanto más lejos del centro, más antigua la voz")
def componer(lex, rng: random.Random, semilla: int, nucleo: str | None = None,
             esquizo: float = 0.35) -> C.Composicion:
    nucleo = elegir_nucleo(lex, rng, nucleo, ("halo", "luz", "iris", "lucero"))
    comp = C.Composicion("halo", semilla, nucleo, esquizo, 900, 900)
    palabra_nucleo = lex.palabra(nucleo)
    cx, cy = comp.ancho / 2, comp.alto / 2

    # el centro: la palabra de hoy
    C.nodo(comp, nucleo, cx, cy, tamano=46, fuente="sans")

    def azulejar(voces: list[str], cuantas: int) -> list[str]:
        """repite las voces hasta cerrar el círculo: un anillo se lee girando."""
        if not voces:
            return []
        return [voces[k % len(voces)] for k in range(cuantas)]

    # anillo 1: la familia viva (y una deriva sonora para el oído)
    familia = lex.familia_de(nucleo)[:4]
    deriva = [f for f in lex.vecinas_sonoras(nucleo, maximo=2)
              if f not in familia][:2]
    anillo1 = familia + deriva
    for f in lex.vecinas_semanticas(nucleo):
        if len(anillo1) >= 5:
            break
        if f not in anillo1:
            anillo1.append(f)
    puestas = C.orbita(comp, azulejar(anillo1, 10), cx, cy, 152,
                       desfase=rng.uniform(0, 360), tamano=16,
                       fuente="sans", opacidad=0.85, capa="orbita",
                       animacion="giro")
    for p in puestas:
        if p.texto in deriva:
            p.transformacion = "deriva sonora"
    comp.anotar("transformación fonética: la deriva sonora gira en el primer anillo")

    # anillo 2: los antepasados latinos
    anillo2 = [limpia(e) for e in palabra_nucleo.etimologia[:2]]
    for f in anillo1[:4]:
        etim = lex.palabra(f).etimologia
        if etim:
            candidato = limpia(etim[0])
            if candidato and candidato not in anillo2:
                anillo2.append(candidato)
    anillo2 = [a for a in anillo2 if a][:5]
    if anillo2:
        C.orbita(comp, azulejar(anillo2, 14), cx, cy, 250,
                 desfase=rng.uniform(0, 360),
                 tamano=14, fuente="serif", opacidad=0.55, capa="orbita",
                 transformacion="etimología", animacion="giro")
    comp.anotar("transformación etimológica: los anillos son épocas")

    # anillo 3: el griego, el pie y las lenguas de esta tierra
    anillo3 = [limpia(e) for e in palabra_nucleo.etimologia[1:]]
    for lengua, paralelo in palabra_nucleo.paralelos.items():
        anillo3.append(limpia(paralelo))
    origen = S.origen_familia(lex, nucleo)
    if origen.get("origen"):
        anillo3.append(limpia(origen["origen"]))
    for f in anillo1[:3]:
        etim = lex.palabra(f).etimologia
        if len(etim) > 1:
            anillo3.append(limpia(etim[-1]))
    vistos = set(anillo2) | {nucleo}
    anillo3 = [a for a in dict.fromkeys(anillo3) if a and a not in vistos][:5]
    if anillo3:
        C.orbita(comp, azulejar(anillo3, 18), cx, cy, 348,
                 desfase=rng.uniform(0, 360),
                 tamano=12, fuente="serif", opacidad=0.36, capa="orbita",
                 transformacion="paralelo", animacion="giro")

    # anomalía: el radio que atraviesa los anillos
    def radio(comp, rng):
        vecinas = lex.vecinas_sonoras(nucleo, maximo=2)
        recta = rng.choice(sorted(vecinas)) if vecinas else "rayo"
        angulo = rng.uniform(0, 360)
        r = 245
        x = cx + r * math.cos(math.radians(angulo))
        y = cy + r * math.sin(math.radians(angulo))
        # el radio se estira para atravesar de verdad los tres anillos
        tamano = 18
        largo_deseado = 300.0
        n = max(2, len(recta))
        espaciado = round((largo_deseado / tamano - 0.62 * n) / (n - 1), 2)
        return comp.agregar(recta, x, y, base=recta, rotacion=round(angulo % 360, 1),
                            tamano=tamano, fuente="mono",
                            espaciado=max(0.6, espaciado),
                            transformacion="radio")
    C.imponer_anomalia(comp, rng, radio)
    comp.anotar("anomalía: un radio recto en un cielo circular")

    toque_esquizo(comp, lex, rng)
    C.aplicar_restricciones(comp, rng)
    C.rellenar_variantes(comp, lex, rng)
    return comp
