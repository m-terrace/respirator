from PIL import Image
import sys

def analyze(path):
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
            # Consider non-transparent pixels that aren't pure white
            if a > 10 and not (r > 250 and g > 250 and b > 250):
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
                
    if min_x < max_x and min_y < max_y:
        print(f"{path}: bbox = left: {min_x}, top: {min_y}, width: {max_x - min_x}, height: {max_y - min_y}")
    else:
        print(f"{path}: No visible bounds found")

analyze("assets/respirator_s_position.png")
