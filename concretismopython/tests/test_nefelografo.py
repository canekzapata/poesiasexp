# -*- coding: utf-8 -*-
"""
pruebas del nefelógrafo
poesiasexp / concretismopython

corre con pytest o directo: python3 tests/test_nefelografo.py
los ejemplos del plan original son contrato: erosionar, expandir,
condensar y los portmanteaus deben dar exactamente lo prometido.
"""

import json
import os
import random
import sys
import xml.etree.ElementTree as ET

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
sys.path.insert(0, RAIZ)

from motor import morfologia as M, fonetica as F, lexico as L, semantica as S  # noqa: E402
from motor import composicion as C  # noqa: E402
import reglas  # noqa: E402
from salida import svg as salida_svg, json as salida_json  # noqa: E402

LEX = L.cargar()


# ------------------------------------------------------------- morfología

def test_silabas():
    casos = {
        "nube": ["nu", "be"],
        "lluvia": ["llu", "via"],
        "atmósfera": ["at", "mós", "fe", "ra"],
        "cúmulo": ["cú", "mu", "lo"],
        "cirro": ["ci", "rro"],
        "estrato": ["es", "tra", "to"],
        "nimbostrato": ["nim", "bos", "tra", "to"],
        "iridiscencia": ["i", "ri", "dis", "cen", "cia"],
        "evaporación": ["e", "va", "po", "ra", "ción"],
        "aéreo": ["a", "é", "re", "o"],
        "caída": ["ca", "í", "da"],
        "aire": ["ai", "re"],
        "agua": ["a", "gua"],
        "viento": ["vien", "to"],
        "huracán": ["hu", "ra", "cán"],
        "crepúsculo": ["cre", "pús", "cu", "lo"],
        "arcoíris": ["ar", "co", "í", "ris"],
        "trueno": ["true", "no"],
        "escarcha": ["es", "car", "cha"],
        "instante": ["ins", "tan", "te"],
        "obstruir": ["obs", "truir"],
        "hielo": ["hie", "lo"],
        "búho": ["bú", "ho"],
        "vergüenza": ["ver", "güen", "za"],
        "guitarra": ["gui", "ta", "rra"],
        "queja": ["que", "ja"],
        "hoy": ["hoy"],
        "atlas": ["a", "tlas"],
        "penumbra": ["pe", "num", "bra"],
        "día": ["dí", "a"],
    }
    for palabra, esperado in casos.items():
        assert M.silabificar(palabra) == esperado, (
            f"{palabra}: {M.silabificar(palabra)} != {esperado}")


def test_erosionar_como_el_plan():
    assert M.erosionar("condensación") == [
        "condensación", "ondensació", "ndensaci", "densac", "ensa", "ns"]


def test_expandir_como_el_plan():
    assert M.expandir("nube") == ["n u b e", "n  u  b  e", "n   u   b   e"]


def test_condensar_como_el_plan():
    assert M.condensar(["aire", "agua", "tiempo"], "yuxtaposicion") == "aireaguatiempo"
    assert M.condensar(["agua", "aire", "tiempo"], "fusion") == "aguairtiempo"
    assert S.transmutar(LEX, ["aire", "agua", "tiempo"]) == "aerohidrocrono"


def test_portmanteaus_del_plan():
    assert M.fusionar("vapor", "poesía") == "vapoesía"
    assert M.fusionar("nube", "elación") == "nubelación"
    assert S.portmanteau_culto(LEX, "color", "nimbo") == "cromonimbo"
    assert S.portmanteau_culto(LEX, "agua", "fonema") == "hidrofonema"
    assert S.portmanteau_culto(LEX, "aire", "lengua") == "aerolengua"


def test_cortar():
    rng = random.Random(1)
    trozos = M.cortar("atmósfera", 3, rng)
    assert "".join(trozos) == "atmósfera"
    assert len(trozos) == 4


def test_evaporar():
    rng = random.Random(2)
    etapas = M.evaporar("evaporación", rng=rng)
    assert etapas[0] == "evaporación"
    assert all(len(e) == len("evaporación") for e in etapas)  # deja huecos
    assert etapas[-1].count(" ") > etapas[0].count(" ")


def test_esqueletos():
    assert M.esqueleto_consonantico("nube") == "nb"
    assert M.esqueleto_vocalico("nube") == "ue"
    assert M.invertir("lluvia") == "aivull"


# --------------------------------------------------------------- fonética

def test_normalizar():
    assert F.normalizar("nube") == F.normalizar("nuve")      # b = v
    assert F.normalizar("cielo") == F.normalizar("sielo")    # seseo
    assert F.normalizar("hielo")[0] != "h"                   # h muda
    assert F.distancia("nube", "sube") == 1


def test_deriva_sonora():
    cadena = LEX.deriva_sonora("nube", pasos=5, rng=random.Random(7))
    assert cadena[0] == "nube"
    assert len(cadena) >= 4
    assert "sube" in cadena                                  # el plan lo pide
    for a, b in zip(cadena, cadena[1:]):
        assert F.distancia(a, b) <= 3


def test_glosolalia():
    g = LEX.glosolalia(random.Random(3))
    assert g and g not in LEX.palabras                       # suena pero no existe


# ----------------------------------------------------------------- léxico

def test_corpus_cargado():
    assert len(LEX) > 150
    nube = LEX.palabra("nube")
    assert nube.silabas == ["nu", "be"]
    assert nube.movimiento == "ascendente"
    assert "mixtli" in nube.paralelos.get("náhuatl", "")


def test_corpus_consistente():
    for forma, p in LEX.palabras.items():
        assert p.silabas == M.silabificar(forma), f"sílabas de {forma}"
        assert p.sonidos == F.sonidos(forma), f"sonidos de {forma}"
        assert 0.0 <= p.densidad <= 1.0
        if not p.puente:
            assert p.familia in LEX.etimologias["familias"], (
                f"{forma}: familia {p.familia} sin ficha")


def test_familias():
    assert set(LEX.familia_de("nube")) >= {"nublar", "nuboso"}
    assert "neblina" in LEX.familia_de("niebla")
    # nube y niebla NO son familia: falsas hermanas
    assert "niebla" not in LEX.familia_de("nube")
    pares = [tuple(par[:2]) for par in LEX.etimologias["falsos_parientes"]]
    assert ("nube", "niebla") in pares


# ------------------------------------------------------------ composición

def _componer(tipo, semilla, esquizo=0.35):
    rng = random.Random(semilla)
    return reglas.obtener(tipo)["componer"](LEX, rng, semilla, esquizo=esquizo)


def test_especies_cumplen_restricciones():
    for tipo in reglas.nombres():
        for semilla in (1, 7, 42):
            comp = _componer(tipo, semilla)
            r = C.verificar(comp)
            assert r["cumplidas"], f"{tipo}/{semilla}: {r}"
            assert r["palabras_base"] <= 12, f"{tipo}/{semilla}"
            assert r["vacio"] >= 0.30, f"{tipo}/{semilla}"
            assert r["fuentes"] <= 3, f"{tipo}/{semilla}"
            assert r["anomalias"] == 1, f"{tipo}/{semilla}"
            anomala = [p for p in comp.palabras if p.anomalia]
            assert anomala[0].color == C.ROJO


def test_determinismo():
    a = salida_json.texto(_componer("lluvia", 99))
    b = salida_json.texto(_componer("lluvia", 99))
    assert a == b


def test_esquizo_agrega_capas():
    sereno = _componer("cumulo", 5, esquizo=0.0)
    febril = _componer("cumulo", 5, esquizo=1.0)
    capas_febril = {p.capa for p in febril.palabras}
    assert len(febril.palabras) > len(sereno.palabras)
    assert "glosolalia" in capas_febril or "fantasma" in capas_febril


def test_variantes_y_etimologia_viajan():
    comp = _componer("halo", 11)
    con_variantes = [p for p in comp.palabras if p.variantes]
    assert con_variantes, "el poema debe llevar su memoria"


# ---------------------------------------------------------------- salidas

def test_svg_bien_formado():
    for tipo in reglas.nombres():
        comp = _componer(tipo, 3)
        documento = salida_svg.render(comp, animar=True)
        raiz = ET.fromstring(documento)
        assert raiz.tag.endswith("svg")
        textos = raiz.findall(".//{http://www.w3.org/2000/svg}text")
        assert len(textos) == len(comp.palabras)


def test_json_completo():
    comp = _componer("estrato", 8)
    datos = json.loads(salida_json.texto(comp))
    assert datos["meta"]["tipo"] == "estrato"
    assert datos["meta"]["restricciones"]["cumplidas"] is True
    assert datos["lienzo"]["fuentes"]
    for p in datos["palabras"]:
        assert {"id", "texto", "x", "y", "tamano"} <= set(p)


# ------------------------------------------------------------- el corredor

def correr():
    pruebas = [(n, f) for n, f in sorted(globals().items())
               if n.startswith("test_") and callable(f)]
    fallos = 0
    for nombre, prueba in pruebas:
        try:
            prueba()
            print(f"  ✓ {nombre}")
        except AssertionError as e:
            fallos += 1
            print(f"  ✗ {nombre}: {e}")
    print(f"\n{len(pruebas) - fallos}/{len(pruebas)} pruebas en paz")
    return fallos


if __name__ == "__main__":
    sys.exit(1 if correr() else 0)
