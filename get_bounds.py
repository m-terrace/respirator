from PIL import Image
import sys
import glob
import os

def get_bounding_box(image_path):
    try:
        img = Image.open(image_path)
        img = img.convert("RGBA")
        width, height = img.size
        pixels = img.load()
        
        min_x = width
        min_y = height
        max_x = 0
        max_y = 0
        
        has_pixels = False
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # Consider non-transparent pixels that aren't pure white
                if a > 10 and not (r > 250 and g > 250 and b > 250):
                    min_x = min(min_x, x)
                    min_y = min(min_y, y)
                    max_x = max(max_x, x)
                    max_y = max(max_y, y)
                    has_pixels = True
                    
        if has_pixels:
            return (min_x, min_y, max_x, max_y)
        return None
    except Exception as e:
        return str(e)

for path in sorted(glob.glob("assets/*_position.png")):
    bbox = get_bounding_box(path)
    if isinstance(bbox, tuple):
        left, top, right, bottom = bbox
        w = right - left
        h = bottom - top
        print(f"{os.path.basename(path)}: left: {left}px, top: {top}px, width: {w}px, height: {h}px")
    else:
         print(f"{os.path.basename(path)}: No bounds")
