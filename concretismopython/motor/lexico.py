# -*- coding: utf-8 -*-
"""
lexico.py — la memoria del sistema
poesiasexp / concretismopython

carga el corpus (corpus/*.json) y lo indexa por campo, familia y movimiento.
cada palabra conoce sus sílabas, sus sonidos, su etimología, sus parientes,
sus paralelos en náhuatl y maya, y cuánto pesa sobre la página.
"""

from __future__ import annotations

import json
import os
import random
from dataclasses import dataclass, field

from . import fonetica, morfologia

AQUI = os.path.dirname(os.path.abspath(__file__))
CARPETA_CORPUS = os.path.normpath(os.path.join(AQUI, "..", "corpus"))

ARCHIVOS_PALABRAS = ("nubes.json", "atmosfera.json", "agua.json",
                     "optica.json", "verbo.json", "puentes.json")


@dataclass
class Palabra:
    forma: str
    silabas: list[str] = field(default_factory=list)
    raiz: str = ""
    familia: str = ""
    etimologia: list[str] = field(default_factory=list)
    campo: list[str] = field(default_factory=list)
    sonidos: list[str] = field(default_factory=list)
    raiz_culta: list[str] = field(default_factory=list)
    paralelos: dict = field(default_factory=dict)
    peso_visual: int = 4
    densidad: float = 0.5
    movimiento: str = "suspendido"
    nota: str = ""
    archivo: str = ""

    @property
    def puente(self) -> bool:
        return "puente" in self.campo

    def __post_init__(self):
        if not self.silabas:
            self.silabas = morfologia.silabificar(self.forma)
        if not self.sonidos:
            self.sonidos = fonetica.sonidos(self.forma)


class Lexico:
    """el acervo completo, con sus índices."""

    def __init__(self, palabras: list[Palabra], etimologias: dict):
        self.palabras: dict[str, Palabra] = {p.forma: p for p in palabras}
        self.etimologias = etimologias
        self._por_campo: dict[str, list[str]] = {}
        self._por_familia: dict[str, list[str]] = {}
        self._por_movimiento: dict[str, list[str]] = {}
        for p in palabras:
            for c in p.campo:
                self._por_campo.setdefault(c, []).append(p.forma)
            self._por_familia.setdefault(p.familia, []).append(p.forma)
            self._por_movimiento.setdefault(p.movimiento, []).append(p.forma)

    # ---------------------------------------------------------- consultas

    def __contains__(self, forma: str) -> bool:
        return forma in self.palabras

    def __len__(self) -> int:
        return len(self.palabras)

    def palabra(self, forma: str) -> Palabra:
        if forma in self.palabras:
            return self.palabras[forma]
        # palabra desconocida: se improvisa una ficha mínima
        return Palabra(forma=forma, campo=["intrusa"], familia="", archivo="")

    def formas(self, con_puentes: bool = True) -> list[str]:
        if con_puentes:
            return list(self.palabras)
        return [f for f, p in self.palabras.items() if not p.puente]

    def por_campo(self, campo: str) -> list[str]:
        return list(self._por_campo.get(campo, []))

    def por_familia(self, familia: str) -> list[str]:
        return list(self._por_familia.get(familia, []))

    def por_movimiento(self, movimiento: str) -> list[str]:
        return list(self._por_movimiento.get(movimiento, []))

    def campos(self) -> list[str]:
        return sorted(c for c in self._por_campo if c != "puente")

    def familia_de(self, forma: str) -> list[str]:
        """los parientes de sangre: mismas raíces."""
        p = self.palabra(forma)
        if not p.familia or p.familia == "puente":
            return []
        return [f for f in self.por_familia(p.familia) if f != forma]

    def vecinas_semanticas(self, forma: str, con_puentes: bool = False) -> list[str]:
        """palabras que comparten al menos un campo, ordenadas por afinidad."""
        p = self.palabra(forma)
        cuenta: dict[str, int] = {}
        for c in p.campo:
            for otra in self._por_campo.get(c, []):
                if otra == forma:
                    continue
                if not con_puentes and self.palabras[otra].puente:
                    continue
                cuenta[otra] = cuenta.get(otra, 0) + 1
        return sorted(cuenta, key=lambda f: (-cuenta[f], f))

    def vecinas_sonoras(self, forma: str, maximo: int = 2) -> list[str]:
        return fonetica.vecinas(forma, self.formas(), maximo=maximo)

    def deriva_sonora(self, forma: str, pasos: int = 4,
                      rng: random.Random | None = None) -> list[str]:
        return fonetica.deriva_sonora(forma, self.formas(), pasos=pasos, rng=rng)

    def al_azar(self, rng: random.Random, campo: str | None = None,
                con_puentes: bool = False) -> Palabra:
        if campo:
            candidatas = [f for f in self.por_campo(campo)
                          if con_puentes or not self.palabras[f].puente]
        else:
            candidatas = self.formas(con_puentes=con_puentes)
        return self.palabra(rng.choice(sorted(candidatas)))

    def silabarios(self) -> list[list[str]]:
        return [p.silabas for p in self.palabras.values() if not p.puente]

    def glosolalia(self, rng: random.Random, n_silabas: int = 3) -> str:
        return fonetica.glosolalia(self.silabarios(), rng=rng, n_silabas=n_silabas,
                                   prohibidas=set(self.palabras))


def cargar(carpeta: str | None = None) -> Lexico:
    """lee corpus/*.json y devuelve el léxico indexado."""
    carpeta = carpeta or CARPETA_CORPUS
    palabras: list[Palabra] = []
    for nombre in ARCHIVOS_PALABRAS:
        ruta = os.path.join(carpeta, nombre)
        if not os.path.exists(ruta):
            continue
        with open(ruta, encoding="utf-8") as f:
            datos = json.load(f)
        for cruda in datos.get("palabras", []):
            campos_validos = {k: v for k, v in cruda.items()
                              if k in Palabra.__dataclass_fields__}
            campos_validos["archivo"] = datos.get("archivo", nombre)
            palabras.append(Palabra(**campos_validos))
    ruta_etim = os.path.join(carpeta, "etimologias.json")
    etimologias = {}
    if os.path.exists(ruta_etim):
        with open(ruta_etim, encoding="utf-8") as f:
            etimologias = json.load(f)
    return Lexico(palabras, etimologias)
