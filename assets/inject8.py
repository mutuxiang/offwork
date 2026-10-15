# -*- coding: utf-8 -*-
"""
index-v7-tonight.html  ->  index-v8-sched.html

  1. 删掉「模块一 · 关机仪式」这种「模块N ·」眉标，统一成「Tab N · 名称」
  2. Tab 2「这一件」调换顺序：进屏先给今晚日程（时间线），
     点日程任意一行（或底部按钮）才进入这一件的做法卡
  3. 计时器从时间线上挪到做法卡里：倒计时 + 进度条 + 暂停，
     开始按钮与「这一件做完了」共用同一个主按钮
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index-v7-tonight.html")
DST = os.path.join(ROOT, "index-v8-sched.html")

src = open(SRC, encoding="utf-8").read()
orig_len = len(src)


def sub(old, new, tag=""):
    global src
    n = src.count(old)
    assert n == 1, "锚点不唯一(%d) %s：%r" % (n, tag, old[:80])
    src = src.replace(old, new)


def cut(a, b, tag=""):
    global src
    assert src.count(a) == 1, "起点不唯一 %s：%r" % (tag, a[:80])
    i = src.find(a)
    j = src.find(b, i + 1)
    assert j != -1 and i < j, "终点找不到 %s：%r" % (tag, b[:80])
    src = src[:i] + src[j:]


# ================================================================ 1) 眉标
for old, new in [
    ('<div class="kicker">Tab 1 · <b>主功能 · 起点</b></div>',
     '<div class="kicker">Tab 1 · <b>下班触发</b></div>'),
    ('<div class="kicker">模块一 · <b>关机仪式</b></div>',
     '<div class="kicker">Tab 1 · <b>关机仪式</b></div>'),
    ('<div class="kicker">模块一 · <b>AI 归置完成</b></div>',
     '<div class="kicker">Tab 1 · <b>AI 归置完成</b></div>'),
    ('<div class="kicker">模块二 · <b>通勤过渡舱</b></div>',
     '<div class="kicker">Tab 1 · <b>通勤过渡舱</b></div>'),
    ('<div class="kicker">模块二 · <b>通勤预定</b></div>',
     '<div class="kicker">Tab 1 · <b>通勤预定</b></div>'),
]:
    sub(old, new, "眉标")

for old, new in [
    ("start:{mod:'Tab 1 · 模块一起点'", "start:{mod:'Tab 1 · 主功能'"),
    ("    dump:{mod:'Tab 1 · 模块一',", "    dump:{mod:'Tab 1 · 主功能',"),
    ("    dumpai:{mod:'Tab 1 · 模块一',", "    dumpai:{mod:'Tab 1 · 主功能',"),
    ("    pod:{mod:'Tab 1 · 模块二',", "    pod:{mod:'Tab 1 · 主功能',"),
    ("    podplan:{mod:'Tab 1 · 模块二',", "    podplan:{mod:'Tab 1 · 主功能',"),
    ("combo:{mod:'Tab 2 · 这一件'", "combo:{mod:'Tab 2 · 今晚'"),
    ("done:{mod:'Tab 2 · 完成'", "done:{mod:'Tab 2 · 今晚'"),
    ("dash:{mod:'Tab 3 · 模块四'", "dash:{mod:'Tab 3 · 恢复'"),
]:
    sub(old, new, "SPEC mod")

# ================================================================ 2) 样式
sub("""/* ---------- v6：「这一件」两态 + 充电池自评 ---------- */
#cbPick,#cbRun{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
#cbPick.cb-off,#cbRun.cb-off{display:none}""",
    """/* ---------- v8：「这一件」先日程后细节 + 充电池自评 ---------- */
#cbSched,#cbDetail{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
#cbSched.cb-off,#cbDetail.cb-off{display:none}

#tlWrap .tl{cursor:pointer}
.tl-go{flex:0 0 auto;font-size:13px;font-weight:800;line-height:1;padding-top:3px;color:rgba(20,20,20,.26);transition:color .15s,transform .15s}
#tlWrap .tl:hover .tl-go{color:var(--ink);transform:translateX(2px)}

.cd-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.cd-hd .mini-btn{display:inline-flex;align-items:center;gap:6px}
.cd-timer{
  display:flex;align-items:center;gap:9px;margin-top:11px;
  border:2px solid var(--ink);border-radius:16px;background:var(--paper);padding:10px 12px;
}
.cd-timer b{font-size:19px;font-weight:800;letter-spacing:-.02em;line-height:1;font-variant-numeric:tabular-nums}
.cd-timer #cdState{flex:0 0 auto;font-size:10px;font-weight:800;letter-spacing:.08em;color:var(--ink-3)}
.cd-bar{flex:1 1 auto;min-width:30px;height:6px;border-radius:999px;background:rgba(20,20,20,.13);display:block;overflow:hidden}
.cd-bar i{display:block;height:100%;width:100%;border-radius:999px;background:var(--ink);transition:width .4s linear}
.combo-bar .btn{width:auto;flex:1 1 0;min-width:0}
.combo-bar .icon-btn{flex:0 0 auto}""",
    "v8 样式")

# ================================================================ 3) 屏体
NEW_BODY = """          <div id="cbSched">
            <h1 class="h1" style="font-size:23px;margin:0 0 12px">今晚从 18:30<br>排到 <span id="cbBedLbl">23:30</span>。</h1>
            <div class="tl-wrap" id="tlWrap"></div>

            <div class="spacer"></div>
            <div class="now-bar">
              <span class="now-ic" id="nowIc" style="background:var(--yellow)">
                <span class="ii ii-sofa" style="width:16px;height:16px"></span></span>
              <span class="now-tx">
                <b id="runName">洗热水脸，换家居服</b>
                <span id="nowWhen">感官重组 Combo · 20 分钟</span>
              </span>
              <span class="now-t"><b id="nowAt">20:04</b><span>开始</span></span>
            </div>
            <button class="btn" id="cbGo" style="margin-top:10px">看这一件怎么做
              <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
            </button>
          </div>

          <div id="cbDetail" class="cb-off">
            <div class="cd-hd">
              <button class="mini-btn" id="cdBack">
                <span class="ii ii-arrow ii-inv" style="width:13px;height:13px;transform:rotate(180deg)"></span>今晚日程</button>
              <span class="chip p" id="comboSrc">已预定</span>
            </div>

            <div class="carousel" id="carousel">
              <div class="track" id="track"></div>
            </div>
            <div class="dots" id="dots"></div>

            <div class="cd-timer">
              <span class="ii ii-clock" style="width:15px;height:15px;opacity:.72"></span>
              <b id="cdNum">20:00</b>
              <span id="cdState">未开始</span>
              <span class="cd-bar"><i id="cdFill"></i></span>
            </div>

            <div class="spacer"></div>
            <div class="combo-bar">
              <button class="icon-btn" id="comboNext" aria-label="换一批">
                <span class="ii ii-refresh" style="width:21px;height:21px"></span>
              </button>
              <button class="btn ghost" id="cdPause" style="display:none">暂时停一下</button>
              <button class="btn" id="cdGo" style="flex:1">开始这一件
                <span class="ii ii-play ii-inv" style="width:16px;height:16px"></span>
              </button>
            </div>
          </div>

"""
cut('          <div id="cbPick">',
    '        </section>\n\n        <!-- ============ 10. 完成反馈',
    "旧 combo 屏体")
sub('        </section>\n\n        <!-- ============ 10. 完成反馈',
    NEW_BODY + '        </section>\n\n        <!-- ============ 10. 完成反馈',
    "插入新屏体")

# ================================================================ 4) 轮播渲染改为通用卡面
cut("  function renderCombo(base){",
    "  // drag to swipe", "旧 renderCombo")

NEW_RENDER = """  var cardCount = 1;
  function setCombo(i, instant){}
  function renderCards(cards){}
  function applyCardToPlan(){}

"""
sub("  var comboBase = 0, comboIdx = 0;\n\n  // drag to swipe",
    "  var comboBase = 0, comboIdx = 0;\n\n" + NEW_RENDER + "  // drag to swipe",
    "占位")

sub("""      if(dx < -46 && comboIdx < 2) setCombo(comboIdx+1);
      else if(dx > 46 && comboIdx > 0) setCombo(comboIdx-1);""",
    """      if(dx < -46 && comboIdx < cardCount-1) setCombo(comboIdx+1);
      else if(dx > 46 && comboIdx > 0) setCombo(comboIdx-1);""",
    "拖拽边界")

# 把占位函数换成真实现（与计时器同块，见下）
sub("""  var cardCount = 1;
  function setCombo(i, instant){}
  function renderCards(cards){}
  function applyCardToPlan(){}

""", "", "清占位")

# ================================================================ 5) 计时器 + 两态
cut("  /* ---------- 6. timer（并入「这一件」屏） ---------- */",
    "  /* ---------- 7. battery：充到几成由用户自己判断 ---------- */",
    "旧计时器块")

NEW_JS = """  /* ---------- 6. timer（在「这一件」的做法卡里） ---------- */
  var total = 20*60, left = 20*60, tick = null, running = false;
  var nowKey = null;                       // 日程里选中的这一件
  var tlBlocks = [];                       // 上次渲染出的时间线块
  var curIdx = -1;                         // 选中的是第几块
  var cbMode = 'sched';
  var cdStarted = false, cardCount = 1;

  /* 每一格的做法：标题与一句描述取自这一格自己的文案，步骤在此补齐 */
  var ROW_CARD = {
    mic:  {cat:'关机仪式',   c:'#F8DF77', steps:['长按语音键，说满 2 分钟','AI 归置成明日待办','拉下电闸，物理断连'], plus:'不评价、不统计、不打分'},
    rain: {cat:'通勤过渡舱', c:'#B7CBEB', steps:['选一段纯音效','跟着圆点做 4-7-8 呼吸','到站自动停'],   plus:'不播客、不听故事'},
    meal: {cat:'晚饭',       c:'#F5B8D9', steps:['烧水，下面','顺手煎一个蛋','吃完把碗泡上'],           plus:'吃的时候不看工作消息'},
    walk: {cat:'散步',       c:'#9CAE70', steps:['出门，不戴耳机','沿环线走一圈','回来顺手扔垃圾'],     plus:'不设步数目标'},
    watch:{cat:'看一集剧',   c:'#B7CBEB', steps:['打开电视或投影','只看这一集','片尾就关'],             plus:'不追进度，不补剧'},
    read: {cat:'读几页书',   c:'#FFFDF8', steps:['把手机放到客厅','读一个短篇','读完就放下'],           plus:'读不完也没关系'},
    free: {cat:'自由留白',   c:'#FFFDF8', steps:[],                                                    plus:'这段不记录，也不提醒'},
    tooth:{cat:'洗漱',       c:'#B7CBEB', steps:['刷牙、洗脸','把明天的包收好','关掉客厅的灯'],         plus:'不刷手机'},
    bed:  {cat:'上床缓冲',   c:'#F5B8D9', steps:['躺下，不看屏幕','想点不费力的事'],                   plus:'睡不着也不扣分'}
  };

  function fmt(s){
    var m = Math.floor(s/60), ss = s%60;
    return (m<10?'0':'')+m+':'+(ss<10?'0':'')+ss;
  }

  /* 一格 -> 卡面数组（放松 Combo 是三张备选，其余一格一张） */
  function cardsFor(b){
    if(!b) return [];
    if(b.r.key === 'combo') return [0,1,2].map(function(i){ return COMBOS[(comboBase+i) % COMBOS.length]; });
    var s = ROW_CARD[b.r.key] || {}, tx = TX[b.r.key] || {};
    return [{
      c: s.c || b.r.bg, cat: hhmm(b.t) + ' 开始',
      t: (tx.name || b.r.name).replace(/^晚饭 · /, ''),
      d: String(b.m), u: '分钟',
      why: tx.note || b.r.note || '',
      steps: s.steps || [], plus: s.plus || ''
    }];
  }

  function renderCards(cards){
    var track = $('#track');
    if(!cards || !cards.length) return;
    cardCount = cards.length;
    track.innerHTML = cards.map(function(o, i){
      return '<div class="slide"><div class="big-card" style="background:'+o.c+'">'+
        '<div class="sec"><span class="tag">'+o.cat+'</span>'+
          (cardCount > 1 ? '<span class="big-num">0'+(i+1)+' / 0'+cardCount+'</span>' : '')+
        '</div>'+
        '<h2 class="big-title">'+o.t+'</h2>'+
        '<div class="meta"><b>'+o.d+'</b><span>'+o.u+'</span></div>'+
        (o.why ? '<p class="why">'+o.why+'</p>' : '')+
        (o.steps.length ? '<ul class="steps">'+o.steps.map(function(s, n){ return '<li><i>'+(n+1)+'</i>'+s+'</li>'; }).join('')+'</ul>' : '')+
        (o.plus ? '<div class="plusone">'+o.plus+'</div>' : '')+
      '</div></div>';
    }).join('');
    $('#dots').innerHTML = cardCount > 1 ? cards.map(function(_, i){
      return '<i data-i="'+i+'" class="'+(i===0?'on':'')+'"></i>';
    }).join('') : '';
    setCombo(0, true);
    paintCd();
  }

  function setCombo(i, instant){
    comboIdx = Math.max(0, Math.min(cardCount-1, i));
    var track = $('#track');
    track.classList.toggle('drag', !!instant);
    track.style.transform = 'translateX(' + (-comboIdx*100) + '%)';
    if(instant) requestAnimationFrame(function(){ track.classList.remove('drag'); });
    $$('#dots i').forEach(function(d, k){ d.classList.toggle('on', k === comboIdx); });
    if(cbMode === 'detail'){ applyCardToPlan(); renderTimeline(); syncTimerToCombo(); paintSchedBar(); }
  }

  function paintCd(){
    var num = $('#cdNum');
    if(!num) return;
    num.textContent = fmt(left);
    $('#cdFill').style.width = (total ? Math.max(0, Math.min(100, left/total*100)) : 0).toFixed(1) + '%';
    $('#cdState').textContent = !cdStarted ? '未开始' : (running ? '进行中' : (left <= 0 ? '已完成' : '已暂停'));
    var p = $('#cdPause');
    p.style.display = (cdStarted && left > 0) ? '' : 'none';
    p.textContent = running ? '暂时停一下' : '继续';
    $('#cdGo').innerHTML = cdStarted
      ? '这一件做完了'
      : '开始这一件 <span class="ii ii-play ii-inv" style="width:16px;height:16px"></span>';
    $('#comboNext').style.display = (!cdStarted && cardCount > 1) ? '' : 'none';
  }

  function startTimer(){
    if(running || left <= 0) return;
    running = true; cdStarted = true;
    paintCd();
    tick = setInterval(function(){
      left--;
      if(left <= 0){ left = 0; running = false; clearInterval(tick); paintCd(); go('done'); return; }
      paintCd();
    }, 1000);
  }
  function stopTimer(){
    running = false;
    clearInterval(tick);
    paintCd();
  }
  $('#cdPause').addEventListener('click', function(){ if(running) stopTimer(); else startTimer(); });
  $('#cdGo').addEventListener('click', function(){
    if(cdStarted){ stopTimer(); cdStarted = false; paintCd(); go('done'); return; }
    applyCardToPlan(); renderTimeline();
    startTimer();
    ding();
  });

  function applyCardToPlan(){
    var b = tlBlocks[curIdx];
    if(!b || b.r.key !== 'combo') return;
    var o = COMBOS[(comboBase + comboIdx) % COMBOS.length];
    if(!o) return;
    planDur.combo = parseInt(o.d, 10);
    planTx.combo = {name:o.t.replace(/<[^>]+>/g,''), note:o.cat};
  }

  function syncTimerToCombo(){
    var list = cardsFor(tlBlocks[curIdx]);
    var card = list[comboIdx] || list[0];
    var mins = card ? (parseInt(card.d, 10) || 20) : 20;
    total = Math.max(60, mins * 60);
    left = total;
    cdStarted = false; running = false;
    clearInterval(tick);
    paintCd();
  }

  /* ---------- 6-b. 「这一件」：先给日程，再看这一件怎么做 ---------- */
  function showCombo(mode){
    cbMode = mode;
    $('#cbSched').classList.toggle('cb-off', mode !== 'sched');
    $('#cbDetail').classList.toggle('cb-off', mode !== 'detail');
  }
  function defIdx(){
    for(var i = 0; i < tlBlocks.length; i++){ if(tlBlocks[i].r.key === 'combo') return i; }
    return 0;
  }
  function paintSchedBar(){
    var b = tlBlocks[curIdx] || tlBlocks[0];
    if(!b) return;
    var list = cardsFor(b), card = list[comboIdx] || list[0] || {};
    $('#runName').textContent = (card.t || b.r.name).replace(/<[^>]+>/g, '');
    $('#nowWhen').textContent = (card.cat || b.r.name) + ' · ' + b.m + ' 分钟';
    var ic = $('#nowIc');
    ic.style.background = b.r.bg;
    ic.innerHTML = '<span class="ii ii-' + b.r.ic + '" style="width:16px;height:16px"></span>';
    $('#nowAt').textContent = hhmm(b.t);
  }
  function openDetail(i){
    if(i == null || i < 0 || i >= tlBlocks.length) return;
    curIdx = i;
    nowKey = tlBlocks[i].r.key || null;
    $('#comboSrc').style.display = (tlBlocks[i].r.key === 'combo') ? '' : 'none';
    renderCards(cardsFor(tlBlocks[i]));
    showCombo('detail');
    applyCardToPlan();
    renderTimeline();
    syncTimerToCombo();
    paintSchedBar();
    ding();
  }
  function closeDetail(){
    showCombo('sched');
    renderTimeline();
    paintSchedBar();
  }
  function enterCombo(){
    stopTimer();
    showCombo('sched');
    renderTimeline();
    if(curIdx < 0 || curIdx >= tlBlocks.length) curIdx = defIdx();
    renderTimeline();
    renderCards(cardsFor(tlBlocks[curIdx]));
    if(!cdStarted) syncTimerToCombo();
    paintSchedBar();
  }
  $('#cbGo').addEventListener('click', function(){ openDetail(curIdx); });
  $('#cdBack').addEventListener('click', closeDetail);
  $('#tlWrap').addEventListener('click', function(e){
    var row = e.target.closest('.tl[data-i]');
    if(row && !row.classList.contains('free')) openDetail(parseInt(row.getAttribute('data-i'), 10));
  });
  $('#comboNext').addEventListener('click', function(){
    comboBase = (comboBase + 1) % COMBOS.length;
    renderCards(cardsFor(tlBlocks[curIdx]));
    ding();
    toast('换了一批备选');
  });
  $('#dots').addEventListener('click', function(e){
    var d = e.target.closest('i[data-i]');
    if(d) setCombo(parseInt(d.getAttribute('data-i'), 10));
  });

"""
sub("  /* ---------- 7. battery：充到几成由用户自己判断 ---------- */",
    NEW_JS + "  /* ---------- 7. battery：充到几成由用户自己判断 ---------- */",
    "插入新计时器块")

# ================================================================ 6) 时间线：可点 + 带行号
# 日程里 Combo 那一格的名字，默认跟随当前选中的那张备选卡
sub("""    TX.combo.name = planTx.combo.name || '放松 Combo';
    TX.combo.note = planTx.combo.note || '泡脚 + 刷短视频';""",
    """    var cdef = COMBOS[(comboBase + comboIdx) % COMBOS.length] || COMBOS[0];
    TX.combo.name = planTx.combo.name || cdef.t.replace(/<[^>]+>/g, '');
    TX.combo.note = planTx.combo.note || cdef.cat;""",
    "TX.combo 默认值")

sub("""    var html = blocks.map(function(b){
      var r = b.r, tx = r.key ? TX[r.key] : null;""",
    """    tlBlocks = blocks;
    var html = blocks.map(function(b, bi){
      var r = b.r, tx = r.key ? TX[r.key] : null;""",
    "时间线块缓存")

sub("""      var el = '<div class="tl' + (r.free ? ' free' : '') + (nowKey && r.key === nowKey ? ' now' : '') + '">' +""",
    """      var el = '<div class="tl' + (r.free ? ' free' : '') + (curIdx === bi ? ' now' : '') + '" data-i="' + bi + '">' +""",
    "时间线行标记")

sub("""        '</span></div>';
      return el;
    }).join('');""",
    """        '</span>' +
        (r.free ? '' : '<span class="tl-go">›</span>') +
        '</div>';
      return el;
    }).join('');""",
    "时间线行箭头")

# ================================================================ 7) 复位
sub("    planPick = [null, null, null];",
    "    planPick = [null, null, null, null];",
    "resetAll planPick")

sub("""    // 「这一件」回到待选态，充电池自评清空
    nowKey = null;
    stopTimer();
    showCombo('pick');
    resetScore();""",
    """    // 「这一件」回到日程态，充电池自评清空
    nowKey = null; curIdx = -1; cdStarted = false;
    stopTimer();
    showCombo('sched');
    resetScore();""",
    "resetAll 这一件")

sub("""    paintProfile();            // 含今晚日程 / 设置页 / 逐件规划
    renderCombo(comboBase);""",
    """    paintProfile();            // 含今晚日程 / 设置页 / 逐件规划
    curIdx = defIdx();
    renderCards(cardsFor(tlBlocks[curIdx]));
    paintSchedBar();""",
    "resetAll 重绘")

# ================================================================ 8) SPEC
sub("""      '<b>两态同屏</b>：待选态是横向三选一的大卡片；点开始后同一屏切为今晚日程 + 倒计时，不再单独占一屏。',
      '<b>今晚日程</b>：从 18:30 排到睡觉时间，含看剧与读书两格；正在做的这一件在日程里整行高亮。',
      '<b>看剧 / 读书</b>：默认就排入《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定第 4 件改成只看剧、只读书或都不看。',
      '<b>进行中</b>：只保留剩余时间与暂停 / 结束，不拦截任何 App —— 接受「刷手机 + 身体放松」的组合。'""",
    """      '<b>顺序</b>：进屏先给今晚日程；点日程任意一行（或底部按钮）才进入这一件的做法卡。',
      '<b>今晚日程</b>：从 18:30 排到睡觉时间，含看剧与读书两格；选中的这一件在日程里整行高亮。',
      '<b>做法卡</b>：名称、时长、一句说明与三步做法；放松 Combo 一格里带三张备选，左右滑或换一批。',
      '<b>计时器</b>：计时就放在做法卡里，开始后倒计时与进度条同步走，暂停后仍留在同一张卡上。',
      '<b>看剧 / 读书</b>：默认就排入《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定第 4 件改成只看剧、只读书或都不看。',
      '<b>进行中</b>：只保留剩余时间与暂停 / 结束，不拦截任何 App —— 接受「刷手机 + 身体放松」的组合。'""",
    "SPEC combo")

# ================================================================ 9) 规格面板初始眉标
sub('<div class="spec-mod" id="specMod">Tab 1 · 模块一</div>',
    '<div class="spec-mod" id="specMod">Tab 0 · 首次启动</div>',
    "specMod 初始值")

# ================================================================ 10) 版本标记
for old, new in [
    ("<title>OffWork · 前端交互稿 v7 · 今晚排满</title>",
     "<title>OffWork · 前端交互稿 v8 · 先看日程</title>"),
    ('<span class="brand-tag">前端交互稿 · v7 · 今晚排满</span>',
     '<span class="brand-tag">前端交互稿 · v8 · 先看日程</span>'),
    ("「今晚」承接主功能：这一件屏先挑后做，点开始即在同一屏展开今晚日程与倒计时。",
     "「今晚」承接主功能：进屏先给今晚日程，点其中一行才进入这一件的做法与计时。"),
]:
    sub(old, new, "版本标记")

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST)
print("尺寸 %.1f KB -> %.1f KB" % (orig_len / 1024, len(src.encode('utf-8')) / 1024))
print("屏幕数", src.count('<section class="scr"'), "/ svg", src.count("<svg"))
print("残留：模块一", src.count("模块一"), "/ 模块二", src.count("模块二"),
      "/ 模块四", src.count("模块四"), "/ cbPick", src.count("cbPick"), "/ renderCombo", src.count("renderCombo"))
