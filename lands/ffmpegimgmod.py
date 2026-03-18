import os
import random
import subprocess


directorio_paleta = '/Users/canekzapata/Documents/landspoem/imagen'
# Directorio de imágenes de entrada a las que se aplicará la paleta
input_folder = '/Users/canekzapata/Documents/landspoem/imagen'
# Directorio de salida donde se guardarán las imágenes procesadas
output_folder = '/Users/canekzapata/Documents/landspoem/imagenchi'
# Comprobar si FFmpeg está disponible

# Comprobar si FFmpeg está disponible
try:
    subprocess.check_output(["ffmpeg", "-version"])
except subprocess.CalledProcessError:
    print("FFmpeg no está instalado o no es accesible desde la línea de comandos.")
    exit()

imagenes = [img for img in os.listdir(input_folder) if img.endswith('.png')]

for image_file in imagenes:
    input_path = os.path.join(input_folder, image_file)
    output_path = os.path.join(output_folder, image_file)

    # Generar la paleta para la imagen actual
    paleta_temporal = "paleta_temp.png"
    subprocess.run(['ffmpeg', '-i', input_path, '-vf', 'palettegen', paleta_temporal])

    # Aplicar la paleta generada a la imagen sin dithering
    subprocess.run(['ffmpeg', '-i', input_path, '-i', paleta_temporal, '-filter_complex', "[0:v]scale=500:500[img];[img][1:v]paletteuse=dither=none", output_path])

    # Borrar el archivo temporal de la paleta
    os.remove(paleta_temporal)
