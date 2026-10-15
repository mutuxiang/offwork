# -*- coding: utf-8 -*-
"""
把手绘图标（assets/icons/*.png）内嵌进 index.html：
  1) 按文档顺序定位全部 <svg>，逐个替换为背景图 span（仅替换图标类，保留进度环等功能图形）
  2) 注入 .ii-* 的 base64 样式与组件适配规则
  3) 补充装饰性贴纸（月亮 / 太阳 / 波浪线 / 螺旋）
产出：index-v2-icons.html，原 index.html 保留为 v1 回退版本。
"""
import base64, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # offwork/
SRC = os.path.join(ROOT, "index.html")
DST = os.path.join(ROOT, "index-v2-icons.html")
ICON_DIR = os.path.join(ROOT, "assets", "icons")

NAMES = ["rain", "train", "fire", "wave", "wind", "rail", "clock", "pin", "mic",
         "refresh", "play", "power", "home", "star", "chart", "flower",
         "blob", "spiral", "sun", "check", "arrow", "moon", "squiggle", "door"]


def data_uri(name):
    with open(os.path.join(ICON_DIR, name + ".png"), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


CSS = ["/* ---------- 手绘图标：生图素材 → 抠底 → 内嵌 ---------- */",
       ".ii{display:inline-block;flex:0 0 auto;background-repeat:no-repeat;"
       "background-position:center;background-size:contain}",
       "/* 深底场景（墨色按钮 / 沉浸态导航）反相为浅色描边 */",
       ".ii-inv{filter:invert(1) hue-rotate(180deg)}"]
for n in NAMES:
    CSS.append(".ii-%s{background-image:url(\"%s\")}" % (n, data_uri(n)))

CSS += [
    "/* 组件适配 */",
    ".snd .ic{position:absolute;top:8px;right:9px;width:30px;height:30px;"
    "display:flex;align-items:center;justify-content:center;border-radius:50%;opacity:1}",
    ".snd.on .ic{background:var(--paper)}",
    ".tab .ii{opacity:.42;transition:opacity .18s}",
    ".tab.on .ii{opacity:1}",
    ".device.immersive .tab .ii{filter:invert(1) hue-rotate(180deg)}",
    ".an-card{position:relative;overflow:hidden}",
    "@keyframes iiSpin{to{transform:rotate(360deg)}}",
]

ARROW = '<span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>'
TICK = '<span class="tick"><span class="ii ii-check ii-inv" style="width:14px;height:14px"></span></span>'
SND = ('<span class="ic"><span class="ii ii-%s" style="width:21px;height:21px"></span></span>')

# 按文档顺序的 33 个 <svg>：下标 -> 新标记（None = 保留）
REPLACE = {
    3: '<span class="ii ii-flower deco" style="position:absolute;right:-26px;top:-26px;width:104px;'
       'height:104px;transform:rotate(9deg)"></span>',
    4: '<span class="ii ii-clock" style="width:19px;height:19px"></span>',
    5: '<span class="ii ii-pin" style="width:19px;height:19px"></span>',
    6: ARROW,
    8: '<span class="ii ii-mic mic-ic ii-inv" style="width:52px;height:52px"></span>',
    9: '<span class="ii ii-star deco" style="right:-12px;bottom:-18px;width:94px;'
       'height:94px;transform:rotate(-12deg)"></span>',
    10: ARROW,
    11: ARROW,
    12: SND % "rain", 13: SND % "train", 14: SND % "fire",
    15: SND % "wave", 16: SND % "wind", 17: SND % "rail",
    18: ARROW,
    19: TICK, 20: TICK, 21: TICK,
    22: ARROW,
    23: '<span class="ii ii-door deco" style="left:-30px;bottom:116px;width:152px;'
        'height:152px;transform:rotate(-4deg)"></span>',
    24: ARROW,
    25: '<span class="ii ii-refresh" style="width:21px;height:21px"></span>',
    26: '<span class="ii ii-play ii-inv" style="width:16px;height:16px"></span>',
    28: '<span class="ii ii-blob deco" style="right:-26px;bottom:-32px;width:116px;'
        'height:116px;opacity:.24;transform:rotate(-8deg)"></span>',
    29: '<span class="ii ii-home" style="width:23px;height:23px"></span>',
    30: '<span class="ii ii-star" style="width:23px;height:23px"></span>',
    31: '<span class="ii ii-chart" style="width:23px;height:23px"></span>',
    32: '<span class="ii ii-power ii-inv" style="width:46px;height:46px;opacity:.7"></span>',
}

src = open(SRC, encoding="utf-8").read()

# 1) 替换 <svg>
spans = [m.span() for m in re.finditer(r"<svg\b.*?</svg>", src, re.S)]
print("svg 总数", len(spans))
assert len(spans) == 33, "svg 数量与预期不符，先核对结构"

out, last = [], 0
for i, (a, b) in enumerate(spans):
    out.append(src[last:a])
    out.append(REPLACE[i] if i in REPLACE else src[a:b])
    last = b
out.append(src[last:])
src = "".join(out)

# 2) 注入样式
assert src.count("</style>") == 1
src = src.replace("</style>", "\n".join(CSS) + "\n</style>", 1)

# 3) 装饰性贴纸
DECO = [
    ('<section class="scr" id="scr-pod">\n          <div class="kicker">',
     '<section class="scr" id="scr-pod">\n'
     '          <span class="ii ii-moon deco" style="position:absolute;z-index:3;right:-14px;top:-12px;'
     'width:76px;height:76px;transform:rotate(14deg)"></span>\n          <div class="kicker">'),
    ('<section class="scr" id="scr-dash">\n          <div class="kicker">',
     '<section class="scr" id="scr-dash">\n'
     '          <span class="ii ii-sun deco" style="position:absolute;right:-22px;top:-18px;width:92px;'
     'height:92px;transform:rotate(10deg)"></span>\n          <div class="kicker">'),
    ('<div class="an-card">\n          <div class="an-dots">',
     '<div class="an-card">\n'
     '          <span class="ii ii-spiral" style="position:absolute;right:-16px;top:-16px;'
     'width:66px;height:66px;animation:iiSpin 9s linear infinite"></span>\n'
     '          <div class="an-dots">'),
    ('          <div class="spacer"></div>\n          <div class="btn-row">',
     '          <span class="ii ii-squiggle" style="width:100%;height:24px;'
     'opacity:.55;margin:2px 0"></span>\n          <div class="btn-row">'),
]
for old, new in DECO:
    n = src.count(old)
    assert n == 1, "锚点不唯一(%d)：%s" % (n, old[:46])
    src = src.replace(old, new, 1)

src = src.replace("<title>OffWork · 前端交互稿 v1</title>",
                  "<title>OffWork · 前端交互稿 v2 · 手绘图标</title>", 1)

# 4) 版本号与素材说明
FONT_NOTE = ('低饱和粉彩 + 2px 黑色描边 + 硬投影，构成新粗野主义但更柔和的对比关系。'
             '标题用超大字重与斜体混排制造杂志感，交互元素统一为胶囊形。')
TEXT = [
    ('<span class="brand-tag">前端交互稿 · v1</span>',
     '<span class="brand-tag">前端交互稿 · v2 · 手绘图标</span>'),
    ('语音识别、AI 生成与音效为模拟。</p>',
     '语音识别、AI 生成与音效为模拟。全站图标为手绘素材：由生图模型产出、抠底去背后'
     '以 PNG-8 内嵌，深浅底色下自动反相。</p>'),
    ('<div class="font-note">%s</div>' % FONT_NOTE,
     '<div class="font-note">%s</div>\n      <div class="font-note" style="margin-top:10px">'
     '<b>图标素材</b>：24 枚手绘图标由生图模型批量产出（每批 2×2 贴纸带），'
     '按内容投影切分、白底泛洪抠除背景，压成 PNG-8 后 base64 内嵌，总计约 161 KB。</div>' % FONT_NOTE),
]
for old, new in TEXT:
    n = src.count(old)
    assert n == 1, "文案锚点不唯一(%d)：%s" % (n, old[:40])
    src = src.replace(old, new, 1)

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST, os.path.getsize(DST), "bytes / 剩余 svg", src.count("<svg"))
