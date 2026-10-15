# -*- coding: utf-8 -*-
"""
inject10.py —— v9 -> v10
1) 去掉「暂时停一下」：删 #cdPause（HTML / CSS 引用 / JS 监听 / paintCd 里的状态改写）
2) 「换一个」按钮搬到每一张行程卡上：给九件安排各配 2~3 个备选做法，
   点一次换下一个，卡片与今晚日程（时段 + 文案）同步
运行：python inject10.py
"""
import io, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, '..', 'index-v9-swipe.html')
DST = os.path.join(ROOT, '..', 'index-v10-anytime.html')

src = io.open(SRC, encoding='utf-8').read()
before = len(src)
log = []


def sub(old, new, tag=''):
    global src
    n = src.count(old)
    assert n == 1, '锚点不唯一(%d) %s：%r' % (n, tag, old[:70])
    src = src.replace(old, new)
    log.append(tag)


# ================================================================ 1) 底栏：删暂停、换一个改文字按钮
sub("""            <div class="combo-bar">
              <button class="icon-btn" id="comboNext" aria-label="换一批">
                <span class="ii ii-refresh" style="width:21px;height:21px"></span>
              </button>
              <button class="btn ghost" id="cdPause" style="display:none">暂时停一下</button>
              <button class="btn" id="cdGo" style="flex:1">开始这一件
                <span class="ii ii-play ii-inv" style="width:16px;height:16px"></span>
              </button>
            </div>""",
    """            <div class="combo-bar">
              <button class="btn ghost" id="comboNext">
                <span class="ii ii-refresh" style="width:15px;height:15px"></span>换一个
              </button>
              <button class="btn" id="cdGo" style="flex:1">开始这一件
                <span class="ii ii-play ii-inv" style="width:16px;height:16px"></span>
              </button>
            </div>""",
    '底栏')

# ================================================================ 2) CSS：换一个按钮在底栏里自适应
sub(""".combo-bar{display:flex;gap:9px;align-items:center}""",
    """.combo-bar{display:flex;gap:9px;align-items:center}
.combo-bar .btn{width:auto}
#comboNext{flex:0 0 auto;padding:0 17px;gap:7px}
#comboNext:hover{background:var(--yellow)}""",
    'CSS 底栏')

# ================================================================ 3) 数据：九件安排的备选
ALTS = r"""  /* ALTS：今晚每一格的备选做法，第 0 项是默认。
     sub 是日程行上的短说明；t 为 null 表示这一格的名字由画像决定（晚饭 / 散步）。
     d 为 null 表示沿用这一格在时间轴上的时长（上床缓冲是弹性块）。 */
  var ALTS = {
    combo: [
      {c:'#F8DF77', cat:'感官重组 Combo', t:'洗热水脸，<em>换家居服</em>', d:20, u:'分钟', sub:'感官重组 Combo',
       why:'热水冲掉脸上一天的油和紧绷，衣服一换，身体先知道到家了。',
       steps:['洗热水脸 · 1 分钟','换宽松家居服','自由刷短视频 20 分钟'], plus:'允许刷，不设上限提醒'},
      {c:'#F5B8D9', cat:'微动作 Combo', t:'靠墙<em>抬腿</em> 10 分钟', d:10, u:'分钟', sub:'微动作 Combo',
       why:'坐了一整天，下肢血液堵在小腿。抬腿让血回流，脑子会跟着松。',
       steps:['垫个枕头靠墙躺好','腿抬高与身体呈 90°','一边看社交媒体'], plus:'不用起身，不用换衣服'},
      {c:'#B7CBEB', cat:'触觉沉浸卡片', t:'擦干净<em>洗手池</em>', d:5, u:'分钟', sub:'触觉沉浸卡片',
       why:'手上做一件立刻有结果的小事，比任何冥想都容易把人拉回现实。',
       steps:['冲湿台面','擦掉水渍和水垢','把瓶瓶罐罐摆正'], plus:'5 分钟，看得见结果'},
      {c:'#9CAE70', cat:'微漫游卡片', t:'楼下走 10 分钟，<em>拍 3 朵花</em>', d:10, u:'分钟', sub:'微漫游卡片',
       why:'傍晚的自然光是免费的多巴胺。拍照这件事会逼你抬头找东西。',
       steps:['出门，不戴耳机','拍 3 朵小花','回来让 AI 认花语'], plus:'AI 拍照识别花语'}
    ],
    mic: [
      {c:'var(--yellow)', t:'把今天<em>说出口</em>', d:10, sub:'语音倒完，就断电',
       why:'没说完的事会一直占着脑子。说出口，再断电，今晚才算真的开始。',
       steps:['长按语音键，说满 2 分钟','AI 归置成明日待办','拉下电闸，物理断连'], plus:'不评价、不统计、不打分'},
      {c:'var(--yellow)', t:'<em>写下来</em>再关机', d:8, sub:'三行纸，写完折起来',
       why:'手写比说话慢一点，慢下来的那几秒正好用来把工作从身上摘掉。',
       steps:['便签上写三行：今天、明天、先做什么','折好放进抽屉','手机倒扣在玄关'], plus:'纸和笔就放在玄关'},
      {c:'var(--yellow)', t:'把桌面<em>清空</em>', d:6, sub:'只留一盏灯',
       why:'眼睛看到的乱会变成脑子里还没散的乱，收干净等于给今天做一次视觉收尾。',
       steps:['杯子收进厨房','纸张摞齐，扣上笔帽','只留台灯，关顶灯'], plus:'六分钟就够'}
    ],
    rain: [
      {c:'var(--blue)', t:'雨声 + <em>4-7-8 呼吸</em>', d:24, sub:'雨声，跟着圆点呼吸',
       why:'从工位到家中间那段路，需要一段没有信息的声音把状态换过来。',
       steps:['选一段纯音效','跟着圆点做 4-7-8 呼吸','到站自动停'], plus:'不播客、不听故事'},
      {c:'var(--blue)', t:'只看窗外，<em>不听东西</em>', d:24, sub:'手机放包里',
       why:'一整天都在接收信息，这一段可以什么都不输入，让脑子先空出来。',
       steps:['手机放进包里，不拿出来','找个靠窗的位置','想点跟工作无关的事'], plus:'不刷消息'},
      {c:'var(--blue)', t:'海浪声 + <em>闭眼</em>', d:20, sub:'到站前五分钟睁眼',
       why:'闭眼的二十分钟比硬撑一小时更管用，前提是不要看屏幕。',
       steps:['换成海浪声','靠着椅背闭眼','到站前五分钟睁眼，活动肩颈'], plus:'坐过站就多走一段'}
    ],
    meal: [
      {t:null, d:null, sub:null,
       steps:['烧水，下面','顺手煎一个蛋','吃完把碗泡上'], plus:'吃的时候不看工作消息'},
      {t:'常点的那家<em>盖饭</em>', d:25, sub:'外卖，不用洗碗',
       why:'今天不想动灶，就点一份一直吃得惯的，省下的力气留给别的。',
       steps:['下单常点的那一份','用瓷碗装出来','吃完盒子直接扔'], plus:'只点一份，不加餐'},
      {t:'把冰箱<em>剩的菜</em>热一下', d:15, sub:'十五分钟解决',
       why:'冰箱里那几样再放一晚就得扔，热一盘吃完，比又买一份省事。',
       steps:['剩菜倒进锅里','大火热透','盛出来一顿吃完'], plus:'不新开一包食材'}
    ],
    walk: [
      {t:null, d:null, sub:null,
       steps:['出门，不戴耳机','沿环线走一圈','回来顺手扔垃圾'], plus:'不设步数目标'},
      {t:'下楼<em>买瓶水</em>', d:10, sub:'便利店来回一趟',
       why:'有明确来回的短程最适合当下班后的第一段路，有起点也有终点。',
       steps:['套上外套下楼','便利店买瓶水或酸奶','原路走回来'], plus:'顺手把垃圾带下去'},
      {t:'阳台上<em>站一会儿</em>', d:5, sub:'不下楼，吹吹风',
       why:'真的没力气下楼的时候，站到户外五分钟，也比一直坐着强。',
       steps:['把阳台门打开','手机留在屋里','站着看远处'], plus:'五分钟就够'}
    ],
    watch: [
      {c:'var(--blue)', t:'看一集<em>《漫长的季节》</em>', d:45, sub:'《漫长的季节》第 1 集',
       why:'进别人的故事，才能从今天的事里退出来。这一集是整部的开头。',
       steps:['打开电视或投影','只看这一集','片尾就关'], plus:'不追进度，不补剧'},
      {c:'var(--blue)', t:'看一集<em>《我在他乡挺好的》</em>', d:45, sub:'《我在他乡挺好的》第 1 集',
       why:'一集讲一段都市里的日常，离你的今天不远，看完不用多想。',
       steps:['找到第 1 集','连片尾曲一起看完','把遥控器放回茶几'], plus:'不连看第二集'},
      {c:'var(--blue)', t:'看一集<em>《人生一串》</em>', d:30, sub:'纪录片，一集一个城市',
       why:'纪录片不用跟剧情，随时能停，半小时看完刚好去洗漱。',
       steps:['随便挑一集','不投屏，用笔记本看','看完直接合上盖子'], plus:'不边看边点外卖'}
    ],
    read: [
      {c:'var(--paper)', t:'读一个短篇<em>《夜晚的潜水艇》</em>', d:25, sub:'《夜晚的潜水艇》一个短篇',
       why:'屏幕之外还有更慢的节奏，读完一篇短篇刚好是一天的收尾。',
       steps:['把手机放到客厅','读一个短篇','读完就放下'], plus:'读不完也没关系'},
      {c:'var(--paper)', t:'读十页<em>《我们仨》</em>', d:20, sub:'《我们仨》十页',
       why:'文字很平，读的时候不用记住什么，翻十页就够松下来。',
       steps:['拿纸质书，不用阅读器','读十页','书签夹好放回原处'], plus:'读到一半停下也行'},
      {c:'var(--paper)', t:'翻一本<em>杂志</em>', d:15, sub:'杂志翻完就放下',
       why:'不想动脑的时候，翻图多字少的杂志最省力，也最容易停下来。',
       steps:['抽一本杂志','从中间随便翻开','翻完扔进回收筐'], plus:'不要求从头看'}
    ],
    tooth: [
      {c:'var(--blue)', t:'刷牙洗脸，<em>收明天的包</em>', d:20, sub:'屏幕提示全部静音',
       why:'洗漱是把今天的身体交还给明天，做完这一件就该关灯了。',
       steps:['刷牙、洗脸','把明天的包收好','关掉客厅的灯'], plus:'不刷手机'},
      {c:'var(--blue)', t:'先<em>泡个脚</em>再洗漱', d:30, sub:'水温四十度左右',
       why:'脚热起来之后人会困得快，这二十分钟正好把一天最后一点力气用完。',
       steps:['接一盆四十度左右的热水','泡到后背微微出汗','擦干脚，再刷牙洗脸'], plus:'水凉了就结束'},
      {c:'var(--blue)', t:'只刷牙，<em>早十分钟上床</em>', d:10, sub:'今天不洗脸也没关系',
       why:'困意来了就先去睡，剩下的事明天早上做也来得及。',
       steps:['只刷牙','关灯关窗','直接上床'], plus:'不补今天漏掉的事'}
    ],
    bed: [
      {c:'var(--pink)', t:'躺下，<em>不看屏幕</em>', d:null, sub:'躺着就行，不必睡着',
       why:'躺着不等于睡着。给身体一段不用产出的时间，它自己会关机。',
       steps:['躺下，把手机放到床头柜以外','想点不费力的事'], plus:'睡不着也不扣分'},
      {c:'var(--pink)', t:'放着音乐<em>躺下</em>', d:null, sub:'只有音乐，没有说话声',
       why:'有人声的内容会让人跟着想事情，纯音乐不会。',
       steps:['放一段纯音乐，定时十分钟','屏幕扣过去','音乐停了就关掉'], plus:'不选有声书，不播客'},
      {c:'var(--pink)', t:'翻<em>相册</em>里的旧照片', d:null, sub:'只看照片，不看评论',
       why:'翻自己的照片，比刷别人的动态更容易把注意力从今天挪开。',
       steps:['打开相册，翻到一两年前','挑一张存下来','关屏幕，躺平'], plus:'不点开社交软件'}
    ]
  };"""

OLD_COMBOS_START = "  var COMBOS = ["
i0 = src.index(OLD_COMBOS_START)
i1 = src.index("\n  ];", i0) + len("\n  ];")
src = src[:i0] + ALTS + src[i1:]
log.append('ALTS')

# ================================================================ 4) 状态变量
sub("""  var comboAlt = 0;                  // 当前选中的放松 Combo 备选
  var comboIdx = 0;                  // 行程流里当前第几张""",
    """  var altOf = {};                    // 每一格当前选中的备选下标
  var comboIdx = 0;                  // 行程流里当前第几张""",
    'altOf')

_i0 = src.index("  /* 每一格的做法：标题与一句描述取自这一格自己的文案，步骤 / 说明在此补齐 */")
_i1 = src.index("\n  };\n", _i0) + len("\n  };\n")
src = src[:_i0] + "  var rowOverride = {};              // 用户「换一个」之后，这一格改写后的写法与时长\n" + src[_i1:]
log.append('rowOverride')

# ================================================================ 5) cardOf：按备选出卡
sub("""  /* 一格 -> 一张卡 */
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
  }""",
    """  function strip(s){ return String(s == null ? '' : s).replace(/<[^>]+>/g, ''); }
  function altsOf(k){ return (ALTS[k] && ALTS[k].length) ? ALTS[k] : null; }
  function altIdx(k){ return altOf[k] || 0; }

  /* 一格 -> 一张卡：第 0 项是默认，点「换一个」往后轮 */
  function cardOf(i){
    var b = tlBlocks[i];
    if(!b) return null;
    var k = b.r.key || b.r.ic;
    var list = altsOf(k) || [];
    var o = list[altIdx(k)] || list[0] || {};
    var tx = TX[k] || {};
    var name = (o.t || tx.name || b.r.name).replace(/^晚饭 · /, '').replace(/^散步 · /, '');
    return {
      c: o.c || b.r.bg,
      cat: k === 'combo' ? (o.cat || '放松 Combo') : (hhmm(b.t) + ' 开始'),
      t: name,
      d: o.d == null ? String(b.m) : String(o.d),
      u: o.u || '分钟',
      why: o.why || tx.note || b.r.note || '',
      steps: o.steps || [],
      plus: o.plus || '',
      sub: o.sub == null ? '' : o.sub
    };
  }""",
    'cardOf')

# ================================================================ 6) paintNext：每张卡都能换
sub("""  function isComboBlock(){
    var b = tlBlocks[curIdx];
    return !!(b && b.r.key === 'combo');
  }
  function paintNext(){
    $('#comboNext').style.display = (isComboBlock() && !cdStarted) ? '' : 'none';
  }""",
    """  function isComboBlock(){
    var b = tlBlocks[curIdx];
    return !!(b && b.r.key === 'combo');
  }
  /* 「换一个」：只要这一格有备选就出现，做到一半想换也随时能换 */
  function paintNext(){
    var b = tlBlocks[curIdx];
    var k = b ? (b.r.key || b.r.ic) : null;
    var list = k ? altsOf(k) : null;
    $('#comboNext').style.display = (list && list.length > 1) ? '' : 'none';
  }""",
    'paintNext')

# ================================================================ 7) setCombo：翻页只换高亮与计时，不改日程
sub("""    curIdx = DECK[comboIdx];
    var b = tlBlocks[curIdx];
    nowKey = b ? (b.r.key || null) : null;
    $('#comboSrc').style.display = (b && b.r.key === 'combo') ? '' : 'none';
    applyCardToPlan();
    renderTimeline();
    syncTimerToDeck();
    paintNext();""",
    """    curIdx = DECK[comboIdx];
    var b = tlBlocks[curIdx];
    nowKey = b ? (b.r.key || null) : null;
    $('#comboSrc').style.display = (b && b.r.key === 'combo') ? '' : 'none';
    renderTimeline();
    syncTimerToDeck();
    paintNext();""",
    'setCombo')

# ================================================================ 8) paintCd：去掉暂停态
sub("""  function paintCd(){
    var num = $('#cdNum');
    if(!num) return;
    num.textContent = fmt(left);
    $('#cdFill').style.width = (total ? Math.max(0, Math.min(100, left/total*100)) : 0).toFixed(1) + '%';
    $('#cdState').textContent = !cdStarted ? '未开始' : (running ? '进行中' : (left <= 0 ? '已完成' : '已暂停'));
    var p = $('#cdPause');
    p.style.display = (cdStarted && left > 0) ? '' : 'none';
    p.textContent = running ? '暂时停一下' : '继续';
    $('#cdGo').innerHTML = cdStarted""",
    """  function paintCd(){
    var num = $('#cdNum');
    if(!num) return;
    num.textContent = fmt(left);
    $('#cdFill').style.width = (total ? Math.max(0, Math.min(100, left/total*100)) : 0).toFixed(1) + '%';
    $('#cdState').textContent = !cdStarted ? '未开始' : (left <= 0 ? '已完成' : '进行中');
    $('#cdGo').innerHTML = cdStarted""",
    'paintCd')

# ================================================================ 8b) 计时器复位
sub("""  function stopTimer(){
    running = false;
    clearInterval(tick);
    paintCd();
  }""",
    """  function stopTimer(){
    running = false;
    clearInterval(tick);
    paintCd();
  }
  /* 复位用：计时器退回「还没打开过」的样子 */
  function resetCd(){
    running = false; cdStarted = false;
    clearInterval(tick);
    total = 20 * 60; left = total;
    var n = $('#cdNum');
    if(n) n.textContent = '--:--';
    if($('#cdState')) $('#cdState').textContent = '未开始';
    if($('#cdFill')) $('#cdFill').style.width = '0%';
    paintNext();
  }""",
    'resetCd')

# ================================================================ 9) applyCardToPlan：通用覆盖
sub("""  function applyCardToPlan(){
    if(!isComboBlock()) return;
    var o = COMBOS[comboAlt] || COMBOS[0];
    if(!o) return;
    planDur.combo = parseInt(o.d, 10) || 20;
    planTx.combo = {name:o.t.replace(/<[^>]+>/g,''), note:o.cat};
  }

  $('#cdPause').addEventListener('click', function(){ if(running) stopTimer(); else startTimer(); });""",
    """  /* 卡片上的选择落到今晚日程：换回第 1 种就是还原，其余写名字 / 说明 / 时长 */
  function applyCardToPlan(){
    var b = tlBlocks[curIdx];
    if(!b) return;
    var k = b.r.key || b.r.ic;
    var o = cardOf(curIdx);
    if(!o) return;
    if(altIdx(k) === 0){
      delete rowOverride[k];
    } else {
      var ov = {};
      if(o.t){ ov.name = o.t; ov.note = o.sub || ''; }
      if(o.d != null && parseInt(o.d, 10) > 0) ov.min = parseInt(o.d, 10);
      rowOverride[k] = ov;
    }
    if(k === 'combo'){
      var c0 = ALTS.combo[altIdx(k)] || ALTS.combo[0];
      planDur.combo = parseInt(c0.d, 10) || 20;
      planTx.combo = altIdx(k) === 0
        ? {name:'', note:''}
        : {name:strip(c0.t), note:c0.cat};
    }
  }""",
    'applyCardToPlan')

# ================================================================ 10) 换一个：轮换当前这一格的备选
sub("""  $('#comboNext').addEventListener('click', function(){
    comboAlt = (comboAlt + 1) % COMBOS.length;
    renderCards();
    setCombo(comboIdx, true);
    ding();
    toast('换了一批备选');
  });""",
    """  $('#comboNext').addEventListener('click', function(){
    var b = tlBlocks[curIdx];
    if(!b) return;
    var k = b.r.key || b.r.ic;
    var list = altsOf(k);
    if(!list || list.length < 2) return;
    altOf[k] = (altIdx(k) + 1) % list.length;
    applyCardToPlan();      // 先写回日程，再拿最新的时间轴重画卡片
    renderTimeline();
    renderCards();
    setCombo(comboIdx, true);
    syncTimerToDeck();
    ding();
    toast('换了一个安排');
  });""",
    '换一个')

# ================================================================ 11) renderTimeline：支持任一格被替换
sub("""    var cdef = COMBOS[comboAlt] || COMBOS[0];
    TX.combo.name = planTx.combo.name || cdef.t.replace(/<[^>]+>/g, '');
    TX.combo.note = planTx.combo.note || cdef.cat;""",
    """    var cdef = ALTS.combo[0];
    TX.combo.name = planTx.combo.name || cdef.t.replace(/<[^>]+>/g, '');
    TX.combo.note = planTx.combo.note || cdef.cat;""",
    'renderTimeline-combo')

sub("""    var rows = [];
    EV_FIX.forEach(function(r){
      var m = r.min, over = r.key && planDur[r.key] !== undefined;
      if(over){
        if(planDur[r.key] === 0) return;
        m = planDur[r.key];
      }
      rows.push({r:r, min:(r.free || r.key === 'bed') ? null : m});
    });""",
    """    var rows = [];
    EV_FIX.forEach(function(r){
      var m = r.min;
      if(r.key && planDur[r.key] !== undefined){
        if(planDur[r.key] === 0) return;
        m = planDur[r.key];
      }
      var ov = rowOverride[r.key || r.ic];
      if(ov && ov.min !== undefined){
        if(ov.min === 0) return;
        m = ov.min;
      }
      rows.push({r:r, min:(r.free || r.key === 'bed') ? null : m});
    });""",
    'renderTimeline-rows')

sub("""      var r = b.r, tx = r.key ? TX[r.key] : null;
      var name = tx && tx.name ? tx.name : r.name;
      var note = tx && tx.note ? tx.note : r.note;""",
    """      var r = b.r, tx = TX[r.key] || TX[r.ic] || null;
      var ov = rowOverride[r.key || r.ic];
      var name = (ov && ov.name) || (tx && tx.name) || r.name;
      var note = (ov && ov.name) ? (ov.note || '') : ((tx && tx.note) || r.note);""",
    'renderTimeline-row')

# ================================================================ 12) enterCombo / resetAll
sub("""    if(curIdx < 0 || curIdx >= tlBlocks.length || tlBlocks[curIdx].r.free) curIdx = DECK[0];
    renderTimeline();
    comboIdx = deckPosOf(curIdx);
    cdStarted = false;""",
    """    if(curIdx < 0 || curIdx >= tlBlocks.length || tlBlocks[curIdx].r.free) curIdx = DECK[0];
    renderTimeline();
    comboIdx = deckPosOf(curIdx);
    cdStarted = false; running = false;""",
    'enterCombo')

sub("""    // 放松 Combo 回到第一张；断连滑块归零
    comboAlt = 0; comboIdx = 0;""",
    """    // 每一格的备选回到默认；断连滑块归零
    altOf = {}; rowOverride = {}; comboIdx = 0;""",
    'resetAll')

sub("""    nowKey = null; curIdx = -1; cdStarted = false;
    stopTimer();
    showCombo('sched');""",
    """    nowKey = null; curIdx = -1;
    resetCd();
    showCombo('sched');""",
    'resetAll-resetCd')

# ================================================================ 13) 规格面板
sub("""      '<b>做法卡</b>：名称、时长、一句说明与三步做法；放松 Combo 一格另有「换一批」切换备选。',
      '<b>计时器</b>：计时放在卡片里，开始后倒计时与进度条同步走，暂停后仍留在同一张卡上。',""",
    """      '<b>做法卡</b>：名称、时长、一句说明与三步做法；每一件都带「换一个」，点一次换下一种做法，名字、说明与时长同步写回今晚日程。',
      '<b>计时器</b>：计时放在卡片里，倒计时与进度条同步走。不设暂停，也不必卡在准点上 —— 开始之后做到哪算哪。',""",
    'SPEC combo')

# ================================================================ 14) 版本标记
src = src.replace('<!-- v9 · 行程卡片流 -->', '<!-- v10 · 每一件都能换 -->')

io.open(DST, 'w', encoding='utf-8').write(src)
print('写出 %s' % os.path.abspath(DST))
print('尺寸 %.1f KB -> %.1f KB' % (before / 1024, len(src) / 1024))
print('屏幕数 %d / svg %d / 图标 %d' % (
    src.count('<section class="scr"'),
    src.count('<svg'),
    src.count('<span class="ii ii-')))
print('步骤：' + ' / '.join(log))
