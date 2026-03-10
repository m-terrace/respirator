from PIL import Image

parts = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"]

for p in parts:
    pos_file = f"assets/cleaned_{p}_s_position.png"
    # fix spelling for humidifier
    if p == "humidifier1": pos_file = "assets/cleaned_humidifier1_s_position.png"
    if p == "humidifier2": pos_file = "assets/cleaned_humidifier2_s_position.png"
    # fix respirotor
    if p == "respirator":
        try:
            Image.open(pos_file)
        except:
            pos_file = "assets/cleaned_respirotor_s_position.png"
            
    img = Image.open(pos_file)
    bbox = img.convert("RGBA").split()[3].getbbox()
    
    # Also load the matching _s.png
    s_file = f"assets/{p}_s.png"
    if p == "humidifier1": s_file = "assets/humidifer1_s.png"
    if p == "humidifier2": s_file = "assets/humidifer2_s.png"
    try:
        s_img = Image.open(s_file)
        print(f"{p}: cleaned pos bbox {bbox}, new _s size {s_img.size}")
    except Exception as e:
        print(f"Error loading {s_file}: {e}")
