from PIL import Image
import os

files = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"]
for f in files:
    s_name = f + "_s.png"
    # fix spelling mistake for humidifer
    if f == "humidifier1" and os.path.exists("assets/humidifer1_s.png"): s_name = "humidifer1_s.png"
    if f == "humidifier2" and os.path.exists("assets/humidifer2_s.png"): s_name = "humidifer2_s.png"
    
    pos_file = "assets/" + f + "_s_position.png"
    if not os.path.exists(pos_file):
        print(f"{pos_file} not found")
        continue
        
    img = Image.open(pos_file).convert("RGBA")
    
    # We want to find the bounding box of the black silhouette. 
    # The image is 1430x1270 and has a black silhoutte overlaid on all.PNG
    base = Image.open("assets/all.PNG").convert("RGBA")
    
    # difference
    from PIL import ImageChops
    diff = ImageChops.difference(img, base)
    
    # get bounding box of differences
    # Convert diff to grayscale, then get bounding box of non-zero
    bbox = diff.convert("L").getbbox()
    
    s_file = "assets/" + s_name
    if os.path.exists(s_file):
        s_img = Image.open(s_file)
        print(f"{f}: bbox {bbox}, s_size {s_img.size}")
