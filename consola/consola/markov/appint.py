import os
from flask import Flask, render_template, request, send_file
import markovify

app = Flask(__name__)

# Variables globales para los modelos, pesos y tipo de generación de texto
combined_model = None
text_generation_type = "sentence"
session_file = 'generated_text_session.txt'  # Archivo donde se guardará el texto generado durante la sesión

# Función para cargar un modelo desde un archivo JSON
def load_model(json_file):
    with open(json_file, "r", encoding="utf-8") as f:
        json_data = f.read()
    return markovify.Text.from_json(json_data)

# Función para combinar modelos con pesos dados
def combine_models(models, weights):
    return markovify.combine(models, weights)

# Función para generar una oración o párrafo con semilla
def generate_text(model, seed_word=None, text_type='paragraph'):
    if text_type == 'sentence' or text_type == 'sentence_seed':
        return generate_sentence(model, seed_word)
    else:
        return generate_paragraph(model, seed_word)

# Función para generar una oración con semilla
def generate_sentence(model, seed_word=None, max_chars=1700):
    if seed_word:
        return model.make_sentence_with_start(seed_word, strict=False, max_chars=max_chars, tries=100)
    else:
        return model.make_sentence(max_chars=max_chars, tries=10)

# Función para generar un párrafo con semilla
def generate_paragraph(model, seed_word=None, num_sentences=5, max_chars=1700):
    sentences = []
    for _ in range(num_sentences):
        sentence = generate_sentence(model, seed_word=seed_word, max_chars=max_chars)
        if sentence:
            sentences.append(sentence)
    return ' '.join(sentences)

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        seed_word = request.form.get('seed', None)
        text_output = generate_text(combined_model, seed_word, text_generation_type)
        
        # Guardar texto generado en el archivo de sesión
        with open(session_file, 'a', encoding='utf-8') as f:
            f.write(text_output + '\n\n')
        
        return render_template("index.html", paragraph=text_output)
    
    return render_template("index.html")

@app.route('/download')
def download_text():
    # Permitir al usuario descargar el archivo con todo el texto generado
    return send_file(session_file, as_attachment=True)

@app.route('/configure', methods=['GET', 'POST'])
def configure():
    global combined_model, text_generation_type

    if request.method == 'POST':
        model_type = request.form.get('model_type')
        text_generation_type = request.form.get('text_generation_type')

        models = []
        weights = []

        if model_type == 'individual':
            json_file = request.form.get('json_file')
            if os.path.isfile(json_file) and json_file.endswith('.json'):
                models.append(load_model(json_file))
                weights.append(1.0)
            else:
                return "File not found or not a valid JSON file.", 400
        elif model_type == 'combined':
            json_file1 = request.form.get('json_file1')
            json_file2 = request.form.get('json_file2')
            weight1 = float(request.form.get('weight1'))
            weight2 = float(request.form.get('weight2'))

            if os.path.isfile(json_file1) and json_file1.endswith('.json') and \
               os.path.isfile(json_file2) and json_file2.endswith('.json'):
                models.append(load_model(json_file1))
                models.append(load_model(json_file2))
                weights.extend([weight1, weight2])
            else:
                return "One or more files not found or not valid JSON files.", 400

        if len(models) > 1:
            combined_model = combine_models(models, weights)
        else:
            combined_model = models[0] if models else None

        if not combined_model:
            return "No valid models loaded.", 400

        return "Configuration updated successfully.", 200

    return render_template("configure.html")

def configure_models():
    global combined_model, text_generation_type

    # Cargar valores predeterminados
    json_file = 'raquel.json'
    if os.path.isfile(json_file) and json_file.endswith('.json'):
        combined_model = load_model(json_file)
    else:
        print(f"Default file '{json_file}' not found or not a valid JSON file.")
        exit(1)
    text_generation_type = 'sentence'

if __name__ == "__main__":
    configure_models()
    print("Hola, soy un generador de Markov.")
    app.run(debug=True)
