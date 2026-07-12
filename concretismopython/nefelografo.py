#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
nefelógrafo — instrumento de composición para poesía concreta
poesiasexp / concretismopython / canekzapata.net

néphos (nube) + gráphein (escribir): el que escribe nubes.
no una ia que escribe poemas: una imprenta, una partitura,
un atlas meteorológico, una máquina combinatoria.

    python3 nefelografo.py                          un poema al azar
    python3 nefelografo.py --tipo lluvia --semilla 42
    python3 nefelografo.py --tipo halo --nucleo luz --animar
    python3 nefelografo.py --esquizo 0.9            sube la temperatura
    python3 nefelografo.py --criba 24               el mejor de 24 intentos
    python3 nefelografo.py --atlas                  las seis especies, a atlas/
    python3 nefelografo.py --palabra bruma          la ficha léxica completa
    python3 nefelografo.py --web                    alimenta el editor web
    python3 nefelografo.py --tipos                  lista las especies

corpus + reglas lingüísticas + reglas geométricas + restricciones
+ azar controlado + intervención humana = constructivismo generativo
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)

from motor import lexico, semantica  # noqa: E402
import reglas  # noqa: E402
from salida import svg as salida_svg, json as salida_json, png as salida_png  # noqa: E402


# ------------------------------------------------------------- generación

def generar(lex, tipo: str, semilla: int, nucleo: str | None,
            esquizo: float):
    rng = random.Random(semilla)
    return reglas.obtener(tipo)["componer"](lex, rng, semilla,
                                            nucleo=nucleo, esquizo=esquizo)


def puntaje_criba(comp) -> float:
    """qué tan viva quedó la página: contraste y algo de repetición,
    con las restricciones cumplidas y sin quedarse ni vacía ni ahogada."""
    p = comp.puntuacion()
    r = 1.0 if comp.a_dict()["meta"]["restricciones"]["cumplidas"] else 0.0
    return (p["contraste"] + 0.5 * p["repeticion"] + r
            - abs(p["vacio"] - 0.62))


def cribar(lex, tipo: str, nucleo: str | None, esquizo: float,
           intentos: int, semilla_inicial: int):
    """genera `intentos` poemas con semillas consecutivas y se queda
    con el de mejor puntaje. azar controlado: el azar propone, la
    puntuación dispone."""
    mejor = None
    mejor_puntaje = float("-inf")
    for k in range(intentos):
        comp = generar(lex, tipo, semilla_inicial + k, nucleo, esquizo)
        puntaje = puntaje_criba(comp)
        if puntaje > mejor_puntaje:
            mejor, mejor_puntaje = comp, puntaje
    mejor.anotar(f"criba: la semilla {mejor.semilla} ganó entre {intentos}")
    return mejor


# ---------------------------------------------------------------- salidas

def escribir(comp, carpeta: str, ruta_svg=None, ruta_json=None, ruta_png=None,
             animar=False, tema="papel") -> list[str]:
    os.makedirs(carpeta, exist_ok=True)
    nombre = f"poema-{comp.tipo}-{comp.semilla}"
    rutas = []
    ruta_svg = ruta_svg or os.path.join(carpeta, nombre + ".svg")
    rutas.append(salida_svg.guardar(comp, ruta_svg, animar=animar, tema=tema))
    ruta_json = ruta_json or os.path.join(carpeta, nombre + ".json")
    rutas.append(salida_json.guardar(comp, ruta_json))
    if ruta_png:
        documento = salida_svg.render(comp, animar=False, tema=tema)
        rutas.append(salida_png.rasterizar(documento, ruta_png))
    return rutas


def alimentar_web(comp) -> list[str]:
    """escribe web/poema.json y lo incrusta en editor.html
    (entre los centinelas <!-- poema:incrustado -->)."""
    rutas = []
    carpeta_web = os.path.join(AQUI, "web")
    os.makedirs(carpeta_web, exist_ok=True)
    ruta_json = os.path.join(carpeta_web, "poema.json")
    rutas.append(salida_json.guardar(comp, ruta_json))

    ruta_editor = os.path.join(carpeta_web, "editor.html")
    if os.path.exists(ruta_editor):
        with open(ruta_editor, encoding="utf-8") as f:
            html = f.read()
        incrustado = (f'<script type="application/json" id="poema-incrustado">\n'
                      f'{salida_json.texto(comp)}\n</script>')
        patron = re.compile(
            r"<!-- poema:incrustado -->.*?<!-- /poema:incrustado -->",
            re.DOTALL)
        if patron.search(html):
            html = patron.sub(
                "<!-- poema:incrustado -->\n" + incrustado +
                "\n<!-- /poema:incrustado -->", html, count=1)
            with open(ruta_editor, "w", encoding="utf-8") as f:
                f.write(html)
            rutas.append(ruta_editor)
        else:
            print("aviso: editor.html no tiene centinelas <!-- poema:incrustado -->")
    return rutas


# ------------------------------------------------------------ la consola

def tarjeta(comp, rutas: list[str]):
    p = comp.puntuacion()
    r = comp.a_dict()["meta"]["restricciones"]
    lineas = [
        f"poema-{comp.tipo} · semilla {comp.semilla} · núcleo «{comp.nucleo}» "
        f"· esquizo {comp.esquizo}",
        f"vacío {p['vacio']:.2f} · densidad {p['densidad']:.2f} · "
        f"repetición {p['repeticion']:.2f} · contraste {p['contraste']:.2f}",
        f"palabras-base {r['palabras_base']}/{r['max_palabras_base']} · "
        f"fuentes {r['fuentes']}/{r['max_fuentes']} · "
        f"anomalías {r['anomalias']} · "
        f"restricciones {'cumplidas' if r['cumplidas'] else 'ROTAS'}",
    ]
    lineas += [f"→ {os.path.relpath(ruta)}" for ruta in rutas]
    ancho = max(len(linea) for linea in lineas) + 2
    print("┌─ nefelógrafo " + "─" * max(0, ancho - 14) + "┐")
    for linea in lineas:
        print("│ " + linea.ljust(ancho - 1) + "│")
    print("└" + "─" * ancho + "┘")
    for nota in comp.notas:
        print("  · " + nota)


def ficha(lex, forma: str):
    o = semantica.orbita(lex, forma)
    print(f"\n{o['forma']}   [{' · '.join(o['silabas'])}]   /{''.join(o['sonidos'])}/")
    print(f"raíz {o['raiz'] or '—'} · campo: {', '.join(o['campo'])}")
    print(f"movimiento {o['movimiento']} · densidad {o['densidad']} "
          f"· peso visual {o['peso_visual']}")
    if len(o["cadena"]) > 1:
        print("cadena: " + " ← ".join(o["cadena"]))
    if o["origen"]:
        print(f"origen: {o['origen'].get('origen', '')}")
        if o["origen"].get("nota"):
            print(f"        {o['origen']['nota']}")
    if o["familia"]:
        print("familia: " + ", ".join(o["familia"]))
    if o["cultas"]:
        print("raíces cultas: " + ", ".join(c + "-" for c in o["cultas"]))
    if o["paralelos"]:
        print("paralelos: " + " · ".join(f"{v} ({k})" for k, v in o["paralelos"].items()))
    if o["falsos_parientes"]:
        for pariente, nota in o["falsos_parientes"]:
            print(f"falso pariente: {pariente} — {nota}")
    if o["vecinas_semanticas"]:
        print("vecinas de campo: " + ", ".join(o["vecinas_semanticas"]))
    if o["vecinas_sonoras"]:
        print("vecinas de sonido: " + ", ".join(o["vecinas_sonoras"]))
    if o["nota"]:
        print(f"nota: {o['nota']}")
    print()


def listar_tipos():
    print()
    for nombre in reglas.nombres():
        e = reglas.obtener(nombre)
        ancho, alto = e["lienzo"]
        print(f"poema-{nombre:<9} {ancho}×{alto}   {e['descripcion']}")
        rasgos = " · ".join(f"{k}: {v}" for k, v in e["tipo"].items())
        print(f"{'':11}{rasgos}")
    print()


# ------------------------------------------------------------------ main

def main(argv=None):
    parser = argparse.ArgumentParser(
        prog="nefelografo",
        description="instrumento de composición para poesía concreta "
                    "(poesiasexp / concretismopython)")
    parser.add_argument("--tipo", choices=reglas.nombres() + ["azar"],
                        default="azar", help="especie de poema")
    parser.add_argument("--nucleo", help="palabra-núcleo (si no, la elige la especie)")
    parser.add_argument("--semilla", type=int, default=None,
                        help="semilla del azar controlado (reproducible)")
    parser.add_argument("--esquizo", type=float, default=0.35,
                        help="temperatura esquizo 0..1: glosolalia, interferencia (0.35)")
    parser.add_argument("--criba", type=int, default=1, metavar="N",
                        help="genera N candidatos y se queda con el mejor")
    parser.add_argument("--animar", action="store_true",
                        help="svg con movimiento suave (css)")
    parser.add_argument("--tema", choices=list(salida_svg.TEMAS), default="papel")
    parser.add_argument("--svg", help="ruta de salida svg")
    parser.add_argument("--json", dest="ruta_json", help="ruta de salida json")
    parser.add_argument("--png", help="ruta de salida png o pdf (si hay rasterizador)")
    parser.add_argument("-o", "--carpeta", default=os.path.join(AQUI, "salidas"),
                        help="carpeta de salida (salidas/)")
    parser.add_argument("--atlas", action="store_true",
                        help="una lámina por especie, a atlas/")
    parser.add_argument("--web", action="store_true",
                        help="escribe web/poema.json y lo incrusta en el editor")
    parser.add_argument("--palabra", metavar="FORMA",
                        help="imprime la ficha léxica y sale")
    parser.add_argument("--tipos", action="store_true",
                        help="lista las especies y sale")
    args = parser.parse_args(argv)

    lex = lexico.cargar()

    if args.tipos:
        listar_tipos()
        return 0
    if args.palabra:
        ficha(lex, args.palabra)
        return 0

    semilla = args.semilla if args.semilla is not None else random.randrange(100000)

    if args.atlas:
        carpeta = os.path.join(AQUI, "atlas")
        os.makedirs(carpeta, exist_ok=True)
        for nombre in reglas.nombres():
            comp = (cribar(lex, nombre, args.nucleo, args.esquizo, args.criba, semilla)
                    if args.criba > 1 else
                    generar(lex, nombre, semilla, args.nucleo, args.esquizo))
            ruta = os.path.join(carpeta, f"poema-{nombre}.svg")
            salida_svg.guardar(comp, ruta, animar=True, tema=args.tema)
            tarjeta(comp, [ruta])
        return 0

    tipo = args.tipo
    if tipo == "azar":
        tipo = random.Random(semilla).choice(reglas.nombres())

    if args.criba > 1:
        comp = cribar(lex, tipo, args.nucleo, args.esquizo, args.criba, semilla)
    else:
        comp = generar(lex, tipo, semilla, args.nucleo, args.esquizo)

    rutas = escribir(comp, args.carpeta, args.svg, args.ruta_json, args.png,
                     animar=args.animar, tema=args.tema)
    if args.web:
        rutas += alimentar_web(comp)
    tarjeta(comp, rutas)
    return 0


if __name__ == "__main__":
    sys.exit(main())
