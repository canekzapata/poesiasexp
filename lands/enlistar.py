import os

# Directorio donde están las imágenes
carpeta_imagenes = '/Users/canekzapata/Documents/landspoem/fonts'

# Obtener lista de archivos en el directorio
nombres_imagenes = [f for f in os.listdir(carpeta_imagenes) if os.path.isfile(os.path.join(carpeta_imagenes, f))]

# Mostrar en consola cuántos archivos encontró
print(f"Se encontraron {len(nombres_imagenes)} archivos en {carpeta_imagenes}.")

# Especificar la ruta completa donde se guardará el archivo
ruta_archivo = '/Users/canekzapata/Documents/landspoem/imagen/fonts.txt'

# Escribir los nombres en el archivo .txt (un nombre por línea)
with open(ruta_archivo, 'w') as archivo:
    for nombre in nombres_imagenes:
        archivo.write(nombre + '\n')

print(f"Lista de imágenes guardada en {ruta_archivo}")
