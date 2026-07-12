# -*- coding: utf-8 -*-
"""
base.py — el registro de especies
poesiasexp / concretismopython

cada especie de poema (cúmulo, cirro, estrato, lluvia, halo, ciclón)
se registra aquí con su lienzo, su tipo (comportamiento declarado)
y su función componer(lexico, rng, nucleo, esquizo) -> Composicion.
"""

from __future__ import annotations

REGISTRO: dict[str, dict] = {}


def especie(nombre: str, lienzo: tuple, tipo: dict, descripcion: str = ""):
    """decorador: registra una especie de poema."""
    def registrar(fn):
        REGISTRO[nombre] = {
            "nombre": nombre,
            "lienzo": lienzo,
            "tipo": tipo,
            "descripcion": descripcion,
            "componer": fn,
        }
        return fn
    return registrar


def nombres() -> list[str]:
    return sorted(REGISTRO)


def obtener(nombre: str) -> dict:
    if nombre not in REGISTRO:
        disponibles = ", ".join(nombres())
        raise KeyError(f"especie desconocida: {nombre!r}. hay: {disponibles}")
    return REGISTRO[nombre]


# ------------------------------------------------- utilería compartida

def limpia(etimologia: str) -> str:
    """'nūbēs (lat.): tal cosa' -> 'nūbēs'"""
    return etimologia.split("(")[0].split(":")[0].strip()


def elegir_nucleo(lex, rng, nucleo, preferidas: tuple) -> str:
    """usa el núcleo pedido; si no hay, elige entre las palabras
    predilectas de la especie que existan en el corpus."""
    if nucleo:
        return nucleo
    candidatas = [f for f in preferidas if f in lex.palabras]
    if not candidatas:
        candidatas = lex.formas(con_puentes=False)
    return rng.choice(sorted(candidatas))


def toque_esquizo(comp, lex, rng):
    """el parámetro esquizo sube la temperatura: glosolalia suelta
    (palabras que no existen pero podrían) y, si es alto, interferencia
    (el poema superpuesto a sí mismo, apenas corrido)."""
    from motor import composicion as C
    e = comp.esquizo
    if e <= 0:
        return
    if e > 0.45:
        for _ in range(int(round(3 * e))):
            g = lex.glosolalia(rng, n_silabas=rng.choice([2, 3]))
            comp.agregar(g, rng.uniform(70, comp.ancho - 70),
                         rng.uniform(70, comp.alto - 70),
                         tamano=11, opacidad=0.55, fuente="mono",
                         capa="glosolalia", transformacion="glosolalia")
        comp.anotar("glosolalia: el idioma soñando consigo mismo")
    if e >= 0.6:
        C.interferencia(comp, desplazamiento=(6 + 8 * e, 4 + 6 * e),
                        opacidad=round(0.09 + 0.08 * e, 3))
        comp.anotar("interferencia: el poema se superpone a sí mismo")
