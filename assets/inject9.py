# -*- coding: utf-8 -*-
"""v8 -> v9

1. 删掉「今晚日程」底部的这一件预览条（.now-bar），按钮改为「开始行程」
2. 进入后变成可左右滑动的行程卡片流：一张卡 = 今晚的一格，滑动 / 圆点 / 点日程行都能翻
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index-v8-sched.html')
DST = os.path.join(ROOT, 'index-v9-swipe.html')

src = io.open(SRC, encoding='utf-8').read()
before = len(src)


def sub(old, new, tag=''):
    global src
    n = src.count(old)
    assert n == 1, u'锚点不唯一(%d) %s：%r' % (n, tag, old[:70])
    src = src.replace(old, new)


def cut_between(a, b, new, tag=''):
    """保留 a 与 b，把两者之间的内容换成 new"""
    global src
    ia = src.find(a)
    assert ia >= 0, u'找不到起点 %s' % tag
    ib = src.find(b, ia + len(a))
    assert ib >= 0, u'找不到终点 %s' % tag
    src = src[:ia + len(a)] + new + src[ib:]


# ================================================================ 1) CSS
sub(
    u""".now-bar{
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
""",
    u""".swipe-hint{
  font-size:10px;font-weight:700;letter-spacing:.02em;color:var(--ink-3);
  text-align:center;margin:-3px 0 0;
}
#cbDetail .dots{margin-bottom:5px}
.big-num{font-variant-numeric:tabular-nums}
/* 卡片按内容贴合：等高由最高的一张决定，不再靠 min-height 撑出空白 */
.slide{display:flex}
.slide>.big-card{flex:1 1 auto;min-width:0;min-height:0}
/* 卡片内的节奏放松一档（这几个类只在这张卡里出现） */
.big-card{padding:24px 20px 22px}
.big-card .sec{margin-bottom:20px}
.big-title{font-size:26px;margin:0 0 16px}
.meta{padding:14px 0;margin-bottom:16px}
.why{font-size:12.5px;line-height:1.72}
.steps{margin:22px 0 0;gap:12px}
.plusone{padding-top:18px}
""",
    u'CSS：删 now-bar，加滑动提示')

# ================================================================ 2) 日程页：删预览条 + 按钮改名
sub(
    u"""            <div class="spacer"></div>
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
            </button>""",
    u"""            <div class="spacer"></div>
            <button class="btn" id="cbGo">开始行程
              <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
            </button>""",
    u'HTML：日程页底栏')

# ================================================================ 3) 做法页：加滑动提示
sub(
    u"""            <div class="dots" id="dots"></div>""",
    u"""            <div class="dots" id="dots"></div>
            <p class="swipe-hint">左右滑动，看别的安排</p>""",
    u'HTML：滑动提示')

# ================================================================ 4) SPEC 说明
sub(
    u"""    combo:{mod:'Tab 2 · 今晚',title:'这一件 · 今晚日程与进行中',pts:[
      '<b>顺序</b>：进屏先给今晚日程；点日程任意一行（或底部按钮）才进入这一件的做法卡。',
      '<b>今晚日程</b>：从 18:30 排到睡觉时间，含看剧与读书两格；选中的这一件在日程里整行高亮。',
      '<b>做法卡</b>：名称、时长、一句说明与三步做法；放松 Combo 一格里带三张备选，左右滑或换一批。',
      '<b>计时器</b>：计时就放在做法卡里，开始后倒计时与进度条同步走，暂停后仍留在同一张卡上。',
      '<b>看剧 / 读书</b>：默认就排入《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定第 4 件改成只看剧、只读书或都不看。',
      '<b>进行中</b>：只保留剩余时间与暂停 / 结束，不拦截任何 App —— 接受「刷手机 + 身体放松」的组合。'
    ]},""",
    u"""    combo:{mod:'Tab 2 · 今晚',title:'这一件 · 行程卡片流',pts:[
      '<b>顺序</b>：进屏先给今晚日程，底部「开始行程」进入；点日程任意一行也可直接进。',
      '<b>今晚日程</b>：从 18:30 排到睡觉时间，含看剧与读书两格；当前这一件在日程里整行高亮。',
      '<b>行程卡片流</b>：一张卡对应今晚一格，左右滑动或点圆点翻看别的安排，卡片右上角标着第几件 / 共几件。',
      '<b>做法卡</b>：名称、时长、一句说明与三步做法；放松 Combo 一格另有「换一批」切换备选。',
      '<b>计时器</b>：计时放在卡片里，开始后倒计时与进度条同步走，暂停后仍留在同一张卡上。',
      '<b>看剧 / 读书</b>：默认就排入《漫长的季节》第 1 集与《夜晚的潜水艇》一个短篇，可在通勤预定第 4 件改成只看剧、只读书或都不看。'
    ]},""",
    u'SPEC：Tab 2 说明')

# ================================================================ 5) JS 主体重写
NEW_JS = u"""  /* ---------- 5. 行程卡片流：一张卡 = 今晚的一格 ---------- */
  var COMBOS = [
    {c:'#F8DF77', cat:'感官重组 Combo', t:'洗热水脸，<em>换家居服</em>', d:'20', u:'分钟',
     why:'热水冲掉脸上一天的油和紧绷，衣服一换，身体先知道到家了。',
     steps:['洗热水脸 · 1 分钟','换宽松家居服','自由刷短视频 20 分钟'], plus:'允许刷，不设上限提醒'},
    {c:'#F5B8D9', cat:'微动作 Combo', t:'靠墙<em>抬腿</em> 10 分钟', d:'10', u:'分钟',
     why:'坐了一整天，下肢血液堵在小腿。抬腿让血回流，脑子会跟着松。',
     steps:['垫个枕头靠墙躺好','腿抬高与身体呈 90°','一边看社交媒体'], plus:'不用起身，不用换衣服'},
    {c:'#B7CBEB', cat:'触觉沉浸卡片', t:'擦干净<em>洗手池</em>', d:'5', u:'分钟',
     why:'手上做一件立刻有结果的小事，比任何冥想都容易把人拉回现实。',
     steps:['冲湿台面','擦掉水渍和水垢','把瓶瓶罐罐摆正'], plus:'5 分钟，看得见结果'},
    {c:'#9CAE70', cat:'微漫游卡片', t:'楼下走 10 分钟，<em>拍 3 朵花</em>', d:'10', u:'分钟',
     why:'傍晚的自然光是免费的多巴胺。拍照这件事会逼你抬头找东西。',
     steps:['出门，不戴耳机','拍 3 朵小花','回来让 AI 认花语'], plus:'AI 拍照识别花语'}
  ];
  var comboAlt = 0;                  // 当前选中的放松 Combo 备选
  var comboIdx = 0;                  // 行程流里当前第几张

  var tlBlocks = [];                 // 上次渲染出的时间线块
  var DECK = [];                     // 行程流 = 今晚可点的那些格（自由留白除外）
  var curIdx = -1;                   // 当前看的是第几块
  var cbMode = 'sched';
  var cdStarted = false, cardCount = 1;
  var nowKey = null;
  var total = 20 * 60, left = 20 * 60, tick = null, running = false;

  /* 每一格的做法：标题与一句描述取自这一格自己的文案，步骤 / 说明在此补齐 */
  var ROW_CARD = {
    mic:  {cat:'关机仪式',   c:'#F8DF77',
           why:'没说完的事会一直占着脑子。说出口，再断电，今晚才算真的开始。',
           steps:['长按语音键，说满 2 分钟','AI 归置成明日待办','拉下电闸，物理断连'], plus:'不评价、不统计、不打分'},
    rain: {cat:'通勤过渡舱', c:'#B7CBEB',
           why:'从工位到家中间那段路，需要一段没有信息的声音把状态换过来。',
           steps:['选一段纯音效','跟着圆点做 4-7-8 呼吸','到站自动停'],   plus:'不播客、不听故事'},
    meal: {cat:'晚饭',       c:'#F5B8D9', steps:['烧水，下面','顺手煎一个蛋','吃完把碗泡上'],           plus:'吃的时候不看工作消息'},
    walk: {cat:'散步',       c:'#9CAE70', steps:['出门，不戴耳机','沿环线走一圈','回来顺手扔垃圾'],     plus:'不设步数目标'},
    watch:{cat:'看一集剧',   c:'#B7CBEB',
           why:'《漫长的季节》第 1 集。进别人的故事，才能从今天的事里退出来。',
           steps:['打开电视或投影','只看这一集','片尾就关'],             plus:'不追进度，不补剧'},
    read: {cat:'读几页书',   c:'#FFFDF8',
           why:'《夜晚的潜水艇》一个短篇。屏幕之外还有更慢的节奏，读几页就够。',
           steps:['把手机放到客厅','读一个短篇','读完就放下'],           plus:'读不完也没关系'},
    free: {cat:'自由留白',   c:'#FFFDF8', steps:[],                                                    plus:'这段不记录，也不提醒'},
    tooth:{cat:'洗漱',       c:'#B7CBEB',
           why:'洗漱是把今天的身体交还给明天，做完这一件就该关灯了。',
           steps:['刷牙、洗脸','把明天的包收好','关掉客厅的灯'],         plus:'不刷手机'},
    bed:  {cat:'上床缓冲',   c:'#F5B8D9',
           why:'躺着不等于睡着。给身体一段不用产出的时间，它自己会关机。',
           steps:['躺下，不看屏幕','想点不费力的事'],                   plus:'睡不着也不扣分'}
  };

  function fmt(s){
    var m = Math.floor(s/60), ss = s%60;
    return (m<10?'0':'')+m+':'+(ss<10?'0':'')+ss;
  }
  function pad2(n){ return (n < 10 ? '0' : '') + n; }

  function buildDeck(){
    DECK = [];
    tlBlocks.forEach(function(b, i){ if(!b.r.free) DECK.push(i); });
    return DECK;
  }
  function deckPosOf(i){
    var p = DECK.indexOf(i);
    return p < 0 ? 0 : p;
  }

  /* 一格 -> 一张卡 */
  function cardOf(i){
    var b = tlBlocks[i];
    if(!b) return null;
    if(b.r.key === 'combo'){
      var o = COMBOS[comboAlt] || COMBOS[0];
      return {c:o.c, cat:o.cat, t:o.t, d:String(parseInt(o.d, 10) || 20), u:'分钟',
              why:o.why, steps:o.steps, plus:o.plus};
    }
    var s = ROW_CARD[b.r.key || b.r.ic] || {}, tx = TX[b.r.key || b.r.ic] || {};
    return {c: s.c || b.r.bg, cat: hhmm(b.t) + ' 开始',
            t: (tx.name || b.r.name).replace(/^晚饭 · /, ''),
            d: String(b.m), u:'分钟',
            why: s.why || tx.note || b.r.note || '',
            steps: s.steps || [], plus: s.plus || ''};
  }

  function renderCards(){
    var track = $('#track');
    cardCount = DECK.length;
    track.innerHTML = DECK.map(function(bi, i){
      var o = cardOf(bi) || {};
      return '<div class="slide"><div class="big-card" style="background:'+o.c+'">'+
        '<div class="sec"><span class="tag">'+o.cat+'</span>'+
          '<span class="big-num">'+pad2(i+1)+' / '+pad2(cardCount)+'</span>'+
        '</div>'+
        '<h2 class="big-title">'+o.t+'</h2>'+
        '<div class="meta"><b>'+o.d+'</b><span>'+o.u+'</span></div>'+
        (o.why ? '<p class="why">'+o.why+'</p>' : '')+
        ((o.steps && o.steps.length)
          ? '<ul class="steps">'+o.steps.map(function(s, n){ return '<li><i>'+(n+1)+'</i>'+s+'</li>'; }).join('')+'</ul>'
          : '')+
        (o.plus ? '<div class="plusone">'+o.plus+'</div>' : '')+
      '</div></div>';
    }).join('');
    $('#dots').innerHTML = DECK.map(function(_, i){
      return '<i data-i="'+i+'" class="'+(i===comboIdx?'on':'')+'"></i>';
    }).join('');
    positionTrack(true);
  }

  function positionTrack(instant){
    var track = $('#track');
    track.classList.toggle('drag', !!instant);
    track.style.transform = 'translateX(' + (-comboIdx*100) + '%)';
    if(instant) requestAnimationFrame(function(){ track.classList.remove('drag'); });
    $$('#dots i').forEach(function(d, k){ d.classList.toggle('on', k === comboIdx); });
  }

  function isComboBlock(){
    var b = tlBlocks[curIdx];
    return !!(b && b.r.key === 'combo');
  }
  function paintNext(){
    $('#comboNext').style.display = (isComboBlock() && !cdStarted) ? '' : 'none';
  }

  /* 翻到第 p 张：日程高亮、来源标签、计时器一起跟着走 */
  function setCombo(p, instant){
    comboIdx = Math.max(0, Math.min(cardCount - 1, p));
    positionTrack(instant);
    if(cbMode !== 'detail') return;
    curIdx = DECK[comboIdx];
    var b = tlBlocks[curIdx];
    nowKey = b ? (b.r.key || null) : null;
    $('#comboSrc').style.display = (b && b.r.key === 'combo') ? '' : 'none';
    applyCardToPlan();
    renderTimeline();
    syncTimerToDeck();
    paintNext();
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
    paintNext();
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
  /* 计时器跟着当前这张卡：翻到别的一件，倒计时换成那一件的时长 */
  function syncTimerToDeck(){
    var o = cardOf(curIdx);
    var mins = o ? (parseInt(o.d, 10) || 20) : 20;
    total = Math.max(60, mins * 60);
    left = total;
    cdStarted = false; running = false;
    clearInterval(tick);
    paintCd();
  }
  function applyCardToPlan(){
    if(!isComboBlock()) return;
    var o = COMBOS[comboAlt] || COMBOS[0];
    if(!o) return;
    planDur.combo = parseInt(o.d, 10) || 20;
    planTx.combo = {name:o.t.replace(/<[^>]+>/g,''), note:o.cat};
  }

  $('#cdPause').addEventListener('click', function(){ if(running) stopTimer(); else startTimer(); });
  $('#cdGo').addEventListener('click', function(){
    if(cdStarted){ stopTimer(); cdStarted = false; paintCd(); go('done'); return; }
    applyCardToPlan(); renderTimeline();
    startTimer();
    ding();
  });

  /* ---------- 6. 两态：今晚日程 / 行程卡片流 ---------- */
  function showCombo(mode){
    cbMode = mode;
    $('#cbSched').classList.toggle('cb-off', mode !== 'sched');
    $('#cbDetail').classList.toggle('cb-off', mode !== 'detail');
  }
  function openDetail(i){
    if(i == null || i < 0 || i >= tlBlocks.length || tlBlocks[i].r.free) return;
    buildDeck();
    curIdx = i;
    showCombo('detail');
    comboIdx = deckPosOf(i);
    renderCards();
    setCombo(comboIdx, true);
    ding();
  }
  function closeDetail(){
    showCombo('sched');
    renderTimeline();
  }
  function enterCombo(){
    stopTimer();
    showCombo('sched');
    renderTimeline();
    buildDeck();
    if(curIdx < 0 || curIdx >= tlBlocks.length || tlBlocks[curIdx].r.free) curIdx = DECK[0];
    renderTimeline();
    comboIdx = deckPosOf(curIdx);
    cdStarted = false;
    renderCards();
    paintNext();
  }
  $('#cbGo').addEventListener('click', function(){ openDetail(curIdx); });
  $('#cdBack').addEventListener('click', closeDetail);
  $('#tlWrap').addEventListener('click', function(e){
    var row = e.target.closest('.tl[data-i]');
    if(row && !row.classList.contains('free')) openDetail(parseInt(row.getAttribute('data-i'), 10));
  });
  $('#comboNext').addEventListener('click', function(){
    comboAlt = (comboAlt + 1) % COMBOS.length;
    renderCards();
    setCombo(comboIdx, true);
    ding();
    toast('换了一批备选');
  });
  $('#dots').addEventListener('click', function(e){
    var d = e.target.closest('i[data-i]');
    if(d) setCombo(parseInt(d.getAttribute('data-i'), 10));
  });

  // 左右滑动，翻看今晚别的安排
  (function(){
    var car = $('#carousel'), track = $('#track');
    var sx = 0, dx = 0, drag = false;
    car.addEventListener('pointerdown', function(e){
      drag = true; sx = e.clientX; dx = 0;
      track.classList.add('drag');
    });
    car.addEventListener('pointermove', function(e){
      if(!drag) return;
      dx = e.clientX - sx;
      track.style.transform = 'translateX(calc(' + (-comboIdx*100) + '% + ' + dx + 'px))';
    });
    function up(){
      if(!drag) return;
      drag = false;
      track.classList.remove('drag');
      var was = comboIdx, to = comboIdx;
      if(dx < -46) to++;
      else if(dx > 46) to--;
      setCombo(to);
      if(to !== was) ding();
    }
    car.addEventListener('pointerup', up);
    car.addEventListener('pointerleave', up);
    car.addEventListener('pointercancel', up);
  })();

"""
END = u"  /* ---------- 7. battery：充到几成由用户自己判断 ---------- */"
ia = src.find(u"  /* ---------- 5. combo carousel ---------- */")
ib = src.find(END, ia)
assert ia > 0 and ib > ia, u'JS 主块边界没找到'
src = src[:ia] + NEW_JS + src[ib:]

# ================================================================ 6) renderTimeline 里的 Combo 取值
sub(
    u"    var cdef = COMBOS[(comboBase + comboIdx) % COMBOS.length] || COMBOS[0];",
    u"    var cdef = COMBOS[comboAlt] || COMBOS[0];",
    u'JS：renderTimeline 取 Combo')

# ================================================================ 7) resetAll
sub(
    u"""    // 放松 Combo 回到第一张；断连滑块归零
    comboBase = 0; comboIdx = 0;""",
    u"""    // 放松 Combo 回到第一张；断连滑块归零
    comboAlt = 0; comboIdx = 0;""",
    u'JS：resetAll Combo')

sub(
    u"""    // 派生界面整体重绘，再回到第一屏
    paintProfile();            // 含今晚日程 / 设置页 / 逐件规划
    curIdx = defIdx();
    renderCards(cardsFor(tlBlocks[curIdx]));
    paintSchedBar();
    go('onb1');""",
    u"""    // 派生界面整体重绘，再回到第一屏
    paintProfile();            // 含今晚日程 / 设置页 / 逐件规划
    buildDeck();
    curIdx = DECK[0];
    renderTimeline();
    comboIdx = 0;
    renderCards();
    setCombo(0, true);
    go('onb1');""",
    u'JS：resetAll 重绘')

# ================================================================ 8) 版本标记
src = src.replace(u'<title>', u'<title>', 1)

io.open(DST, 'w', encoding='utf-8').write(src)

leftover = []
for k in [u'now-bar', u'nowWhen', u'runName', u'nowAt', u'nowIc', u'paintSchedBar',
          u'cardsFor', u'defIdx', u'comboBase', u'syncTimerToCombo', u'看这一件怎么做']:
    n = src.count(k)
    if n:
        leftover.append(u'%s=%d' % (k, n))

print(u'写出 %s' % DST)
print(u'尺寸 %.1f KB -> %.1f KB' % (before / 1024.0, len(src) / 1024.0))
print(u'屏幕数 %d / 图标实例 %d / svg %d'
      % (src.count(u'<section class="scr"'),
         src.count(u'class="ii ii-'),
         src.count(u'<svg')))
print(u'残留：%s' % (u'、'.join(leftover) if leftover else u'无'))
