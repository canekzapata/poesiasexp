# -*- coding: utf-8 -*-
"""
estrato.py — poema-estrato: estratigrafía etimológica
poesiasexp / concretismopython

stratus, de sternere: tender. líneas horizontales como capas
geológicas, y la profundidad es tiempo: arriba el español de hoy,
expandido y tenue como aire; abajo el latín y el griego, cada vez
más densos, hasta el sedimento vocálico. leer de arriba a abajo
es excavar. anomalía: un sondeo — una palabra vertical que
perfora todas las capas.
"""

from __future__ import annotations

import random

from motor import composicion as C, geometria as G, morfologia as M, semantica as S
from .base import especie, elegir_nucleo, limpia, toque_esquizo

TIPO_ESTRATO = {
    "orientacion": "horizontal",
    "densidad": "media",
    "fragmentacion": "baja",
    "repeticion": "espaciada",
    "movimiento": "inmóvil",
    "profundidad": "tiempo",
}


@especie("estrato", (1000, 700), TIPO_ESTRATO,
         "líneas horizontales: la profundidad es tiempo; leer hacia abajo es excavar")
def componer(lex, rng: random.Random, semilla: int, nucleo: str | None = None,
             esquizo: float = 0.35) -> C.Composicion:
    nucleo = elegir_nucleo(lex, rng, nucleo, ("estrato", "niebla", "bruma", "horizonte"))
    comp = C.Composicion("estrato", semilla, nucleo, esquizo, 1000, 700)
    palabra_nucleo = lex.palabra(nucleo)
    familia = lex.familia_de(nucleo)
    rng.shuffle(familia)

    # las capas, del aire al sedimento
    estratos: list[tuple[str, str, float, float, str | None]] = []
    #          (texto, fuente, tamano, opacidad, transformacion)
    expandida = M.expandir(nucleo, 3)[-1]
    estratos.append((expandida, "sans", 15, 0.5, "expansión"))
    estratos.append((nucleo, "sans", 21, 0.7, None))
    for pariente in familia[:2]:
        estratos.append((pariente, "mono", 18, 0.8, None))
    if len(estratos) < 4:
        # sin familia, una vecina de campo hace de capa intermedia
        vecinas = lex.vecinas_semanticas(nucleo)
        if vecinas:
            estratos.append((vecinas[0], "mono", 18, 0.8, None))
    for etim in palabra_nucleo.etimologia[:2]:
        estratos.append((limpia(etim), "serif", 23, 0.88, "etimología"))
    paralelos = list(palabra_nucleo.paralelos.values())
    if paralelos:
        estratos.append((limpia(paralelos[0]), "serif", 25, 0.95, "paralelo"))
    # cada capa una sola vez: la tierra no se repite, se hunde
    vistos: set[str] = set()
    estratos = [e for e in estratos
                if not (e[0] in vistos or vistos.add(e[0]))]
    comp.anotar("transformación etimológica: la profundidad es tiempo")
    comp.anotar("transformación fonética: la capa de arriba se expande como aire")

    alturas = G.bandas(len(estratos), 130, comp.alto - 110)
    for k, ((texto, fuente, tamano, opacidad, transformacion), y) in enumerate(
            zip(estratos, alturas)):
        capa_nombre = "nucleo" if k == 1 else "banda"
        C.capa(comp, texto, y, base=nucleo if transformacion in ("expansión", "etimología", "paralelo") or texto == nucleo else texto,
               tamano=tamano, espaciado=round(1.5 - 0.18 * k, 2),
               repetir_hasta=comp.ancho * (0.42 + 0.09 * k),
               fuente=fuente, opacidad=opacidad, capa=capa_nombre,
               transformacion=transformacion)
        # entre capa y capa, el sedimento vocálico
        if k < len(estratos) - 1:
            vocales = M.esqueleto_vocalico(texto.replace(" ", ""))
            if vocales:
                y_sed = y + (alturas[k + 1] - y) / 2
                comp.agregar(vocales, comp.ancho / 2, y_sed, base=nucleo,
                             tamano=10, opacidad=0.3, fuente="mono",
                             espaciado=3.2, capa="sedimento",
                             transformacion="sedimento vocálico")

    # anomalía: el sondeo que perfora las capas
    def sondeo(comp, rng):
        vecinas = lex.vecinas_sonoras(nucleo, maximo=2)
        broca = rng.choice(sorted(vecinas)) if vecinas else nucleo
        x = comp.ancho * rng.uniform(0.2, 0.8)
        # la broca se estira hasta atravesar todas las capas
        tamano = 19
        largo_deseado = comp.alto * 0.62
        n = max(2, len(broca))
        espaciado = round((largo_deseado / tamano - 0.62 * n) / (n - 1), 2)
        return comp.agregar(broca, x, comp.alto / 2, base=broca,
                            rotacion=90, tamano=tamano, fuente="mono",
                            espaciado=max(0.8, espaciado),
                            transformacion="sondeo")
    C.imponer_anomalia(comp, rng, sondeo)
    comp.anotar("anomalía: un sondeo perfora todas las capas")

    toque_esquizo(comp, lex, rng)
    C.aplicar_restricciones(comp, rng)
    C.rellenar_variantes(comp, lex, rng)
    return comp
