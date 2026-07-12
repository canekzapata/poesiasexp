# -*- coding: utf-8 -*-
"""
fonetica.py — el oído del sistema
poesiasexp / concretismopython

normalizar    : reduce la palabra a su esqueleto sonoro (b=v, seseo, h muda)
distancia     : distancia de edición entre dos sonidos
deriva_sonora : nube -> sube -> tuve -> uve ... la cadena que se aleja
aliteracion   : cuánto insiste un sonido inicial en un grupo
glosolalia    : palabras que no existen pero podrían (sílabas del corpus)
"""

from __future__ import annotations

import random
import unicodedata

from . import morfologia


def _sin_tildes(texto: str) -> str:
    plano = unicodedata.normalize("NFD", texto)
    return "".join(c for c in plano if unicodedata.category(c) != "Mn" or c == "̃")
    # conserva la virgulilla: la ñ no es una n con polvo encima


def normalizar(palabra: str) -> str:
    """esqueleto sonoro aproximado (español americano):
    b=v, c/qu/k=k, ce ci z=s (seseo), ge gi j=x, ll=y, h muda, rr=r."""
    p = unicodedata.normalize("NFC", palabra.lower().strip())
    p = _sin_tildes(p)
    salida = []
    i = 0
    n = len(p)
    while i < n:
        dos = p[i:i + 2]
        c = p[i]
        sig = p[i + 1] if i + 1 < n else ""
        if dos == "ch":
            salida.append("ĉ"); i += 2; continue
        if dos == "ll":
            salida.append("y"); i += 2; continue
        if dos == "rr":
            salida.append("r"); i += 2; continue
        if dos == "qu":
            salida.append("k"); i += 2; continue
        if c == "g" and sig == "u" and i + 2 < n and p[i + 2] in "ei":
            salida.append("g"); i += 2; continue            # guerra -> gera
        if c == "g" and sig in "ei":
            salida.append("x"); i += 1; continue            # gente -> xente
        if c == "c":
            salida.append("s" if sig in "ei" else "k"); i += 1; continue
        if c == "z":
            salida.append("s"); i += 1; continue
        if c == "v":
            salida.append("b"); i += 1; continue
        if c == "j":
            salida.append("x"); i += 1; continue
        if c == "h":
            i += 1; continue                                # la h no suena, pero separa
        if c == "ü":
            salida.append("u"); i += 1; continue
        if c == "w":
            salida.append("u"); i += 1; continue
        if c == "y":
            es_final = i == n - 1
            salida.append("i" if es_final else "y"); i += 1; continue
        if c == "x":
            salida.append("ks"); i += 1; continue
        if c.isalpha() or c == "ñ":
            salida.append(c); i += 1; continue
        i += 1
    return "".join(salida)


def distancia(a: str, b: str) -> int:
    """distancia de levenshtein sobre las formas normalizadas."""
    fa, fb = normalizar(a), normalizar(b)
    if fa == fb:
        return 0
    m, n = len(fa), len(fb)
    fila = list(range(n + 1))
    for i in range(1, m + 1):
        nueva = [i]
        for j in range(1, n + 1):
            costo = 0 if fa[i - 1] == fb[j - 1] else 1
            nueva.append(min(fila[j] + 1, nueva[j - 1] + 1, fila[j - 1] + costo))
        fila = nueva
    return fila[n]


def sonidos(palabra: str) -> list[str]:
    """la palabra como lista de sonidos: nube -> ['n','u','b','e']"""
    return list(normalizar(palabra))


def vecinas(palabra: str, formas: list[str], maximo: int = 2) -> list[str]:
    """palabras del acervo a distancia sonora <= maximo, de la más cercana a la más lejana."""
    pares = []
    for f in formas:
        if f == palabra:
            continue
        d = distancia(palabra, f)
        if 0 < d <= maximo:
            pares.append((d, f))
    pares.sort()
    return [f for _, f in pares]


def deriva_sonora(inicio: str, formas: list[str], pasos: int = 4,
                  rng: random.Random | None = None) -> list[str]:
    """cadena de deriva: cada eslabón está a poca distancia sonora del anterior
    y se prohíbe volver. nube -> sube -> tuve -> uve ...
    la cadena prefiere alejarse: entre las vecinas, favorece a las que ya no
    se parecen al origen."""
    rng = rng or random.Random()
    cadena = [inicio]
    usadas = {inicio}
    actual = inicio
    for _ in range(pasos):
        candidatas = [f for f in vecinas(actual, formas, maximo=2) if f not in usadas]
        if not candidatas:
            candidatas = [f for f in vecinas(actual, formas, maximo=3) if f not in usadas]
        if not candidatas:
            break
        # las más cercanas al eslabón actual, pero lejanas del origen
        candidatas.sort(key=lambda f: (distancia(actual, f), -distancia(inicio, f)))
        corte = max(1, len(candidatas) // 2)
        elegida = rng.choice(candidatas[:corte])
        cadena.append(elegida)
        usadas.add(elegida)
        actual = elegida
    return cadena


def aliteracion(palabras: list[str]) -> float:
    """proporción del ataque inicial más repetido: 1.0 = todas empiezan igual."""
    if not palabras:
        return 0.0
    ataques = {}
    for p in palabras:
        forma = normalizar(p)
        if not forma:
            continue
        ataques[forma[0]] = ataques.get(forma[0], 0) + 1
    if not ataques:
        return 0.0
    return max(ataques.values()) / len(palabras)


def glosolalia(silabarios: list[list[str]], rng: random.Random | None = None,
               n_silabas: int = 3, prohibidas: set[str] | None = None) -> str:
    """inventa una palabra posible: junta sílabas reales del corpus.
    lo que sale no existe, pero suena a español. el idioma soñando consigo mismo."""
    rng = rng or random.Random()
    prohibidas = prohibidas or set()
    todas = [s for sils in silabarios for s in sils if s.isalpha()]
    if not todas:
        return ""
    for _ in range(24):
        palabra = "".join(rng.choice(todas) for _ in range(n_silabas))
        if palabra not in prohibidas and len(palabra) <= 14:
            return palabra
    return "".join(rng.choice(todas) for _ in range(2))


def rima_asonante(a: str, b: str) -> bool:
    """comparten las vocales desde la última vocal tónica (aproximación:
    últimas dos vocales iguales)."""
    va = morfologia.esqueleto_vocalico(_sin_tildes(a.lower()))
    vb = morfologia.esqueleto_vocalico(_sin_tildes(b.lower()))
    return len(va) >= 2 and len(vb) >= 2 and va[-2:] == vb[-2:]
