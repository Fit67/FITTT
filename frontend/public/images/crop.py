from PIL import Image
import os

def crop_transparent(image_path):
    if not os.path.exists(image_path):
        print(f"{image_path} does not exist.")
        return
    img = Image.open(image_path)
    # getbbox works on the alpha channel if the image has one
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # We can extract just the alpha channel
        alpha = img.convert('RGBA').split()[-1]
        bbox = alpha.getbbox()
        if bbox:
            img_cropped = img.crop(bbox)
            img_cropped.save(image_path)
            print(f"Cropped {image_path} to {bbox}")
        else:
            print(f"No bounding box found for {image_path}")
    else:
        print(f"Image {image_path} doesn't have an alpha channel")

crop_transparent('product-1.png')
crop_transparent('product-2.png')
crop_transparent('product-3.png')
