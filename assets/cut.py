# -*- coding: utf-8 -*-
"""
把生图产出的 2x2 贴纸带：
  1) 按「白色背景」做抠底（边界泛洪 + 容差），输出带 alpha 的图
  2) 按内容投影切出 4 个格子（不依赖模型是否严格对齐网格）
  3) 按内容 bbox 裁紧、等比缩放到目标边长，导出 PNG
"""
import os, sys, json, glob
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "icons")
os.makedirs(OUT, exist_ok=True)


def remove_white(im, tol=26, feather=1.2):
    """行囊式泛洪：从四边把接近白的像素标为背景，其余保留为前景。"""
    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    h, w, _ = rgb.shape
    # 背景判据：三通道都亮，且通道间差异小（排除淡色填色）
    mn = rgb.min(axis=2)
    mx = rgb.max(axis=2)
    near_white = (mn >= 255 - tol) & ((mx - mn) <= 12)

    # 只在「与边界连通」的白区才判为背景，避免把图案内部的白色挖空
    bg = np.zeros((h, w), dtype=bool)
    stack = []
    for x in range(w):
        for y in (0, h - 1):
            if near_white[y, x] and not bg[y, x]:
                bg[y, x] = True; stack.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near_white[y, x] and not bg[y, x]:
                bg[y, x] = True; stack.append((y, x))
    while stack:
        y, x = stack.pop()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx] and near_white[ny, nx]:
                bg[ny, nx] = True; stack.append((ny, nx))

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    a = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(feather))
    # 泛洪边缘的不透明像素轻微羽化，去掉锯齿
    a = a.point(lambda v: 0 if v < 40 else (255 if v > 200 else int((v - 40) * 255 / 160)))
    out = im.convert("RGBA")
    out.putalpha(a)
    return out


def split_cells(im, gap_min=14):
    """按 alpha 内容的行列投影找空隙，切成若干块（左上→右下）。"""
    a = np.asarray(im)[:, :, 3]
    mask = a > 30
    rows = mask.any(axis=1)
    cols = mask.any(axis=0)

    def bands(flags, gap_min):
        out, start = [], None
        run = 0
        for i, f in enumerate(flags):
            if f:
                if start is None:
                    start = i
                run = 0
            else:
                if start is not None:
                    run += 1
                    if run >= gap_min:
                        out.append((start, i - run))
                        start = None
                        run = 0
        if start is not None:
            out.append((start, len(flags) - 1))
        return out

    rb = bands(rows, gap_min)
    cb = bands(cols, gap_min)
    if len(rb) < 2 or len(cb) < 2:
        # 回退：直接均分 2x2
        h, w = mask.shape
        rb = [(0, h // 2 - 1), (h // 2, h - 1)]
        cb = [(0, w // 2 - 1), (w // 2, w - 1)]
        nrow, ncol = 2, 2
    else:
        nrow, ncol = len(rb), len(cb)

    cells = []
    for r0, r1 in rb:
        for c0, c1 in cb:
            piece = im.crop((c0, r0, c1 + 1, r1 + 1))
            cells.append(piece)
    return cells, nrow, ncol


def trim_and_fit(im, size, pad_ratio=0.06):
    """裁到内容 bbox（含内边距），再等比缩放进 size×size 的正方形画布。"""
    a = np.asarray(im)[:, :, 3]
    ys, xs = np.where(a > 24)
    if len(ys) == 0:
        return Image.new("RGBA", (size, size), (0, 0, 0, 0))
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = im.crop((x0, y0, x1, y1))
    cw, ch = crop.size
    side = max(cw, ch)
    inner = int(side * (1 + pad_ratio * 2))
    scale = size / inner
    crop = crop.resize((max(1, int(cw * scale)), max(1, int(ch * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(crop, ((size - crop.width) // 2, (size - crop.height) // 2), crop)
    return canvas


# 每张素材带 -> 4 个图标名（按 上左 / 上右 / 下左 / 下右）
SHEETS = [
    ("s1/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-23-05.png", ["rain", "train", "fire", "wave"]),
    ("s1/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-23-04.png", ["wind", "rail", "clock", "pin"]),
    ("s1/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-23-03.png", ["mic", "refresh", "play", "power"]),
    ("g5/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-23-45.png", ["home", "star", "chart", "flower"]),
    ("deco/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-24-15.png", ["blob", "spiral", "sun", "check"]),
    ("nav/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-27-57.png", ["arrow", "moon", "squiggle", "door"]),
    # v3：首启引导与睡前日程
    ("n1/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-48-08.png", ["bed", "compass", "pan", "bowl"]),
    ("n2/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-48-22.png", ["shoe", "tooth", "sofa", "calendar"]),
    ("n3/A_sticker_sheet_of_4_hand_draw_2026-10-14T11-48-40.png", ["bulb", "mug", "bubble", "leaf"]),
    # v4：设置页与今晚 Tab
    ("n4/A_2x2_grid_of_4_hand_drawn_sti_2026-10-14T13-10-29.png", ["gear", "bell", "lock", "tag"]),
    # v6：日程里的看剧 / 读书
    ("n5/A_sticker_sheet__2x2_grid_of_4_2026-10-14T13-35-18.png", ["tv", "book", "popcorn", "remote"]),
]

# 只保留：需要微调的尺寸（其余用 DEFAULT_SIZE）
SIZE = {"mic": 160, "blob": 256, "spiral": 256, "sun": 256, "check": 256,
        "moon": 160, "door": 160, "squiggle": 256, "arrow": 128,
        "bed": 160, "compass": 160, "tv": 160, "book": 160}
DEFAULT_SIZE = 128


def pack_png8(img, path, colors=48):
    """转 PNG-8 并保留二值 alpha：手绘图形色阶本就少，缩到显示尺寸不会有可见损失。"""
    a = np.asarray(img)[:, :, 3]
    bg = Image.new("RGB", img.size, (255, 255, 255))
    bg.paste(img.convert("RGB"), (0, 0), img)
    q = bg.quantize(colors=colors, method=Image.MEDIANCUT, dither=Image.NONE)
    idx = np.array(q)
    tid = colors
    idx = np.where(a < 128, tid, idx).astype(np.uint8)
    out = Image.fromarray(idx, "P")
    pal = (q.getpalette() or [])[:colors * 3]
    pal = pal + [0] * (colors * 3 - len(pal)) + [255, 255, 255]
    out.putpalette(pal)
    out.save(path, optimize=True, transparency=tid)

report = []
for rel, names in SHEETS:
    path = os.path.join(ROOT, "gen", rel)
    if not os.path.exists(path):
        print("MISSING", rel); continue
    src = Image.open(path).convert("RGBA")
    cut = remove_white(src)
    cells, nrow, ncol = split_cells(cut)
    if len(cells) != len(names):
        print("!! cell count %d vs names %d for %s" % (len(cells), len(names), rel))
    for i, name in enumerate(names):
        if i >= len(cells):
            break
        size = SIZE.get(name, DEFAULT_SIZE)
        icon = trim_and_fit(cells[i], size)
        dst = os.path.join(OUT, name + ".png")
        pack_png8(icon, dst, colors=64 if size > 128 else 48)
        op = (np.asarray(icon)[:, :, 3] > 24).mean()
        report.append({"name": name, "file": dst, "size": size,
                       "ink_ratio": round(float(op), 4),
                       "bytes": os.path.getsize(dst)})

total = sum(r["bytes"] for r in report)
print("total bytes", total, "-> base64 approx", int(total * 4 / 3))
print(json.dumps(report, ensure_ascii=False))
