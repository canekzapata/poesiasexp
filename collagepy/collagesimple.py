import random
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import cv2
import numpy as np
import os
import hashlib
import time
import math

def cargar_imagen(ruta):
    return Image.open(ruta).convert('RGBA')


def recortar_aleatorio(imagen, debug=True):
    # Convertir la imagen PIL a formato OpenCV
    imagen_cv = cv2.cvtColor(np.array(imagen), cv2.COLOR_RGBA2BGRA)
    
    altura, ancho = imagen_cv.shape[:2]
    
    # Definir el tamaño mínimo y máximo del recorte
    min_size = min(100, min(altura, ancho) // 3)
    max_size = min(altura, ancho)
    
    # Elegir una forma aleatoria
    formas = ['rectangulo', 'circulo', 'triangulo', 'trapecio', 'abstracta']
    forma = random.choice(formas)
    
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
    x, y, w, h = cv2.boundingRect(coords)
    recorte = resultado[y:y+h, x:x+w]
    
    # Convertir de vuelta a formato PIL
    imagen_recortada = Image.fromarray(cv2.cvtColor(recorte, cv2.COLOR_BGRA2RGBA))
    
    if debug:
        print(f"Dimensiones del recorte final: {imagen_recortada.size}")
    
    return imagen_recortada



def expandir_imagen(imagen):
    factor_expansion = random.uniform(1.5, 3.0)
    nuevo_ancho = int(imagen.width * factor_expansion)
    nuevo_alto = int(imagen.height * factor_expansion)
    return imagen.resize((nuevo_ancho, nuevo_alto), Image.LANCZOS)

def duplicar(imagen, tamaño_collage):
    ancho_collage, alto_collage = tamaño_collage
    resultado = Image.new('RGBA', (ancho_collage, alto_collage), (0, 0, 0, 0))
    
    pedazo = imagen.copy()
    
    num_duplicados = random.randint(3, 15)
    patron = random.choice(['linea', 'semicirculo', 'esquina', 'caotico'])
    
    centro_x = random.randint(0, ancho_collage)
    centro_y = random.randint(0, alto_collage)
    
    rotacion_global = random.randint(0, 360)
    
    for i in range(num_duplicados):
        if patron == 'linea':
            angulo = math.radians(random.randint(0, 360))
            distancia = random.randint(0, max(ancho_collage, alto_collage))
            nuevo_x = centro_x + int(distancia * math.cos(angulo))
            nuevo_y = centro_y + int(distancia * math.sin(angulo))
        elif patron == 'semicirculo':
            angulo = math.pi * i / (num_duplicados - 1)  # De 0 a pi
            angulo += math.radians(rotacion_global)
            radio = random.randint(24, max(ancho_collage, alto_collage) // 2)
            nuevo_x = centro_x + int(radio * math.cos(angulo))
            nuevo_y = centro_y + int(radio * math.sin(angulo))
        elif patron == 'esquina':
            esquina = random.choice([(0, 0), (ancho_collage, 0), (0, alto_collage), (ancho_collage, alto_collage)])
            nuevo_x = esquina[0] + random.randint(-pedazo.width, pedazo.width)
            nuevo_y = esquina[1] + random.randint(-pedazo.height, pedazo.height)
        else:  # caotico
            nuevo_x = random.randint(-pedazo.width, ancho_collage)
            nuevo_y = random.randint(-pedazo.height, alto_collage)
        
        angulo_rotacion = random.randint(0, 360)
        pedazo_rotado = pedazo.rotate(angulo_rotacion, expand=True)
        
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
    
    return resultado


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

        # Recortar aleatoriamente (siempre se aplica)
        imagen = recortar_aleatorio(imagen)
        forma_original = imagen.size

        # Aplicar distorsión con un 30% de probabilidad (reducido de 50%)
        if random.random() < 0.25:
            imagen = distorsionar(imagen)
            imagen = imagen.resize(forma_original, Image.LANCZOS)  # Mantener la forma original

        # Aplicar corrupción con un 20% de probabilidad
        if random.random() < 0.2:
            imagen = corromper(imagen)

        # Expandir la imagen con un 20% de probabilidad (reducido de 30%)
        if random.random() < 0.2:
            imagen = expandir_imagen(imagen)
            # Recortar de nuevo para mantener la forma no cuadrada
            imagen = imagen.crop((0, 0, forma_original[0], forma_original[1]))

        # Aplicar colorear con un 20% de probabilidad
        if random.random() < 0.2:
            imagen = colorear(imagen)

        # Removed the call to dibujar_formas

        # Aplicar eliminación de rango de colores con un 30% de probabilidad
        if random.random() < 0.85:
            rango_inferior = (random.randint(0, 100), random.randint(0, 100), random.randint(0, 100))
            rango_superior = (random.randint(150, 255), random.randint(150, 255), random.randint(150, 255))
            imagen = eliminar_rango_colores(imagen, rango_inferior, rango_superior)

        # Redimensionar la imagen manteniendo la proporción
        factor_escala = random.uniform(0.2, 0.7)
        nuevo_ancho = max(20, int(imagen.width * factor_escala))
        nuevo_alto = max(20, int(imagen.height * factor_escala))
        imagen = imagen.resize((nuevo_ancho, nuevo_alto), Image.LANCZOS)

        # Duplicar con un 20% de probabilidad (reducido de 30%)
        if random.random() < 0.6:
            imagen = duplicar(imagen, tamaño_collage)

        return imagen
    except Exception as e:
        print(f"Error en aplicar_efectos_multiples: {str(e)}")
        # En caso de error, devolver la imagen original sin cambios
        return imagen.copy()
    
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


def seleccionar_imagenes_aleatorias(carpeta_raiz, min_imagenes=6, max_imagenes=129, max_profundidad=5):
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
        return Image.open(ruta).convert('RGBA')
    except Image.UnidentifiedImageError:
        print(f"El archivo '{ruta}' no es una imagen válida.")
    except Exception as e:
        print(f"Error al abrir la imagen '{ruta}': {str(e)}")
    return None

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

# Uso
def main():
    try:
        carpeta_imagenes = solicitar_ruta_carpeta()
        imagenes = seleccionar_imagenes_aleatorias(carpeta_imagenes)
        print(f"Se seleccionaron {len(imagenes)} imágenes aleatorias de la carpeta y sus subcarpetas.")

        collage = generar_collage(imagenes)
        nombre_archivo = generar_nombre_archivo_unico()
        collage.save(nombre_archivo)

        print(f"Collage generado y guardado como '{nombre_archivo}'")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Por favor, verifica la ruta de la carpeta y asegúrate de que contiene imágenes válidas.")

if __name__ == "__main__":
    main()