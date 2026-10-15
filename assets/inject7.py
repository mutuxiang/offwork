# -*- coding: utf-8 -*-
"""
index-v6-tonight.html  ->  index-v7-tonight.html

v7 收口（不改结构，只对齐口径与补漏）：
  1. 默认日程就带「看一集剧 + 读几页书」，不再只靠用户在逐件规划里选；
     自由留白随之由 97 分钟缩到 66 分钟
  2. 通勤过渡舱 50′ -> 24′，与「还有 22 分钟到家 / 19:04 站内 GPS」和
     逐件规划的「到家 19:04」对齐；时间轴不再出现 19:04 到家却在 19:30 吃饭
  3. 逐件规划：状态数组补到 4 位、末件文案「三件都定了」->「四件都定了」、
     推荐项在第 4 件默认落在「剧和书都要」，与默认日程一致
  4. 仪表盘充电池读数改为跟随用户自评（未自评时显示昨日基线），
     不再出现「自己在完成页打 70%、仪表盘还写 73%」
  5. 规格面板同步（四件、默认排入看剧读书）
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index-v6-tonight.html")
DST = os.path.join(ROOT, "index-v7-tonight.html")

src = open(SRC, encoding="utf-8").read()
orig_len = len(src)


def sub(old, new, tag=""):
    global src
    n = src.count(old)
    assert n == 1, "锚点不唯一(%d) %s：%r" % (n, tag, old[:70])
    src = src.replace(old, new)


# ================================================================ 1) 默认排入看剧 / 读书
sub("  var planDur  = {meal:40, walk:20, combo:20, watch:0, read:0}; // 选中后的时长（watch/read 由第 4 件成套写入）",
    "  var planDur  = {meal:40, walk:20, combo:20, watch:45, read:25}; // 默认就排看剧与读书，第 4 件可改写或清零",
    "planDur 初值")

sub("    planDur  = {meal:40, walk:20, combo:20};",
    "    planDur  = {meal:40, walk:20, combo:20, watch:45, read:25};",
    "resetAll planDur")

# ================================================================ 2) 通勤过渡舱 50 -> 24
sub("    {ic:'rain',  bg:'var(--blue)',   name:'通勤过渡舱',  note:'雨声 + 4-7-8 呼吸',     min:50},",
    "    {ic:'rain',  bg:'var(--blue)',   name:'通勤过渡舱',  note:'雨声 + 4-7-8 呼吸',     min:24},",
    "通勤过渡舱时长")
sub("              <span>4-7-8 · 4 轮 ≈ 到站</span>",
    "              <span>4-7-8 · 呼吸四轮</span>",
    "呼吸条文案")

# ================================================================ 3) 逐件规划状态补位与文案
sub("  var planPick = [null, null, null];           // 每一步选中的下标",
    "  var planPick = [null, null, null, null];     // 每一步选中的下标",
    "planPick 长度")
sub("  function planRec(i){ return i === 0 ? ({A:0, B:1, C:2}[profile.cook] || 0) : 0; }",
    "  function planRec(i){\n"
    "    if(i === 0) return ({A:0, B:1, C:2}[profile.cook] || 0);   // 晚饭默认取自「我的画像」\n"
    "    if(i === 3) return 2;                                      // 睡前默认「剧和书都要」，与日程默认一致\n"
    "    return 0;\n"
    "  }",
    "planRec")
sub("        '<div class=\"pp-n\">三件都定了</div>' +",
    "        '<div class=\"pp-n\">四件都定了</div>' +",
    "末件文案")

# ================================================================ 4) 仪表盘充电池跟随自评
sub("""            <div class="stat">
              <b>73<small>%</small></b>
              <span>充电池 · 昨日 58%</span>
            </div>""",
    """            <div class="stat">
              <b><span id="battPct">73</span><small>%</small></b>
              <span id="battCap">充电池 · 昨日 58%</span>
            </div>""",
    "仪表盘充电池")

sub("""  $('#scoreRow').addEventListener('click', function(e){""",
    """  function paintDash(){
    var p = $('#battPct'), c = $('#battCap');
    if(!p) return;
    if(scorePct > 0){ p.textContent = String(scorePct); c.textContent = '充电池 · 今日自评'; }
    else { p.textContent = '73'; c.textContent = '充电池 · 昨日 58%'; }
  }

  $('#scoreRow').addEventListener('click', function(e){""",
    "paintDash")

sub("    if(id === 'dash') setTimeout(runBars, 120);",
    "    if(id === 'dash'){ setTimeout(runBars, 120); paintDash(); }",
    "go dash 钩子")

# 自评后再看仪表盘：退出完成屏时也刷新一次
sub("""  function setScore(p){
    scorePct = p;""",
    """  function setScore(p){
    scorePct = p;
    paintDash();""",
    "setScore 联动")

# ================================================================ 5) SPEC 同步
sub("      '<b>交互</b>：晚饭 / 散步 / 放松三件依次问一遍，选完一件自动进入下一件，底部实时排出到点时间与之后的留白。',",
    "      '<b>交互</b>：晚饭 / 散步 / 放松 / 睡前看点什么四件依次问一遍，选完一件自动进入下一件，底部实时排出到点时间与之后的留白。',",
    "SPEC podplan 交互")
sub("      '选择直接写进 Tab 2 的今晚日程：时长为 0 的块整格不排，晚饭那一档的默认项取自「我的画像」。',",
    "      '选择直接写进 Tab 2 的今晚日程：时长为 0 的块整格不排；不选则用默认值，晚饭取自「我的画像」，睡前取自推荐剧集与短篇。',",
    "SPEC podplan 写入")
sub("      '<b>看剧 / 读书</b>：默认推荐《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定里改或取消。',",
    "      '<b>看剧 / 读书</b>：默认就排入《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定第 4 件改成只看剧、只读书或都不看。',",
    "SPEC combo 看剧读书")
sub("  var PP_ETA = 19 * 60 + 4;                    // 预计到家 19:04",
    "  var PP_ETA = 19 * 60 + 4;                    // 预计到家 19:04（= 关机仪式 10′ + 通勤过渡舱 24′）",
    "PP_ETA 注释")

# ================================================================ 6) 版本标记
for old, new in [
    ("<title>OffWork · 前端交互稿 v6 · 今晚排满</title>",
     "<title>OffWork · 前端交互稿 v7 · 今晚排满</title>"),
    ('<span class="brand-tag">前端交互稿 · v6 · 今晚排满</span>',
     '<span class="brand-tag">前端交互稿 · v7 · 今晚排满</span>'),
]:
    sub(old, new, "版本标记")

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST)
print("尺寸 %.1f KB -> %.1f KB" % (orig_len / 1024, len(src.encode('utf-8')) / 1024))
print("屏幕数", src.count('<section class="scr"'), "/ svg", src.count("<svg"))
print("残留：三件都定了", src.count("三件都定了"), "/ watch:0", src.count("watch:0"))
