from PIL import Image
import random
import math

def distorsionar(imagen):
    ancho, alto = imagen.size

    # Definir los puntos de control para la distorsión
    puntos_control = [
        (0, 0),  # Esquina superior izquierda
        (ancho - 1, 0),  # Esquina superior derecha
        (ancho - 1, alto - 1),  # Esquina inferior derecha
        (0, alto - 1)  # Esquina inferior izquierda
    ]

    # Calcular el factor de distorsión basado en el tamaño de la imagen
    factor_distorsion = min(ancho, alto) * 0.2  # Ajustable para más o menos distorsión

    # Distorsionar cada punto de control
    puntos_distorsionados = []
    for x, y in puntos_control:
        # Calcular el desplazamiento aleatorio
        angulo = random.uniform(0, 2 * math.pi)
        radio = random.uniform(0, factor_distorsion)
        dx = int(math.cos(angulo) * radio)
        dy = int(math.sin(angulo) * radio)

        # Aplicar el desplazamiento y asegurar que esté dentro de los límites
        nuevo_x = max(0, min(x + dx, ancho - 1))
        nuevo_y = max(0, min(y + dy, alto - 1))
        puntos_distorsionados.extend([nuevo_x, nuevo_y])

    # Aplicar la transformación de perspectiva
    return imagen.transform(imagen.size, Image.PERSPECTIVE, puntos_distorsionados, Image.BICUBIC)

# Ejemplo de uso
 imagen = Image.open("collage_651bb3dbbb.png")
 imagen_distorsionada = distorsionar(imagen)
 imagen_distorsionada.save("imagen_distorsionada.jpg")