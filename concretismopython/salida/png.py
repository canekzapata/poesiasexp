# -*- coding: utf-8 -*-
"""
png.py — raster y pdf, si el sistema ayuda
poesiasexp / concretismopython

el svg es la salida verdadera; esto es cortesía. intenta, en orden:
cairosvg (python), rsvg-convert, inkscape, chromium sin cabeza.
si no hay con qué, lo dice claramente y no finge.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile

AYUDA = ("no hay rasterizador: instala cairosvg (pip install cairosvg) "
         "o rsvg-convert o inkscape o chromium. el svg ya es el poema.")


def _con_cairosvg(svg_texto: str, ruta: str, escala: float, formato: str) -> bool:
    try:
        import cairosvg
    except ImportError:
        return False
    if formato == "png":
        cairosvg.svg2png(bytestring=svg_texto.encode("utf-8"),
                         write_to=ruta, scale=escala)
    else:
        cairosvg.svg2pdf(bytestring=svg_texto.encode("utf-8"), write_to=ruta)
    return True


def _con_orden(orden: list[str]) -> bool:
    try:
        subprocess.run(orden, check=True, capture_output=True, timeout=120)
        return True
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired,
            FileNotFoundError):
        return False


def rasterizar(svg_texto: str, ruta: str, escala: float = 2.0) -> str:
    """svg -> png (o pdf si la ruta termina en .pdf)."""
    formato = "pdf" if ruta.lower().endswith(".pdf") else "png"
    if _con_cairosvg(svg_texto, ruta, escala, formato):
        return ruta

    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False,
                                     encoding="utf-8") as temporal:
        temporal.write(svg_texto)
        ruta_svg = temporal.name
    try:
        rsvg = shutil.which("rsvg-convert")
        if rsvg and _con_orden([rsvg, "-f", formato, "-z", str(escala),
                                "-o", ruta, ruta_svg]):
            return ruta
        inkscape = shutil.which("inkscape")
        if inkscape and _con_orden(
                [inkscape, ruta_svg,
                 f"--export-filename={ruta}",
                 f"--export-dpi={int(96 * escala)}"]):
            return ruta
        if formato == "png":
            for navegador in ("chromium", "chromium-browser", "google-chrome",
                              "/opt/pw-browsers/chromium"):
                crom = navegador if os.path.exists(navegador) else shutil.which(navegador)
                if crom and _con_orden(
                        [crom, "--headless", "--no-sandbox", "--disable-gpu",
                         f"--screenshot={ruta}", "--default-background-color=FFFFFFFF",
                         f"--window-size=1400,1400", f"file://{ruta_svg}"]):
                    return ruta
    finally:
        os.unlink(ruta_svg)
    raise RuntimeError(AYUDA)
