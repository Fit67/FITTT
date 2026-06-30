import sys
from rembg import remove
from PIL import Image

def process(input_path, output_path):
    try:
        input_image = Image.open(input_path)
        output_image = remove(input_image)
        output_image.save(output_path)
        print(f"Processed {input_path} -> {output_path}")
    except Exception as e:
        print(f"Failed to process {input_path}: {e}")

process('product-1.png', 'product-1.png')
process('product-2.png', 'product-2.png')
process('product-3.png', 'product-3.png')
