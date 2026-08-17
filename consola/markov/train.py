import markovify
import os

# Pedir al usuario el nombre del archivo
archivo = input("Por favor, ingrese el nombre del archivo (con la extensión, por ejemplo, egipto.txt): ")

# Verificar si el archivo existe en el directorio actual
if not os.path.isfile(archivo):
    print(f"El archivo {archivo} no se encuentra en el directorio actual.")
else:
    # Leer el corpus con la codificación utf-8
    with open(archivo, "r", encoding="utf-8") as f:
        corpus = f.read()

    # Entrenar el modelo
    text_model = markovify.Text(corpus, state_size=3)

    # Preguntar al usuario cómo quiere nombrar el archivo JSON
    nombre_json = input("¿Cómo quieres nombrar el archivo JSON? (presiona Enter para usar el nombre del archivo original): ")

    # Si el usuario no proporciona un nombre, usar el nombre del archivo .txt
    if not nombre_json:
        nombre_json = archivo.replace(".txt", ".json")
    else:
        # Asegurarse de que el nombre tenga la extensión .json
        if not nombre_json.endswith(".json"):
            nombre_json += ".json"
    
    # Guardar el modelo JSON en un archivo con la codificación utf-8
    with open(nombre_json, "w", encoding="utf-8") as f:
        f.write(text_model.to_json())

    print(f"Modelo guardado como {nombre_json}.")

    # En un uso futuro, puedes cargar el modelo directamente desde el archivo JSON con la codificación utf-8
    with open(nombre_json, "r", encoding="utf-8") as f:
        loaded_model_json = f.read()

    reconstituted_model = markovify.Text.from_json(loaded_model_json)
    print(reconstituted_model.make_short_sentence(240))
