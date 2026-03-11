def scale(origX, origY, origW, origH):
    # all.PNG (1430x1270) ベースの座標系
    # canvas -> display: scale=480/1270, x_offset=(1200-1430*scale)/2
    s = 480.0 / 1270.0      # 0.37795
    offX = (1200.0 - 1430.0 * s) / 2.0  # 329.76
    return (offX + origX * s, origY * s, origW * s, origH * s)

# all.PNG (1430x1270) 上の各パーツ座標 (x, y, w, h) in canvas pixels
# all2.png (1280x1280) 元座標から dx=82, dy=192 オフセット補正済み
targets = [
    (1, 121, 284, 306, 325),   # respirator  (旧: 39,92)
    (2, 931, 434, 316, 113),   # bag         (旧: 849,242)
    (3, 878, 475, 78, 148),    # connect     (旧: 796,283)
    (4, 324, 576, 84, 89),     # filter      (旧: 242,384)
    (5, 570, 381, 172, 248),   # humidifier1 (旧: 488,189)
    (6, 577, 351, 160, 104),   # humidifier2 (旧: 495,159)
    (7, 117, 574, 1192, 599),  # kairo1      (旧: 35,382)
    (8, 346, 326, 284, 421)    # kairo2      (旧: 264,134)
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
