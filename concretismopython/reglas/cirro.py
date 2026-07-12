# -*- coding: utf-8 -*-
"""
cirro.py — poema-cirro: fibras finas y dispersas
poesiasexp / concretismopython

cirrus: rizo, mechón de pelo. las palabras se adelgazan hasta su
esqueleto consonántico (nube -> n b) y se tienden en fibras oblicuas,
con mucho aire entre ellas. una fibra es una deriva sonora completa.
anomalía: un nudo — dos palabras fundidas en un portmanteau denso,
lo único vertical y compacto del cielo.
"""

from __future__ import annotations

import random

from motor import composicion as C, geometria as G, morfologia as M, semantica as S
from .base import especie, elegir_nucleo, limpia, toque_esquizo

TIPO_CIRRO = {
    "orientacion": "horizontal",
    "densidad": "baja",
    "fragmentacion": "alta",
    "trazo": "fino",
    "repeticion": "espaciada",
    "movimiento": "oblicuo",
}

ANGULO = -14.0


@especie("cirro", (1200, 640), TIPO_CIRRO,
         "fibras finas y dispersas: esqueletos consonánticos en líneas oblicuas")
def componer(lex, rng: random.Random, semilla: int, nucleo: str | None = None,
             esquizo: float = 0.35) -> C.Composicion:
    nucleo = elegir_nucleo(lex, rng, nucleo, ("cirro", "viento", "brisa", "jirón"))
    comp = C.Composicion("cirro", semilla, nucleo, esquizo, 1200, 640)
    palabra_nucleo = lex.palabra(nucleo)
    sequito = S.constelacion(lex, nucleo, 5, rng)

    # el núcleo, intacto pero inclinado con el viento
    C.nodo(comp, nucleo, comp.ancho * 0.16, comp.alto * 0.18,
           tamano=26, fuente="mono", capa="nucleo")
    comp.palabras[-1].rotacion = ANGULO

    # las fibras: esqueletos consonánticos con mucho espaciado
    puntos = G.fibras(11, comp.ancho, comp.alto, ANGULO, rng, margen=70)
    for k, (x, y, angulo) in enumerate(puntos):
        f = sequito[k % len(sequito)] if sequito else nucleo
        if rng.random() < 0.66:
            texto = M.esqueleto_consonantico(f)
            transformacion = "esqueleto"
        else:
            texto = M.expandir(f, 2)[-1]
            transformacion = "expansión"
        if not texto.strip():
            texto = f
            transformacion = None
        comp.agregar(texto, x, y, base=f, rotacion=angulo,
                     tamano=rng.choice((10, 11, 12, 13)),
                     opacidad=round(rng.uniform(0.4, 0.8), 2),
                     fuente="mono", espaciado=round(rng.uniform(1.2, 2.4), 2),
                     capa="fibra", transformacion=transformacion,
                     animacion="deriva")
    comp.anotar("transformación fonética: las palabras adelgazadas a su esqueleto")

    # una fibra entera es una deriva sonora: el núcleo alejándose de sí
    cadena = lex.deriva_sonora(nucleo, pasos=5, rng=rng)
    y_deriva = comp.alto * rng.uniform(0.55, 0.75)
    for k, eslabon in enumerate(cadena):
        t = (k + 0.5) / len(cadena)
        x = comp.ancho * (0.10 + 0.80 * t)
        comp.agregar(eslabon, x, y_deriva + (x - comp.ancho / 2) * -0.06,
                     base=eslabon, rotacion=ANGULO, tamano=14,
                     opacidad=round(1.0 - 0.09 * k, 2), fuente="mono",
                     espaciado=0.5, capa="deriva",
                     transformacion="deriva sonora")
    comp.anotar(f"deriva sonora: {' → '.join(cadena)}")

    # el antepasado, también hecho fibra
    if palabra_nucleo.etimologia:
        ancestro = limpia(palabra_nucleo.etimologia[0])
        comp.agregar(M.esqueleto_consonantico(ancestro) or ancestro,
                     comp.ancho * 0.72, comp.alto * 0.22, base=nucleo,
                     rotacion=ANGULO, tamano=12, opacidad=0.35,
                     fuente="serif", espaciado=1.8, capa="eco",
                     transformacion="etimología")
        comp.anotar(f"transformación etimológica: «{ancestro}» reducido a fibra")

    # anomalía: el nudo — lo único denso y derecho del cielo
    def nudo(comp, rng):
        pareja = sorted(sequito)[:2] if len(sequito) >= 2 else [nucleo, "viento"]
        fundida = M.fusionar(pareja[0], pareja[1])
        return comp.agregar(fundida, comp.ancho * 0.618, comp.alto * 0.38,
                            base=pareja[0], rotacion=0, tamano=30,
                            fuente="sans", espaciado=0.0,
                            transformacion="portmanteau")
    C.imponer_anomalia(comp, rng, nudo)
    comp.anotar("anomalía: un nudo denso en el cielo ralo")

    toque_esquizo(comp, lex, rng)
    C.aplicar_restricciones(comp, rng)
    C.rellenar_variantes(comp, lex, rng)
    return comp
