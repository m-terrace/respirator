import sys
from PIL import Image
import os
import glob

def get_diff_bbox(base_path, overlay_path, threshold=30):
    base_img = Image.open(base_path).convert('RGB')
    overlay_img = Image.open(overlay_path).convert('RGB')
    
    if base_img.size != overlay_img.size:
        return "Size mismatch"
        
    width, height = base_img.size
    base_pixels = base_img.load()
    overlay_pixels = overlay_img.load()
    
    min_x = width
    min_y = height
    max_x = 0
    max_y = 0
    
    found_diff = False
    
    for y in range(height):
        for x in range(width):
            br, bg, bb = base_pixels[x, y]
            or_, og, ob = overlay_pixels[x, y]
            
            diff = abs(br - or_) + abs(bg - og) + abs(bb - ob)
            if diff > threshold:
                min_x = min(min_x, x)
                min_y = min(min_y, y)
                max_x = max(max_x, x)
                max_y = max(max_y, y)
                found_diff = True
                
    if found_diff:
        return f"left: {min_x}, top: {min_y}, width: {max_x - min_x}, height: {max_y - min_y}"
    return "No difference found"

base_path = "assets/all.PNG"
for path in sorted(glob.glob("assets/*_s_position.png")):
    print(f"{os.path.basename(path)}: {get_diff_bbox(base_path, path)}")
