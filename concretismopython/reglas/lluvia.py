# -*- coding: utf-8 -*-
"""
lluvia.py — poema-lluvia: caída tipográfica
poesiasexp / concretismopython

arriba, la nube: el núcleo y sus parientes fundidos en una masa
densa (condensación = aumento de densidad). de ella se sueltan
las letras: cada columna es una palabra evaporándose mientras cae,
perdiendo opacidad (pérdida gradual de letras). abajo, el charco:
el núcleo invertido, de cabeza — praeceps: la lluvia cae de cabeza,
y el charco la lee al revés. anomalía: una gota que sube.
"""

from __future__ import annotations

import random

from motor import composicion as C, geometria as G, morfologia as M, semantica as S
from .base import especie, elegir_nucleo, limpia, toque_esquizo

TIPO_LLUVIA = {
    "orientacion": "vertical",
    "densidad": "alta arriba, nula abajo",
    "fragmentacion": "total",
    "repeticion": "columnar",
    "movimiento": "descendente",
}


@especie("lluvia", (700, 1000), TIPO_LLUVIA,
         "caída tipográfica: la nube se condensa arriba y las letras llueven")
def componer(lex, rng: random.Random, semilla: int, nucleo: str | None = None,
             esquizo: float = 0.35) -> C.Composicion:
    nucleo = elegir_nucleo(lex, rng, nucleo, ("lluvia", "llovizna", "aguacero", "chubasco"))
    comp = C.Composicion("lluvia", semilla, nucleo, esquizo, 700, 1000)
    palabra_nucleo = lex.palabra(nucleo)
    sequito = S.constelacion(lex, nucleo, 6, rng)
    cx = comp.ancho / 2

    # la nube: el núcleo y las fusiones apretadas (condensación)
    C.nodo(comp, nucleo, cx, 96, tamano=44, fuente="sans", capa="nucleo")
    masa = []
    if palabra_nucleo.etimologia:
        masa.append(limpia(palabra_nucleo.etimologia[0]))
    if len(sequito) >= 2:
        masa.append(M.fusionar(sequito[0], sequito[1]))
    if len(sequito) >= 4:
        masa.append(M.fusionar(sequito[2], sequito[3]))
    for k, trozo in enumerate(masa):
        comp.agregar(trozo, cx + rng.uniform(-70, 70), 132 + 26 * k,
                     base=nucleo if k == 0 else sequito[min(k * 2 - 2, len(sequito) - 1)] if sequito else nucleo,
                     tamano=21, opacidad=round(0.75 - 0.12 * k, 2),
                     fuente="sans", espaciado=-0.02,
                     capa="campo",
                     transformacion="etimología" if k == 0 else "portmanteau")
    comp.anotar("transformación etimológica: el antepasado dentro de la nube")

    # la lluvia: columnas de letras que se evaporan al caer
    palabras_lluvia = ([nucleo] + sequito)[:7]
    xs = G.columnas(len(palabras_lluvia) + 2, 70, comp.ancho - 70, rng)
    rng.shuffle(xs)
    for k, palabra in enumerate(palabras_lluvia):
        x = xs[k]
        y0 = 210 + rng.uniform(0, 60)
        y1 = rng.uniform(comp.alto * 0.62, comp.alto * 0.86)
        C.caida(comp, palabra, x, y0, y1, base=palabra,
                tamano=rng.choice((13, 14, 15)), fuente="mono",
                capa="lluvia", animacion="caida", rng=rng)
    comp.anotar("transformación fonética: cada columna pierde su palabra al caer")

    # el charco: el núcleo de cabeza, apenas visible
    superficie = comp.alto - 96
    vocales = M.esqueleto_vocalico(nucleo)
    if vocales:
        comp.agregar(vocales, cx, superficie - 42, base=nucleo, tamano=11,
                     opacidad=0.28, fuente="mono", espaciado=3.4,
                     capa="charco", transformacion="sedimento vocálico")
    comp.agregar(nucleo, cx, superficie, base=nucleo, rotacion=180,
                 tamano=30, opacidad=0.18, fuente="sans", capa="charco",
                 transformacion="reflejo")
    comp.anotar("el charco lee la palabra al revés (praeceps: caer de cabeza)")

    # anomalía: una gota vuelve a subir
    def gota_que_sube(comp, rng):
        letra = rng.choice([c for c in nucleo if c.strip()])
        x = rng.uniform(comp.ancho * 0.16, comp.ancho * 0.84)
        y = rng.uniform(comp.alto * 0.60, comp.alto * 0.78)
        return comp.agregar(letra, x, y, base=nucleo, rotacion=180,
                            tamano=19, fuente="mono",
                            transformacion="evaporación",
                            animacion="ascenso")
    C.imponer_anomalia(comp, rng, gota_que_sube)
    comp.anotar("anomalía: una gota sube mientras todo cae")

    toque_esquizo(comp, lex, rng)
    C.aplicar_restricciones(comp, rng)
    C.rellenar_variantes(comp, lex, rng)
    return comp
