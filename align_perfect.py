import sys
import os
from PIL import Image, ImageChops, ImageStat

parts = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"]

for p in parts:
    s_full_name = f"{p}_s.png"
    if p == "humidifier1": s_full_name = "humidifer1_s.png"
    if p == "humidifier2": s_full_name = "humidifer2_s.png"
    s_file = f"assets/{s_full_name}"
    
    old_file = f"assets/cleaned_{p}_s_position.png"
    if p == "humidifier1": old_file = "assets/cleaned_humidifier1_s_position.png"
    if p == "humidifier2": old_file = "assets/cleaned_humidifier2_s_position.png"
    if p == "respirator" and not os.path.exists(old_file):
         old_file = "assets/cleaned_respirotor_s_position.png"

    try:
        s_img = Image.open(s_file).convert("RGBA")
        old_img = Image.open(old_file).convert("RGBA")
        
        # Get alpha channels
        s_alpha = s_img.split()[3]
        o_alpha = old_img.split()[3]
        
        # Threshold s_alpha to binary 255/0 to isolate the core
        s_core = s_alpha.point(lambda p: 255 if p > 128 else 0)
        o_core = o_alpha.point(lambda p: 255 if p > 0 else 0)
        
        s_bbox = s_core.getbbox()
        o_bbox = o_core.getbbox()
        if not s_bbox or not o_bbox:
            print(f"Skipping {p}: empty bounding box")
            continue
            
        # Crop to bounding boxes for faster matching
        s_core_crop = s_core.crop(s_bbox)
        s_w, s_h = s_core_crop.size
        
        # Centers
        cx = (s_bbox[0] + s_bbox[2]) // 2
        cy = (s_bbox[1] + s_bbox[3]) // 2
        ox = (o_bbox[0] + o_bbox[2]) // 2
        oy = (o_bbox[1] + o_bbox[3]) // 2
        
        base_x = ox - cx
        base_y = oy - cy
        
        min_diff = float("inf")
        best_x = base_x
        best_y = base_y
        
        # Search window
        for dy in range(-30, 31):
            for dx in range(-30, 31):
                px = base_x + s_bbox[0] + dx
                py = base_y + s_bbox[1] + dy
                
                # Check bounds inside 1430x1270
                if px < 0 or py < 0 or px + s_w > o_core.width or py + s_h > o_core.height:
                    continue
                    
                o_region = o_core.crop((px, py, px + s_w, py + s_h))
                
                # Difference between the two binary images
                diff = ImageChops.difference(o_region, s_core_crop)
                score = sum(ImageStat.Stat(diff).sum)
                
                if score < min_diff:
                    min_diff = score
                    best_x = base_x + dx
                    best_y = base_y + dy
                    
        paste_x = best_x
        paste_y = best_y
        
        print(f"[{p}] Aligned! Shifted by dx={paste_x - base_x}, dy={paste_y - base_y}. Min Diff: {min_diff}")
        
        # Create new 1430x1270 transparent canvas
        canvas = Image.new("RGBA", (1430, 1270), (0, 0, 0, 0))
        canvas.paste(s_img, (paste_x, paste_y), s_img)
        
        out_file = f"assets/padded_{s_full_name}"
        canvas.save(out_file)
        print(f"  -> Saved {out_file}")
        
    except Exception as e:
        print(f"Failed to process {p}: {e}")
