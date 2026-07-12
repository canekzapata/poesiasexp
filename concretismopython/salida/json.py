# -*- coding: utf-8 -*-
"""
json.py — el poema con su memoria
poesiasexp / concretismopython

el formato de intercambio con el editor web: coordenadas, capas,
transformaciones, y las variantes de cada palabra (por dónde puede
mutar cuando el poema esté vivo en el navegador).
"""

from __future__ import annotations

import json

from motor.composicion import Composicion


def volcar(comp: Composicion) -> dict:
    return comp.a_dict()


def texto(comp: Composicion) -> str:
    return json.dumps(volcar(comp), ensure_ascii=False, indent=2)


def guardar(comp: Composicion, ruta: str) -> str:
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(texto(comp))
        f.write("\n")
    return ruta
