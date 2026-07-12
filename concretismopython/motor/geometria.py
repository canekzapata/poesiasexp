# -*- coding: utf-8 -*-
"""
geometria.py — la página como espacio físico
poesiasexp / concretismopython

generadores de posición: filotaxis radial (cúmulo), órbitas (halo),
espiral (ciclón), fibras oblicuas (cirro), bandas (estrato), columnas
de caída (lluvia). la geometría no es decorativa: es isomórfica
con el fenómeno.

ángulos en grados (como los quiere el svg). origen arriba-izquierda,
y crece hacia abajo.
"""

from __future__ import annotations

import math
import random

ANGULO_AUREO = 137.50776405003785

# ancho medio de un carácter, en em, por familia tipográfica
ANCHO_CARACTER = {"mono": 0.62, "sans": 0.55, "serif": 0.52}


def ancho_texto(texto: str, tamano: float, fuente: str = "mono",
                espaciado: float = 0.0) -> float:
    """estimación del ancho en px: caracteres + espaciado extra (en em)."""
    n = max(1, len(texto))
    factor = ANCHO_CARACTER.get(fuente, 0.58)
    return n * factor * tamano + max(0, n - 1) * espaciado * tamano


def area_texto(texto: str, tamano: float, fuente: str = "mono",
               espaciado: float = 0.0) -> float:
    return ancho_texto(texto, tamano, fuente, espaciado) * tamano


# ------------------------------------------------------------- generadores

def filotaxis(n: int, cx: float, cy: float, paso: float = 14.0,
              desfase: float = 0.0) -> list[tuple[float, float, float]]:
    """agregación radial de girasol: n puntos alrededor del centro.
    devuelve (x, y, fraccion_del_radio) con fraccion en [0, 1]."""
    puntos = []
    radio_max = paso * math.sqrt(max(1, n))
    for k in range(n):
        angulo = math.radians(k * ANGULO_AUREO + desfase)
        radio = paso * math.sqrt(k + 0.6)
        x = cx + radio * math.cos(angulo)
        y = cy + radio * math.sin(angulo)
        puntos.append((x, y, radio / radio_max if radio_max else 0.0))
    return puntos


def orbita(cx: float, cy: float, radio: float, n: int,
           desfase: float = 0.0, tangente: bool = True
           ) -> list[tuple[float, float, float]]:
    """n posiciones sobre un círculo; la rotación deja la palabra
    tangente al anillo (legible a lo largo del giro)."""
    puntos = []
    for k in range(n):
        angulo = 2 * math.pi * k / max(1, n) + math.radians(desfase)
        x = cx + radio * math.cos(angulo)
        y = cy + radio * math.sin(angulo)
        rot = math.degrees(angulo) + (90.0 if tangente else 0.0)
        # que ninguna palabra quede de cabeza: se voltea en el hemisferio sur
        if tangente and 90 < rot % 360 < 270:
            rot += 180
        puntos.append((x, y, rot))
    return puntos


def espiral(cx: float, cy: float, n: int, radio_inicial: float,
            radio_final: float, vueltas: float = 3.0,
            desfase: float = 0.0) -> list[tuple[float, float, float, float]]:
    """espiral de arquímedes, de afuera hacia adentro.
    devuelve (x, y, rotacion_tangente, fraccion) con fraccion 0=afuera 1=centro."""
    puntos = []
    for k in range(n):
        t = k / max(1, n - 1)
        radio = radio_inicial + (radio_final - radio_inicial) * t
        angulo = 2 * math.pi * vueltas * t + math.radians(desfase)
        x = cx + radio * math.cos(angulo)
        y = cy + radio * math.sin(angulo)
        rot = math.degrees(angulo) + 90.0
        if 90 < rot % 360 < 270:
            rot += 180
        puntos.append((x, y, rot % 360, t))
    return puntos


def fibras(n: int, ancho: float, alto: float, angulo: float,
           rng: random.Random, margen: float = 60.0
           ) -> list[tuple[float, float, float]]:
    """cirro: puntos dispersos a lo largo de líneas paralelas oblicuas.
    devuelve (x, y, angulo). pocas fibras, mucho aire."""
    puntos = []
    n_lineas = max(2, round(math.sqrt(n)) + 1)
    for _ in range(n):
        linea = rng.randrange(n_lineas)
        y_base = margen + (alto - 2 * margen) * (linea + 0.5) / n_lineas
        t = rng.uniform(0.05, 0.95)
        x = margen + (ancho - 2 * margen) * t
        deriva = math.tan(math.radians(angulo)) * (x - ancho / 2)
        y = y_base + deriva * 0.18 + rng.uniform(-alto * 0.02, alto * 0.02)
        puntos.append((x, min(alto - margen, max(margen, y)), angulo))
    return puntos


def bandas(n: int, y0: float, y1: float) -> list[float]:
    """estrato: n alturas equidistantes entre y0 y y1."""
    if n <= 1:
        return [(y0 + y1) / 2]
    return [y0 + (y1 - y0) * k / (n - 1) for k in range(n)]


def columnas(n: int, x0: float, x1: float, rng: random.Random,
             temblor: float = 0.35) -> list[float]:
    """lluvia: n abscisas casi equidistantes, con temblor."""
    xs = []
    for k in range(n):
        base = x0 + (x1 - x0) * (k + 0.5) / n
        ancho_celda = (x1 - x0) / n
        xs.append(base + rng.uniform(-temblor, temblor) * ancho_celda)
    return xs


def dispersion(n: int, cx: float, cy: float, sigma_x: float, sigma_y: float,
               rng: random.Random) -> list[tuple[float, float]]:
    """nube gaussiana de posiciones alrededor de un centro."""
    return [(rng.gauss(cx, sigma_x), rng.gauss(cy, sigma_y)) for _ in range(n)]


def acotar(x: float, y: float, ancho: float, alto: float,
           margen: float = 24.0) -> tuple[float, float]:
    """que nada se salga de la página (por poco)."""
    return (min(ancho - margen, max(margen, x)),
            min(alto - margen, max(margen, y)))
