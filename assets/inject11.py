# -*- coding: utf-8 -*-
"""v10 -> v11

关机仪式「倾诉」屏加入情绪宣泄的页面反馈：
1. 长按改为点按（倾诉不限时，手指不用一直按着）
2. 倾诉中：环形频谱 + 涟漪 + 核心随音量起伏（音量优先取真实麦克风，取不到走拟真包络）
3. 说出的句子化成一句一句飘出去；点一下可以捏碎，不进保险箱
4. 顶部降温条从粉走到蓝，配四档随进度变化的回应
5. 收束：碎片被吸回中心，再进 AI 归置
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index-v10-anytime.html')
DST = os.path.join(ROOT, 'index-v11-vent.html')

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
OLD_CSS = u"""/* ---------- screen: dump ---------- */
.rec-wrap{display:flex;flex-direction:column;align-items:center;padding-top:6px}
.mic{
  position:relative;width:152px;height:152px;border-radius:50%;
  border:2px solid var(--ink);background:var(--ink);color:var(--cream);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;user-select:none;touch-action:none;
  transition:transform .12s;margin:6px 0 4px;
}
.mic:active{transform:scale(.97)}
.mic.holding{background:var(--pink);color:var(--ink)}
.mic .mic-ic{position:relative;z-index:3}
.mic-ring{
  position:absolute;inset:-11px;border-radius:50%;
  border:2px solid var(--ink);opacity:.18;
}
svg.mic-prog{
  position:absolute;inset:-11px;width:174px;height:174px;
  transform:rotate(-90deg);opacity:0;transition:opacity .2s;z-index:2;
}
svg.mic-prog.on{opacity:1}
svg.mic-prog circle{fill:none;stroke:var(--ink);stroke-width:3;stroke-linecap:round}
.wave{
  display:flex;align-items:center;justify-content:center;gap:3px;
  height:34px;margin:6px 0 4px;
}
.wave i{
  display:block;width:3px;border-radius:2px;background:var(--ink);
  height:5px;transition:height .12s;
}
.rec-hint{font-size:12.5px;font-weight:700;color:var(--ink-2);margin-top:8px}
.rec-count{font-size:11px;color:var(--ink-3);font-weight:700;margin-top:4px;letter-spacing:.02em}
"""

NEW_CSS = u"""/* ---------- screen: dump · 关机仪式 ---------- */
#dmIdle,#dmLive{display:flex;flex-direction:column;flex:1 1 auto;min-height:0}
#dmIdle.dm-off,#dmLive.dm-off{display:none}

.rec-wrap{display:flex;flex-direction:column;align-items:center;padding-top:6px}
.mic{
  position:relative;width:152px;height:152px;border-radius:50%;
  border:2px solid var(--ink);background:var(--ink);color:var(--cream);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;user-select:none;-webkit-user-select:none;
  transition:transform .12s;margin:6px 0 4px;
}
.mic:hover{transform:translateY(-2px)}
.mic:active{transform:scale(.97)}
.mic .mic-ic{position:relative;z-index:3}
.mic-ring{
  position:absolute;inset:-11px;border-radius:50%;
  border:2px solid var(--ink);opacity:.18;
  animation:ringBreath 3.4s ease-in-out infinite;
}
@keyframes ringBreath{
  0%,100%{opacity:.14;transform:scale(1)}
  50%{opacity:.34;transform:scale(1.06)}
}
.rec-hint{font-size:12.5px;font-weight:700;color:var(--ink-2);margin-top:8px}
.rec-count{font-size:11px;color:var(--ink-3);font-weight:700;margin-top:4px;letter-spacing:.02em}

/* 降温条：情绪从热走到冷 */
.heat{margin:14px 0 2px}
.heat-bar{
  height:10px;border-radius:99px;border:1.5px solid var(--ink);
  background:var(--paper);overflow:hidden;
}
.heat-bar i{
  display:block;height:100%;width:0;border-radius:99px;
  background-image:linear-gradient(90deg,#F5B8D9,#F8DF77,#B7CBEB);
  background-repeat:no-repeat;background-size:350px 100%;
  transition:width .45s linear;
}
.heat-tx{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-top:9px}
.heat-tx b{font-size:13.5px;font-weight:800;letter-spacing:-.015em}
.heat-tx span{font-size:11px;font-weight:700;color:var(--ink-3);font-variant-numeric:tabular-nums}

/* 情绪池：环形频谱 + 涟漪 + 核心 */
.pool{position:relative;width:300px;height:300px;margin:0 auto;flex:0 0 auto}
.dust{overflow:hidden;pointer-events:none;z-index:6}
.dust.closing{animation:dustIn .42s cubic-bezier(.5,.05,.85,.35) forwards}
@keyframes dustIn{
  from{opacity:1;transform:none}
  to{opacity:0;transform:scale(.3)}
}
.rips{position:absolute;inset:0;z-index:1}
.rips i{
  position:absolute;left:50%;top:50%;width:300px;height:300px;
  margin:-150px 0 0 -150px;border-radius:50%;
  border:2px solid var(--ink);opacity:0;transform:scale(.4);
}
.rips i.go{animation:ripOut 1.6s cubic-bezier(.2,.6,.4,1) forwards}
@keyframes ripOut{
  from{opacity:.38;transform:scale(.43)}
  to{opacity:0;transform:scale(1)}
}
.bars{position:absolute;inset:0;z-index:2}
.bars i{
  position:absolute;left:50%;bottom:50%;width:3.5px;margin-left:-1.75px;
  height:6px;border-radius:2px;background:var(--ink);opacity:.4;
}
.core{
  position:absolute;left:50%;top:50%;z-index:3;
  width:128px;height:128px;margin:-64px 0 0 -64px;border-radius:50%;
  border:2px solid var(--ink);background:var(--ink);color:var(--cream);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;-webkit-user-select:none;user-select:none;
}
.core:active{opacity:.86}
.pool-hint{
  font-size:11px;font-weight:700;color:var(--ink-3);text-align:center;
  margin:2px 0 0;letter-spacing:.01em;
}

/* 飘出去的那句话：从环形外圈向外飞散 */
.vox{
  position:absolute;pointer-events:auto;cursor:pointer;
  animation:voxUp 3.4s cubic-bezier(.28,.7,.4,1) forwards;
}
.vox-in{
  display:inline-block;padding:9px 14px;border-radius:999px;
  border:1.5px solid var(--ink);background:var(--paper);color:var(--ink);
  font-size:12.5px;font-weight:700;line-height:1;white-space:nowrap;
  box-shadow:2px 2px 0 rgba(20,20,20,.13);
  transform-origin:50% 50%;
}
@keyframes voxUp{
  0%{opacity:0;transform:translate(-50%,-50%) scale(.82) rotate(0deg)}
  14%{opacity:1}
  74%{opacity:.95;transform:translate(calc(-50% + var(--dx) * .66), calc(-50% + var(--dy) * .66)) scale(1) rotate(var(--r1))}
  100%{opacity:0;transform:translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.02) rotate(var(--r2))}
}
.vox.pop{animation-play-state:paused}
.vox.pop .vox-in{animation:pinch .34s cubic-bezier(.3,.9,.4,1) forwards}
@keyframes pinch{
  0%{opacity:1;transform:scale(1) rotate(0deg)}
  55%{opacity:1;transform:scale(1.36) rotate(-5deg)}
  100%{opacity:0;transform:scale(1.52) rotate(-9deg)}
}
.burst{
  position:absolute;left:50%;top:50%;width:16px;height:16px;border-radius:50%;
  border:1.5px solid var(--ink);opacity:0;
  transform:translate(-50%,-50%) scale(.4);
}
.vox.pop .burst{animation:burstOut .38s ease-out forwards}
@keyframes burstOut{
  from{opacity:.85;transform:translate(-50%,-50%) scale(.4)}
  to{opacity:0;transform:translate(-50%,-50%) scale(5.4)}
}
"""

sub(OLD_CSS, NEW_CSS, u'CSS：dump 屏整套替换')

# ================================================================ 2) HTML
cut_between(
    u"""        <!-- ============ 2. 关机仪式 · 倾诉 ============ -->""",
    u"""        <!-- ============ 3. AI 归置 ============ -->""",
    u"""
        <section class="scr" id="scr-dump">
          <div class="kicker">Tab 1 · <b>关机仪式</b></div>

          <!-- 态 A：准备 -->
          <div id="dmIdle">
            <h1 class="h1">把今天，<em>说出来</em>。</h1>
            <p class="lead">没说出口的事会一直占着脑子。<b>点一下麦克风开始，说完就放下。</b></p>

            <div class="spacer"></div>

            <div class="rec-wrap">
              <div class="mic" id="mic" role="button" tabindex="0" aria-label="开始倾诉">
                <span class="mic-ring"></span>
                <span class="ii ii-mic mic-ic ii-inv" style="width:52px;height:52px"></span>
              </div>
              <div class="rec-hint">点一下，开始倾诉</div>
              <div class="rec-count">不评价 · 不统计 · 不打断</div>
            </div>

            <div class="spacer"></div>
          </div>

          <!-- 态 B：倾诉中 -->
          <div id="dmLive" class="dm-off">
            <div class="dust" id="dust" style="position:absolute;inset:0"></div>

            <div class="heat">
              <div class="heat-bar"><i id="heatFill"></i></div>
              <div class="heat-tx">
                <b id="heatLead">慢慢说，先不着急</b>
                <span id="heatTime">0:00</span>
              </div>
            </div>

            <div class="spacer"></div>

            <div class="pool" id="pool">
              <div class="rips" id="rips"></div>
              <div class="bars" id="bars"></div>
              <div class="core" id="core" role="button" tabindex="0" aria-label="说完了，收好">
                <span class="ii ii-mic ii-inv" style="width:40px;height:40px"></span>
              </div>
            </div>

            <p class="pool-hint">点一下飘出来的话，就能扔掉它</p>

            <div class="spacer"></div>
            <button class="btn ghost" id="dmStop">说完了，收好</button>
          </div>
        </section>

""",
    u'HTML：dump 屏两态')

# ================================================================ 3) JS
NEW_JS = u"""  /* ---------- 1. 关机仪式：把情绪说出来 ---------- */
  var dmIdle = $('#dmIdle'), dmLive = $('#dmLive'), dmDust = $('#dust'),
      dmRips = $('#rips'), dmBars = $('#bars'), dmCore = $('#core'),
      dmPool = $('#pool'),
      dmHeat = $('#heatFill'), dmLead = $('#heatLead'), dmTime = $('#heatTime');

  var DM_N = 52, DM_R = 68;
  var DM_LEADS = [
    {at:0,  s:'慢慢说，先不着急'},
    {at:7,  s:'我听着呢'},
    {at:17, s:'听起来今天挺不容易的'},
    {at:29, s:'说出来，就不归你管了'}
  ];
  var DM_SPAN = 38;
  /* 演示用：真实录音时这里换成识别结果逐句切出 */
  var DM_VOX = [
    '其实也不是什么大事',
    '就是有点堵得慌',
    '那会儿我没接住话',
    '再来一次我还是会急',
    '脑子一直停不下来',
    '有件事我忍了一天',
    '算了，说出来好一点',
    '明天的事明天再说'
  ];

  var dmBarEls = [], dmRipEls = [], dmOn = false, dmT0 = 0, dmRAF = null,
      dmVol = 0, dmLastRip = 0, dmLastVox = 0, dmVoxN = 0, dmRipN = 0,
      dmAnalyse = null, dmBuf = null, dmStream = null, dmMicAsked = false,
      dmCx = 0, dmCy = 0;

  (function dmBuild(){
    for(var i=0;i<DM_N;i++){
      var b = document.createElement('i');
      b.style.transform = 'rotate(' + (i/DM_N*360).toFixed(1) + 'deg) translateY(-' + DM_R + 'px)';
      dmBars.appendChild(b);
      dmBarEls.push(b);
    }
    for(var k=0;k<4;k++){
      var r = document.createElement('i');
      dmRips.appendChild(r);
      dmRipEls.push(r);
    }
  })();

  function dmClock(s){
    var m = Math.floor(s/60), ss = Math.floor(s%60);
    return m + ':' + (ss < 10 ? '0' : '') + ss;
  }

  /* 有麦克风权限就用实时音量；没有就走拟真包络（音节起伏 + 句读停顿 + 越说越平复） */
  function dmReal(){
    if(!dmAnalyse || !dmBuf) return -1;
    dmAnalyse.getByteTimeDomainData(dmBuf);
    var s = 0;
    for(var i=0;i<dmBuf.length;i++){ var d = (dmBuf[i]-128)/128; s += d*d; }
    return Math.min(1, Math.sqrt(s/dmBuf.length)*3.4);
  }
  function dmSim(t){
    var att = Math.min(1, t/1.1);
    var near = 0.5 + 0.5*Math.sin(t*2.6 + Math.sin(t*0.7)*1.4);
    var phrase = (Math.sin(t*0.34) + 1)/2;
    var pause = phrase < 0.2 ? 0.06 : 1;
    var settle = 1 - 0.3*Math.min(1, t/40);
    var jitter = (Math.random()*2 - 1)*0.1;
    return Math.max(0.05, Math.min(1, (0.36 + 0.46*near)*att*pause*settle + jitter));
  }
  function dmAskMic(){
    if(dmMicAsked) return;
    dmMicAsked = true;
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    navigator.mediaDevices.getUserMedia({audio:true}).then(function(st){
      var a = ctx();
      if(!a){ st.getTracks().forEach(function(t){ t.stop(); }); return; }
      dmStream = st;
      dmAnalyse = a.createAnalyser();
      dmAnalyse.fftSize = 1024;
      dmBuf = new Uint8Array(1024);
      var src = a.createMediaStreamSource(st);
      var mute = a.createGain();
      mute.gain.value = 0;
      src.connect(dmAnalyse);
      dmAnalyse.connect(mute);
      mute.connect(a.destination);
    }).catch(function(){ dmAnalyse = null; dmBuf = null; });
  }

  /* 情绪池中心在浮层里的坐标：碎片从这里向外飞散，收拢动画也绕这一点缩 */
  function dmOrigin(){
    var pr = dmPool.getBoundingClientRect(), dr = dmDust.getBoundingClientRect();
    dmCx = pr.left - dr.left + pr.width/2;
    dmCy = pr.top - dr.top + pr.height/2;
    dmDust.style.transformOrigin = dmCx.toFixed(1) + 'px ' + dmCy.toFixed(1) + 'px';
    dmHeat.style.backgroundSize = dmHeat.parentNode.clientWidth + 'px 100%';
  }

  function dmRip(){
    var el = dmRipEls[dmRipN % dmRipEls.length];
    dmRipN++;
    el.classList.remove('go');
    void el.offsetWidth;
    el.classList.add('go');
  }
  function dmPop(){
    if(!soundOn) return;
    var a = ctx(); if(!a) return;
    var t = a.currentTime;
    var o = a.createOscillator(); o.type = 'triangle';
    o.frequency.setValueAtTime(680, t);
    o.frequency.exponentialRampToValueAtTime(150, t + 0.16);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + 0.2);
  }
  function dmVox(){
    var el = document.createElement('div');
    var tx = DM_VOX[dmVoxN % DM_VOX.length];
    dmVoxN++;
    el.className = 'vox';
    el.innerHTML = '<span class="vox-in">' + tx + '</span><span class="burst"></span>';
    // 起点放在环形外圈，不压住中心的核心与条；只往上方 90° 扇形飞散
    var ang = (-45 - Math.random()*90) * Math.PI/180;
    var r0 = 96;
    var rad = 72 + Math.random()*40;
    el.style.left = (dmCx + Math.cos(ang)*r0).toFixed(1) + 'px';
    el.style.top = (dmCy + Math.sin(ang)*r0).toFixed(1) + 'px';
    el.style.setProperty('--dx', (Math.cos(ang)*rad).toFixed(0) + 'px');
    el.style.setProperty('--dy', (Math.sin(ang)*rad).toFixed(0) + 'px');
    el.style.setProperty('--r1', ((Math.random()*2 - 1)*5).toFixed(1) + 'deg');
    el.style.setProperty('--r2', ((Math.random()*2 - 1)*9).toFixed(1) + 'deg');
    el.style.animationDuration = (3.1 + Math.random()*1.2).toFixed(2) + 's';
    el.addEventListener('animationend', function(e){
      if(e.target !== el) return;
      if(el.parentNode) el.parentNode.removeChild(el);
    });
    el.addEventListener('pointerdown', function(e){
      e.stopPropagation();
      if(el.classList.contains('pop')) return;
      el.classList.add('pop');
      dmPop();
      setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 400);
    });
    dmDust.appendChild(el);
  }

  function dmFrame(){
    if(!dmOn) return;
    var t = (Date.now() - dmT0)/1000;
    var raw = dmReal();
    if(raw < 0) raw = dmSim(t);
    dmVol = dmVol*0.55 + raw*0.45;

    for(var i=0;i<dmBarEls.length;i++){
      var w = 0.5 + 0.5*Math.sin(t*3.4 + i*0.62);
      dmBarEls[i].style.height = (6 + dmVol*(12 + 36*w)).toFixed(1) + 'px';
      dmBarEls[i].style.opacity = (0.32 + 0.58*Math.min(1, dmVol*(0.6 + w*0.7))).toFixed(2);
    }
    dmCore.style.transform = 'scale(' + (1 + dmVol*0.055).toFixed(3) + ')';

    if(t - dmLastRip > 1.05 - dmVol*0.62){ dmLastRip = t; dmRip(); }
    if(t - dmLastVox > 1.5 - dmVol*0.5){ dmLastVox = t; dmVox(); }

    var p = Math.min(1, t/DM_SPAN);
    dmHeat.style.width = (p*100).toFixed(1) + '%';
    var lead = DM_LEADS[0].s;
    for(var k=0;k<DM_LEADS.length;k++){ if(t >= DM_LEADS[k].at) lead = DM_LEADS[k].s; }
    if(dmLead.textContent !== lead) dmLead.textContent = lead;
    dmTime.textContent = dmClock(t);

    dmRAF = requestAnimationFrame(dmFrame);
  }

  function dmKillAudio(){
    if(dmStream){
      try{ dmStream.getTracks().forEach(function(t){ t.stop(); }); }catch(e){}
      dmStream = null;
    }
    dmAnalyse = null; dmBuf = null;
  }

  function dmReset(){
    dmOn = false;
    if(dmRAF){ cancelAnimationFrame(dmRAF); dmRAF = null; }
    dmKillAudio();
    dmLive.classList.add('dm-off');
    dmIdle.classList.remove('dm-off');
    dmDust.classList.remove('closing');
    dmDust.innerHTML = '';
    dmRipEls.forEach(function(r){ r.classList.remove('go'); });
    dmBarEls.forEach(function(b){ b.style.height = '5px'; b.style.opacity = ''; });
    dmCore.style.transform = '';
    dmHeat.style.width = '0%';
    dmLead.textContent = DM_LEADS[0].s;
    dmTime.textContent = '0:00';
    dmVol = 0; dmRipN = 0; dmVoxN = 0;
  }

  function dmStart(){
    if(dmOn) return;
    dmReset();
    dmOn = true;
    dmT0 = Date.now();
    dmLastRip = -1; dmLastVox = -1.4;
    dmIdle.classList.add('dm-off');
    dmLive.classList.remove('dm-off');
    dmOrigin();
    ctx();
    dmAskMic();
    ding();
    dmRAF = requestAnimationFrame(dmFrame);
  }

  function dmFinish(){
    if(!dmOn) return;
    dmOn = false;
    if(dmRAF){ cancelAnimationFrame(dmRAF); dmRAF = null; }
    var el = (Date.now() - dmT0)/1000;
    dmCore.style.transform = '';
    dmDust.classList.add('closing');
    dmKillAudio();
    if(el < 3) toast('再说两句也可以，不着急');
    var ovl = $('#ovlAnalyzing');
    setTimeout(function(){
      ovl.classList.add('on');
      setTimeout(function(){
        ovl.classList.remove('on');
        dmReset();
        ding();
        go('dumpai');
      }, 1300);
    }, 420);
  }

  $('#mic').addEventListener('click', dmStart);
  dmCore.addEventListener('click', dmFinish);
  $('#dmStop').addEventListener('click', dmFinish);

"""

cut_between(u"  /* ---------- 1. press & hold ---------- */",
            u"  /* ---------- 2. switch drag ---------- */",
            NEW_JS, u'JS：倾诉屏重写')

# ================================================================ 4) go() 进屏复位
sub(
    u"    if(id === 'done') resetScore();",
    u"    if(id === 'dump') dmReset();\n"
    u"    if(id === 'done') resetScore();",
    u'JS：进 dump 屏复位')

# ================================================================ 5) SPEC 说明
sub(
    u"""    dump:{mod:'Tab 1 · 主功能',title:'关机仪式 · 倾诉',pts:[
      '<b>交互</b>：长按语音键，用自然语言倾诉未完成的事、担心的或想抱怨的。',
      '<b>AI 逻辑</b>：LLM 提取关键词，结构化为「明日待办」与「悬而未决事项」。',
      '处理期间不向用户提示任何工作细节；建议 2 分钟内说完，说完直接进入归置页。'
    ]},""",
    u"""    dump:{mod:'Tab 1 · 主功能',title:'关机仪式 · 倾诉',pts:[
      '<b>进入方式</b>：点一下麦克风开始，再点一下结束 —— 倾诉不限时，手指不用一直按着，长按不适合要以分钟计的倾诉。',
      '<b>情绪引导</b>：说话时圆环随音量起伏、涟漪一圈圈荡开、说出的句子化成一句话飘出去。目的是让「说出来」在屏幕上有回响，而不是对着一个静态按钮讲。',
      '<b>捏碎</b>：飘出来的任意一句可以点破。点掉的那句不算进保险箱，也不留记录 —— 有些话说出来就够了，不必被整理。',
      '<b>降温条</b>：顶部横条从粉走到蓝，配四档随进度变化的回应（慢慢说 / 我听着呢 / 听起来今天挺不容易的 / 说出来就不归你管了），45 秒走满，暗示情绪正在往外走。',
      '<b>音量来源</b>：拿到麦克风权限时用实时音量驱动；拿不到则用拟真的说话包络兜底（音节起伏 + 句读停顿 + 越说越平复），原型不因拒绝授权而失效。',
      '<b>AI 逻辑</b>：LLM 从倾诉文本提取关键词，结构化为「明日待办」与「悬而未决事项」，处理期间不向用户展示任何工作细节。',
      '飘出的句子在原型里是固定示意文案，真实录音时由识别结果逐句切出。'
    ]},""",
    u'SPEC：dump 说明')

# ================================================================ 6) 跟着改掉「长按」的说法
sub(
    u"""每屏只讲一件事，依据统一放在右侧规格面板。稿内按钮、长按、拖动、左滑均可操作；语音识别、AI 生成与音效为模拟。""",
    u"""每屏只讲一件事，依据统一放在右侧规格面板。稿内按钮、点按、拖动、左滑均可操作；语音识别、AI 生成与音效为模拟。""",
    u'文案：页眉说明')

sub(
    u"""<span>拖动、长按与结算时的反馈音</span>""",
    u"""<span>拖动、倾诉与结算时的反馈音</span>""",
    u'文案：设置页音效说明')

sub(
    u"""steps:['长按语音键，说满 2 分钟','AI 归置成明日待办','拉下电闸，物理断连']""",
    u"""steps:['点开语音键，把今天说出口','AI 归置成明日待办','拉下电闸，物理断连']""",
    u'文案：这一件的三步做法')

# ================================================================ 7) resetAll
sub(
    u"""    // 屏内选中态回到初始""",
    u"""    // 关机仪式回到准备态
    dmReset();

    // 屏内选中态回到初始""",
    u'JS：resetAll 复位倾诉屏')

io.open(DST, 'w', encoding='utf-8').write(src)

leftover = []
for k in [u'mic-prog', u'micArc', u'ARC', u'holdStart', u'startHold', u'endHold',
          u'waveEl', u'waveBars', u'waveTick', u'waveTimer', u'recHint', u'recCount',
          u'long按', u'长按']:
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
