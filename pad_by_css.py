from PIL import Image, ImageChops, ImageStat
import os

targets = {
    1: {"left": 375.5, "top": 72.3, "width": 115.7, "height": 122.8},
    2: {"left": 681.6, "top": 129.0, "width": 119.4, "height": 42.7},
    3: {"left": 661.6, "top": 144.5, "width": 29.5, "height": 55.9},
    4: {"left": 452.2, "top": 182.7, "width": 31.7, "height": 33.6},
    5: {"left": 545.2, "top": 109.0, "width": 65.0, "height": 93.7},
    6: {"left": 547.8, "top": 97.7, "width": 60.5, "height": 39.3},
    7: {"left": 374.0, "top": 181.9, "width": 450.5, "height": 226.4},
    8: {"left": 460.5, "top": 88.2, "width": 107.3, "height": 159.1}
}

parts = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"]
scale = 480.0 / 1270.0
x_offset = (1200.0 - (1430.0 * scale)) / 2.0

for i, p in enumerate(parts):
    t = targets[i+1]
    left_1430 = (t["left"] - x_offset) / scale
    top_1430 = t["top"] / scale
    w_1430 = t["width"] / scale
    h_1430 = t["height"] / scale
    
    ox = left_1430 + w_1430 / 2.0
    oy = top_1430 + h_1430 / 2.0
    
    s_full_name = f"{p}_s.png"
    if p == "humidifier1": s_full_name = "humidifer1_s.png"
    if p == "humidifier2": s_full_name = "humidifer2_s.png"
    s_file = f"assets/{s_full_name}"
    
    try:
        s_img = Image.open(s_file).convert("RGBA")
        s_alpha = s_img.split()[3]
        s_core = s_alpha.point(lambda pix: 255 if pix > 128 else 0)
        s_bbox = s_core.getbbox()
        if not s_bbox: s_bbox = s_alpha.getbbox()
            
        cx = (s_bbox[0] + s_bbox[2]) / 2.0
        cy = (s_bbox[1] + s_bbox[3]) / 2.0
        
        paste_x = int(round(ox - cx))
        paste_y = int(round(oy - cy))
        
        print(f"[{p}] Pasting at {paste_x}, {paste_y}")
        canvas = Image.new("RGBA", (1430, 1270), (0, 0, 0, 0))
        canvas.paste(s_img, (paste_x, paste_y), s_img)
        
        out_file = f"assets/padded_{s_full_name}"
        canvas.save(out_file)
        
    except Exception as e:
        print(f"Error {p}: {e}")
