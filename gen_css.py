def scale(origX, origY, origW, origH):
    s = 0.375
    offX = 360
    return (offX + origX * s, origY * s, origW * s, origH * s)

targets = [
    (1, 39, 92, 306, 325),
    (2, 849, 242, 316, 113),
    (3, 796, 283, 78, 148),
    (4, 242, 384, 84, 89),
    (5, 488, 189, 172, 248),
    (6, 495, 159, 160, 104),
    (7, 35, 382, 1192, 599),
    (8, 264, 134, 284, 421)
]

print("/* 各ターゲットの位置とサイズ（仮の当たり判定領域） */")
for tid, x, y, w, h in targets:
    vx, vy, vw, vh = scale(x, y, w, h)
    name = ["respirator", "bag", "connect", "filter", "humidifier1", "humidifier2", "kairo1", "kairo2"][tid-1]
    # Expand hitbox slightly logic:
    # Just exact matching first
    if tid > 1:
        print(f"/* {name} (target-{tid}) */")
    print(f"#target-{tid} {{")
    print(f"    left: {vx:.1f}px;")
    print(f"    top: {vy:.1f}px;")
    print(f"    width: {vw:.1f}px;")
    print(f"    height: {vh:.1f}px;")
    print("}")
    print()
