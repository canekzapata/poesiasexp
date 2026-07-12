import random
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter
import cv2
import numpy as np
import os
import hashlib
import time
import math


def recortar_aleatorio(imagen, debug=True):
    # Convertir la imagen PIL a formato OpenCV
    imagen_cv = cv2.cvtColor(np.array(imagen), cv2.COLOR_RGBA2BGRA)
    
    altura, ancho = imagen_cv.shape[:2]
    
    # Definir el tamaño mínimo y máximo del recorte
    min_size = min(100, min(altura, ancho) // 3)
    max_size = min(altura, ancho)
    
    # Elegir una forma aleatoria
    formas = [ 'abstracta']
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
        cv2.circle(mascara, (centro_x, centro_y), radio, 255, -1)
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


def main():
    # Solicitar al usuario la ruta de la imagen
    ruta_imagen = input("Por favor, ingresa la ruta completa de la imagen que deseas recortar: ").strip()

    # Verificar si el archivo existe
    if not os.path.exists(ruta_imagen):
        print(f"Error: El archivo '{ruta_imagen}' no existe.")
        return

    try:
        # Abrir la imagen
        imagen_original = Image.open(ruta_imagen).convert('RGBA')
        
        # Aplicar el recorte aleatorio
        recorte = recortar_aleatorio(imagen_original)
        
        # Generar un nombre para el archivo de salida
        nombre_archivo_salida = f"recorte_{os.path.basename(ruta_imagen)}"
        
        # Guardar el recorte
        recorte.save(nombre_archivo_salida)
        
        print(f"Recorte guardado como '{nombre_archivo_salida}'")
    except Exception as e:
        print(f"Error al procesar la imagen: {e}")

if __name__ == "__main__":
    main()