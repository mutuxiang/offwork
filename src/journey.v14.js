const JC_TINT={dinner:'yellow',relax:'pink',tv:'pink',walk:'sage',wash:'blue',read:'sage',winddown:'cream',custom:'blue'};
function journeyRows(){return timeline().rows.filter(r=>!['commute','free','bed'].includes(r.kind))}
function journeyCurrent(){const rows=journeyRows();return (state.journeyMode==='detail'?rows.find(r=>r.key===state.journeyKey):null)||rows.find(r=>!state.eveningDone.includes(r.key))||rows[0]}
function restScreen(){return `${deco('moon','right:0;top:-10px;width:48px;height:48px;--rot:-8deg;opacity:.8')}${deco('plane','left:0;bottom:104px;width:48px;height:48px;--rot:-8deg;opacity:.6')}<div class="rest-message"><h2>不要想工作，<br>工作可以等。</h2><p>今晚的安排已经收好了。<br>你好好休息，剩下的交给明天。</p></div><div class="page-action">${button('回到今晚行程','schedule')}<div class="center">${button('重新规划今晚','replanJourney','link')}</div></div>`}
function journeyOverview(){
  const plan=timeline(),p=state.night||state.prefs,current=journeyCurrent();
  const rows=plan.rows.filter(r=>r.kind!=='commute');
  return `<div class="row"><h2>今晚，按这个来。</h2>${button('调整','adjustJourney','link')}</div><p class="builder-budget"><span class="inl">${ic('door','ii-sm')}${p.off} 下班</span><span class="inl">${ic('moon','ii-sm')}${p.bed} 睡觉</span></p>${plan.error?`<p class="error">${plan.error}</p>`:''}<div class="journey-timeline">${rows.map(r=>{const interactive=!['free','bed'].includes(r.kind),rec=recommendationFor(r);return `<${interactive?'button':'div'} class="journey-row ${current?.key===r.key?'current':''} ${state.eveningDone.includes(r.key)?'finished':''}" ${interactive?`data-journey-key="${esc(r.key)}"`:''}>${rowIcon(r.kind)}<span><strong>${esc(r.title)}</strong>${rec?`<small>《${esc(rec.title)}》</small>`:r.customContent?`<small>${esc(r.customContent)}</small>`:''}</span>${r.duration?`<b>${r.duration} 分钟</b>`:''}</${interactive?'button':'div'}>`}).join('')}</div><div class="page-action">${button(state.eveningEnded?'再看一件':'开始行程','openJourney','primary',!!plan.error)}</div>`;
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
function journeyDetail(){
  const rows=journeyRows(),row=journeyCurrent();if(!row)return journeyOverview();
  const index=rows.findIndex(r=>r.key===row.key),rec=recommendationFor(row),started=state.journeyTimer&&state.activeKey===row.key;
  const next=rows[index+1],prev=rows[index-1];
  const remaining=started?(state.remaining??row.duration*60):row.duration*60,progress=started?Math.max(0,Math.min(100,remaining/(state.sessionLength||1)*100)):100;
  /* 两侧的卡片边只做「暗示可以滑动」的视觉提示，不接受点击，所以不加 data-journey-key */
  const peek=(r,cls)=>r?`<span class="carousel-peek ${cls} jc-tint-${JC_TINT[r.kind]||'cream'}" aria-hidden="true"></span>`:'';
  return `<div class="journey-detail-head">${backLabel('今晚日程','journeyBack')}<span class="pill">${state.eveningDone.includes(row.key)?'做过这一件':'已安排'}</span></div><div class="carousel-window" id="journey-carousel">${peek(prev,'prev')}${peek(next,'next')}<article class="journey-card jc-tint-${JC_TINT[row.kind]||'cream'}" id="journey-card">${ic(KIND_ICON[row.kind]||'tag','jc-art')}<span class="jc-count">${String(index+1).padStart(2,'0')} / ${String(rows.length).padStart(2,'0')}</span><h2>${esc(row.title)}</h2>${rec?`<h3>《${esc(rec.title)}》</h3>`:row.customContent?`<h3>${esc(row.customContent)}</h3>`:''}<div class="journey-duration"><strong>${row.duration}</strong><span>分钟</span></div><div class="journey-card-timer"><strong id="clock">${fmt(remaining)}</strong><span id="journey-timer-state">${started?'进行中':'未开始'}</span><div class="journey-progress"><i id="journey-progress-fill" style="width:${progress}%"></i></div></div><p>${esc(rec?.note||({dinner:'吃一顿舒服的饭。',walk:'不用赶路，走走就好。',wash:'让身体慢慢切换到休息。',relax:'身体放松一点，手机照常使用。',winddown:'不必努力入睡，先安静下来。'})[row.kind]||'按自己的节奏，做一点喜欢的事。')}</p><ol>${journeySteps(row).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>${['tv','read'].includes(row.kind)?`<button class="link" data-recommend-kind="${row.kind}">${row.kind==='tv'?'不知道看什么？':'不知道读什么？'}</button>`:''}<div class="jc-next">${ic(next?'arrow':'check','ii-sm')}<span>${next?'下一件 · '+esc(next.title):'这是今晚的最后一件'}</span></div></article></div><div class="journey-dots" aria-label="选择活动">${rows.map((r,i)=>`<button data-journey-key="${esc(r.key)}" aria-label="第 ${i+1} 件：${esc(r.title)}" aria-current="${r.key===row.key?'step':'false'}"><i></i></button>`).join('')}</div><div class="page-action">${button(started?'这一件做完了':'开始这一件',started?'finishJourney':'startJourney','primary',!!timeline().error)}</div>`;
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
  return `<h2>今晚恢复了几成，<br>你自己说了算。</h2><div class="journey-battery"><div class="row"><strong class="inl">${ic('bubble')}充电池 · 今日自评</strong><span>${score===null?'未选择':score+'%'}</span></div><div class="batt-figure"><i class="batt-img batt-${bk}" role="img" aria-label="充电池 ${bk}%"></i></div></div><p class="lead">${score===null?'点一下你现在感觉的位置。':'记下了，按你的感觉来。'}</p><div class="journey-score">${[[30,'三成'],[50,'五成'],[70,'七成'],[90,'九成'],[100,'满格']].map(([v,t])=>`<button data-journey-score="${v}" aria-pressed="${score===v}">${t}</button>`).join('')}</div><div class="page-action">${button('晚安','dashboard')}<div class="center">${button('回到今晚日程','journeyBack','link')}</div></div>`
}
function journeyScreen(){if(!state.planConfirmed)return `<h2>把今晚，<br>留给自己。</h2><div class="page-action">${button('安排今晚','reviewPlan')}</div>`;if(state.journeyMode==='detail')return journeyDetail();if(state.journeyMode==='done')return journeyDone();return journeyOverview()}
function settleJourneyTimer(){if(!state.journeyTimer)return;syncRemaining();const spent=Math.max(0,(state.sessionLength||0)-(state.remaining||0));state.journeySpent=(state.journeySpent||0)+spent;state.running=false;state.journeyTimer=false;}
function journeySelect(key){settleJourneyTimer();const row=journeyRows().find(r=>r.key===key);if(!row)return;set({journeyMode:'detail',journeyKey:key,tab:1,stage:'ready',activeKey:key,activeTitle:row.title,remaining:row.duration*60,sessionLength:row.duration*60,seconds:row.duration*60,running:false,journeyTimer:false,done:false})}
function startJourney(){const row=journeyCurrent();if(!row||timeline().error)return;const seconds=row.duration*60;set({tab:1,journeyMode:'detail',journeyTimer:true,stage:'active',activeKey:row.key,activeTitle:row.title,remaining:seconds,sessionLength:seconds,seconds,startedAt:Date.now(),running:true,done:false})}
function finishJourney(){if(!state.journeyTimer)return;syncRemaining();const elapsed=Math.max(0,state.sessionLength-state.remaining),key=state.activeKey;const completed=[...new Set([...state.eveningDone,key])];set({tab:1,stage:'ready',journeyMode:'done',journeyTimer:false,running:false,done:true,score:null,lastDoneKey:key,eveningDone:completed,sessions:state.sessions+1,totalRelax:state.totalRelax+elapsed+(state.journeySpent||0),journeySpent:0,eveningEnded:journeyRows().every(r=>completed.includes(r.key))})}
function swapJourney(){
  const row=journeyCurrent();if(!row)return;const options=journeyAlternatives(row);if(options.length<2)return;
  const indexes=state.journeyAlts||{},next=(Number(indexes[row.key]||0)+1)%options.length,candidate=options[next],items=materializePlan().map(i=>i.id===row.key?{...i,...candidate}:i);
  const error=timeline(state.night||state.prefs,items).error;if(error){toast('这项安排超过睡前时间，可以先缩短其他活动。');return}
  settleJourneyTimer();state.planItems=items;state.journeyAlts={...indexes,[row.key]:next};journeySelect(row.key);toast('做法和时长已同步到今晚日程');
}
function journeyScore(value){set({score:value,energy:value});}
function journeyAgain(){settleJourneyTimer();const next=journeyRows().find(r=>!state.eveningDone.includes(r.key));if(next)journeySelect(next.key);else set({tab:1,journeyMode:'overview',stage:'ready'})}
function journeyTick(){if(state.journeyTimer){const fill=$('#journey-progress-fill');if(fill)fill.style.width=Math.max(0,Math.min(100,state.remaining/(state.sessionLength||1)*100))+'%'}}
function bindJourneyUI(){const carousel=$('#journey-carousel'),card=$('#journey-card');if(!carousel||!card)return;let startX=null,startY=0,drag=0;
 card.addEventListener('pointerdown',e=>{if(e.target.closest('a,button,input'))return;startX=e.clientX;startY=e.clientY;drag=0;try{card.setPointerCapture(e.pointerId)}catch(err){}});
 card.addEventListener('pointermove',e=>{if(startX===null)return;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12){startX=null;return}drag=Math.max(-110,Math.min(110,dx));carousel.classList.add('dragging');carousel.style.setProperty('--drag',drag+'px')});
 function end(e){if(startX===null){carousel.classList.remove('dragging');carousel.style.setProperty('--drag','0px');return}const diff=e.clientX-startX;startX=null;carousel.classList.remove('dragging');carousel.style.setProperty('--drag','0px');if(Math.abs(diff)>46)journeyMove(diff<0?1:-1)}
 card.addEventListener('pointerup',end);card.addEventListener('pointercancel',()=>{startX=null;carousel.classList.remove('dragging');carousel.style.setProperty('--drag','0px')});
}
function journeyMove(delta){const rows=journeyRows(),i=rows.findIndex(r=>r.key===journeyCurrent()?.key);const target=rows[Math.max(0,Math.min(rows.length-1,i+delta))];if(target&&target.key!==journeyCurrent()?.key)journeySelect(target.key)}
function journeyRecovery(){const score=state.score;return `<h2>工作日里，<br>歇回来多少。</h2><div class="stats"><div class="stat"><strong>${state.personalStart?Math.floor((Date.now()-state.personalStart)/60000)+' 分钟':'—'}</strong><small class="inl">${ic('clock','ii-xs')}今日个人时间</small></div><div class="stat"><strong>${score===null?'未自评':score+'%'}</strong><small class="inl">${ic('bubble','ii-xs')}充电池 · 今日自评</small></div></div><div class="card journey-report"><div class="row"><h3 class="inl">${ic('chart')}工作日个人时间</h3><span class="hint">示例 · 小时</span></div><div class="bars">${[3.2,4,2.4,3.8,3.4].map((v,i)=>`<div class="bar ${v===4?'b-max':''}" style="height:${v/4*80}px"><small>${['一','二','三','四','五'][i]}</small></div>`).join('')}</div><p class="chart-note">只看工作日，周末不计入；记录休息，不统计产出。</p></div><div class="card journey-report"><p class="inl">${ic('bulb','ii-sm')}泡脚的晚上，你更容易慢下来。</p></div><div class="center">${button(state.mood?'晨间精力：'+state.mood+' · 修改':'记录晨间精力','mood','link')}</div>`}
