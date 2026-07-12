# -*- coding: utf-8 -*-
"""
semantica.py — la memoria profunda: familias, órbitas, transmutaciones
poesiasexp / concretismopython

una palabra no está sola: tiene familia (raíz compartida), órbita
(etimología + parientes + paralelos + falsos parientes), raíz culta
(su doble griego o latino) y la posibilidad de transmutarse.
"""

from __future__ import annotations

import random

from . import morfologia
from .lexico import Lexico


def cadena_etimologica(lexico: Lexico, forma: str) -> list[str]:
    """la palabra seguida de sus antepasados: nube, nūbēs, nebula, nephélē."""
    p = lexico.palabra(forma)
    return [p.forma] + list(p.etimologia)


def origen_familia(lexico: Lexico, forma: str) -> dict:
    p = lexico.palabra(forma)
    familias = lexico.etimologias.get("familias", {})
    return familias.get(p.familia, {})


def falsos_parientes(lexico: Lexico, forma: str) -> list[tuple[str, str]]:
    """las palabras que parecen familia y no lo son (o quizá sí: hipótesis hermosas)."""
    pares = []
    for a, b, nota in lexico.etimologias.get("falsos_parientes", []):
        if a == forma:
            pares.append((b, nota))
        elif b == forma:
            pares.append((a, nota))
    return pares


def cultas_inversas(lexico: Lexico) -> dict[str, str]:
    """concepto -> raíz culta preferida (la primera declarada gana):
    agua -> hidro, nube -> nefo, tiempo -> crono."""
    inversa: dict[str, str] = {}
    for culta, concepto in lexico.etimologias.get("cultas", {}).items():
        inversa.setdefault(concepto, culta)
    return inversa


def transmutar(lexico: Lexico, formas: list[str]) -> str:
    """condensación etimológica: aire, agua, tiempo -> aerohidrocrono."""
    return morfologia.condensar(formas, modo="transmutacion",
                                cultas=cultas_inversas(lexico))


def portmanteau_culto(lexico: Lexico, a: str, b: str) -> str:
    """la raíz culta de a soldada a b: color + nimbo -> cromonimbo,
    agua + fonema -> hidrofonema, aire + lengua -> aerolengua."""
    inversa = cultas_inversas(lexico)
    cabeza = inversa.get(a.lower(), None)
    if cabeza is None:
        p = lexico.palabra(a)
        cabeza = p.raiz_culta[0] if p.raiz_culta else None
    if cabeza is None:
        return morfologia.fusionar(a, b)
    return cabeza + b


def orbita(lexico: Lexico, forma: str) -> dict:
    """todo lo que gravita alrededor de una palabra. el corazón esquizo:
    familia real, cadena de antepasados, dobles cultos, paralelos
    en otras lenguas de esta tierra, falsos parientes, vecinas de sonido."""
    p = lexico.palabra(forma)
    return {
        "forma": p.forma,
        "silabas": p.silabas,
        "sonidos": p.sonidos,
        "raiz": p.raiz,
        "cadena": cadena_etimologica(lexico, forma),
        "familia": lexico.familia_de(forma),
        "origen": origen_familia(lexico, forma),
        "cultas": p.raiz_culta,
        "paralelos": p.paralelos,
        "falsos_parientes": falsos_parientes(lexico, forma),
        "campo": p.campo,
        "vecinas_semanticas": lexico.vecinas_semanticas(forma)[:8],
        "vecinas_sonoras": lexico.vecinas_sonoras(forma)[:8],
        "movimiento": p.movimiento,
        "densidad": p.densidad,
        "peso_visual": p.peso_visual,
        "nota": p.nota,
    }


def constelacion(lexico: Lexico, nucleo: str, cuantas: int = 11,
                 rng: random.Random | None = None) -> list[str]:
    """elige el séquito de un núcleo: primero la sangre (familia),
    luego el campo (vecinas semánticas), al final el oído (deriva sonora).
    devuelve a lo sumo `cuantas` formas, sin el núcleo."""
    rng = rng or random.Random()
    elegidas: list[str] = []

    familia = lexico.familia_de(nucleo)
    rng.shuffle(familia)
    elegidas.extend(familia[: max(2, cuantas // 3)])

    for f in lexico.vecinas_semanticas(nucleo):
        if len(elegidas) >= cuantas * 2 // 3:
            break
        if f not in elegidas:
            elegidas.append(f)

    for f in lexico.vecinas_sonoras(nucleo, maximo=2):
        if len(elegidas) >= cuantas:
            break
        if f not in elegidas:
            elegidas.append(f)

    # si aún falta gente, se convoca al campo entero
    if len(elegidas) < cuantas:
        p = lexico.palabra(nucleo)
        for c in p.campo:
            for f in lexico.por_campo(c):
                if len(elegidas) >= cuantas:
                    break
                if f != nucleo and f not in elegidas and not lexico.palabra(f).puente:
                    elegidas.append(f)

    return elegidas[:cuantas]


def variantes_de(lexico: Lexico, forma: str, profundidad: int = 2,
                 rng: random.Random | None = None) -> list[str]:
    """las mutaciones posibles de una palabra colocada: por donde puede
    derivar cuando el poema esté vivo en el navegador. mezcla familia,
    antepasados, paralelos y deriva sonora."""
    rng = rng or random.Random()
    p = lexico.palabra(forma)
    variantes: list[str] = []

    def agregar(v: str):
        v = v.strip()
        if v and v != forma and v not in variantes:
            variantes.append(v)

    for f in lexico.familia_de(forma)[:4]:
        agregar(f)
    for antepasado in p.etimologia[:profundidad]:
        agregar(antepasado.split("(")[0].split(":")[0].strip())
    for lengua, par in list(p.paralelos.items())[:2]:
        agregar(par.split("(")[0].strip())
    for f in lexico.vecinas_sonoras(forma, maximo=2)[:4]:
        agregar(f)
    for culta in p.raiz_culta[:1]:
        agregar(culta + "-")
    rng.shuffle(variantes)
    return variantes[:7]
