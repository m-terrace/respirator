import sys
from PIL import Image
import glob
import os

for path in sorted(glob.glob("assets/*_s_position.png")):
    img = Image.open(path).convert('RGBA')
    width, height = img.size
    pixels = img.load()
    
    min_x = width
    min_y = height
    max_x = 0
    max_y = 0
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 200: # Only look for fully solid parts
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
                
    if min_x < max_x and min_y < max_y:
        print(f"{os.path.basename(path)}: left: {min_x}, top: {min_y}, width: {max_x - min_x}, height: {max_y - min_y}")
    else:
        print(f"{os.path.basename(path)}: No solid bounds found")
