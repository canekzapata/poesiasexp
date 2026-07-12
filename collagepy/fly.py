


from flask import Flask, render_template, jsonify, request, send_file
# At the beginning of fly.py
import os

# Create directories if they don't exist
os.makedirs('static', exist_ok=True)
os.makedirs('static/generated', exist_ok=True)
os.makedirs('static/generated/collages', exist_ok=True)
os.makedirs('static/generated/gifs', exist_ok=True)

# Make sure permissions are correctly set
# For Linux/Mac:
# import subprocess
# subprocess.run(['chmod', '-R', '777', 'static'])
import random
import string
import json
import threading
import time
from werkzeug.utils import secure_filename

# Import your existing Python generators
import collageanim4
import simplememepaint
import memecoll  # assuming this is the correct import for the third file

app = Flask(__name__)


# In fly.py, add these lines at the top
import logging
logging.basicConfig(level=logging.DEBUG)



# Configure upload and output directories
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'static/generated'
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp'}

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(os.path.join(OUTPUT_FOLDER, 'collages'), exist_ok=True)
os.makedirs(os.path.join(OUTPUT_FOLDER, 'gifs'), exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Dictionary to track generation jobs
generation_jobs = {}

# Global variable to store pre-generated content
pregenerated_content = {
    'collages': [],
    'gifs': []
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_random_id(length=10):
    """Generate a random ID for jobs and files"""
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

@app.route('/')
def index():
    """Serve the main HTML page with the parallax canvas"""
    return render_template('index.html')

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Handle image uploads to use in collage generation"""
    if 'files[]' not in request.files:
        return jsonify({'error': 'No files part'}), 400
    
    files = request.files.getlist('files[]')
    
    if not files or files[0].filename == '':
        return jsonify({'error': 'No files selected'}), 400
    
    upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], generate_random_id())
    os.makedirs(upload_dir, exist_ok=True)
    
    filenames = []
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)
            filenames.append(file_path)
    
    return jsonify({
        'success': True,
        'message': f'Uploaded {len(filenames)} files',
        'upload_dir': upload_dir,
        'filenames': filenames
    })

@app.route('/api/generate-collage', methods=['POST'])
def generate_collage():
    """Generate a static collage using your Python collage generator"""
    data = request.json
    input_dir = data.get('input_dir')
    num_elements = int(data.get('num_elements', 12))
    
    if not input_dir or not os.path.isdir(input_dir):
        return jsonify({'error': 'Invalid input directory'}), 400
    
    job_id = generate_random_id()
    output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'collages', f'collage_{job_id}.png')
    
    # Update job status
    generation_jobs[job_id] = {
        'status': 'processing',
        'type': 'collage',
        'start_time': time.time(),
        'output_file': output_file
    }
    
    # Run in a separate thread to avoid blocking
    def generate_collage_task():
        try:
            # Load images from the directory
            images = memecoll.seleccionar_imagenes_aleatorias(input_dir, min_imagenes=6, max_imagenes=15)
            
            # Generate the collage
            collage = memecoll.generar_collage(images, num_elementos=num_elements)
            
            # Save the collage
            collage.save(output_file)
            
            # Update job status
            generation_jobs[job_id]['status'] = 'completed'
            generation_jobs[job_id]['url'] = f'/static/generated/collages/collage_{job_id}.png'
            generation_jobs[job_id]['width'] = collage.width
            generation_jobs[job_id]['height'] = collage.height
            generation_jobs[job_id]['end_time'] = time.time()
            
        except Exception as e:
            generation_jobs[job_id]['status'] = 'failed'
            generation_jobs[job_id]['error'] = str(e)
    
    # Start the generation thread
    thread = threading.Thread(target=generate_collage_task)
    thread.start()
    
    return jsonify({
        'job_id': job_id,
        'status': 'processing'
    })

@app.route('/api/generate-gif', methods=['POST'])
def generate_gif():
    """Generate an animated GIF using your Python GIF generator"""
    data = request.json
    input_dir = data.get('input_dir')
    num_frames = int(data.get('num_frames', 15))
    duration_frame = int(data.get('duration_frame', 100))
    num_elements = int(data.get('num_elements', 5))
    num_elements_static = int(data.get('num_elements_static', 2))
    
    if not input_dir or not os.path.isdir(input_dir):
        return jsonify({'error': 'Invalid input directory'}), 400
    
    job_id = generate_random_id()
    output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'gifs', f'anim_{job_id}.gif')
    
    # Update job status
    generation_jobs[job_id] = {
        'status': 'processing',
        'type': 'gif',
        'start_time': time.time(),
        'output_file': output_file
    }
    
    # Run in a separate thread to avoid blocking
    def generate_gif_task():
        try:
            # Load images from the directory
            images = collageanim4.seleccionar_imagenes_aleatorias(input_dir, min_imagenes=6, max_imagenes=20)
            
            # Generate the GIF
            gif_path = collageanim4.generar_gif_animado(
                images,
                ruta_salida=output_file,
                num_frames=num_frames,
                duracion_frame=duration_frame,
                num_elementos=num_elements,
                num_elementos_estaticos=num_elements_static
            )
            
            # Update job status
            generation_jobs[job_id]['status'] = 'completed'
            generation_jobs[job_id]['url'] = f'/static/generated/gifs/anim_{job_id}.gif'
            generation_jobs[job_id]['end_time'] = time.time()
            
        except Exception as e:
            generation_jobs[job_id]['status'] = 'failed'
            generation_jobs[job_id]['error'] = str(e)
    
    # Start the generation thread
    thread = threading.Thread(target=generate_gif_task)
    thread.start()
    
    return jsonify({
        'job_id': job_id,
        'status': 'processing'
    })

@app.route('/api/generate-meme-anim', methods=['POST'])
def generate_meme_anim():
    """Generate a meme animation using SimpleMeme generator"""
    data = request.json
    input_dir = data.get('input_dir')
    new_images_dir = data.get('new_images_dir')
    num_frames = int(data.get('num_frames', 25))
    duration_frame = int(data.get('duration_frame', 100))
    num_elements = int(data.get('num_elements', 4))
    num_elements_static = int(data.get('num_elements_static', 2))
    num_new_images = int(data.get('num_new_images', 2))
    
    if not input_dir or not os.path.isdir(input_dir):
        return jsonify({'error': 'Invalid input directory'}), 400
    
    if not new_images_dir:
        new_images_dir = input_dir  # Use same directory if not specified
    
    job_id = generate_random_id()
    output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'gifs', f'meme_{job_id}.gif')
    
    # Update job status
    generation_jobs[job_id] = {
        'status': 'processing',
        'type': 'meme-anim',
        'start_time': time.time(),
        'output_file': output_file
    }
    
    # Run in a separate thread to avoid blocking
    def generate_meme_task():
        try:
            # Generate the meme animation
            meme_path = simplememepaint.main_simplememepaint(
                input_dir,
                new_images_dir,
                num_frames=num_frames,
                duracion_frame=duration_frame,
                num_elementos=num_elements,
                num_elementos_estaticos=num_elements_static,
                num_nuevas_imagenes=num_new_images
            )
            
            # Copy or move the file to our output directory
            import shutil
            shutil.copy2(meme_path, output_file)
            
            # Update job status
            generation_jobs[job_id]['status'] = 'completed'
            generation_jobs[job_id]['url'] = f'/static/generated/gifs/meme_{job_id}.gif'
            generation_jobs[job_id]['end_time'] = time.time()
            
        except Exception as e:
            generation_jobs[job_id]['status'] = 'failed'
            generation_jobs[job_id]['error'] = str(e)
    
    # Start the generation thread
    thread = threading.Thread(target=generate_meme_task)
    thread.start()
    
    return jsonify({
        'job_id': job_id,
        'status': 'processing'
    })

@app.route('/api/job-status/<job_id>', methods=['GET'])
def job_status(job_id):
    """Check the status of a generation job"""
    if job_id not in generation_jobs:
        return jsonify({'error': 'Job not found'}), 404
    
    job = generation_jobs[job_id]
    response = {
        'job_id': job_id,
        'status': job['status'],
        'type': job['type'],
        'elapsed_time': time.time() - job['start_time']
    }
    
    # Add additional data for completed jobs
    if job['status'] == 'completed':
        response['url'] = job.get('url')
        if 'width' in job:
            response['width'] = job['width']
            response['height'] = job['height']
    elif job['status'] == 'failed':
        response['error'] = job.get('error', 'Unknown error')
    
    return jsonify(response)

@app.route('/api/generate-canvas-content', methods=['POST'])
def generate_canvas_content():
    """Generate multiple content pieces for the canvas"""
    data = request.json
    input_dir = data.get('input_dir')
    num_collages = int(data.get('num_collages', 5))
    num_gifs = int(data.get('num_gifs', 3))
    
    if not input_dir or not os.path.isdir(input_dir):
        return jsonify({'error': 'Invalid input directory'}), 400
    
    canvas_id = generate_random_id()
    
    # Create a job for each content piece
    collage_jobs = []
    gif_jobs = []
    
    # Generate collages
    for i in range(num_collages):
        job_id = generate_random_id()
        output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'collages', f'collage_{job_id}.png')
        
        generation_jobs[job_id] = {
            'status': 'queued',
            'type': 'collage',
            'canvas_id': canvas_id,
            'start_time': time.time(),
            'output_file': output_file
        }
        
        collage_jobs.append(job_id)
    
    # Generate GIFs
    for i in range(num_gifs):
        job_id = generate_random_id()
        output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'gifs', f'anim_{job_id}.gif')
        
        generation_jobs[job_id] = {
            'status': 'queued',
            'type': 'gif',
            'canvas_id': canvas_id,
            'start_time': time.time(),
            'output_file': output_file
        }
        
        gif_jobs.append(job_id)
    
    # Function to process each job type
    def process_canvas_content():
        # Process collage jobs
        for job_id in collage_jobs:
            if generation_jobs[job_id]['status'] != 'queued':
                continue
                
            generation_jobs[job_id]['status'] = 'processing'
            
            try:
                # Select random parameters for variety
                num_elements = random.randint(8, 15)
                
                # Load images from the directory
                images = memecoll.seleccionar_imagenes_aleatorias(input_dir, min_imagenes=6, max_imagenes=15)
                
                # Generate the collage
                collage = memecoll.generar_collage(images, num_elementos=num_elements)
                
                # Save the collage
                output_file = generation_jobs[job_id]['output_file']
                collage.save(output_file)
                
                # Update job status
                generation_jobs[job_id]['status'] = 'completed'
                generation_jobs[job_id]['url'] = f'/static/generated/collages/{os.path.basename(output_file)}'
                generation_jobs[job_id]['width'] = collage.width
                generation_jobs[job_id]['height'] = collage.height
                generation_jobs[job_id]['end_time'] = time.time()
                
            except Exception as e:
                generation_jobs[job_id]['status'] = 'failed'
                generation_jobs[job_id]['error'] = str(e)
        
        # Process GIF jobs
        for job_id in gif_jobs:
            if generation_jobs[job_id]['status'] != 'queued':
                continue
                
            generation_jobs[job_id]['status'] = 'processing'
            
            try:
                # Select random parameters for variety
                num_frames = random.randint(10, 20)
                duration_frame = random.randint(80, 150)
                num_elements = random.randint(3, 6)
                num_elements_static = random.randint(1, 3)
                
                # Load images from the directory
                images = collageanim4.seleccionar_imagenes_aleatorias(input_dir, min_imagenes=6, max_imagenes=20)
                
                # Generate the GIF
                output_file = generation_jobs[job_id]['output_file']
                gif_path = collageanim4.generar_gif_animado(
                    images,
                    ruta_salida=output_file,
                    num_frames=num_frames,
                    duracion_frame=duration_frame,
                    num_elementos=num_elements,
                    num_elementos_estaticos=num_elements_static
                )
                
                # Update job status
                generation_jobs[job_id]['status'] = 'completed'
                generation_jobs[job_id]['url'] = f'/static/generated/gifs/{os.path.basename(output_file)}'
                generation_jobs[job_id]['end_time'] = time.time()
                
            except Exception as e:
                generation_jobs[job_id]['status'] = 'failed'
                generation_jobs[job_id]['error'] = str(e)
    
    # Start the processing thread
    thread = threading.Thread(target=process_canvas_content)
    thread.start()
    
    return jsonify({
        'canvas_id': canvas_id,
        'collage_jobs': collage_jobs,
        'gif_jobs': gif_jobs,
        'status': 'processing'
    })

@app.route('/api/canvas-status/<canvas_id>', methods=['GET'])
def canvas_status(canvas_id):
    """Check the status of all jobs related to a canvas"""
    canvas_jobs = {job_id: job for job_id, job in generation_jobs.items() if job.get('canvas_id') == canvas_id}
    
    if not canvas_jobs:
        return jsonify({'error': 'Canvas jobs not found'}), 404
    
    total_jobs = len(canvas_jobs)
    completed_jobs = sum(1 for job in canvas_jobs.values() if job['status'] == 'completed')
    failed_jobs = sum(1 for job in canvas_jobs.values() if job['status'] == 'failed')
    
    # Prepare the content for the canvas
    canvas_content = {
        'collages': [],
        'gifs': []
    }
    
    for job_id, job in canvas_jobs.items():
        if job['status'] == 'completed':
            item = {
                'url': job['url'],
                'type': job['type'],
                'layer': random.randint(0, 3),  # Random layer for variety
                'x': random.randint(0, 10000),  # Random position
                'y': random.randint(0, 10000)
            }
            
            if job['type'] == 'collage':
                item['width'] = job.get('width', 300)  # Default if not available
                item['height'] = job.get('height', 300)
                canvas_content['collages'].append(item)
            else:
                item['width'] = 300  # Default GIF size
                item['height'] = 300
                canvas_content['gifs'].append(item)
    
    status = 'processing'
    if completed_jobs + failed_jobs == total_jobs:
        status = 'completed'
    
    return jsonify({
        'canvas_id': canvas_id,
        'status': status,
        'total_jobs': total_jobs,
        'completed_jobs': completed_jobs,
        'failed_jobs': failed_jobs,
        'progress': (completed_jobs / total_jobs) * 100 if total_jobs > 0 else 0,
        'content': canvas_content if status == 'completed' else None
    })

@app.route('/api/pregenerated-content', methods=['GET'])
def get_pregenerated_content():
    """Return the list of pre-generated content for the canvas"""
    return jsonify({
        'success': True,
        'content': pregenerated_content
    })

def pregenerate_content(input_dir, num_collages=5, num_gifs=3):
    """Generate initial content for the canvas when the application starts"""
    print("Pregenerando contenido inicial para el canvas...")
    
    # Clear existing content lists
    pregenerated_content['collages'] = []
    pregenerated_content['gifs'] = []
    
    # Generate collages
    try:
        for i in range(num_collages):
            print(f"Generando collage {i+1}/{num_collages}...")
            job_id = generate_random_id()
            output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'collages', f'collage_{job_id}.png')
            
            # Load images from the directory
            images = memecoll.seleccionar_imagenes_aleatorias(input_dir, min_imagenes=6, max_imagenes=15)
            
            # Generate the collage
            collage = memecoll.generar_collage(images, num_elementos=random.randint(8, 15))
            
            # Save the collage
            collage.save(output_file)
            
            # Add to pregenerated content
            pregenerated_content['collages'].append({
                'url': f'/static/generated/collages/collage_{job_id}.png',
                'width': collage.width,
                'height': collage.height,
                'layer': random.randint(0, 2),  # Random layer 0-2
                'x': random.randint(0, 10000),  # Random position
                'y': random.randint(0, 10000)
            })
            
            print(f"Collage {i+1} generado y guardado como: {output_file}")
    except Exception as e:
        print(f"Error al generar collages: {e}")
    
    # Generate GIFs
    try:
        for i in range(num_gifs):
            print(f"Generando GIF animado {i+1}/{num_gifs}...")
            job_id = generate_random_id()
            output_file = os.path.join(app.config['OUTPUT_FOLDER'], 'gifs', f'anim_{job_id}.gif')
            
            # Load images from the directory
            images = collageanim4.seleccionar_imagenes_aleatorias(input_dir, min_imagenes=6, max_imagenes=20)
            
            # Generate the GIF with random parameters
            num_frames = random.randint(10, 20)
            duration_frame = random.randint(80, 150)
            num_elements = random.randint(3, 6)
            num_elements_static = random.randint(1, 3)
            
            gif_path = collageanim4.generar_gif_animado(
                images,
                ruta_salida=output_file,
                num_frames=num_frames,
                duracion_frame=duration_frame,
                num_elementos=num_elements,
                num_elementos_estaticos=num_elements_static
            )
            
            # Add to pregenerated content
            pregenerated_content['gifs'].append({
                'url': f'/static/generated/gifs/anim_{job_id}.gif',
                'width': 300,  # Default size for GIFs
                'height': 300,
                'layer': 3,  # Top layer for GIFs
                'x': random.randint(0, 10000),  # Random position
                'y': random.randint(0, 10000)
            })
            
            print(f"GIF {i+1} generado y guardado como: {output_file}")
    except Exception as e:
        print(f"Error al generar GIFs: {e}")
    
    print(f"Pregeneración completada: {len(pregenerated_content['collages'])} collages y {len(pregenerated_content['gifs'])} GIFs generados.")

if __name__ == '__main__':
    # Ask for the image directory at startup
    print("\n===== GENERADOR DE COLLAGES Y ANIMACIONES =====")
    print("Este programa generará contenido para el canvas y luego iniciará un servidor web.")
    print("Puedes acceder a la interfaz web en http://127.0.0.1:5000\n")
    
    # Ask for the image directory
    input_dir = input("Introduce la ruta de la carpeta con imágenes: ")
    input_dir = os.path.expanduser(input_dir)  # Expand ~ in Unix paths
    
    if not os.path.isdir(input_dir):
        print(f"La carpeta '{input_dir}' no existe o no es accesible.")
        exit(1)
    
    # Ask for the number of collages to generate
    try:
        num_collages = int(input("Número de collages estáticos a generar (1-10) [5]: ") or "5")
        num_collages = max(1, min(10, num_collages))
    except ValueError:
        num_collages = 5
        print("Valor no válido, se usará el valor por defecto: 5")
    
    # Ask for the number of GIFs to generate
    try:
        num_gifs = int(input("Número de GIFs animados a generar (1-5) [3]: ") or "3")
        num_gifs = max(1, min(5, num_gifs))
    except ValueError:
        num_gifs = 3
        print("Valor no válido, se usará el valor por defecto: 3")
    
    # Generate initial content
    pregenerate_content(input_dir, num_collages, num_gifs)
    
    # Run the Flask app
    print("\nIniciando servidor web en http://127.0.0.1:5000")
    app.run(debug=True)