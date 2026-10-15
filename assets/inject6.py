# -*- coding: utf-8 -*-
"""
index-v5-restart.html  ->  index-v6-tonight.html

v6「今晚」结构重整：
  1. 日程不再大片留白：加入「看一集剧」「读几页书」两格（推荐《漫长的季节》第 1 集 /
     《夜晚的潜水艇》一个短篇），并把「睡前看点什么」并入通勤预定，成为第 4 件
  2. 删除 evening 屏（kicker 原为「Tab 1 · 模块二 · 进门之后」，属旧结构）
  3. 「这一件」屏两态合一：待选态保留三选一轮播，点开始后同屏切为今晚日程 + 倒计时 /
     暂停 / 结束；独立「进行中」屏随之删除（Tab 2 由 4 屏收为 2 屏）
  4. 完成反馈的「充电池」改为自己评定：给五档自评按钮，选多少填多少，取消自动 +15%
  5. 新增两枚手绘图标 tv / book（同一生图-抠底-内嵌管线）
"""
import base64, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # offwork/
SRC = os.path.join(ROOT, "index-v5-restart.html")
DST = os.path.join(ROOT, "index-v6-tonight.html")
ICON_DIR = os.path.join(ROOT, "assets", "icons")
NEW_ICONS = ["tv", "book"]


def data_uri(name):
    with open(os.path.join(ICON_DIR, name + ".png"), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


src = open(SRC, encoding="utf-8").read()
orig_len = len(src)


def sub(old, new, tag=""):
    global src
    n = src.count(old)
    assert n == 1, "锚点不唯一(%d) %s：%r" % (n, tag, old[:70])
    src = src.replace(old, new)


def cut(a_mark, b_mark, tag=""):
    """删掉 a_mark .. b_mark 之间的整段（含 a，不含 b）。"""
    global src
    assert src.count(a_mark) == 1, "起点不唯一 %s：%r" % (tag, a_mark[:70])
    i = src.find(a_mark)
    j = src.find(b_mark, i + 1)
    assert j != -1 and i < j, "终点找不到 %s：%r" % (tag, b_mark[:70])
    src = src[:i] + src[j:]


# ================================================================ 1) 新增图标
ICON_CSS = "".join('.ii-%s{background-image:url("%s")}\n' % (n, data_uri(n)) for n in NEW_ICONS)
sub('.ii{display:inline-block;flex:0 0 auto;background-repeat:no-repeat;',
    ICON_CSS + '.ii{display:inline-block;flex:0 0 auto;background-repeat:no-repeat;',
    "新增图标")

# ================================================================ 2) 追加 v6 样式
V6_CSS = """
/* ---------- v6：「这一件」两态 + 充电池自评 ---------- */
#cbPick,#cbRun{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
#cbPick.cb-off,#cbRun.cb-off{display:none}

.now-bar{
  display:flex;align-items:center;gap:10px;margin-top:12px;
  border:2px solid var(--ink);border-radius:18px;background:var(--paper);padding:11px 13px;
}
.now-ic{
  width:30px;height:30px;flex:0 0 auto;border-radius:9px;
  border:1.5px solid var(--ink);display:flex;align-items:center;justify-content:center;
}
.now-tx{flex:1;min-width:0}
.now-tx b{display:block;font-size:12.5px;font-weight:800;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.now-tx span{display:block;font-size:10px;font-weight:700;color:var(--ink-3);margin-top:2px}
.now-t{flex:0 0 auto;text-align:right}
.now-t b{display:block;font-size:19px;font-weight:800;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.now-t span{display:block;font-size:9px;font-weight:800;letter-spacing:.1em;color:var(--ink-3);margin-top:3px}

.tl.now{background:var(--yellow);margin:0 -14px;padding:5px 14px;border-bottom-color:transparent}
.tl.now .tl-n>span em{color:rgba(20,20,20,.55)}
.tl.now .tl-b{background:rgba(20,20,20,.16)}

.score-row{display:flex;gap:6px;margin-top:11px}
.score{
  flex:1;font-family:var(--font);font-size:11.5px;font-weight:800;cursor:pointer;
  padding:9px 0;border-radius:999px;border:2px solid var(--ink);
  background:transparent;color:var(--ink);transition:background .15s,color .15s,transform .12s;
}
.score:hover{transform:translateY(-1px)}
.score.on{background:var(--ink);color:var(--cream)}
"""
sub("</style>", V6_CSS + "</style>", "v6 样式")

# ================================================================ 3) 侧栏 Tab 2 分组
sub(
    """      <h4>Tab 2 · <span>今晚</span></h4>
      <button class="ritem" data-go="evening"><i></i>今晚日程</button>
      <button class="ritem" data-go="combo"><i></i>这一件</button>
      <button class="ritem" data-go="run"><i></i>进行中</button>
      <button class="ritem" data-go="done"><i></i>完成反馈</button>""",
    """      <h4>Tab 2 · <span>今晚</span></h4>
      <button class="ritem" data-go="combo"><i></i>这一件 · 今晚日程</button>
      <button class="ritem" data-go="done"><i></i>完成反馈 · 自己打分</button>""",
    "侧栏 Tab 2")

# ================================================================ 4) 删 evening 屏
cut("        <!-- ============ 8-A. 睡前日程 ============ -->",
    "        <!-- ============ 8. 放松 Combo ============ -->",
    "删 evening 屏")

# ================================================================ 5) combo 屏重写
COMBO_NEW = """        <!-- ============ 8. 这一件（待选 / 进行中） ============ -->
        <section class="scr" id="scr-combo">
          <div class="kicker">Tab 2 · <b>这一件</b></div>

          <div id="cbPick">
            <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-bottom:14px">
              <h1 class="h1" style="margin:0;font-size:22px">今晚为你留的<br>三个选择</h1>
              <span class="chip p" id="comboSrc">已预定</span>
            </div>

            <div class="carousel" id="carousel">
              <div class="track" id="track"></div>
            </div>
            <div class="dots" id="dots"></div>

            <div class="spacer"></div>
            <div class="combo-bar">
              <button class="icon-btn" id="comboNext" aria-label="换一批">
                <span class="ii ii-refresh" style="width:21px;height:21px"></span>
              </button>
              <button class="btn" id="comboStart" style="flex:1">开始这一件
                <span class="ii ii-play ii-inv" style="width:16px;height:16px"></span>
              </button>
            </div>
          </div>

          <div id="cbRun" class="cb-off">
            <h1 class="h1" style="font-size:23px;margin:0 0 12px">今晚从 18:30<br>排到 <span id="cbBedLbl">23:30</span>。</h1>
            <div class="tl-wrap" id="tlWrap"></div>

            <div class="spacer"></div>
            <div class="now-bar">
              <span class="now-ic" id="nowIc" style="background:var(--yellow)">
                <span class="ii ii-sofa" style="width:16px;height:16px"></span></span>
              <span class="now-tx">
                <b id="runName">泡脚 + 刷短视频</b>
                <span id="nowWhen">感官重组 Combo · 20 分钟</span>
              </span>
              <span class="now-t"><b id="runNum">20:00</b><span>剩余</span></span>
            </div>
            <div class="btn-row" style="margin-top:10px">
              <button class="btn ghost" id="runPause" style="flex:1">暂停</button>
              <button class="btn" data-go="done" style="flex:1">这一件做完了</button>
            </div>
          </div>
        </section>

"""
cut("        <!-- ============ 8. 放松 Combo ============ -->",
    "        <!-- ============ 9. Combo 进行中 ============ -->",
    "删旧 combo 屏")
sub("        <!-- ============ 9. Combo 进行中 ============ -->",
    COMBO_NEW + "        <!-- ============ 9. Combo 进行中 ============ -->",
    "插入新 combo 屏")

# ================================================================ 6) 删 run 屏
cut("        <!-- ============ 9. Combo 进行中 ============ -->",
    "        <!-- ============ 10. 完成反馈 ============ -->",
    "删 run 屏")

# 随屏删除的死样式：圆环计时器与 +N% 徽标
cut("/* ---------- screen: run ---------- */", "\n/* ---------- screen: done ---------- */",
    "run 屏样式")
sub(""".plus-badge{
  position:absolute;right:16px;bottom:14px;
  font-size:14px;font-weight:800;padding:6px 12px;border-radius:999px;
  border:2px solid var(--ink);background:var(--sage);color:#fff;
  opacity:0;transition:opacity .3s;
}
.plus-badge.on{opacity:1;animation:pop .5s cubic-bezier(.2,1.4,.4,1)}
""", "", "plus-badge 样式")

# ================================================================ 7) done 屏重写
DONE_NEW = """        <!-- ============ 10. 完成反馈 · 自己打分 ============ -->
        <section class="scr" id="scr-done">
          <div class="kicker">Tab 2 · <b>完成</b></div>
          <h1 class="h1">今晚恢复了几成，<br>你自己说了算。</h1>

          <div class="batt" id="batt">
            <div class="batt-fill" id="battFill"></div>
            <div class="batt-in">
              <div class="batt-top"><b>充电池 Energy Battery</b><span class="tag" style="background:#F8DF77">今日</span></div>
              <div class="batt-val"><span id="battNum">0</span><small>%</small></div>
            </div>
          </div>

          <p class="lead" id="scoreHint">做完了这一件，点一下你现在感觉的位置。</p>
          <div class="score-row" id="scoreRow">
            <button class="score" data-pct="30">三成</button>
            <button class="score" data-pct="50">五成</button>
            <button class="score" data-pct="70">七成</button>
            <button class="score" data-pct="90">九成</button>
            <button class="score" data-pct="100">满格</button>
          </div>

          <div class="spacer"></div>
          <span class="ii ii-squiggle" style="width:100%;height:24px;opacity:.55;margin:0 0 14px"></span>
          <div class="btn-row">
            <button class="btn ghost" style="flex:1" data-go="combo">再做一件</button>
            <button class="btn" style="flex:1" data-go="dash">看仪表盘</button>
          </div>
        </section>

"""
cut("        <!-- ============ 10. 完成反馈 ============ -->",
    "        <!-- ============ 11. 恢复仪表盘 ============ -->",
    "删旧 done 屏")
sub("        <!-- ============ 11. 恢复仪表盘 ============ -->",
    DONE_NEW + "        <!-- ============ 11. 恢复仪表盘 ============ -->",
    "插入新 done 屏")

# ================================================================ 8) flowOf
sub("  var flowOf = {onb1:'0',onb2:'0',onb3:'0',onb4:'0',start:'1',dump:'1',dumpai:'1',pod:'1',podplan:'1',evening:'2',combo:'2',run:'2',done:'2',dash:'3',settings:'4'};",
    "  var flowOf = {onb1:'0',onb2:'0',onb3:'0',onb4:'0',start:'1',dump:'1',dumpai:'1',pod:'1',podplan:'1',combo:'2',done:'2',dash:'3',settings:'4'};",
    "flowOf")

# evening 屏已删：通勤预定的出口与 Tab 2 入口都改指向「这一件」
sub('          <button class="btn" id="ppGo" data-go="evening">回家，按这个来',
    '          <button class="btn" id="ppGo" data-go="combo">回家，按这个来',
    "ppGo 出口")
sub('        <button class="tab" data-tab="2" data-go="evening">',
    '        <button class="tab" data-tab="2" data-go="combo">',
    "Tab 2 入口")

# ================================================================ 9) SPEC
sub("    combo:{mod:'Tab 2 · 模块三',title:'放松 Combo',pts:[",
    "    combo:{mod:'Tab 2 · 这一件',title:'这一件 · 今晚日程与进行中',pts:[",
    "SPEC combo 头")
sub("""      '<b>零输入推荐</b>：依据时间光线、天气温度、疲惫度、地点状态生成。',
      '<b>交互</b>：主屏只展示 1 张大卡片，左滑切换备选，最多 3 张。',
      '不拦截任何 App，接受「刷手机 + 身体放松」的黄金组合。'
    ]},""",
    """      '<b>两态同屏</b>：待选态是横向三选一的大卡片；点开始后同一屏切为今晚日程 + 倒计时，不再单独占一屏。',
      '<b>今晚日程</b>：从 18:30 排到睡觉时间，含看剧与读书两格；正在做的这一件在日程里整行高亮。',
      '<b>看剧 / 读书</b>：默认推荐《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定里改或取消。',
      '<b>进行中</b>：只保留剩余时间与暂停 / 结束，不拦截任何 App —— 接受「刷手机 + 身体放松」的组合。'
    ]},""",
    "SPEC combo 正文")

# 删掉旧的 run / done 两项，再写入新的 done
cut("    run:{mod:'Tab 2 · 模块三',title:'Combo 进行中',pts:[",
    "    dash:{mod:'Tab 3 · 模块四',", "删 SPEC run/done")
sub("    dash:{mod:'Tab 3 · 模块四',",
    """    done:{mod:'Tab 2 · 完成',title:'完成反馈 · 自己打分',pts:[
      '<b>充电池</b>：不做自动结算。做完一件后给出五档，充到几成由用户自己判断 —— 恢复是主观感受，系统不代替你打分。',
      '<b>交互</b>：点选后电量条与数字一次性跳到位，只记录、不评价。',
      '以恢复数据结算，不产出效率或绩效类指标；文案不含奖励或惩罚。',
      '明早 09:00 保险箱自动打开，把封存的待办还给用户。'
    ]},
    dash:{mod:'Tab 3 · 模块四',""",
    "插入 SPEC done")
sub("      '<b>充电池电量</b>：Combo 完成度可视化累积。',",
    "      '<b>充电池电量</b>：由用户每次自评累积，系统不代替判断，也不做目标值。',",
    "SPEC dash 充电池")

# 删 SPEC evening
cut("    evening:{mod:'Tab 2 · 今晚',title:'今晚日程',pts:[", "    settings:{", "删 SPEC evening")

# ================================================================ 10) go()
sub("    document.getElementById('device').classList.toggle('immersive', id === 'run');",
    "    document.getElementById('device').classList.remove('immersive');",
    "go immersive")
sub("""    if(id === 'done') runBattery();
    if(id === 'dash') setTimeout(runBars, 120);
    if(id === 'combo') renderCombo(comboBase);
    if(id === 'podplan') paintPlan();
    if(id === 'settings') paintSettings();
    if(id === 'evening') renderTimeline();
    if(id.indexOf('onb') === 0) paintProfile();""",
    """    if(id === 'done') resetScore();
    if(id === 'dash') setTimeout(runBars, 120);
    if(id === 'combo') enterCombo();
    if(id === 'podplan') paintPlan();
    if(id === 'settings') paintSettings();
    if(id.indexOf('onb') === 0) paintProfile();""",
    "go 屏钩子")

# ================================================================ 11) paintProfile 的目标元素
sub("    $('#evBedLbl').textContent = hhmm(profile.bed);",
    "    $('#cbBedLbl').textContent = hhmm(profile.bed);",
    "睡觉时间标签")

# ================================================================ 12) 通勤预定：加第 4 件「睡前看点什么」
sub("""    {key:'combo', ic:'sofa',  bg:'var(--yellow)', q:'回到家先做哪件放松？', opts:[
      {t:'泡脚 + 刷短视频', note:'手可以放空', d:20},
      {t:'靠墙抬腿 10 分钟', note:'缓解久坐',   d:10},
      {t:'擦干净洗手池',     note:'看得见结果', d:5}
    ]}""",
    """    {key:'combo', ic:'sofa',  bg:'var(--yellow)', q:'回到家先做哪件放松？', opts:[
      {t:'泡脚 + 刷短视频', note:'手可以放空', d:20},
      {t:'靠墙抬腿 10 分钟', note:'缓解久坐',   d:10},
      {t:'擦干净洗手池',     note:'看得见结果', d:5}
    ]},
    {key:'screen', ic:'tv', bg:'var(--blue)', q:'睡前看点什么？', opts:[
      {t:'看一集剧',       note:'《漫长的季节》第 1 集', d:45,
       parts:[{name:'看一集剧《漫长的季节》', d:45}],        dur:{watch:45, read:0}},
      {t:'读一个短篇',     note:'《夜晚的潜水艇》',       d:25,
       parts:[{name:'读《夜晚的潜水艇》一个短篇', d:25}],   dur:{watch:0,  read:25}},
      {t:'剧和书都要',     note:'先看剧，睡前再读 25 分钟', d:70,
       parts:[{name:'看一集剧《漫长的季节》', d:45},
              {name:'读《夜晚的潜水艇》一个短篇', d:25}],   dur:{watch:45, read:25}},
      {t:'都不看，早点躺', note:'留白变长，也是允许的', d:0,
       parts:[],                                          dur:{watch:0,  read:0}}
    ]}""",
    "PP_STEPS 第 4 件")

sub("  var planDur  = {meal:40, walk:20, combo:20}; // 选中后的时长",
    "  var planDur  = {meal:40, walk:20, combo:20, watch:0, read:0}; // 选中后的时长（watch/read 由第 4 件成套写入）",
    "planDur 初值")

# ================================================================ 13) planChain 支持一件多块
sub("""    PP_STEPS.forEach(function(s, i){
      var k = planPick[i];
      if(k == null) return;
      var o = s.opts[k];
      rows.push({t:t, name:o.t, d:o.d, zero:o.d === 0});
      if(o.d > 0) t += o.d;
    });""",
    """    PP_STEPS.forEach(function(s, i){
      var k = planPick[i];
      if(k == null) return;
      var o = s.opts[k];
      var parts = o.parts || [{name:o.t, d:o.d}];   // 第 4 件可能一次排入看剧与读书两块
      parts.forEach(function(p){
        rows.push({t:t, name:p.name, d:p.d, zero:!p.d});
        if(p.d > 0) t += p.d;
      });
    });""",
    "planChain")

# ================================================================ 14) 逐件点击处理
sub("""    planPick[i] = k;
    planDur[s.key] = o.d;
    planTx[s.key] = {name:o.t, note:o.note};""",
    """    planPick[i] = k;
    if(s.key === 'screen'){ planDur.watch = o.dur.watch; planDur.read = o.dur.read; }
    else { planDur[s.key] = o.d; }
    planTx[s.key] = {name:o.t, note:o.note};""",
    "逐件点击")

# ================================================================ 15) EV_FIX 加看剧 / 读书
sub("""    {ic:'sofa',  bg:'var(--yellow)', name:'放松 Combo',  key:'combo',                  min:20},
    {ic:'leaf',  bg:'var(--paper)',  name:'自由留白',    note:'不安排，也不提醒',       key:'free', free:true},""",
    """    {ic:'sofa',  bg:'var(--yellow)', name:'放松 Combo',  key:'combo',                  min:20},
    {ic:'tv',    bg:'var(--blue)',   name:'看一集剧',    note:'《漫长的季节》第 1 集',  key:'watch',  min:45},
    {ic:'book',  bg:'var(--paper)',  name:'读几页书',    note:'《夜晚的潜水艇》一个短篇', key:'read',   min:25},
    {ic:'leaf',  bg:'var(--paper)',  name:'自由留白',    note:'不安排，也不提醒',       key:'free', free:true},""",
    "EV_FIX")

# ================================================================ 16) 时间线：当前这一件高亮
sub("""      var el = '<div class="tl' + (r.free ? ' free' : '') + '">' +""",
    """      var el = '<div class="tl' + (r.free ? ' free' : '') + (nowKey && r.key === nowKey ? ' now' : '') + '">' +""",
    "时间线高亮")

# ================================================================ 17) 计时器并入「这一件」
sub("""  /* ---------- 6. timer ---------- */
  var total = 20*60, left = 20*60, tick = null, running = false;
  var RING = 653.45, runArc = $('#runArc'), runNum = $('#runNum'), runName = $('#runName');

  function fmt(s){
    var m = Math.floor(s/60), ss = s%60;
    return (m<10?'0':'')+m+':'+(ss<10?'0':'')+ss;
  }
  function paintRun(){
    runNum.textContent = fmt(left);
    runArc.setAttribute('stroke-dashoffset', String(RING * (1 - left/total)));
  }""",
    """  /* ---------- 6. timer（并入「这一件」屏） ---------- */
  var total = 20*60, left = 20*60, tick = null, running = false;
  var runNum = $('#runNum'), runName = $('#runName'), nowWhen = $('#nowWhen'), nowIc = $('#nowIc');
  var nowKey = null;                         // 日程里正在做的这一件

  function fmt(s){
    var m = Math.floor(s/60), ss = s%60;
    return (m<10?'0':'')+m+':'+(ss<10?'0':'')+ss;
  }
  function paintRun(){ runNum.textContent = fmt(left); }""",
    "计时器头")

sub("""  function syncTimerToCombo(){
    var items = [0,1,2].map(function(i){ return COMBOS[(comboBase+i) % COMBOS.length]; });
    var o = items[comboIdx] || COMBOS[0];
    total = o.d * 60; left = total;
    runName.textContent = o.n || o.t.replace(/<[^>]+>/g,'');
    paintRun();
  }""",
    """  function syncTimerToCombo(){
    var items = [0,1,2].map(function(i){ return COMBOS[(comboBase+i) % COMBOS.length]; });
    var o = items[comboIdx] || COMBOS[0];
    total = parseInt(o.d, 10) * 60; left = total;
    runName.textContent = o.t.replace(/<[^>]+>/g,'');
    nowWhen.textContent = (o.cat || '这一件') + ' · ' + o.d + ' 分钟';
    nowIc.style.background = o.c;
    paintRun();
  }

  /* ---------- 6-b. 「这一件」两态 ---------- */
  var cbMode = 'pick';
  function showCombo(mode){
    cbMode = mode;
    $('#cbPick').classList.toggle('cb-off', mode !== 'pick');
    $('#cbRun').classList.toggle('cb-off', mode !== 'run');
  }
  function enterCombo(){
    stopTimer();
    showCombo('pick');
    renderCombo(comboBase);
    renderTimeline();
  }
  $('#comboStart').addEventListener('click', function(){
    var items = [0,1,2].map(function(i){ return COMBOS[(comboBase+i) % COMBOS.length]; });
    var o = items[comboIdx] || COMBOS[0];
    planDur.combo = parseInt(o.d, 10);
    planTx.combo = {name:o.t.replace(/<[^>]+>/g,''), note:o.cat};
    nowKey = 'combo';
    renderTimeline();
    syncTimerToCombo();
    showCombo('run');
    startTimer();
    ding();
  });""",
    "两态切换")

# ================================================================ 18) 充电池：自评
sub("""  /* ---------- 7. battery ---------- */
  function runBattery(){
    var fillEl = $('#battFill'), numEl = $('#battNum'), badge = $('#plusBadge');
    fillEl.style.width = '58%'; numEl.textContent = '58';
    badge.classList.remove('on');
    setTimeout(function(){
      fillEl.style.width = '73%';
      badge.classList.add('on');
      var n = 58, t = setInterval(function(){
        n++;
        numEl.textContent = n;
        if(n >= 73) clearInterval(t);
      }, 46);
    }, 420);
  }""",
    """  /* ---------- 7. battery：充到几成由用户自己判断 ---------- */
  var scorePct = 0, scoreTick = null;

  function resetScore(){
    scorePct = 0;
    var f = $('#battFill'), n = $('#battNum');
    if(!f) return;
    clearInterval(scoreTick);
    f.style.width = '0%';
    n.textContent = '0';
    $$('#scoreRow .score').forEach(function(b){ b.classList.remove('on'); });
    $('#scoreHint').textContent = '做完了这一件，点一下你现在感觉的位置。';
  }

  function setScore(p){
    scorePct = p;
    $$('#scoreRow .score').forEach(function(b){
      b.classList.toggle('on', parseInt(b.getAttribute('data-pct'), 10) === p);
    });
    $('#battFill').style.width = p + '%';
    $('#scoreHint').textContent = '记下了。这一格只跟昨晚的你比。';
    var el = $('#battNum'), from = parseInt(el.textContent, 10) || 0, n = from;
    var step = (p > from ? 1 : -1) * Math.max(1, Math.round(Math.abs(p - from) / 12));
    clearInterval(scoreTick);
    scoreTick = setInterval(function(){
      n += step;
      if((step > 0 && n >= p) || (step < 0 && n <= p)){ n = p; clearInterval(scoreTick); }
      el.textContent = n;
    }, 34);
    ding();
  }

  $('#scoreRow').addEventListener('click', function(e){
    var b = e.target.closest('[data-pct]');
    if(b) setScore(parseInt(b.getAttribute('data-pct'), 10));
  });""",
    "充电池自评")

# ================================================================ 19) boot 区清理
sub("""  // run 屏进入前同步计时器
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-go="run"]');
    if(b){ syncTimerToCombo(); }
  }, true);

""", "", "boot run 监听")

# ================================================================ 20) resetAll 补齐新状态
sub("""    // 屏内选中态回到初始
    $$('#cookOpts .opt').forEach(function(o){""",
    """    // 「这一件」回到待选态，充电池自评清空
    nowKey = null;
    stopTimer();
    showCombo('pick');
    resetScore();

    // 屏内选中态回到初始
    $$('#cookOpts .opt').forEach(function(o){""",
    "resetAll")

# ================================================================ 21) 版本标记
for old, new in [
    ("<title>OffWork · 前端交互稿 v5 · 一键回到开头</title>",
     "<title>OffWork · 前端交互稿 v6 · 今晚排满</title>"),
    ('<span class="brand-tag">前端交互稿 · v5 · 可一键回到开头</span>',
     '<span class="brand-tag">前端交互稿 · v6 · 今晚排满</span>'),
    ("「今晚」承接主功能，放当晚日程与逐项执行。",
     "「今晚」承接主功能：这一件屏先挑后做，点开始即在同一屏展开今晚日程与倒计时。"),
]:
    sub(old, new, "版本标记")

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST)
print("尺寸 %.1f KB -> %.1f KB" % (orig_len / 1024, len(src.encode('utf-8')) / 1024))
print("屏幕数", src.count('<section class="scr"'), "/ svg", src.count("<svg"))
print("残留 evening", src.count('scr-evening'), "/ run", src.count('scr-run'),
      "/ 进门之后", src.count("进门之后"))
