import os

# Directorio donde están las fuentes
carpeta_fuentes = '/Users/canekzapata/Documents/landspoem/fonts'

# Obtener lista de archivos en el directorio
nombres_fuentes = [f for f in os.listdir(carpeta_fuentes) if os.path.isfile(os.path.join(carpeta_fuentes, f))]

# Mostrar en consola cuántos archivos encontró
print(f"Se encontraron {len(nombres_fuentes)} archivos en {carpeta_fuentes}.")

# Especificar la ruta completa donde se guardará el archivo
ruta_archivo_css = '/Users/canekzapata/Documents/landspoem/fonts/fonts.css'

# Escribir las reglas @font-face en el archivo .css
with open(ruta_archivo_css, 'w') as archivo:
    for nombre in nombres_fuentes:
        # Suponemos que el nombre de la fuente (sin la extensión) será usado como nombre de la familia de fuentes
        nombre_fuente = os.path.splitext(nombre)[0]

        archivo.write(f"""
@font-face {{
    font-family: "{nombre_fuente}";
    src: url('fonts/{nombre}');
}}
""")

print(f"Reglas @font-face guardadas en {ruta_archivo_css}")
