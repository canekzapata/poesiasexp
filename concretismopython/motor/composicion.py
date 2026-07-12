# -*- coding: utf-8 -*-
"""
composicion.py — el taller donde el poema se arma
poesiasexp / concretismopython

la Composicion es la página: palabras colocadas con coordenadas exactas.
aquí viven las restricciones (sin límites solo hay ornamento), la anomalía
(el quiebre que crea tensión), la puntuación (densidad, repetición,
contraste, vacío) y la gramática espacial: nodo, eje, órbita, nube,
caída, capa, repetición, interferencia, fractura, vacío.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field, asdict

from . import geometria, semantica
from .lexico import Lexico

# ------------------------------------------------------------- constantes

PAPEL = "#f6f2e9"
TINTA = "#16130f"
ROJO = "#c8102e"          # el único color: para la anomalía

FUENTES = {
    "mono": "'Courier Prime', 'Courier New', monospace",
    "sans": "Futura, 'Century Gothic', 'Helvetica Neue', Arial, sans-serif",
    "serif": "'Bodoni Moda', Didot, 'Times New Roman', serif",
}

RESTRICCIONES = {
    "max_palabras_base": 12,
    "min_vacio": 0.30,
    "max_fuentes": 3,
    "anomalias": 1,
    "nucleos": 1,
}

ANIMACIONES = ("ascenso", "caida", "deriva", "parpadeo", "giro", "temblor")


# ------------------------------------------------------------ el modelo

@dataclass
class Colocada:
    """una palabra puesta sobre la página, con todas sus decisiones."""
    id: str
    texto: str
    base: str                      # la palabra del corpus de la que viene
    x: float
    y: float
    rotacion: float = 0.0
    tamano: float = 18.0
    opacidad: float = 1.0
    fuente: str = "mono"           # mono | sans | serif
    espaciado: float = 0.0         # en em
    capa: str = "campo"
    color: str | None = None       # None = tinta de la página
    anomalia: bool = False
    animacion: str | None = None
    transformacion: str | None = None   # erosión, deriva, glosolalia, ...
    variantes: list[str] = field(default_factory=list)
    etimologia: list[str] = field(default_factory=list)

    def area(self) -> float:
        return geometria.area_texto(self.texto, self.tamano,
                                    self.fuente, self.espaciado)


@dataclass
class Composicion:
    tipo: str
    semilla: int
    nucleo: str
    esquizo: float = 0.35
    ancho: float = 900.0
    alto: float = 900.0
    fondo: str = PAPEL
    tinta: str = TINTA
    palabras: list[Colocada] = field(default_factory=list)
    notas: list[str] = field(default_factory=list)
    _contador: int = 0

    # ------------------------------------------------------------ armado

    def agregar(self, texto: str, x: float, y: float, base: str | None = None,
                **kw) -> Colocada:
        texto = str(texto)
        if not texto.strip():
            return None
        x, y = geometria.acotar(x, y, self.ancho, self.alto)
        self._contador += 1
        colocada = Colocada(id=f"p{self._contador}", texto=texto,
                            base=base or texto, x=round(x, 2), y=round(y, 2), **kw)
        colocada.rotacion = round(colocada.rotacion, 2)
        self.palabras.append(colocada)
        return colocada

    def quitar(self, colocada: Colocada):
        self.palabras.remove(colocada)

    def anotar(self, nota: str):
        self.notas.append(nota)

    # --------------------------------------------------------- medidas

    def bases(self) -> set[str]:
        return {p.base for p in self.palabras}

    def area_ocupada(self) -> float:
        return sum(p.area() * p.opacidad for p in self.palabras)

    def vacio(self) -> float:
        """proporción de página sin tinta. el silencio de la composición."""
        total = self.ancho * self.alto
        return max(0.0, 1.0 - self.area_ocupada() / total)

    def puntuacion(self) -> dict:
        """densidad, repetición, contraste, vacío: los cuatro medidores."""
        vacio = self.vacio()
        n = len(self.palabras)
        repeticion = 0.0
        if n:
            repeticion = 1.0 - len({p.texto for p in self.palabras}) / n
        contraste = 0.0
        if n > 1:
            tamanos = [p.tamano for p in self.palabras]
            grande, chico = max(tamanos), min(tamanos)
            gama = (grande - chico) / grande if grande else 0.0
            rotaciones = len({round(p.rotacion) % 360 for p in self.palabras})
            contraste = round(min(1.0, 0.7 * gama + 0.3 * min(1.0, rotaciones / 6)), 3)
        return {
            "densidad": round(1.0 - vacio, 3),
            "vacio": round(vacio, 3),
            "repeticion": round(repeticion, 3),
            "contraste": contraste,
        }

    # ---------------------------------------------------------- salida

    def a_dict(self) -> dict:
        return {
            "meta": {
                "instrumento": "nefelógrafo",
                "tipo": self.tipo,
                "semilla": self.semilla,
                "nucleo": self.nucleo,
                "esquizo": self.esquizo,
                "puntuacion": self.puntuacion(),
                "restricciones": verificar(self),
                "notas": self.notas,
            },
            "lienzo": {
                "ancho": self.ancho,
                "alto": self.alto,
                "fondo": self.fondo,
                "tinta": self.tinta,
                "fuentes": FUENTES,
            },
            "palabras": [
                {k: v for k, v in asdict(p).items() if v not in (None, [], {})}
                for p in self.palabras
            ],
        }


# ------------------------------------------------------- restricciones

def verificar(comp: Composicion) -> dict:
    """el estado de las reglas: se informa siempre, se cumpla o no."""
    bases = {p.base for p in comp.palabras if p.capa != "fantasma"}
    anomalias = sum(1 for p in comp.palabras if p.anomalia)
    nucleos = sum(1 for p in comp.palabras if p.capa == "nucleo")
    fuentes = {p.fuente for p in comp.palabras}
    vacio = comp.vacio()
    cumplidas = (len(bases) <= RESTRICCIONES["max_palabras_base"]
                 and vacio >= RESTRICCIONES["min_vacio"]
                 and len(fuentes) <= RESTRICCIONES["max_fuentes"]
                 and anomalias == RESTRICCIONES["anomalias"]
                 and nucleos >= RESTRICCIONES["nucleos"])
    return {
        "palabras_base": len(bases),
        "max_palabras_base": RESTRICCIONES["max_palabras_base"],
        "vacio": round(vacio, 3),
        "min_vacio": RESTRICCIONES["min_vacio"],
        "fuentes": len(fuentes),
        "max_fuentes": RESTRICCIONES["max_fuentes"],
        "anomalias": anomalias,
        "nucleos": nucleos,
        "cumplidas": cumplidas,
    }


def aplicar_restricciones(comp: Composicion, rng: random.Random):
    """impone los límites sin pedir permiso, pero deja constancia en notas."""
    # 1. máximo de palabras-base
    maximo = RESTRICCIONES["max_palabras_base"]
    bases = {}
    for p in comp.palabras:
        if p.capa == "fantasma":
            continue
        bases.setdefault(p.base, []).append(p)
    if len(bases) > maximo:
        protegidas = {comp.nucleo} | {p.base for p in comp.palabras if p.anomalia}
        orden = sorted(bases, key=lambda b: (b in protegidas,
                                             sum(c.area() for c in bases[b])))
        for b in orden:
            if len(bases) <= maximo:
                break
            if b in protegidas:
                continue
            for c in bases[b]:
                if c in comp.palabras:
                    comp.quitar(c)
            del bases[b]
            comp.anotar(f"restricción: se despidió a «{b}» (había más de {maximo} palabras-base)")

    # 2. mínimo de vacío: primero encoger, luego despedir a las tenues
    minimo = RESTRICCIONES["min_vacio"]
    intentos = 0
    while comp.vacio() < minimo and intentos < 6:
        for p in comp.palabras:
            if p.capa != "nucleo" and not p.anomalia:
                p.tamano = round(p.tamano * 0.9, 2)
        intentos += 1
    if intentos:
        comp.anotar(f"restricción: la página respiró {intentos} veces para ganar vacío")
    prescindibles = sorted((p for p in comp.palabras
                            if p.capa not in ("nucleo",) and not p.anomalia),
                           key=lambda p: (p.opacidad, -p.area()))
    while comp.vacio() < minimo and prescindibles:
        fuera = prescindibles.pop(0)
        if fuera in comp.palabras:
            comp.quitar(fuera)
            comp.anotar(f"restricción: «{fuera.texto}» se evaporó para dejar vacío")

    return verificar(comp)


def imponer_anomalia(comp: Composicion, rng: random.Random, receta) -> Colocada | None:
    """una sola anomalía por poema: el quiebre que crea tensión.
    la receta es una función que elige y deforma una colocada (o crea una),
    la marca y la pinta de rojo."""
    ya = [p for p in comp.palabras if p.anomalia]
    if ya:
        return ya[0]
    colocada = receta(comp, rng)
    if colocada is not None:
        colocada.anomalia = True
        colocada.color = ROJO
        colocada.capa = "anomalia"
    return colocada


def rellenar_variantes(comp: Composicion, lex: Lexico, rng: random.Random,
                       profundidad: int = 2):
    """cada palabra colocada recibe sus mutaciones posibles y su cadena
    etimológica: el poema viaja con su propia memoria."""
    for p in comp.palabras:
        if p.capa == "fantasma":
            continue
        palabra = lex.palabra(p.base)
        p.variantes = semantica.variantes_de(lex, p.base, profundidad, rng)
        p.etimologia = list(palabra.etimologia[:3])


# ------------------------------------------------- gramática espacial

def nodo(comp: Composicion, texto: str, x: float | None = None,
         y: float | None = None, tamano: float = 64.0, fuente: str = "sans",
         capa: str = "nucleo", **kw) -> Colocada:
    """Nodo: un punto de masa. por defecto, el centro."""
    return comp.agregar(texto, x if x is not None else comp.ancho / 2,
                        y if y is not None else comp.alto / 2,
                        tamano=tamano, fuente=fuente, capa=capa, **kw)


def eje(comp: Composicion, textos: list[str], x: float, y0: float, y1: float,
        vertical: bool = True, tamano: float = 16.0, **kw) -> list[Colocada]:
    """Eje: palabras alineadas sobre una recta."""
    puestas = []
    n = max(1, len(textos))
    for k, t in enumerate(textos):
        frac = (k + 0.5) / n
        if vertical:
            puestas.append(comp.agregar(t, x, y0 + (y1 - y0) * frac,
                                        tamano=tamano, **kw))
        else:
            puestas.append(comp.agregar(t, y0 + (y1 - y0) * frac, x,
                                        tamano=tamano, **kw))
    return [p for p in puestas if p]


def nube(comp: Composicion, textos: list[str], cx: float, cy: float,
         sigma: float, rng: random.Random, densidad: float = 0.5,
         tamano: float = 16.0, **kw) -> list[Colocada]:
    """Nube: dispersión gaussiana. la densidad aprieta o afloja la sigma."""
    sigma_efectiva = sigma * (1.6 - densidad)
    puntos = geometria.dispersion(len(textos), cx, cy,
                                  sigma_efectiva, sigma_efectiva * 0.7, rng)
    puestas = []
    for t, (x, y) in zip(textos, puntos):
        puestas.append(comp.agregar(t, x, y, tamano=tamano, **kw))
    return [p for p in puestas if p]


def orbita(comp: Composicion, textos: list[str], cx: float, cy: float,
           radio: float, desfase: float = 0.0, tamano: float = 16.0,
           **kw) -> list[Colocada]:
    """Órbita: palabras tangentes a un círculo."""
    puntos = geometria.orbita(cx, cy, radio, len(textos), desfase)
    puestas = []
    for t, (x, y, rot) in zip(textos, puntos):
        puestas.append(comp.agregar(t, x, y, rotacion=rot, tamano=tamano, **kw))
    return [p for p in puestas if p]


def caida(comp: Composicion, texto: str, x: float, y0: float, y1: float,
          tamano: float = 15.0, desvanecer: bool = True, rng: random.Random | None = None,
          **kw) -> list[Colocada]:
    """Caída: la palabra se deja caer letra por letra."""
    rng = rng or random.Random()
    base = kw.pop("base", texto)
    letras = [c for c in texto]
    puestas = []
    n = max(1, len(letras))
    for k, letra in enumerate(letras):
        if letra == " ":
            continue
        frac = (k + 0.5) / n
        y = y0 + (y1 - y0) * frac + rng.uniform(-4, 4)
        opacidad = round(1.0 - 0.75 * frac, 2) if desvanecer else 1.0
        puestas.append(comp.agregar(letra, x + rng.uniform(-2.5, 2.5), y,
                                    base=base,
                                    tamano=tamano, opacidad=opacidad,
                                    transformacion="caída", **kw))
    return [p for p in puestas if p]


def capa(comp: Composicion, texto: str, y: float, tamano: float = 18.0,
         espaciado: float = 0.6, repetir_hasta: float | None = None,
         **kw) -> Colocada:
    """Capa: una banda horizontal; el texto puede repetirse hasta llenar el ancho."""
    t = texto
    if repetir_hasta:
        while geometria.ancho_texto(t + " " + texto, tamano,
                                    kw.get("fuente", "mono"), espaciado) < repetir_hasta:
            t = t + " " + texto
    return comp.agregar(t, comp.ancho / 2, y, base=kw.pop("base", texto),
                        tamano=tamano, espaciado=espaciado, **kw)


def repeticion(comp: Composicion, texto: str, cuantas: int, zona: tuple,
               rng: random.Random, tamano: float = 14.0, **kw) -> list[Colocada]:
    """Repetición: letanía de una misma palabra en una zona."""
    x0, y0, x1, y1 = zona
    base = kw.pop("base", texto)
    puestas = []
    for _ in range(cuantas):
        puestas.append(comp.agregar(texto, rng.uniform(x0, x1), rng.uniform(y0, y1),
                                    base=base, tamano=tamano, **kw))
    return [p for p in puestas if p]


def interferencia(comp: Composicion, desplazamiento: tuple = (7.0, 5.0),
                  opacidad: float = 0.14, capas: tuple = ("nucleo", "campo")) -> list[Colocada]:
    """Interferencia: una copia fantasma de lo ya puesto, apenas corrida.
    el moiré del poema consigo mismo."""
    dx, dy = desplazamiento
    fantasmas = []
    for p in list(comp.palabras):
        if p.capa not in capas or p.anomalia:
            continue
        f = comp.agregar(p.texto, p.x + dx, p.y + dy, base=p.base,
                         rotacion=p.rotacion, tamano=p.tamano,
                         opacidad=opacidad, fuente=p.fuente,
                         espaciado=p.espaciado, capa="fantasma",
                         transformacion="interferencia")
        if f:
            fantasmas.append(f)
    return fantasmas


def fractura(comp: Composicion, texto: str, x: float, y: float,
             rng: random.Random, tamano: float = 22.0, cortes: int = 2,
             separacion: float = 26.0, **kw) -> list[Colocada]:
    """Fractura: la palabra cortada contra la sílaba, fragmentos dislocados."""
    from . import morfologia
    fragmentos = morfologia.cortar(texto, cortes, rng)
    puestas = []
    avance = x - geometria.ancho_texto(texto, tamano, kw.get("fuente", "mono")) / 2
    for k, fr in enumerate(fragmentos):
        w = geometria.ancho_texto(fr, tamano, kw.get("fuente", "mono"))
        salto = rng.uniform(-separacion, separacion)
        puestas.append(comp.agregar(fr, avance + w / 2, y + salto, base=texto,
                                    tamano=tamano, transformacion="fractura",
                                    **dict(kw)))
        avance += w + separacion * 0.6
    return [p for p in puestas if p]


def vacio(comp: Composicion, proporcion: float):
    """Vacío: declara cuánta página debe quedar sin tinta.
    no coloca nada: aprieta la restricción para este poema."""
    comp.anotar(f"vacío pedido: {proporcion:.2f}")
    if proporcion > RESTRICCIONES["min_vacio"]:
        # la restricción local puede ser más exigente que la global, nunca menos
        while comp.vacio() < proporcion and len(comp.palabras) > 1:
            tenue = min((p for p in comp.palabras if p.capa != "nucleo"),
                        key=lambda p: p.opacidad, default=None)
            if tenue is None:
                break
            comp.quitar(tenue)
