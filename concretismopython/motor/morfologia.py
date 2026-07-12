# -*- coding: utf-8 -*-
"""
morfologia.py — análisis silábico y operaciones verbales
poesiasexp / concretismopython

silabificar : división silábica del español (diptongos, hiatos, dígrafos,
              grupos inseparables; "tl" inseparable, como en méxico: a-tlas)
cortar      : corte arbitrario, contra la sílaba
erosionar   : desgaste por los dos extremos
evaporar    : pérdida gradual de letras interiores (deja huecos)
expandir    : la palabra respira, se abre
condensar   : yuxtaposición / fusión / transmutación a raíces cultas
fusionar    : portmanteau de dos palabras (vapor + poesía = vapoesía)
"""

from __future__ import annotations

import random

# ------------------------------------------------------------------ sílabas

FUERTES = set("aeoáéó")
DEBILES = set("iuü")
DEBILES_TILDADAS = set("íú")
VOCALES = FUERTES | DEBILES | DEBILES_TILDADAS

# grupos consonánticos inseparables (obstruyente + líquida)
INSEPARABLES = {
    "pr", "br", "tr", "dr", "cr", "gr", "fr", "kr",
    "pl", "bl", "cl", "gl", "fl", "kl", "tl",
}

# dígrafos que cuentan como una sola consonante
DIGRAFOS = {"ch", "ll", "rr"}


def _tokenizar(palabra: str) -> list[tuple[str, str]]:
    """divide la palabra en fichas (texto, clase) donde clase es 'v' o 'c'.
    los dígrafos (ch, ll, rr, qu, gu+e/i) viajan juntos; la u muda no es núcleo."""
    p = palabra.lower()
    fichas = []
    i = 0
    n = len(p)
    while i < n:
        dos = p[i:i + 2]
        if dos in DIGRAFOS:
            fichas.append((palabra[i:i + 2], "c"))
            i += 2
            continue
        if dos in ("qu",) and i + 2 < n and p[i + 2] in VOCALES:
            fichas.append((palabra[i:i + 2], "c"))          # que, qui: u muda
            i += 2
            continue
        if p[i] == "g" and i + 1 < n and p[i + 1] == "u" and i + 2 < n and p[i + 2] in "eéií":
            fichas.append((palabra[i:i + 2], "c"))          # gue, gui: u muda
            i += 2
            continue
        ch = p[i]
        if ch in VOCALES:
            fichas.append((palabra[i], "v"))
        elif ch == "y":
            antes_vocal = fichas and fichas[-1][1] == "v"
            sigue_vocal = i + 1 < n and p[i + 1] in VOCALES
            if sigue_vocal:
                fichas.append((palabra[i], "c"))            # ya, yo, yeso
            elif i == n - 1 and antes_vocal:
                fichas.append((palabra[i], "v"))            # hoy, rey: y vocálica
            elif not sigue_vocal and not antes_vocal and n == 1:
                fichas.append((palabra[i], "v"))            # la conjunción "y"
            else:
                fichas.append((palabra[i], "c"))
        else:
            fichas.append((palabra[i], "c"))                # h muda incluida: separa como consonante
        i += 1
    return fichas


def _hiato(a: str, b: str) -> bool:
    """¿las vocales a y b se niegan a convivir en la misma sílaba?"""
    a, b = a.lower(), b.lower()
    if a in DEBILES_TILDADAS or b in DEBILES_TILDADAS:
        return True                                         # ca-í-da, dí-a
    return a in FUERTES and b in FUERTES                    # a-é-re-o


def silabificar(palabra: str) -> list[str]:
    """división silábica normativa del español, con tl inseparable (a-tlas)."""
    if not palabra:
        return []
    if " " in palabra:
        partes = []
        for trozo in palabra.split(" "):
            partes.extend(silabificar(trozo))
        return partes

    fichas = _tokenizar(palabra)

    # núcleos: corridas de vocales, partidas donde hay hiato
    nucleos = []            # lista de (inicio, fin) inclusivo sobre fichas
    i = 0
    while i < len(fichas):
        if fichas[i][1] != "v":
            i += 1
            continue
        j = i
        while j + 1 < len(fichas) and fichas[j + 1][1] == "v" and not _hiato(fichas[j][0], fichas[j + 1][0]):
            j += 1
        nucleos.append((i, j))
        i = j + 1

    if not nucleos:
        return [palabra]

    # reparto de consonantes entre núcleos
    silabas = [""] * len(nucleos)
    # arranque: consonantes antes del primer núcleo
    for k in range(0, nucleos[0][0]):
        silabas[0] += fichas[k][0]

    for idx, (ini, fin) in enumerate(nucleos):
        for k in range(ini, fin + 1):
            silabas[idx] += fichas[k][0]
        if idx == len(nucleos) - 1:
            for k in range(fin + 1, len(fichas)):
                silabas[idx] += fichas[k][0]                # coda final
            break
        # consonantes entre este núcleo y el siguiente
        entre = list(range(fin + 1, nucleos[idx + 1][0]))
        c = len(entre)
        if c == 0:
            continue
        if c == 1:
            reparto = 0                                     # la consonante ataca
        elif c == 2:
            par = (fichas[entre[0]][0] + fichas[entre[1]][0]).lower()
            reparto = 0 if par in INSEPARABLES else 1
        elif c == 3:
            par = (fichas[entre[1]][0] + fichas[entre[2]][0]).lower()
            reparto = 1 if par in INSEPARABLES else 2       # com-prar / ins-tan
        else:
            reparto = 2                                     # obs-truir
        for k in entre[:reparto]:
            silabas[idx] += fichas[k][0]
        for k in entre[reparto:]:
            silabas[idx + 1] += fichas[k][0]

    return silabas


def contar_silabas(palabra: str) -> int:
    return len(silabificar(palabra))


# --------------------------------------------------------- operaciones verbales

def cortar(palabra: str, cortes: int = 3, rng: random.Random | None = None) -> list[str]:
    """corta la palabra en puntos arbitrarios: contra la sílaba, no con ella.
    cortar('atmósfera') -> ['at', 'mó', 'sfe', 'ra'] (según el azar)"""
    rng = rng or random.Random()
    interior = list(range(1, len(palabra)))
    if not interior or cortes <= 0:
        return [palabra]
    cortes = min(cortes, len(interior))
    puntos = sorted(rng.sample(interior, cortes))
    return cortar_en(palabra, puntos)


def cortar_en(palabra: str, puntos: list[int]) -> list[str]:
    """corta en posiciones exactas."""
    fragmentos = []
    anterior = 0
    for p in sorted(set(puntos)):
        if 0 < p < len(palabra):
            fragmentos.append(palabra[anterior:p])
            anterior = p
    fragmentos.append(palabra[anterior:])
    return [f for f in fragmentos if f]


def erosionar(palabra: str, minimo: int = 0) -> list[str]:
    """desgasta la palabra por ambos extremos, una letra por lado y por paso.

    erosionar('condensación') ->
    condensación / ondensació / ndensaci / densac / ensa / ns
    """
    etapas = [palabra]
    actual = palabra
    while len(actual) - 2 > minimo and len(actual) > 2:
        actual = actual[1:-1]
        etapas.append(actual)
    return etapas


def evaporar(palabra: str, pasos: int | None = None,
             rng: random.Random | None = None, huecos: bool = True) -> list[str]:
    """pérdida gradual de letras interiores, al azar; si huecos=True las
    letras que se van dejan su lugar vacío (la palabra conserva su ancho)."""
    rng = rng or random.Random()
    letras = list(palabra)
    indices = [i for i, c in enumerate(letras) if c != " "]
    rng.shuffle(indices)
    pasos = pasos if pasos is not None else len(indices)
    etapas = ["".join(letras)]
    for i in indices[:pasos]:
        letras[i] = " " if huecos else ""
        etapa = "".join(letras)
        if not huecos:
            etapa = etapa  # ya sin la letra
        if etapa.strip():
            etapas.append(etapa if huecos else "".join(c for c in etapa if c != " "))
    return etapas


def expandir(palabra: str, pasos: int = 3) -> list[str]:
    """la palabra se abre: n u b e / n  u  b  e / n   u   b   e"""
    return [(" " * k).join(palabra) for k in range(1, pasos + 1)]


def fusionar(a: str, b: str) -> str:
    """portmanteau: busca el mayor traslape entre un prefijo de a y el
    comienzo de b, y suelda. vapor + poesía = vapoesía; nube + elación = nubelación.
    si no hay traslape, elide la vocal final de a: agua+aire+tiempo -> aguairtiempo."""
    a_l, b_l = a.lower(), b.lower()
    mejor = None       # (traslape, i) — prefiere traslape largo y conservar más de a
    for k in range(min(len(a_l), len(b_l) - 1), 0, -1):
        pref_b = b_l[:k]
        for i in range(len(a_l), 1, -1):
            if a_l[:i].endswith(pref_b) and i - k >= 2:
                mejor = (k, i)
                break
        if mejor:
            break
    if mejor:
        k, i = mejor
        return a[:i] + b[k:]
    if a_l and a_l[-1] in VOCALES and b_l and b_l[0] not in VOCALES:
        # elisión: aguair + tiempo — salvo que la costura amontone consonantes
        cola = len(a_l[:-1]) - len(a_l[:-1].rstrip("bcdfghjklmnñpqrstvwxyz"))
        frente = len(b_l) - len(b_l.lstrip("bcdfghjklmnñpqrstvwxyz"))
        if cola + frente <= 2:
            return a[:-1] + b
    return a + b


def condensar(palabras: list[str], modo: str = "fusion",
              cultas: dict[str, str] | None = None) -> str:
    """condensar(['aire','agua','tiempo']) ->
       yuxtaposicion : aireaguatiempo
       fusion        : aguairtiempo (soldadura en cadena)
       transmutacion : aerohidrocrono (raíces cultas; requiere el diccionario)
    """
    if not palabras:
        return ""
    if modo == "yuxtaposicion":
        return "".join(palabras)
    if modo == "transmutacion":
        cultas = cultas or {}
        return "".join(cultas.get(p.lower(), p) for p in palabras)
    resultado = palabras[0]
    for siguiente in palabras[1:]:
        resultado = fusionar(resultado, siguiente)
    return resultado


def esqueleto_consonantico(palabra: str) -> str:
    """cirro: la palabra adelgazada hasta sus fibras. nube -> nb"""
    return "".join(c for c in palabra if c.lower() not in VOCALES and c != " ")


def esqueleto_vocalico(palabra: str) -> str:
    """estrato: el sedimento vocálico. nube -> ue"""
    return "".join(c for c in palabra if c.lower() in VOCALES)


def invertir(palabra: str) -> str:
    """el reflejo en el charco."""
    return palabra[::-1]
