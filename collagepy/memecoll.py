import random
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageChops, ImageOps
import cv2
import numpy as np
import os
import hashlib
import time
import math
from colorsys import rgb_to_hsv, hsv_to_rgb

Image.MAX_IMAGE_PIXELS = None  # Desactiva la advertencia de PIL
MAX_HISTORIAL_POSICIONES = 8  # Reducido de 10 a 8

def limpiar_memoria():
    """Intenta liberar algo de memoria no utilizada."""
    import gc
    gc.collect()

def cargar_imagen(ruta):
    return Image.open(ruta).convert('RGBA')

def recortar_aleatorio(imagen, debug=True, forma_forzada=None):
    # Convertir la imagen PIL a formato OpenCV
    imagen_cv = cv2.cvtColor(np.array(imagen), cv2.COLOR_RGBA2BGRA)
    
    altura, ancho = imagen_cv.shape[:2]
    
    # Definir el tamaño mínimo y máximo del recorte
    min_size = min(100, min(altura, ancho) // 3)
    max_size = min(altura, ancho)
    
    # Elegir una forma aleatoria o usar la forma forzada
    formas = ['rectangulo', 'circulo', 'triangulo', 'trapecio', 'abstracta']
    forma = forma_forzada if forma_forzada else random.choice(formas)
    
    if debug:
        print(f"Forma seleccionada: {forma}")
        print(f"Tamaño de imagen original: {ancho}x{altura}")
    
    # Crear una máscara en blanco
    mascara = np.zeros((altura, ancho), dtype=np.uint8)
    
    if forma == 'rectangulo':
        ancho_recorte = random.randint(min_size, max_size)
        alto_recorte = random.randint(min_size, max_size)
        x = random.randint(0, max(0, ancho - ancho_recorte))
        y = random.randint(0, max(0, altura - alto_recorte))
        cv2.rectangle(mascara, (x, y), (x + ancho_recorte, y + alto_recorte), 255, -1)
        if debug:
            print(f"Rectángulo: ({x}, {y}) - {ancho_recorte}x{alto_recorte}")
    
    elif forma == 'circulo':
        radio = random.randint(min_size // 2, max_size // 2)
        centro_x = random.randint(radio, ancho - radio)
        centro_y = random.randint(radio, altura - radio)
        cv2.circle(mascara, (centro_x, centro_y), radio, 455, -1)
        if debug:
            print(f"Círculo: centro ({centro_x}, {centro_y}), radio {radio}")
    
    elif forma == 'triangulo':
        pts = np.array([
            [random.randint(0, ancho), random.randint(0, altura)],
            [random.randint(0, ancho), random.randint(0, altura)],
            [random.randint(0, ancho), random.randint(0, altura)]
        ], np.int32)
        cv2.fillPoly(mascara, [pts], 255)
        if debug:
            print(f"Triángulo: puntos {pts}")
    
    elif forma == 'trapecio':
        altura_trapecio = random.randint(min_size, max_size)
        base_superior = random.randint(min_size, max_size)
        base_inferior = random.randint(min_size, max_size)
        x = random.randint(0, max(0, ancho - max(base_superior, base_inferior)))
        y = random.randint(0, max(0, altura - altura_trapecio))
        pts = np.array([
            [x, y + altura_trapecio],
            [x + base_inferior, y + altura_trapecio],
            [x + base_inferior - (base_inferior - base_superior) // 2, y],
            [x + (base_inferior - base_superior) // 2, y]
        ], np.int32)
        cv2.fillPoly(mascara, [pts], 255)
        if debug:
            print(f"Trapecio: base inferior {base_inferior}, base superior {base_superior}, altura {altura_trapecio}")
    
    elif forma == 'abstracta':
        num_puntos = random.randint(5, 10)
        pts = np.array([[random.randint(0, ancho), random.randint(0, altura)] for _ in range(num_puntos)], np.int32)
        cv2.fillPoly(mascara, [pts], 255)
        if debug:
            print(f"Forma abstracta: {num_puntos} puntos")
    
    # Aplicar la máscara a la imagen original
    resultado = cv2.bitwise_and(imagen_cv, imagen_cv, mask=mascara)
    
    # Recortar el área no negra
    coords = cv2.findNonZero(cv2.cvtColor(resultado, cv2.COLOR_BGRA2GRAY))
    if coords is not None:
        x, y, w, h = cv2.boundingRect(coords)
        recorte = resultado[y:y+h, x:x+w]
    else:
        # Si no se encuentra ningún píxel no negro, devolver un recorte mínimo
        recorte = resultado[0:min(100, altura), 0:min(100, ancho)]
    
    # Convertir de vuelta a formato PIL
    imagen_recortada = Image.fromarray(cv2.cvtColor(recorte, cv2.COLOR_BGRA2RGBA))
    
    if debug:
        print(f"Dimensiones del recorte final: {imagen_recortada.size}")
    
    return imagen_recortada

def expandir_imagen(imagen):
    factor_expansion = random.uniform(1.2, 2.0)  # Reducido de 1.5-3.0 a 1.2-2.0
    nuevo_ancho = int(imagen.width * factor_expansion)
    nuevo_alto = int(imagen.height * factor_expansion)
    imagen_expandida = imagen.resize((nuevo_ancho, nuevo_alto), Image.LANCZOS)
    return verificar_tamaño_seguro(imagen_expandida, "expansión")

def duplicar(imagen, tamaño_collage):
    ancho_collage, alto_collage = tamaño_collage
    resultado = Image.new('RGBA', (ancho_collage, alto_collage), (0, 0, 0, 0))
    
    # Redimensionar la imagen de entrada si es demasiado grande
    pedazo = verificar_tamaño_seguro(imagen.copy(), "entrada de duplicación")
    
    # Limitar el número de duplicados para evitar la sobrecarga
    num_duplicados = random.randint(3, 10)  # Reducido de 3-15 a 3-10
    patron = random.choice(['linea', 'semicirculo', 'esquina', 'caotico'])
    
    centro_x = random.randint(0, ancho_collage)
    centro_y = random.randint(0, alto_collage)
    
    rotacion_global = random.randint(0, 360)
    
    for i in range(num_duplicados):
        if patron == 'linea':
            angulo = math.radians(random.randint(0, 360))
            distancia = random.randint(0, max(ancho_collage, alto_collage) // 2)  # Reducido a la mitad
            nuevo_x = centro_x + int(distancia * math.cos(angulo))
            nuevo_y = centro_y + int(distancia * math.sin(angulo))
        elif patron == 'semicirculo':
            angulo = math.pi * i / (num_duplicados - 1 or 1)  # Evitar división por cero
            angulo += math.radians(rotacion_global)
            radio = random.randint(24, max(ancho_collage, alto_collage) // 3)  # Reducido a un tercio
            nuevo_x = centro_x + int(radio * math.cos(angulo))
            nuevo_y = centro_y + int(radio * math.sin(angulo))
        elif patron == 'esquina':
            esquina = random.choice([(0, 0), (ancho_collage, 0), (0, alto_collage), (ancho_collage, alto_collage)])
            nuevo_x = esquina[0] + random.randint(-pedazo.width // 2, pedazo.width // 2)  # Reducido a la mitad
            nuevo_y = esquina[1] + random.randint(-pedazo.height // 2, pedazo.height // 2)  # Reducido a la mitad
        else:  # caotico
            nuevo_x = random.randint(-pedazo.width // 2, ancho_collage)  # Reducido
            nuevo_y = random.randint(-pedazo.height // 2, alto_collage)  # Reducido
        
        angulo_rotacion = random.randint(0, 360)
        pedazo_rotado = pedazo.rotate(angulo_rotacion, expand=True)
        pedazo_rotado = verificar_tamaño_seguro(pedazo_rotado, "rotación en duplicación")
        
        # Recortar la imagen si se sale del canvas
        ancho_rotado, alto_rotado = pedazo_rotado.size
        left = max(0, -nuevo_x)
        top = max(0, -nuevo_y)
        right = min(ancho_rotado, ancho_collage - nuevo_x)
        bottom = min(alto_rotado, alto_collage - nuevo_y)
        
        # Verificar si el recorte es válido
        if left < right and top < bottom:
            region_visible = (left, top, right, bottom)
            pedazo_recortado = pedazo_rotado.crop(region_visible)
            
            posicion_final = (max(0, nuevo_x), max(0, nuevo_y))
            resultado.alpha_composite(pedazo_recortado, posicion_final)
    
    return verificar_tamaño_seguro(resultado, "duplicación")

def corromper(imagen):
    datos = np.array(imagen)
    
    # Separar los canales RGB y el canal alfa
    rgb = datos[:,:,:3]
    alfa = datos[:,:,3]
    
    # Generar ruido solo para los canales RGB
    ruido = np.random.normal(0, 45, rgb.shape).astype(np.int16)
    
    # Aplicar el ruido solo a los canales RGB
    rgb_corrompido = np.clip(rgb.astype(np.int16) + ruido, 0, 155).astype(np.uint8)
    
    # Recombinar los canales RGB corrompidos con el canal alfa original
    datos_corrompidos = np.dstack((rgb_corrompido, alfa))
    
    return Image.fromarray(datos_corrompidos)


def distorsionar(imagen):
    """Aplica una distorsión simple a la imagen."""
    imagen = verificar_tamaño_seguro(imagen, "antes de distorsión")


    ancho, alto = imagen.size
    x1 = int(random.uniform(-73.1, 73.1) * ancho)
    y1 = int(random.uniform(-65.1, 65.1) * alto)
    x2 = int(random.uniform(72.9, 76.1) * ancho)
    y2 = int(random.uniform(-77.1, 76.1) * alto)
    x3 = int(random.uniform(72.9, 76.1) * ancho)
    y3 = int(random.uniform(76.9, 71.1) * alto)
    x4 = int(random.uniform(-76.1, 73.1) * ancho)
    y4 = int(random.uniform(72.9, 67.1) * alto)

    coeficientes = find_coeffs(
        [(0, 0), (ancho, 0), (ancho, alto), (0, alto)],
        [(x1, y1), (x2, y2), (x3, y3), (x4, y4)]
    )

    return imagen.transform((ancho, alto), Image.PERSPECTIVE, coeficientes, Image.BICUBIC)

def find_coeffs(pa, pb):
    """Función auxiliar para calcular los coeficientes de la transformación perspectiva."""
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1]*p1[0], -p2[1]*p1[1]])

    A = np.matrix(matrix, dtype=float)
    B = np.array(pb).reshape(8)

    res = np.dot(np.linalg.inv(A.T @ A) @ A.T, B)
    return np.array(res).reshape(8)

def colorear(imagen):
    # Asegurarse de que la imagen esté en modo RGBA
    imagen = imagen.convert('RGBA')
    
    # Generar un color aleatorio con alta transparencia
    color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255), random.randint(10, 50))
    
    # Crear una capa de color del mismo tamaño que la imagen
    capa_color = Image.new('RGBA', imagen.size, color)
    
    # Combinar la imagen original con la capa de color
    imagen_coloreada = Image.blend(imagen, capa_color, 0.3)
    
    # Asegurarse de que la transparencia original se mantenga
    datos_originales = np.array(imagen)
    datos_coloreados = np.array(imagen_coloreada)
    datos_coloreados[..., 3] = datos_originales[..., 3]
    
    return Image.fromarray(datos_coloreados)

# Eliminated dibujar_formas function

# Removed aplicar_formas_en_capas function since it relies on dibujar_formas

def eliminar_rango_colores(imagen, rango_inferior, rango_superior):
    """
    Hace que los colores dentro de un rango dado (en RGB) sean transparentes.
    
    :param imagen: La imagen original en formato RGBA.
    :param rango_inferior: Tupla (R, G, B) que representa el límite inferior del rango de colores a eliminar.
    :param rango_superior: Tupla (R, G, B) que representa el límite superior del rango de colores a eliminar.
    :return: La imagen con los colores en el rango seleccionado eliminados (transparentes).
    """
    # Convertir la imagen a un arreglo numpy
    datos = np.array(imagen)
    
    # Separar los canales de la imagen
    r, g, b, a = datos[:,:,0], datos[:,:,1], datos[:,:,2], datos[:,:,3]
    
    # Crear una máscara para los colores que están dentro del rango
    mascara = ((r >= rango_inferior[0]) & (r <= rango_superior[0]) &
               (g >= rango_inferior[1]) & (g <= rango_superior[1]) &
               (b >= rango_inferior[2]) & (b <= rango_superior[2]))
    
    # Aplicar transparencia a los píxeles que están en el rango
    datos[..., 3][mascara] = 0  # Canal alfa
    
    # Convertir de vuelta a imagen PIL
    return Image.fromarray(datos)

def aplicar_efectos_multiples(imagen, tamaño_collage):
    try:
        # Asegurarse de que la imagen esté en modo RGBA
        imagen = imagen.convert('RGBA')
        
        # Verificar tamaño inicial
        imagen = verificar_tamaño_seguro(imagen, "entrada")

        # Recortar aleatoriamente (siempre se aplica)
        imagen = recortar_aleatorio(imagen, debug=True)  # Reducir logs
        imagen = verificar_tamaño_seguro(imagen, "recorte aleatorio")
        forma_original = imagen.size

        # Aplicar distorsión con un 15% de probabilidad (reducido de 25%)
        if random.random() < 0.15:
            imagen = distorsionar(imagen)
            imagen = imagen.resize(forma_original, Image.LANCZOS)  # Mantener la forma original
            imagen = verificar_tamaño_seguro(imagen, "distorsión")

        # Aplicar corrupción con un 10% de probabilidad (reducido de 20%)
        if random.random() < 0.1:
            imagen = corromper(imagen)

        # Expandir la imagen con un 10% de probabilidad (reducido de 20%)
        if random.random() < 0.1:
            imagen = expandir_imagen(imagen)
            # Recortar de nuevo para mantener la forma no cuadrada
            imagen = imagen.crop((0, 0, min(imagen.width, forma_original[0]), min(imagen.height, forma_original[1])))
            imagen = verificar_tamaño_seguro(imagen, "expansión y recorte")

        # Aplicar colorear con un 10% de probabilidad (reducido de 20%)
        if random.random() < 0.1:
            imagen = colorear(imagen)

        # Aplicar eliminación de rango de colores con un 30% de probabilidad (reducido de 85%)
        if random.random() < 0.3:
            rango_inferior = (random.randint(0, 100), random.randint(0, 100), random.randint(0, 100))
            rango_superior = (random.randint(150, 255), random.randint(150, 255), random.randint(150, 255))
            imagen = eliminar_rango_colores(imagen, rango_inferior, rango_superior)

        # Redimensionar la imagen manteniendo la proporción
        factor_escala = random.uniform(0.2, 0.5)  # Reducido de 0.2-0.7 a 0.2-0.5
        nuevo_ancho = max(20, int(imagen.width * factor_escala))
        nuevo_alto = max(20, int(imagen.height * factor_escala))
        imagen = imagen.resize((nuevo_ancho, nuevo_alto), Image.LANCZOS)
        imagen = verificar_tamaño_seguro(imagen, "redimensionamiento final")

        # Duplicar con un 30% de probabilidad (reducido de 60%)
        if random.random() < 0.3:
            imagen = duplicar(imagen, tamaño_collage)
            imagen = verificar_tamaño_seguro(imagen, "duplicación final")

        return imagen
    except Exception as e:
        print(f"Error en aplicar_efectos_multiples: {str(e)}")
        # En caso de error, devolver una imagen vacía pequeña con fondo transparente
        return Image.new('RGBA', (50, 50), (0, 0, 0, 0))
    
def recortar_seguro(imagen, box):
    left, top, right, bottom = box
    if left >= right or top >= bottom:
        print(f"Advertencia: Intento de recorte inválido. Devolviendo imagen original.")
        return imagen.copy()
    if left < 0 or top < 0 or right > imagen.width or bottom > imagen.height:
        print(f"Advertencia: Coordenadas de recorte fuera de los límites. Ajustando.")
        left = max(0, left)
        top = max(0, top)
        right = min(imagen.width, right)
        bottom = min(imagen.height, bottom)
    return imagen.crop((left, top, right, bottom))


# numero de img y tamaño de lienzo canvas

def generar_collage(imagenes, num_elementos=12):
    tamaño_collage = (1024, 1024)
    collage = Image.new('RGBA', tamaño_collage, (0, 0, 0, 0))
    
    for _ in range(num_elementos):
        try:
            imagen = random.choice(imagenes).copy()
            imagen_procesada = aplicar_efectos_multiples(imagen, tamaño_collage)
            
            if imagen_procesada.width > collage.width or imagen_procesada.height > collage.height:
                imagen_procesada.thumbnail((collage.width, collage.height), Image.LANCZOS)
            
            x = random.randint(0, max(0, collage.width - imagen_procesada.width))
            y = random.randint(0, max(0, collage.height - imagen_procesada.height))
            
            collage.alpha_composite(imagen_procesada, (x, y))
        except Exception as e:
            print(f"Error al procesar una imagen para el collage: {e}")
            continue
    
    # We don't call aplicar_formas_en_capas anymore
    # Just return the collage directly
    return collage

def generar_nombre_archivo_unico(prefijo='collage', extension='.png'):
    tiempo_actual = str(time.time()).encode('utf-8')
    aleatorio = str(random.randint(0, 1000000)).encode('utf-8')
    hash_objeto = hashlib.md5(tiempo_actual + aleatorio)
    hash_str = hash_objeto.hexdigest()[:10]
    return f"{prefijo}_{hash_str}{extension}"


def seleccionar_imagenes_aleatorias(carpeta_raiz, min_imagenes=6, max_imagenes=39, max_profundidad=5):
    formatos_validos = ('.jpg', '.jpeg', '.png', '.bmp', '.gif')
    imagenes = []
    rutas_imagenes = []

    def explorar_carpeta(carpeta, profundidad=0):
        if profundidad > max_profundidad:
            return
        
        try:
            for elemento in os.listdir(carpeta):
                ruta_completa = os.path.join(carpeta, elemento)
                if os.path.isfile(ruta_completa) and elemento.lower().endswith(formatos_validos):
                    rutas_imagenes.append(ruta_completa)
                elif os.path.isdir(ruta_completa):
                    explorar_carpeta(ruta_completa, profundidad + 1)
        except Exception as e:
            print(f"Error al explorar la carpeta {carpeta}: {str(e)}")

    explorar_carpeta(carpeta_raiz)

    if not rutas_imagenes:
        raise ValueError(f"No se encontraron imágenes válidas en la carpeta '{carpeta_raiz}' ni en sus subcarpetas.")

    num_imagenes = min(max_imagenes, len(rutas_imagenes))
    num_imagenes = max(min_imagenes, num_imagenes)

    rutas_seleccionadas = random.sample(rutas_imagenes, num_imagenes)

    for ruta in rutas_seleccionadas:
        try:
            imagen = cargar_imagen(ruta)
            if imagen:
                imagenes.append(imagen)
        except Exception as e:
            print(f"Error al cargar la imagen {ruta}: {str(e)}")

    if not imagenes:
        raise ValueError("No se pudo cargar ninguna imagen válida después de varios intentos.")
    
    return imagenes

def cargar_imagen(ruta):
    try:
        # Intentar primero con el límite desactivado
        Image.MAX_IMAGE_PIXELS = None
        return Image.open(ruta).convert('RGBA')
    except Exception as e:
        print(f"Intento alternativo para cargar '{ruta}': {str(e)}")
        # Si falla, intentar con un método alternativo
        import numpy as np
        import cv2
        img_cv = cv2.imread(ruta, cv2.IMREAD_UNCHANGED)
        if img_cv is None:
            return None
        # Convertir de BGR a RGB y añadir canal alfa si es necesario
        if img_cv.shape[2] == 3:
            img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGBA)
            img_cv = np.dstack((img_cv, np.full(img_cv.shape[:2], 255, dtype=np.uint8)))
        else:
            img_cv = cv2.cvtColor(img_cv, cv2.COLOR_BGRA2RGBA)
        return Image.fromarray(img_cv)

def solicitar_ruta_carpeta():
    while True:
        print("\nIntroduce la ruta de la carpeta raíz con las imágenes.")
        print("Se buscarán imágenes en esta carpeta y en todas sus subcarpetas.")
        print("Ejemplo: C:\\Users\\HP-PC\\Desktop\\Imagenes o /Users/nombre/Desktop/Imagenes")
        carpeta = input("Ruta: ").strip()
        carpeta = os.path.expanduser(carpeta)  # Expande ~ en sistemas Unix
        
        if os.path.isdir(carpeta):
            return carpeta
        else:
            print(f"La carpeta '{carpeta}' no existe o no es accesible. Por favor, intenta de nuevo.")

def rotar_imagen(imagen, angulo):
    """
    Rota una imagen manteniendo su transparencia.
    
    :param imagen: Imagen PIL en formato RGBA
    :param angulo: Ángulo de rotación en grados
    :return: Imagen rotada
    """
    # Usamos el modo de expansión para mantener toda la imagen en el cuadro
    return imagen.rotate(angulo, expand=True, resample=Image.BICUBIC)

def verificar_tamaño_seguro(imagen, operacion):
    # Define un límite más estricto (20 millones de píxeles)
    limite_seguro = 20000000  # Aproximadamente 4472x4472 píxeles
    
    pixels = imagen.width * imagen.height
    if pixels > limite_seguro:
        print(f"⚠️ Imagen demasiado grande ({pixels/1000000:.1f}MP) después de {operacion}. Redimensionando...")
        factor = math.sqrt(limite_seguro / pixels)
        nuevo_ancho = max(1, int(imagen.width * factor))
        nuevo_alto = max(1, int(imagen.height * factor))
        return imagen.resize((nuevo_ancho, nuevo_alto), Image.LANCZOS)
    return imagen

def cambiar_hue(imagen, cambio_hue):
    """
    Cambia el tono (hue) de una imagen manteniendo la transparencia.
    Versión mejorada con manejo más preciso de la transparencia.
    
    :param imagen: Imagen PIL en formato RGBA
    :param cambio_hue: Valor de cambio de hue (0-1)
    :return: Imagen con el hue modificado
    """
    imagen = verificar_tamaño_seguro(imagen, "antes de cambiar hue")

    # Convertir a array numpy
    img_array = np.array(imagen)
    
    # Separar el canal alfa
    alpha = img_array[:, :, 3].copy()
    
    # Crear máscara para píxeles no transparentes (alpha > 0)
    mascara = alpha > 0
    
    # Solo procesar píxeles no transparentes
    if np.any(mascara):
        # Extraer solo los píxeles RGB no transparentes
        rgb_visible = img_array[mascara, :3]
        
        # Convertir a formato HSV
        hsv = np.zeros(rgb_visible.shape, dtype=np.uint8)
        for i, pixel in enumerate(rgb_visible):
            h, s, v = rgb_to_hsv(pixel[0]/255, pixel[1]/255, pixel[2]/255)
            h = (h + cambio_hue) % 1.0
            r, g, b = [int(x * 255) for x in hsv_to_rgb(h, s, v)]
            hsv[i] = [r, g, b]
        
        # Asignar los valores HSV transformados de vuelta a la imagen
        img_array[mascara, :3] = hsv
    
    return Image.fromarray(img_array)

def cambiar_hue_optimizado(imagen, cambio_hue):
    """Versión optimizada del cambio de hue que procesa la imagen en bloques."""
    imagen = verificar_tamaño_seguro(imagen, "antes de cambiar hue")
    
    # Para imágenes pequeñas, usar la implementación original
    if imagen.width * imagen.height < 200000:  # ~450x450 píxeles
        return cambiar_hue(imagen, cambio_hue)
    
    # Para imágenes grandes, dividir en bloques
    ancho, alto = imagen.size
    tam_bloque = 200  # Tamaño del bloque en píxeles
    
    resultado = Image.new('RGBA', imagen.size, (0, 0, 0, 0))
    
    for y in range(0, alto, tam_bloque):
        for x in range(0, ancho, tam_bloque):
            # Calcular dimensiones del bloque actual
            ancho_bloque = min(tam_bloque, ancho - x)
            alto_bloque = min(tam_bloque, alto - y)
            
            # Extraer bloque
            bloque = imagen.crop((x, y, x + ancho_bloque, y + alto_bloque))
            
            # Aplicar cambio de hue al bloque
            bloque_hue = cambiar_hue(bloque, cambio_hue)
            
            # Pegar el bloque procesado en el resultado
            resultado.alpha_composite(bloque_hue, (x, y))
    
    return resultado

def escalar_imagen(imagen, factor_escala):
    """
    Escala una imagen según un factor dado.
    
    :param imagen: Imagen PIL
    :param factor_escala: Factor de escala (1.0 = sin cambios)
    :return: Imagen escalada
    """
    if factor_escala == 1.0:
        return imagen.copy()
    
    nuevo_ancho = max(1, int(imagen.width * factor_escala))
    nuevo_alto = max(1, int(imagen.height * factor_escala))
    return imagen.resize((nuevo_ancho, nuevo_alto), Image.LANCZOS)

def mover_imagen(imagen_origen, posicion_actual, tipo_movimiento, frame, total_frames, canvas_size, parametros_movimiento=None):
    """
    Calcula la nueva posición de una imagen según el tipo de movimiento.
    
    :param imagen_origen: Imagen PIL original
    :param posicion_actual: Tupla (x, y) con la posición actual
    :param tipo_movimiento: Tipo de movimiento ('lineal', 'circular', 'angular', 'random', 'combinado')
    :param frame: Número de frame actual
    :param total_frames: Número total de frames en la animación
    :param canvas_size: Tupla (ancho, alto) del lienzo
    :param parametros_movimiento: Diccionario con parámetros adicionales para el movimiento
    :return: Tupla (nueva_x, nueva_y) con la nueva posición
    """
    x, y = posicion_actual
    ancho_canvas, alto_canvas = canvas_size
    
    # Inicializar parámetros de movimiento si no se proporcionan
    if parametros_movimiento is None:
        parametros_movimiento = {}
    
    velocidad = parametros_movimiento.get('velocidad', random.randint(5, 60))  # Píxeles por frame
    
    if tipo_movimiento == 'lineal':
        # Movimiento en línea recta
        angulo = parametros_movimiento.get('angulo', random.uniform(0, 2 * math.pi))
        delta_x = velocidad * math.cos(angulo)
        delta_y = velocidad * math.sin(angulo)
        nueva_x = x + int(delta_x)
        nueva_y = y + int(delta_y)
        
        # Rebotar en los bordes
        if nueva_x < 0 or nueva_x + imagen_origen.width > ancho_canvas:
            parametros_movimiento['angulo'] = math.pi - angulo
            delta_x = -delta_x
            nueva_x = x + int(delta_x)
        if nueva_y < 0 or nueva_y + imagen_origen.height > alto_canvas:
            parametros_movimiento['angulo'] = 2 * math.pi - angulo
            delta_y = -delta_y
            nueva_y = y + int(delta_y)
            
    elif tipo_movimiento == 'circular':
        # Movimiento en círculo alrededor de un centro
        centro_x = parametros_movimiento.get('centro_x', ancho_canvas // 2)
        centro_y = parametros_movimiento.get('centro_y', alto_canvas // 2)
        radio = parametros_movimiento.get('radio', min(ancho_canvas, alto_canvas) // 4)
        angulo = 2 * math.pi * frame / total_frames
        
        nueva_x = centro_x + int(radio * math.cos(angulo)) - imagen_origen.width // 2
        nueva_y = centro_y + int(radio * math.sin(angulo)) - imagen_origen.height // 2
        
    elif tipo_movimiento == 'angular':
        # Movimiento en zigzag o patrón angular
        periodo = parametros_movimiento.get('periodo', total_frames // 4)
        fase = frame % periodo
        factor = fase / periodo
        
        if frame % (2 * periodo) < periodo:
            factor = fase / periodo
        else:
            factor = 1 - (fase / periodo)
            
        nueva_x = x + int(velocidad * factor * 2 - velocidad)
        nueva_y = y + int(velocidad * (1 - factor) * 2 - velocidad)
        
    elif tipo_movimiento == 'combinado':
        # Combinar varios tipos de movimiento en uno solo
        movimientos = parametros_movimiento.get('movimientos', ['lineal', 'circular'])
        pesos = parametros_movimiento.get('pesos', [0.5, 0.5])
        
        nueva_x, nueva_y = 0, 0
        peso_total = sum(pesos)
        
        for i, mov in enumerate(movimientos):
            peso_relativo = pesos[i] / peso_total
            
            # Calcular movimiento individual
            params_temp = parametros_movimiento.copy()
            pos_temp = mover_imagen(imagen_origen, posicion_actual, mov, frame, total_frames, canvas_size, params_temp)
            
            # Aplicar el peso a este movimiento
            nueva_x += pos_temp[0] * peso_relativo
            nueva_y += pos_temp[1] * peso_relativo
        
        nueva_x, nueva_y = int(nueva_x), int(nueva_y)
        
    else:  # random
        # Movimiento aleatorio
        nueva_x = x + random.randint(-velocidad, velocidad)
        nueva_y = y + random.randint(-velocidad, velocidad)
        
    # Asegurar que la imagen no se salga del canvas
    nueva_x = max(0, min(nueva_x, ancho_canvas - imagen_origen.width))
    nueva_y = max(0, min(nueva_y, alto_canvas - imagen_origen.height))
    
    return (nueva_x, nueva_y)

def generar_frames_animacion(imagenes_base, num_frames=15, tamaño_canvas=(1024, 1024), num_elementos=7, num_elementos_estaticos=0):
    """
    Genera una serie de frames para una animación GIF con cambios de hue dinámicos.
    
    :param imagenes_base: Lista de imágenes PIL para usar en el collage
    :param num_frames: Número de frames para la animación
    :param tamaño_canvas: Tamaño del lienzo (ancho, alto)
    :param num_elementos: Número de elementos a incluir en el collage animado
    :param num_elementos_estaticos: Número de elementos estáticos a incluir
    :return: Lista de imágenes PIL (frames)
    """
    frames = []
    
    # Asegurarse de que tenemos suficientes imágenes
    total_elementos = min(num_elementos + num_elementos_estaticos, len(imagenes_base))
    num_elementos = min(num_elementos, total_elementos)
    num_elementos_estaticos = total_elementos - num_elementos
    
    # Seleccionar aleatoriamente las imágenes para animar y las estáticas
    imagenes_seleccionadas = random.sample(imagenes_base, total_elementos)
    imagenes_animadas = imagenes_seleccionadas[:num_elementos]
    imagenes_estaticas = imagenes_seleccionadas[num_elementos:]
    
    # Determinar el modo de acumulación de frames
    probabilidad = random.random()
    if probabilidad < 0.2:
        modo_acumulacion = "no_acumular"
        print("Modo: No se acumulan frames anteriores")
    elif probabilidad < 0.4:
        modo_acumulacion = "borrar_periodico"
        frecuencia_borrado = random.randint(8, 12)
        print(f"Modo: Borrado periódico cada {frecuencia_borrado} frames")
    else:
        modo_acumulacion = "acumular_todo"
        print("Modo: Acumulación completa de frames")
    
    # Procesar elementos estáticos
    elementos_estaticos = []
    for img in imagenes_estaticas:
        img_procesada = aplicar_efectos_multiples(img, tamaño_canvas)
        
        if img_procesada.width > tamaño_canvas[0] or img_procesada.height > tamaño_canvas[1]:
            img_procesada.thumbnail(tamaño_canvas, Image.LANCZOS)
        
        # Posición fija aleatoria
        x = random.randint(0, max(0, tamaño_canvas[0] - img_procesada.width))
        y = random.randint(0, max(0, tamaño_canvas[1] - img_procesada.height))
        
        elementos_estaticos.append({
            'imagen': img_procesada,
            'posicion': (x, y)
        })
    
    # Procesar cada imagen seleccionada para animación
    elementos_animados = []
    for img in imagenes_animadas:
        img_procesada = aplicar_efectos_multiples(img, tamaño_canvas)
        
        if img_procesada.width > tamaño_canvas[0] or img_procesada.height > tamaño_canvas[1]:
            img_procesada.thumbnail(tamaño_canvas, Image.LANCZOS)
        
        # Posición inicial aleatoria
        x = random.randint(0, max(0, tamaño_canvas[0] - img_procesada.width))
        y = random.randint(0, max(0, tamaño_canvas[1] - img_procesada.height))
        
        # Determinar movimiento
        usar_combinado = random.random() < 0.4
        if usar_combinado:
            movimientos_disponibles = ['lineal', 'circular', 'angular', 'random']
            num_movimientos = random.randint(2, 3)
            movimientos = random.sample(movimientos_disponibles, num_movimientos)
            pesos = [random.uniform(0.1, 1.0) for _ in range(num_movimientos)]
            
            tipo_movimiento = 'combinado'
            parametros_movimiento = {
                'movimientos': movimientos,
                'pesos': pesos
            }
        else:
            tipo_movimiento = random.choice(['lineal', 'circular', 'angular', 'random'])
            parametros_movimiento = {}
        
        # MEJORA: Determinar si este elemento usará cambio de hue dinámico
        aplicar_hue = random.random() < 0.6  # Aumentamos la probabilidad a 60%
        hue_dinamico = random.random() < 0.6  # 60% de probabilidad de que el hue sea dinámico
        
        # NUEVO: Determinar frame donde comienza el cambio de hue y su duración
        frame_inicio_hue = 0
        duracion_hue = 0
        if hue_dinamico:
            # Elegir un frame aleatorio en cualquier momento del GIF para iniciar el cambio
            frame_inicio_hue = random.randint(0, num_frames - 10)  # Garantiza al menos 10 frames restantes
            # Determinar duración aleatoria entre 10 y 33 frames (o hasta el final del GIF)
            max_duracion = min(27, num_frames - frame_inicio_hue)
            duracion_hue = random.randint(10, max_duracion)
        
        # NUEVA CARACTERÍSTICA: Determinar si el elemento tendrá un recorte abstracto durante la animación
        aplicar_recorte_abstracto = random.random() < 0.3  # 30% de probabilidad
        frame_inicio_recorte = 0
        duracion_recorte = 0
        if aplicar_recorte_abstracto:
            # Elegir un frame aleatorio para iniciar el recorte abstracto
            frame_inicio_recorte = random.randint(0, num_frames - 15)  # Garantiza al menos 15 frames restantes
            # Duración del recorte entre 5 y 14 frames
            duracion_recorte = random.randint(5, 14)
            print(f"Elemento con recorte abstracto desde frame {frame_inicio_recorte} hasta {frame_inicio_recorte + duracion_recorte}")
        
        elementos_animados.append({
            'imagen': img_procesada,
            'imagen_original': img,  # Guardar la imagen original para poder recortarla de nuevo
            'posicion': (x, y),
            'movimiento': tipo_movimiento,
            'parametros_movimiento': parametros_movimiento,
            'factor_escala': 1.0,
            'cambio_hue': 0.0,
            'velocidad_hue': random.uniform(0.02, 0.08) if aplicar_hue else 0,
            'aplicar_hue': aplicar_hue,
            'hue_dinamico': hue_dinamico,
            'frame_inicio_hue': frame_inicio_hue,
            'duracion_hue': duracion_hue,
            'velocidad_escala': random.uniform(0.01, 0.1),
            'direccion_escala': 1,
            'angulo_rotacion': 0,
            'velocidad_rotacion': random.uniform(-5, 5),
            'historial_posiciones': [],
            'aplicar_recorte_abstracto': aplicar_recorte_abstracto,
            'frame_inicio_recorte': frame_inicio_recorte,
            'duracion_recorte': duracion_recorte,
            'recorte_aplicado': False,  # Flag para indicar si ya se aplicó el recorte
            'imagen_recortada': None    # Para almacenar la imagen recortada
        })
    
    # NUEVO: Configuración para cambios de hue global
    elementos_para_hue_global = []
    frames_hue_global = {}  # Diccionario para almacenar frames de inicio y duración por elemento
    
    for i, elem in enumerate(elementos_animados):
        if random.random() < 0.4:  # 40% de probabilidad de que un elemento tenga hue global
            elementos_para_hue_global.append(i)
            
            # Determinar cuándo aplicar el cambio de hue global para este elemento
            frame_inicio = random.randint(0, num_frames - 15)  # Garantizar al menos 15 frames restantes
            duracion = random.randint(10, min(33, num_frames - frame_inicio))
            valor_hue = random.uniform(0.1, 0.9)
            
            frames_hue_global[i] = {
                'inicio': frame_inicio,
                'duracion': duracion,
                'fin': frame_inicio + duracion,
                'hue_inicial': random.uniform(0, 1.0),  # Valor inicial aleatorio 
                'velocidad_hue': 1.0 / duracion,  # Para completar un ciclo en la duración
                'aplicado': False
            }
            
            print(f"El elemento {i} tendrá cambio de hue global desde frame {frame_inicio} hasta {frame_inicio + duracion}")
    
    # NUEVO: Determinar modo de superposición de elementos estáticos y animados
    modo_superposicion = random.choice([
        "estaticos_arriba",    # Elementos estáticos siempre encima de los animados
        "estaticos_abajo",     # Elementos estáticos siempre debajo de los animados
        "alternado_por_frame", # Alternar el orden de superposición en cada frame
        "alternado_periodico", # Cambiar el orden cada cierto número de frames
        "mezclado_aleatorio"   # Mezclar todos los elementos aleatoriamente
    ])
    
    print(f"Modo de superposición: {modo_superposicion}")
    
    # Para modo periódico, definir período de cambio
    periodo_cambio_superposicion = random.randint(3, 8)
    
    # Para modo mezclado, asignar un z-index a cada elemento
    z_indices_estaticos = []
    for i in range(len(elementos_estaticos)):
        z_indices_estaticos.append({
            'indice': i,
            'z_index': random.randint(0, 100)
        })
    
    z_indices_animados = []
    for i in range(len(elementos_animados)):
        z_indices_animados.append({
            'indice': i,
            'z_index': random.randint(0, 100)
        })
    
    # MODIFICADO: Limitar la animación de elementos estáticos a solo 1 o 2 elementos
    estaticos_se_animan = random.random() < 0.0  # 20% de probabilidad
    estaticos_animados = []

    if estaticos_se_animan and elementos_estaticos:
        # Determinar cuántos elementos estáticos se animarán (1 o 2 como máximo)
        num_estaticos_a_animar = min(len(elementos_estaticos), random.randint(1, 2))
        
        # Seleccionar aleatoriamente los índices de los elementos a animar
        indices_a_animar = random.sample(range(len(elementos_estaticos)), num_estaticos_a_animar)
        
        # Para cada elemento estático seleccionado, definir cuándo comenzará a animarse
        for i in indices_a_animar:
            # Definir un frame aleatorio para comenzar la animación (asegurando que queden suficientes frames)
            frame_inicio_animacion = random.randint(5, num_frames - 10)
            
            # Agregar propiedades de animación al elemento estático
            elementos_estaticos[i]['comenzar_animacion'] = True
            elementos_estaticos[i]['frame_inicio_animacion'] = frame_inicio_animacion
            elementos_estaticos[i]['movimiento'] = random.choice(['lineal', 'circular', 'random'])  # Evitamos 'angular' que puede ser más complejo
            elementos_estaticos[i]['parametros_movimiento'] = {}
            elementos_estaticos[i]['factor_escala'] = 1.0
            elementos_estaticos[i]['velocidad_escala'] = random.uniform(0.01, 0.03)  # Reducimos la velocidad
            elementos_estaticos[i]['direccion_escala'] = 1
            elementos_estaticos[i]['angulo_rotacion'] = 0
            elementos_estaticos[i]['velocidad_rotacion'] = random.uniform(-2, 2)  # Reducimos la velocidad
            
            # Lo agregamos a la lista de los que se animan para llevar un registro
            estaticos_animados.append(i)
            
            print(f"Elemento estático {i} comenzará a animarse en el frame {frame_inicio_animacion}")

    # Determinar si los elementos animados se volverán estáticos en algún momento
    animados_se_detienen = random.random() < 0.1  # 10% de probabilidad

    if animados_se_detienen:
        # Para cada elemento animado, definir cuándo se volverá estático
        num_a_detener = min(len(elementos_animados), random.randint(1, 2))  # Limitar a 1 o 2 elementos
        indices_a_detener = random.sample(range(len(elementos_animados)), num_a_detener)
        
        for i in indices_a_detener:
            # Definir un frame aleatorio para detenerse (asegurando que haya suficiente animación antes)
            frame_detencion = random.randint(10, num_frames - 5)
            
            # Agregar propiedad de detención al elemento animado
            elementos_animados[i]['detener_animacion'] = True
            elementos_animados[i]['frame_detencion'] = frame_detencion
            
            print(f"Elemento animado {i} se volverá estático en el frame {frame_detencion}")

    # Crear canvas base (vacío, ya que ahora el orden de dibujo puede variar)
    canvas_estatico = Image.new('RGBA', tamaño_canvas, (0, 0, 0, 0))
    
    # Canvas acumulativo
    canvas_acumulativo = canvas_estatico.copy()
    
    # Historial de frames para el modo de borrado periódico
    historial_frames = []
    
    # NUEVO: Historial para cambio de hue global
    historial_global = []
    
    # Generar cada frame
    for frame_num in range(num_frames):
        print(f"Generando frame {frame_num + 1}/{num_frames}")
        
        # Limpiar memoria cada 10 frames
        if frame_num % 10 == 0:
            limpiar_memoria()
            
        # Crear un nuevo canvas según el modo de acumulación
        if modo_acumulacion == "no_acumular":
            frame_actual = Image.new('RGBA', tamaño_canvas, (0, 0, 0, 0))
        elif modo_acumulacion == "borrar_periodico" and frame_num % frecuencia_borrado == 0 and frame_num > 0:
            canvas_acumulativo = Image.new('RGBA', tamaño_canvas, (0, 0, 0, 0))
            frame_actual = canvas_acumulativo
        else:
            frame_actual = canvas_acumulativo.copy()
        
        # Almacenar posiciones para el modo de borrado periódico
        if modo_acumulacion == "borrar_periodico":
            historial_frames.append([])
        
        # NUEVO: Determinar orden de dibujo para este frame
        estaticos_primero = True  # Valor por defecto
        
        if modo_superposicion == "estaticos_arriba":
            estaticos_primero = False
        elif modo_superposicion == "estaticos_abajo":
            estaticos_primero = True
        elif modo_superposicion == "alternado_por_frame":
            estaticos_primero = (frame_num % 2 == 0)
        elif modo_superposicion == "alternado_periodico":
            estaticos_primero = (frame_num // periodo_cambio_superposicion) % 2 == 0
        # El modo mezclado_aleatorio se maneja diferente

        # MODIFICADO: Primero, manejar elementos estáticos que se animan
        if estaticos_se_animan and estaticos_animados:
            for i in estaticos_animados:
                elem = elementos_estaticos[i]
                if frame_num >= elem['frame_inicio_animacion']:
                    try:
                        # Este elemento estático ahora se anima
                        imagen_actual = elem['imagen']
                        
                        # Rotar la imagen si corresponde
                        if 'angulo_rotacion' in elem:
                            elem['angulo_rotacion'] = (elem['angulo_rotacion'] + elem['velocidad_rotacion']) % 360
                            imagen_actual = rotar_imagen(imagen_actual, elem['angulo_rotacion'])
                        
                        # Escalar la imagen si corresponde
                        if 'factor_escala' in elem:
                            elem['factor_escala'] += elem['velocidad_escala'] * elem['direccion_escala']
                            # Limitar el factor de escala para evitar valores extremos
                            if elem['factor_escala'] > 1.3:
                                elem['direccion_escala'] = -1
                            elif elem['factor_escala'] < 0.8:
                                elem['direccion_escala'] = 1
                            
                            imagen_actual = escalar_imagen(imagen_actual, elem['factor_escala'])
                        
                        # Mover la imagen según el tipo de movimiento
                        if 'movimiento' in elem:
                            nueva_pos = mover_imagen(
                                imagen_actual, 
                                elem['posicion'], 
                                elem['movimiento'], 
                                frame_num - elem['frame_inicio_animacion'], # Tiempo relativo desde que comenzó a moverse
                                num_frames, 
                                tamaño_canvas,
                                elem['parametros_movimiento']
                            )
                            elem['posicion'] = nueva_pos
                        
                        # Actualizar la imagen del elemento
                        elem['imagen'] = imagen_actual
                    except Exception as e:
                        print(f"Error al animar elemento estático {i}: {e}")
                        # Si ocurre un error, simplemente lo mantenemos estático
                        pass

        # Actualizar cada elemento animado
        elementos_actualizados = []
        for i, elem in enumerate(elementos_animados):
            try:
                # Verificar si este elemento se ha detenido
                if elem.get('detener_animacion') and frame_num >= elem.get('frame_detencion', float('inf')):
                    # Este elemento ya no se anima, simplemente lo agregamos a la lista para dibujar
                    if modo_superposicion == "mezclado_aleatorio":
                        elementos_actualizados.append({
                            'imagen': elem['imagen'],
                            'posicion': elem['posicion'],
                            'z_index': z_indices_animados[i]['z_index']
                        })
                    elif estaticos_primero:
                        frame_actual.alpha_composite(elem['imagen'], elem['posicion'])
                    continue
                
                # NUEVA CARACTERÍSTICA: Verificar si hay que aplicar el recorte abstracto
                if elem['aplicar_recorte_abstracto']:
                    frame_fin_recorte = elem['frame_inicio_recorte'] + elem['duracion_recorte']
                    
                    # Verificar si estamos en el primer frame del recorte abstracto
                    if frame_num == elem['frame_inicio_recorte']:
                        print(f"Aplicando recorte abstracto al elemento {i} en frame {frame_num}")
                        # Aplicar recorte abstracto específicamente con forma 'abstracta'
                        imagen_original = elem['imagen_original'].copy()
                        
                        # Procesar la imagen original de nuevo, pero forzando el recorte abstracto
                        # Primero aplicamos solo el recorte con forma abstracta
                        imagen_recortada = recortar_aleatorio(imagen_original, debug=False, forma_forzada='abstracta')
                        
                        # Después aplicamos el resto de efectos normalmente
                        imagen_procesada = aplicar_efectos_multiples(imagen_recortada, tamaño_canvas)
                        
                        # Guardar la imagen recortada
                        elem['imagen_recortada'] = imagen_procesada
                        elem['recorte_aplicado'] = True
                    
                    # Usar la imagen recortada durante el período de duración
                    if frame_num >= elem['frame_inicio_recorte'] and frame_num < frame_fin_recorte:
                        # Crear un NUEVO recorte cada vez
                        imagen_original = elem['imagen_original'].copy()
                        imagen_recortada = recortar_aleatorio(imagen_original, debug=False, forma_forzada='abstracta')
                        imagen_actual = aplicar_efectos_multiples(imagen_recortada, tamaño_canvas)
                    else:
                        # Usar la imagen normal fuera del período de recorte
                        imagen_actual = elem['imagen']
                else:
                    # Imagen base normal para las transformaciones
                    imagen_actual = elem['imagen']
                
                # 1. Cambiar el hue (con la mejora para cambio dinámico con duración limitada)
                if elem['aplicar_hue']:
                    if not elem['hue_dinamico']:
                        # Para elementos con hue constante, aplicar siempre
                        elem['cambio_hue'] = (elem['cambio_hue'] + elem['velocidad_hue']) % 1.0
                        imagen_actual = cambiar_hue(imagen_actual, elem['cambio_hue'])
                    elif elem['hue_dinamico']:
                        # Para elementos con hue dinámico, verificar si estamos en el rango de frames para aplicar
                        frame_fin_hue = elem['frame_inicio_hue'] + elem['duracion_hue']
                        if frame_num >= elem['frame_inicio_hue'] and frame_num < frame_fin_hue:
                            # Aplicar cambio de hue solo durante la duración especificada
                            elem['cambio_hue'] = (elem['cambio_hue'] + elem['velocidad_hue']) % 1.0
                            imagen_actual = cambiar_hue(imagen_actual, elem['cambio_hue'])
                
                # 2. Cambiar escala
                elem['factor_escala'] += elem['velocidad_escala'] * elem['direccion_escala']
                if elem['factor_escala'] > 2.5:
                    elem['direccion_escala'] = -1
                elif elem['factor_escala'] < 0.2:
                    elem['direccion_escala'] = 1
                
                imagen_actual = escalar_imagen(imagen_actual, elem['factor_escala'])
                
                # 3. Rotar la imagen
                elem['angulo_rotacion'] = (elem['angulo_rotacion'] + elem['velocidad_rotacion']) % 360
                imagen_actual = rotar_imagen(imagen_actual, elem['angulo_rotacion'])
                
                # 4. Mover a nueva posición
                nueva_pos = mover_imagen(
                    imagen_actual, 
                    elem['posicion'], 
                    elem['movimiento'], 
                    frame_num, 
                    num_frames, 
                    tamaño_canvas,
                    elem['parametros_movimiento']
                )
                elem['posicion'] = nueva_pos
                
                # NUEVO: Guardar historial de posiciones para hue global
                if i in elementos_para_hue_global:
                    elem['historial_posiciones'].append((imagen_actual.copy(), nueva_pos))
                    # Limitar el tamaño del historial
                    if len(elem['historial_posiciones']) > MAX_HISTORIAL_POSICIONES:
                        elem['historial_posiciones'] = elem['historial_posiciones'][-MAX_HISTORIAL_POSICIONES:]
                
                # Guardar posición e imagen para el historial
                if modo_acumulacion == "borrar_periodico":
                    historial_frames[-1].append((imagen_actual, nueva_pos))
                
                # 5. En modo mezclado_aleatorio, guardamos el elemento para dibujarlo después
                # En otros modos, lo dibujamos ahora solo si los animados van primero
                if modo_superposicion == "mezclado_aleatorio":
                    elementos_actualizados.append({
                        'imagen': imagen_actual,
                        'posicion': nueva_pos,
                        'z_index': z_indices_animados[i]['z_index']
                    })
                elif estaticos_primero:
                    frame_actual.alpha_composite(imagen_actual, nueva_pos)
            except Exception as e:
                print(f"Error al procesar elemento animado {i}: {e}")
                continue
        
        # NUEVO: Dibujar elementos estáticos
        if modo_superposicion == "mezclado_aleatorio":
            # Añadir elementos estáticos a la lista de elementos a dibujar
            for i, elem in enumerate(elementos_estaticos):
                elementos_actualizados.append({
                    'imagen': elem['imagen'],
                    'posicion': elem['posicion'],
                    'z_index': z_indices_estaticos[i]['z_index']
                })
                
            # Ordenar todos los elementos por z-index y dibujarlos
            elementos_actualizados.sort(key=lambda x: x['z_index'])
            for elem in elementos_actualizados:
                frame_actual.alpha_composite(elem['imagen'], elem['posicion'])
        else:
            # En modos no mezclados, dibujar elementos estáticos según el orden determinado
            if not estaticos_primero:
                for elem in elementos_estaticos:
                    frame_actual.alpha_composite(elem['imagen'], elem['posicion'])
        
        # NUEVO: Verificar si algún elemento necesita cambio de hue global en este frame
        for idx in elementos_para_hue_global:
            info_hue = frames_hue_global.get(idx)
            
            if info_hue and frame_num >= info_hue['inicio'] and frame_num < info_hue['fin']:
                try:
                    # Calculamos el hue progresivo para este frame
                    frames_transcurridos = frame_num - info_hue['inicio']
                    hue_actual = (info_hue['hue_inicial'] + (frames_transcurridos * info_hue['velocidad_hue'])) % 1.0
                    
                    if len(elementos_animados[idx]['historial_posiciones']) > 0:
                        canvas_elemento = Image.new('RGBA', tamaño_canvas, (0, 0, 0, 0))
                        
                        # Limitar a los últimos elementos del historial
                        historial_limitado = elementos_animados[idx]['historial_posiciones'][-MAX_HISTORIAL_POSICIONES:]
                        for img_hist, pos_hist in historial_limitado:
                            canvas_elemento.alpha_composite(img_hist, pos_hist)
                        
                        # Aplicar el hue progresivo
                        canvas_elemento_hue = cambiar_hue(canvas_elemento, hue_actual)
                        canvas_elemento_hue = verificar_tamaño_seguro(canvas_elemento_hue, "hue global")
                        
                        frame_actual = Image.alpha_composite(frame_actual, canvas_elemento_hue)
                except Exception as e:
                    print(f"Error en hue global para elemento {idx}: {e}")

        if modo_acumulacion != "no_acumular":
            canvas_acumulativo = frame_actual.copy()
            canvas_acumulativo = verificar_tamaño_seguro(canvas_acumulativo, "acumulación de frames")

        # Y justo antes de añadir el frame a la lista:
        frame_actual = verificar_tamaño_seguro(frame_actual, "frame final") 
                
        # Añadir frame a la lista de frames
        frames.append(frame_actual)
    
    return frames

def cambiar_hue_capa_completa(canvas, indice_elemento, historial_posiciones, valor_hue):
    """
    Cambia el hue de todas las instancias acumuladas de un elemento específico.
    
    :param canvas: Canvas base sobre el que aplicar el cambio
    :param indice_elemento: Índice del elemento a afectar
    :param historial_posiciones: Historial de posiciones del elemento
    :param valor_hue: Valor de hue a aplicar (0-1)
    :return: Canvas con el hue cambiado para el elemento específico
    """
    # Crear una capa separada solo para el elemento
    capa_elemento = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    
    # Dibujar todas las instancias del elemento en esta capa
    for img, pos in historial_posiciones:
        capa_elemento.alpha_composite(img, pos)
    
    # Cambiar el hue de toda la capa
    capa_con_hue = cambiar_hue(capa_elemento, valor_hue)
    
    # Extraer la máscara alpha de la capa original
    _, _, _, alpha = capa_elemento.split()
    
    # Combinar la capa con el canvas original
    resultado = Image.alpha_composite(canvas, capa_con_hue)
    
    return resultado

def generar_gif_animado(imagenes, ruta_salida=None, num_frames=15, duracion_frame=100, num_elementos=7, num_elementos_estaticos=0):
    """
    Genera un GIF animado a partir de imágenes procesadas.
    
    :param imagenes: Lista de imágenes PIL para usar
    :param ruta_salida: Ruta donde guardar el GIF generado (si es None, se genera un nombre)
    :param num_frames: Número de frames para la animación
    :param duracion_frame: Duración de cada frame en milisegundos
    :param num_elementos: Número de elementos a incluir en la animación
    :param num_elementos_estaticos: Número de elementos estáticos a incluir
    :return: Ruta del archivo GIF generado
    """
    if ruta_salida is None:
        ruta_salida = generar_nombre_archivo_unico(prefijo='animacion', extension='.gif')
    # tamaño del canvas 
    tamaño_canvas = (612, 432)
    
    # Generar los frames de la animación con la función mejorada
    frames = generar_frames_animacion(
        imagenes, 
        num_frames=num_frames, 
        tamaño_canvas=tamaño_canvas,
        num_elementos=num_elementos,
        num_elementos_estaticos=num_elementos_estaticos
    )
    
    # Guardar como GIF animado
    frames[0].save(
        ruta_salida,
        save_all=True,
        append_images=frames[1:],
        optimize=False,  # False para mantener la calidad
        duration=duracion_frame,
        loop=0  # 0 = loop infinito
    )
    
    return ruta_salida

# Función para generar animación GIF con parámetros específicos
def generar_animacion_con_parametros(imagenes, num_frames, duracion_frame, num_elementos, num_elementos_estaticos):
    try:
        # Asegurar que no intentamos usar más elementos que imágenes disponibles
        total_elementos_necesarios = num_elementos + num_elementos_estaticos
        imagenes_disponibles = len(imagenes)
        
        if total_elementos_necesarios > imagenes_disponibles:
            print(f"Advertencia: No hay suficientes imágenes. Ajustando parámetros...")
            # Ajustar parámetros para usar las imágenes disponibles
            if imagenes_disponibles <= 2:
                # Si hay muy pocas imágenes, usar todas para elementos animados
                num_elementos = imagenes_disponibles
                num_elementos_estaticos = 0
            else:
                # Mantener al menos un elemento estático si es posible
                num_elementos = max(1, imagenes_disponibles - 1)
                num_elementos_estaticos = imagenes_disponibles - num_elementos
            
            print(f"Nuevos parámetros: {num_elementos} elementos animados, {num_elementos_estaticos} elementos estáticos")
        
        # Generar animación GIF
        try:
            print("Iniciando generación de GIF...")
            ruta_gif = generar_gif_animado(
                imagenes, 
                num_frames=num_frames, 
                duracion_frame=duracion_frame,
                num_elementos=num_elementos,
                num_elementos_estaticos=num_elementos_estaticos
            )
            print(f"Animación GIF generada y guardada como '{ruta_gif}'")
            
            # Preguntar si quiere generar otra animación con los mismos parámetros
            repetir = input("\n¿Quieres generar otra animación con los mismos parámetros? (s/n): ").strip().lower()
            if repetir == 's' or repetir == 'si':
                return True
            return False
            
        except MemoryError:
            print("Error de memoria al generar el GIF. Intentando con menos frames y elementos...")
            # Intentar de nuevo con menos frames y elementos
            num_frames = max(10, num_frames // 2)
            num_elementos = max(1, num_elementos - 1)
            num_elementos_estaticos = max(0, num_elementos_estaticos - 1)
            
            print(f"Reintentando con {num_frames} frames, {num_elementos} elementos animados, {num_elementos_estaticos} elementos estáticos")
            
            ruta_gif = generar_gif_animado(
                imagenes, 
                num_frames=num_frames, 
                duracion_frame=duracion_frame,
                num_elementos=num_elementos,
                num_elementos_estaticos=num_elementos_estaticos
            )
            print(f"Animación GIF generada y guardada como '{ruta_gif}'")
            
            repetir = input("\n¿Quieres generar otra animación con los mismos parámetros? (s/n): ").strip().lower()
            if repetir == 's' or repetir == 'si':
                return True
            return False
            
    except Exception as e:
        print(f"Error al generar la animación: {str(e)}")
        print("Intentando con parámetros más conservadores...")
        
        try:
            # Parámetros más conservadores
            num_frames = 10
            duracion_frame = 100
            num_elementos = min(3, len(imagenes))
            num_elementos_estaticos = min(1, max(0, len(imagenes) - num_elementos))
            
            print(f"Reintentando con parámetros conservadores: {num_frames} frames, {num_elementos} elementos animados, {num_elementos_estaticos} elementos estáticos")
            
            ruta_gif = generar_gif_animado(
                imagenes, 
                num_frames=num_frames, 
                duracion_frame=duracion_frame,
                num_elementos=num_elementos,
                num_elementos_estaticos=num_elementos_estaticos
            )
            print(f"Animación GIF generada y guardada como '{ruta_gif}'")
            return True
        except Exception as e2:
            print(f"Error final al generar la animación: {str(e2)}")
            return False

# Uso principal
# Modificación para main() en collageanim4.py
def main():
    try:
        carpeta_imagenes = solicitar_ruta_carpeta()
        imagenes_originales = seleccionar_imagenes_aleatorias(carpeta_imagenes)
        print(f"Se seleccionaron {len(imagenes_originales)} imágenes aleatorias de la carpeta y sus subcarpetas.")

        # Menú principal ampliado con opción de memepaint
        print("\n¿Qué deseas generar?")
        print("1. Collage estático (PNG)")
        print("2. Animación GIF normal")
        print("3. Animación GIF con MemePaint")
        print("4. Animación GIF con inserción simple de imágenes")
        opcion = input("Selecciona una opción (1, 2, 3 o 4): ").strip()
                
        if opcion == "1":
            # Generar collage estático
            collage = generar_collage(imagenes_originales)
            nombre_archivo = generar_nombre_archivo_unico()
            collage.save(nombre_archivo)
            print(f"Collage generado y guardado como '{nombre_archivo}'")
        
        elif opcion == "2":
            # Configurar parámetros de la animación normal
            print("\nConfiguración de la animación:")
            try:
                num_frames = int(input("Número de frames (10-120, por defecto 15): ").strip() or "15")
                num_frames = max(10, min(120, num_frames))
                
                duracion_frame = int(input("Duración de cada frame en ms (50-200, por defecto 100): ").strip() or "100")
                duracion_frame = max(50, min(200, duracion_frame))
                
                num_elementos = int(input("Número de elementos animados (1-24, por defecto 5): ").strip() or "5")
                num_elementos = max(1, min(24, num_elementos))
                
                num_elementos_estaticos = int(input("Número de elementos estáticos (0-15, por defecto 2): ").strip() or "2")
                num_elementos_estaticos = max(0, min(15, num_elementos_estaticos))
            except ValueError:
                print("Valor no válido, se usarán los valores por defecto.")
                num_frames = 15
                duracion_frame = 100
                num_elementos = 5
                num_elementos_estaticos = 2
            
            # Ciclo para generar múltiples animaciones con los mismos parámetros si el usuario lo desea
            seguir_generando = True
            while seguir_generando:
                # Seleccionar nuevas imágenes aleatorias de la lista original para cada iteración
                imagenes = random.sample(imagenes_originales, min(len(imagenes_originales), num_elementos + num_elementos_estaticos))
                
                seguir_generando = generar_animacion_con_parametros(
                    imagenes, 
                    num_frames, 
                    duracion_frame, 
                    num_elementos, 
                    num_elementos_estaticos
                )
        
        elif opcion == "4":
            # Nueva opción: Simple Image Insertion (versión simplificada de MemePaint)
            try:
                # Importar el módulo SimpleMeme
                try:
                    import simplememepaint
                except ImportError:
                    print("No se encontró el módulo simplememepaint. Asegúrate de que simplememepaint.py esté en el mismo directorio.")
                    return
                
                print("\nConfiguración de la animación con inserción de imágenes:")
                
                num_frames = int(input("Número de frames (15-120, por defecto 25): ").strip() or "25")
                num_frames = max(15, min(120, num_frames))
                
                duracion_frame = int(input("Duración de cada frame en ms (50-200, por defecto 100): ").strip() or "100")
                duracion_frame = max(50, min(200, duracion_frame))
                
                num_elementos = int(input("Número de elementos animados base (1-20, por defecto 4): ").strip() or "4")
                num_elementos = max(1, min(20, num_elementos))
                
                num_elementos_estaticos = int(input("Número de elementos estáticos base (0-10, por defecto 2): ").strip() or "2")
                num_elementos_estaticos = max(0, min(10, num_elementos_estaticos))
                
                num_nuevas = int(input("Número de nuevas imágenes a insertar (1-3, por defecto 2): ").strip() or "2")
                num_nuevas = max(1, min(3, num_nuevas))
                
                carpeta_nuevas_separada = input("¿Quieres usar otra carpeta para las nuevas imágenes? (s/n, por defecto n): ").strip().lower()
                
                carpeta_nuevas = None
                if carpeta_nuevas_separada == 's' or carpeta_nuevas_separada == 'si':
                    print("\nSelecciona la carpeta para las nuevas imágenes:")
                    carpeta_nuevas = solicitar_ruta_carpeta()
                
                # Asegurarse de tener suficientes imágenes
                if len(imagenes_originales) < num_elementos + num_elementos_estaticos + num_nuevas:
                    print(f"Advertencia: No hay suficientes imágenes. Se ajustarán los parámetros.")
                    total_necesarias = num_elementos + num_elementos_estaticos + num_nuevas
                    factor = len(imagenes_originales) / total_necesarias
                    num_elementos = max(1, int(num_elementos * factor))
                    num_elementos_estaticos = max(0, int(num_elementos_estaticos * factor))
                    num_nuevas = max(1, len(imagenes_originales) - num_elementos - num_elementos_estaticos)
                    print(f"Nuevos parámetros: {num_elementos} animados, {num_elementos_estaticos} estáticos, {num_nuevas} nuevas imágenes")
                
                # Ejecutar la generación de la animación con nuevas imágenes
                seguir_generando = True
                while seguir_generando:
                    try:
                        print("\nGenerando animación con inserción de imágenes...")
                        
                        # Generar la animación
                        ruta_gif = simplememepaint.main_simplememepaint(
                            carpeta_imagenes,
                            carpeta_nuevas,
                            num_frames=num_frames,
                            duracion_frame=duracion_frame,
                            num_elementos=num_elementos,
                            num_elementos_estaticos=num_elementos_estaticos,
                            num_nuevas_imagenes=num_nuevas
                        )
                        
                        print(f"Animación generada y guardada como '{ruta_gif}'")
                        
                        # Preguntar si quiere generar otra animación
                        repetir = input("\n¿Quieres generar otra animación con los mismos parámetros? (s/n): ").strip().lower()
                        seguir_generando = repetir == 's' or repetir == 'si'
                        
                    except Exception as e:
                        print(f"Error al generar la animación: {str(e)}")
                        seguir_generando = False
                
            except Exception as e:
                print(f"Error en la configuración: {str(e)}")
                import traceback
                traceback.print_exc()
        
        else:
            print("Opción no válida. Por favor, ejecuta el programa de nuevo.")
            
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Por favor, verifica la ruta de la carpeta y asegúrate de que contiene imágenes válidas.")

if __name__ == "__main__":
    main()