from PIL import Image

parts = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"]

for p in parts:
    s_file = f"assets/{p}_s.png"
    if p == "humidifier1": s_file = "assets/humidifer1_s.png"
    if p == "humidifier2": s_file = "assets/humidifer2_s.png"
    try:
        s_img = Image.open(s_file).convert("RGBA")
        # get valid bbox for alpha channel
        bbox = s_img.split()[3].getbbox()
        print(f"{p}_s.png: full_size={s_img.size}, alpha_bbox={bbox}")
        
        # also get the bounding box of the old _position.png
        old_file = f"assets/cleaned_{p}_s_position.png"
        if p == "humidifier1": old_file = "assets/cleaned_humidifier1_s_position.png"
        if p == "humidifier2": old_file = "assets/cleaned_humidifier2_s_position.png"
        if p == "respirator" and not __import__('os').path.exists(old_file):
             old_file = "assets/cleaned_respirotor_s_position.png"
        
        old_img = Image.open(old_file).convert("RGBA")
        old_bbox = old_img.split()[3].getbbox()
        print(f"  --> old bounds in 1430x1270: {old_bbox}")
    except Exception as e:
        print(f"Error {s_file}: {e}")
