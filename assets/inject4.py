# -*- coding: utf-8 -*-
"""
index-v3-onboard.html  ->  index-v4-focus.html

v4「每屏一个重点 + 信息架构重整」：
  A. 文案瘦身
     - 删掉说明书式的块：三段路介绍 / 170 分钟依据 / 不会做的事 / 未选提示 / 你的画像 /
       触发机制 / 一句直接用 / AI 处理逻辑 / 断电清单 / 拉到底之后预览 / 交互与音效 /
       排程依据 / 三秒规则 / 已封存统计行
     - 每屏最多一句引入语；依据统一放进右侧规格面板
     - 版式改为「内容贴顶、操作贴底」的纵向弹性布局
  B. 结构重整
     - 删「物理断连」屏：拖到底断连的滑块搬进「AI 归置 · 保险箱」页
     - 删「入户感知提示」屏
     - Tab 1 末屏「通勤预定」改为逐件规划：结合预计到家时间与睡觉时间，一件一件排今晚
     - Tab 2 由「直达放松」改为「今晚」：承接主功能，放当晚日程与逐项执行
     - 新增 Tab 4「设置」：我的画像（睡觉 / 位置 / 晚饭）+ 提醒与数据
  C. 素材
     - 新增 4 枚手绘图标 gear / bell / lock / tag（同一生图-抠底-内嵌管线）
"""
import base64, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))   # offwork/
SRC = os.path.join(ROOT, "index-v3-onboard.html")
DST = os.path.join(ROOT, "index-v4-focus.html")
ICON_DIR = os.path.join(ROOT, "assets", "icons")
NEW_ICONS = ["gear", "bell", "lock", "tag"]


def data_uri(name):
    with open(os.path.join(ICON_DIR, name + ".png"), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()


src = open(SRC, encoding="utf-8").read()
orig_len = len(src)


def cut(a_mark, b_mark):
    """删掉 a_mark .. b_mark 之间的整段（含 a，不含 b）。"""
    global src
    a, b = src.index(a_mark), src.index(b_mark)
    assert a < b, "区间异常：%s" % a_mark[:24]
    src = src[:a] + src[b:]


def cut_section(sid, nxt_mark):
    """删掉某个 scr-* 所在的整屏。"""
    global src
    a = src.index('<section class="scr" id="scr-%s"' % sid)
    b = src.index(nxt_mark, a)
    src = src[:a] + src[b:]


def sub(old, new, tag=""):
    global src
    n = src.count(old)
    assert n == 1, "锚点不唯一(%d) %s：%s" % (n, tag, old.strip()[:56])
    src = src.replace(old, new, 1)


# ================================================================ B0) 删屏
cut("        <!-- ============ 4. 物理断连 ============ -->",
    "        <!-- ============ 5. 通勤过渡舱 ============ -->")
cut("        <!-- ============ 7. 入户感知 ============ -->",
    "        <!-- ============ 8-A. 睡前日程 ============ -->")

# ================================================================ 1) CSS
II_CSS = "\n".join('.ii-%s{background-image:url("%s")}' % (n, data_uri(n)) for n in NEW_ICONS)

CSS_NEW = """/* ---------- v4：每屏一个重点 —— 内容贴顶、操作贴底 ---------- */
.spacer{flex:1 1 14px;min-height:14px}
.scr.on{display:flex;flex-direction:column}
.scr.on>*{flex-shrink:0}
.card + .ach{margin-top:12px}

/* ---------- v4：新增手绘图标 ---------- */
""" + II_CSS + """

/* ---------- v4：通勤预定 · 逐件规划 ---------- */
.pp-bar{
  display:flex;align-items:center;border:2px solid var(--ink);border-radius:18px;
  background:var(--paper);padding:11px 6px;margin-bottom:10px;
}
.pp-bar span{flex:1;text-align:center;font-size:9.5px;font-weight:700;color:var(--ink-3);line-height:1.5}
.pp-bar span:first-child{text-align:left;padding-left:8px}
.pp-bar span:last-child{text-align:right;padding-right:8px}
.pp-bar span + span{border-left:1.5px dashed var(--hair)}
.pp-bar b{display:block;font-size:14px;font-weight:800;color:var(--ink);letter-spacing:-.02em;font-variant-numeric:tabular-nums}

.pp-dots{display:flex;gap:5px;margin-bottom:11px}
.pp-dots i{flex:1;height:5px;border-radius:3px;background:rgba(20,20,20,.13)}
.pp-dots i.on{background:rgba(20,20,20,.34)}
.pp-dots i.ok{background:var(--ink)}

.pp-n{font-size:9.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase;color:var(--ink-3);margin-bottom:5px}
.pp-q{font-size:17px;font-weight:800;letter-spacing:-.02em;margin:0 0 10px}
.pp-opt{
  display:flex;align-items:center;gap:10px;width:100%;text-align:left;
  padding:11px 12px;border-radius:16px;border:2px solid var(--ink);background:var(--paper);
  font-family:var(--font);cursor:pointer;margin-bottom:8px;
  transition:transform .12s,box-shadow .12s;
}
.pp-opt:hover{transform:translateX(2px)}
.pp-opt.rec{box-shadow:4px 4px 0 var(--ink)}
.pp-ic{
  width:30px;height:30px;border-radius:10px;border:1.5px solid var(--ink);
  display:flex;align-items:center;justify-content:center;flex-shrink:0;
}
.pp-tx{flex:1;min-width:0}
.pp-tx b{display:block;font-size:12.5px;font-weight:800;letter-spacing:-.01em}
.pp-tx span{display:block;font-size:10px;color:var(--ink-3);font-weight:600;margin-top:2px}
.pp-opt em{font-style:normal;font-size:11px;font-weight:800;color:var(--ink-3);flex-shrink:0}

.pp-list{border:2px solid var(--ink);border-radius:18px;background:var(--paper);padding:9px 13px;margin-top:2px}
.pp-li{display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:1.5px dashed var(--hair)}
.pp-li:last-child{border-bottom:0;padding-bottom:1px}
.pp-li b{width:38px;flex-shrink:0;font-size:10.5px;font-weight:800;font-variant-numeric:tabular-nums}
.pp-li span{flex:1;min-width:0;font-size:11.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pp-li em{font-style:normal;font-size:10px;font-weight:800;color:var(--ink-3);flex-shrink:0}
.pp-li.free span{color:var(--ink-3)}

/* ---------- v4：设置页 ---------- */
.set{display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1.5px dashed var(--hair)}
.set:last-child{border-bottom:0;padding-bottom:0}
.set-l{flex:1;min-width:0}
.set-l b{display:block;font-size:13px;font-weight:800;letter-spacing:-.01em}
.set-l span{display:block;font-size:10.5px;font-weight:600;color:var(--ink-3);margin-top:3px;line-height:1.5}
.set-step{display:flex;align-items:center;gap:9px;flex-shrink:0}
.set-step .round-btn{width:34px;height:34px;font-size:15px}
.set-val{
  min-width:62px;text-align:center;font-size:21px;font-weight:800;
  letter-spacing:-.03em;font-variant-numeric:tabular-nums;
}
.tgl{
  width:52px;height:30px;border-radius:999px;border:2px solid var(--ink);
  background:var(--paper);position:relative;cursor:pointer;flex-shrink:0;
  transition:background .16s;
}
.tgl i{
  position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;
  background:var(--ink);transition:transform .16s,background .16s;
}
.tgl.on{background:var(--ink)}
.tgl.on i{background:var(--cream);transform:translateX(22px)}
.mini-btn{
  height:34px;padding:0 14px;border-radius:999px;border:2px solid var(--ink);
  background:transparent;color:var(--ink);font-family:var(--font);
  font-size:12px;font-weight:700;cursor:pointer;flex-shrink:0;
}
.mini-btn:hover{background:var(--yellow)}"""

sub(".spacer{height:14px}", CSS_NEW, "spacer")

# 断连开关放大成页面主角；波浪分隔线铺满宽度
sub("  position:relative;height:74px;border-radius:999px;\n  border:2px solid var(--ink);background:var(--paper);overflow:hidden;",
    "  position:relative;height:96px;border-radius:999px;\n  border:2px solid var(--ink);background:var(--paper);overflow:hidden;", "sw-track")
sub("  position:absolute;top:6px;left:6px;width:58px;height:58px;border-radius:50%;",
    "  position:absolute;top:6px;left:6px;width:84px;height:84px;border-radius:50%;", "sw-knob")
sub(".ii-squiggle{background-image:url(", ".ii-squiggle{background-size:100% 100%;background-image:url(", "squiggle")

# 主功能起点屏：断连滑块移入归置页后，屏幕数减少 → rail / tabbar 重排
# ================================================================ 2) 屏幕文案
REPL = []

# ---- onb1 欢迎 ----
REPL.append((
"""          <h1 class="h1">下班之后，<br>这段时间<span class="hl">归你</span>。</h1>
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
          <button class="btn ghost sm" style="margin-top:8px" data-go="start">跳过设置，直接进入</button>""",
"""          <div class="spacer"></div>

          <h1 class="h1" style="font-size:33px">下班之后，<br>这段时间<span class="hl">归你</span>。</h1>
          <p class="lead">不管效率，只帮你把工作关掉。</p>

          <div class="spacer"></div>
          <button class="btn" data-go="onb2">开始设置
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
          <button class="btn ghost sm" style="margin-top:8px" data-go="start">跳过，直接进入</button>"""))

# ---- onb2 睡觉时间 ----
REPL.append((
"""          <p class="lead">睡前日程是倒推出来的：先定终点，再往回填。这个时间之后，App 不再安排任何事。</p>

          <div class="time-pick">
            <button class="round-btn" id="bedMinus" aria-label="提前 15 分钟">−</button>
            <div class="time-val" id="bedTime">23:30<small>周三 · 工作日</small></div>""",
"""          <p class="lead">睡前日程从这一刻往回倒排。</p>

          <div class="time-pick">
            <button class="round-btn" id="bedMinus" aria-label="提前 15 分钟">−</button>
            <div class="time-val" id="bedTime">23:30<small>睡前可用 5 小时 0 分</small></div>"""))

REPL.append((
"""          <div class="card" style="margin-top:14px">
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

          <div class="spacer"></div>""",
"""          <div class="spacer"></div>"""))

# ---- onb3 位置 ----
REPL.append(("""          <p class="lead">只在两个时刻读，其余时间不读。</p>""",
             """          <p class="lead">只在两个时刻读。</p>"""))
REPL.append(("""            <div class="card-t">会用到的两件事<span>只在用时读</span></div>""",
             """            <div class="card-t">会用到的两件事</div>"""))
REPL.append(("""                <span class="mini-tx"><b>下班触发</b><span>判断你是否已经离开办公楼，作为定时触发之外的第二条件。</span></span>""",
             """                <span class="mini-tx"><b>下班触发</b><span>是否已离开办公楼</span></span>"""))
REPL.append(("""                <span class="mini-tx"><b>散步路线</b><span>在你家附近找一条 20 分钟能走完的环线，填进睡前日程。</span></span>""",
             """                <span class="mini-tx"><b>散步路线</b><span>家附近 20 分钟的环线</span></span>"""))
REPL.append((
"""          <div class="card">
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
          </button>""",
"""          <div class="spacer"></div>
          <div class="btn-row">
            <button class="btn" id="geoAllow">允许</button>
            <button class="btn ghost" id="geoDeny">暂不开启</button>
          </div>"""))

# ---- onb4 晚饭 ----
REPL.append(("""          <p class="lead">这一格决定日程里 19:30 那半小时怎么排。</p>

          <div id="cookOpts">""", """          <div class="spacer"></div>

          <div id="cookOpts">"""))
REPL.append(("""              <span class="opt-tx"><b>能做正经饭</b><span>有灶有锅，愿意花 30 分钟</span></span>""",
             """              <span class="opt-tx"><b>能做正经饭</b><span>有灶有锅，30 分钟</span></span>"""))
REPL.append(("""              <span class="opt-tx"><b>只能热一下</b><span>微波炉或速冻，10 分钟解决</span></span>""",
             """              <span class="opt-tx"><b>只能热一下</b><span>微波炉或速冻，10 分钟</span></span>"""))
REPL.append(("""              <span class="opt-tx"><b>基本靠外卖</b><span>到家前点好，进门就能吃</span></span>""",
             """              <span class="opt-tx"><b>基本靠外卖</b><span>到家前点好，进门就吃</span></span>"""))
REPL.append((
"""          <div class="card">
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
          <p class="note">三项都能在「设置 · 我的画像」里改，改完睡前日程会立刻重排。</p>""",
"""          <div class="spacer"></div>
          <button class="btn" data-go="start">完成设置，开始今晚
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>"""))

# ---- start 下班触发 ----
REPL.append((
"""          <h1 class="h1" style="margin-top:4px">今天到此为止，<br>剩下的<span class="hl">交给明天</span>。</h1>
          <p class="lead">周三 10 月 14 日 · 18:30。你还没离开工位，大脑已经开始排队明天的待办。先花两分钟把它们放下。</p>

          <div class="card">""",
"""          <h1 class="h1" style="margin-top:4px">今天到此为止，<br>剩下的<span class="hl">交给明天</span>。</h1>

          <div class="card">"""))
REPL.append((
"""          <p class="note"><b>触发机制说明：</b>两个条件任一命中原型即可启动。原型内为手动推进，实际由系统定时器与地理围栏接管。</p>
""", "\n"))

# ---- dump 关机仪式 ----
REPL.append((
"""          <h1 class="h1">把今天，<em>说出来</em>。</h1>
          <p class="lead">不用组织语言。没做完的事、明天怕的事、想吐槽的人和话，<b>一股脑倒出来</b>就行。AI 只负责整理，不做评价。</p>

          <div class="rec-wrap">""",
"""          <h1 class="h1">把今天，<em>说出来</em>。</h1>

          <div class="spacer"></div>

          <div class="rec-wrap">"""))
REPL.append((
"""          </div>

          <div class="card" style="margin-top:20px">
            <div class="card-t">不知道从哪说起？<span>点一句直接用</span></div>
            <div class="chip-row">
              <span class="chip k">今天最烦的是那封邮件</span>
              <span class="chip p">明天的评审我还没准备好</span>
              <span class="chip b">会开了一整天，什么也没推进</span>
            </div>
          </div>

          <div class="note" style="margin-top:12px">
            <b>AI 处理逻辑：</b>语音转文字后由 LLM 提取关键词，自动结构化为「明日待办」与「悬而未决事项」，封存至明日保险箱。封存期间不向用户展示任何工作细节。
          </div>
        </section>""",
"""          </div>

          <div class="spacer"></div>
        </section>"""))

# ---- dumpai 归置：删统计行；按钮换成断连滑块 ----
REPL.append(("""          <h1 class="h1">都收好了，<br>明天<span class="hl">九点</span>再拿出来。</h1>
          <p class="lead">你刚才说了 4 分 12 秒。AI 从里面挑出 3 件待办和 1 件你已经做成的事。</p>""",
             """          <h1 class="h1">都收好了，<br>明天<span class="hl">九点</span>再拿出来。</h1>"""))
REPL.append((
"""            <div class="vault-list">
              <div class="vi"><i></i>给王姐回那封关于排期的邮件</div>
              <div class="vi"><i></i>改完 Q3 复盘的第一版框架</div>
              <div class="vi"><i></i>确认周五评审的会议室</div>
            </div>
            <p class="note" style="margin-top:12px;background:rgba(255,255,255,.5)">已封存 <b>3</b> 项 · 悬而未决 <b>1</b> 项（等对方回复，无需你行动）</p>""",
"""            <div class="vault-list">
              <div class="vi"><i></i>给王姐回那封关于排期的邮件</div>
              <div class="vi"><i></i>改完 Q3 复盘的第一版框架</div>
              <div class="vi"><i></i>确认周五评审的会议室</div>
            </div>"""))
REPL.append((
"""          <div class="spacer"></div>

          <div class="ach">
            <span class="ii ii-star deco" style="right:-12px;bottom:-18px;width:94px;height:94px;transform:rotate(-12deg)"></span>
            <div class="ach-t">今日微成就</div>
            <div class="ach-x">你把会议的流程框架重新排了一遍</div>
            <div class="ach-s">AI 从你的倾诉里听见了这件事。它不算 KPI，但你今天确实做成了一件具体的事。</div>
          </div>

          <div class="spacer"></div>
          <button class="btn" data-go="switch">下一步：物理断连
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>""",
"""          <div class="ach">
            <span class="ii ii-star deco" style="right:-8px;bottom:-12px;width:72px;height:72px;transform:rotate(-12deg)"></span>
            <div class="ach-t">今日微成就</div>
            <div class="ach-x">你把会议的框架重新排了一遍</div>
          </div>

          <div class="spacer"></div>
          <div class="switch-track" id="swTrack">
            <div class="switch-fill" id="swFill"></div>
            <div class="switch-label">按住圆点，向右拉</div>
            <div class="switch-knob" id="swKnob">
              <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
            </div>
          </div>"""))

# ---- pod 通勤舱 ----
REPL.append(("""          <p class="lead">AI 从刚才那段语音里判断：<b>高压 + 轻度低落</b>。所以不给你播客，只给纯音效。</p>""",
             """          <p class="lead">不给你播客，只给纯音效。</p>"""))
REPL.append(("""              <b>跟着圆点呼吸</b>
              <span>4 秒吸气 · 7 秒屏住 · 8 秒呼出，重复 4 轮，大约到站。</span>""",
             """              <b>跟着圆点呼吸</b>
              <span>4-7-8 · 4 轮 ≈ 到站</span>"""))

# ---- evening 睡前日程 ----
REPL.append(("""          <p class="lead">按你的睡觉时间与到家时间倒推。虚线那段是故意留白的：不安排，也不提醒。</p>""",
             """          <p class="lead">虚线那段是故意留白的。</p>"""))
REPL.append((
"""          <p class="note"><b>排程依据：</b>睡觉 <span id="evSrcBed">23:30</span> · 下班 18:30 · <span id="evSrcGeo">位置未选</span> · <span id="evSrcCook">能做正经饭</span>。固定块共 170 分钟不动，留白与上床缓冲按 9 : 4 分。</p>

          <div class="spacer"></div>""",
"""          <div class="spacer"></div>"""))

# ---- combo：删交互说明 ----
REPL.append(("""
          <p class="note"><b>交互：</b>左右滑动切换备选（最多 3 张），点右下角刷新可换一批。开始后 App 不拦截任何应用，只做计时与陪伴。</p>""",
             """ """.rstrip("\n")))

# ---- done 完成 ----
REPL.append(("""          <p class="lead">你选了「泡脚 + 自由刷短视频」，完成了 20 分钟。<b>不需要为刷手机道歉。</b></p>""",
             """          <p class="lead">不需要为刷手机道歉。</p>"""))
REPL.append((
"""          <div class="spacer"></div>
          <div class="card">
            <div class="card-t">本次记录<span>已计入</span></div>
            <div class="chip-row">
              <span class="chip s">心理脱钩 +20 分钟</span>
              <span class="chip b">下肢回流 1 次</span>
              <span class="chip k">自由刷手机 20 分钟</span>
            </div>
          </div>

          <p class="note"><b>明早 9 点</b>，保险箱会自己打开，把这 3 件事还给你。今晚不用再想它们。</p>

          <span class="ii ii-squiggle" style="width:100%;height:24px;opacity:.55;margin:2px 0"></span>""",
"""          <div class="spacer"></div>
          <span class="ii ii-squiggle" style="width:100%;height:24px;opacity:.55;margin:0 0 14px"></span>"""))

# ---- dash 仪表盘 ----
REPL.append(("""          <p class="lead">只记录恢复，不统计产出。这里没有连胜、没有排名、没有惩罚。</p>""",
             """          <p class="lead">只记录恢复，不统计产出。</p>"""))
REPL.append((
"""            <p class="ins-tx">每周三你采用「<mark>泡脚 + 刷短视频</mark>」时，当晚心理脱钩效果最好，次日晨间自评也最高。<br>这个组合，周三可以固定下来。</p>
            <div class="ins-meta"><span>样本：本周 7 天 · Combo 记录 6 次</span><span>晨间自评 3 次</span></div>""",
"""            <p class="ins-tx">每周三你采用「<mark>泡脚 + 刷短视频</mark>」时，当晚心理脱钩效果最好。</p>"""))
REPL.append(("""
          <div class="rule-bar">
            <i></i>
            <span>本页不统计效率与产出，中断不扣分，也不会有提醒。</span>
          </div>
        </section>""", """
        </section>"""))

# ---- 页眉说明 ----
REPL.append((
"""    <p class="head-sub">下班过渡与精力恢复助手。依据《下班场景-OffWork产品方案》第 4 章信息架构生成：三个 Tab、四个模块，主功能沿「下班前 → 通勤中 → 跨入家门 → 睡前」时间线连续推进：新增首次启动引导（睡觉时间 / 位置授权 / 晚饭方式）与睡前日程。稿内按钮、长按、拖动、左滑均可操作；语音识别、AI 生成与音效为模拟。全站图标为手绘素材：由生图模型产出、抠底去背后以 PNG-8 内嵌，深浅底色下自动反相。</p>""",
"""    <p class="head-sub">下班过渡与精力恢复助手。依据《下班场景-OffWork产品方案》重整为四个 Tab：主功能沿「下班前 → 通勤中 → 跨门入户」推进，通勤末段逐件排好今晚；「今晚」承接主功能，放当晚日程与逐项执行。每屏只讲一件事，依据统一放在右侧规格面板。稿内按钮、长按、拖动、左滑均可操作；语音识别、AI 生成与音效为模拟。</p>"""))

for old, new in REPL:
    sub(old, new, "屏幕文案")

# ================================================================ 3) 通勤预定整屏重建
a = src.index("        <!-- ============ 6. 通勤预定 ============ -->")
b = src.index("        <!-- ============ 8-A. 睡前日程 ============ -->", a)
PLAN_SCREEN = """        <!-- ============ 6. 通勤预定 · 逐件排今晚 ============ -->
        <section class="scr" id="scr-podplan">
          <div class="kicker">模块二 · <b>通勤预定</b></div>
          <h1 class="h1" style="font-size:23px">到家前，把今晚排出来。</h1>

          <div class="pp-bar">
            <span><b id="ppEta">19:04</b>预计到家</span>
            <span><b id="ppBed">23:30</b>睡觉时间</span>
            <span><b id="ppAvail">4 小时 26 分</b>今晚可用</span>
          </div>

          <div class="pp-dots" id="ppDots"></div>

          <div id="ppAsk">
            <div class="pp-n">第 1 / 3 件</div>
            <h2 class="pp-q">晚饭怎么办？</h2>
            <div id="ppOpts"></div>
          </div>

          <div class="pp-list" id="ppList"></div>

          <div class="spacer"></div>
          <button class="btn" id="ppGo" data-go="evening">回家，按这个来
            <span class="ii ii-arrow ii-inv" style="width:17px;height:17px"></span>
          </button>
        </section>

"""
src = src[:a] + PLAN_SCREEN + src[b:]

# ================================================================ 4) 新增设置屏（插在 dash 之后、viewport 之内）
MARK = "      </div>\n\n      <nav class=\"tabbar\">"
assert src.count(MARK) == 1, "viewport 结束锚点不唯一"

SETTINGS = """
        <!-- ============ 12. 设置 ============ -->
        <section class="scr" id="scr-settings">
          <div class="kicker">Tab 4 · <b>设置</b></div>
          <h1 class="h1">我的画像</h1>
          <p class="lead">改完立刻重排今晚。</p>

          <div class="card">
            <div class="card-t">我的画像</div>
            <div class="set">
              <span class="set-l"><b>睡觉时间</b><span id="setBedNote">睡前可用 5 小时 0 分</span></span>
              <span class="set-step">
                <button class="round-btn" id="setBedMinus" aria-label="提前 15 分钟">−</button>
                <span class="set-val" id="setBedVal">23:30</span>
                <button class="round-btn" id="setBedPlus" aria-label="推迟 15 分钟">+</button>
              </span>
            </div>
            <div class="set">
              <span class="set-l"><b>位置权限</b><span>只用于下班触发与散步路线</span></span>
              <span class="set-step">
                <span class="chip b" id="setGeoVal">未授权</span>
                <button class="mini-btn" id="setGeoToggle">允许</button>
              </span>
            </div>
            <div class="set">
              <span class="set-l"><b>晚饭方式</b><span>决定通勤时默认推荐哪一档</span></span>
            </div>
            <div class="chip-row" id="setCook" style="margin-top:11px">
              <span class="chip" data-cook="A">能做正经饭</span>
              <span class="chip" data-cook="B">只能热一下</span>
              <span class="chip" data-cook="C">基本靠外卖</span>
            </div>
          </div>

          <div class="card">
            <div class="card-t">提醒与数据</div>
            <div class="set">
              <span class="set-l"><b>音效</b><span>拖动、长按与结算时的反馈音</span></span>
              <span class="tgl on" id="setSound" role="switch" aria-checked="true"><i></i></span>
            </div>
            <div class="set">
              <span class="set-l"><b>位置轨迹</b><span>始终不留存，退出即清空</span></span>
              <span class="chip p">不留存</span>
            </div>
            <div class="set">
              <span class="set-l"><b>工作通知</b><span>打烊后静音到次日 09:00</span></span>
              <span class="chip k">已静音</span>
            </div>
          </div>
        </section>
"""
src = src.replace(MARK, SETTINGS + MARK, 1)

# ================================================================ 5) rail 与 tabbar 重建
a = src.index('  <aside class="rail">')
b = src.index('  </aside>', a) + len('  </aside>')
RAIL = """  <aside class="rail">
    <div class="rail-grp">
      <h4>Tab 0 · <span>首次启动</span></h4>
      <button class="ritem" data-go="onb1"><i></i>欢迎与自我介绍</button>
      <button class="ritem" data-go="onb2"><i></i>预设睡觉时间</button>
      <button class="ritem" data-go="onb3"><i></i>位置授权</button>
      <button class="ritem" data-go="onb4"><i></i>晚饭怎么解决</button>
    </div>
    <div class="rail-grp">
      <h4>Tab 1 · <span>主功能</span></h4>
      <button class="ritem" data-go="start"><i></i>下班触发</button>
      <button class="ritem" data-go="dump"><i></i>关机仪式 · 倾诉</button>
      <button class="ritem" data-go="dumpai"><i></i>AI 归置 · 保险箱与断连</button>
      <button class="ritem" data-go="pod"><i></i>通勤过渡舱</button>
      <button class="ritem" data-go="podplan"><i></i>通勤预定 · 逐件排今晚</button>
    </div>
    <div class="rail-grp">
      <h4>Tab 2 · <span>今晚</span></h4>
      <button class="ritem" data-go="evening"><i></i>今晚日程</button>
      <button class="ritem" data-go="combo"><i></i>这一件</button>
      <button class="ritem" data-go="run"><i></i>进行中</button>
      <button class="ritem" data-go="done"><i></i>完成反馈</button>
    </div>
    <div class="rail-grp">
      <h4>Tab 3 · <span>恢复仪表盘</span></h4>
      <button class="ritem" data-go="dash"><i></i>状态恢复仪表盘</button>
    </div>
    <div class="rail-grp">
      <h4>Tab 4 · <span>设置</span></h4>
      <button class="ritem" data-go="settings"><i></i>我的画像</button>
    </div>
  </aside>"""
src = src[:a] + RAIL + src[b:]

a = src.index('      <nav class="tabbar">')
b = src.index('      </nav>', a) + len('      </nav>')
TABBAR = """      <nav class="tabbar">
        <button class="tab on" data-tab="1" data-go="start">
          <span class="ti-wrap">
            <span class="ii ii-home" style="width:23px;height:23px"></span>
          </span>主功能
        </button>
        <button class="tab" data-tab="2" data-go="evening">
          <span class="ti-wrap">
            <span class="ti-dot"></span>
            <span class="ii ii-calendar" style="width:23px;height:23px"></span>
          </span>今晚
        </button>
        <button class="tab" data-tab="3" data-go="dash">
          <span class="ti-wrap">
            <span class="ii ii-chart" style="width:23px;height:23px"></span>
          </span>仪表盘
        </button>
        <button class="tab" data-tab="4" data-go="settings">
          <span class="ti-wrap">
            <span class="ii ii-gear" style="width:23px;height:23px"></span>
          </span>设置
        </button>
      </nav>"""
src = src[:a] + TABBAR + src[b:]

# ================================================================ 6) 规格面板
for key, nxt in [("switch", "pod"), ("arrive", "combo")]:
    aa = src.index("    %s:{mod:" % key)
    bb = src.index("    %s:{mod:" % nxt)
    assert aa < bb, "%s 规格区间异常" % key
    src = src[:aa] + src[bb:]

SPEC_REPL = [
    ("""      '<b>场景触发</b>：GPS 感知离开办公楼／打卡区域。',
      '两个条件任一命中即可启动，本页为流程入口。'""",
     """      '<b>场景触发</b>：GPS 感知离开办公楼／打卡区域。',
      '两个条件任一命中即可启动；原型内为手动推进，实际由系统定时器与地理围栏接管。'"""),

    ("""      '处理期间不向用户提示任何工作细节。'""",
     """      '处理期间不向用户提示任何工作细节；建议 2 分钟内说完，说完直接进入归置页。'"""),

    ("""      '<b>微成就打卡</b>：AI 从倾诉文本中挖掘 1 件今日已完成的微小正面事件。',
      '输出确认感，不做绩效评价。'""",
     """      '<b>微成就打卡</b>：AI 从倾诉文本中挖掘 1 件今日已完成的微小正面事件，输出确认感，不做绩效评价。',
      '本次倾诉 4 分 12 秒，归置出待办 3 项、悬而未决 1 项。',
      '<b>物理断连</b>：归置完成后在本页拉下电闸——滑块拖到底即触发断电音与打烊态，工作模式到此结束，不再单设一屏。'"""),

    ("""    podplan:{mod:'Tab 1 · 模块二',title:'通勤预定',pts:[
      '<b>触发</b>：GPS 感知距家 15–20 分钟行程时弹出。',
      '<b>交互</b>：3 秒极简三选一卡片，预定到家后的放松 Combo。',
      '把决策提前到通勤段，避免到家后陷入决策瘫痪。'
    ]},""",
     """    podplan:{mod:'Tab 1 · 模块二',title:'通勤预定 · 逐件排今晚',pts:[
      '<b>触发</b>：GPS 感知距家 15–20 分钟行程时弹出。',
      '<b>输入</b>：预计到家 19:04 与睡觉时间 23:30，先算出今晚可用 4 小时 26 分。',
      '<b>交互</b>：晚饭 / 散步 / 放松三件依次问一遍，选完一件自动进入下一件，底部实时排出到点时间与之后的留白。',
      '选择直接写进 Tab 2 的今晚日程：时长为 0 的块整格不排，晚饭那一档的默认项取自「我的画像」。',
      '把决策提前到通勤段，避免到家后陷入决策瘫痪。'
    ]},"""),

    ("""      '任一格改动，后续时间块整体顺延。'""",
     """      '固定块共 170 分钟（仪式 10 + 通勤 50 + 晚饭 40 + 散步 30 + Combo 20 + 洗漱 20）不动，弹性块按 9 : 4 分给自由留白与上床缓冲，睡前 30 分钟不再推荐活动。',
      '任一格改动，后续时间块整体顺延；通勤预定的选择会覆盖晚饭 / 散步 / 放松三格的时长与文案。'"""),

    ("""    evening:{mod:'Tab 1 · 模块二',title:'睡前日程',pts:[""",
     """    evening:{mod:'Tab 2 · 今晚',title:'今晚日程',pts:["""),

    ("""      '该时间只影响排程，不承担闹钟职责。'""",
     """      '该时间只影响排程，不承担闹钟职责；可设范围 22:00 – 01:30，步进 15 分钟。'"""),

    ("""      '<b>边界</b>：不记录轨迹历史、不用于广告、不加二次索取。'""",
     """      '<b>边界</b>：不记录轨迹历史（退出后不留位置日志）、不用于广告与推荐位、可随时在系统设置关闭且不做二次索取。'"""),

    ("""      '选定后生成「我的画像」，供后续所有推荐复用。'""",
     """      '选定后写入「我的画像」（睡觉 / 位置 / 晚饭），供后续推荐复用；可在 Tab 4 设置里随时修改，改完今晚日程立刻重排。'"""),

    ("""      '文案基调为「不需要为刷手机道歉」。'""",
     """      '文案基调为「不需要为刷手机道歉」；本次记录心理脱钩 +20 分钟、下肢回流 1 次、自由刷手机 20 分钟。',
      '明早 09:00 保险箱自动打开，把封存的待办还给用户。'"""),

    ("""      '严禁效率、产出统计与打卡惩罚机制。'""",
     """      '归因样本：本周 7 天 · Combo 记录 6 次 · 晨间自评 3 次；中断不扣分，界面不出现提醒。',
      '严禁效率、产出统计与打卡惩罚机制。'"""),

    ("""      '<b>作用</b>：用三段路（关机仪式 / 通勤过渡舱 / 恢复仪表盘）说明产品边界，避免被当成待办或打卡工具。',
      '底部提供跳过入口，设置流程不强制。'""",
     """      '<b>作用</b>：只讲「这段时间归你」这一句承诺，用三段路（关机仪式 / 通勤过渡舱 / 恢复仪表盘）说明产品边界，避免被当成待办或打卡工具。',
      '底部提供跳过入口，设置流程不强制。'"""),
]
for old, new in SPEC_REPL:
    sub(old, new, "规格面板")

# 新增 settings 规格（挂在 SPEC 末尾的 evening 条目之后）
sub("""      '任一格改动，后续时间块整体顺延；通勤预定的选择会覆盖晚饭 / 散步 / 放松三格的时长与文案。'
    ]}
  };""",
    """      '任一格改动，后续时间块整体顺延；通勤预定的选择会覆盖晚饭 / 散步 / 放松三格的时长与文案。'
    ]},
    settings:{mod:'Tab 4 · 设置',title:'我的画像',pts:[
      '<b>位置</b>：首启引导里的三项在这里汇总，改完立刻重排今晚日程。',
      '<b>睡觉时间</b>：步进 15 分钟，可设范围 22:00 – 01:30，只影响排程，不承担闹钟职责。',
      '<b>位置权限</b>：可随时开关；关闭后下班触发只保留时间条件，散步格改为自己挑路线。',
      '<b>晚饭方式</b>：决定通勤时晚饭那一件的默认选项。',
      '<b>提醒与数据</b>：音效开关与页眉同步；位置轨迹始终不留存；工作通知打烊后静音到次日 09:00。'
    ]}
  };""", "settings 规格")

# ================================================================ 7) JS
JS_REPL = [
    # 路由表
    ("  var flowOf = {onb1:'0',onb2:'0',onb3:'0',onb4:'0',"
     "start:'1',dump:'1',dumpai:'1',switch:'1',pod:'1',podplan:'1',arrive:'1',evening:'1',"
     "combo:'2',run:'2',done:'2',dash:'3'};",
     "  var flowOf = {onb1:'0',onb2:'0',onb3:'0',onb4:'0',"
     "start:'1',dump:'1',dumpai:'1',pod:'1',podplan:'1',"
     "evening:'2',combo:'2',run:'2',done:'2',dash:'3',settings:'4'};"),

    # go()：断连滑块移入归置页后按需复位；进入设置与通勤预定刷新
    ("    if(id === 'switch' && swDone){ swDone = false; setTimeout(function(){ swMetrics(); setSw(0); }, 40); }",
     "    if(id === 'dumpai'){ setTimeout(function(){ swDone = false; swMetrics(); setSw(0); }, 40); }"),
    ("    if(id === 'podplan') restartCountdown();",
     "    if(id === 'podplan') paintPlan();\n    if(id === 'settings') paintSettings();"),
    ("    if(id === 'evening') syncEvening();",
     "    if(id === 'evening') renderTimeline();"),

    # 断连开关重置：改为离开通勤舱时复位
    ("""  // 断连开关重置
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-go]');
    if(!b) return;
    var id = b.getAttribute('data-go');
    if(id === 'pod'){
      setTimeout(function(){
        swDone = false; swMetrics(); setSw(0);
      }, 420);
    }
    if(id === 'combo' && b.closest('.tabbar')){
      $('#comboSrc').textContent = 'AI 推荐';
    }
  });""",
     """  // 断连开关在离开入口时复位
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-go]');
    if(!b) return;
    var id = b.getAttribute('data-go');
    if(id === 'pod'){
      setTimeout(function(){ swDone = false; swMetrics(); setSw(0); }, 420);
    }
    if(id === 'combo' && b.closest('.tabbar')){
      $('#comboSrc').textContent = 'AI 推荐';
    }
  });"""),

    # 音效开关抽成函数，供设置页复用
    ("""  $('#soundBtn').addEventListener('click', function(){
    soundOn = !soundOn;
    this.setAttribute('aria-pressed', String(soundOn));
    this.textContent = '音效 · ' + (soundOn ? '开' : '关');
    if(soundOn) ding();
  });""",
     """  function setSound(v){
    soundOn = v;
    var h = $('#soundBtn');
    h.setAttribute('aria-pressed', String(v));
    h.textContent = '音效 · ' + (v ? '开' : '关');
    var t = $('#setSound');
    if(t){ t.classList.toggle('on', v); t.setAttribute('aria-checked', String(v)); }
    if(v) ding();
  }
  $('#soundBtn').addEventListener('click', function(){ setSound(!soundOn); });"""),

    # 旧的三选一预定整段换成逐件规划
    ("""  /* ---------- 4. plan 3-choice ---------- */
  var PLAN = [
    {n:'泡脚 + 自由刷短视频', d:20, src:'已预定'},
    {n:'把洗手池擦干净', d:5, src:'已预定'},
    {n:'靠墙抬腿 10 分钟', d:10, src:'已预定'}
  ];
  var picked = 0;
  function restartCountdown(){
    var bar = $('#cdBar');
    bar.classList.remove('run');
    void bar.offsetWidth;
    bar.classList.add('run');
  }
  $('#opts').addEventListener('click', function(e){
    var b = e.target.closest('[data-opt]');
    if(!b) return;
    picked = parseInt(b.getAttribute('data-opt'),10);
    $$('#opts .opt').forEach(function(o){ o.classList.remove('on'); });
    b.classList.add('on');
    $('#planNote').innerHTML = '<b>已选：</b>' + PLAN[picked].n + ' · 约 ' + PLAN[picked].d + ' 分钟。到家门口时 App 会自动切到这张卡片。';
    ding();
  });""",
     """  /* ---------- 4. 通勤预定：结合到家时间与睡觉时间，逐件排今晚 ---------- */
  var PP_ETA = 19 * 60 + 4;                    // 预计到家 19:04
  var PP_WRAP = 50;                            // 洗漱 20 + 上床缓冲 30
  var PP_STEPS = [
    {key:'meal',  ic:'pan',   bg:'var(--pink)',   q:'晚饭怎么办？', opts:[
      {t:'番茄鸡蛋面',    note:'有灶有锅',   d:40},
      {t:'热一份速冻饺子', note:'微波炉',     d:15},
      {t:'点外卖',        note:'到家前下单', d:0}
    ]},
    {key:'walk',  ic:'shoe',  bg:'var(--sage)',   q:'出门走一圈吗？', opts:[
      {t:'散步 20 分钟',  note:'家附近环线', d:20},
      {t:'今天不走',      note:'留在家',     d:0}
    ]},
    {key:'combo', ic:'sofa',  bg:'var(--yellow)', q:'回到家先做哪件放松？', opts:[
      {t:'泡脚 + 刷短视频', note:'手可以放空', d:20},
      {t:'靠墙抬腿 10 分钟', note:'缓解久坐',   d:10},
      {t:'擦干净洗手池',     note:'看得见结果', d:5}
    ]}
  ];
  var planPick = [null, null, null];           // 每一步选中的下标
  var planDur  = {meal:40, walk:20, combo:20}; // 选中后的时长
  var planTx   = {meal:{name:'',note:''}, walk:{name:'',note:''}, combo:{name:'',note:''}};

  function planRec(i){ return i === 0 ? ({A:0, B:1, C:2}[profile.cook] || 0) : 0; }

  function planChain(){
    var t = PP_ETA, rows = [{t:t, name:'到家', free:false, zero:true}];
    PP_STEPS.forEach(function(s, i){
      var k = planPick[i];
      if(k == null) return;
      var o = s.opts[k];
      rows.push({t:t, name:o.t, d:o.d, zero:o.d === 0});
      if(o.d > 0) t += o.d;
    });
    return {rows:rows, end:t, free:profile.bed - PP_WRAP - t};
  }

  function paintPlan(){
    var i = 0;
    while(i < PP_STEPS.length && planPick[i] != null) i++;

    var avail = profile.bed - PP_ETA;
    if(avail < 0) avail += 1440;
    $('#ppEta').textContent = hhmm(PP_ETA);
    $('#ppBed').textContent = hhmm(profile.bed);
    $('#ppAvail').textContent = Math.floor(avail / 60) + ' 小时 ' + (avail % 60) + ' 分';

    $('#ppDots').innerHTML = PP_STEPS.map(function(_, k){
      return '<i class="' + (planPick[k] != null ? 'ok' : (k === i ? 'on' : '')) + '"></i>';
    }).join('');

    if(i < PP_STEPS.length){
      var s = PP_STEPS[i];
      $('#ppAsk').innerHTML =
        '<div class="pp-n">第 ' + (i + 1) + ' / ' + PP_STEPS.length + ' 件</div>' +
        '<h2 class="pp-q">' + s.q + '</h2>' +
        '<div id="ppOpts">' + s.opts.map(function(o, k){
          return '<button class="pp-opt' + (k === planRec(i) ? ' rec' : '') + '" data-pp="' + k + '">' +
            '<span class="pp-ic" style="background:' + s.bg + '">' +
              '<span class="ii ii-' + s.ic + '" style="width:17px;height:17px"></span></span>' +
            '<span class="pp-tx"><b>' + o.t + '</b><span>' + o.note + '</span></span>' +
            '<em>' + (o.d ? o.d + '′' : '不占时间') + '</em></button>';
        }).join('') + '</div>';
    } else {
      $('#ppAsk').innerHTML =
        '<div class="pp-n">三件都定了</div>' +
        '<h2 class="pp-q" style="margin-bottom:0">今晚就这么过。</h2>';
    }

    var ch = planChain();
    var list = ch.rows.map(function(r){
      return '<div class="pp-li' + (r.free ? ' free' : '') + '"><b>' + hhmm(r.t) + '</b>' +
        '<span>' + r.name + '</span><em>' + (r.d ? r.d + '′' : '') + '</em></div>';
    });
    if(planPick[0] != null){
      list.push('<div class="pp-li free"><b>' + hhmm(ch.end) + '</b><span>留白 → ' +
        hhmm(profile.bed - PP_WRAP) + '</span><em>' +
        (ch.free > 0 ? Math.floor(ch.free / 60) + ' 小时 ' + (ch.free % 60) + ' 分' : '0 分') + '</em></div>');
    }
    $('#ppList').innerHTML = list.join('');
  }

  $('#ppAsk').addEventListener('click', function(e){
    var b = e.target.closest('[data-pp]');
    if(!b) return;
    var i = 0;
    while(i < PP_STEPS.length && planPick[i] != null) i++;
    if(i >= PP_STEPS.length) return;
    var k = parseInt(b.getAttribute('data-pp'), 10);
    var s = PP_STEPS[i], o = s.opts[k];
    planPick[i] = k;
    planDur[s.key] = o.d;
    planTx[s.key] = {name:o.t, note:o.note};
    if(s.key === 'combo') $('#comboSrc').textContent = '已预定 · ' + o.t;
    paintPlan();
    renderTimeline();
    ding();
    if(i === PP_STEPS.length - 1) toast('今晚排好了');
  });"""),

    # 睡前日程：读取通勤预定的结果
    ("""  function renderTimeline(){
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
    });""",
     """  function renderTimeline(){
    var cook = COOK_TX[profile.cook];
    var geo = GEO_TX[profile.geo === 'yes' ? 'yes' : 'no'];
    TX.meal.name = planTx.meal.name || cook.meal;
    TX.meal.note = planTx.meal.name ? planTx.meal.note : cook.note;
    TX.walk.name = planTx.walk.name || geo.walk;
    TX.walk.note = planTx.walk.name ? planTx.walk.note : geo.note;
    TX.combo.name = planTx.combo.name || '放松 Combo';
    TX.combo.note = planTx.combo.note || '泡脚 + 刷短视频';

    var start = 18 * 60 + 30;
    // 通勤预定的选择会改写这一格的时长；时长为 0 的格子今晚不排
    var rows = [];
    EV_FIX.forEach(function(r){
      var m = r.min, over = r.key && planDur[r.key] !== undefined;
      if(over){
        if(planDur[r.key] === 0) return;
        m = planDur[r.key];
      }
      rows.push({r:r, min:(r.free || r.key === 'bed') ? null : m});
    });

    var fixed = 0;
    rows.forEach(function(x){ if(x.min) fixed += x.min; });
    var flex = Math.max(40, profile.bed - start - fixed);
    var free = Math.round(flex * 90 / 130);          // 留白 : 上床缓冲 = 9 : 4
    var bufm = flex - free;

    var blocks = [], t = start, maxMin = 1;
    rows.forEach(function(x){
      var m = x.min || (x.r.free ? free : bufm);
      blocks.push({r:x.r, t:t, m:m});
      t += m;
      if(m > maxMin) maxMin = m;
    });"""),

    # 变量表：去掉 evComboNote
    ("""  var TX = { meal:{name:'', note:''}, walk:{name:'', note:''}, combo:{name:'放松 Combo', note:''} };
  var evComboNote = '已预定：泡脚 + 刷短视频';""",
     """  var TX = { meal:{name:'', note:''}, walk:{name:'', note:''}, combo:{name:'放松 Combo', note:''} };"""),

    # 画像刷新：合并「能用时长」读数，并同步设置页与通勤预定
    ("""  function paintProfile(){
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
  }""",
     """  function paintProfile(){
    var avail = profile.bed - (18 * 60 + 30);
    if(avail < 0) avail += 1440;
    $('#bedTime').innerHTML = hhmm(profile.bed) +
      '<small>睡前可用 ' + Math.floor(avail / 60) + ' 小时 ' + (avail % 60) + ' 分</small>';
    $$('#bedPresets .chip').forEach(function(c){
      c.classList.toggle('on', c.getAttribute('data-bed') === hhmm(profile.bed));
    });

    $('#evBedLbl').textContent = hhmm(profile.bed);
    renderTimeline();
    paintSettings();
    paintPlan();
  }"""),

    # 睡觉时间控件
    ("""  function setBed(m){
    if(m < 12 * 60) m += 1440;      // 00:00 这类预设按次日凌晨处理
    profile.bed = Math.max(BED_MIN, Math.min(BED_MAX, m));
    paintProfile();
  }""",
     """  function setBed(m){
    if(m < 12 * 60) m += 1440;      // 00:00 这类预设按次日凌晨处理
    profile.bed = Math.max(BED_MIN, Math.min(BED_MAX, m));
    paintProfile();
  }
  $('#setBedMinus').addEventListener('click', function(){ setBed(profile.bed - 15); ding(); });
  $('#setBedPlus').addEventListener('click', function(){ setBed(profile.bed + 15); ding(); });
  $('#setGeoToggle').addEventListener('click', function(){
    profile.geo = profile.geo === 'yes' ? 'no' : 'yes';
    paintProfile(); ding();
  });
  $('#setCook').addEventListener('click', function(e){
    var c = e.target.closest('[data-cook]');
    if(!c) return;
    profile.cook = c.getAttribute('data-cook');
    paintProfile(); ding();
  });
  $('#setSound').addEventListener('click', function(){ setSound(!soundOn); });

  function paintSettings(){
    if(!$('#setBedVal')) return;
    $('#setBedVal').textContent = hhmm(profile.bed);
    var avail = profile.bed - (18 * 60 + 30);
    if(avail < 0) avail += 1440;
    $('#setBedNote').textContent = '睡前可用 ' + Math.floor(avail / 60) + ' 小时 ' + (avail % 60) + ' 分';
    var on = profile.geo === 'yes';
    $('#setGeoVal').textContent = on ? '已允许' : '未授权';
    $('#setGeoToggle').textContent = on ? '关闭' : '允许';
    $$('#setCook .chip').forEach(function(c){
      c.classList.toggle('on', c.getAttribute('data-cook') === profile.cook);
    });
  }"""),

    # syncEvening 不再需要
    ("""  // 通勤预定的选择写进睡前日程的 Combo 格
  function syncEvening(){
    var o = document.querySelector('#opts .opt.on');
    if(o){
      var n = o.querySelector('.opt-tx b');
      if(n) evComboNote = '已预定：' + n.textContent;
    }
    renderTimeline();
  }

""", ""),

    # 位置按钮：选择即前进
    ("""  $('#geoAllow').addEventListener('click', function(){ profile.geo = 'yes'; paintProfile(); ding(); });
  $('#geoDeny').addEventListener('click', function(){ profile.geo = 'no'; paintProfile(); ding(); });""",
     """  $('#geoAllow').addEventListener('click', function(){ profile.geo = 'yes'; paintProfile(); ding(); go('onb4'); });
  $('#geoDeny').addEventListener('click', function(){ profile.geo = 'no'; paintProfile(); ding(); go('onb4'); });"""),

    # 默认入口：音效开关与页眉保持一致
    ("""  setTimeout(function(){ $('#comboSrc').textContent = '已预定 · 选项 A'; }, 50);""",
     """  // 音效开关状态与页眉按钮对齐（HTML 里已是「开」）"""),
]
for old, new in JS_REPL:
    sub(old, new, "JS")

# ================================================================ 8) 版本标记
VER = [
    ("<title>OffWork · 前端交互稿 v3 · 首启引导与睡前日程</title>",
     "<title>OffWork · 前端交互稿 v4 · 每屏一个重点</title>"),
    ('<span class="brand-tag">前端交互稿 · v3 · 首启引导 + 睡前日程</span>',
     '<span class="brand-tag">前端交互稿 · v4 · 每屏一个重点</span>'),
    ("<b>图标素材</b>：36 枚手绘图标由生图模型批量产出（每批 2×2 贴纸带），"
     "按内容投影切分、白底泛洪抠除背景，压成 PNG-8 后 base64 内嵌，总计约 227 KB。",
     "<b>图标素材</b>：40 枚手绘图标由生图模型批量产出（每批 2×2 贴纸带），"
     "按内容投影切分、白底泛洪抠除背景，压成 PNG-8 后 base64 内嵌，总计约 245 KB。"),
]
for old, new in VER:
    sub(old, new, "版本标记")

open(DST, "w", encoding="utf-8").write(src)
print("写出", DST)
print("尺寸 %.1f KB -> %.1f KB" % (orig_len / 1024, len(src.encode('utf-8')) / 1024))
print("屏幕数", src.count('<section class="scr"'), "/ svg", src.count("<svg"))
