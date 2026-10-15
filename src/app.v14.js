const $ = s => document.querySelector(s);
const KEY = 'offwork-v2';
const combos = [
  { title:'泡脚 + 自由刷手机', mins:20, prep:'准备温水，找个舒服的位置坐下。', type:'感官放松' },
  { title:'靠墙抬腿 + 看点喜欢的', mins:10, prep:'轻轻抬起双腿；不舒服就换个姿势。', type:'轻微动作' },
  { title:'整理桌面', mins:3, prep:'放好一个杯子，擦一小块桌面。', type:'触觉沉浸' }
];
const recommendations={tv:[{id:'wind',title:'去有风的地方',note:'换个生活场景，慢慢看一段。',url:'https://www.mgtv.com/h/512453.html'},{id:'altay',title:'我的阿勒泰',note:'想看草原与日常生活的时候。',url:'https://pages.iqiyi.com/m/zbs/news2024083001.html?qyc-body-bgc=ffffff&qyc-pr=1'}],read:[{id:'prince',title:'小王子',note:'读一小段，读到喜欢的地方就停。',url:'https://www.lepetitprince.com/en/the-book/'},{id:'altay-book',title:'我的阿勒泰',note:'读一篇李娟的生活散文。',url:'https://lib.cidp.edu.cn/__local/7/6B/36/CA3D81583C9014E77CC5A753D12_A38C50D8_15E946.pdf'}]};
const defaults = () => ({ onboard:0, introPage:0, stage:'shutdown', tab:0, night:null, planItems:null, activeKey:null, activeTitle:null, planConfirmed:false, arrived:false, eveningDone:[], activity:null, eveningEnded:false, combo:0, booked:false, sealed:false, draft:'', recording:false, inputMode:'voice', recordStartedAt:null, recordSeconds:0, vaultTasks:[], achievement:'', breathing:true, breathStartedAt:null, transitVisited:false,transitStep:'sound', energy:40, sessions:0, totalRelax:0, remaining:null, running:false, done:false, sound:'', soundPick:false, mood:null, prefs:{off:'18:30', bed:'23:30', commute:40, cooking:'yes', walk:true, dinner:'cook'}, personalStart:null, journeyMode:'overview', journeyKey:null, journeyTimer:false, journeySpent:0, journeyAlts:{}, journeyOriginals:{}, score:null, lastDoneKey:null });
let state = defaults();
try { const old = JSON.parse(localStorage.getItem(KEY)||'null'); if(old){state={...state,...old,prefs:{...state.prefs,...old.prefs},running:false,recording:false};if(old.planConfirmed===undefined&&['transit','home','active','complete'].includes(old.stage)){state.planConfirmed=true;state.night={...state.prefs}}} } catch {}
if(['home','active','complete'].includes(state.stage))state.arrived=true;
if(state.stage==='complete'&&state.done&&!state.eveningDone.includes('relax'))state.eveningDone.push('relax');
state.journeyTimer=false;
if(state.planConfirmed&&state.stage==='active'){state.journeyMode='detail';state.journeyKey=state.activeKey;state.stage='ready'}
if(state.planConfirmed&&state.stage==='complete'){state.journeyMode='done';state.stage='ready'}
if(state.stage==='analyzing')state.stage='sealed';
let audio = null, audioPaused = false, editor = null, panel = null, returnPanel = null, activityEdit=null, pendingAdded=null, analysisTimer=null;
/* 待办占位：演示时没有抽取结果也要有东西可看，用一小段示例清单填充，
   并在界面上标明是示例，避免被当成真实待办。 */
const TASK_PLACEHOLDER=['明天 10:00 给王姐回排期邮件','改完 Q3 复盘框架','确认周五评审的会议室'];
const soundscapes=[['雨声','rain','慢慢落下'],['车厢白噪音','train','熟悉的背景声'],['篝火','fire','暖一点的声音'],['海浪','wave','一来一回'],['夜风','wind','轻轻吹过'],['铁轨','rail','有节奏地回家']];
/* v14：播放中要显示的是「哪一段声音」，从上面那张表里取它自己的图标 */
const soundIcon=n=>{const s=soundscapes.find(x=>x[0]===n);return s?s[1]:'sound'};
const ritualIcon=(name,cls='')=>name==='mic'?`<svg class="ritual-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>`:name==='power'?`<svg class="ritual-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2v10m-6-7a9 9 0 1 0 12 0"/></svg>`:'';
const icons = ['<path d="M12 3v9m-6-6a8 8 0 1 0 12 0"/>','<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4m8-4v4M4 9h16m-12 4h8m-8 4h5"/>','<rect x="3" y="6" width="17" height="12" rx="2"/><path d="M22 10v4M7 10v4m4-4v4m4-4v4"/>','<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--paper)"/><circle cx="16" cy="12" r="2" fill="var(--paper)"/><circle cx="10" cy="18" r="2" fill="var(--paper)"/>'];
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function set(p){Object.assign(state,p);save();render()}
/* 演示用跳转：把某个关键页面直接摆出来，省去一路点过去。
   只在演示外壳（手机屏幕外）用，不改动正常流程。 */
function jumpTo(k){
  const base={onboard:4,soundPick:false,panel:null,recording:false,inputMode:'voice',journeyMode:'overview',journeyKey:null,journeyTimer:false,running:false,breathing:false,arrived:true,stage:'ready',tab:0};
  try{
    if(k==='intro')return set({...base,onboard:0,introPage:0,stage:'shutdown',planConfirmed:false,arrived:false});
    if(k==='dump')return set({...base,stage:'shutdown',planConfirmed:false,arrived:false});
    if(k==='dump2')return set({...base,stage:'shutdown',planConfirmed:false,arrived:false,inputMode:'text',draft:'今天开了好多会。方案又改了一遍。明天给王姐回排期邮件。'});
    if(k==='sealed')return set({...base,stage:'sealed',planConfirmed:false,arrived:false,sealed:true,draft:'今天把会议框架重新排了一遍。明天给王姐回排期邮件；改完 Q3 复盘框架；确认周五评审的会议室。',vaultTasks:['给王姐回排期邮件','改完 Q3 复盘框架','确认周五评审的会议室'],achievement:'今天完成了会议准备。'});
    if(k==='closed')return set({...base,stage:'closed',planConfirmed:false,arrived:false,vaultTasks:['给王姐回排期邮件','改完 Q3 复盘框架']});
    if(k==='pod')return set({...base,stage:'transit',planConfirmed:false,arrived:false,transitStep:'sound'});
    if(k==='breathe')return set({...base,stage:'transit',planConfirmed:false,arrived:false,transitStep:'breathe',breathing:true,breathStartedAt:Date.now()});
    if(k==='build')return beginBuilder();
    if(k==='buildsum'){beginBuilder();return set({builderReview:true,tab:0})}
    if(k==='combo'){materializePlan();return set({...base,planConfirmed:true,tab:1})}
    if(k==='detail'){materializePlan();return set({...base,planConfirmed:true,tab:1,journeyMode:'detail',journeyKey:'dinner'})}
    if(k==='done'){materializePlan();return set({...base,planConfirmed:true,tab:1,journeyMode:'done',score:70,eveningDone:['dinner','relax','walk']})}
    if(k==='dash'){materializePlan();return set({...base,planConfirmed:true,tab:2,score:70,personalStart:Date.now()-5400000,totalRelax:2400})}
    if(k==='prefs')return set({...base,planConfirmed:true,tab:3});
  }catch(err){toast('跳转失败：'+err.message)}
}
function toast(t){$('#toast').textContent=t;$('#toast').hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').hidden=true,2500)}
const button=(t,a,cls='primary',disabled=false)=>`<button class="${cls}" data-action="${a}" ${disabled?'disabled':''}>${t}</button>`;
const ic=(n,c)=>`<i class="ii ii-${n}${c?' '+c:''}" aria-hidden="true"></i>`;
const KIND_ICON={commute:'train',bed:'bed',dinner:'bowl',relax:'sofa',walk:'shoe',wash:'tooth',free:'note',winddown:'moon',tv:'tv',read:'book',custom:'mug'};
const rowIcon=k=>`<i class="ii ii-${KIND_ICON[k]||'tag'} row-ic" aria-hidden="true"></i>`;
const backLabel=(t,a,cls='back')=>`<button class="${cls}" data-action="${a}">${ic('arrow-l','back-ic')}<span>${t}</span></button>`;
const deco=(n,style,extra)=>`<i class="deco ii ii-${n}${extra?' '+extra:''}" style="${style}" aria-hidden="true"></i>`;
const VENT_LEADS=[{at:0,s:'慢慢说，先不着急'},{at:12,s:'我听着呢'},{at:26,s:'听起来今天挺不容易的'},{at:44,s:'说出来，就不归你管了'}];
const VENT_DEMO=['今天开了好多会','方案又改了一遍','那会儿我没接住话','明明是别人的活','我真的好烦','有点堵得慌','忍了一天没说','算了，说出来好一点','我只想早点回家','明天的事明天再说'];
const VENT_MAJOR=['烦','气','怒','崩溃','难受','委屈','焦虑','慌','怕','恨','恶心','讨厌','受不了','受够','抓狂','绝望','压抑','堵','哭','烦死','无语','爆炸','累死','凭什么','撑不住','痛','吵','麻','窒息','心累','难熬','熬不住','火大'];
const VENT_MINOR=['忙','急','赶','催','加班','开会','会','改','等','拖','乱','多','重','错','累','通宵','熬夜','补','重做','没做完','来不及','紧','又来','最后','东西','事'];
const VENT_TONE={burst:['烦','火','气','怒','爆炸','崩','凭什么','受够','受不了','吵','恶心','烦死','气死','抓狂','烂','够了','火大'],drop:['累','难过','委屈','哭','痛','苦','熬','撑不住','绝望','心累','窒息','压抑','难受','孤独','麻'],cloud:['压','堵','忙','急','赶','催','来不及','重','难','焦虑','慌','乱','错','拖','多','闷','等']};
const steps=n=>`<div class="steps" aria-label="流程进度">${[0,1,2].map(i=>`<span class="step ${i<=n?'on':''}"></span>`).join('')}</div>`;
const fmt=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');
const minutes=t=>Number(t.split(':')[0])*60+Number(t.split(':')[1]);
const clock=n=>`${n>=1440?'次日 ':''}${String(Math.floor(n/60)%24).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
function suggestedItems(p){
  let span=minutes(p.bed)-minutes(p.off);if(span<=0)span+=1440;
  const dinner=p.dinner==='cook'?45:30,relax=combos[state.combo].mins,base=Number(p.commute)+dinner+relax+20+30;
  const items=[{id:'dinner',kind:'dinner',title:p.dinner==='cook'?'做一顿简单晚饭':'吃点现成的',mins:dinner},{id:'relax',kind:'relax',title:combos[state.combo].title,mins:relax,combo:state.combo}];
  let left=span-base;
  if(p.walk&&left>=15){const walk=Math.min(20,left);items.push({id:'walk',kind:'walk',title:'楼下散步',mins:walk});left-=walk;}
  items.push({id:'wash',kind:'wash',title:'洗漱 · 换舒服的衣服',mins:20});
  if(left>=30){const reserve=Math.min(20,Math.round(left*.15/5)*5),leisure=left-reserve;const tv=Math.max(15,Math.floor(leisure*.62/5)*5),read=leisure-tv;items.push({id:'tv',kind:'tv',title:'看剧',mins:tv,recommendation:'wind'});if(read>=10)items.push({id:'read',kind:'read',title:'阅读',mins:read,recommendation:'prince'});}
  items.push({id:'winddown',kind:'winddown',title:'睡前准备',mins:30});return items;
}
function materializePlan(){if(!state.planItems)state.planItems=suggestedItems(state.night||state.prefs);return state.planItems}
function recommendationFor(item){return recommendations[item.kind]?.find(x=>x.id===item.recommendation)}
function timeline(p=state.night||state.prefs,items=state.planItems){
  const off=minutes(p.off);let bed=minutes(p.bed);if(bed<=off)bed+=1440;const span=bed-off;
  items=items||suggestedItems(p);const rows=[];let cursor=off;
  function add(item){const duration=Number(item.mins);rows.push({...item,key:item.id,time:cursor,end:cursor+duration,duration});cursor+=duration}
  add({id:'commute',kind:'commute',title:'下班 · 回家路上',mins:Number(p.commute)});
  const wind=items.find(i=>i.kind==='winddown')||{id:'winddown',kind:'winddown',title:'睡前准备',mins:30};
  items.filter(i=>i.kind!=='winddown').forEach(add);
  const free=Math.max(0,bed-cursor-wind.mins);if(free)add({id:'free',kind:'free',title:'留一点弹性时间',mins:free});
  add(wind);const overrun=Math.max(0,cursor-bed);rows.push({key:'bed',kind:'bed',time:cursor,end:cursor,title:'晚安',duration:0});
  const walk=rows.find(r=>r.kind==='walk')?.duration||0;
  return {rows,span,free,walk,walkOmitted:p.walk&&!walk,overrun,error:span>960?'请把睡觉时间设在下班后的 16 小时内。':overrun?`比睡觉时间多 ${overrun} 分钟，请缩短或移除一项活动。`:null};
}
function choices(name, items, value){return `<div class="option-row">${items.map(([v,t])=>`<label class="option ${value===v?'chosen':''}"><input type="radio" name="${name}" value="${v}" ${value===v?'checked':''}><span>${t}</span>${ic('check')}</label>`).join('')}</div>`}
function timesForm(p,daily=false){return `<div class="card form-card"><label for="off">${ic('door')} ${daily?'今天几点下班？':'通常几点下班？'}</label><input type="time" id="off" value="${p.off}" required><label for="bed">${ic('moon')} ${daily?'今晚几点睡觉？':'通常几点睡觉？'}</label><input type="time" id="bed" value="${p.bed}" required><label for="commute">${ic('train')} 回家路上大约多久？</label><div class="unit-input"><input type="number" id="commute" min="5" max="180" step="5" value="${p.commute}" required><span>分钟</span></div><p id="form-error" class="error" role="alert"></p></div>`}
function readTimes(){const p={...state.prefs,off:$('#off').value,bed:$('#bed').value,commute:Number($('#commute').value)};const error=!p.off||!p.bed?'请填写下班和睡觉时间。':!Number.isFinite(p.commute)||p.commute<5||p.commute>180?'通勤时长请填写 5–180 分钟。':null;if(error){$('#form-error').textContent=error;return null}return p}
const INTRO_PAGES=[
  {img:'hero-1',title:'下班了，<br>把时间还给自己。',sub:'关掉工作模式，把今晚过好。',cta:'开始'},
  {img:'hero-2',title:'把今天，<em>说出来</em>。',sub:'对着它说几句。说不出口的事先替你收着，明天九点再放回备忘录。',cta:'继续'},
  {img:'hero-3',title:'回家路上，<br>先安静一会儿。',sub:'挑一段白噪音，或者跟着圆点慢慢呼吸。它会在后面一直放着。',cta:'继续'},
  {img:'hero-4',title:'今晚做什么，<br>现在就排好。',sub:'按你的生活习惯安排吃饭、散步、看剧和休息，到家一件一件做。',cta:'设置我的生活习惯'}
];
const heroBtn=(t,a)=>`<button class="hero-btn" data-action="${a}">${t}</button>`;
function introScreen(page=state.introPage){
  const i=Math.max(0,Math.min(page,INTRO_PAGES.length-1)),p=INTRO_PAGES[i],last=i===INTRO_PAGES.length-1;
  const dots=`<div class="hero-dots" aria-hidden="true">${INTRO_PAGES.map((_,n)=>`<i class="${n===i?'on':''}"></i>`).join('')}</div>`;
  const back=i>0?backLabel('返回','introBack','hero-back'):'';
  const skip=(i>0&&!last)?`<button class="hero-skip" data-action="introSkip">跳过介绍</button>`:'';
  return `<div class="hero-full ${p.img}" role="img" aria-label="下班后的晚间生活插画"></div><div class="hero-veil" aria-hidden="true"></div><div class="hero-top">${back}${skip}</div><div class="hero-copy${i>0?' low':''}"><h1 class="hero-h1">${p.title}</h1><p class="hero-sub">${p.sub}</p></div><div class="hero-cta">${heroBtn(p.cta,last?'onboardStart':'introNext')}${dots}</div>`;
}
function onboarding(){
  if(state.onboard===0)return introScreen();
  const p=state.prefs;
  return `${backLabel('返回','onboardBack')}<h2>平时的晚上，<br>是什么节奏？</h2><p class="lead">只设置一次，以后可在「设置」里修改。</p>${prefsTimes(p)}<div class="card form-card onboarding-pref"><fieldset><legend>${ic('pan')} 家里方便做饭吗？</legend>${choices('cooking',[['yes','可以'],['sometimes','偶尔'],['no','不方便']],p.cooking)}</fieldset><fieldset><legend>${ic('shoe')} 晚饭后散步</legend>${choices('walk',[['yes','喜欢散步'],['no','更喜欢待在家']],p.walk?'yes':'no')}</fieldset></div>${button('完成设置，开始下班','onboardFinish')}`;
}
function planRows(plan,current=null){return `<div class="schedule-list">${plan.rows.map(r=>{const rec=recommendationFor(r),editable=!['commute','bed','free'].includes(r.kind),finished=state.eveningDone.includes(r.key);const cur=state.arrived&&current?.key===r.key&&!state.eveningEnded;return `<div class="schedule-item ${cur?'current':''}" ${editable?`data-edit-item="${esc(r.key)}"`:''}><time>${clock(r.time)}${r.duration?`<small>${clock(r.end)}</small>`:''}</time>${rowIcon(r.kind)}<div class="item-copy"><strong>${esc(r.title)}</strong>${rec?`<span class="recommend-label">《${esc(rec.title)}》</span>`:r.customContent?`<span class="recommend-label">${esc(r.customContent)}</span>`:''}${finished?'<small>已结束</small>':''}</div><div class="item-tail">${r.duration?`<span>${r.duration} 分钟</span>`:''}${editable?`<button class="edit-item" data-edit-item="${esc(r.key)}" aria-label="调整${esc(r.title)}">调整</button>`:''}</div></div>`}).join('')}</div>`}
function planHeading(p){return `<button class="time-boundary" data-action="editBoundary">${p.off} 下班 → ${clock(minutes(p.bed)+(minutes(p.bed)<=minutes(p.off)?1440:0))} 睡觉 <span>修改时间</span></button>`}
function planningScreen(){return builderScreen()}
function currentEvening(){return timeline().rows?.find(r=>!['commute','bed'].includes(r.key)&&!state.eveningDone.includes(r.key))}
function scheduleScreen(){
  const plan=timeline(),current=currentEvening();
  if(state.activity){const r=plan.rows.find(r=>r.key===state.activity);if(r){const rec=recommendationFor(r);return `<h2>${esc(r.title)}</h2><div class="card ${r.kind==='walk'?'green':'yellow'}"><h3 class="inl">${ic(KIND_ICON[r.kind]||'tag')}${r.duration} 分钟，慢慢来。</h3><p>${({dinner:'吃一顿舒服的饭。',walk:'走熟悉的路，随时可以折返。',wash:'洗漱，换上舒服的衣服。',free:'做点自己喜欢的，也可以什么都不做。',winddown:'把灯调暗一点，准备休息。',tv:'看一会儿喜欢的，不必追完。',read:'慢慢读，喜欢的一段也可以再读一次。'})[r.kind]||''}</p>${rec?`<h3>《${esc(rec.title)}》</h3><p>${rec.note}</p><a href="${rec.url}" target="_blank" rel="noopener" class="source-link">${r.kind==='tv'?'前往平台了解':'了解这本书'} ↗</a>`:''}${r.kind==='walk'?button('查看路线','route','link'):''}</div><div class="page-action">${button(r.kind==='winddown'?'晚安，结束今晚':'好了，回到日程','finishActivity')}<div class="center">${button('返回日程','backToPlan','link')}</div></div>`;}}
  let primary;
  if(!state.planConfirmed)primary=button('去安排今晚','reviewPlan');
  else if(state.eveningEnded)primary=button('看看今晚的恢复','dashboard');
  else if(state.stage==='active')primary=button('回到放松计时','returnMain');
  else if(!state.arrived)primary=button(['transit','ready'].includes(state.stage)?'我到家了':'继续下班流程',['transit','ready'].includes(state.stage)?'home':'returnMain');
  else primary=button(current?({dinner:'开始晚饭',relax:'开始放松',walk:'出去走走',wash:'开始洗漱',free:'享受自由时间',winddown:'准备睡觉',tv:'开始看剧',read:'开始阅读',custom:'开始这项活动'})[current.kind]:'晚安，结束今晚',current?'beginActivity':'endEvening','primary',!!plan.error);
  const p=state.night||state.prefs;
  return `<div class="row"><h2>${state.eveningEnded?'今晚，辛苦了。':'按自己的节奏来。'}</h2>${button('调整顺序','editPlan','link')}</div>${planHeading(p)}${plan.error?`<p class="error">${plan.error}</p>`:''}${planRows(plan,current)}${button('+ 添加活动','addActivity','add-activity')}<div class="page-action">${primary}</div>`;
}
function editScreen(){const plan=timeline(state.night||state.prefs,editor);return `${backLabel('返回','cancelEdit')}<h2>换个顺序也可以。</h2><p class="plan-hint">上下移动活动，时间会自动衔接。</p>${plan.error?`<p class="error" role="alert">${plan.error}</p>`:''}<div class="reorder-list">${editor.map((item,i)=>`<div class="reorder-item"><button class="reorder-copy" data-edit-item="${item.id}"><strong>${esc(item.title)}</strong><small>${recommendationFor(item)?'《'+recommendationFor(item).title+'》 · ':''}${item.mins} 分钟</small></button><div class="reorder-controls"><button data-move-item="${item.id}" data-direction="-1" aria-label="上移${esc(item.title)}" ${i===0||item.kind==='winddown'?'disabled':''}>↑</button><button data-move-item="${item.id}" data-direction="1" aria-label="下移${esc(item.title)}" ${i>=editor.length-2?'disabled':''}>↓</button></div></div>`).join('')}</div>${button('+ 添加活动','addActivity','add-activity')}<div class="page-action">${button('保存具体日程','savePlan','primary',!!plan.error)}</div>`}
function prefsTimes(p){return `<div class="card form-card compact"><div class="duo"><div><label for="off">${ic('door')} 平时几点下班？</label><input type="time" id="off" value="${p.off}" required></div><div><label for="bed">${ic('moon')} 平时几点睡觉？</label><input type="time" id="bed" value="${p.bed}" required></div></div><label for="commute">${ic('train')} 回家路上大约多久？</label><div class="unit-input"><input type="number" id="commute" min="5" max="180" step="5" value="${p.commute}" required><span>分钟</span></div><p id="form-error" class="error" role="alert"></p></div>`}
function prefsScreen(){const p=state.prefs;return `<div class="row"><h2>按你的生活来。</h2>${button('首次介绍','intro','link')}</div>${prefsTimes(p)}<div class="card form-card"><fieldset><legend>${ic('pan')} 家里方便做饭吗？</legend>${choices('cooking',[['yes','可以'],['sometimes','偶尔'],['no','不方便']],p.cooking)}</fieldset><fieldset><legend>${ic('shoe')} 晚饭后散步</legend>${choices('walk',[['yes','喜欢散步'],['no','更喜欢待在家']],p.walk?'yes':'no')}</fieldset></div>${button('保存设置','savePrefs')}`}
/* 倾诉屏的空文字区：一撮飘着的碎碎念。麦克风周围是干净的（没有装饰），
   这些只落在还没说话时那片空着的字场里；一开始录音（is-rec）就淡出，把位置让给实时文字。
   v14：六枚全部换成星，只在大小与角度上做区分，形状不再混搭。 */
const VENT_DOODLES='<span class="vent-doodles" aria-hidden="true">'
  +['d1','d2','d3','d4','d5','d6'].map(c=>ic('star','vd '+c)).join('')
  +'</span>';
function shutdownScreen(){
  const text=state.inputMode==='text',live=state.recording||text;
  /* 这一屏麦克风旁边不放任何装饰（同心虚线圈已删），装饰改落在上方那片空着的字场里 */
  return `<h2 class="vent-title">把今天，<em>说出来</em>。</h2>`
    +`<div class="vent ${live?'is-live':'is-idle'}${text?' is-text':''}${state.recording?' is-rec':''}" id="vent">`
    +`<div class="vent-field" id="ventField" aria-live="polite">${VENT_DOODLES}</div>`
    +`<div class="vent-input" ${text?'':'hidden'}><label for="dump">有什么想留下的</label><textarea id="dump" rows="3" placeholder="今天做了什么，明天还有什么想留着……">${esc(state.draft)}</textarea><span class="vent-count" id="dumpCount">${state.draft.length} 字</span></div>`
    +`<div class="vent-mic"><button class="vent-rec" data-action="record" aria-label="${state.recording?'结束倾诉':'开始倾诉'}"><span class="vent-ring" aria-hidden="true"></span>${ic('mic')}</button><div class="vent-status"><strong id="heatLead">${state.recording?'正在听…':'点击开始倾诉'}</strong><span id="heatClock">${state.recording?'0:00':'说一会儿就好'}</span></div></div>`
    +`</div>`
    +`<div class="page-action">${text?button('说完了，交给 AI','processDump','primary',!state.draft.trim()):''}<div class="vent-links">${text?button('改用语音','voiceMode','link'):button('改用文字','textMode','link')}${!state.recording?'<span class="sep">·</span>'+button('今天没什么要留下，直接关机','skipseal','link'):''}</div></div>`;
}
function sealedScreen(){
  const parsed=arrangeDump(state.draft);
  const own=state.sealed?(state.vaultTasks.length?state.vaultTasks:parsed.tasks):[];
  const isPh=!own.length, tasks=isPh?TASK_PLACEHOLDER:own;
  /* v14：这一屏不留任何飘在背景上的装饰（原来右上角一枚星、左下角纸飞机、右下角云） */
  return `<h2 class="ritual-title">都收好了，<br>明天<mark>九点</mark>再拿出来。</h2><div class="ritual-vault"><div class="row"><h3 class="inl">${ic('bell')}明日待办</h3><span class="tag-inline">${ic('clock','ii-xs')} 09:00</span></div><div class="ritual-task-list">${tasks.map(t=>`<div class="ritual-task"><i></i><span>${esc(t)}</span></div>`).join('')}</div><div class="vault-note"><div><strong>明天 09:00 自动导入备忘录</strong><span>${isPh?'都是示例；明天九点再带入你真正写下的。':'到时候会生成一份清单；在那之前不会提醒你。'}</span></div></div></div><div class="ritual-achievement">${ic('star','achievement-star')}<div>今日微成就</div><strong>${esc(state.achievement||parsed.achievement)}</strong></div><div class="page-action ritual-slider-footer"><div class="ritual-switch"><span>向右拉，工作打烊</span><input id="ritual-switch" type="range" min="0" max="100" value="0" step="1" aria-label="向右滑动关闭工作模式"></div></div>`;
}
function analyzingScreen(){return `<div class="ritual-analyzing"><div class="analyzing-dots" aria-hidden="true"><i></i><i></i><i></i></div><h3>AI 正在整理你刚才说的</h3><p>提取待办 · 归入保险箱 · 找一件微成就</p></div>`}
function readyScreen(){return `<h2>到家后，<br>不用再想。</h2><div class="card green"><h3 class="inl">${ic('check')}你的晚上已经排好了。</h3><p>${timeline().rows.filter(r=>!['commute','bed','free','winddown'].includes(r.kind)).map(r=>esc(r.title)).join(' → ')}</p></div><div class="page-action">${button('我到家了，开始今晚安排','home')}<div class="center">${button('查看今晚日程','schedule','link')}</div></div>`}
function closedScreen(){const own=state.vaultTasks||[],isPh=!own.length,tasks=isPh?TASK_PLACEHOLDER:own;return `<div class="ritual-closed-copy">${ic('power','ii-inv')}<h2>今日工作已打烊，<br>你的个人时间已上线。</h2><p>${own.length?own.length+' 条待办已收好，明天九点自动导入备忘录。':'还没留下事项，先按示例摆着。'}</p><div class="closed-tasks">${tasks.map(t=>`<div>${ic('check','closed-ic')}<span>${esc(t)}</span></div>`).join('')}</div>${button('进入通勤过渡舱','enterTransit','primary')}</div>`}
function transitScreen(){
  const p=state.night||state.prefs;
  if(state.transitStep!=='breathe')return `<div class="ritual-pod"><h2 class="ritual-title">听点没有故事的<mark>声音</mark>。</h2><p class="pod-lead">挑一段一直放着的背景声，也可以不需要。</p><div class="ritual-sounds">${soundscapes.map(([name,icon,note])=>`<button data-sound="${name}" class="ritual-sound ${state.sound===name?'selected':''} ${audio&&state.sound===name?'is-playing':''}" aria-pressed="${state.sound===name}">${ic(icon)}<strong>${name}</strong><span>${note}</span><div class="sound-bars" aria-hidden="true">${[7,12,5,14,8,11].map((h,i)=>`<i style="height:${h}px;animation-delay:${i*.12}s"></i>`).join('')}</div></button>`).join('')}</div></div><div class="page-action">${button('下一步 · 呼吸放松','transitNext')}<div class="center">${button('不需要白噪音','skipSound','link')}</div></div>`;
  /* v11：四周换成灰尘。[x, y, w, h, rot, o] —— x/y 是「吸满气」时各自散到最外的位置，
     吸气从 58% 往外扩、屏住停在原地、呼气再收回 58%；每枚固定用一个 blob（dust-1..6 循环）。
     v12：不再绕圆周等距摆 —— 半径 125~205、尺寸 22~62 都打散，角度间隔 17°~74° 刻意不均，
     再逐枚给不透明度，读起来才像随意撒的。舞台可用范围横向 ±169.5 / 纵向 ±250.5（339×501），
     每一项都留了边距，没有一枚会碰到边界。
     v13：九枚都不给 animation-delay，和中心虚线圈同一相位呼吸 —— 一次吸气是一口气，
     不是九口气。
     v14：末尾两项是 --fx / --fy —— 屏住那 7 秒里各自原地浮动的幅度与方向，
     九枚方向不同、幅度 6~10px，所以浮起来是各浮各的，不是整圈一起挪。 */
  const DUST=[
    [-18,-198,46,38,  9,.78,  7, -8],   /* 正上方偏左，最外一档 */
    [112,-126,62,52, -8,.92, -9,  7],   /* 右上，最大的一枚 */
    [148,  10,30,34, 15,.60,  8,  9],   /* 贴着右缘 */
    [-132,-30,54,44, -6,.86, -7, -9],
    [ 46, 158,28,26, 12,.58,  6,  8],   /* 下方偏右，最小的一枚 */
    [-98, 178,58,48,-12,.90, -8, -7],
    [ 96,  80,40,32,  6,.66, 10, -6],   /* 右下内圈，把环打破 */
    [-150,-96,24,22, -4,.52, -6,  9],
    [ 36,-168,22,26, 10,.50,  9, -7]
  ];
  const dust=DUST.map(([x,y,w,h,rot,o,fx,fy],i)=>`<i class="ii breath-dust-i dust-${i%6+1}" style="--x:${x}px;--y:${y}px;--w:${w}px;--h:${h}px;--rot:${rot}deg;--o:${o};--fx:${fx}px;--fy:${fy}px" aria-hidden="true"></i>`).join('');
  return `<div class="ritual-pod pod-breathe"><h2 class="ritual-title">跟着呼吸，<mark>慢下来</mark>。</h2><div class="breath-stage${state.breathing?'':' paused'}" id="breathStage"><div class="breath-orbit" aria-hidden="true">${dust}</div><span class="breath-hub" aria-hidden="true"><i class="ii breath-face ii-inhale" id="breathIcon" aria-hidden="true"></i><strong class="breath-word" id="breathWord">${state.breathing?'吸气':'暂停'}</strong></span></div><div class="breath-caption"><div><strong>跟着节奏呼吸</strong><span id="breath-label">${state.breathing?'慢慢吸满，再缓缓吐出':'准备好了就开始'}</span></div></div></div><div class="page-action pod-actions">${button(state.breathing?'暂停':'开始呼吸','toggleBreathing','link')}${button(state.planConfirmed?'回到今晚日程':'到家了 · 安排今晚日程',state.planConfirmed?'schedule':'reviewPlan')}</div>`;
}
function relaxationScreen(){const c=combos[state.combo],art=['mug','sofa','note'][state.combo]||'sofa';return steps(2)+`<div class="row"><h2>先舒服一点。</h2>${button('日程','schedule','link')}</div><div class="card pink" id="combo-card"><div class="row"><span class="pill">${c.type}</span><span class="hint">${state.combo+1} / 3</span></div><div class="col-art">${ic(art)}</div><h3>${c.title}</h3><p>${c.prep}</p><div class="hint">${c.mins} 分钟</div></div><div class="row"><button class="link" data-action="prev" aria-label="上一个放松方案">← 上一个</button><button class="link" data-action="next" aria-label="下一个放松方案">换一个 →</button></div><div class="page-action">${button('开始放松','start')}</div>`}
function activeScreen(){return steps(2)+`<h2>${state.running?'放松就好。':'歇一歇也可以。'}</h2><p class="lead inl">${ic('sofa','ii-sm')}${esc(state.activeTitle||combos[state.combo].title)}</p><div class="card green center"><div class="time" id="clock">${fmt(state.remaining)}</div><p>${state.running?'正在计时':'已暂停'}</p>${button(state.running?'暂停':'继续','pause','link')}</div><div class="page-action">${button('结束这次放松','finish')}<div class="center">${button('退出','exit','link')}</div></div>`}
function recoveryScreen(){return `<h2>一点一点，<br>把自己充回来。</h2><div class="card green"><div class="row"><h3 class="inl">${ic('bubble')}今日充电池</h3><span class="number">${state.energy}%</span></div><div class="battery">${[0,1,2,3,4].map(i=>`<span class="${i<Math.round(state.energy/20)?'full':''}"></span>`).join('')}</div></div><div class="stats"><div class="stat"><strong>${state.personalStart?Math.floor((Date.now()-state.personalStart)/60000)+' 分钟':'—'}</strong><small>本次个人时间</small></div><div class="stat"><strong>${Math.floor(state.totalRelax/60)} 分钟</strong><small>累计放松</small></div></div><div class="card"><div class="row"><h3 class="inl">${ic('chart')}这周的恢复</h3><span class="hint">示例</span></div><div class="bars">${[36,55,42,70,48,58,62].map((v,i)=>`<div class="bar ${v===70?'b-max':''}" style="height:${v}px"><small>${['四','五','六','日','一','二','三'][i]}</small></div>`).join('')}</div><p class="chart-note">泡脚的晚上，你更容易慢下来。</p></div><div class="page-action">${button(state.mood?'晨间精力：'+state.mood+' · 修改':'记录晨间精力','mood')}</div>`}

/* ======================== 情绪字场 ========================
   语音识别结果或打字内容逐句落进字场：普通句快速渐隐（w1），
   情绪轻重的差别体现在停留时长、字号、颜色与高亮块上（w2 / w3），
   并在句旁浮出一枚小元素作为回响。
   ========================================================= */
let ventUsed=[],ventLast=null,ventLiveEl=null,ventDoneText='',ventDemoN=0,ventNextAt=0,
    ventTimer=null,ventReal=false,ventSR=null,ventSeq=0,ventGen=0;

function ventWeight(t){
  let w=0.1;
  VENT_MAJOR.forEach(k=>{ if(t.indexOf(k)>=0) w+=0.4; });
  VENT_MINOR.forEach(k=>{ if(t.indexOf(k)>=0) w+=0.13; });
  w+=Math.min(0.28,(t.match(/[!！?？~～]/g)||[]).length*0.14);
  w+=Math.min(0.2,(t.match(/(.)\1/g)||[]).length*0.08);
  if(t.length<=5)w+=0.08;
  return Math.max(0,Math.min(1,w));
}
function ventTier(t){const w=ventWeight(t);return w<0.33?1:w<0.6?2:3}
function ventTone(t){for(const k in VENT_TONE){ if(VENT_TONE[k].some(w=>t.indexOf(w)>=0)) return k; } return null}
/* 按句切分，句末标点跟着句子一起留下：情绪分里「！」本身就是权重 */
function ventChunks(text){
  const out=[];
  const push=s=>{
    s=String(s).replace(/^[\s，,、]+/,'').replace(/\s+$/,'');
    if(s.replace(/[。；;！!？?，,、\s]/g,'')) out.push(s);
  };
  (String(text||'').match(/[^。；;！!？?\n]+[。；;！!？?\n]*/g)||[]).forEach(seg=>{
    seg=seg.trim(); if(!seg) return;
    if(seg.length<=18){ push(seg); return; }
    const tm=seg.match(/[。；;！!？?\n]+$/), tail=tm?tm[0]:'';
    const body=tail?seg.slice(0,seg.length-tail.length):seg;
    const pieces=body.split(/[，,、]/).map(x=>x.trim()).filter(Boolean);
    pieces.forEach((p,i)=>{ push(i===pieces.length-1?p+tail:p); });
  });
  return out;
}
function ventDrop(el){
  if(el&&el.parentNode) el.parentNode.removeChild(el);
  if(ventLast===el) ventLast=null;
  if(ventLiveEl===el) ventLiveEl=null;
}
function ventClear(){
  const f=$('#ventField');
  if(f) f.querySelectorAll('.vf').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
  ventUsed=[];ventLast=null;ventLiveEl=null;ventDoneText='';ventSeq=0;ventGen++;
}
/* 找位置：先量尺寸，再在空位里挑「离已有句子最远」的一个，避免字句挤成一条竖列 */
function ventFindSpot(field,el,w,h){
  const W=field.clientWidth,H=field.clientHeight,pad=7,gapY=9;
  const cols=w>W*0.5?1:(w>W*0.34?2:3);
  const stepY=h+gapY, rows=Math.max(1,Math.floor((H-h)/stepY)+1);
  const cands=[];
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const span=cols===1?0:(W-w)/(cols-1);
      cands.push({x:cols===1?0:Math.min(W-w,c*span), y:Math.min(H-h,r*stepY)});
    }
  }
  for(let i=cands.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=cands[i];cands[i]=cands[j];cands[j]=t; }
  const rects=[];
  field.querySelectorAll('.vf').forEach(v=>{ if(v!==el) rects.push({x:v.offsetLeft,y:v.offsetTop,w:v.offsetWidth,h:v.offsetHeight}); });
  /* 角落的环境小元素也算障碍，否则云朵会压在句子上 */
  field.querySelectorAll('.deco').forEach(d=>{ rects.push({x:d.offsetLeft,y:d.offsetTop,w:d.offsetWidth,h:d.offsetHeight}); });
  const free=[];
  for(const c of cands){
    const x=Math.max(0,Math.min(W-w,c.x+(Math.random()*10-5)));
    const y=Math.max(0,Math.min(H-h,c.y+(Math.random()*6-3)));
    let hit=false;
    for(const r of rects){
      if(x<r.x+r.w+pad && x+w+pad>r.x && y<r.y+r.h+6 && y+h+6>r.y){ hit=true; break; }
    }
    if(!hit) free.push({x:x,y:y});
  }
  if(free.length){
    let best=free[0],bestScore=-1;
    for(const c of free){
      const cx=c.x+w/2,cy=c.y+h/2;
      let minD=1e6;
      for(const r of rects){
        const d=Math.sqrt((cx-(r.x+r.w/2))*(cx-(r.x+r.w/2))+(cy-(r.y+r.h/2))*(cy-(r.y+r.h/2))*0.72);
        if(d<minD) minD=d;
      }
      const score=(rects.length?minD:0)+Math.random()*22;
      if(score>bestScore){ bestScore=score; best=c; }
    }
    return {x:Math.round(best.x),y:Math.round(best.y)};
  }
  /* 位子用满：让最先来的那句先退场，直接占它的位置 */
  const old=field.querySelector('.vf:not(.vf-last)');
  if(old){ const x=old.offsetLeft,y=old.offsetTop; ventDrop(old); return {x:x,y:y}; }
  return {x:0,y:0};
}
function ventSpawn(text){
  const field=$('#ventField'); if(!field) return null;
  const t=String(text||'').trim(); if(!t) return null;
  const tier=ventTier(t);
  const shown=t.replace(/[。；;，,、]+$/,'');   /* 句末的句号逗号不显示，问号感叹号保留 */
  const el=document.createElement('span');
  el.className='vf w'+tier+(shown.length>=14?' long':'');
  const inner=document.createElement('span');
  inner.className='vf-in';
  inner.innerHTML=tier===3?'<span class="vf-hi">'+esc(shown)+'</span>':esc(shown);
  el.appendChild(inner);
  el.style.visibility='hidden';
  field.appendChild(el);
  const pos=ventFindSpot(field,el,el.offsetWidth,el.offsetHeight);
  el.style.setProperty('--x',pos.x+'px');
  el.style.setProperty('--y',pos.y+'px');
  el.style.setProperty('--rot',(Math.random()*4-2).toFixed(1)+'deg');
  const hold=[0.45,1.9,4.4][tier-1]*(0.85+Math.random()*0.3);
  const fade=[1.8,3.2,4.6][tier-1]*(0.85+Math.random()*0.3);
  el.style.setProperty('--hold',hold.toFixed(2)+'s');
  el.style.setProperty('--fade',fade.toFixed(2)+'s');
  if(tier>=2){
    const tone=ventTone(t)||(Math.random()<0.5?'spark':null);
    if(tone){
      const e=document.createElement('i');
      e.className='ii ii-'+tone+' vf-el';
      e.setAttribute('aria-hidden','true');
      e.style.left=(tier===3?62+Math.random()*26:72+Math.random()*14)+'%';
      e.style.top=(tier===3?-24-Math.random()*14:-16)+'px';
      inner.appendChild(e);
    }
  }
  el.style.visibility='';
  if(ventLast) ventLast.classList.remove('vf-last');   /* 上一句从这一刻开始计时淡出 */
  el.classList.add('vf-last');
  ventLast=el;
  inner.addEventListener('animationend',ev=>{
    if(ev.target!==inner) return;
    ventDrop(el);
  });
  ventSeq++;
  ventRipple();
  return el;
}
/* 打字时同一个句子就地长大，不重复占位 */
function ventUpdate(el,text){
  if(!el) return;
  const tier=ventTier(text);
  const shown=String(text||'').replace(/[。；;，,、]+$/,'');
  if(el.className.indexOf('w'+tier)<0){
    el.style.setProperty('--hold',[0.45,1.9,4.4][tier-1]+'s');
    el.style.setProperty('--fade',[1.8,3.2,4.6][tier-1]+'s');
  }
  const cls='vf w'+tier+(shown.length>=14?' long':'')+' vf-last';
  if(el.className!==cls) el.className=cls;
  const inner=el.querySelector('.vf-in'); if(!inner) return;
  inner.innerHTML=tier===3?'<span class="vf-hi">'+esc(shown)+'</span>':esc(shown);
}
function ventRipple(){
  const r=$('.vent-rec .vent-ring'); if(!r) return;
  r.classList.remove('go'); void r.offsetWidth; r.classList.add('go');
}
function ventSeed(){
  const draft=state.draft||'';
  const m=draft.match(/^[\s\S]*[。；;！!？?，,\n]/);      /* 已写完的部分按句落位 */
  const committed=m?m[0]:'';
  const gen=++ventGen;
  const parts=ventChunks(committed).slice(-8);
  parts.forEach((p,i)=>{ setTimeout(()=>{ if(gen===ventGen&&!state.recording&&$('#ventField')) ventSpawn(p); },i*110); });
  ventDoneText=committed;
  const tail=draft.slice(committed.length).replace(/\s+/g,'');
  if(tail.length>=2) setTimeout(()=>{ if(gen===ventGen&&!state.recording&&$('#ventField')) ventLiveEl=ventSpawn(tail); },parts.length*110+70);
}
function ventSyncText(){
  const draft=state.draft||'';
  if(!draft.trim()){ ventClear(); return; }
  const m=draft.match(/^[\s\S]*[。；;！!？?，,\n]/);      /* 到最后一个标点为止算写完 */
  const committed=m?m[0]:'';
  if(committed.length>ventDoneText.length){
    ventChunks(committed.slice(ventDoneText.length)).forEach(p=>ventSpawn(p));
    ventDoneText=committed;
  }else if(committed.length<ventDoneText.length){
    ventDoneText='';
  }
  const tail=draft.slice(committed.length).replace(/\s+/g,'');
  if(tail.length>=2){
    if(ventLiveEl&&ventLiveEl.parentNode) ventUpdate(ventLiveEl,tail);
    else ventLiveEl=ventSpawn(tail);
  }
}
function ventAppend(text){
  const parts=ventChunks(text); if(!parts.length) return;
  parts.forEach((p,i)=>{
    if(i===0){ ventSpawn(p); return; }
    setTimeout(()=>{ if(state.recording&&$('#ventField')) ventSpawn(p); },i*300);
  });
  state.draft=(state.draft?state.draft.replace(/[。；;，,]+$/,'')+'。':'')+parts.join('。')+'。';
  save();
  const c=$('#dumpCount'); if(c) c.textContent=state.draft.length+' 字';
}
function ventFlag(on){
  const f=$('#ventSrc'); if(f) f.hidden=!on;
}
/* 真机有语音识别就走真识别；不支持或没授权时退回演示文本并明确标出 */
function ventTryMic(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){ ventFlag(true); return; }
  try{
    const rec=new SR();
    rec.lang='zh-CN'; rec.continuous=true; rec.interimResults=true;
    rec.onresult=e=>{
      let fin='';
      for(let i=e.resultIndex;i<e.results.length;i++){ if(e.results[i].isFinal) fin+=e.results[i][0].transcript; }
      if(fin.trim()){ ventReal=true; ventFlag(false); ventAppend(fin); }
    };
    rec.onerror=()=>{ ventReal=false; ventFlag(true); };
    rec.onend=()=>{ if(state.recording&&!ventReal) ventFlag(true); };
    rec.start();
    ventSR=rec; ventReal=true; ventFlag(false);
  }catch(err){ ventSR=null; ventReal=false; ventFlag(true); }
}
function ventBegin(){
  if(ventTimer) clearInterval(ventTimer);
  ventNextAt=0.6;
  ventTryMic();
  ventTimer=setInterval(ventTick,250);
}
function ventStop(){
  if(ventTimer){ clearInterval(ventTimer); ventTimer=null; }
  if(ventSR){ try{ ventSR.stop(); }catch(e){} ventSR=null; }
  ventReal=false; ventFlag(false);
}
function ventTick(){
  if(!state.recording) return;
  const t=(Date.now()-state.recordStartedAt)/1000;
  const clk=$('#heatClock'); if(clk) clk.textContent=fmt(Math.floor(t));
  const lead=$('#heatLead');
  if(lead){ let s=VENT_LEADS[0].s; VENT_LEADS.forEach(l=>{ if(t>=l.at) s=l.s; }); if(lead.textContent!==s) lead.textContent=s; }
  if(!ventReal&&t>=ventNextAt){                      /* 演示文本：也按正常语速落句 */
    ventAppend(VENT_DEMO[ventDemoN%VENT_DEMO.length]);
    ventDemoN++;
    ventNextAt=t+0.85+Math.random()*1.35;
  }
}
function bindVent(){
  const field=$('#ventField'); if(!field){ ventStop(); return; }
  if(state.inputMode==='text'&&!state.recording){
    ventStop(); ventDoneText='';
    if(state.draft.trim()) ventSeed(); else ventClear();
    return;
  }
  if(state.recording){ ventDoneText=state.draft||''; ventBegin(); return; }
  ventStop(); ventClear();
}

function render(){
  const first=state.onboard<4;
  const ritualMain=!first&&!panel&&state.tab===0&&!state.planConfirmed;
  const immersive=ritualMain&&state.stage==='closed',processing=ritualMain&&state.stage==='analyzing';
  $('.phone').classList.toggle('ritual-dark',immersive);
  $('.nav').hidden=first||!!panel||immersive||processing;
  const NAV_ICON=['power','calendar','chart','gear'];
  $('.nav').innerHTML=['下班','今晚','仪表盘','设置'].map((n,i)=>`<button data-tab="${i}" class="${state.tab===i?'active':''}" ${state.tab===i?'aria-current="page"':''}>${ic(NAV_ICON[i])}<span>${n}</span></button>`).join('');
  const ambientBar=$('#ambient');
  if(ambientBar){
    /* v10：没选过白噪音时右上角完全留空；选了之后才常驻显示 */
    const hasSound=!!state.sound||!!audio;
    const show=!first&&!(immersive||processing)&&(hasSound||state.soundPick);
    ambientBar.hidden=!show;
    $('.phone').classList.toggle('amb-on',show);
    /* 没有音在放时，容器不套胶囊壳：收起态是一枚圆钮，点开是选择面板 */
    ambientBar.classList.toggle('is-plain',show&&!audio);
    if(show) ambientBar.innerHTML=audio
      ? `<span class="ambient-icon" id="ambientName" role="img" aria-label="${esc(state.sound||'白噪音')}">${ic(soundIcon(state.sound))}</span><button class="ambient-btn" data-action="toggleSound" aria-label="${audioPaused?'继续播放白噪音':'暂停白噪音'}">${ic(audioPaused?'play':'pause')}</button><button class="ambient-btn" data-action="audio" aria-label="停止白噪音">${ic('close')}</button>`
      : state.soundPick
        ? `<div class="ambient-pick"><div class="ambient-pick-head"><span>${ic('sound')}白噪音</span><button class="ambient-btn" data-action="closeSound" aria-label="收起白噪音">${ic('close')}</button></div>${soundscapes.map(([nm,icon])=>`<button class="ambient-opt" data-amb-sound="${nm}">${ic(icon)}<span>${nm}</span></button>`).join('')}</div>`
        : `<button class="ambient-dot" data-action="openSound" aria-label="选择白噪音" aria-expanded="false">${ic('sound')}</button>`;
  }
  let html;
  if(first)html=onboarding();
  else if(panel==='recommendation')html=recommendationPlaceholder();
  else if(panel==='edit')html=editScreen();
  else if(panel==='prefs')html=prefsScreen();
  else if(panel==='schedule')html=journeyScreen();
  else if(state.tab===3)html=prefsScreen();
  else if(state.tab===1)html=journeyScreen();
  else if(state.tab===2)html=journeyRecovery();
  else if(state.planConfirmed&&state.stage!=='planning')html=restScreen();
  else if(state.stage==='active')html=activeScreen();
  else if(state.stage==='complete')html=`<div class="shape" aria-hidden="true">✓</div><h2 class="center">给自己一点时间，<br>就很好。</h2><div class="card green center"><h3>充电池 +15%</h3></div><div class="page-action">${button('回到今晚日程','schedule')}<div class="center">${button('查看恢复','dashboard','link')}</div></div>`;
  else if(state.stage==='schedule')html=shutdownScreen();
  else if(state.stage==='shutdown')html=shutdownScreen();
  else if(state.stage==='sealed')html=sealedScreen();
  else if(state.stage==='analyzing')html=analyzingScreen();
  else if(state.stage==='closed')html=closedScreen();
  else if(state.stage==='planning')html=planningScreen();
  else if(state.stage==='transit')html=transitScreen();
  else if(state.stage==='ready')html=readyScreen();
  else html=relaxationScreen();
  const scClass=(state.stage==='shutdown'?'vent-screen':'')+((first&&state.onboard===0)?' onb-screen':'')+((state.tab===1&&state.journeyMode==='detail'&&!panel)?' detail-screen':'');
  $('#screen').innerHTML=`<div class="screen-content ${state.stage==='planning'&&state.tab===0&&!panel?'plan-confirm':''} ${ritualMain?'ritual-'+state.stage:''} ${scClass}">${html}</div>`;
  const content=$('#screen .screen-content');if(state.stage==='planning'&&state.tab===0&&!panel)content.classList.add('builder-screen');
  let footer=content.querySelector('.page-action');
  if(!footer&&!immersive){const primary=content.querySelector('.primary:not(.ritual-mic)');if(primary){footer=document.createElement('div');footer.className='page-action';footer.append(primary)}}
  if(footer)$('#screen').append(footer);
  const upcoming=content.querySelector('.schedule-item.current');
  if(upcoming)upcoming.scrollIntoView({block:'nearest'});
  bindJourneyUI();bindBuilderUI();bindVent();
  const card=$('#combo-card');if(card){let x;card.addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});card.addEventListener('touchend',e=>{let d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)choose((state.combo+(d<0?1:2))%3)},{passive:true})}
}
function choose(i){const prev=state.combo,oldItems=state.planItems?.map(x=>({...x}));state.combo=i;if(state.planItems){const item=state.planItems.find(x=>x.kind==='relax');if(item)Object.assign(item,{combo:i,title:combos[i].title,mins:combos[i].mins})}if(timeline().error){state.combo=prev;state.planItems=oldItems||null;toast('今晚时间较紧，请先调整日程。');return}state.booked=false;save();render()}
function modal(content,hasPrimary=false){$('#dialog').innerHTML=content+button(hasPrimary?'取消':'关闭','close',hasPrimary?'link':'primary');$('#dialog').showModal()}
function stopAudio(){if(audio){audio.close();audio=null}audioPaused=false}
function togglePause(){if(!audio)return;if(audioPaused){try{audio.resume()}catch(e){}audioPaused=false}else{try{audio.suspend()}catch(e){}audioPaused=true}render()}
function playAudio(){try{stopAudio();audioPaused=false;audio=new(window.AudioContext||window.webkitAudioContext)();const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+.025*(Math.random()*2-1))/1.025;data[i]=last*3}const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=({雨声:1200,海浪:450,篝火:1800,车厢白噪音:900,夜风:320,铁轨:700}[state.sound]||800);const gain=audio.createGain();gain.gain.value=.3;source.connect(filter).connect(gain).connect(audio.destination);source.start()}catch{stopAudio();toast('当前浏览器无法播放音频')}}
function shutdownSound(){try{const ac=new(window.AudioContext||window.webkitAudioContext)(),buffer=ac.createBuffer(1,Math.floor(ac.sampleRate*.25),ac.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3);const source=ac.createBufferSource();source.buffer=buffer;const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=420;const gain=ac.createGain();gain.gain.value=.12;source.connect(filter).connect(gain).connect(ac.destination);source.start();setTimeout(()=>ac.close(),350)}catch{}}
function sync(){if(!state.running||state.stage!=='active')return;state.remaining=Math.max(0,state.seconds-Math.floor((Date.now()-state.startedAt)/1000));if(!state.remaining)complete();else if($('#clock'))$('#clock').textContent=fmt(state.remaining)}
function syncRemaining(){if(state.running)state.remaining=Math.max(0,state.seconds-Math.floor((Date.now()-state.startedAt)/1000))}
function complete(){if(state.journeyTimer){finishJourney();return}if(state.done)return;syncRemaining();const elapsed=state.sessionLength-state.remaining;set({stage:'complete',running:false,done:true,eveningDone:[...new Set([...state.eveningDone,state.activeKey||'relax'])],energy:Math.min(100,state.energy+15),sessions:state.sessions+1,totalRelax:state.totalRelax+elapsed})}
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value}
function arrangeDump(text){const frags=String(text||'').split(/[。；;\n，,]+/).map(s=>s.trim()).filter(Boolean);const ACTION=/(开会|会议|评审|汇报|提交|回复|回邮件|回信|回消息|发给|发邮件|寄|报销|排期|对接|跟进|推进|交付|上线|确认|修改|改完|改一下|写完|补齐|补|联系|约|面谈|面试|对账|结账|取|买|订|整理|归档|填|沟通|同步|过一遍|过一下|看一眼|看一下|拿去|带上|提醒|汇报|回个话)/;const OPEN=/(没做完|还没|没有做|没弄完|没完成|未完成|没回|没发|没交|没确认|搁置|欠|差|剩下|遗留|半途|断了|停在这)/;const FUTURE=/(明天|后天|大后天|下周|下个月|月底|月初|周一|周二|周三|周四|周五|周六|周日|周[一二三四五六日天]|礼拜|下午|上午|早上|晚上|之后|之前|以前)/;const MOOD=/^(好烦|烦|好累|累|难受|不舒服|堵|委屈|emo|开心|高兴|生气|无语|烦死|太累|无聊|焦虑|崩溃|算了|不想|麻)/;const done=frags.find(s=>/(整理好|重新排|完成了|做完了|已经|搞定了|收尾)/.test(s)&&!OPEN.test(s));const tasks=frags.filter(s=>s!==done&&!MOOD.test(s)&&(OPEN.test(s)||(ACTION.test(s)&&FUTURE.test(s)))).map(s=>s.replace(/^(明天|后天|今天|然后|还有|另外|接下来|下午|上午|晚上)[、，]?/,'').replace(/^(要|得|需要|记着|记得)/,'').trim()).filter(Boolean);return {tasks,achievement:done||'你把今天认真过了一遍。'}}
function processDump(){if(!state.draft.trim())return;const result=arrangeDump(state.draft);set({stage:'analyzing',recording:false,sealed:true,vaultTasks:result.tasks,achievement:result.achievement});clearTimeout(analysisTimer);analysisTimer=setTimeout(()=>{if(state.stage==='analyzing')set({stage:'sealed'})},1200)}
function record(){
  if(!state.recording){
    ventClear();
    set({recording:true,recordStartedAt:Date.now(),recordSeconds:0,draft:''});
    return;
  }
  state.recordSeconds=Math.floor((Date.now()-state.recordStartedAt)/1000);
  const spoken=(state.draft||'').trim();
  if(state.recordSeconds<3)toast('再说两句也可以，不着急');
  if(!spoken)state.draft='今天把会议框架重新排了一遍。明天给王姐回排期邮件；改完 Q3 复盘框架；确认周五评审的会议室。';
  processDump();
}
function ritualTick(){
  if(state.stage==='transit'&&state.breathing&&state.breathStartedAt){
    const elapsed=(Date.now()-state.breathStartedAt)/1000,round=Math.floor(elapsed/19);
    if(round>=4){state.breathing=false;save();if(state.tab===0)render();return}
    const phase=elapsed%19,word=$('#breathWord'),label=$('#breath-label'),face=$('#breathIcon');
    if(word)word.textContent=phase<4?'吸气':phase<11?'屏住':'呼气';
    if(label)label.textContent=(phase<4?'慢慢吸满':phase<11?'停一下，别急着吐':'缓缓吐出来')+' · 第 '+(round+1)+' 轮';
    /* 吸气与屏住都是「向内收拢」那枚；呼气换成向外散开的那枚 */
    if(face){const want='ii breath-face ii-'+(phase<11?'inhale':'exhale');if(face.className!==want)face.className=want;}
  }
}
function editableItems(){return panel==='edit'?editor:materializePlan()}
function openActivity(id){
  const item=editableItems().find(i=>i.id===id);if(!item)return;activityEdit=id;
  const picks=recommendations[item.kind];
  let content=`<h3>调整${esc(item.title)}</h3>`;
  if(picks)content+=`<fieldset class="recommend-options"><legend>${item.kind==='tv'?'想看哪部剧？':'想读什么？'}</legend>${picks.map(r=>`<label><input type="radio" name="content-choice" value="${r.id}" ${item.recommendation===r.id?'checked':''}><div><strong>《${r.title}》</strong><small>${r.note}</small><a class="source-link" href="${r.url}" target="_blank" rel="noopener">了解${item.kind==='tv'?'剧集':'这本书'} ↗</a></div></label>`).join('')}<label><input type="radio" name="content-choice" value="own" ${!picks.some(r=>r.id===item.recommendation)?'checked':''}><div><strong>我自己选</strong></div></label></fieldset><div id="own-content" ${item.recommendation==='own'?'':'hidden'}><label for="custom-content">${item.kind==='tv'?'自己的剧名':'自己的书名'}</label><input id="custom-content" value="${esc(item.customContent||'')}" placeholder="想看的内容"></div>`;
  else if(item.kind==='relax')content+=`<label for="relax-choice">放松方式</label><select id="relax-choice">${combos.map((c,i)=>`<option value="${i}" ${Number(item.combo??state.combo)===i?'selected':''}>${c.title}</option>`).join('')}</select>`;
  else content+=`<label for="activity-title">活动内容</label><input id="activity-title" maxlength="40" value="${esc(item.title)}">`;
  content+=`<label for="activity-minutes">安排多久？</label><div class="unit-input"><input type="number" id="activity-minutes" min="5" max="180" step="5" value="${item.mins}"><span>分钟</span></div><p id="activity-preview" class="hint"></p><p id="activity-error" class="error" role="alert"></p>${button('应用到日程','applyActivity')}${item.kind!=='winddown'?button('从今晚移除','removeActivity','link'):''}`;
  modal(content,true);previewActivity();
}
function previewActivity(){const input=$('#activity-minutes');if(!input||!activityEdit)return;const duration=Number(input.value),items=editableItems().map(i=>i.id===activityEdit?{...i,mins:duration}:i);const plan=timeline(state.night||state.prefs,items);$('#activity-preview').textContent=plan.error||`修改后还留有 ${plan.free} 分钟弹性时间，后续活动自动衔接。`;$('#activity-preview').className=plan.error?'error':'hint'}
function applyActivity(){
  const items=editableItems(),index=items.findIndex(i=>i.id===activityEdit);if(index<0)return;const original=items[index],item={...original},duration=Number($('#activity-minutes').value);
  if(!Number.isInteger(duration)||duration<5||duration>180){$('#activity-error').textContent='请填写 5–180 的整数分钟。';return}item.mins=duration;
  if(recommendations[item.kind]){item.recommendation=selected('content-choice');item.customContent=item.recommendation==='own'?$('#custom-content').value.trim():'';if(item.recommendation==='own'&&!item.customContent){$('#activity-error').textContent='请填入想看的内容。';return}}
  else if(item.kind==='relax'){item.combo=Number($('#relax-choice').value);item.title=combos[item.combo].title;}
  else{item.title=$('#activity-title').value.trim();if(!item.title){$('#activity-error').textContent='请填写活动内容。';return}}
  items[index]=item;$('#dialog').close();activityEdit=null;pendingAdded=null;if(panel!=='edit')save();render();toast('这项安排已更新');
}
function openAddActivity(){modal(`<h3>给今晚加一点喜欢的事。</h3><div class="activity-palette">${[['tv','看一段剧','推荐《去有风的地方》'],['read','读一会儿书','推荐《小王子》'],['walk','出去散步','走一条熟悉的路'],['relax','身体放松','抬腿、泡脚或轻微动作'],['custom','自己安排','喝茶、听音乐、和朋友聊天…']].map(([kind,title,note])=>`<button data-add-kind="${kind}"><strong>${title}</strong><small>${note}</small></button>`).join('')}</div>`) }
function addActivity(kind){const items=editableItems(),templates={tv:{title:'看剧',mins:30,recommendation:'wind'},read:{title:'阅读',mins:20,recommendation:'prince'},walk:{title:'楼下散步',mins:10},relax:{title:combos[state.combo].title,mins:20,combo:state.combo},custom:{title:'喝茶听音乐',mins:15}};const item={id:kind+'-'+Date.now(),kind,...templates[kind]};items.splice(Math.max(0,items.findIndex(i=>i.kind==='winddown')),0,item);pendingAdded=item.id;$('#dialog').close();render();openActivity(item.id)}
function cancelActivity(){if(pendingAdded){const items=editableItems(),i=items.findIndex(x=>x.id===pendingAdded);if(i>=0)items.splice(i,1);pendingAdded=null;if(panel!=='edit')save();render()}activityEdit=null;}
function moveActivity(id,direction){const i=editor.findIndex(x=>x.id===id),j=i+direction;if(i<0||j<0||j>=editor.length||editor[i].kind==='winddown'||editor[j].kind==='winddown')return;[editor[i],editor[j]]=[editor[j],editor[i]];render()}
function editBoundary(){const p=state.night||state.prefs;modal(`<h3>今晚的时间边界</h3>${timesForm(p,true)}${button('保存时间','saveBoundary')}`,true)}
const actions={
  introNext:()=>set({introPage:Math.min(state.introPage+1,INTRO_PAGES.length-1)}),
  introBack:()=>set({introPage:Math.max(0,state.introPage-1)}),
  introSkip:()=>set({onboard:1}),
  onboardStart:()=>set({onboard:1}),onboardBack:()=>set({onboard:Math.max(0,state.onboard-1)}),
  onboardTimes:()=>{const p=readTimes();if(p){const err=timeline({...p,dinner:'ready'},null).error;if(err){$('#form-error').textContent=err;return}set({prefs:p,onboard:2})}},
  onboardHome:()=>{const cooking=selected('cooking');set({prefs:{...state.prefs,cooking,walk:selected('walk')==='yes',dinner:cooking==='yes'?'cook':'ready'},onboard:3})},
  onboardFinish:()=>{const cooking=selected('cooking'),walk=selected('walk')==='yes',dinner=cooking==='yes'?'cook':cooking==='no'?'ready':state.prefs.dinner,prefs={...state.prefs,cooking,walk,dinner};const err=timeline(prefs,null).error;if(err){set({onboard:1});$('#form-error').textContent=err;return}set({prefs,onboard:4,stage:'shutdown',tab:0})},
  editPlan:()=>{editor=materializePlan().map(i=>({...i}));returnPanel=panel;panel='edit';render()},
  cancelEdit:()=>{panel=returnPanel;editor=null;render()},
  savePlan:()=>{if(timeline(state.night||state.prefs,editor).error)return;state.planItems=editor.map(i=>({...i}));panel=returnPanel;editor=null;save();render();toast('今晚顺序已更新')},
  editBoundary,addActivity:openAddActivity,applyActivity,
  removeActivity:()=>{const items=editableItems(),i=items.findIndex(x=>x.id===activityEdit);if(i>=0&&items[i].kind!=='winddown')items.splice(i,1);$('#dialog').close();activityEdit=null;pendingAdded=null;if(panel!=='edit')save();render();toast('已从今晚移除')},
  saveBoundary:()=>{const p={...(state.night||state.prefs),off:$('#off').value,bed:$('#bed').value,commute:Number($('#commute').value)};if(!p.off||!p.bed||!Number.isFinite(p.commute)||p.commute<5||p.commute>180){$('#form-error').textContent='请填写时间，通勤时长为 5–180 分钟。';return}if(timeline(p,editableItems()).span>960){$('#form-error').textContent='请把睡觉时间设在下班后的 16 小时内。';return}state.night=p;$('#dialog').close();save();render()},
  prefs:()=>{panel=null;set({tab:3})},
  savePrefs:()=>{const p=readTimes();if(!p)return;const cooking=selected('cooking');Object.assign(p,{cooking,walk:selected('walk')==='yes',dinner:cooking==='no'?'ready':cooking===state.prefs.cooking?p.dinner:cooking==='yes'?'cook':'ready'});const err=timeline(p,null).error;if(err){$('#form-error').textContent=err;return}state.prefs=p;save();render();toast('设置已保存')},
  panelBack:()=>{panel=null;render()},schedule:()=>{panel=null;set({tab:1,journeyMode:'overview'})},startShutdown:()=>set({stage:'shutdown',tab:0}),resumeTransit:()=>set({stage:'transit',tab:0}),
  returnMain:()=>{panel=null;set({tab:0})},
  reviewPlan:beginBuilder,
  confirmPlan:()=>{materializePlan();if(timeline().error){toast('请缩短或移除一项活动');return}set({planConfirmed:true,booked:true,stage:'ready',tab:1,journeyMode:'overview',journeyKey:null,journeyOriginals:{},journeyAlts:{},arrived:true,night:{...(state.night||state.prefs)}})},
  beginActivity:()=>{const r=currentEvening();if(!r)return actions.endEvening();if(r.kind==='relax'){actions.start(r);return}set({activity:r.key})},
  finishActivity:()=>{const key=state.activity,kind=timeline().rows.find(r=>r.key===key)?.kind;set({activity:null,eveningDone:[...new Set([...state.eveningDone,key])],eveningEnded:kind==='winddown'});},
  backToPlan:()=>set({activity:null}),endEvening:()=>set({eveningEnded:true,activity:null}),
  record,processDump,
  textMode:()=>set({inputMode:'text',recording:false}),voiceMode:()=>set({inputMode:'voice',recording:false}),
  skipseal:()=>set({stage:'sealed',sealed:false,recording:false,vaultTasks:[],achievement:'今天的工作，到这里就好。'}),
  vault:()=>modal(`<h3>明日待办</h3><p>明天 09:00 自动导入备忘录，收好的待办会生成一份清单。</p><div class="card">${state.vaultTasks.length?state.vaultTasks.map(t=>'· '+esc(t)).join('<br>'):esc(state.draft)||'今天没有留下事项。'}</div>`),
  shutdown:()=>{shutdownSound();set({stage:'closed',tab:0,night:state.night||{...state.prefs},personalStart:state.personalStart||Date.now()})},
  enterTransit:()=>set({stage:'transit',tab:0,transitVisited:true,transitStep:'sound',breathing:false}),
  transitNext:()=>set({transitStep:'breathe',breathing:false}),
  transitBack:()=>set({transitStep:'sound',breathing:false}),
  skipSound:()=>{stopAudio();set({sound:'',soundPick:false,transitStep:'breathe',breathing:false})},
  toggleBreathing:()=>set({breathing:!state.breathing,breathStartedAt:Date.now()}),
  home:()=>{if(!state.planConfirmed){actions.reviewPlan();return}set({stage:'home',arrived:true,tab:1,activity:null})},prev:()=>choose((state.combo+2)%3),next:()=>choose((state.combo+1)%3),
  start:(row)=>{const r=row?.kind?row:timeline().rows.find(r=>r.kind==='relax');const seconds=(r?.duration||combos[state.combo].mins)*60;set({stage:'active',tab:0,arrived:true,combo:r?.combo??state.combo,activeKey:r?.key||'relax',activeTitle:r?.title||combos[state.combo].title,remaining:seconds,seconds,sessionLength:seconds,running:true,startedAt:Date.now(),done:false})},
  pause:()=>{syncRemaining();set(state.running?{running:false,seconds:state.remaining}:{running:true,seconds:state.remaining,startedAt:Date.now()})},
  finish:()=>modal(`<h3>结束这次放松？</h3><p>这段休息会记下来。</p>${button('结束并记录','confirmfinish')}`,true),
  confirmfinish:()=>{$('#dialog').close();complete()},
  exit:()=>modal(`<h3>退出本次放松？</h3><p>这次计时不计入恢复记录。</p>${button('确认退出','confirmexit')}`,true),confirmexit:()=>{$('#dialog').close();set({stage:'home',running:false,remaining:null})},
  dashboard:()=>set({tab:2}),again:()=>set({stage:'home',done:false,booked:false}),close:()=>{cancelActivity();$('#dialog').close()},
  audio:()=>{audio?stopAudio():playAudio();render()},
  openSound:()=>set({soundPick:true}),
  closeSound:()=>set({soundPick:false}),
  toggleSound:()=>togglePause(),
  route:()=>modal(`<h3>今晚走一条熟悉的路。</h3><div class="card green"><strong>约 15 分钟 · 800 米</strong><p>从小区门口走 5 分钟，再慢慢折返。</p></div><p class="hint">未读取真实位置，路线不用于实际导航。</p>`),
  mood:()=>modal(`<h3>今天醒来，感觉怎样？</h3>${choices('mood',[['还想歇歇','还想歇歇'],['还不错','还不错'],['挺有精神','挺有精神']],state.mood||'还不错')}${button('记录感受','saveMood')}`,true),
  saveMood:()=>{set({mood:selected('mood')});$('#dialog').close();toast('已记录')},
  resetconfirm:()=>{clearTimeout(analysisTimer);stopAudio();ventStop();ventClear();ventUsed=[];ventDemoN=0;state=defaults();panel=null;editor=null;pendingAdded=null;activityEdit=null;clearTimeout(window.toastTimer);$('#toast').hidden=true;save();$('#dialog').close();render()}
};
Object.assign(actions,{openJourney:()=>{const row=journeyCurrent();if(row)journeySelect(row.key)},journeyBack:()=>{settleJourneyTimer();set({journeyMode:'overview',stage:'ready'})},startJourney,finishJourney,journeyAgain,adjustJourney:beginBuilder,replanJourney:beginBuilder,builderNext,builderBack,recommendationBack:()=>{panel=null;render()},builderConfirm});
actions.intro=()=>modal(`<blockquote class="offwork-slogan">你如果不主动设计你的时间，你的时间就会被别人、被算法、被惯性设计。</blockquote><h3>把工作留给明天。</h3><p>写下或说出还没放下的事，封存后关掉工作模式，在回家的路上慢慢回到生活。</p><h3 style="margin-top:24px">把今晚安排好。</h3><p>根据生活习惯，安排吃饭、散步、看剧、阅读与放松；到家后在「今晚」继续，生活习惯可在「设置」修改。</p>`);
document.addEventListener('click',e=>{const row=e.target.closest('.schedule-item[data-edit-item]');if(row&&!e.target.closest('button')){openActivity(row.dataset.editItem);return}const b=e.target.closest('button');if(!b)return;if(b.dataset.builderPeriod)set({builderPeriod:b.dataset.builderPeriod,builderFocus:null});if(b.dataset.builderFilter!==undefined)set({builderFilter:b.dataset.builderFilter});if(b.dataset.builderRemove)builderRemove(b.dataset.builderRemove);if(b.dataset.recommendKind)openRecommendation(b.dataset.recommendKind);if(b.dataset.builderOption)builderToggle(b.dataset.builderOption);if(b.dataset.journeyKey)journeySelect(b.dataset.journeyKey);if(b.dataset.journeyScore)journeyScore(Number(b.dataset.journeyScore));if(b.dataset.editItem)openActivity(b.dataset.editItem);if(b.dataset.moveItem)moveActivity(b.dataset.moveItem,Number(b.dataset.direction));if(b.dataset.addKind)addActivity(b.dataset.addKind);if(b.dataset.goto){jumpTo(b.dataset.goto);return}
if(b.dataset.ambSound){state.sound=b.dataset.ambSound;state.soundPick=false;playAudio();save();render();return}
if(b.dataset.action)actions[b.dataset.action]?.();if(b.dataset.tab!==undefined){if(state.recording){toast('请先结束倾诉');return}panel=null;set({tab:Number(b.dataset.tab)})}if(b.dataset.combo!==undefined)choose(Number(b.dataset.combo));if(b.dataset.sound){const playing=!!audio;state.sound=b.dataset.sound;if(playing||(state.stage==='transit'&&state.tab===0))playAudio();save();render()}});
document.addEventListener('input',e=>{if(e.target.id==='ritual-switch')e.target.closest('.ritual-switch').style.setProperty('--switch-progress',e.target.value+'%');if(e.target.id==='activity-minutes')previewActivity();if(e.target.id==='dump'){state.draft=e.target.value;save();ventSyncText();const b=document.querySelector('[data-action="processDump"]');if(b)b.disabled=!state.draft.trim();const c=$('#dumpCount');if(c)c.textContent=state.draft.length+' 字'}});
document.addEventListener('change',e=>{if(e.target.id==='ritual-switch'){if(Number(e.target.value)>=90)actions.shutdown();else{e.target.value=0;e.target.closest('.ritual-switch').style.setProperty('--switch-progress','0%')}}if(e.target.name==='content-choice'&&$('#own-content'))$('#own-content').hidden=e.target.value!=='own';if(e.target.type==='radio'){document.querySelectorAll(`input[name="${e.target.name}"]`).forEach(i=>i.closest('.option')?.classList.toggle('chosen',i.checked))}});
$('#reset').onclick=()=>modal(`<h3>重新体验？</h3><p>清空本地记录，从首次介绍开始。</p>${button('确认重新体验','resetconfirm')}`,true);
$('#guide').onclick=actions.intro;
$('#dialog').addEventListener('cancel',cancelActivity);
if(state.stage==='planning'&&!state.builderDraft)beginBuilder();
if(state.stage==='planning'&&state.builderFlowVersion!==2){state.builderDraft=state.builderDraft.filter(i=>i.group!==1||i===state.builderDraft.find(x=>x.group===1));state.builderDraft.forEach(i=>{if(i.group===3)i.mins=Math.min(i.mins,20)});state.builderRoundIndex=0;state.builderReview=false;state.builderFocus=null;state.builderFlowVersion=2;save()}
setInterval(()=>{sync();journeyTick();ritualTick();ventTick();if(state.running)save()},1000);
setInterval(ritualTick,250);   /* v11：呼吸相位（文字 + 图标）单独按 250ms 刷 */
render();
