import random
from PIL import Image
import numpy as np
import os
import time
import hashlib

# Importar funciones necesarias del módulo principal
from collageanim4 import (
    recortar_aleatorio, corromper, distorsionar, colorear, eliminar_rango_colores,
    verificar_tamaño_seguro, cambiar_hue, rotar_imagen, escalar_imagen, mover_imagen,
    aplicar_efectos_multiples, limpiar_memoria, seleccionar_imagenes_aleatorias,
    generar_nombre_archivo_unico, generar_frames_animacion
)

def insertar_nuevas_imagenes_en_frames(frames_originales, imagenes_nuevas, frame_inicio, frame_fin, tamaño_canvas):
    """
    Inserta imágenes nuevas en un rango de frames PRESERVANDO el fondo y las animaciones existentes.
    Utiliza el sistema original de efectos y movimiento para las nuevas imágenes.
    
    :param frames_originales: Lista de frames originales
    :param imagenes_nuevas: Lista de imágenes a insertar
    :param frame_inicio: Frame donde empezar a insertar
    :param frame_fin: Frame donde terminar de insertar
    :param tamaño_canvas: Tamaño del canvas
    :return: Lista de frames modificados
    """
    frames_modificados = frames_originales.copy()
    
    # Procesar cada imagen nueva con los efectos estándar
    elementos_nuevos = []
    for img in imagenes_nuevas:
        # Procesar la imagen con los efectos estándar (igual que en el sistema original)
        img_procesada = aplicar_efectos_multiples(img, tamaño_canvas)
        
        # Elegir posición inicial aleatoria
        x = random.randint(0, max(0, tamaño_canvas[0] - img_procesada.width))
        y = random.randint(0, max(0, tamaño_canvas[1] - img_procesada.height))
        
        # Determinar movimiento (igual que en el sistema original)
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
        
        # Mismas propiedades que los elementos animados estándar
        elementos_nuevos.append({
            'imagen': img_procesada,
            'posicion': (x, y),
            'movimiento': tipo_movimiento,
            'parametros_movimiento': parametros_movimiento,
            'factor_escala': 1.0,
            'direccion_escala': 1,
            'velocidad_escala': random.uniform(0.01, 0.1),
            'angulo_rotacion': 0,
            'velocidad_rotacion': random.uniform(-5, 5),
            'cambio_hue': 0.0,
            'velocidad_hue': random.uniform(0.02, 0.08) if random.random() < 0.6 else 0,  # 60% probabilidad
            'aplicar_hue': random.random() < 0.6  # 60% probabilidad
        })
    
    # Insertar nuevas imágenes en los frames seleccionados
    frames_rango = frame_fin - frame_inicio + 1
    for i in range(frame_inicio, frame_fin + 1):
        frame_relativo = i - frame_inicio
        
        # Obtener frame original y convertirlo a RGBA si no lo está
        frame = frames_modificados[i].copy().convert('RGBA')
        
        # Actualizar cada elemento nuevo para este frame
        for elem in elementos_nuevos:
            # Obtener imagen actual
            imagen_actual = elem['imagen'].copy()
            
            # 1. Cambiar el hue (si aplica)
            if elem['aplicar_hue']:
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
            
            # 4. Mover a nueva posición usando el sistema original
            nueva_pos = mover_imagen(
                imagen_actual, 
                elem['posicion'], 
                elem['movimiento'], 
                frame_relativo, 
                frames_rango, 
                tamaño_canvas,
                elem['parametros_movimiento']
            )
            elem['posicion'] = nueva_pos
            
            # Añadir la imagen al frame actual
            frame.alpha_composite(imagen_actual, nueva_pos)
        
        # Guardar frame modificado
        frames_modificados[i] = frame
    
    return frames_modificados

def generar_gif_con_nuevas_imagenes(imagenes_base, imagenes_nuevas, ruta_salida=None, num_frames=30, 
                                   duracion_frame=100, num_elementos=5, num_elementos_estaticos=2):
    """
    Genera un GIF animado combinando la animación normal con inserción de nuevas imágenes.
    
    :param imagenes_base: Lista de imágenes PIL para la animación base
    :param imagenes_nuevas: Lista de imágenes PIL para insertar en la mitad
    :param ruta_salida: Ruta donde guardar el GIF generado
    :param num_frames: Número de frames para la animación
    :param duracion_frame: Duración de cada frame en milisegundos
    :param num_elementos: Número de elementos a incluir en la animación base
    :param num_elementos_estaticos: Número de elementos estáticos a incluir
    :return: Ruta del archivo GIF generado
    """
    if ruta_salida is None:
        ruta_salida = generar_nombre_archivo_unico(prefijo='animacion_ampliada', extension='.gif')
    
    # Tamaño del canvas
    tamaño_canvas = (612, 432)
    
    # Generar los frames base de la animación
    print("Generando frames base...")
    frames_base = generar_frames_animacion(
        imagenes_base, 
        num_frames=num_frames, 
        tamaño_canvas=tamaño_canvas,
        num_elementos=num_elementos,
        num_elementos_estaticos=num_elementos_estaticos
    )
    
    # Definir el rango de frames donde insertar las nuevas imágenes
    frame_inicio = num_frames // 3
    frame_fin = (num_frames * 2) // 3
    
    print(f"Insertando nuevas imágenes entre los frames {frame_inicio} y {frame_fin}...")
    
    # Insertar nuevas imágenes en los frames
    frames_finales = insertar_nuevas_imagenes_en_frames(
        frames_base,
        imagenes_nuevas,
        frame_inicio,
        frame_fin,
        tamaño_canvas
    )
    
    # Guardar como GIF animado
    print("Guardando GIF final...")
    frames_finales[0].save(
        ruta_salida,
        save_all=True,
        append_images=frames_finales[1:],
        optimize=False,  # False para mantener la calidad
        duration=duracion_frame,
        loop=0  # 0 = loop infinito
    )
    
    return ruta_salida

# Función principal para generar una animación con nuevas imágenes
def main_simplememepaint(carpeta_base, carpeta_nuevas=None, num_frames=25, duracion_frame=100, 
                       num_elementos=4, num_elementos_estaticos=2, num_nuevas_imagenes=2):
    """
    Función principal para generar una animación con nuevas imágenes insertadas a mitad.
    
    :param carpeta_base: Carpeta con imágenes para la animación base
    :param carpeta_nuevas: Carpeta con imágenes para insertar en la mitad (opcional)
    :param num_frames: Número de frames para la animación
    :param duracion_frame: Duración de cada frame en milisegundos
    :param num_elementos: Número de elementos a incluir en la animación base
    :param num_elementos_estaticos: Número de elementos estáticos a incluir
    :param num_nuevas_imagenes: Número de nuevas imágenes a insertar
    :return: Ruta del archivo GIF generado
    """
    try:
        # Cargar imágenes para la animación base
        print("Cargando imágenes base...")
        imagenes_base = seleccionar_imagenes_aleatorias(carpeta_base)
        
        # Cargar imágenes nuevas
        if carpeta_nuevas is None:
            # Si no se especifica carpeta, usar la misma que la base
            carpeta_nuevas = carpeta_base
        
        print("Cargando imágenes nuevas para inserción...")
        imagenes_nuevas_completas = seleccionar_imagenes_aleatorias(carpeta_nuevas, min_imagenes=2, max_imagenes=5)
        
        # Tomar n imágenes aleatorias para usar como nuevas
        num_nuevas = min(num_nuevas_imagenes, len(imagenes_nuevas_completas))
        imagenes_nuevas = random.sample(imagenes_nuevas_completas, num_nuevas)
        
        print(f"Generando animación con {len(imagenes_base)} imágenes base y {num_nuevas} imágenes adicionales...")
        
        # Generar la animación con nuevas imágenes
        ruta_gif = generar_gif_con_nuevas_imagenes(
            imagenes_base,
            imagenes_nuevas,
            num_frames=num_frames,
            duracion_frame=duracion_frame,
            num_elementos=num_elementos,
            num_elementos_estaticos=num_elementos_estaticos
        )
        
        print(f"Animación generada y guardada como '{ruta_gif}'")
        return ruta_gif
    
    except Exception as e:
        print(f"Error en main_simplememepaint: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

# Función para configurar parámetros desde la línea de comandos
def ejecutar_simplememepaint():
    import argparse
    
    parser = argparse.ArgumentParser(description='Generar una animación GIF con inserción de nuevas imágenes')
    parser.add_argument('carpeta_base', help='Carpeta con imágenes para la animación base')
    parser.add_argument('--carpeta_nuevas', '-n', help='Carpeta con imágenes para insertar (opcional)')
    parser.add_argument('--frames', '-f', type=int, default=25, help='Número de frames para la animación')
    parser.add_argument('--duracion', '-d', type=int, default=100, help='Duración de cada frame en milisegundos')
    parser.add_argument('--elementos', '-e', type=int, default=4, help='Número de elementos animados')
    parser.add_argument('--estaticos', '-s', type=int, default=2, help='Número de elementos estáticos')
    parser.add_argument('--nuevas', '-n', type=int, default=2, help='Número de nuevas imágenes a insertar')
    
    args = parser.parse_args()
    
    main_simplememepaint(
        args.carpeta_base,
        args.carpeta_nuevas,
        args.frames,
        args.duracion,
        args.elementos,
        args.estaticos,
        args.nuevas
    )

if __name__ == "__main__":
    ejecutar_simplememepaint()