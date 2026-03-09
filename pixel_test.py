import sys
from PIL import Image

def examine(path):
    img = Image.open(path).convert('RGBA')
    pixels = img.load()
    
    # Check a point outside the respirator bounding box.
    # respirator diff box: left: 39, top: 92, width: 306, height: 325
    # So point (600, 300) is well outside.
    r, g, b, a = pixels[600, 300]
    print(f"Point (600, 300) in {path}: R:{r} G:{g} B:{b} A:{a}")

examine("assets/respirator_s_position.png")
examine("assets/all.PNG")
