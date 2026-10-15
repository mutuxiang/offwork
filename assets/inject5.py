# -*- coding: utf-8 -*-
"""
index-v4-focus.html  ->  index-v5-restart.html

v5「一键从头开始」：
  页眉右侧新增「从头开始」按钮，清空本次演示的全部选择
  （睡觉时间 / 位置授权 / 晚饭方式 / 逐件规划的三件 / 放松 Combo 位置 /
     断连滑块 / 音景选择 / 已完成状态），界面整体重绘后回到首启引导第一屏。
  规格面板与逐屏结构不变。
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # offwork/
SRC = os.path.join(ROOT, "index-v4-focus.html")
DST = os.path.join(ROOT, "index-v5-restart.html")

src = open(SRC, encoding="utf-8").read()
orig_len = len(src)


def sub(old, new, tag=""):
    global src
    n = src.count(old)
    assert n == 1, "锚点不唯一(%d) %s：%r" % (n, tag, old[:60])
    src = src.replace(old, new)


# ================================================================ 1) CSS
sub(
    """.sw:hover{transform:translateY(-1px)}""",
    """.sw:hover{transform:translateY(-1px)}
.sw:active{transform:translateY(0) scale(.97)}
.sw-reset{display:inline-flex;align-items:center;gap:7px}
.sw-reset .ii{width:14px;height:14px}""",
    "CSS")

# ================================================================ 2) 页眉按钮
sub(
    """    <button class="sw" id="soundBtn" aria-pressed="true">音效 · 开</button>""",
    """    <button class="sw" id="soundBtn" aria-pressed="true">音效 · 开</button>
    <button class="sw sw-reset" id="resetBtn" title="清空本次演示的全部选择，回到首次启动引导">
      <span class="ii ii-refresh"></span>从头开始
    </button>""",
    "页眉按钮")

# ================================================================ 3) 重置逻辑
sub(
    """  /* ---------- boot ---------- */""",
    """  /* ---------- 从头开始 ---------- */
  function resetAll(){
    // 画像回到初始：23:30 睡觉 / 位置未授权 / 晚饭有灶
    profile.bed = 23 * 60 + 30;
    profile.geo = null;
    profile.cook = 'A';

    // 逐件规划清空
    planPick = [null, null, null];
    planDur  = {meal:40, walk:20, combo:20};
    planTx   = {meal:{name:'',note:''}, walk:{name:'',note:''}, combo:{name:'',note:''}};

    // 放松 Combo 回到第一张；断连滑块归零
    comboBase = 0; comboIdx = 0;
    swDone = false; setSw(0);

    // 屏内选中态回到初始
    $$('#cookOpts .opt').forEach(function(o){
      o.classList.toggle('on', o.getAttribute('data-cook') === 'A');
    });
    $$('#snds .snd').forEach(function(s, i){ s.classList.toggle('on', i === 0); });
    $('#comboSrc').textContent = '已预定';

    // 派生界面整体重绘，再回到第一屏
    paintProfile();            // 含今晚日程 / 设置页 / 逐件规划
    renderCombo(comboBase);
    go('onb1');
    ding();
    toast('已回到开头');
  }
  $('#resetBtn').addEventListener('click', resetAll);

  /* ---------- boot ---------- */""",
    "重置逻辑")

# ================================================================ 4) 版本标记
sub(
    "<title>OffWork · 前端交互稿 v4 · 每屏一个重点</title>",
    "<title>OffWork · 前端交互稿 v5 · 一键回到开头</title>",
    "标题")
sub(
    '<span class="brand-tag">前端交互稿 · v4 · 每屏一个重点</span>',
    '<span class="brand-tag">前端交互稿 · v5 · 可一键回到开头</span>',
    "版本标签")
sub(
    "稿内按钮、长按、拖动、左滑均可操作；语音识别、AI 生成与音效为模拟。",
    "稿内按钮、长按、拖动、左滑均可操作；语音识别、AI 生成与音效为模拟。"
    "页眉右上「从头开始」清空本次全部选择，回到首启引导。",
    "页头说明")

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST)
print("尺寸 %.1f KB -> %.1f KB" % (orig_len / 1024, len(src.encode('utf-8')) / 1024))
print("屏幕数", src.count('<section class="scr"'), "/ svg", src.count("<svg"))
print("重置按钮", src.count('id="resetBtn"'), "/ resetAll 定义", src.count("function resetAll"))
