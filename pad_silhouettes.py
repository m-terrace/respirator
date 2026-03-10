from PIL import Image

parts = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"]

for p in parts:
    s_full_name = f"{p}_s.png"
    if p == "humidifier1": s_full_name = "humidifer1_s.png"
    if p == "humidifier2": s_full_name = "humidifer2_s.png"
    s_file = f"assets/{s_full_name}"
    
    old_file = f"assets/cleaned_{p}_s_position.png"
    if p == "humidifier1": old_file = "assets/cleaned_humidifier1_s_position.png"
    if p == "humidifier2": old_file = "assets/cleaned_humidifier2_s_position.png"
    if p == "respirator" and not __import__('os').path.exists(old_file):
         old_file = "assets/cleaned_respirotor_s_position.png"

    try:
        s_img = Image.open(s_file).convert("RGBA")
        old_img = Image.open(old_file).convert("RGBA")
        
        # Get bounds
        s_bbox = s_img.split()[3].getbbox()
        o_bbox = old_img.split()[3].getbbox()
        
        # Calculate centers
        cx = (s_bbox[0] + s_bbox[2]) / 2.0
        cy = (s_bbox[1] + s_bbox[3]) / 2.0
        
        ox = (o_bbox[0] + o_bbox[2]) / 2.0
        oy = (o_bbox[1] + o_bbox[3]) / 2.0
        
        # Calculate paste position for the top-left of s_img
        paste_x = int(round(ox - cx))
        paste_y = int(round(oy - cy))
        
        # Create new 1430x1270 transparent canvas
        canvas = Image.new("RGBA", (1430, 1270), (0, 0, 0, 0))
        canvas.paste(s_img, (paste_x, paste_y), s_img)
        
        # Save output
        out_file = f"assets/padded_{s_full_name}"
        canvas.save(out_file)
        print(f"Generated {out_file} (pasted at {paste_x}, {paste_y})")
        
    except Exception as e:
        print(f"Failed to process {p}: {e}")
