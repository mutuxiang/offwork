const TIME_NUMBER_ASSETS={"10":"assets/images/89d5f617bf0658afe689.png","15":"assets/images/f9fbd063d3c6a60b0e00.png","20":"assets/images/77a69e4a82e8bc59bd98.png","25":"assets/images/d5033377f8c1177926a2.png","30":"assets/images/76388c826195fd448ad7.png","35":"assets/images/06525c2a3cc4b0e11006.png","40":"assets/images/9f0d30c7a626da5b4bc9.png","45":"assets/images/ff930d2a2079cdcafbb6.png","50":"assets/images/ce5b63a6cf0791d96cdb.png","55":"assets/images/9dd75751a87dda26c98e.png","60":"assets/images/d38870a8cbf91a41d521.png","65":"assets/images/b6a26a02fd8f2b4014d5.png"};
function durationNumber(n){const url=TIME_NUMBER_ASSETS[String(n)];return url?`<img class="duration-number" src="${url}" alt="${Number(n)}" decoding="sync">`:String(Number(n));}
const JC_TINT={dinner:'yellow',relax:'pink',tv:'pink',walk:'sage',exercise:'sage',wash:'blue',read:'sage',winddown:'cream',custom:'blue'};
function journeyRows(){return timeline().rows.filter(r=>!['commute','free','bed'].includes(r.kind))}
function journeyCurrent(){const rows=journeyRows();return (state.journeyMode==='detail'?rows.find(r=>r.key===state.journeyKey):null)||rows.find(r=>!state.eveningDone.includes(r.key))||rows[0]}

function commuteWindow(){return `<div class="road-window" aria-hidden="true"><span class="road-sun"></span><span class="road-cloud cloud-one"></span><span class="road-cloud cloud-two"></span><div class="road-hills"></div><div class="road-houses"><i></i><i></i><i></i><i></i><i></i></div><div class="road-track"></div><span class="road-window-line"></span><span class="road-sticker">慢慢回家</span></div>`;}
function commutePlanActions(){return `<div class="page-action road-actions">${button('我到家了，开始行程','home')}${button('还在路上，继续放松','commuteHub','secondary')}</div>`;}
function commuteSavedScreen(){const plan=timeline();return `<h2>今晚，就这样过。</h2><div class="summary-art-window" aria-hidden="true"><i class="ii ii-moon summary-corner-art"></i></div><div class="builder-summary">${plan.rows.filter(r=>r.kind!=='commute').map(r=>`<div>${rowIcon(r)}<span>${esc(r.title)}</span><b>${r.duration?durationNumber(r.duration)+'<span class="duration-unit">分钟</span>':''}</b></div>`).join('')}</div>${commutePlanActions()}`;}
function roadBack(action){return `<div class="road-header">${backLabel('返回',action,'hero-back')}</div>`;}
function commuteHubScreen(){return `<section class="road-hub road-choice-page">${roadBack('commuteSaved')}<h2>还在路上，<br>先松一口气。</h2><div class="ritual-sounds road-relax-choices"><button class="ritual-sound" data-action="roadPodcast"><span class="road-icon-crop" aria-hidden="true"><img class="road-new-icon road-icon-podcast" src="assets/images/27f902332118c6620ad4.png" alt=""></span><strong>听播客</strong><span>听一段喜欢的故事</span></button><button class="ritual-sound" data-action="roadBreathe">${ic('inhale')}<strong>呼吸训练</strong><span>4 轮呼吸，慢慢放松</span></button><button class="ritual-sound" data-action="roadMusic"><span class="road-icon-crop" aria-hidden="true"><img class="road-new-icon road-icon-music" src="assets/images/fda1e6d4bef88a9b5d7b.png" alt=""></span><strong>打开音乐 App</strong><span>放一首想听的歌</span></button></div></section>`;}
function commutePodcastScreen(){return `${roadBack('commuteHub')}<section class="recommendation-page-placeholder road-podcast"><h2 class="podcast-page-title">听播客</h2><p class="lead">回家路上，听点喜欢的。</p><div class="recommendation-placeholder" aria-label="播客列表">${[0,1].map(()=>`<div><i aria-hidden="true"></i><span><b></b><b></b><small>播客</small></span></div>`).join('')}</div></section><div class="page-action road-actions">${button('我到家了，开始行程','startFromRoad')}</div>`;}
function commuteLookScreen(){return `<section class="road-look-screen">${backLabel('路上放松','commuteHub','link')}<p class="road-kicker">这一小段路，只留给自己</p><h2>看看窗外，<br>让脑袋放个空。</h2>${commuteWindow()}<div class="road-noticing"><p><span>01</span>找一抹让你舒服的颜色。</p><p><span>02</span>看看远处的天空和灯光。</p><p><span>03</span>放松肩膀，不用想下一件事。</p></div></section><div class="page-action road-actions">${button('我到家了，开始行程','home')}${button('换一种放松方式','commuteHub','link')}</div>`;}

function restScreen(){if(!state.arrived)return commuteSavedScreen();return `${deco('plane','left:0;bottom:104px;width:48px;height:48px;--rot:-8deg;opacity:.6')}<div class="rest-message"><h2>不要想工作，<br>工作可以等。</h2><p>今晚的安排已经收好了。<br>你好好休息，剩下的交给明天。</p></div><div class="page-action">${button('回到今晚行程','schedule')}<div class="center">${button('重新规划今晚','replanJourney','link')}</div></div>`}
function journeyOverview(){
  /* v17：确认行程之后沿用「确认行程」那一屏的样式 —— 同一个标题、同一条时间轴、
     同一份 .builder-summary 摘要列表。从确认到今晚日程只差按钮文案。 */
  const plan=timeline();
  const rows=plan.rows.filter(r=>r.kind!=='commute');
  return `<h2>今晚，就这样过。</h2><div class="summary-art-window" aria-hidden="true"><i class="ii ii-moon summary-corner-art"></i></div><div class="builder-summary">${rows.map(r=>`<div>${rowIcon(r)}<span>${esc(r.title)}</span><b>${r.duration?durationNumber(r.duration)+'<span class="duration-unit">分钟</span>':''}</b></div>`).join('')}</div>${plan.error?`<p class="error">${plan.error}</p>`:''}<div class="page-action">${button(state.eveningEnded?'再看一件':'开始行程','openJourney','primary',!!plan.error)}<div class="center">${button('调整今晚行程','adjustJourney','link')}</div></div>`;
}
function journeySteps(row){
  if(row.steps)return row.steps;
  if(row.kind==='relax')return ['找个舒服的位置',combos[row.combo??state.combo].prep,'想结束的时候就停下来'];
  return ({dinner:['准备一顿方便的晚饭','坐下来慢慢吃','吃好后把餐具放好'],walk:['换一双舒服的鞋','走熟悉的路线','累了就慢慢回家'],wash:['放下手边的东西','洗漱，换舒服的衣服','收拾好就休息'],tv:['打开想看的剧集','看一段喜欢的内容','看到哪里都可以停'],read:['拿起想读的书','读几页，或一小段','把书签留在喜欢的地方'],winddown:['把灯调暗一点','把手机放远一些','躺下来，准备休息'],custom:['准备好需要的东西','按自己舒服的节奏来','想停就停']})[row.kind]||['找个舒服的位置','按自己的节奏来','想停就停'];
}
function journeyAlternatives(row){
  state.journeyOriginals ||= {};
  state.journeyOriginals[row.key] ||= {...row};
  row=state.journeyOriginals[row.key];
  const base={title:row.title,mins:row.duration,combo:row.combo,recommendation:row.recommendation,customContent:row.customContent,steps:row.steps};
  if(row.kind==='relax')return [base,...combos.map((c,i)=>({title:c.title,mins:c.mins,combo:i}))].filter((x,i,a)=>a.findIndex(y=>y.title===x.title)===i);
  if(recommendations[row.kind])return [base,...recommendations[row.kind].filter(r=>r.id!==row.recommendation).map(r=>({title:row.kind==='tv'?'看剧':'阅读',mins:row.duration,recommendation:r.id,customContent:''}))];
  const extras=({dinner:(state.night||state.prefs).cooking==='no'?[{title:'吃一份方便的晚饭',mins:30},{title:'热一份常备食物',mins:20}]:[{title:'做一碗简单的面',mins:30},{title:'吃点现成的',mins:25}],walk:[{title:'走熟悉的小区路线',mins:15},{title:'在家慢慢走一走',mins:10}],wash:[{title:'洗漱后换家居服',mins:15},{title:'简单洗漱，早一点休息',mins:10}],winddown:[{title:'安静躺一会儿',mins:20},{title:'睡前听一点音乐',mins:15}],custom:[{title:'喝茶听音乐',mins:15},{title:'和朋友聊聊天',mins:20}]})[row.kind]||[];
  return [base,...extras].filter((x,i,a)=>a.findIndex(y=>y.title===x.title)===i);
}
function journeyShortTitle(row){
 const title=row.title.split(/[+＋]/)[0].trim(),short={'做一顿简单晚饭':'简单晚饭','调暗灯光，安静躺一会儿':'调暗灯光','睡前听一点轻音乐':'睡前音乐','喝一杯温水，早点躺下':'喝杯温水','和朋友聊聊天':'朋友聊聊','煮一碗热汤面':'煮碗热面','热一份常备的饭':'热份晚饭','简单拉伸一下':'简单拉伸','玩一会儿游戏':'玩会游戏','写两行今天的事':'写两行字'};
 if(short[title])return short[title];if(title.length<=5)return title;
 const first=title.split(/[，,。]/)[0];if(first.length<=5)return first;
 return ({dinner:'简单晚饭',relax:'放松一下',walk:'出去走走',tv:'看一会剧',read:'读一会书',wash:'洗漱放松',winddown:'睡前放松',exercise:'锻炼一下'})[row.kind]||'自由安排';
}
function journeyOverallProgress(){const rows=journeyRows(),index=rows.findIndex(r=>r.key===journeyCurrent()?.key);return rows.length?Math.round((Math.max(0,index)+1)/rows.length*100):0}
function journeyDetail(){
  const rows=journeyRows(),row=journeyCurrent();if(!row)return journeyOverview();
  const index=rows.findIndex(r=>r.key===row.key),rec=recommendationFor(row),started=state.journeyTimer&&state.activeKey===row.key;
  const next=rows[index+1],prev=rows[index-1];
  /* v16：计时走完（remaining 归零）后按钮才变成「这一件做完了」，之前只灰着 */
  const ended=started&&!(state.remaining>0);
  const remaining=started?(state.remaining??row.duration*60):row.duration*60,progress=started?Math.max(0,Math.min(100,(1-remaining/(state.sessionLength||1))*100)):0;
  /* 两侧的卡片边只做「暗示可以滑动」的视觉提示，不接受点击，所以不加 data-journey-key */
  const peek=(r,cls)=>r?`<span class="carousel-peek ${cls} jc-tint-${JC_TINT[r.kind]||'cream'}" aria-hidden="true"></span>`:'';
  /* v18：标题与序号并进同一行（align-items:center 让两者中线对齐）；原来「45 分钟」下面
     紧跟的「45:00」是同一件事说两遍，换成这一件的起止时刻，开始计时才在原地改说剩余。 */
  return `<div class="journey-detail-head">${backLabel('今晚日程','journeyBack')}</div><section class="journey-overall" aria-label="今晚行程进度"><div class="journey-progress" id="journey-progress" role="progressbar" aria-label="今晚行程卡片浏览进度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${journeyOverallProgress()}"><i id="journey-progress-fill" style="width:${journeyOverallProgress()}%"></i></div></section><div class="carousel-window" id="journey-carousel">${peek(prev,'prev')}${peek(next,'next')}<article class="journey-card jc-tint-${JC_TINT[row.kind]||'cream'}" id="journey-card"><div class="jc-head"><h2 title="${esc(row.title)}">${esc(journeyShortTitle(row))}</h2><span class="jc-count">${String(index+1).padStart(2,'0')}/${String(rows.length).padStart(2,'0')}</span></div>${!['tv','read'].includes(row.kind)&&row.customContent?`<h3>${esc(row.customContent)}</h3>`:''}<div class="jc-timebox"><div class="journey-duration"><strong>${durationNumber(row.duration)}</strong><span>分钟</span></div><div class="jc-when"><span class="jw-state" id="journey-timer-state">${!started?'未开始':ended?'时间到了':'剩余 '+fmt(remaining)}</span></div></div><p>${esc(rec?.note||({dinner:'吃一顿舒服的饭。',walk:'不用赶路，走走就好。',wash:'让身体慢慢切换到休息。',relax:'身体放松一点，手机照常使用。',winddown:'不必努力入睡，先安静下来。'})[row.kind]||'按自己的节奏，做一点喜欢的事。')}</p><ol>${journeySteps(row).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${['dinner','tv','read','exercise'].includes(row.kind)?`<button class="link" data-recommend-kind="${row.kind}">${row.kind==='exercise'?'不知道怎么练？':row.kind==='dinner'?'不知道做什么？':row.kind==='tv'?'不知道看什么？':'不知道读什么？'}</button>`:''}${ic(activityIcon(row),'jc-art')}</article></div><div class="journey-dots" aria-label="选择活动">${rows.map((r,i)=>`<button data-journey-key="${esc(r.key)}" aria-label="第 ${i+1} 件：${esc(r.title)}" aria-current="${r.key===row.key?'step':'false'}"><i></i></button>`).join('')}</div><div class="page-action">${!started?button('开始这一件','startJourney','primary',!!timeline().error):ended?button('这一件做完了','finishJourney','primary'):button('进行中','startJourney','primary wait',true)}</div>`;
}
function journeyDone(){
  const score=state.score,allDone=!!state.eveningEnded;
  /* v10：充电池是整晚的收尾 —— 日程没跑完时只报「这一件做完了」，不出现充电池；
     充电池本身也不再套底色卡片 */
  if(!allDone){
    const left=journeyRows().filter(r=>!state.eveningDone.includes(r.key)).length;
    return `<h2>这一件，<br>做完了。</h2><p class="lead">今晚还剩 ${left} 件，慢慢来，不着急。</p><div class="page-action">${button('再做一件','journeyAgain')}<div class="center">${button('回到今晚日程','journeyBack','link')}</div></div>`;
  }
  const bk=score===null?0:score>=95?100:score>=80?90:score>=60?70:score>=40?50:30;
  return `<h2>今晚恢复了几成，<br>你自己说了算。</h2><div class="journey-battery"><div class="row"><strong class="inl">充电池 · 今日自评</strong><span>${score===null?'未选择':score+'%'}</span></div><div class="batt-figure"><i class="batt-img batt-${bk}" role="img" aria-label="充电池 ${bk}%"></i></div></div><p class="lead">${score===null?'点一下你现在感觉的位置。':'记下了，按你的感觉来。'}</p><div class="journey-score">${[[30,'三成'],[50,'五成'],[70,'七成'],[90,'九成'],[100,'满格']].map(([v,t])=>`<button data-journey-score="${v}" aria-pressed="${score===v}">${t}</button>`).join('')}</div><div class="page-action">${button('晚安','dashboard')}<div class="center">${button('回到今晚日程','journeyBack','link')}</div></div>`
}

function eveningTransition(){return `<section class="evening-transition"><div class="evening-chapters"><span>${ic('check','ii-sm')} 下班</span><i aria-hidden="true"></i><strong>安排今晚</strong></div><div class="evening-scene" aria-hidden="true"><div class="evening-window"><span class="evening-moon"></span>${ic('star','evening-star')}</div><div class="evening-sofa">${ic('sofa')}</div><span class="evening-floor"></span>${ic('spark','evening-spark')}</div><div class="evening-copy"><p class="evening-kicker">把时间，还给自己</p><h2>工作先到这里，<br>今晚轮到你了。</h2><p>趁着回家的路，把今晚安排好。<br>到家后，就能按自己的节奏开始。</p></div></section><div class="page-action">${button('开始安排今晚','beginTonight')}</div>`;}
function journeyScreen(){if(!state.planConfirmed)return `<div class="rest-message"><p class="eyebrow">今晚 · 到家后的时光</p><h2>到家后，<br>按自己的节奏来。</h2><p>先在「下班」里安排好今晚，<br>回家后就能在这里开始行程。</p></div><div class="page-action">${button('去安排今晚行程','reviewPlan')}</div>`;if(state.journeyMode==='detail')return journeyDetail();if(state.journeyMode==='done')return journeyDone();return journeyOverview()}
function settleJourneyTimer(){if(!state.journeyTimer)return;syncRemaining();const spent=Math.max(0,(state.sessionLength||0)-(state.remaining||0));state.journeySpent=(state.journeySpent||0)+spent;state.running=false;state.journeyTimer=false;}
function journeySelect(key){settleJourneyTimer();const row=journeyRows().find(r=>r.key===key);if(!row)return;set({journeyMode:'detail',journeyKey:key,tab:1,arrived:true,stage:'ready',activeKey:key,activeTitle:row.title,remaining:row.duration*60,sessionLength:row.duration*60,seconds:row.duration*60,running:false,journeyTimer:false,done:false})}
function startJourney(){const row=journeyCurrent();if(!row||timeline().error)return;const seconds=row.duration*60;set({tab:1,journeyMode:'detail',journeyTimer:true,stage:'active',activeKey:row.key,activeTitle:row.title,remaining:seconds,sessionLength:seconds,seconds,startedAt:Date.now(),running:true,done:false})}
function finishJourney(){if(!state.journeyTimer)return;syncRemaining();const elapsed=Math.max(0,state.sessionLength-state.remaining),key=state.activeKey,completed=[...new Set([...state.eveningDone,key])],allDone=journeyRows().every(r=>completed.includes(r.key));const base={tab:1,running:false,done:true,score:null,lastDoneKey:key,eveningDone:completed,sessions:state.sessions+1,totalRelax:state.totalRelax+elapsed+(state.journeySpent||0),journeySpent:0,journeyTimer:false,eveningEnded:allDone};if(allDone){set({...base,stage:'ready',journeyMode:'done'});return}const next=journeyRows().find(r=>!completed.includes(r.key)),seconds=next.duration*60;set({...base,stage:'ready',journeyMode:'detail',journeyKey:next.key,activeKey:next.key,activeTitle:next.title,remaining:seconds,sessionLength:seconds,seconds,running:false});toast('下一件 · '+next.title)}
function swapJourney(){
  const row=journeyCurrent();if(!row)return;const options=journeyAlternatives(row);if(options.length<2)return;
  const indexes=state.journeyAlts||{},next=(Number(indexes[row.key]||0)+1)%options.length,candidate=options[next],items=materializePlan().map(i=>i.id===row.key?{...i,...candidate}:i);
  const error=timeline(state.night||state.prefs,items).error;if(error){toast('这项安排超过睡前时间，可以先缩短其他活动。');return}
  settleJourneyTimer();state.planItems=items;state.journeyAlts={...indexes,[row.key]:next};journeySelect(row.key);toast('做法和时长已同步到今晚日程');
}
function journeyScore(value){set({score:value,energy:value});}
function journeyAgain(){settleJourneyTimer();const next=journeyRows().find(r=>!state.eveningDone.includes(r.key));if(next)journeySelect(next.key);else set({tab:1,journeyMode:'overview',stage:'ready'})}
function journeyTick(){if(state.journeyTimer){/* v18：交互演示 —— 今晚最后一件开始满 5 秒直接收尾，落到充电池自评 */const rows=journeyRows(),last=rows[rows.length-1];if(last&&state.activeKey===last.key&&Date.now()-state.startedAt>=5000){finishFinalJourney();return}/* v19：卡片上沿的进度条走「已走过」的比例 */const fill=$('#journey-progress-fill');if(fill)fill.style.width=journeyOverallProgress()+'%'}}
function bindJourneyUI(){animateJourneyProgress();const carousel=$('#journey-carousel'),card=$('#journey-card');if(!carousel||!card)return;let startX=null,startY=0,drag=0;
 card.addEventListener('pointerdown',e=>{if(e.target.closest('a,button,input'))return;startX=e.clientX;startY=e.clientY;drag=0;try{card.setPointerCapture(e.pointerId)}catch(err){}});
 card.addEventListener('pointermove',e=>{if(startX===null)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){startX=null;return}drag=Math.max(-110,Math.min(110,dx));carousel.classList.add('dragging');carousel.style.setProperty('--drag',drag+'px')});
 function end(e){if(startX===null){carousel.classList.remove('dragging');carousel.style.setProperty('--drag','0px');return}const diff=e.clientX-startX;startX=null;carousel.classList.remove('dragging');carousel.style.setProperty('--drag','0px');if(Math.abs(diff)>46)journeyMove(diff<0?1:-1)}
 card.addEventListener('pointerup',end);card.addEventListener('pointercancel',()=>{startX=null;carousel.classList.remove('dragging');carousel.style.setProperty('--drag','0px')});
}
function journeyMove(delta){const rows=journeyRows(),i=rows.findIndex(r=>r.key===journeyCurrent()?.key);const target=rows[Math.max(0,Math.min(rows.length-1,i+delta))];if(target&&target.key!==journeyCurrent()?.key)journeySelect(target.key)}
// v20: a personal time journal; sample records stay explicitly labelled.
let dashSelectedDay = 4;
function dashDays(){
 const dates=[],d=new Date();
 while(dates.length<4){d.setDate(d.getDate()-1);if(d.getDay()!==0&&d.getDay()!==6)dates.unshift(new Date(d))}
 const hours=[3.2,4,2.4,3.8];
 return dates.map((d,i)=>[`${d.getMonth()+1}/${d.getDate()}`,hours[i]]).concat([['今天',2.6]]);
}
function dashTodayHours(){return dashDays()[4][1]}
function dashWeekAverage(){const values=dashDays().map(x=>x[1]).filter(v=>v!==null);return values.length?(values.reduce((n,v)=>n+v,0)/values.length).toFixed(1):'—'}
function batteryBucket(v){return v===null||v===undefined?0:v>=95?100:v>=80?90:v>=60?70:v>=40?50:30}
function dashWeekScore(){const values=[70,90,50,70];if(state.score!==null)values.push(state.score);return Math.round(values.reduce((a,b)=>a+b,0)/values.length)}
function dashSelectionText(i){const [label,v]=dashDays()[i];return `${label} · ${v===null?'还没开始记录':v+' 小时个人时间'}`}
function selectDashDay(i){
 dashSelectedDay=i;
 document.querySelectorAll('[data-dash-day]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.dashDay)===i)));
 document.querySelectorAll('[data-dash-dot]').forEach(c=>{const active=Number(c.dataset.dashDot)===i;c.setAttribute('r',active?'6':'4');c.setAttribute('fill',active?'var(--yellow)':'var(--paper)')});
 const out=document.querySelector('#dash-day-detail');if(out)out.textContent=dashSelectionText(i);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-dash-day]');if(b)selectDashDay(Number(b.dataset.dashDay))});
function dashJournal(){
 const rows=dashDays(),max=Math.max(4,...rows.map(x=>x[1]||0)),points=rows.map(([,v],i)=>({x:28+i*64,y:v===null?null:94-v/max*64}));
 const valid=points.filter(p=>p.y!==null),line=valid.map(p=>`${p.x},${p.y}`).join(' ');
 return `<div class="dj-plot"><svg viewBox="0 0 312 112" role="img" aria-label="最近五次个人时间，按日期排列。下方日期按钮可查看每次时长。"><path d="M28 30H284 M28 62H284 M28 94H284" class="dj-grid"/><polygon points="${line} ${valid[valid.length-1].x},94 28,94" class="dj-area"/><polyline points="${line}" class="dj-line"/>${points.map((p,i)=>p.y===null?'':`<circle data-dash-dot="${i}" cx="${p.x}" cy="${p.y}" r="${i===dashSelectedDay?6:4}" fill="${i===dashSelectedDay?'var(--yellow)':'var(--paper)'}" class="dj-dot"/>`).join('')}</svg></div><div class="dj-dates" role="group" aria-label="查看每天的个人时间">${rows.map(([label,v],i)=>`<button data-dash-day="${i}" aria-pressed="${i===dashSelectedDay}" aria-label="${dashSelectionText(i)}"><span>${label}</span><small>${v===null?'—':v+'h'}</small></button>`).join('')}</div>`;
}
function aiFeedback(v){
 if(v!=='yes'&&v!=='no')return;
 set({aiFeedback:{value:v}});
 toast('已记下你的反馈');
}
function journeyRecovery(){
 const score=state.score,fb=state.aiFeedback,today=dashTodayHours(),average=dashWeekAverage(),week=dashWeekScore();
 return `<div class="recovery-journal"><header class="dj-header"><h2>工作辛苦了，<br>希望你<mark>休息的不错</mark>。</h2></header>
 <section class="dj-today" aria-label="今日个人时间与电量"><div class="dj-today-body"><div class="dj-metric"><span>个人时间</span><strong>${today===null?'—':today}<small>小时</small></strong></div><div class="dj-metric"><span>今日电量</span><div class="dj-energy-reading"><i class="batt-img batt-${batteryBucket(score)}" role="img" aria-label="今日自评 ${score===null?'尚未记录':score+'%'}"></i><strong>${score===null?'—':score}${score===null?'':'<small>%</small>'}</strong></div></div></div></section>
 <section class="dj-week" aria-labelledby="dj-week-title"><div class="dj-section-head"><h3 id="dj-week-title">最近的下班时光</h3></div><div class="dj-week-summary"><div class="dj-metric"><span>平均个人时间</span><strong>${average}<small>小时</small></strong></div><div class="dj-metric"><span>平均电量</span><strong>${week}<small>%</small></strong></div></div>${dashJournal()}</section>
 <section class="dash-ai dj-insight"><span class="dj-insight-label">${ic('bulb','ii-sm')}一个小发现</span><p class="ai-insight">泡脚的晚上，<br>你更容易慢下来。</p><div class="ai-ask"><span>说得对吗？</span><div class="ai-btns"><button data-ai-feedback="yes" aria-pressed="${!!(fb&&fb.value==='yes')}">说得对</button><button data-ai-feedback="no" aria-pressed="${!!(fb&&fb.value==='no')}">不太对</button></div></div></section></div>`;
}

let previousJourneyProgress=null;
function animateJourneyProgress(){const fill=document.querySelector('#journey-progress-fill');if(!fill)return;const progress=journeyOverallProgress();if(previousJourneyProgress!==null&&previousJourneyProgress!==progress&&!matchMedia('(prefers-reduced-motion: reduce)').matches)fill.animate([{width:previousJourneyProgress+'%'},{width:progress+'%'}],{duration:280,easing:'ease-out'});previousJourneyProgress=progress;}

function finishFinalJourney(){
 if(!state.journeyTimer)return;
 syncRemaining();
 const elapsed=Math.max(0,(state.sessionLength||0)-(state.remaining||0));
 set({tab:1,stage:'ready',journeyMode:'done',running:false,journeyTimer:false,eveningEnded:true,done:true,score:null,lastDoneKey:state.activeKey,eveningDone:[...new Set([...state.eveningDone,state.activeKey])],sessions:state.sessions+1,totalRelax:state.totalRelax+elapsed+(state.journeySpent||0),journeySpent:0});
}

;

const activityCatalog=[
 {id:'exercise-skip',kind:'exercise',title:'今天不锻炼',min:0,max:0,mins:0,group:4,skip:true},
 {id:'exercise-walk',kind:'exercise',title:'轻松走一走',min:10,max:45,mins:20,group:4,steps:['选一条熟悉、方便折返的路','按能轻松说话的节奏走','快结束时放慢脚步，慢慢回家']},
 {id:'exercise-move',kind:'exercise',title:'在家轻松活动',min:10,max:30,mins:15,group:4,steps:['腾出一块空间，先活动一下手脚','选几个熟悉的简单动作，按自己的节奏来','做完慢慢走动、喝点水，准备洗漱']},
 {id:'dinner-cook',kind:'dinner',title:'做一顿简单晚饭',min:25,max:60,mins:40,group:0},
 {id:'dinner-ready',kind:'dinner',title:'吃点现成的',min:15,max:40,mins:25,group:0},
 {id:'relax-foot',kind:'relax',title:'泡脚 + 自由刷手机',min:10,max:25,mins:20,combo:0,group:1},
 {id:'walk',kind:'walk',title:'楼下散步',min:10,max:30,mins:20,group:1},
 {id:'music',kind:'custom',title:'喝茶听音乐',min:10,max:30,mins:15,group:1},
 {id:'tv',kind:'tv',title:'看剧',min:20,max:90,mins:45,recommendation:'wind',group:2},
 {id:'read',kind:'read',title:'阅读',min:10,max:60,mins:30,recommendation:'prince',group:2},
 {id:'chat',kind:'custom',title:'和朋友聊聊天',min:10,max:40,mins:20,group:2},
 {id:'winddown-quiet',kind:'winddown',title:'调暗灯光，安静躺一会儿',min:10,max:30,mins:20,group:3},
 {id:'winddown-music',kind:'winddown',title:'睡前听一点轻音乐',min:10,max:30,mins:20,group:3},
 {id:'dinner-eaten',kind:'dinner',title:'已经吃过',min:0,max:0,mins:0,group:0,skip:true},
 /* v19：给「换一批」备的候选。一律追加在末尾，免得改变 find(按 kind 找第一项)的结果。 */
 {id:'dinner-soup',kind:'dinner',title:'煮一碗热汤面',min:20,max:40,mins:30,group:0},
 {id:'dinner-hotpot',kind:'dinner',title:'热一份常备的饭',min:15,max:30,mins:20,group:0},
 {id:'relax-bath',kind:'relax',title:'洗个热水澡',min:15,max:30,mins:20,group:1},
 {id:'relax-stretch',kind:'custom',title:'简单拉伸一下',min:10,max:25,mins:15,group:1},
 {id:'game',kind:'custom',title:'玩一会儿游戏',min:20,max:60,mins:30,group:2},
 {id:'craft',kind:'custom',title:'做点小手工',min:20,max:60,mins:30,group:2},
 {id:'winddown-journal',kind:'winddown',title:'写两行今天的事',min:10,max:20,mins:10,group:3},
 {id:'winddown-tea',kind:'custom',title:'喝一杯温水，早点躺下',min:10,max:20,mins:10,group:3}
];
activityCatalog.push(
 {id:'dinner-bento',kind:'dinner',title:'买份喜欢的简餐',min:15,max:35,mins:25,group:0},
 {id:'dinner-sandwich',kind:'dinner',title:'准备一份三明治',min:15,max:30,mins:20,group:0},
 {id:'dinner-leftovers',kind:'dinner',title:'搭配家里的常备食物',min:15,max:30,mins:20,group:0},
 {id:'relax-neck',kind:'relax',title:'放松肩颈',min:10,max:20,mins:10,steps:['找个舒服的坐姿','轻轻转动肩膀，活动颈部','按舒服的幅度来，不勉强'],group:1},
 {id:'relax-window',kind:'custom',title:'坐在窗边发会儿呆',min:10,max:25,mins:15,group:1},
 {id:'relax-hands',kind:'relax',title:'热敷双手',min:10,max:20,mins:10,steps:['准备一条温热的毛巾','轻轻敷在双手上','温度以舒服为准，想停就停'],group:1},
 {id:'leisure-podcast',kind:'custom',title:'听一段喜欢的播客',min:15,max:45,mins:25,group:2},
 {id:'leisure-draw',kind:'custom',title:'随手画点什么',min:10,max:40,mins:20,group:2},
 {id:'leisure-puzzle',kind:'custom',title:'拼一会儿拼图',min:15,max:45,mins:25,group:2},
 {id:'sleep-stretch',kind:'winddown',title:'轻轻伸展，准备休息',min:10,max:20,mins:10,group:3},
 {id:'sleep-phone',kind:'winddown',title:'放下手机，安静躺下',min:10,max:20,mins:15,group:3},
 {id:'sleep-breathe',kind:'winddown',title:'闭眼听一会儿呼吸',min:10,max:20,mins:10,group:3}
);

function builderWindows(){const p=state.builderNight||state.night||state.prefs,off=minutes(p.off),home=off+Number(p.commute);let bed=minutes(p.bed);if(bed<=off)bed+=1440;const sleepStart=Math.max(home,bed-60),arrivalEnd=Math.min(home+60,sleepStart),windows=[];if(arrivalEnd>home)windows.push({id:'arrival',title:'到家后',start:home,end:arrivalEnd});if(sleepStart>arrivalEnd)windows.push({id:'evening',title:'晚间',start:arrivalEnd,end:sleepStart});if(bed>sleepStart)windows.push({id:'bedtime',title:'睡前',start:sleepStart,end:bed});return windows}
function builderWindow(){const windows=builderWindows();return windows.find(w=>w.id===state.builderPeriod)||windows[0]}
function windowOptions(){const w=builderWindow();if(!w)return [];const p=state.builderNight||state.night||state.prefs,late=w.start%1440>=21*60||w.start%1440<6*60;
 return activityCatalog.filter(o=>{if(o.id==='dinner-cook')return p.cooking!=='no'&&w.id==='arrival'&&!late&&w.end-w.start>=o.min;if(o.id==='dinner-ready')return w.id==='arrival'||(w.id==='bedtime'&&builderSpan()<90);if(o.kind==='winddown')return w.id==='bedtime';if(o.kind==='tv'||o.id==='chat')return w.id==='evening';if(o.kind==='read')return w.id!=='arrival';if(o.kind==='walk')return w.id!=='bedtime'&&!late;if(o.id==='relax-foot')return true;return o.id==='music'&&w.id!=='bedtime'}).map(o=>({...o,max:Math.max(o.min,Math.min(o.max,w.end-w.start,w.id==='bedtime'?20:o.max))})).filter(o=>w.end-w.start>=o.min)
}

function builderRounds(){const p=state.builderNight||state.night||state.prefs,home=minutes(p.off)+Number(p.commute),bed=home+builderSpan(),draft=state.builderDraft||[],dinner=draft.find(i=>i.group===0)?.mins??25,exercise=draft.filter(i=>i.group===4&&!i.skip).reduce((n,i)=>n+i.mins,0),relax=draft.filter(i=>i.group===1).reduce((n,i)=>n+i.mins,0),wash=exercise?25:15,rounds=[{id:'meal',group:0,title:'晚饭，怎么吃？',start:home},{id:'exercise',group:4,title:'今晚，要锻炼一下吗？',start:home+dinner}];if(builderSpan()>=90)rounds.push({id:'relax',group:1,title:'先让自己松一点。',start:home+dinner+exercise},{id:'leisure',group:2,title:'做一点喜欢的事。',start:home+dinner+exercise+relax+wash});rounds.push({id:'sleep',group:3,title:'慢慢准备睡觉。',start:Math.max(home,bed-(draft.find(i=>i.group===3)?.mins||20))});return rounds}

function builderRound(){const rounds=builderRounds();return rounds[Math.min(state.builderRoundIndex||0,rounds.length-1)]}
function roundOptions(){const round=builderRound(),p=state.builderNight||state.night||state.prefs;if(!round)return [];const leftToBed=minutes(p.off)+Number(p.commute)+builderSpan()-round.start;return activityCatalog.filter(o=>o.group===round.group&&o.id!=='walk'&&!(o.id==='dinner-cook'&&(p.cooking==='no'||builderSpan()<90||round.start%1440>=21*60||round.start%1440<6*60))&&!(o.kind==='walk'&&(round.start%1440>=22*60||round.start%1440<6*60))).map(o=>({...o,max:Math.min(o.max,Math.max(o.min,leftToBed-(o.group===3?0:20)),o.group===3?20:o.max)}))}
/* v19：「换一批」—— 每一段一次只摆 3 个候选，换一批就把窗口往后滑一屏；
   当前已选的那一项始终留在列表里，免得换过一批之后就看不见它了。 */
function builderWindowInfo(){
 const all=roundOptions(),round=builderRound(),selected=all.filter(o=>state.builderDraft?.some(i=>i.id===o.id&&i.group===round?.group));
 const rest=all.filter(o=>!selected.some(i=>i.id===o.id)),slots=Math.max(1,3-selected.length);
 return {selected,rest,slots,pages:Math.max(1,Math.ceil(rest.length/slots))};
}
let builderWindowCache=null;
function roundWindow(){
 const all=roundOptions(),key=builderRound()?.id+':'+(state.builderBatch||0);
 if(builderWindowCache?.key===key)return builderWindowCache.ids.map(id=>all.find(o=>o.id===id)).filter(Boolean);
 const {selected,rest,slots,pages}=builderWindowInfo(),page=(state.builderBatch||0)%pages,rows=[...selected,...rest.slice(page*slots,page*slots+slots)];
 builderWindowCache={key,ids:rows.map(o=>o.id)};return rows;
}
function builderShuffle(){const {pages}=builderWindowInfo();if(pages<2){toast('这一段的选项都在这里了。');return}set({builderBatch:((state.builderBatch||0)+1)%pages,builderFocus:null})}


function builderBack(){if(state.builderReview){set({builderReview:false,builderRoundIndex:builderRounds().length-1,builderBatch:0,builderFocus:null});return}set({builderRoundIndex:Math.max(0,(state.builderRoundIndex||0)-1),builderBatch:0,builderFocus:null})}

function builderSpan(){const p=state.builderNight||state.night||state.prefs;let span=minutes(p.bed)-minutes(p.off);if(span<=0)span+=1440;return span-Number(p.commute)}
function builderItems(){if(state.builderReviewItems)return state.builderReviewItems.map(i=>({...i}));const draft=(state.builderDraft||[]).filter(i=>!i.skip),exercise=draft.some(i=>i.group===4);return [...draft.filter(i=>i.group===0),...draft.filter(i=>i.group===4),...draft.filter(i=>i.group===1),{id:'wash',kind:'wash',title:exercise?'洗漱 · 运动后慢慢恢复':'洗漱 · 换舒服的衣服',mins:exercise?25:15},...draft.filter(i=>i.group===2),...(draft.some(i=>i.group===3)?draft.filter(i=>i.group===3):[{id:'winddown',kind:'winddown',title:'睡前准备',mins:20}])]}

function builderUsed(){return builderItems().reduce((n,i)=>n+Number(i.mins),0)}
function builderLimit(option){const current=state.builderDraft?.find(i=>i.id===option.id);let used=builderUsed()-(current?.mins||0);if(option.group===3&&!state.builderDraft.some(i=>i.group===3))used-=20;if(option.group===4&&!option.skip&&!state.builderDraft.some(i=>i.group===4&&!i.skip))used+=10;if([0,1,3,4].includes(option.group))used-=state.builderDraft.filter(i=>i.group===option.group&&i.id!==option.id).reduce((n,i)=>n+i.mins,0);return Math.max(0,Math.min(option.max,Math.floor((builderSpan()-used)/5)*5))}
function beginBuilder(){builderWindowCache=null;state.builderReviewItems=null;state.builderReviewEditing=false;settleJourneyTimer();const original=materializePlan();state.builderNight={...(state.night||state.prefs)};const draft=[];
 for(const item of original){let option=activityCatalog.find(o=>o.id===item.id)||activityCatalog.find(o=>o.kind===item.kind&&(o.kind!=='dinner'||o.id===((state.builderNight||state.night||state.prefs).dinner==='cook'?'dinner-cook':'dinner-ready')));if(!option||draft.some(i=>i.id===option.id))continue;draft.push({...option,mins:Math.max(option.min,Math.min(option.group===3?20:option.max,Math.round(item.mins/5)*5)),recommendation:null})}
 if(state.night?.dinnerEaten){for(let i=draft.length-1;i>=0;i--)if(draft[i].group===0)draft.splice(i,1);draft.unshift({...activityCatalog.find(i=>i.id==='dinner-eaten')})}
 const suitable=draft.filter(i=>i.group!==4);
 suitable.push({...activityCatalog.find(i=>i.id==='exercise-skip')});
 state.builderDraft=suitable.filter(i=>i.id!=='walk'&&(i.group!==1||i===suitable.find(x=>x.group===1)));state.night||={...state.prefs};
 while(builderUsed()>builderSpan()){const last=state.builderDraft.findLast(i=>i.group===1||i.group===2);if(!last)break;if(last.mins>last.min)last.mins=Math.max(last.min,last.mins-5);else state.builderDraft=state.builderDraft.filter(i=>i!==last)}
 const dinner=state.builderDraft.find(i=>i.group===0);if(dinner)dinner.mins=Math.max(dinner.min,Math.min(dinner.mins,builderSpan()-15-(state.builderDraft.find(i=>i.group===3)?.mins||20)));
 panel=null;set({stage:'planning',tab:0,builderFlowVersion:3,builderRoundIndex:0,builderBatch:0,builderReview:false,builderPeriod:builderWindows()[0]?.id,builderFilter:'all',builderFocus:draft.find(i=>i.group===0)?.id||null,running:false,journeyTimer:false});
}
function builderToggle(id){const option=roundOptions().find(o=>o.id===id);if(!option)return;const exists=state.builderDraft.find(i=>i.id===id);if(exists){set({builderDraft:state.builderDraft.filter(i=>i.id!==id),builderFocus:null});return}const limit=builderLimit(option);if(limit<option.min){toast('睡前时间不够，先缩短或取消一项活动。');return}const draft=state.builderDraft.filter(i=>![0,1,3,4].includes(option.group)||i.group!==option.group);set({builderFocus:id,builderDraft:[...draft,{...option,recommendation:null,mins:Math.min(option.mins,limit)}]})}
function builderRemove(id){const option=activityCatalog.find(o=>o.id===id);if(!option||[0,3].includes(option.group))return;set({builderDraft:state.builderDraft.filter(i=>i.id!==id),builderFocus:null})}
function builderTime(id,value){const option=roundOptions().find(o=>o.id===id)||activityCatalog.find(o=>o.id===id),item=state.builderDraft.find(i=>i.id===id);if(!item||!option)return;item.mins=Math.max(option.min,Math.min(builderLimit(option),Number(value)));save();render()}
function builderNext(){if(builderUsed()>builderSpan()){toast('请缩短或取消一些活动。');return}const index=state.builderRoundIndex||0,round=builderRound();if([0,3,4].includes(round.group)&&!state.builderDraft.some(i=>i.group===round.group)){toast('请选择一项活动。');return}if(index>=builderRounds().length-1)set({builderReview:true,builderBatch:0});else set({builderRoundIndex:index+1,builderBatch:0,builderFocus:null})}
function builderConfirm(){const scrollTop=document.querySelector('.screen-content')?.scrollTop||0;const items=builderItems();if(timeline(state.builderNight||state.night||state.prefs,items).error)return;state.night={...state.builderNight,dinnerEaten:state.builderDraft.some(i=>i.id==='dinner-eaten')};state.planItems=items;state.eveningDone=state.eveningDone.filter(id=>items.some(i=>i.id===id));state.eveningEnded=false;actions.confirmPlan();const content=document.querySelector('.screen-content');if(content)content.scrollTop=scrollTop;}
function nightTimeProgress(full){const p=state.builderNight||state.night||state.prefs,off=minutes(p.off),total=builderSpan()+Number(p.commute),elapsed=(state.builderReview||full)?total:Math.max(0,Math.min(total,(builderRound()?.start||off)-off));return `<section class="night-progress simple-progress"><div class="night-time-bar" role="progressbar" aria-label="今晚安排进度" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${elapsed}"><i style="width:${elapsed/total*100}%"></i></div><div class="night-time-labels"><span>${p.off} 下班</span><span>${p.bed} 睡觉</span></div></section>`}
function builderScreen(){state.builderDraft||=[];const left=builderSpan()-builderUsed(),progress=nightTimeProgress();
 if(state.builderReview)return builderReviewScreen();
 const round=builderRound(),options=roundWindow();
 return `${backLabel((state.builderRoundIndex||0)>0?'回到上一段':'回到呼吸训练',(state.builderRoundIndex||0)>0?'builderBack':'resumeTransit','hero-back')}${progress}<div class="builder-head"><h2>${round.title}</h2></div><div class="builder-options">${options.map(o=>{const selected=state.builderDraft.find(i=>i.id===o.id),expanded=selected&&!o.skip&&(state.builderFocus===o.id||(!state.builderFocus&&state.builderDraft.find(i=>i.group===round.group)?.id===o.id)),limit=builderLimit(o),disabled=!selected&&limit<o.min;return `<section class="builder-option ${selected?'chosen':''}"><button data-builder-option="${o.id}" aria-pressed="${!!selected}" aria-expanded="${!!expanded}" ${disabled?'disabled':''}>${ic(activityIcon(o),'bo-ic')}<span><strong>${o.title}</strong><small>${o.skip?(o.group===4?'留给休息，继续安排今晚':'直接安排下一段'):selected?'':`建议 ${o.min}–${o.max} 分钟${disabled?' · 今晚时间不足':''}`}</small></span><i class="find" aria-hidden="true">${selected?'✓':'+'}</i></button>${expanded?`<div class="builder-duration"><label for="duration-${o.id}">时长 <strong>${selected.mins} 分钟</strong></label><input id="duration-${o.id}" data-builder-time="${o.id}" type="range" min="${o.min}" max="${Math.max(o.min,limit)}" step="5" value="${selected.mins}"><div><span>${o.min} 分钟</span><span>建议不超过 ${Math.max(o.min,limit)} 分钟</span></div></div><div class="builder-inline-actions">${['dinner','tv','read','exercise'].includes(o.kind)?`<button class="link" data-recommend-kind="${o.kind}">${o.kind==='exercise'?'不知道怎么练？':o.kind==='dinner'?'不知道做什么？':o.kind==='tv'?'不知道看什么？':'不知道读什么？'}</button>`:''}</div>`:''}</section>`}).join('')}</div><div class="builder-shuffle-row"><button class="link builder-shuffle" data-action="builderShuffle"><i class="shuffle-reference-icon" aria-hidden="true"></i><span>换一批</span></button></div>${left<0?'<p class="error">超出睡前时间，请缩短或取消一些活动。</p>':''}<div class="page-action">${button((state.builderRoundIndex||0)===builderRounds().length-1?'查看今晚行程':'安排下一段','builderNext','primary',left<0)}</div>`
}
let builderReviewBackup=null,reviewOriginTonight=false;
function builderReviewScreen(){
 const items=builderItems(),p=state.builderNight||state.night||state.prefs,plan=timeline(p,items),editing=!!state.builderReviewEditing;
 const invalid=items.some(i=>!Number.isInteger(Number(i.mins))||i.mins<5||i.mins>180),error=invalid?'活动时长请填写 5–180 分钟的整数。':plan.error;
 const labels={dinner:'晚饭',relax:'放松',walk:'散步',wash:'洗漱',tv:'看剧',read:'阅读',winddown:'睡前',custom:'喜欢的事'};
 return `<h2 class="${editing?'review-sticky-title':''}">${editing?'调整今晚行程':'今晚，就这样过。'}</h2>${editing?`<div class="review-budget"><span>已安排 <strong>${items.length} 件</strong></span><span>弹性时间 <strong>${plan.free===undefined?'待调整':Math.max(0,plan.free)+' 分钟'}</strong></span></div><div class="review-inline-list">${items.map((i,index)=>{const options=activityCatalog.filter(o=>!o.skip&&o.id!=='walk'&&o.group===i.group&&o.title!==i.title);return `<section class="review-edit-row review-tint-${JC_TINT[i.kind]||'cream'}" data-review-row="${esc(i.id)}"><header class="review-card-head"><div class="review-card-kind">${rowIcon(i)}<span>${labels[i.kind]||'活动'}</span></div><span class="review-card-number">${String(index+1).padStart(2,'0')}</span>${i.group!==3?`<button class="review-remove" data-review-remove="${esc(i.id)}" aria-label="移除${esc(i.title)}">移除</button>`:''}</header><button class="review-activity-trigger" data-review-open="${esc(i.id)}" aria-label="更换${esc(i.title)}" aria-haspopup="dialog" aria-expanded="false"><span>${esc(i.title)}</span>${ic('arrow-l','review-chevron')}</button><div class="review-duration-row"><span class="review-duration-label">留给它</span><div class="review-stepper"><button data-review-step="${esc(i.id)}" data-review-delta="-5" aria-label="减少${esc(i.title)}的时长，5分钟" ${i.mins<=5?'disabled':''}>−</button><input aria-label="${esc(i.title)}的分钟数" type="number" min="5" max="180" step="5" value="${i.mins}" data-review-minutes="${esc(i.id)}"><span>分钟</span><button data-review-step="${esc(i.id)}" data-review-delta="5" aria-label="增加${esc(i.title)}的时长，5分钟" ${i.mins>=180?'disabled':''}>＋</button></div></div></section>`}).join('')}</div><button class="review-add" data-review-add><span aria-hidden="true">＋</span>再添一件喜欢的事</button>`:`<div class="summary-art-window" aria-hidden="true"><i class="ii ii-moon summary-corner-art"></i></div><div class="builder-summary">${plan.rows.filter(r=>r.kind!=='commute').map(r=>`<div>${rowIcon(r)}<span>${esc(r.title)}</span><b>${r.duration?durationNumber(r.duration)+'<span class="duration-unit">分钟</span>':''}</b></div>`).join('')}</div>`}${error?`<p class="error" role="alert">${esc(error)}</p>`:''}${state.planConfirmed&&!state.arrived&&!editing&&state.tab===0?commutePlanActions():`<div class="page-action">${editing?button('完成调整','finishReviewAdjustment','primary',!!error):button('确认今晚行程','builderConfirm','primary',!!error)}<div class="center">${editing?button('取消调整','cancelReviewAdjustment','link'):button('调整今晚行程','editReviewInline','link')}</div></div>`}`;
}
function editReviewInline(){reviewOriginTonight=false;builderReviewBackup=state.builderReviewItems?state.builderReviewItems.map(i=>({...i})):null;set({builderReviewItems:builderItems().map(i=>({...i})),builderReviewEditing:true})}
function openTonightReview(){
 settleJourneyTimer();const groups={dinner:0,relax:1,walk:1,tv:2,read:2,custom:2,winddown:3};
 const items=materializePlan().map(i=>({...i,group:i.group??groups[i.kind]}));
 reviewOriginTonight=true;builderReviewBackup=null;panel='tonight-review';
 set({builderNight:{...(state.night||state.prefs)},builderReviewItems:items,builderReview:true,builderReviewEditing:true,tab:1,stage:'ready',journeyMode:'overview'});
}
function finishReviewAdjustment(){
 const items=builderItems(),plan=timeline(state.builderNight||state.night||state.prefs,items);if(plan.error||items.some(i=>!Number.isInteger(Number(i.mins))||i.mins<5||i.mins>180))return;
 if(reviewOriginTonight){panel=null;reviewOriginTonight=false;const completed=state.eveningDone.filter(id=>items.some(i=>i.id===id));set({planItems:items.map(i=>({...i})),night:{...state.builderNight},eveningDone:completed,eveningEnded:items.every(i=>completed.includes(i.id)),journeyOriginals:{},journeyAlts:{},builderReviewItems:null,builderReview:false,builderReviewEditing:false,tab:1,stage:'ready',journeyMode:'overview'});toast('今晚行程已更新')}
 else set({builderReviewEditing:false});builderReviewBackup=null;
}
function cancelReviewAdjustment(){
 if(reviewOriginTonight){panel=null;reviewOriginTonight=false;set({builderReviewItems:null,builderReview:false,builderReviewEditing:false,tab:1,stage:'ready',journeyMode:'overview'})}
 else set({builderReviewItems:builderReviewBackup,builderReviewEditing:false});builderReviewBackup=null;
}
function updateReviewItems(items,focusSelector){const area=document.querySelector('.screen-content'),y=area?.scrollTop||0;set({builderReviewItems:items});const next=document.querySelector('.screen-content');if(next)next.scrollTop=y;if(focusSelector)document.querySelector(focusSelector)?.focus({preventScroll:true})}
document.addEventListener('change',e=>{
 const id=e.target.dataset.reviewChoice||e.target.dataset.reviewMinutes;if(!id||!state.builderReviewEditing)return;
 const items=state.builderReviewItems.map(i=>({...i})),item=items.find(i=>i.id===id);if(!item)return;
 if(e.target.hasAttribute('data-review-minutes'))item.mins=Number(e.target.value);
 else{const option=activityCatalog.find(o=>o.id===e.target.value);if(!option)return;Object.assign(item,option,{id,mins:Math.max(option.min,Math.min(option.max,item.mins)),recommendation:null});}
 updateReviewItems(items);
});
document.addEventListener('click',e=>{
 const open=e.target.closest('[data-review-open]');if(open){openReviewChooser(open.dataset.reviewOpen);return}
 const step=e.target.closest('[data-review-step]');if(step){const id=step.dataset.reviewStep,delta=Number(step.dataset.reviewDelta),items=state.builderReviewItems.map(i=>i.id===id?{...i,mins:Math.max(5,Math.min(180,Number(i.mins)+delta))}:{...i});updateReviewItems(items,`[data-review-step="${CSS.escape(id)}"][data-review-delta="${delta}"]`);return}
 const remove=e.target.closest('[data-review-remove]');if(remove){updateReviewItems(state.builderReviewItems.filter(i=>i.id!==remove.dataset.reviewRemove));return}
 if(e.target.closest('[data-review-add]')){const items=state.builderReviewItems.map(i=>({...i})),idx=items.findIndex(i=>i.group===3);items.splice(idx<0?items.length:idx,0,{id:'review-'+Date.now(),kind:'custom',title:'听一段喜欢的播客',mins:15,group:2});updateReviewItems(items);}
 const action=e.target.closest('[data-action]')?.dataset.action;
 if(action==='editReviewInline')editReviewInline();if(action==='finishReviewAdjustment')finishReviewAdjustment();if(action==='cancelReviewAdjustment')cancelReviewAdjustment();
});
let reviewChooserRow=null;
function closeReviewChooser(restore=true){
 const id=reviewChooserRow;document.querySelector('#review-chooser')?.remove();reviewChooserRow=null;
 const trigger=id&&document.querySelector(`[data-review-open="${CSS.escape(id)}"]`);trigger?.setAttribute('aria-expanded','false');if(restore)trigger?.focus({preventScroll:true});
}
function openReviewChooser(id){
 if(!state.builderReviewEditing)return;closeReviewChooser(false);
 const item=builderItems().find(i=>i.id===id);if(!item)return;reviewChooserRow=id;
 const choices=[{...item,current:true},...activityCatalog.filter(o=>!o.skip&&o.group===item.group&&o.title!==item.title)];
 const overlay=document.createElement('div');overlay.id='review-chooser';overlay.className='review-choice-overlay';
 overlay.innerHTML=`<section class="review-choice-sheet" role="dialog" aria-modal="true" aria-labelledby="review-chooser-title"><div class="review-sheet-handle" aria-hidden="true"></div><header class="review-choice-head"><div><h3 id="review-chooser-title">更换活动</h3><p>选一件今晚想做的事。</p></div><button data-review-chooser-close aria-label="关闭活动选择">收起</button></header><div class="review-choice-list" role="group" aria-label="可选活动">${choices.map(o=>`<button class="review-choice-option" data-review-pick="${o.current?'':esc(o.id)}" aria-pressed="${!!o.current}"><span class="review-choice-art">${rowIcon(o)}</span><span class="review-choice-copy"><strong>${esc(o.title)}</strong><small>${o.current?'当前活动 · '+o.mins+' 分钟':o.min+'–'+o.max+' 分钟'}</small></span><span class="review-choice-check" aria-hidden="true">${o.current?'✓':''}</span></button>`).join('')}</div></section>`;
 document.querySelector('.phone').append(overlay);document.querySelector(`[data-review-open="${CSS.escape(id)}"]`)?.setAttribute('aria-expanded','true');
 overlay.querySelector('[aria-pressed="true"]').focus({preventScroll:true});
 overlay.addEventListener('click',e=>{
  if(e.target===overlay||e.target.closest('[data-review-chooser-close]')){closeReviewChooser();return}
  const pick=e.target.closest('[data-review-pick]');if(!pick)return;
  const row=reviewChooserRow,option=activityCatalog.find(o=>o.id===pick.dataset.reviewPick);
  closeReviewChooser(false);
  if(option){const items=state.builderReviewItems.map(i=>i.id===row?{...i,...option,id:row,mins:Math.max(option.min,Math.min(option.max,i.mins)),recommendation:null}:{...i});updateReviewItems(items,`[data-review-open="${CSS.escape(row)}"]`)}
  else document.querySelector(`[data-review-open="${CSS.escape(row)}"]`)?.focus({preventScroll:true});
 });
}
document.addEventListener('keydown',e=>{
 const overlay=document.querySelector('#review-chooser');if(!overlay)return;
 if(e.key==='Escape'){e.preventDefault();closeReviewChooser();return}
 const all=[...overlay.querySelectorAll('button:not(:disabled)')],options=[...overlay.querySelectorAll('[data-review-pick]')];
 if(e.key==='Tab'){const i=all.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();all.at(-1).focus()}else if(!e.shiftKey&&i===all.length-1){e.preventDefault();all[0].focus()}}
 if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const index=options.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?options.length-1:(index+(e.key==='ArrowDown'?1:-1)+options.length)%options.length;options[next]?.focus()}
});

function recommendationPlaceholder(){
 if(state.recommendKind==='exercise')return exerciseRecommendations();
 const book=state.recommendKind==='read',food=state.recommendKind==='dinner';
 return `<section class="recommendation-page-placeholder" aria-labelledby="recommendation-placeholder-title"><h2 id="recommendation-placeholder-title">${food?'晚饭推荐':book?'阅读推荐':'剧集推荐'}</h2><div class="recommendation-placeholder" aria-label="推荐列表">${[0,1].map(()=>`<div><i aria-hidden="true"></i><span><b></b><b></b><small>${food?'菜谱':book?'书籍':'剧集'}</small></span></div>`).join('')}</div></section><div class="page-action">${button('返回上一页','recommendationBack')}</div>`;
}
function openRecommendation(kind){state.recommendKind=kind;panel='recommendation';render()}
function bindBuilderUI(){document.querySelectorAll('[data-builder-time]').forEach(input=>{input.addEventListener('input',()=>{input.closest('.builder-duration').querySelector('label strong').textContent=input.value+' 分钟'});input.addEventListener('change',()=>builderTime(input.dataset.builderTime,input.value))})}

;

const $ = s => document.querySelector(s);
const KEY = 'offwork-v2';
const combos = [
  { title:'泡脚 + 自由刷手机', mins:20, prep:'准备温水，找个舒服的位置坐下。', type:'感官放松' },
  { title:'靠墙抬腿 + 看点喜欢的', mins:10, prep:'轻轻抬起双腿；不舒服就换个姿势。', type:'轻微动作' },
  { title:'整理桌面', mins:3, prep:'放好一个杯子，擦一小块桌面。', type:'触觉沉浸' }
];
const recommendations={tv:[{id:'wind',title:'去有风的地方',note:'换个生活场景，慢慢看一段。',url:'https://www.mgtv.com/h/512453.html'},{id:'altay',title:'我的阿勒泰',note:'想看草原与日常生活的时候。',url:'https://pages.iqiyi.com/m/zbs/news2024083001.html?qyc-body-bgc=ffffff&qyc-pr=1'}],read:[{id:'prince',title:'小王子',note:'读一小段，读到喜欢的地方就停。',url:'https://www.lepetitprince.com/en/the-book/'},{id:'altay-book',title:'我的阿勒泰',note:'读一篇李娟的生活散文。',url:'https://lib.cidp.edu.cn/__local/7/6B/36/CA3D81583C9014E77CC5A753D12_A38C50D8_15E946.pdf'}]};
const defaults = () => ({ onboard:0, introPage:0, stage:'shutdown', tab:0, night:null, planItems:null, activeKey:null, activeTitle:null, planConfirmed:false, arrived:false, eveningDone:[], activity:null, eveningEnded:false, combo:0, booked:false, sealed:false, draft:'', recording:false, inputMode:'voice', recordStartedAt:null, recordSeconds:0, vaultTasks:[], memoImport:false, memoSelected:[], achievement:'', breathing:true, breathStartedAt:null,breathElapsedSeconds:0, transitVisited:false,transitStep:'sound', energy:75, sessions:0, totalRelax:0, remaining:null, running:false, done:false, sound:'', soundPick:false, mood:null, prefs:{off:'18:30', bed:'23:30', commute:40, cooking:'yes', walk:true, dinner:'cook', studyWords:false, studyMinutes:15, exerciseHabit:'start', exerciseMinutes:20}, personalStart:null, journeyMode:'overview', journeyKey:null, journeyTimer:false, journeySpent:0, journeyAlts:{}, journeyOriginals:{}, builderBatch:0, score:75, lastDoneKey:null, aiFeedback:null, soundTouched:false });
let state = defaults();
try { const old = JSON.parse(localStorage.getItem(KEY)||'null'); if(old){state={...state,...old,prefs:{...state.prefs,...old.prefs},running:false,recording:false};if(old.planConfirmed===undefined&&['transit','home','active','complete'].includes(old.stage)){state.planConfirmed=true;state.night={...state.prefs}}} } catch {}
if(['home','active','complete'].includes(state.stage))state.arrived=true;
if(state.stage==='complete'&&state.done&&!state.eveningDone.includes('relax'))state.eveningDone.push('relax');
try{if(!localStorage.getItem('offwork-demo-energy-75')){state.score=75;state.energy=75;localStorage.setItem('offwork-demo-energy-75','1')}}catch{}
state.journeyTimer=false;
if(state.planConfirmed&&state.stage==='active'){state.journeyMode='detail';state.journeyKey=state.activeKey;state.stage='ready'}
if(state.planConfirmed&&state.stage==='complete'){state.journeyMode='done';state.stage='ready'}
if(state.stage==='analyzing')state.stage='sealed';
let ambientDockRatio=.38,ambientDockDrag=null,ambientDockSuppressClickUntil=0;
function positionAmbientDock(){
 const dock=document.querySelector('#ambient'),phone=document.querySelector('.phone');if(!dock||dock.hidden||!phone)return;
 const nav=phone.querySelector('.nav'),bottom=(nav&&!nav.hidden?nav.offsetHeight:0)+16;
 const visibleBottom=Math.min(phone.clientHeight,innerHeight-phone.getBoundingClientRect().top-12);
 const max=Math.max(72,Math.min(phone.clientHeight-bottom-dock.offsetHeight,visibleBottom-dock.offsetHeight));
 const y=Math.max(72,Math.min(max,ambientDockRatio*phone.clientHeight));
 dock.style.top=y+'px';
}
document.addEventListener('pointerdown',e=>{
 const grip=e.target.closest('[data-ambient-dock],[data-ambient-grip]');if(!grip||e.button!==0)return;
 const dock=document.querySelector('#ambient');ambientDockDrag={id:e.pointerId,x:e.clientX,y:e.clientY,top:dock.offsetTop,moved:false,grip};
 grip.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',e=>{
 const drag=ambientDockDrag;if(!drag||drag.id!==e.pointerId)return;
 const dy=e.clientY-drag.y;if(!drag.moved&&Math.hypot(e.clientX-drag.x,dy)<6)return;
 drag.moved=true;e.preventDefault();document.querySelector('#ambient').classList.add('is-dragging');
 ambientDockRatio=(drag.top+dy)/document.querySelector('.phone').clientHeight;positionAmbientDock();
});
function finishAmbientDockDrag(e){
 const drag=ambientDockDrag;if(!drag||drag.id!==e.pointerId)return;
 if(drag.moved){ambientDockSuppressClickUntil=Date.now()+500;const dock=document.querySelector('#ambient');ambientDockRatio=dock.offsetTop/document.querySelector('.phone').clientHeight;}
 document.querySelector('#ambient')?.classList.remove('is-dragging');ambientDockDrag=null;
}
document.addEventListener('pointerup',finishAmbientDockDrag);
document.addEventListener('pointercancel',finishAmbientDockDrag);
document.addEventListener('click',e=>{
 if(!e.target.closest('[data-ambient-dock]'))return;
 if(Date.now()<ambientDockSuppressClickUntil){e.preventDefault();e.stopImmediatePropagation();return;}
 ambientDockExpanded=!ambientDockExpanded;render();
},true);
document.addEventListener('keydown',e=>{
 if(!e.target.closest('[data-ambient-dock]')||!['ArrowUp','ArrowDown'].includes(e.key))return;
 e.preventDefault();ambientDockRatio+=(e.key==='ArrowUp'?-24:24)/document.querySelector('.phone').clientHeight;positionAmbientDock();
});
window.addEventListener('resize',positionAmbientDock);
window.addEventListener('scroll',positionAmbientDock,{passive:true});

let ambientDockExpanded=false;
let audio = null, audioPaused = false, editor = null, panel = null, returnPanel = null, activityEdit=null, pendingAdded=null, analysisTimer=null;
/* 待办占位：演示时没有抽取结果也要有东西可看，用一小段示例清单填充，
   并在界面上标明是示例，避免被当成真实待办。 */
const TASK_PLACEHOLDER=['给王姐回复项目排期','确认下周评审时间并发送邀请','预约周五评审会议室'];
const soundscapes=[['雨声','rain','慢慢落下'],['车厢','train','熟悉的背景声'],['篝火','fire','暖一点的声音'],['海浪','wave','一来一回'],['夜风','wind','轻轻吹过'],['铁轨','rail','有节奏地回家']];
/* v14：播放中要显示的是「哪一段声音」，从上面那张表里取它自己的图标 */
if(state.sound==='车厢白噪音')state.sound='车厢';
const soundIcon=n=>{const s=soundscapes.find(x=>x[0]===n);return s?s[1]:'sound'};
const ritualIcon=(name,cls='')=>name==='mic'?`<svg class="ritual-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>`:name==='power'?`<svg class="ritual-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2v10m-6-7a9 9 0 1 0 12 0"/></svg>`:'';
const icons = ['<path d="M12 3v9m-6-6a8 8 0 1 0 12 0"/>','<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M8 2v4m8-4v4M4 9h16m-12 4h8m-8 4h5"/>','<rect x="3" y="6" width="17" height="12" rx="2"/><path d="M22 10v4M7 10v4m4-4v4m4-4v4"/>','<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2" fill="var(--paper)"/><circle cx="16" cy="12" r="2" fill="var(--paper)"/><circle cx="10" cy="18" r="2" fill="var(--paper)"/>'];
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function set(p){Object.assign(state,p);save();render()}
/* 演示用跳转：把某个关键页面直接摆出来，省去一路点过去。
   只在演示外壳（手机屏幕外）用，不改动正常流程。 */
function jumpTo(k){
  const base={onboard:4,eveningEnded:false,soundPick:false,soundTouched:false,panel:null,recording:false,inputMode:'voice',journeyMode:'overview',journeyKey:null,journeyTimer:false,running:false,breathing:false,arrived:true,stage:'ready',tab:0};
  try{
    panel=null;ventStop();
    if(k==='intro')return set({...base,onboard:0,introPage:0,stage:'shutdown',planConfirmed:false,arrived:false});
    if(k==='preferences')return set({...base,onboard:1,stage:'shutdown',planConfirmed:false,arrived:false,prefDraft:null,prefDraftMode:null,prefPage:0});
    if(k==='dump')return set({...base,stage:'shutdown',planConfirmed:false,arrived:false});
    if(k==='dump2')return set({...base,stage:'shutdown',planConfirmed:false,arrived:false,inputMode:'voice'});
    if(k==='sealed')return set({...base,stage:'sealed',planConfirmed:false,arrived:false,sealed:true,draft:'今天把会议框架重新排了一遍。明天给王姐回排期邮件；改完 Q3 复盘框架；确认周五评审的会议室。',vaultTasks:[...TASK_PLACEHOLDER],achievement:'今天完成了会议准备。'});
    if(k==='closed')return set({...base,stage:'closed',planConfirmed:false,arrived:false,vaultTasks:[...TASK_PLACEHOLDER]});
    if(k==='pod')return set({...base,stage:'transit',planConfirmed:false,arrived:false,transitStep:'sound'});
    if(k==='breathe')return set({...base,stage:'transit',planConfirmed:false,arrived:false,transitStep:'breathe',breathing:false,breathStartedAt:null,breathElapsedSeconds:0});
    if(k==='road'){materializePlan();return set({...base,stage:'commuteHub',planConfirmed:true,arrived:false})}
    if(k==='bridge'){Object.assign(state,base,{planConfirmed:false,arrived:false});return beginBuilder()}
    if(['build','buildsum','planned'].includes(k)){Object.assign(state,base,{planConfirmed:false,arrived:false});beginBuilder();if(k==='buildsum')return set({builderReview:true,tab:0});if(k==='planned')return builderConfirm();return;}

    if(k==='combo'){materializePlan();return set({...base,planConfirmed:true,tab:1})}
    if(k==='detail'){materializePlan();return set({...base,planConfirmed:true,tab:1,journeyMode:'detail',journeyKey:'dinner'})}
    if(k==='done'){materializePlan();return set({...base,planConfirmed:true,tab:1,journeyMode:'done',score:75,eveningEnded:true,eveningDone:journeyRows().map(r=>r.key)})}
    if(k==='dash'){materializePlan();return set({...base,planConfirmed:true,tab:2,score:75,personalStart:Date.now()-5400000,totalRelax:2400})}
    if(k==='prefs')return set({...base,planConfirmed:true,tab:3});
  }catch(err){toast('跳转失败：'+err.message)}
}
function toast(t){const notice=$('#toast'),phone=$('.phone');if(notice.parentElement!==phone)phone.append(notice);notice.classList.toggle('dashboard-feedback',t==='已记下你的反馈'&&!!document.querySelector('.recovery-journal'));notice.textContent=t;notice.hidden=false;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>notice.hidden=true,2500)}
const button=(t,a,cls='primary',disabled=false)=>`<button class="${cls}" data-action="${a}" ${disabled?'disabled':''}>${t}</button>`;
const ic=(n,c)=>`<i class="ii ii-${n}${c?' '+c:''}" aria-hidden="true"></i>`;
const KIND_ICON={commute:'train',bed:'bed',dinner:'bowl',relax:'sofa',walk:'shoe',exercise:'dumbbell',wash:'tooth',free:'note',winddown:'moon',tv:'tv',read:'book',custom:'mug'};
function activityIcon(item){if(item?.kind==='dinner'&&!item.skip)return item.id==='dinner-cook'||item.id==='dinner-soup'||item.id==='dinner-hotpot'?'meal-pan':'meal-popcorn';if(typeof item==='string')return KIND_ICON[item]||'tag';if(item?.kind==='exercise')return item.skip?'heartbeat':item.id==='exercise-walk'?'run':'dumbbell';return KIND_ICON[item?.kind]||'tag'}
const rowIcon=item=>`<i class="ii ii-${activityIcon(item)} row-ic" aria-hidden="true"></i>`;
const backLabel=(t,a,cls='back')=>`<button class="${cls}" data-action="${a}">${ic('arrow-l','back-ic')}<span>${t}</span></button>`;
const deco=(n,style,extra)=>`<i class="deco ii ii-${n}${extra?' '+extra:''}" style="${style}" aria-hidden="true"></i>`;
const VENT_LEADS=[{at:0,s:'慢慢说，先不着急'},{at:12,s:'我听着呢'},{at:26,s:'听起来今天挺不容易的'}];
const VENT_DEMO=['今天开了一天的会，自己的事情还没做完。','方案又改了好几遍，真的有一点委屈。','忙得连咖啡都没喝，现在只想歇一会儿。','今天已经很努力了，剩下的明天再说吧。','有些话当时没说出口，想起来还是难过。','明天记得整理好方案，再发给同事确认。','今天真的有点累，想要一个安静的拥抱。','说完好像轻松一点，我也要照顾好自己。'];
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
  const free=Math.min(65,Math.max(0,bed-cursor-wind.mins));cursor=Math.max(cursor,bed-wind.mins-free);if(free)add({id:'free',kind:'free',title:'留一点弹性时间',mins:free});
  add(wind);const overrun=Math.max(0,cursor-bed);rows.push({key:'bed',kind:'bed',time:cursor,end:cursor,title:'晚安',duration:0});
  const walk=rows.find(r=>r.kind==='walk')?.duration||0;
  return {rows,span,free,walk,walkOmitted:p.walk&&!walk,overrun,error:span>960?'请把睡觉时间设在下班后的 16 小时内。':overrun?`比睡觉时间多 ${overrun} 分钟，请缩短或移除一项活动。`:null};
}
function choices(name, items, value){return `<div class="option-row">${items.map(([v,t])=>`<label class="option ${value===v?'chosen':''}"><input type="radio" name="${name}" value="${v}" ${value===v?'checked':''}><span>${t}</span>${ic('check')}</label>`).join('')}</div>`}
function timesForm(p,daily=false){return `<div class="card form-card"><label for="off">${ic('door')} ${daily?'今天几点下班？':'通常几点下班？'}</label><input type="time" id="off" value="${p.off}" required><label for="bed">${ic('moon')} ${daily?'今晚几点睡觉？':'通常几点睡觉？'}</label><input type="time" id="bed" value="${p.bed}" required><label for="commute">${ic('train')} 回家路上大约多久？</label><div class="unit-input"><input type="number" id="commute" min="5" max="180" step="5" value="${p.commute}" required><span>分钟</span></div><p id="form-error" class="error" role="alert"></p></div>`}
function readTimes(){const p={...state.prefs,off:state.prefDraft?.off||state.prefs.off,bed:$('#bed').value,commute:Number($('#commute').value)};const error=!p.bed?'请填写睡觉时间。':!Number.isFinite(p.commute)||p.commute<5||p.commute>180?'通勤时长请填写 5–180 分钟。':null;if(error){$('#form-error').textContent=error;return null}return p}
const INTRO_PAGES=[{"title":"终于下班了，<br><span class=\"welcome-title-nowrap\">主动设计你的休息时间</span>","sub":"你如果不主动设计你的时间，你的时间就会被别人、被算法、被惯性设计。","cta":"开始","label":"柔黄色的手绘小钟","art":"assets/images/278ceed8f9f4bd6c2921.png"},{"title":"回家的路上，<br>先倒掉情绪。","sub":"把今天的烦心说出来，<br>没做完的事，留给明天。","cta":"继续","label":"鼠尾草绿色的手绘纸篓","art":"assets/images/936d110d51630d5ba0f6.png"},{"title":"白噪音与呼吸，<br>让心慢慢静下来。","sub":"听一段白噪音，跟着节奏练习呼吸。<br>让心慢慢静下来，轻轻松一口气。","cta":"继续","label":"几颗轻盈松散的不规则手绘气泡","art":"assets/images/00befd15c5fea625ed3a.png"},{"title":"贵在坚持，<br>找到你的生活节奏","sub":"从一个小习惯开始，不必每天都完美。<br>慢慢坚持，找到适合自己的生活节奏。","cta":"设置我的生活习惯","label":"一朵粉色的手绘小花","art":"assets/images/3a3ed9bb5af0e9216a20.png"}];
const heroBtn=(t,a)=>`<button class="hero-btn" data-action="${a}">${t}</button>`;
function introScreen(page=state.introPage){
 const i=Math.max(0,Math.min(page,INTRO_PAGES.length-1)),p=INTRO_PAGES[i],last=i===INTRO_PAGES.length-1;
 const back="";
 const skip="";
 const dots=`<div class="hero-dots" role="img" aria-label="欢迎介绍，第 ${i+1} 页，共 4 页">${INTRO_PAGES.map((_,n)=>`<i class="${n===i?"on":""}" aria-hidden="true"></i>`).join("")}</div>`;
 return `<div class="welcome-top">${back}<img class="welcome-brand welcome-brand-logo" src="assets/vectors/00191aa07984fc4b35f9.svg" alt="OffWork" width="435" height="90">${skip}</div><section class="welcome-stage" aria-label="${p.label}"><img class="welcome-object welcome-object-${i+1}" src="${p.art}" alt="" width="1254" height="1254" draggable="false"><div class="welcome-caption"><h1 class="welcome-title">${p.title}</h1><p class="welcome-description">${p.sub}</p></div></section><div class="welcome-bottom">${heroBtn(p.cta,last?"onboardStart":"introNext")}${dots}</div>`;
}
function onboarding(){return state.onboard===0?introScreen():preferenceWizard(true)}
const PREF_PAGES=['作息','晚间生活','学习','运动'];
function preferenceContext(initial){const mode=initial?'onboarding':'settings';if(state.prefDraftMode!==mode||!state.prefDraft){state.prefDraftMode=mode;state.prefDraft={...state.prefs};state.prefPage=0}return state.prefDraft}
function homePreferenceCard(p){return `<div class="card form-card onboarding-pref"><fieldset><legend>${ic('pan')} 家里方便做饭吗？</legend>${choices('cooking',[['yes','可以'],['sometimes','偶尔'],['no','不方便']],p.cooking)}</fieldset><fieldset><legend>${ic('shoe')} 晚饭后散步</legend>${choices('walk',[['yes','喜欢散步'],['no','更喜欢待在家']],p.walk?'yes':'no')}</fieldset></div>`}
function exercisePreferenceCard(p){return `<div class="card form-card exercise-pref"><fieldset><legend>${ic('heartbeat')} 你和锻炼，现在是什么关系？</legend>${choices('exerciseHabit',[['start','想慢慢养成'],['no','暂时不考虑']],p.exerciseHabit==='no'?'no':'start')}</fieldset><div id="exercise-duration" ${(p.exerciseHabit||'start')==='no'?'hidden':''}><label for="exercise-minutes">锻炼时想留多久？</label><div class="unit-input"><input type="number" id="exercise-minutes" min="10" max="90" step="5" value="${p.exerciseMinutes||20}"><span>分钟</span></div></div><p id="exercise-error" class="error" role="alert"></p></div>`}
function preferenceWizard(initial){const p=preferenceContext(initial),page=Math.min(3,state.prefPage||0),titles=['平时的晚上，是什么节奏？','吃好饭，再慢慢放松。','给想学的，留一点时间。','也给身体，留一点时间。'],body=[()=>prefsTimes(p),()=>homePreferenceCard(p),()=>wordStudyCard(p),()=>exercisePreferenceCard(p)],dots=`<div class="hero-dots pref-dots" role="img" aria-label="偏好设置，第 ${page+1} 页，共 4 页">${PREF_PAGES.map((_,i)=>`<i class="${i===page?'on':''}" aria-hidden="true"></i>`).join('')}</div>`;return `<div class="preference-brand"><img src="assets/vectors/00191aa07984fc4b35f9.svg" width="435" height="90" alt="OffWork"></div><h2>${titles[page]}</h2><p class="lead">${initial?'分四小步认识你，以后可以在设置中修改。':'按现在的生活调整，不用一次想得很完整。'}</p>${body[page]()}<div class="page-action pref-footer">${button(page===3?(initial?'完成设置，开始下班':'保存设置'):'下一步','prefNext','hero-btn')}${dots}</div>`}

function capturePreferencePage(){const page=state.prefPage||0,p={...state.prefDraft};if(page===0){const times=readTimes();if(!times)return false;Object.assign(p,{off:times.off,bed:times.bed,commute:times.commute})}if(page===1){const cooking=selected('cooking');Object.assign(p,{cooking,walk:selected('walk')==='yes',dinner:cooking==='yes'?'cook':cooking==='no'?'ready':p.dinner})}if(page===2){const study=readStudy();if(!study)return false;Object.assign(p,study)}if(page===3){const exerciseHabit=selected('exerciseHabit'),exerciseMinutes=Number($('#exercise-minutes').value);if(exerciseHabit!=='no'&&(!Number.isFinite(exerciseMinutes)||exerciseMinutes<10||exerciseMinutes>90)){$('#exercise-error').textContent='锻炼时长请填写 10–90 分钟。';$('#exercise-minutes').focus();return false}Object.assign(p,{exerciseHabit,exerciseMinutes})}state.prefDraft=p;return true}

function syncPreferenceQuickControl(control){const input=control.querySelector('input');if(!input||input.type==='time')return;const n=Number(input.value);control.querySelector('[data-pref-delta^="-"]').disabled=Number.isFinite(n)&&n<=Number(input.min||0);control.querySelector('[data-pref-delta]:not([data-pref-delta^="-"])').disabled=Number.isFinite(n)&&n>=Number(input.max||180);}
function enhancePreferenceInputs(root){
 root.querySelectorAll('.form-card input[type=time],.form-card input[type=number]').forEach(input=>{
  if(input.closest('.pref-quick-control'))return;
  const numeric=input.type==='number',old=numeric?input.closest('.unit-input'):input;if(!old)return;
  const control=document.createElement('div');control.className='pref-quick-control';const step=numeric?Number(input.step||5):15;
  const label=document.querySelector('label[for="'+input.id+'"]')?.textContent.trim()||'时长';
  const minus=document.createElement('button'),plus=document.createElement('button');for(const [button,delta,text] of [[minus,-step,'−'],[plus,step,'＋']]){button.type='button';button.dataset.prefInput=input.id;button.dataset.prefDelta=delta;button.textContent=text;button.setAttribute('aria-label',(delta<0?'减少':'增加')+label+'，'+step+'分钟');}
  const value=document.createElement('div');value.className='pref-quick-value';old.replaceWith(control);value.append(old);control.append(minus,value,plus);syncPreferenceQuickControl(control);
 });
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pref-input]');if(!b)return;e.preventDefault();const input=document.getElementById(b.dataset.prefInput);if(!input)return;const delta=Number(b.dataset.prefDelta);if(input.type==='time'){const [h,m]=(input.value||'23:30').split(':').map(Number),n=(h*60+m+delta+1440)%1440;input.value=String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}else input.value=Math.max(Number(input.min||0),Math.min(Number(input.max||180),(Number(input.value)||0)+delta));input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));syncPreferenceQuickControl(input.closest('.pref-quick-control'));});
document.addEventListener('input',e=>{const control=e.target.closest('.pref-quick-control');if(control)syncPreferenceQuickControl(control)});
function saveAllPreferences(){
 const times=readTimes(),study=readStudy();if(!times||!study)return;const exerciseHabit=selected('exerciseHabit'),exerciseMinutes=Number(document.querySelector('#exercise-minutes').value);
 if(exerciseHabit!=='no'&&(!Number.isFinite(exerciseMinutes)||exerciseMinutes<10||exerciseMinutes>90)){document.querySelector('#exercise-error').textContent='锻炼时长请填写 10–90 分钟。';document.querySelector('#exercise-minutes').focus();return;}
 const cooking=selected('cooking');state.prefs={...state.prefs,...times,...study,off:state.prefs.off,cooking,walk:selected('walk')==='yes',dinner:cooking==='yes'?'cook':cooking==='no'?'ready':state.prefs.dinner,exerciseHabit,exerciseMinutes};state.prefDraft=null;state.prefDraftMode=null;save();const top=document.querySelector('.screen-content').scrollTop;render();document.querySelector('.screen-content').scrollTop=top;toast('偏好已保存。');
}

function preferenceNext(){if(!capturePreferencePage())return;const page=state.prefPage||0;if(page<3){set({prefPage:page+1});return}const initial=state.prefDraftMode==='onboarding';state.prefs={...state.prefDraft};state.prefDraft=null;state.prefDraftMode=null;state.prefPage=0;if(initial)set({onboard:4,stage:'shutdown',tab:0});else{save();render();toast('设置已保存')}}
function preferenceBack(){if((state.prefPage||0)>0){capturePreferencePage();set({prefPage:state.prefPage-1})}else if(state.prefDraftMode==='onboarding')set({onboard:0});else{panel=null;set({tab:0})}}

function planRows(plan,current=null){return `<div class="schedule-list">${plan.rows.map(r=>{const rec=recommendationFor(r),editable=!['commute','bed','free'].includes(r.kind),finished=state.eveningDone.includes(r.key);const cur=state.arrived&&current?.key===r.key&&!state.eveningEnded;return `<div class="schedule-item ${cur?'current':''}" ${editable?`data-edit-item="${esc(r.key)}"`:''}><time>${clock(r.time)}${r.duration?`<small>${clock(r.end)}</small>`:''}</time>${rowIcon(r)}<div class="item-copy"><strong>${esc(r.title)}</strong>${rec?`<span class="recommend-label">《${esc(rec.title)}》</span>`:r.customContent?`<span class="recommend-label">${esc(r.customContent)}</span>`:''}${finished?'<small>已结束</small>':''}</div><div class="item-tail">${r.duration?`<span>${r.duration} 分钟</span>`:''}${editable?`<button class="edit-item" data-edit-item="${esc(r.key)}" aria-label="调整${esc(r.title)}">调整</button>`:''}</div></div>`}).join('')}</div>`}
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
function prefsTimes(p){return `<div class="card form-card compact preference-times"><label for="bed">${ic('moon')} 平时几点睡觉？</label><input type="time" id="bed" value="${p.bed}" required><label for="commute" style="margin-top:28px">${ic('train')} 回家路上大约多久？</label><div class="unit-input"><input type="number" id="commute" min="5" max="180" step="5" value="${p.commute}" required><span>分钟</span></div><p id="form-error" class="error" role="alert"></p></div>`}
function wordStudyCard(p){return `<div class="card form-card word-study-card"><fieldset><legend><img class="study-book" src="assets/images/add9130b6abdfebaf2af.png" alt="">晚上有学单词的习惯吗？</legend>${choices('studyWords',[['yes','有，留一点时间'],['no','暂时没有']],p.studyWords?'yes':'no')}</fieldset><div id="study-duration" ${p.studyWords?'':'hidden'}><label for="study-minutes">每晚想学多久？</label><div class="unit-input"><input type="number" id="study-minutes" min="5" max="120" step="5" value="${p.studyMinutes||15}"><span>分钟</span></div></div><p id="study-error" class="error" role="alert"></p></div>`}
function readStudy(){const studyWords=selected('studyWords')==='yes',studyMinutes=Number($('#study-minutes')?.value||state.prefs.studyMinutes||15);if(studyWords&&(!Number.isFinite(studyMinutes)||studyMinutes<5||studyMinutes>120)){const error=$('#study-error');error.textContent='学习时长请填写 5–120 分钟。';$('#study-minutes').focus();return null}return {studyWords,studyMinutes}}
function prefsScreen(){const p=state.prefs,wrap=(html,title)=>html.replace(/(<div class="card[^>]*>)/,'$1<h3 class="pref-section-title">'+title+'</h3>');return `<div class="preference-brand"><img src="assets/vectors/00191aa07984fc4b35f9.svg" width="435" height="90" alt="OffWork"></div><h2>生活<mark>偏好</mark></h2><p class="lead">按现在的生活调整，找到舒服的日常节奏。</p><section class="settings-pref-grid">${wrap(prefsTimes(p),'作息<mark>时间</mark>')}${wrap(homePreferenceCard(p),'晚间<mark>生活</mark>')}${wrap(wordStudyCard(p),'<mark>学习</mark>习惯')}${wrap(exercisePreferenceCard(p),'<mark>运动</mark>习惯')}</section><div class="page-action settings-pref-footer">${button('保存偏好','saveAllPreferences','primary')}</div>`;}

/* 倾诉屏的空文字区：一撮飘着的碎碎念。麦克风周围是干净的（没有装饰），
   这些只落在还没说话时那片空着的字场里；一开始录音（is-rec）就淡出，把位置让给实时文字。
   v14：六枚全部换成星，只在大小与角度上做区分，形状不再混搭。 */
const VENT_DOODLES='<span class="vent-doodles" aria-hidden="true">'
  +['d1','d2','d3','d4','d5','d6'].map(c=>ic('star','vd '+c)).join('')
  +'</span>';
const VENT_EMOTION_ART={"calm":"assets/images/d8e61ea25294b2e55286.png","happy":"assets/images/db1a2c2491b640ceec87.png","sad":"assets/images/f4d2621c60cd97096b5d.png","tired":"assets/images/c457601b54b54954316b.png","frustrated":"assets/images/8c094d391d3aa868e76b.png","worried":"assets/images/10206b30080c9b51e4f7.png","angry":"assets/images/2d253bca86b3b2c3fc94.png","sympathetic":"assets/images/37f5847a1a08846c90fe.png","reassuring":"assets/images/4dbb3cd98b16e3f31699.png","thoughtful":"assets/images/ca31c8ac113a365e89d9.png","empathySoft":"assets/images/b3b82a3bf67110056d9e.png","empathyConcern":"assets/images/f7d992b6a89055319ef0.png"};
function shutdownScreen(){
 state.inputMode="voice";state.ventTextOpen=false;
 return `<h2 class="vent-title">上班的<span class="vent-worry">烦心事</span>，<br>可以说给我听。</h2><div class="vent ${state.recording?"is-live is-rec":"is-idle"}" id="vent"><div class="vent-field" id="ventField" aria-live="polite"><div class="vent-memo-bubble"><img src="assets/images/9291c067017acd2c65cc.png" alt="" draggable="false"><p>也可以讲讲你没干完的活，<br>我帮你收进备忘录。</p></div><div class="vent-expression vent-generated-face vent-portrait" id="ventExpression" data-emotion="${ventEmotion(state.draft)}" aria-hidden="true"><div class="vent-portrait-motion"><img class="vent-portrait-base" id="ventPortrait" src="${VENT_EMOTION_ART[ventEmotion(state.draft)]}" alt="" width="1280" height="1280" draggable="false"><img class="vent-portrait-eyes" id="ventPortraitEyes" src="${VENT_EMOTION_ART[ventEmotion(state.draft)]}" alt="" width="1280" height="1280" draggable="false"></div></div></div><div class="vent-mic"><button class="vent-rec" data-action="record" aria-label="${state.recording?"结束倾诉":"开始倾诉"}"><span class="vent-ring" aria-hidden="true"></span>${ic("mic")}</button><div class="vent-status"><strong id="heatLead">${state.recording?"正在听…":"点击开始倾诉"}</strong></div></div></div><div class="page-action"><div class="vent-links">${!state.recording?button("打字输入","textEntryPlaceholder","link"):""}</div></div>`;
}
function vaultTaskRows(tasks){const picked=state.memoSelected||[];return `<div class="memo-tasks">${tasks.map((t,i)=>`<label class="memo-task"><input type="checkbox" data-memo-task="${i}" ${picked.includes(i)?'checked':''}><span>${esc(t)}</span></label>`).join('')}</div>`}
function memoImportCard(tasks){return `<div id="memo-selection">${vaultTaskRows(tasks)}<label class="memo-import-row"><span>明天 09:00 自动导入备忘录</span><input class="memo-toggle" type="checkbox" role="switch" name="memoImport" aria-label="明天 09:00 自动导入所选待办到备忘录" aria-describedby="memo-hint" ${state.memoImport?'checked':''}><i class="memo-toggle-track" aria-hidden="true"></i></label><p class="memo-sr" id="memo-hint" aria-live="polite">${memoImportHint(tasks)}</p></div>`}
function memoImportHint(tasks){const count=(state.memoSelected||[]).filter(i=>i<tasks.length).length;return state.memoImport?(count?`已选择 ${count} 项，明天 09:00 导入备忘录（交互预览）。`:''):''}

function exerciseRecommendations(){return `<section class="recommendation-page-placeholder" aria-labelledby="exercise-placeholder-title"><h2 id="exercise-placeholder-title">锻炼推荐</h2><div class="recommendation-placeholder" aria-label="锻炼推荐列表占位">${[0,1].map(()=>`<div><i aria-hidden="true"></i><span><b></b><b></b><small>锻炼方案</small></span></div>`).join('')}</div></section><div class="page-action">${button('返回上一页','recommendationBack')}</div>`}

function chooseExercise(id){const option=activityCatalog.find(o=>o.id===id&&o.kind==='exercise');if(!option)return;
 if(state.tab===1&&state.journeyMode==='detail'){const item=materializePlan().find(i=>i.id===state.journeyKey);if(!item)return;Object.assign(item,{...option,id:item.id,mins:item.mins});save();panel=null;render();return}
 const limit=builderLimit(option);if(limit<option.min){toast('今晚时间有点紧，先给它腾一点时间。');return}
 state.builderDraft=[...(state.builderDraft||[]).filter(i=>i.group!==1),{...option,mins:Math.min(option.mins,limit)}];panel=null;set({builderFocus:option.id,builderBatch:0});toast('已加入今晚行程')}

function moodForToday(){if(state.dailyMood)return state.dailyMood;const text=state.draft||'';return /烦|气|委屈|焦虑|崩溃/.test(text)?'low':/累|困|疲|忙/.test(text)?'tired':/开心|高兴|顺利|搞定/.test(text)?'good':'calm'}
function dailySentence(){return `<section class="ritual-achievement daily-sentence" aria-label="每日一句">${ic('spark','achievement-star')}<div>每日一句</div><strong lang="zh-CN">事情在变好之前都有些坏</strong></section>`}

function sealedScreen(){const parsed=arrangeDump(state.draft),tasks=TASK_PLACEHOLDER;return `<h2 class="ritual-title">别再想工作了，<br>这些事情明天再担心。</h2><div class="ritual-vault"><div class="row"><h3 class="inl">${ic('bell')}明日待办</h3><span class="tag-inline">${ic('clock','ii-xs')} 09:00</span></div>${memoImportCard(tasks)}</div><div class="ritual-achievement">${ic('star','achievement-star')}<div>今天做得不错</div><strong>${esc(state.achievement||parsed.achievement)}</strong></div>${dailySentence()}<div class="page-action ritual-slider-footer"><div class="ritual-switch"><span>向右拉，工作打烊</span><input id="ritual-switch" type="range" min="0" max="100" value="0" step="1" aria-label="向右滑动关闭工作模式"></div></div>`}
function analyzingScreen(){return `<div class="ritual-analyzing"><div class="analyzing-dots" aria-hidden="true"><i></i><i></i><i></i></div><h3>AI 正在整理你刚才说的</h3><p>提取待办 · 记下今天做得不错的事</p></div>`}
function readyScreen(){return `<h2>到家后，<br>不用再想。</h2><div class="card green"><h3 class="inl">${ic('check')}你的晚上已经排好了。</h3><p>${timeline().rows.filter(r=>!['commute','bed','free','winddown'].includes(r.kind)).map(r=>esc(r.title)).join(' → ')}</p></div><div class="page-action">${button('我到家了，开始今晚安排','home')}<div class="center">${button('查看今晚日程','schedule','link')}</div></div>`}
function closedScreen(){const own=TASK_PLACEHOLDER,tasks=TASK_PLACEHOLDER;return `<section class="ritual-closed-copy"><div class="closed-emblem" aria-hidden="true">${ic('power')}</div><h2>今日工作已打烊，<br>你的个人时间已上线。</h2>${own.length?`<p class="closed-count">${own.length} 条待办已收好。</p>`:''}<div class="closed-tasks">${tasks.map(t=>`<div>${ic('check','closed-ic')}<span>${esc(t)}</span></div>`).join('')}</div><p class="closed-note">${esc(memoImportHint(tasks))}</p></section><div class="page-action closed-actions">${button('进入通勤过渡舱','enterTransit','primary')}</div>`}

const BREATH_ROUNDS=4,BREATH_ROUND_SECONDS=19;
function breathElapsed(){return Math.min(BREATH_ROUNDS*BREATH_ROUND_SECONDS,(state.breathElapsedSeconds||0)+(state.breathing&&state.breathStartedAt?(Date.now()-state.breathStartedAt)/1000:0));}
function breathProgress(){
 const elapsed=breathElapsed(),done=elapsed>=76;
 return `<div class="breath-progress"><div class="breath-progress-head"><strong id="breath-round">${done?'4 轮已完成':elapsed||state.breathing?'第 '+Math.min(4,Math.floor(elapsed/19)+1)+' / 4 轮':'共 4 轮'}</strong><span>吸气 4 秒 · 屏住 7 秒 · 呼气 8 秒</span></div><div class="breath-progress-track" id="breath-progress" role="progressbar" aria-label="呼吸放松进度" aria-valuemin="0" aria-valuemax="76" aria-valuenow="${Math.floor(elapsed)}" aria-valuetext="${done?'已完成全部 4 轮':'共 4 轮，已完成 '+Math.floor(elapsed/19)+' 轮'}">${[0,1,2,3].map(i=>`<span class="breath-progress-segment"><i style="--progress:${Math.max(0,Math.min(1,(elapsed-i*19)/19))}"></i></span>`).join('')}</div></div>`;
}

function transitScreen(){
  const p=state.night||state.prefs;
  if(state.transitStep!=='breathe')return `<div class="ritual-pod"><h2 class="ritual-title">听点<mark>白噪音</mark>平静一下。</h2><div class="ritual-sounds">${soundscapes.map(([name,icon,note])=>`<button data-sound="${name}" class="ritual-sound ${state.sound===name?'selected':''} ${audio&&state.sound===name?'is-playing':''}" aria-pressed="${state.sound===name}">${ic(icon)}<strong>${name}</strong><span>${note}</span><div class="sound-bars" aria-hidden="true">${[7,12,5,14,8,11].map((h,i)=>`<i style="height:${h}px;animation-delay:${i*.12}s"></i>`).join('')}</div></button>`).join('')}</div></div><div class="page-action">${button('下一步 · 呼吸放松','transitNext')}<div class="center">${button('不需要白噪音','skipSound','link')}</div></div>`;
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
  return `<div class="ritual-pod pod-breathe"><h2 class="ritual-title">跟着呼吸，<mark>慢下来</mark>。</h2>${breathProgress()}<div class="breath-stage${state.breathing?'':' paused'}${!state.breathing&&!state.breathStartedAt?' idle':''}" id="breathStage"><div class="breath-orbit" aria-hidden="true">${dust}</div><span class="breath-hub" aria-hidden="true"><i class="ii breath-face ii-inhale" id="breathIcon" aria-hidden="true"></i><strong class="breath-word" id="breathWord">${breathElapsed()>=76?'完成':state.breathing?'吸气':breathElapsed()>0?'暂停':'开始'}</strong></span></div></div><div class="page-action pod-actions">${button(breathElapsed()>=76?'再来一次':state.breathing?'暂停':breathElapsed()>0?'继续':'开始','toggleBreathing','link')}${button(state.planConfirmed?'我到家了，开始行程':'<span class="breath-cta-full">准备好了，安排今晚行程</span><span class="breath-cta-short">准备好了，安排今晚</span>',state.planConfirmed?'startFromRoad':'reviewPlan')}</div>`;
}
function relaxationScreen(){const c=combos[state.combo],art=['mug','sofa','note'][state.combo]||'sofa';return steps(2)+`<div class="row"><h2>先舒服一点。</h2>${button('日程','schedule','link')}</div><div class="card pink" id="combo-card"><div class="row"><span class="pill">${c.type}</span><span class="hint">${state.combo+1} / 3</span></div><div class="col-art">${ic(art)}</div><h3>${c.title}</h3><p>${c.prep}</p><div class="hint">${c.mins} 分钟</div></div><div class="row"><button class="link" data-action="prev" aria-label="上一个放松方案">← 上一个</button><button class="link" data-action="next" aria-label="下一个放松方案">换一个 →</button></div><div class="page-action">${button('开始放松','start')}</div>`}
function activeScreen(){return steps(2)+`<h2>${state.running?'放松就好。':'歇一歇也可以。'}</h2><p class="lead inl">${ic('sofa','ii-sm')}${esc(state.activeTitle||combos[state.combo].title)}</p><div class="card green center"><div class="time" id="clock">${fmt(state.remaining)}</div><p>${state.running?'正在计时':'已暂停'}</p>${button(state.running?'暂停':'继续','pause','link')}</div><div class="page-action">${button('结束这次放松','finish')}<div class="center">${button('退出','exit','link')}</div></div>`}
function recoveryScreen(){return `<h2>一点一点，<br>把自己充回来。</h2><div class="card green"><div class="row"><h3 class="inl">${ic('bubble')}今日充电池</h3><span class="number">${state.energy}%</span></div><div class="battery">${[0,1,2,3,4].map(i=>`<span class="${i<Math.round(state.energy/20)?'full':''}"></span>`).join('')}</div></div><div class="stats"><div class="stat"><strong>${state.personalStart?Math.floor((Date.now()-state.personalStart)/60000)+' 分钟':'—'}</strong><small>本次个人时间</small></div><div class="stat"><strong>${Math.floor(state.totalRelax/60)} 分钟</strong><small>累计放松</small></div></div><div class="card"><div class="row"><h3 class="inl">${ic('chart')}这周的恢复</h3></div><div class="bars">${[36,55,42,70,48,58,62].map((v,i)=>`<div class="bar ${v===70?'b-max':''}" style="height:${v}px"><small>${['四','五','六','日','一','二','三'][i]}</small></div>`).join('')}</div><p class="chart-note">泡脚的晚上，你更容易慢下来。</p></div><div class="page-action">${button(state.mood?'晨间精力：'+state.mood+' · 修改':'记录晨间精力','mood')}</div>`}

/* ======================== 情绪字场 ========================
   语音识别结果或打字内容逐句落进字场：普通句快速渐隐（w1），
   情绪轻重的差别体现在停留时长、字号、颜色与高亮块上（w2 / w3），
   并在句旁浮出一枚小元素作为回响。
   ========================================================= */
let ventUsed=[],ventLast=null,ventLiveEl=null,ventDoneText='',ventDemoN=0,ventNextAt=0,
    ventTimer=null,ventReal=false,ventSR=null,ventSeq=0,ventGen=0;
let ventQueue=[],ventQueueTimer=null;
const ventTypingTimers=new Set();


/* A local, gentle keyword response; no diagnosis or remote sentiment service. */
function ventEmotion(text){
 const words={calm:['平静','放松了','好多了','松了口气','没事了'],happy:['开心','高兴','快乐','顺利','搞定','太好了','轻松','期待','幸福','被夸','好棒'],sad:['不开心','难过','委屈','伤心','想哭','失落','孤独','沮丧','失望'],tired:['疲惫','好累','累了','很累','太累','疲劳','困了','没力气','累死','疲倦'],frustrated:['好烦','很烦','生气','烦躁','烦死','烦透','气死','愤怒','讨厌','火大','气愤'],worried:['焦虑','紧张','担心','害怕','不安','压力','忐忑','慌了','发愁']};
 let mood='calm',latest=-1,length=0;
 const tail=String(text||'').slice(-180);
 for(const [name,list] of Object.entries(words))for(const word of list){let at=tail.lastIndexOf(word);if(at<0)continue;const before=tail.slice(Math.max(0,at-3),at);if(/(?:不再|不太|没有|不|没)$/.test(before))continue;const end=at+word.length;if(end>latest||(end===latest&&word.length>length)){mood=name;latest=end;length=word.length;}}
 return mood;
}

let ventFaceCycle={emotion:null,index:0,at:0};
let ventFacePreloads=null;
function updateVentExpression(){
 const face=document.querySelector('#ventExpression'),portrait=document.querySelector('#ventPortrait'),eyes=document.querySelector('#ventPortraitEyes');if(!face||!portrait||!eyes)return;
 if(!ventFacePreloads)ventFacePreloads=Object.values(VENT_EMOTION_ART).map(src=>{const image=new Image();image.src=src;return image});
 const mood=ventEmotion(state.draft),now=Date.now(),pools={happy:['empathySoft','sympathetic','empathyConcern','thoughtful'],calm:['empathySoft','empathyConcern','sympathetic','thoughtful'],sad:['empathyConcern','empathySoft','sympathetic','thoughtful'],tired:['empathySoft','empathyConcern','sympathetic','thoughtful'],frustrated:['empathyConcern','sympathetic','empathySoft','thoughtful'],worried:['empathyConcern','empathySoft','sympathetic','thoughtful']};
 if(ventFaceCycle.emotion!==mood||ventFaceCycle.recording!==state.recording){ventFaceCycle={emotion:mood,recording:state.recording,index:0,at:now};}else if(state.recording&&now-ventFaceCycle.at>=4000){ventFaceCycle.index++;ventFaceCycle.at=now;}
 const pool=pools[mood]||pools.happy,expression=state.recording?pool[ventFaceCycle.index%pool.length]:'calm';
 face.dataset.emotion=mood;face.dataset.expression=expression;
 let reaction=face.querySelector('.vent-reaction');if(!reaction){reaction=document.createElement('span');reaction.className='vent-reaction';reaction.setAttribute('aria-hidden','true');face.append(reaction)}
 const symbol=state.recording?(['angry','frustrated'].includes(expression)?'!':['thoughtful','worried'].includes(expression)?'?':''):'';
 if(reaction.dataset.symbol!==symbol){reaction.dataset.symbol=symbol;reaction.innerHTML=symbol==='!'?'<svg viewBox="0 0 28 44"><path d="M15 4 Q12 13 14 26 M13 36 L13.5 37"/></svg>':symbol==='?'?'<svg viewBox="0 0 28 44"><path d="M5 11 Q5 1 16 4 Q29 8 18 19 Q11 23 13 28 M13 37 L13.5 38"/></svg>':'';}

 if(portrait.dataset.expression!==expression){portrait.dataset.expression=eyes.dataset.expression=expression;portrait.src=eyes.src=VENT_EMOTION_ART[expression]||VENT_EMOTION_ART.happy;face.classList.remove('is-responding');requestAnimationFrame(()=>{if(!face.isConnected)return;face.classList.add('is-responding');setTimeout(()=>face.classList.remove('is-responding'),220)});}
}


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
    if(seg.length<=42){ push(seg); return; }
    const tm=seg.match(/[。；;！!？?\n]+$/), tail=tm?tm[0]:'';
    const body=tail?seg.slice(0,seg.length-tail.length):seg;
    const pieces=body.split(/[，,、]/).map(x=>x.trim()).filter(Boolean);
    pieces.forEach((p,i)=>{ push(i===pieces.length-1?p+tail:p); });
  });
  return out;
}
function ventDrop(el){
  clearTimeout(el?._emojiTimer);clearTimeout(el?._fadeTimer);clearTimeout(el?._removeTimer);
  const timer=el?.querySelector('.vf-in')?._typeTimer;clearTimeout(timer);ventTypingTimers.delete(timer);
  if(el&&el.parentNode) el.parentNode.removeChild(el);
  if(ventLast===el) ventLast=null;
  if(ventLiveEl===el) ventLiveEl=null;
}
function ventClear(){
  clearTimeout(ventQueueTimer);ventQueueTimer=null;ventQueue=[];
  ventTypingTimers.forEach(clearTimeout);ventTypingTimers.clear();
  const f=$('#ventField');
  if(f) f.querySelectorAll('.vf').forEach(n=>n.parentNode&&n.parentNode.removeChild(n));
  ventUsed=[];ventLast=null;ventLiveEl=null;ventDoneText='';ventSeq=0;ventGen++;
}
/* 找位置：先量尺寸，再在空位里挑「离已有句子最远」的一个，避免字句挤成一条竖列 */
function ventFindSpot(field,el,w,h){
  const insetX=14,insetTop=18,insetBottom=18;
  const W=field.clientWidth-insetX*2,H=field.clientHeight-insetTop-insetBottom,pad=7,gapY=9;
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
  const portrait=field.querySelector('.vent-expression');if(portrait){const f=field.getBoundingClientRect(),r=portrait.getBoundingClientRect();rects.push({x:r.left+r.width*.17-f.left-insetX,y:r.top+r.height*.19-f.top-insetTop,w:r.width*.66,h:r.height*.65})}
  field.querySelectorAll('.vf').forEach(v=>{ if(v!==el) rects.push({x:v.offsetLeft-insetX,y:v.offsetTop-insetTop,w:v.offsetWidth,h:v.offsetHeight}); });
  /* 角落的环境小元素也算障碍，否则云朵会压在句子上 */
  field.querySelectorAll('.deco').forEach(d=>{ rects.push({x:d.offsetLeft-insetX,y:d.offsetTop-insetTop,w:d.offsetWidth,h:d.offsetHeight}); });
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
    return {x:Math.round(best.x)+insetX,y:Math.round(best.y)+insetTop};
  }
  /* 位子用满：让最先来的那句先退场，直接占它的位置 */
  const old=field.querySelector('.vf:not(.vf-last)');
  if(old){ const x=Math.max(insetX,Math.min(field.clientWidth-insetX-w,old.offsetLeft)),y=Math.max(insetTop,Math.min(field.clientHeight-insetBottom-h,old.offsetTop)); ventDrop(old); return {x:x,y:y}; }
  return {x:insetX,y:insetTop};
}

// Longest matches win so a phrase such as 烦死 is decorated once.
const VENT_STICKER_ART={"tears":"assets/images/ba8a622cd220bdcdbef9.png","sigh":"assets/images/7190cd883634b1650275.png","pat":"assets/images/8150f60c3a41336354b7.png","coffee":"assets/images/8225464d549f20f66f0d.png"};
function ventStickerKind(text){return /咖啡|喝一杯|热饮/.test(text)?"coffee":/委屈|难过|哭|眼泪|伤心/.test(text)?"tears":/叹气|唉|好累|累|疲惫|忙了一天/.test(text)?"sigh":"pat";}
function ventRenderWords(inner,text,animate=false){
  clearTimeout(inner._typeTimer);ventTypingTimers.delete(inner._typeTimer);
  inner.replaceChildren();
  const words=[...new Set([...VENT_MAJOR,...VENT_TONE.drop,...VENT_TONE.burst,...VENT_TONE.cloud])].sort((a,b)=>b.length-a.length);
  const chars=[];let index=0,decorations=0;
  while(index<text.length){
    const word=words.find(w=>text.startsWith(w,index));
    const token=word||String.fromCodePoint(text.codePointAt(index));
    let host=inner;
    if(word){host=document.createElement('span');host.className='vf-word';inner.appendChild(host);}
    for(const ch of Array.from(token)){
      const glyph=document.createElement('span');glyph.className='vf-char'+(animate?'':' is-visible');glyph.textContent=ch;host.appendChild(glyph);chars.push(glyph);
    }
    if(word){
      if(decorations<2){
        const tone=ventTone(word),icon=document.createElement('span');icon.className='vf-emotion';icon.setAttribute('aria-hidden','true');
        icon.textContent=tone==='burst'?'💢':tone==='drop'?'💧':'〰';host.appendChild(icon);decorations++;
      }
      if(!animate)host.classList.add('is-felt');
    }
    index+=token.length;
  }
  inner.setAttribute('aria-label',text);
  chars.forEach(c=>c.setAttribute('aria-hidden','true'));
  if(!animate)return;
  const el=inner.parentElement;el.classList.add('vf-typing');
  const cursor=document.createElement('i');cursor.className='vf-cursor';cursor.setAttribute('aria-hidden','true');inner.appendChild(cursor);
  let n=0;
  const tick=()=>{
    ventTypingTimers.delete(inner._typeTimer);
    if(!inner.isConnected)return;
    const glyph=chars[n++];
    if(!glyph){cursor.remove();el.classList.remove('vf-typing');ventBubbleFinished(el);return;}
    glyph.classList.add('is-visible');
    const word=glyph.closest('.vf-word');
    if(word&&![...word.querySelectorAll('.vf-char')].some(c=>!c.classList.contains('is-visible')))word.classList.add('is-felt');
    cursor.style.left=(glyph.offsetLeft+glyph.offsetWidth+(word?word.offsetLeft:0)+2)+'px';
    cursor.style.top=(glyph.offsetTop+(word?word.offsetTop:0)+3)+'px';
    inner._typeTimer=setTimeout(tick,/[，,！!？?]/.test(glyph.textContent)?210:75);
    ventTypingTimers.add(inner._typeTimer);
  };
  tick();
}
function ventDrainQueue(){
  if(!state.recording||!ventQueue.length){ventQueueTimer=null;return;}
  const text=ventQueue.shift();ventSpawn(text);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  ventQueueTimer=setTimeout(ventDrainQueue,reduced?600:Array.from(text).length*75+450);
}


const VENT_SIMPLE_REACTION_ART={"hug":"assets/images/d7dddbc8772044e1d041.png","heart":"assets/images/9957422468837c6cdba2.png","cry":"assets/images/5b34f0b099d3915b355f.png","coffee":"assets/images/a41f6e1720df186e9856.png","received":"assets/images/9c65eaa946c387727d57.png"};
function ventSimpleReaction(text){
 const t=String(text||'');
 if(/(?:明天|后天|下周|记得|提醒|待办|需要|还要|别忘).{0,28}(?:排期|预约|会议室|确认|回复|发给|整理|提交|联系|安排|发送|预订|开会|写完|做完)|(?:预约|预订).{0,12}会议室|(?:确认|回复|同步).{0,12}排期/.test(t))return 'received';
 if(/咖啡|喝一杯/.test(t))return 'coffee';
 if(/委屈|难过|哭|伤心/.test(t))return 'cry';
 if(/谢谢|感谢|被理解|被支持|真好|开心/.test(t))return 'heart';
 return 'hug';
}
function ventCloseReactions(){}
function ventBubbleFinished(el){
 if(!el||el._fadeTimer)return;
 el._emojiTimer=setTimeout(()=>{if(el.isConnected)el.querySelector('.vent-auto-reaction')?.classList.add('is-visible')},1200);
 el._fadeTimer=setTimeout(()=>{if(!el.isConnected)return;el.classList.add('is-fading');el._removeTimer=setTimeout(()=>ventDrop(el),6000)},4200);
}
function ventSpawn(text){
 const field=$('#ventField'),t=String(text||'').trim();if(!field||!t)return null;
 let list=field.querySelector('.vent-chat-list');if(!list){list=document.createElement('div');list.className='vent-chat-list';list.setAttribute('role','log');list.setAttribute('aria-label','倾诉文字');field.append(list)}
 const el=document.createElement('div');el.className='vf vent-chat-bubble w'+ventTier(t)+(t.length>=14?' long':'');
 const slot=ventSeq%3;el.dataset.slot=slot;
 list.querySelectorAll('[data-slot="'+slot+'"]').forEach(ventDrop);
 const inner=document.createElement('span');inner.className='vf-in';el.append(inner);list.append(el);
 const reaction=document.createElement('span');reaction.className='vent-auto-reaction';const reactionImage=document.createElement('img');reactionImage.src=VENT_SIMPLE_REACTION_ART[ventSimpleReaction(t)];reactionImage.alt='';reactionImage.draggable=false;reaction.append(reactionImage);reaction.setAttribute('aria-hidden','true');el.append(reaction);
 ventRenderWords(inner,t.replace(/[。；;，,、]+$/,''),state.recording&&!matchMedia('(prefers-reduced-motion: reduce)').matches);
 if(!state.recording||matchMedia('(prefers-reduced-motion: reduce)').matches)ventBubbleFinished(el);
 if(ventLast)ventLast.classList.remove('vf-last');el.classList.add('vf-last');ventLast=el;ventSeq++;return el;
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
  ventRenderWords(inner,shown);
  const field=el.closest('.vent-field');if(field){field.style.minHeight=Math.max(210,el.offsetHeight+70)+'px';const x=Math.max(14,Math.min(field.clientWidth-14-el.offsetWidth,el.offsetLeft)),y=Math.max(44,Math.min(field.clientHeight-18-el.offsetHeight,el.offsetTop));el.style.setProperty('--x',x+'px');el.style.setProperty('--y',y+'px');}
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
  updateVentExpression();
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
  ventQueue.push(...parts);
  if(!ventQueueTimer)ventDrainQueue();
  state.draft=(state.draft?state.draft.replace(/[。；;，,]+$/,'')+'。':'')+parts.join('。')+'。';
  updateVentExpression();
  save();
  const c=$('#dumpCount'); if(c) c.textContent=state.draft.length+' 字';
}
function ventFlag(on){
  const f=$('#ventSrc'); if(f) f.hidden=!on;
}
/* 原型直接播放倾诉示例，不访问麦克风或申请录音权限。 */
function ventStartDemo(){ventReal=false;ventFlag(true)}
function ventBegin(){
  if(ventTimer) clearInterval(ventTimer);
  ventNextAt=0;
  ventStartDemo();
  ventTick();
  ventTimer=setInterval(ventTick,250);
}
function ventStop(){
  clearTimeout(ventQueueTimer);ventQueueTimer=null;ventQueue=[];
  ventTypingTimers.forEach(clearTimeout);ventTypingTimers.clear();
  if(ventTimer){ clearInterval(ventTimer); ventTimer=null; }
  if(ventSR){ try{ ventSR.stop(); }catch(e){} ventSR=null; }
  ventReal=false; ventFlag(false);
}
function ventTick(){
  if(!state.recording) return;
  updateVentExpression();
  const t=(Date.now()-state.recordStartedAt)/1000;
  const lead=$('#heatLead');
  if(lead){ let s=VENT_LEADS[0].s; VENT_LEADS.forEach(l=>{ if(t>=l.at) s=l.s; }); if(lead.textContent!==s) lead.textContent=s; }
  if(!ventReal&&t>=ventNextAt){                      /* 演示文本：也按正常语速落句 */
    ventAppend(VENT_DEMO[ventDemoN%VENT_DEMO.length]);
    ventDemoN++;
    ventNextAt=t+5.5+Math.random()*1.5;
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



function emphasizePageHeadings(root){
 const phrases=['休息时间','生活节奏','倒掉情绪','慢慢静下来','明天再担心','今晚行程','白噪音','慢下来','烦心事','先松一口气','放个空','工作可以等','充回来','做完了','你自己说了算','轮到你了','自己的节奏','吃好饭','想学的','身体','晚上','晚饭','锻炼','喜欢的事','准备睡觉','就这样过','推荐','播客','个人时间','已打烊','不用再想','舒服一点','放松','歇一歇','很好','整理','下班时光','充电池','顺序'];
 root.querySelectorAll('mark').forEach(mark=>{if(!mark.closest('h1,h2,.ritual-analyzing>h3'))mark.replaceWith(document.createTextNode(mark.textContent));});
 root.querySelectorAll('h1,h2,.ritual-analyzing>h3').forEach(h=>{
  if(h.querySelector('mark,.vent-worry,.title-focus'))return;
  const walker=document.createTreeWalker(h,NodeFilter.SHOW_TEXT),nodes=[];let node;while(node=walker.nextNode())if(node.textContent.trim())nodes.push(node);if(!nodes.length)return;
  let chosen,word;for(const phrase of phrases){chosen=nodes.find(n=>n.textContent.includes(phrase));if(chosen){word=phrase;break}}
  if(!chosen){chosen=nodes.reduce((a,b)=>a.textContent.length>b.textContent.length?a:b);const clean=chosen.textContent.replace(/[。！？?!，,：:、\s]+$/,'');word=clean.slice(-Math.min(3,clean.length));}
  if(!word)return;const text=chosen.textContent,index=text.indexOf(word);if(index<0)return;
  const mark=document.createElement('mark');mark.className='title-focus';mark.textContent=word;const frag=document.createDocumentFragment();frag.append(document.createTextNode(text.slice(0,index)),mark,document.createTextNode(text.slice(index+word.length)));chosen.replaceWith(frag);
 });
}
function labelPlaceholderPages(root){
 root.querySelectorAll('.recommendation-page-placeholder').forEach(page=>{if(page.querySelector('.feature-placeholder-notice'))return;const note=document.createElement('p');note.className='feature-placeholder-notice';note.setAttribute('role','note');note.textContent='功能尚未开发，当前为占位演示。';const anchor=page.querySelector(':scope > .lead,:scope > h2');if(anchor)anchor.after(note);else page.prepend(note);});
}

function alignPageTitle(){
 const screen=$('#screen'),content=screen?.querySelector('.screen-content'),phone=$('.phone');if(!content||content.classList.contains('onb-screen')||content.classList.contains('preference-page')||content.classList.contains('ritual-closed'))return;
 screen.querySelectorAll('[data-title-positioned]').forEach(e=>{const prop=e.dataset.titlePositioned;e.style[prop]=e.dataset.titleBase||'';delete e.dataset.titlePositioned;delete e.dataset.titleBase});
 const heading=screen.querySelector('h1,h2');if(!heading||heading.closest('.journey-card')||(content.querySelector('.pod-breathe')&&innerHeight<=500))return;
 const top=phone.getBoundingClientRect().top+phone.clientTop+parseFloat(getComputedStyle(phone).getPropertyValue('--page-title-top')||119)+(content.querySelector('.road-hub')?18:0),chrome=screen.querySelector('.screen-chrome');
 function adjust(el,property,amount){if(!el.dataset.titlePositioned){el.dataset.titlePositioned=property;el.dataset.titleBase=el.style[property]||''}el.style[property]=(parseFloat(getComputedStyle(el)[property])+amount)+'px'}
 for(let pass=0;pass<2;pass++){const scrollOffset=content.contains(heading)?content.scrollTop+(heading.closest('.journey-card')?.scrollTop||0):0;const delta=top-(heading.getBoundingClientRect().top+scrollOffset);if(Math.abs(delta)<.5)break;
  if(chrome?.contains(heading)){if(delta<0){const pad=parseFloat(getComputedStyle(chrome).paddingTop);adjust(chrome,'paddingTop',Math.max(delta,-pad));const remaining=top-heading.getBoundingClientRect().top;if(remaining<-.5&&!chrome.querySelector('.night-progress')){const h=heading.closest('.builder-head')?heading:null;if(h)adjust(h,'marginTop',Math.max(remaining,-parseFloat(getComputedStyle(h).marginTop)));}break;}adjust(chrome,'paddingTop',delta);}
  else if(delta>0)adjust(content,'paddingTop',delta);
  else adjust(heading.closest('.jc-head')||heading,'marginTop',delta);
 }
}
window.addEventListener('resize',()=>{requestAnimationFrame(alignPageTitle)});

function currentPreviewPage(){
 if(state.onboard<4)return state.onboard===0?'intro':'preferences';
 if(panel==='prefs'||state.tab===3)return 'prefs';
 if(panel==='tonight-review')return 'buildsum';
 if(state.tab===2)return 'dash';
 if(state.tab===1)return state.journeyMode==='done'?'done':state.journeyMode==='detail'?'detail':'combo';
 if(state.stage==='transit')return state.transitStep==='breathe'?'breathe':'pod';
 if(['commuteHub','commuteWindow','commutePodcast'].includes(state.stage))return 'road';
 if(state.stage==='planning')return state.builderReview?(state.planConfirmed?'planned':'buildsum'):'build';
 if(state.planConfirmed)return 'planned';
 if(state.stage==='sealed')return 'sealed';
 if(state.stage==='closed')return 'closed';
 return 'dump';
}
function updatePreviewNavigation(){
 const current=currentPreviewPage();
 document.querySelectorAll('.journey-rail [data-goto]').forEach(button=>{if(button.dataset.goto===current)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');});
 document.querySelectorAll('.journey-rail .rail-step').forEach(step=>step.classList.toggle('is-current-step',!!step.querySelector('[aria-current="page"]')));
}
function render(){
  const first=state.onboard<4;
  const ritualMain=!first&&!panel&&state.tab===0&&!state.planConfirmed;
  const immersive=ritualMain&&state.stage==='closed',processing=ritualMain&&state.stage==='analyzing';
  $('.phone').classList.toggle('ritual-dark',immersive);
  $('.nav').hidden=first||(!!panel&&panel!=='tonight-review')||immersive||processing;
  const NAV_ICON=['power','calendar','chart','gear'];
  $('.nav').innerHTML=['收工','今晚','回看','设置'].map((n,i)=>`<button data-tab="${i}" class="${state.tab===i?'active':''}" ${state.tab===i?'aria-current="page"':''}>${ic(NAV_ICON[i])}<span>${n}</span></button>`).join('');
  const ambientBar=$('#ambient');
  if(ambientBar){
    /* v10：没选过白噪音时右上角完全留空；选了之后才常驻显示 */
    const hasSound=!!state.sound||!!audio;
    /* v18：面板上不再有关闭钮，收起靠点面板以外；只要打开过一次，收起后就留一枚圆钮，
       否则「还没选声音」的用户会再也进不去。 */
    const selectingSound=state.stage==='transit'&&state.tab===0&&!panel&&state.transitStep!=='breathe';const show=!first&&!selectingSound&&!(immersive||processing)&&(hasSound||state.soundPick||state.soundTouched);
    ambientBar.hidden=!show;
    $('.phone').classList.toggle('amb-on',show);
    /* 没有音在放时，容器不套胶囊壳：收起态是一枚圆钮，点开是选择面板 */
    ambientBar.classList.toggle('is-plain',show&&!audio);
    if(show) ambientBar.innerHTML=audio
      ? `<span class="ambient-icon" id="ambientName" role="img" aria-label="${esc(state.sound||'白噪音')}">${ic(soundIcon(state.sound))}</span><button class="ambient-btn" data-action="toggleSound" aria-label="${audioPaused?'继续播放白噪音':'暂停白噪音'}">${ic(audioPaused?'play':'pause')}</button><button class="ambient-btn" data-action="audio" aria-label="停止白噪音">${ic('close')}</button>`
      : state.soundPick
        ? `<div class="ambient-pick"><div class="ambient-pick-head"><span>${ic('sound')}白噪音</span></div>${soundscapes.map(([nm,icon,note])=>`<button class="ambient-opt" data-amb-sound="${nm}"><span class="ao-copy"><strong>${nm}</strong><small>${note}</small></span>${ic(icon)}</button>`).join('')}</div>`
        : `<button class="ambient-dot" data-action="openSound" aria-label="选择白噪音" aria-expanded="false">${ic('sound')}</button>`;
    if(show){
      ambientBar.classList.add('ambient-dock');
      ambientBar.classList.toggle('dock-expanded',ambientDockExpanded);
      ambientBar.innerHTML=ambientDockExpanded
       ? `<section class="ambient-surface" id="ambient-dock-content" aria-label="白噪音播放器"><header class="ambient-surface-head"><div class="ambient-now" data-ambient-grip>${ic(soundIcon(state.sound)||'sound','ambient-now-icon')}<div><strong>${esc(state.sound||'白噪音')}</strong><small>${audio?(audioPaused?'已暂停':'正在播放'):'选个声音陪你'}</small></div></div><button class="ambient-collapse" data-ambient-dock aria-label="收起白噪音控制" aria-expanded="true">${ic('arrow-l')}</button></header><div class="ambient-actions"><button class="ambient-play" data-action="${audio?'toggleSound':'audio'}">${ic(audio&&!audioPaused?'pause':'play')}<span>${audio&&!audioPaused?'暂停':'播放'}</span></button><button class="ambient-change" data-action="openSound">换声音</button></div>${state.soundPick?`<div class="ambient-sound-list">${soundscapes.map(([nm,icon])=>`<button data-amb-sound="${nm}" aria-pressed="${state.sound===nm}">${ic(icon)}<span>${nm}</span></button>`).join('')}</div>`:''}</section>`
       : `<button class="ambient-dock-toggle" data-ambient-dock aria-label="展开白噪音控制" aria-expanded="false" aria-controls="ambient-dock-content">${ic('arrow-l','dock-arrow')}</button><div id="ambient-dock-content" hidden></div>`;
      positionAmbientDock();
    }
  }
  let html;
  if(first)html=onboarding();
  else if(panel==='tonight-review')html=builderReviewScreen();
  else if(panel==='recommendation')html=recommendationPlaceholder();
  else if(panel==='edit')html=editScreen();
  else if(panel==='prefs')html=prefsScreen();
  else if(panel==='schedule')html=journeyScreen();
  else if(state.tab===3)html=prefsScreen();
  else if(state.tab===1)html=journeyScreen();
  else if(state.tab===2)html=journeyRecovery();
  else if(state.planConfirmed&&state.stage==='commutePodcast'&&!state.arrived)html=commutePodcastScreen();
  else if(state.planConfirmed&&state.stage==='commuteHub'&&!state.arrived)html=commuteHubScreen();
  else if(state.planConfirmed&&state.stage==='commuteWindow'&&!state.arrived)html=commuteLookScreen();
  else if(state.planConfirmed&&state.stage==='transit'&&!state.arrived)html=roadBack('commuteHub')+transitScreen();
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
  const content=$('#screen .screen-content');if(panel==='tonight-review')content.classList.add('builder-screen');const savedCommute=state.tab===0&&state.planConfirmed&&!state.arrived&&!panel&&state.stage==='ready';if(savedCommute)content.classList.add('builder-screen','plan-confirm');const sameAsConfirm=(state.stage==='planning'&&state.tab===0&&!panel)||(state.stage==='ready'&&state.tab===1&&state.planConfirmed&&state.journeyMode==='overview'&&!panel);if(sameAsConfirm)content.classList.add('builder-screen');if(state.stage==='ready'&&state.tab===1&&state.planConfirmed&&state.journeyMode==='overview'&&!panel)content.classList.add('plan-confirm');
  if(content.querySelector('[data-action="prefNext"]'))content.classList.add('preference-page');if(content.querySelector('.settings-pref-grid'))content.classList.add('preference-page','preference-settings');
  if(content.classList.contains('preference-page'))enhancePreferenceInputs(content);
  labelPlaceholderPages(content);
  const chrome=document.createElement('div');chrome.className='screen-chrome';
  const navCandidates=[...content.querySelectorAll(':scope > .preference-brand,:scope > .hero-back,:scope.ritual-sealed > .ritual-title,:scope > .back,:scope > .road-header,:scope > .journey-detail-head,:scope > .journey-overall,:scope > .night-progress,:scope > .builder-progress,:scope > .pref-progress,:scope > .steps,:scope > section > .back,:scope > section > button[data-action="commuteHub"]')];
  navCandidates.forEach(el=>chrome.append(el));
  const fixedTitle=content.querySelector('.ritual-pod > .ritual-title,.builder-head,.review-sticky-title,.podcast-page-title,.dj-header');if(fixedTitle){chrome.append(fixedTitle);chrome.classList.add('has-page-title')}
  if(chrome.childElementCount)$('#screen').insertBefore(chrome,content);
  let footer=content.querySelector('.page-action');
  if(!footer&&!immersive){const primary=content.querySelector('.primary:not(.ritual-mic)');if(primary){footer=document.createElement('div');footer.className='page-action';footer.append(primary)}}
  if(footer)$('#screen').append(footer);
  content.querySelectorAll('.welcome-title,.welcome-description,.lead,.hint').forEach(el=>{const t=el.textContent.trim();if(/[，,]/.test(t)&&/[\u4e00-\u9fff]$/.test(t)){const last=el.lastElementChild;if(last&&last.tagName==='SPAN')last.append('。');else el.append('。')}});
  emphasizePageHeadings($('#screen'));
  alignPageTitle();
  const upcoming=content.querySelector('.schedule-item.current');
  if(upcoming)upcoming.scrollIntoView({block:'nearest'});
  const breathStage=$('#breathStage');if(breathStage){breathStage.style.setProperty('--breath-offset',-(breathElapsed()%19)+'s');}
  bindJourneyUI();bindBuilderUI();bindVent();bindOnboardingSwipe();updateVentExpression();updatePreviewNavigation();
  const card=$('#combo-card');if(card){let x;card.addEventListener('touchstart',e=>x=e.changedTouches[0].clientX,{passive:true});card.addEventListener('touchend',e=>{let d=e.changedTouches[0].clientX-x;if(Math.abs(d)>45)choose((state.combo+(d<0?1:2))%3)},{passive:true})}
}

function bindOnboardingSwipe(){
 if(document.querySelector('.preference-settings'))return;
 const content=document.querySelector('.screen-content');
 const intro=!!content?.querySelector('.welcome-stage'),prefs=content?.classList.contains('preference-page');
 if(!intro&&!prefs)return;
 let start=null;
 const navigate=direction=>{
  if(intro){if(direction<0){if(state.introPage<INTRO_PAGES.length-1)actions.introNext();else actions.onboardStart();}else if(state.introPage>0)actions.introBack();}
  else{const page=state.prefPage||0;if(direction<0&&page<3)preferenceNext();else if(direction>0){if(!capturePreferencePage())return;if(page>0)set({prefPage:page-1});else if(state.prefDraftMode==='onboarding')set({onboard:0,introPage:3});}}
 };
 content.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||e.target.closest('input,textarea,select,button,a,label,[role="slider"]'))return;start={x:e.clientX,y:e.clientY,id:e.pointerId};try{content.setPointerCapture(e.pointerId)}catch{}});
 content.addEventListener('pointerup',e=>{if(!start||start.id!==e.pointerId)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.5)navigate(dx<0?-1:1);});
 content.addEventListener('pointercancel',()=>{start=null});
 content.tabIndex=0;content.setAttribute('aria-label',intro?'欢迎介绍，可左右滑动或使用左右方向键切换':'生活偏好，可左右滑动或使用左右方向键切换');
 content.addEventListener('keydown',e=>{if(e.target.closest('input,textarea,select,button,a'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();navigate(e.key==='ArrowRight'?-1:1);document.querySelector('.screen-content')?.focus({preventScroll:true});}});
}

function choose(i){const prev=state.combo,oldItems=state.planItems?.map(x=>({...x}));state.combo=i;if(state.planItems){const item=state.planItems.find(x=>x.kind==='relax');if(item)Object.assign(item,{combo:i,title:combos[i].title,mins:combos[i].mins})}if(timeline().error){state.combo=prev;state.planItems=oldItems||null;toast('今晚时间较紧，请先调整日程。');return}state.booked=false;save();render()}
function modal(content,hasPrimary=false){$('#dialog').innerHTML=content+button(hasPrimary?'取消':'关闭','close',hasPrimary?'link':'primary');emphasizePageHeadings($('#dialog'));$('#dialog').showModal()}
function stopAudio(){if(audio){audio.close();audio=null}audioPaused=false}
function togglePause(){if(!audio)return;if(audioPaused){try{audio.resume()}catch(e){}audioPaused=false}else{try{audio.suspend()}catch(e){}audioPaused=true}render()}
function playAudio(){try{stopAudio();audioPaused=false;audio=new(window.AudioContext||window.webkitAudioContext)();const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+.025*(Math.random()*2-1))/1.025;data[i]=last*3}const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=({雨声:1200,海浪:450,篝火:1800,车厢:900,夜风:320,铁轨:700}[state.sound]||800);const gain=audio.createGain();gain.gain.value=.3;source.connect(filter).connect(gain).connect(audio.destination);source.start()}catch{stopAudio();toast('当前浏览器无法播放音频')}}
function shutdownSound(){try{const ac=new(window.AudioContext||window.webkitAudioContext)(),buffer=ac.createBuffer(1,Math.floor(ac.sampleRate*.25),ac.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3);const source=ac.createBufferSource();source.buffer=buffer;const filter=ac.createBiquadFilter();filter.type='lowpass';filter.frequency.value=420;const gain=ac.createGain();gain.gain.value=.12;source.connect(filter).connect(gain).connect(ac.destination);source.start();setTimeout(()=>ac.close(),350)}catch{}}
function sync(){if(!state.running||state.stage!=='active')return;state.remaining=Math.max(0,state.seconds-Math.floor((Date.now()-state.startedAt)/1000));if(!state.remaining)complete();else{const c=$('#clock');if(c)c.textContent=fmt(state.remaining);const st=$('#journey-timer-state');if(st)st.textContent='剩余 '+fmt(state.remaining)}}
function syncRemaining(){if(state.running)state.remaining=Math.max(0,state.seconds-Math.floor((Date.now()-state.startedAt)/1000))}
function complete(){if(state.journeyTimer){set({running:false,remaining:0});return}if(state.done)return;syncRemaining();const elapsed=state.sessionLength-state.remaining;set({stage:'complete',running:false,done:true,eveningDone:[...new Set([...state.eveningDone,state.activeKey||'relax'])],energy:Math.min(100,state.energy+15),sessions:state.sessions+1,totalRelax:state.totalRelax+elapsed})}
function selected(name){return document.querySelector(`input[name="${name}"]:checked`)?.value}
function arrangeDump(text){const frags=String(text||'').split(/[。；;\n，,]+/).map(s=>s.trim()).filter(Boolean);const ACTION=/(开会|会议|评审|汇报|提交|回复|回邮件|回信|回消息|发给|发邮件|寄|报销|排期|对接|跟进|推进|交付|上线|确认|修改|改完|改一下|写完|补齐|补|联系|约|面谈|面试|对账|结账|取|买|订|整理|归档|填|沟通|同步|过一遍|过一下|看一眼|看一下|拿去|带上|提醒|汇报|回个话)/;const OPEN=/(没做完|还没|没有做|没弄完|没完成|未完成|没回|没发|没交|没确认|搁置|欠|差|剩下|遗留|半途|断了|停在这)/;const FUTURE=/(明天|后天|大后天|下周|下个月|月底|月初|周一|周二|周三|周四|周五|周六|周日|周[一二三四五六日天]|礼拜|下午|上午|早上|晚上|之后|之前|以前)/;const MOOD=/^(好烦|烦|好累|累|难受|不舒服|堵|委屈|emo|开心|高兴|生气|无语|烦死|太累|无聊|焦虑|崩溃|算了|不想|麻)/;const done=frags.find(s=>/(整理好|重新排|完成了|做完了|已经|搞定了|收尾)/.test(s)&&!OPEN.test(s));const tasks=frags.filter(s=>s!==done&&!MOOD.test(s)&&(OPEN.test(s)||(ACTION.test(s)&&FUTURE.test(s)))).map(s=>s.replace(/^(明天|后天|今天|然后|还有|另外|接下来|下午|上午|晚上)[、，]?/,'').replace(/^(要|得|需要|记着|记得)/,'').trim()).filter(Boolean);return {tasks,achievement:done||'你把今天认真过了一遍。'}}
function processDump(){if(!state.draft.trim())return;const result=arrangeDump(state.draft);set({stage:'analyzing',recording:false,sealed:true,vaultTasks:[...TASK_PLACEHOLDER],memoImport:false,memoSelected:[],dailyMood:null,achievement:result.achievement});clearTimeout(analysisTimer);analysisTimer=setTimeout(()=>{if(state.stage==='analyzing')set({stage:'sealed'})},1200)}
function record(){
  if(!state.recording){
    ventClear();
    set({recording:true,recordStartedAt:Date.now(),recordSeconds:0,draft:''});
    return;
  }
  state.recordSeconds=Math.floor((Date.now()-state.recordStartedAt)/1000);
  const spoken=(state.draft||'').trim();

  if(!spoken)state.draft='今天把会议框架重新排了一遍。明天给王姐回排期邮件；改完 Q3 复盘框架；确认周五评审的会议室。';
  processDump();
}
function ritualTick(){
  if(state.stage==='transit'&&state.breathing&&state.breathStartedAt){
    const elapsed=breathElapsed(),round=Math.floor(elapsed/19);
    const progress=$('#breath-progress'),roundLabel=$('#breath-round');
    if(progress){progress.setAttribute('aria-valuenow',Math.floor(elapsed));progress.setAttribute('aria-valuetext','共 4 轮，已完成 '+Math.min(4,round)+' 轮');progress.querySelectorAll('i').forEach((bar,i)=>bar.style.setProperty('--progress',Math.max(0,Math.min(1,(elapsed-i*19)/19))));}
    if(roundLabel)roundLabel.textContent=round>=4?'4 轮已完成':'第 '+(round+1)+' / 4 轮';
    if(round>=4){state.breathing=false;state.breathElapsedSeconds=76;state.breathStartedAt=null;save();if(state.tab===0)render();return}
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
  onboardFinish:()=>{const times=readTimes(),study=readStudy();if(!times||!study)return;const cooking=selected('cooking'),walk=selected('walk')==='yes',dinner=cooking==='yes'?'cook':cooking==='no'?'ready':state.prefs.dinner,prefs={...times,...study,cooking,walk,dinner};const err=timeline(prefs,null).error;if(err){set({onboard:1});$('#form-error').textContent=err;return}set({prefs,onboard:4,stage:'shutdown',tab:0})},
  editPlan:()=>{editor=materializePlan().map(i=>({...i}));returnPanel=panel;panel='edit';render()},
  cancelEdit:()=>{panel=returnPanel;editor=null;render()},
  savePlan:()=>{if(timeline(state.night||state.prefs,editor).error)return;state.planItems=editor.map(i=>({...i}));panel=returnPanel;editor=null;save();render();toast('今晚顺序已更新')},
  editBoundary,addActivity:openAddActivity,applyActivity,
  removeActivity:()=>{const items=editableItems(),i=items.findIndex(x=>x.id===activityEdit);if(i>=0&&items[i].kind!=='winddown')items.splice(i,1);$('#dialog').close();activityEdit=null;pendingAdded=null;if(panel!=='edit')save();render();toast('已从今晚移除')},
  saveBoundary:()=>{const p={...(state.night||state.prefs),off:$('#off').value,bed:$('#bed').value,commute:Number($('#commute').value)};if(!p.off||!p.bed||!Number.isFinite(p.commute)||p.commute<5||p.commute>180){$('#form-error').textContent='请填写时间，通勤时长为 5–180 分钟。';return}if(timeline(p,editableItems()).span>960){$('#form-error').textContent='请把睡觉时间设在下班后的 16 小时内。';return}state.night=p;$('#dialog').close();save();render()},
  prefs:()=>{panel=null;set({tab:3})},
  savePrefs:()=>{const p=readTimes(),study=readStudy();if(!p||!study)return;Object.assign(p,study);const cooking=selected('cooking');Object.assign(p,{cooking,walk:selected('walk')==='yes',dinner:cooking==='no'?'ready':cooking===state.prefs.cooking?p.dinner:cooking==='yes'?'cook':'ready'});const err=timeline(p,null).error;if(err){$('#form-error').textContent=err;return}state.prefs=p;save();render();toast('设置已保存')},
  panelBack:()=>{panel=null;render()},schedule:()=>{panel=null;set({tab:1,journeyMode:'overview',arrived:state.planConfirmed||state.arrived})},startShutdown:()=>set({stage:'shutdown',tab:0}),resumeTransit:()=>set({stage:'transit',tab:0}),
  returnMain:()=>{panel=null;set({tab:0})},
  commuteSaved:()=>{panel=null;set({stage:'ready',tab:0,breathing:false,breathElapsedSeconds:breathElapsed(),breathStartedAt:null})},
  commuteHub:()=>{panel=null;set({stage:'commuteHub',tab:0,breathing:false,breathElapsedSeconds:breathElapsed(),breathStartedAt:null})},
  roadMusic:()=>modal(`<h3>打开音乐 App</h3><div class="music-app-options"><a href="https://music.163.com/" target="_blank" rel="noopener noreferrer">网易云音乐<span aria-hidden="true">↗</span></a><a href="https://y.qq.com/" target="_blank" rel="noopener noreferrer">QQ 音乐<span aria-hidden="true">↗</span></a><a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Spotify<span aria-hidden="true">↗</span></a></div>`),
  roadPodcast:()=>set({stage:'commutePodcast',tab:0,arrived:false,breathing:false}),
  startFromRoad:()=>{const elapsed=breathElapsed();Object.assign(state,{breathing:false,breathElapsedSeconds:elapsed,breathStartedAt:null,arrived:true});actions.openJourney();startJourney();},
  roadSound:()=>set({stage:'transit',tab:0,arrived:false,transitStep:'sound',breathing:false}),
  roadBreathe:()=>set({stage:'transit',tab:0,arrived:false,transitStep:'breathe',breathing:false}),
  roadWindow:()=>set({stage:'commuteWindow',tab:0,arrived:false,breathing:false}),
  reviewPlan:()=>{panel=null;const elapsed=breathElapsed();Object.assign(state,{tab:0,breathing:false,breathStartedAt:null,breathElapsedSeconds:elapsed});beginBuilder()},beginTonight:beginBuilder,builderShuffle,
  confirmPlan:()=>{materializePlan();if(timeline().error){toast('请缩短或移除一项活动');return}set({planConfirmed:true,booked:true,stage:'planning',builderReview:true,builderReviewEditing:false,tab:0,journeyMode:'overview',journeyKey:null,journeyOriginals:{},journeyAlts:{},arrived:false,night:{...(state.night||state.prefs)}})},
  beginActivity:()=>{const r=currentEvening();if(!r)return actions.endEvening();if(r.kind==='relax'){actions.start(r);return}set({activity:r.key})},
  finishActivity:()=>{const key=state.activity,kind=timeline().rows.find(r=>r.key===key)?.kind;set({activity:null,eveningDone:[...new Set([...state.eveningDone,key])],eveningEnded:kind==='winddown'});},
  backToPlan:()=>set({activity:null}),endEvening:()=>set({eveningEnded:true,activity:null}),
  record,processDump,
  textEntryPlaceholder:()=>toast('文字倾诉，稍后开放。'),
  skipseal:()=>set({stage:'sealed',sealed:false,recording:false,vaultTasks:[],achievement:'今天的工作，到这里就好。'}),
  memoSelectAll:()=>{state.memoSelected=(TASK_PLACEHOLDER).map((_,i)=>i);save();refreshMemoSelection()},
  memoSelectNone:()=>{state.memoSelected=[];save();refreshMemoSelection()},
  vault:()=>{const tasks=TASK_PLACEHOLDER;modal(`<h3>明日待办</h3>${memoImportCard(tasks)}`)},
  shutdown:()=>{shutdownSound();set({stage:'closed',tab:0,night:state.night||{...state.prefs},personalStart:state.personalStart||Date.now()})},
  enterTransit:()=>set({stage:'transit',tab:0,transitVisited:true,transitStep:'sound',breathing:false}),
  transitNext:()=>set({transitStep:'breathe',breathing:false,breathStartedAt:null,breathElapsedSeconds:0}),
  transitBack:()=>set({transitStep:'sound',breathing:false}),
  skipSound:()=>{stopAudio();set({sound:'',soundPick:false,transitStep:'breathe',breathing:false,breathStartedAt:null,breathElapsedSeconds:0})},
  toggleBreathing:()=>{const elapsed=breathElapsed();if(state.breathing)set({breathing:false,breathElapsedSeconds:elapsed,breathStartedAt:null});else set({breathing:true,breathElapsedSeconds:elapsed>=76?0:elapsed,breathStartedAt:Date.now()});ritualTick();},
  home:()=>{if(!state.planConfirmed){actions.reviewPlan();return}set({stage:'home',arrived:true,tab:1,activity:null})},prev:()=>choose((state.combo+2)%3),next:()=>choose((state.combo+1)%3),
  start:(row)=>{const r=row?.kind?row:timeline().rows.find(r=>r.kind==='relax');const seconds=(r?.duration||combos[state.combo].mins)*60;set({stage:'active',tab:0,arrived:true,combo:r?.combo??state.combo,activeKey:r?.key||'relax',activeTitle:r?.title||combos[state.combo].title,remaining:seconds,seconds,sessionLength:seconds,running:true,startedAt:Date.now(),done:false})},
  pause:()=>{syncRemaining();set(state.running?{running:false,seconds:state.remaining}:{running:true,seconds:state.remaining,startedAt:Date.now()})},
  finish:()=>modal(`<h3>结束这次放松？</h3><p>这段休息会记下来。</p>${button('结束并记录','confirmfinish')}`,true),
  confirmfinish:()=>{$('#dialog').close();complete()},
  exit:()=>modal(`<h3>退出本次放松？</h3><p>这次计时不计入恢复记录。</p>${button('确认退出','confirmexit')}`,true),confirmexit:()=>{$('#dialog').close();set({stage:'home',running:false,remaining:null})},
  dashboard:()=>set({tab:2}),again:()=>set({stage:'home',done:false,booked:false}),close:()=>{cancelActivity();$('#dialog').close()},
  audio:()=>{audio?stopAudio():playAudio();render()},
  openSound:()=>set({soundPick:true,soundTouched:true}),
  closeSound:()=>set({soundPick:false}),
  toggleSound:()=>togglePause(),
  route:()=>modal(`<h3>今晚走一条熟悉的路。</h3><div class="card green"><strong>约 15 分钟 · 800 米</strong><p>从小区门口走 5 分钟，再慢慢折返。</p></div>`),
  mood:()=>modal(`<h3>今天醒来，感觉怎样？</h3>${choices('mood',[['还想歇歇','还想歇歇'],['还不错','还不错'],['挺有精神','挺有精神']],state.mood||'还不错')}${button('记录感受','saveMood')}`,true),
  saveMood:()=>{set({mood:selected('mood')});$('#dialog').close();toast('已记录')},
  resetconfirm:()=>{clearTimeout(analysisTimer);stopAudio();ventStop();ventClear();ventUsed=[];ventDemoN=0;state=defaults();panel=null;editor=null;pendingAdded=null;activityEdit=null;clearTimeout(window.toastTimer);$('#toast').hidden=true;save();$('#dialog').close();render()}
};
Object.assign(actions,{openJourney:()=>{const row=journeyCurrent();if(row)journeySelect(row.key)},journeyBack:()=>{settleJourneyTimer();set({journeyMode:'overview',stage:'ready'})},startJourney,finishJourney,journeyAgain,adjustJourney:openTonightReview,replanJourney:beginBuilder,builderNext,builderBack,recommendationBack:()=>{panel=null;render()},builderConfirm});
actions.intro=()=>modal(`<blockquote class="offwork-slogan">你如果不主动设计你的时间，你的时间就会被别人、被算法、被惯性设计。</blockquote><h3>把工作留给明天。</h3><p>写下或说出还没放下的事，封存后关掉工作模式，在回家的路上慢慢回到生活。</p><h3 style="margin-top:24px">把今晚安排好。</h3><p>根据生活习惯，安排吃饭、散步、看剧、阅读与放松；到家后在「今晚」继续，生活习惯可在「设置」修改。</p>`);
document.addEventListener('click',e=>{/* v18：白噪音面板靠「点面板以外」收起 */
if(state.soundPick&&!e.target.closest('.ambient-pick')&&!e.target.closest('[data-action="openSound"]'))set({soundPick:false});
const row=e.target.closest('.schedule-item[data-edit-item]');if(row&&!e.target.closest('button')){openActivity(row.dataset.editItem);return}const b=e.target.closest('button');if(!b)return;if(b.dataset.builderPeriod)set({builderPeriod:b.dataset.builderPeriod,builderFocus:null});if(b.dataset.builderFilter!==undefined)set({builderFilter:b.dataset.builderFilter});if(b.dataset.builderRemove)builderRemove(b.dataset.builderRemove);if(b.dataset.recommendKind)openRecommendation(b.dataset.recommendKind);if(b.dataset.builderOption)builderToggle(b.dataset.builderOption);if(b.dataset.journeyKey)journeySelect(b.dataset.journeyKey);if(b.dataset.journeyScore)journeyScore(Number(b.dataset.journeyScore));if(b.dataset.aiFeedback)aiFeedback(b.dataset.aiFeedback);if(b.dataset.editItem)openActivity(b.dataset.editItem);if(b.dataset.moveItem)moveActivity(b.dataset.moveItem,Number(b.dataset.direction));if(b.dataset.addKind)addActivity(b.dataset.addKind);if(b.dataset.goto){jumpTo(b.dataset.goto);return}
if(b.dataset.ambSound){state.sound=b.dataset.ambSound;state.soundPick=false;playAudio();save();render();return}
if(b.dataset.action)actions[b.dataset.action]?.();if(b.dataset.tab!==undefined){if(state.recording){toast('请先结束倾诉');return}panel=null;set({tab:Number(b.dataset.tab),...(Number(b.dataset.tab)===1&&state.planConfirmed?{arrived:true}:{})})}if(b.dataset.combo!==undefined)choose(Number(b.dataset.combo));if(b.dataset.sound){const playing=!!audio;state.sound=b.dataset.sound;if(playing||(state.stage==='transit'&&state.tab===0))playAudio();save();render()}});
document.addEventListener('input',e=>{if(e.target.id==='ritual-switch')e.target.closest('.ritual-switch').style.setProperty('--switch-progress',e.target.value+'%');if(e.target.id==='activity-minutes')previewActivity();if(e.target.id==='dump'){state.draft=e.target.value;save();ventSyncText();const b=document.querySelector('[data-action="processDump"]');if(b)b.disabled=!state.draft.trim();const c=$('#dumpCount');if(c)c.textContent=state.draft.length+' 字'}});
document.addEventListener('change',e=>{if(e.target.id==='ritual-switch'){if(Number(e.target.value)>=90)actions.shutdown();else{e.target.value=0;e.target.closest('.ritual-switch').style.setProperty('--switch-progress','0%')}}if(e.target.name==='content-choice'&&$('#own-content'))$('#own-content').hidden=e.target.value!=='own';if(e.target.type==='radio'){document.querySelectorAll(`input[name="${e.target.name}"]`).forEach(i=>i.closest('.option')?.classList.toggle('chosen',i.checked))}});

function refreshMemoSelection(){const box=document.querySelector('#dialog[open] #memo-selection')||$('#memo-selection');if(!box)return;const tasks=TASK_PLACEHOLDER;box.outerHTML=memoImportCard(tasks)}
document.addEventListener('change',e=>{
 if(e.target.name==='studyWords')$('#study-duration').hidden=e.target.value!=='yes';
 if(e.target.name==='memoImport'){state.memoImport=e.target.checked;save()}
 if(e.target.dataset.memoTask!==undefined){const i=Number(e.target.dataset.memoTask);state.memoSelected=e.target.checked?[...new Set([...(state.memoSelected||[]),i])]:(state.memoSelected||[]).filter(n=>n!==i);save()}
 if(e.target.name==='memoImport'||e.target.dataset.memoTask!==undefined){const tasks=TASK_PLACEHOLDER;const hint=e.target.closest('#memo-selection')?.querySelector('#memo-hint');if(hint)hint.textContent=memoImportHint(tasks)}
});

Object.assign(actions,{saveAllPreferences,prefNext:preferenceNext,prefBack:preferenceBack,onboardStart:()=>set({onboard:1,prefDraft:null,prefDraftMode:null,prefPage:0}),onboardFinish:preferenceNext,savePrefs:preferenceNext,replanJourney:()=>{panel=null;beginBuilder()}});
 document.addEventListener('click',e=>{const intent=e.target.closest('[data-night-intent]'),pick=e.target.closest('[data-exercise-pick]'),mood=e.target.closest('[data-daily-mood]');if(pick)chooseExercise(pick.dataset.exercisePick);if(mood){const top=$('.screen-content')?.scrollTop||0;set({dailyMood:mood.dataset.dailyMood});$('.screen-content').scrollTop=top}});
 document.addEventListener('change',e=>{if(e.target.name==='exerciseHabit')$('#exercise-duration').hidden=e.target.value==='no'});
 $('#reset').onclick=()=>modal(`<h3>重新体验？</h3><p>清空本地记录，从首次介绍开始。</p>${button('确认重新体验','resetconfirm')}`,true);

$('#dialog').addEventListener('cancel',cancelActivity);
if(state.stage==='planning'&&!state.builderDraft)beginBuilder();
if((state.stage==='planning'&&state.builderFlowVersion!==3)||['nightIntent','eveningIntro'].includes(state.stage))beginBuilder();
setInterval(()=>{sync();journeyTick();ritualTick();ventTick();if(state.running)save()},1000);
setInterval(ritualTick,250);   /* v11：呼吸相位（文字 + 图标）单独按 250ms 刷 */
render();

;

(()=>{function strip(sheet){const rules=sheet.cssRules;if(!rules)return;for(let i=rules.length-1;i>=0;i--){const r=rules[i];if(r.selectorText&&r.selectorText.includes(':hover')){const selectors=r.selectorText.split(',');const keep=selectors.filter(sel=>!sel.includes(':hover')||/^\s*\.(?:rail|preview-tools|intro)\b/.test(sel));if(keep.length)r.selectorText=keep.join(',');else sheet.deleteRule(i);}else if(r.cssRules)strip(r);}}for(const sheet of document.styleSheets){try{strip(sheet)}catch{}}})();
