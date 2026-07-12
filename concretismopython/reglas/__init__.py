# -*- coding: utf-8 -*-
"""
reglas — las especies de poema
poesiasexp / concretismopython

importar este paquete llena el registro: cúmulo, cirro, estrato,
lluvia, halo, ciclón. cada tipo tiene comportamiento propio.
"""

from . import cumulo, cirro, estrato, lluvia, halo, ciclon  # noqa: F401
from .base import REGISTRO, especie, nombres, obtener  # noqa: F401
