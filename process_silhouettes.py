from PIL import Image
import os
import glob

def make_transparent(base_path, overlay_path, output_path, threshold=10):
    print(f"Processing {overlay_path}...")
    base_img = Image.open(base_path).convert('RGBA')
    overlay_img = Image.open(overlay_path).convert('RGBA')
    
    if base_img.size != overlay_img.size:
        print("Size mismatch!")
        return
        
    width, height = base_img.size
    base_pixels = base_img.load()
    overlay_pixels = overlay_img.load()
    
    for y in range(height):
        for x in range(width):
            br, bg, bb, ba = base_pixels[x, y]
            or_, og, ob, oa = overlay_pixels[x, y]
            
            # If the overlay pixel is essentially the same as the base pixel, it's not the silhouette part.
            # Make it transparent!
            diff = abs(br - or_) + abs(bg - og) + abs(bb - ob)
            if diff <= threshold:
                overlay_pixels[x, y] = (0, 0, 0, 0) # Fully transparent
                
    overlay_img.save(output_path)
    print(f"Saved {output_path}")

base = "assets/all.PNG"
files = [
    "respirator_s_position.png",
    "bag_s_position.png",
    "connect_s_position.png",
    "filter_s_position.png",
    "humidifier1_s_position.png",
    "humidifier2_s_position.png",
    "kairo1_s_position.png",
    "kairo2_s_position.png"
]

target_files = []
# Ensure we catch variations like respirotor
for path in glob.glob("assets/*_s_position.png"):
    target_files.append(os.path.basename(path))

for file in set(files + target_files):
    in_path = os.path.join("assets", file)
    if not os.path.exists(in_path):
        continue
        
    out_path = os.path.join("assets", "cleaned_" + file)
    make_transparent(base, in_path, out_path)
