# -*- coding: utf-8 -*-
"""
svg.py — salida vectorial, xml escrito a mano
poesiasexp / concretismopython

texto editable, escala infinita, coordenadas precisas. cada palabra
lleva su <title> con la etimología: el poema susurra al que pasa
el cursor. con animar=True, movimientos suaves por css (y respeto
a prefers-reduced-motion).
"""

from __future__ import annotations

import json as json_mod

from motor.composicion import Composicion, FUENTES

TEMAS = {
    "papel": {},                                        # los colores de la composición
    "noche": {"fondo": "#0c0c10", "tinta": "#e8e4da"},  # net art: pantalla encendida
}

ANIMACIONES_CSS = """
    @keyframes ascenso   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
    @keyframes caida     { 0%,100% { transform: translateY(0); } 50% { transform: translateY(9px); } }
    @keyframes deriva    { 0%,100% { transform: translateX(0); } 50% { transform: translateX(8px); } }
    @keyframes parpadeo  { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }
    @keyframes giro      { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(2.2deg); } }
    @keyframes temblor   { 0%,100% { transform: translate(0,0); } 25% { transform: translate(1.5px,-1px); } 75% { transform: translate(-1.5px,1px); } }
    .anima-ascenso  { animation: ascenso 9s ease-in-out infinite; }
    .anima-caida    { animation: caida 7s ease-in-out infinite; }
    .anima-deriva   { animation: deriva 12s ease-in-out infinite; }
    .anima-parpadeo { animation: parpadeo 5s ease-in-out infinite; }
    .anima-giro     { animation: giro 14s ease-in-out infinite; }
    .anima-temblor  { animation: temblor 0.9s linear infinite; }
    @media (prefers-reduced-motion: reduce) {
      .anima-ascenso, .anima-caida, .anima-deriva,
      .anima-parpadeo, .anima-giro, .anima-temblor { animation: none; }
    }
"""


def escapar(texto: str) -> str:
    return (str(texto).replace("&", "&amp;").replace("<", "&lt;")
            .replace(">", "&gt;").replace('"', "&quot;"))


def render(comp: Composicion, animar: bool = False, tema: str = "papel") -> str:
    """la composición como documento svg autosuficiente."""
    colores = TEMAS.get(tema, {})
    fondo = colores.get("fondo", comp.fondo)
    tinta = colores.get("tinta", comp.tinta)

    lineas = []
    ancho, alto = int(comp.ancho), int(comp.alto)
    lineas.append('<?xml version="1.0" encoding="utf-8"?>')
    lineas.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" '
        f'viewBox="0 0 {ancho} {alto}" width="{ancho}" height="{alto}" '
        f'font-kerning="normal">')
    lineas.append(f'<!-- nefelógrafo · poema-{escapar(comp.tipo)} · semilla {comp.semilla} '
                  f'· poesiasexp / concretismopython -->')

    meta = {"meta": comp.a_dict()["meta"],
            "lienzo": {"ancho": comp.ancho, "alto": comp.alto}}
    lineas.append("<metadata>" + escapar(json_mod.dumps(meta, ensure_ascii=False)) +
                  "</metadata>")

    lineas.append("<style>")
    lineas.append(f"  svg {{ background: {fondo}; }}")
    lineas.append("  text { white-space: pre; }")
    if animar:
        lineas.append(ANIMACIONES_CSS)
    lineas.append("</style>")

    lineas.append(f'<rect width="{ancho}" height="{alto}" fill="{fondo}"/>')

    for p in comp.palabras:
        transform = f"translate({p.x} {p.y})"
        if p.rotacion:
            transform += f" rotate({p.rotacion})"
        clase = f' class="anima-{p.animacion}"' if (animar and p.animacion) else ""
        color = p.color or tinta
        espaciado_px = round(p.espaciado * p.tamano, 2)
        atributos = [
            f'font-family="{escapar(FUENTES.get(p.fuente, FUENTES["mono"]))}"',
            f'font-size="{p.tamano}"',
            f'fill="{color}"',
            'text-anchor="middle"',
            'dominant-baseline="middle"',
        ]
        if p.opacidad < 1.0:
            atributos.append(f'fill-opacity="{p.opacidad}"')
        if espaciado_px:
            atributos.append(f'letter-spacing="{espaciado_px}"')

        titulo = p.base
        if p.etimologia:
            titulo += " ← " + " ← ".join(p.etimologia)
        if p.transformacion:
            titulo += f" · {p.transformacion}"

        lineas.append(f'<g transform="{transform}" data-id="{p.id}" '
                      f'data-capa="{escapar(p.capa)}">')
        lineas.append(f'  <text {" ".join(atributos)}{clase}>'
                      f'<title>{escapar(titulo)}</title>{escapar(p.texto)}</text>')
        lineas.append('</g>')

    lineas.append("</svg>")
    return "\n".join(lineas) + "\n"


def guardar(comp: Composicion, ruta: str, animar: bool = False,
            tema: str = "papel") -> str:
    documento = render(comp, animar=animar, tema=tema)
    with open(ruta, "w", encoding="utf-8") as f:
        f.write(documento)
    return ruta
