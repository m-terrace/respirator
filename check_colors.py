import sys
from PIL import Image

def summarize_colors(path):
    img = Image.open(path).convert('RGB')
    w, h = img.size
    pixels = img.load()
    dark_count = 0
    light_count = 0
    transparent_count = 0
    
    img_rgba = Image.open(path).convert('RGBA')
    pixels_rgba = img_rgba.load()

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels_rgba[x, y]
            if a < 20:
                transparent_count += 1
            else:
                brightness = (r + g + b) / 3
                if brightness < 50:
                    dark_count += 1
                else:
                    light_count += 1
    total = w * h
    print(f"{path}: transparent {transparent_count/total*100:.1f}%, dark {dark_count/total*100:.1f}%, light {light_count/total*100:.1f}%")

summarize_colors("assets/all.PNG")
summarize_colors("assets/respirator_s_position.png")
