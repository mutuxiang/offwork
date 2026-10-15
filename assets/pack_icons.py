# -*- coding: utf-8 -*-
"""
pack_icons.py —— 把切好的手绘图标整理成一个可直接取用的文件夹
产出：
  offwork/icons/*.png          44 枚原件（原尺寸、PNG-8 透明底）
  offwork/icons/_all-icons.png 一张总览（8 列，浅底，等比摆放）
  offwork/icons.zip            整个文件夹的压缩包
运行：python pack_icons.py
"""
import os
import shutil
import zipfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'icons')
OUT = os.path.abspath(os.path.join(HERE, '..', 'icons'))
ZIP = os.path.abspath(os.path.join(HERE, '..', 'icons.zip'))

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)

names = sorted(n for n in os.listdir(SRC) if n.lower().endswith('.png'))
for n in names:
    shutil.copy2(os.path.join(SRC, n), os.path.join(OUT, n))

# ---------- 总览 ----------
COLS, CELL, GAP, PAD = 8, 128, 14, 18
rows = (len(names) + COLS - 1) // COLS
W = PAD * 2 + COLS * CELL + (COLS - 1) * GAP
H = PAD * 2 + rows * CELL + (rows - 1) * GAP
sheet = Image.new('RGB', (W, H), (255, 253, 248))

for i, n in enumerate(names):
    im = Image.open(os.path.join(SRC, n)).convert('RGBA')
    im.thumbnail((CELL, CELL), Image.LANCZOS)
    x = PAD + (i % COLS) * (CELL + GAP) + (CELL - im.width) // 2
    y = PAD + (i // COLS) * (CELL + GAP) + (CELL - im.height) // 2
    sheet.paste(im, (x, y), im)

sheet.save(os.path.join(OUT, '_all-icons.png'))

# ---------- 打包 ----------
with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
    for n in sorted(os.listdir(OUT)):
        z.write(os.path.join(OUT, n), 'icons/' + n)

total = sum(os.path.getsize(os.path.join(OUT, n)) for n in os.listdir(OUT) if n.endswith('.png'))
print('图标 %d 枚 -> %s' % (len(names), OUT))
print('总览 %d x %d' % (W, H))
print('共 %.1f KB，压缩包 %.1f KB' % (total / 1024.0, os.path.getsize(ZIP) / 1024.0))
print(' '.join(n[:-4] for n in names))
