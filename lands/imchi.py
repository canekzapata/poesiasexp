import os

input_folder = '/Users/canekzapata/Documents/landspoem/imagen'
output_folder = '/Users/canekzapata/Documents/landspoem/imagenchi'

for image_file in os.listdir(input_folder):
    input_path = os.path.join(input_folder, image_file)
    output_path = os.path.join(output_folder, image_file)

    # Reducción de tamaño usando ffmpeg
    os.system(f'ffmpeg -i "{input_path}" -vf "scale=500:500:force_original_aspect_ratio=decrease" "{output_path}"')
