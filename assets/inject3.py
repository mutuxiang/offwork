# -*- coding: utf-8 -*-
"""
在 index-v2-icons.html 基础上叠加 v3：
  1) 新增「首次启动」流程 4 屏：欢迎与自我介绍 / 预设睡觉时间 / 位置授权 / 晚饭方式
  2) 新增 Tab 1 的「睡前日程」屏：按睡觉时间倒排 18:30 下班到入睡的时间块
  3) 12 枚新图标（床 / 指南针 / 平底锅 / 饭碗 / 运动鞋 / 牙刷 / 沙发 / 日历 /
     灯泡 / 马克杯 / 对话气泡 / 叶子）base64 内嵌
  4) 画像联动：睡觉时间、位置授权、晚饭方式、通勤预定的选择会改写睡前日程
产出：index-v3-onboard.html，v1 / v2 均保留为回退版本。
"""
import base64, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # offwork/
SRC = os.path.join(ROOT, "index-v2-icons.html")
DST = os.path.join(ROOT, "index-v3-onboard.html")
ICON_DIR = os.path.join(ROOT, "assets", "icons")

NEW_ICONS = ["bed", "compass", "pan", "bowl", "shoe", "tooth",
             "sofa", "calendar", "bulb", "mug", "bubble", "leaf"]


def data_uri(name):
    with open(os.path.join(ICON_DIR, name + ".png"), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


# ---------------------------------------------------------------- CSS
II_CSS = ["/* ---------- v3：新增手绘图标 ---------- */"]
for n in NEW_ICONS:
    II_CSS.append('.ii-%s{background-image:url("%s")}' % (n, data_uri(n)))

CSS_V3 = "\n".join(II_CSS) + """

/* ---------- v3：首次启动引导 ---------- */
.device.guide .tabbar{opacity:0;pointer-events:none}
.device.guide .viewport{bottom:0}
.ob-steps{display:flex;gap:5px;margin:0 0 12px}
.ob-steps i{flex:1;height:5px;border-radius:3px;background:rgba(20,20,20,.13)}
.ob-steps i.on{background:var(--ink)}

.mini-list{display:flex;flex-direction:column}
.mini{display:flex;align-items:center;gap:11px;padding:9px 0;border-bottom:1.5px dashed var(--hair)}
.mini:last-child{border-bottom:0;padding-bottom:0}
.mini-ic{
  width:32px;height:32px;border-radius:11px;border:1.5px solid var(--ink);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.mini-tx{flex:1;min-width:0}
.mini-tx b{display:block;font-size:12.5px;font-weight:800;margin-bottom:2px}
.mini-tx span{display:block;font-size:10.5px;line-height:1.55;color:var(--ink-3);font-weight:600}

.chip.on{background:var(--ink);color:var(--cream)}
.time-pick{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  border:2px solid var(--ink);border-radius:26px;background:var(--paper);padding:13px 16px;
}
.time-val{
  font-size:44px;font-weight:800;letter-spacing:-.05em;line-height:1;
  font-variant-numeric:tabular-nums;text-align:center;
}
.time-val small{
  display:block;font-size:10.5px;font-weight:700;color:var(--ink-3);
  letter-spacing:.02em;margin-top:7px;
}
.round-btn{
  width:42px;height:42px;border-radius:50%;border:2px solid var(--ink);
  background:var(--paper);color:var(--ink);line-height:1;flex-shrink:0;
  font-family:var(--font);font-size:17px;font-weight:800;cursor:pointer;
  transition:background .12s;
}
.round-btn:hover{background:var(--yellow)}
.perm-row{
  display:flex;gap:9px;align-items:flex-start;padding:9px 0;
  border-bottom:1.5px dashed var(--hair);
  font-size:11.5px;line-height:1.6;color:var(--ink-2);font-weight:600;
}
.perm-row:last-child{border-bottom:0;padding-bottom:0}
.perm-row i{width:6px;height:6px;border-radius:50%;flex-shrink:0;margin-top:6px}
.btn.ghost.picked{background:var(--ink);color:var(--cream)}

/* ---------- v3：睡前日程时间轴 ---------- */
.tl-wrap{border:2px solid var(--ink);border-radius:22px;background:var(--paper);padding:9px 14px}
.tl{display:flex;align-items:flex-start;gap:9px;padding:5px 0;border-bottom:1.5px dashed var(--hair)}
.tl:last-child{border-bottom:0;padding-bottom:2px}
.tl-t{width:38px;flex-shrink:0;font-size:10.5px;font-weight:800;font-variant-numeric:tabular-nums;padding-top:2px}
.tl-ic{
  width:26px;height:26px;border-radius:9px;border:1.5px solid var(--ink);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:-1px;
}
.tl-c{flex:1;min-width:0}
.tl-n{display:flex;align-items:baseline;justify-content:space-between;gap:8px}
.tl-n>span{
  font-size:11.5px;font-weight:800;letter-spacing:-.01em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.tl-n>span em{font-style:normal;font-size:9.5px;font-weight:600;color:var(--ink-3);margin-left:6px}
.tl-n>b{flex-shrink:0;font-size:9.5px;font-weight:800;color:var(--ink-3)}
.tl-b{display:block;height:5px;border-radius:3px;background:rgba(20,20,20,.09);margin-top:6px;overflow:hidden}
.tl-b i{display:block;height:100%;border-radius:3px;background:var(--ink)}
.tl.free .tl-b{background:transparent;border:1.5px dashed rgba(20,20,20,.3);height:6px}
.tl.free .tl-b i{background:repeating-linear-gradient(45deg,rgba(20,20,20,.2) 0 3px,transparent 3px 7px)}
"""

# ---------------------------------------------------------------- 屏幕
SCREENS = """        <!-- ============ 0-A. 首次启动 · 欢迎 ============ -->
        <section class="scr" id="scr-onb1">
          <span class="ii ii-sun deco" style="position:absolute;right:-26px;top:-24px;width:100px;height:100px;transform:rotate(12deg)"></span>

          <div class="kicker">首次启动 · <b>欢迎</b></div>
          <h1 class="h1">下班之后，<br>这段时间<span class="hl">归你</span>。</h1>
          <p class="lead">OffWork 只做一件事：帮你从「还在想工作」换成「开始过自己的晚上」。它不是日程软件，也不统计产出。</p>

          <div class="card">
            <div class="card-t">晚上会经过三段路<span>3 个模块</span></div>
            <div class="mini-list">
              <div class="mini">
                <span class="mini-ic" style="background:var(--yellow)"><span class="ii ii-mic" style="width:19px;height:19px"></span></span>
                <span class="mini-tx"><b>关机仪式</b><span>没说完的话说出口，待办封进「明日保险箱」，明早 9 点前不再提醒。</span></span>
              </div>
              <div class="mini">
                <span class="mini-ic" style="background:var(--blue)"><span class="ii ii-rain" style="width:19px;height:19px"></span></span>
                <span class="mini-tx"><b>通勤过渡舱</b><span>路上只给声音，不给故事：雨声、车厢、篝火，按疲惫度调。</span></span>
              </div>
              <div class="mini">
                <span class="mini-ic" style="background:var(--sage)"><span class="ii ii-chart" style="width:19px;height:19px"></span></span>
                <span class="mini-tx"><b>恢复仪表盘</b><span>只记录恢复：脱钩时长与充电池电量，不产出效率指标。</span></span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-t">开始前会问你三件事<span>约 1 分钟</span></div>
            <div class="chip-row">
              <span class="chip p">睡觉时间</span>
              <span class="chip b">位置授权</span>
              <span class="chip k">晚饭怎么解决</span>
            </div>
          </div>

          <div class="spacer"></div>
          <button class="btn" data-go="onb2">开始设置
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
          <button class="btn ghost sm" style="margin-top:8px" data-go="start">跳过设置，直接进入</button>
        </section>

        <!-- ============ 0-B. 首次启动 · 睡觉时间 ============ -->
        <section class="scr" id="scr-onb2">
          <span class="ii ii-moon deco" style="position:absolute;right:-22px;top:-18px;width:86px;height:86px;transform:rotate(10deg)"></span>

          <div class="kicker">首次启动 · <b>1 / 3 · 睡觉时间</b></div>
          <div class="ob-steps"><i class="on"></i><i></i><i></i></div>
          <h1 class="h1">你一般<br>几点睡？</h1>
          <p class="lead">睡前日程是倒推出来的：先定终点，再往回填。这个时间之后，App 不再安排任何事。</p>

          <div class="time-pick">
            <button class="round-btn" id="bedMinus" aria-label="提前 15 分钟">−</button>
            <div class="time-val" id="bedTime">23:30<small>周三 · 工作日</small></div>
            <button class="round-btn" id="bedPlus" aria-label="推迟 15 分钟">+</button>
          </div>

          <div class="chip-row" style="margin-top:10px" id="bedPresets">
            <span class="chip" data-bed="22:30">22:30</span>
            <span class="chip" data-bed="23:00">23:00</span>
            <span class="chip on" data-bed="23:30">23:30</span>
            <span class="chip" data-bed="00:00">00:00</span>
          </div>

          <div class="card" style="margin-top:14px">
            <div class="card-t">从 18:30 下班算起<span id="bedAvail">睡前可用 5 小时 0 分</span></div>
            <div class="perm-row">
              <i style="background:var(--yellow)"></i>
              固定块共 170 分钟（仪式 10 + 通勤 50 + 晚饭 40 + 散步 30 + Combo 20 + 洗漱 20），位置不动。
            </div>
            <div class="perm-row">
              <i style="background:var(--sage)"></i>
              剩下的时间按 9 : 4 分给自由留白与上床缓冲；睡前 30 分钟不再推荐任何活动。
            </div>
          </div>

          <div class="spacer"></div>
          <button class="btn" data-go="onb3">下一步，位置
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
        </section>

        <!-- ============ 0-C. 首次启动 · 位置授权 ============ -->
        <section class="scr" id="scr-onb3">
          <span class="ii ii-compass deco" style="position:absolute;right:-24px;top:-20px;width:92px;height:92px;transform:rotate(9deg)"></span>

          <div class="kicker">首次启动 · <b>2 / 3 · 位置</b></div>
          <div class="ob-steps"><i></i><i class="on"></i><i></i></div>
          <h1 class="h1">能读你的<br>位置吗？</h1>
          <p class="lead">只在两个时刻读，其余时间不读。</p>

          <div class="card">
            <div class="card-t">会用到的两件事<span>只在用时读</span></div>
            <div class="mini-list">
              <div class="mini">
                <span class="mini-ic" style="background:var(--blue)"><span class="ii ii-pin" style="width:19px;height:19px"></span></span>
                <span class="mini-tx"><b>下班触发</b><span>判断你是否已经离开办公楼，作为定时触发之外的第二条件。</span></span>
              </div>
              <div class="mini">
                <span class="mini-ic" style="background:var(--yellow)"><span class="ii ii-shoe" style="width:19px;height:19px"></span></span>
                <span class="mini-tx"><b>散步路线</b><span>在你家附近找一条 20 分钟能走完的环线，填进睡前日程。</span></span>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-t">不会做的事</div>
            <div class="perm-row"><i style="background:var(--pink)"></i>不记录轨迹历史，退出后不留位置日志。</div>
            <div class="perm-row"><i style="background:var(--pink)"></i>不用于广告、推荐位与任何商业用途。</div>
            <div class="perm-row"><i style="background:var(--pink)"></i>可随时在系统设置里关闭，App 不做二次索取。</div>
          </div>

          <div class="btn-row" style="margin-top:14px">
            <button class="btn ghost" id="geoAllow">允许使用位置</button>
            <button class="btn ghost" id="geoDeny">暂不开启</button>
          </div>
          <p class="note" id="geoNote">还没选。选定后仍可在系统设置里改。</p>

          <button class="btn" style="margin-top:12px" data-go="onb4">下一步，晚饭
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
        </section>

        <!-- ============ 0-D. 首次启动 · 晚饭方式 ============ -->
        <section class="scr" id="scr-onb4">
          <div class="kicker">首次启动 · <b>3 / 3 · 晚饭</b></div>
          <div class="ob-steps"><i></i><i></i><i class="on"></i></div>
          <h1 class="h1">到家以后，<br>晚饭怎么办？</h1>
          <p class="lead">这一格决定日程里 19:30 那半小时怎么排。</p>

          <div id="cookOpts">
            <button class="opt on" data-cook="A">
              <span class="alpha" style="background:var(--yellow)"><span class="ii ii-pan" style="width:21px;height:21px"></span></span>
              <span class="opt-tx"><b>能做正经饭</b><span>有灶有锅，愿意花 30 分钟</span></span>
              <span class="tick"><span class="ii ii-check ii-inv" style="width:14px;height:14px"></span></span>
            </button>
            <button class="opt" data-cook="B">
              <span class="alpha" style="background:var(--blue)"><span class="ii ii-bowl" style="width:21px;height:21px"></span></span>
              <span class="opt-tx"><b>只能热一下</b><span>微波炉或速冻，10 分钟解决</span></span>
              <span class="tick"><span class="ii ii-check ii-inv" style="width:14px;height:14px"></span></span>
            </button>
            <button class="opt" data-cook="C">
              <span class="alpha" style="background:var(--pink)"><span class="ii ii-mug" style="width:21px;height:21px"></span></span>
              <span class="opt-tx"><b>基本靠外卖</b><span>到家前点好，进门就能吃</span></span>
              <span class="tick"><span class="ii ii-check ii-inv" style="width:14px;height:14px"></span></span>
            </button>
          </div>

          <div class="card">
            <div class="card-t">你的画像<span id="profileTag">已生成</span></div>
            <div class="chip-row">
              <span class="chip b" id="chipSleep">睡觉 23:30</span>
              <span class="chip k" id="chipGeo">位置 未选</span>
              <span class="chip p" id="chipCook">晚饭 能做正经饭</span>
            </div>
          </div>

          <div class="spacer"></div>
          <button class="btn" data-go="start">完成设置，开始今晚
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
          <p class="note">三项都能在「设置 · 我的画像」里改，改完睡前日程会立刻重排。</p>
        </section>

        <!-- ============ 1. 下班触发 ============ -->
"""

EVENING = """        <!-- ============ 8-A. 睡前日程 ============ -->
        <section class="scr" id="scr-evening">
          <span class="ii ii-calendar deco" style="position:absolute;right:-28px;top:-26px;width:102px;height:102px;transform:rotate(8deg)"></span>

          <div class="kicker">Tab 1 · <b>模块二 · 进门之后</b></div>
          <h1 class="h1" style="font-size:26px">今晚从 18:30<br>排到 <span id="evBedLbl">23:30</span>。</h1>
          <p class="lead">按你的睡觉时间与到家时间倒推。虚线那段是故意留白的：不安排，也不提醒。</p>

          <div class="tl-wrap" id="tlWrap"></div>

          <p class="note"><b>排程依据：</b>睡觉 <span id="evSrcBed">23:30</span> · 下班 18:30 · <span id="evSrcGeo">位置未选</span> · <span id="evSrcCook">能做正经饭</span>。固定块共 170 分钟不动，留白与上床缓冲按 9 : 4 分。</p>

          <div class="spacer"></div>
          <button class="btn" data-go="combo">就按这个来
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
        </section>

        <!-- ============ 8. 放松 Combo ============ -->
"""

# ---------------------------------------------------------------- SPEC 条目
SPEC_ADD = """    onb1:{mod:'Tab 0 · 首次启动',title:'欢迎与自我介绍',pts:[
      '<b>触发</b>：首次安装打开即进入，之后不再出现。',
      '<b>作用</b>：用三段路（关机仪式 / 通勤过渡舱 / 恢复仪表盘）说明产品边界，避免被当成待办或打卡工具。',
      '底部提供跳过入口，设置流程不强制。'
    ]},
    onb2:{mod:'Tab 0 · 首次启动',title:'预设睡觉时间',pts:[
      '<b>为什么要问</b>：睡前日程的终点是入睡时间，先定终点才能往回排。',
      '<b>交互</b>：15 分钟步进与四个常见预设；实时算出「睡前可用时长」。',
      '该时间只影响排程，不承担闹钟职责。'
    ]},
    onb3:{mod:'Tab 0 · 首次启动',title:'位置授权',pts:[
      '<b>两处用途</b>：判断是否已离开办公楼（触发条件二）；在家附近找 20 分钟散步环线。',
      '<b>边界</b>：不记录轨迹历史、不用于广告、不加二次索取。',
      '选择会同步到睡前日程的散步那一格。'
    ]},
    onb4:{mod:'Tab 0 · 首次启动',title:'晚饭方式',pts:[
      '<b>三档</b>：能做正经饭 / 只能热一下 / 基本靠外卖。',
      '<b>作用</b>：决定日程里 19:30 的时间块内容与时长提示。',
      '选定后生成「我的画像」，供后续所有推荐复用。'
    ]},
    evening:{mod:'Tab 1 · 模块二',title:'睡前日程',pts:[
      '<b>来源</b>：下班时间 18:30 与睡觉时间倒推，跨度 5 小时。',
      '<b>联动</b>：晚饭格取自画像，散步格取自位置授权，Combo 格取自通勤预定的选择。',
      '<b>留白规则</b>：21:00–22:30 不安排内容，也不做提醒，条长按时长比例绘制。',
      '任一格改动，后续时间块整体顺延。'
    ]}
"""

# ---------------------------------------------------------------- JS
JS_V3 = """  /* ---------- 9. v3：首启引导与睡前日程 ---------- */
  var profile = { bed: 23 * 60 + 30, geo: null, cook: 'A' };   // bed：从 0 点起的分钟数
  var BED_MIN = 22 * 60, BED_MAX = 25 * 60 + 30;               // 可设范围 22:00 – 01:30

  // 睡前日程：固定块不动，弹性块（自由留白 / 上床缓冲）吸收睡觉时间的早晚
  var EV_FIX = [
    {ic:'mic',   bg:'var(--yellow)', name:'关机仪式',    note:'把今天说出口',          min:10},
    {ic:'rain',  bg:'var(--blue)',   name:'通勤过渡舱',  note:'雨声 + 4-7-8 呼吸',     min:50},
    {ic:'pan',   bg:'var(--pink)',   key:'meal',                                       min:40},
    {ic:'shoe',  bg:'var(--sage)',   key:'walk',                                       min:30},
    {ic:'sofa',  bg:'var(--yellow)', name:'放松 Combo',  key:'combo',                  min:20},
    {ic:'leaf',  bg:'var(--paper)',  name:'自由留白',    note:'不安排，也不提醒',       key:'free', free:true},
    {ic:'tooth', bg:'var(--blue)',   name:'洗漱',        note:'屏幕提示全部静音',       min:20},
    {ic:'bed',   bg:'var(--pink)',   name:'上床缓冲',    note:'躺着就行，不必睡着',     key:'bed'}
  ];
  var TX = { meal:{name:'', note:''}, walk:{name:'', note:''}, combo:{name:'放松 Combo', note:''} };
  var evComboNote = '已预定：泡脚 + 刷短视频';

  function renderTimeline(){
    var cook = COOK_TX[profile.cook];
    var geo = GEO_TX[profile.geo === 'yes' ? 'yes' : 'no'];
    TX.meal.name = cook.meal;   TX.meal.note = cook.note;
    TX.walk.name = geo.walk;    TX.walk.note = geo.note;
    TX.combo.note = evComboNote;

    var start = 18 * 60 + 30;
    var fixed = 0;
    EV_FIX.forEach(function(r){ if(r.min) fixed += r.min; });
    var flex = Math.max(40, profile.bed - start - fixed);
    var free = Math.round(flex * 90 / 130);          // 留白 : 上床缓冲 = 9 : 4
    var bufm = flex - free;

    var blocks = [], t = start, maxMin = 1;
    EV_FIX.forEach(function(r){
      var m = r.min || (r.free ? free : bufm);
      blocks.push({r:r, t:t, m:m});
      t += m;
      if(m > maxMin) maxMin = m;
    });

    var html = blocks.map(function(b){
      var r = b.r, tx = r.key ? TX[r.key] : null;
      var name = tx && tx.name ? tx.name : r.name;
      var note = tx && tx.note ? tx.note : r.note;
      var nameEl = note ? name + '<em>' + note + '</em>' : name;
      var el = '<div class="tl' + (r.free ? ' free' : '') + '">' +
        '<span class="tl-t">' + hhmm(b.t) + '</span>' +
        '<span class="tl-ic" style="background:' + r.bg + '">' +
          '<span class="ii ii-' + r.ic + '" style="width:15px;height:15px"></span></span>' +
        '<span class="tl-c">' +
          '<span class="tl-n"><span>' + nameEl + '</span><b>' + b.m + '′</b></span>' +
          '<span class="tl-b"><i style="width:' + (b.m / maxMin * 100).toFixed(1) + '%"></i></span>' +
        '</span></div>';
      return el;
    }).join('');

    var w = document.getElementById('tlWrap');
    if(w) w.innerHTML = html;
  }

  function hhmm(min){
    min = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  var COOK_TX = {
    A: {meal:'晚饭 · 番茄鸡蛋面', note:'冰箱里有鸡蛋和番茄', chip:'能做正经饭', src:'晚饭 能做正经饭'},
    B: {meal:'晚饭 · 热一份速冻饺子', note:'冷冻层常备，10 分钟', chip:'只能热一下', src:'晚饭 只能热一下'},
    C: {meal:'晚饭 · 常点的那家盖饭', note:'到家前 20 分钟下单', chip:'基本靠外卖', src:'晚饭 靠外卖'}
  };
  var GEO_TX = {
    yes: {walk:'散步 · 外环一圈 1.8 km', note:'出门右转，20 分钟走完', chip:'已允许', src:'位置已允许'},
    no:  {walk:'散步 · 路线自己挑', note:'未开启位置，走熟悉那条', chip:'未授权', src:'位置未授权'}
  };

  function paintProfile(){
    $('#bedTime').innerHTML = hhmm(profile.bed) + '<small>周三 · 工作日</small>';
    $$('#bedPresets .chip').forEach(function(c){
      c.classList.toggle('on', c.getAttribute('data-bed') === hhmm(profile.bed));
    });
    var avail = profile.bed - (18 * 60 + 30);
    if(avail < 0) avail += 1440;
    $('#bedAvail').textContent = '睡前可用 ' + Math.floor(avail / 60) + ' 小时 ' + (avail % 60) + ' 分';

    var cook = COOK_TX[profile.cook];
    var geo = GEO_TX[profile.geo === 'yes' ? 'yes' : 'no'];
    $('#evBedLbl').textContent = hhmm(profile.bed);
    $('#evSrcBed').textContent = hhmm(profile.bed);
    $('#evSrcGeo').textContent = geo.src;
    $('#evSrcCook').textContent = cook.src;
    $('#chipSleep').textContent = '睡觉 ' + hhmm(profile.bed);
    $('#chipGeo').textContent = '位置 ' + geo.chip;
    $('#chipCook').textContent = '晚饭 ' + cook.chip;
    renderTimeline();

    $('#geoAllow').classList.toggle('picked', profile.geo === 'yes');
    $('#geoDeny').classList.toggle('picked', profile.geo === 'no');
    $('#geoNote').innerHTML = profile.geo === 'yes'
      ? '<b>已允许：</b>只在使用期间读取，不写入轨迹历史。散步那格已按家附近环线排好。'
      : (profile.geo === 'no'
        ? '<b>已跳过：</b>下班触发只保留时间条件，散步那格改为让你自己挑路线。'
        : '还没选。选定后仍可在系统设置里改。');
  }

  function setBed(m){
    if(m < 12 * 60) m += 1440;      // 00:00 这类预设按次日凌晨处理
    profile.bed = Math.max(BED_MIN, Math.min(BED_MAX, m));
    paintProfile();
  }
  $('#bedMinus').addEventListener('click', function(){ setBed(profile.bed - 15); ding(); });
  $('#bedPlus').addEventListener('click', function(){ setBed(profile.bed + 15); ding(); });
  $('#bedPresets').addEventListener('click', function(e){
    var c = e.target.closest('[data-bed]');
    if(!c) return;
    var p = c.getAttribute('data-bed').split(':');
    setBed(parseInt(p[0], 10) * 60 + parseInt(p[1], 10));
    ding();
  });

  $('#geoAllow').addEventListener('click', function(){ profile.geo = 'yes'; paintProfile(); ding(); });
  $('#geoDeny').addEventListener('click', function(){ profile.geo = 'no'; paintProfile(); ding(); });

  $('#cookOpts').addEventListener('click', function(e){
    var b = e.target.closest('[data-cook]');
    if(!b) return;
    profile.cook = b.getAttribute('data-cook');
    $$('#cookOpts .opt').forEach(function(o){ o.classList.remove('on'); });
    b.classList.add('on');
    paintProfile();
    ding();
  });

  // 通勤预定的选择写进睡前日程的 Combo 格
  function syncEvening(){
    var o = document.querySelector('#opts .opt.on');
    if(o){
      var n = o.querySelector('.opt-tx b');
      if(n) evComboNote = '已预定：' + n.textContent;
    }
    renderTimeline();
  }

  /* ---------- boot ---------- */"""


src = open(SRC, encoding="utf-8").read()
orig_len = len(src)

# 1) 样式
assert src.count("</style>") == 1, "style 锚点不唯一"
src = src.replace("</style>", CSS_V3 + "</style>", 1)

# 2) rail：引导分组 + 睡前日程条目
rail_anchor = """    <div class="rail-grp">
      <h4>Tab 1 · <span>主功能</span></h4>"""
rail_new = """    <div class="rail-grp">
      <h4>Tab 0 · <span>首次启动</span></h4>
      <button class="ritem" data-go="onb1"><i></i>欢迎与自我介绍</button>
      <button class="ritem" data-go="onb2"><i></i>预设睡觉时间</button>
      <button class="ritem" data-go="onb3"><i></i>位置授权</button>
      <button class="ritem" data-go="onb4"><i></i>晚饭怎么解决</button>
    </div>
    <div class="rail-grp">
      <h4>Tab 1 · <span>主功能</span></h4>"""
assert src.count(rail_anchor) == 1, "rail 锚点不唯一"
src = src.replace(rail_anchor, rail_new, 1)

arrive_item = '      <button class="ritem" data-go="arrive"><i></i>入户感知提示</button>'
assert src.count(arrive_item) == 1, "arrive 条目锚点不唯一"
src = src.replace(arrive_item, arrive_item +
                  '\n      <button class="ritem" data-go="evening"><i></i>睡前日程</button>', 1)

# 3) 屏幕：引导 4 屏插在「1. 下班触发」之前；睡前日程插在「8. 放松 Combo」之前
start_comment = "        <!-- ============ 1. 下班触发 ============ -->"
assert src.count(start_comment) == 1, "start 屏注释锚点不唯一"
src = src.replace(start_comment, SCREENS.rstrip("\n"), 1)

combo_comment = "        <!-- ============ 8. 放松 Combo ============ -->"
assert src.count(combo_comment) == 1, "combo 屏注释锚点不唯一"
src = src.replace(combo_comment, EVENING.rstrip("\n"), 1)

# 4) 入户按钮改指睡前日程
old_btn = '<button class="btn" style="background:#141414" data-go="combo">推开家门'
assert src.count(old_btn) == 1, "入户按钮锚点不唯一"
src = src.replace(old_btn, '<button class="btn" style="background:#141414" data-go="evening">推开家门', 1)

# 5) 路由表
old_flow = ("  var flowOf = {start:'1',dump:'1',dumpai:'1',switch:'1',pod:'1',podplan:'1',"
            "arrive:'1',combo:'2',run:'2',done:'2',dash:'3'};")
new_flow = ("  var flowOf = {onb1:'0',onb2:'0',onb3:'0',onb4:'0',"
            "start:'1',dump:'1',dumpai:'1',switch:'1',pod:'1',podplan:'1',arrive:'1',evening:'1',"
            "combo:'2',run:'2',done:'2',dash:'3'};")
assert src.count(old_flow) == 1, "flowOf 锚点不唯一"
src = src.replace(old_flow, new_flow, 1)

# 6) SPEC 追加
spec_anchor = "      '严禁效率、产出统计与打卡惩罚机制。'\n    ]}\n  };"
assert src.count(spec_anchor) == 1, "SPEC 尾部锚点不唯一"
src = src.replace(spec_anchor,
                  "      '严禁效率、产出统计与打卡惩罚机制。'\n    ]},\n" + SPEC_ADD + "  };", 1)

# 7) go()：引导态全屏 + 进入相关屏时刷新画像
old_go1 = "    document.getElementById('device').classList.toggle('immersive', id === 'run');"
assert src.count(old_go1) == 1, "go 锚点 1 不唯一"
src = src.replace(old_go1, old_go1 +
                  "\n    document.getElementById('device').classList.toggle('guide', (flowOf[id] || '1') === '0');", 1)

old_go2 = "    if(id === 'podplan') restartCountdown();"
assert src.count(old_go2) == 1, "go 锚点 2 不唯一"
src = src.replace(old_go2, old_go2 +
                  "\n    if(id === 'evening') syncEvening();\n    if(id.indexOf('onb') === 0) paintProfile();", 1)

# 8) 交互逻辑 + 默认入口
boot_anchor = "  /* ---------- boot ---------- */"
assert src.count(boot_anchor) == 1, "boot 锚点不唯一"
src = src.replace(boot_anchor, JS_V3, 1)

old_boot = "  go(SPEC[init] ? init : 'start');"
assert src.count(old_boot) == 1, "默认入口锚点不唯一"
src = src.replace(old_boot, "  go(SPEC[init] ? init : 'onb1');\n  paintProfile();", 1)

# 9) 版本信息
TEXT = [
    ("<title>OffWork · 前端交互稿 v2 · 手绘图标</title>",
     "<title>OffWork · 前端交互稿 v3 · 首启引导与睡前日程</title>"),
    ('<span class="brand-tag">前端交互稿 · v2 · 手绘图标</span>',
     '<span class="brand-tag">前端交互稿 · v3 · 首启引导 + 睡前日程</span>'),
    ("主功能沿「下班前 → 通勤中 → 跨入家门」时间线连续推进。",
     "主功能沿「下班前 → 通勤中 → 跨入家门 → 睡前」时间线连续推进："
     "新增首次启动引导（睡觉时间 / 位置授权 / 晚饭方式）与睡前日程。"),
    ("<b>图标素材</b>：24 枚手绘图标由生图模型批量产出（每批 2×2 贴纸带），"
     "按内容投影切分、白底泛洪抠除背景，压成 PNG-8 后 base64 内嵌，总计约 161 KB。",
     "<b>图标素材</b>：36 枚手绘图标由生图模型批量产出（每批 2×2 贴纸带），"
     "按内容投影切分、白底泛洪抠除背景，压成 PNG-8 后 base64 内嵌，总计约 227 KB。"),
]
for old, new in TEXT:
    n = src.count(old)
    assert n == 1, "文案锚点不唯一(%d)：%s" % (n, old[:44])
    src = src.replace(old, new, 1)

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST)
print("尺寸 %.1f KB -> %.1f KB" % (orig_len / 1024, len(src.encode('utf-8')) / 1024))
print("屏幕数", src.count('<section class="scr"'), "/ 剩余 svg", src.count("<svg"))
