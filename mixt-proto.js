(function(){
  var root=document.getElementById('proto');if(!root)return;
  var $=function(s,r){return(r||root).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||root).querySelectorAll(s))};
  var OWN=1120; // очки Горшкова в парном разряде (демо)
  var players=[
    ['Лисицына Анна','Иваново, 11.04.2013','go','Ищет пару',984],
    ['Берёзова Мария','Заречье, 23.08.2013','go','Ищет пару',812],
    ['Ветрова Елена','Лугов, 09.02.2012','pair','Уже в паре',760],
    ['Озёрова Дарья','Прибрежный, 18.10.2012','go','Ищет пару',745],
    ['Рябинина Ольга','Сосновка, 06.06.2013','pair','Уже в паре',701],
    ['Сосновская Полина','Каменево, 14.03.2013','','Пока без пары',655],
    ['Верещагина Алиса','Озерцо, 30.07.2012','','Пока без пары',620],
    ['Липова Ксения','Сосновка, 21.12.2012','go','Ищет пару',598]
  ];
  var list=$('#pl-list');
  players.forEach(function(p,i){
    var b=document.createElement('button');b.type='button';b.className='pl';b.setAttribute('role','radio');
    b.setAttribute('aria-checked','false');b.dataset.i=i;
    if(p[2]==='pair')b.setAttribute('aria-disabled','true');
    b.innerHTML='<span class="rd"></span><span class="n">'+p[0]+'</span><span class="st '+(p[2]==='go'?'go':'')+'">'+p[3]+'</span>'+
      '<span class="c mono">'+p[1]+'</span><span class="pt"><small class="mono">Парный разряд</small><b>'+p[4]+'</b></span>';
    list.appendChild(b);
  });
  var sel=null,prio=1;
  var send=$('#send'),ppv=$('#pp-val'),dock=$('#dock-hint');
  function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ')}
  list.addEventListener('click',function(e){
    var b=e.target.closest('.pl');if(!b||b.getAttribute('aria-disabled')==='true')return;
    $$('.pl').forEach(function(x){x.setAttribute('aria-checked','false')});
    b.setAttribute('aria-checked','true');sel=+b.dataset.i;
    ppv.textContent=fmt(OWN+players[sel][4]);ppv.className='ok';
    send.disabled=false;
  });
  var dd=$('#prio-dd');dd.addEventListener('click',function(){prio=prio===1?2:1;$('#prio-val').textContent=prio;dd.setAttribute('aria-label','Приоритет участия: '+prio+'. Нажмите, чтобы сменить')});
  $$('.acc').forEach(function(a){a.addEventListener('click',function(){
    var open=a.getAttribute('aria-expanded')==='true';a.setAttribute('aria-expanded',open?'false':'true');
    document.getElementById(a.getAttribute('aria-controls')).hidden=open;
  })});

  // screens
  var s1=$('#s1'),s2=$('#s2');
  function show(n){s1.classList.toggle('off',n!==1);s2.classList.toggle('off',n!==2);s1.classList.toggle('l',n===2);
    (n===2?s2:s1).scrollTop=0;if(n===2){render('sent')}else{buttons()}}
  // status states
  var states={
    sent:{ring:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',cls:'',title:'Приглашение отправлено',sub:'Партнёру ушли уведомление и письмо со ссылкой.',
      steps:['cur','','',''],timer:'Осталось 12:00:00',note:'Если партнёр не ответит за 6 часов, мы отправим ему напоминание.',
      last:'Принято или отклонено'},
    seen:{ring:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></svg>',cls:'',title:'Партнёр открыл приглашение',sub:'Осталось дождаться ответа.',
      steps:['done','cur','',''],timer:'Осталось 11:32:00',note:'Напоминание уйдёт автоматически, если ответа не будет 6 часов.',last:'Принято или отклонено'},
    ok:{ring:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',cls:'',title:'Пара собрана',sub:'Партнёр принял приглашение. Заявка в турнире создана.',
      steps:['done','done','done',''],timer:'Приглашение принято',note:'Очки пары: '+'',last:'Принято',final:true},
    no:{ring:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',cls:'bad',title:'Партнёр отклонил',sub:'Можно сразу пригласить другого игрока.',
      steps:['done','done','bad',''],timer:'Приглашение отклонено',note:'',last:'Отклонено',final:true,retry:true},
    exp:{ring:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',cls:'mute',title:'Срок приглашения истёк',sub:'12 часов прошли без ответа. Пригласите другого партнёра.',
      steps:['done','','','bad'],timer:'Срок истёк',note:'',last:'Принято или отклонено',retry:true,expired:true}
  };
  function render(k){
    var s=states[k],p=players[sel==null?0:sel];
    $('#st-ring').innerHTML=s.ring;$('#st-ring').className='ok-ring '+s.cls;
    $('#st-title').textContent=s.title;$('#st-sub').textContent=s.sub;$('#st-back').textContent=(k==='ok')?'К странице турнира':'К выбору партнёра';
    $('#st-name').textContent=p[0];$('#st-pts').textContent=p[4];
    $('#st-timer').textContent=s.timer;
    $('#st-note').textContent=k==='ok'?'Очки вашей пары: '+fmt(OWN+p[4])+'. Приоритет участия: '+prio+'.':s.note;
    var li=$$('.tl .ti',s2),labels=['Отправлено','Просмотрено','Принято','Срок 12 часов'];
    var sm=['Только что','Партнёр открыл ссылку','Один клик по ссылке','Если ответа нет — приглашение истекает'];
    li.forEach(function(el,i){
      var st=s.steps[i];el.className='ti '+(st||'');
      var name=labels[i];
      if(i===2){name=k==='no'?'Отклонено':'Принято или отклонено';if(k==='ok')name='Принято'}
      el.firstChild.nodeValue=name;
    });
    $('#again').hidden=!s.retry;$('#st-back').hidden=!!s.retry;
    cur=k;buttons();
  }
  var cur='sent';
  function buttons(){
    $$('.ctrl [data-st]').forEach(function(b){b.disabled=s2.classList.contains('off')});
  }
  send.addEventListener('click',function(){if(sel==null)return;show(2)});
  $('#back-btn').addEventListener('click',function(){show(1)});
  $('#cancel-btn').addEventListener('click',function(){show(1)});
  $('#again').addEventListener('click',function(){
    show(1);sel=null;$$('.pl').forEach(function(x){x.setAttribute('aria-checked','false')});
    ppv.textContent='Выберите партнёра';ppv.className='';send.disabled=true;
  });
  $$('.ctrl [data-st]').forEach(function(b){b.addEventListener('click',function(){render(b.dataset.st)})});
  $('#reset').addEventListener('click',function(){
    show(1);sel=null;prio=1;$$('.pl').forEach(function(x){x.setAttribute('aria-checked','false')});
    $('#prio-val').textContent='1';
    ppv.textContent='Выберите партнёра';ppv.className='';send.disabled=true;s1.scrollTop=0;
  });

  function fit(){var w=window.innerWidth;var s=w<900?Math.min(.9,(root.clientWidth-20)/428):.78;root.style.setProperty('--s',s.toFixed(3))}
  fit();window.addEventListener('resize',fit);

  // ---- step tabs (tabs + stage + caption) ----
  var tabs=$$('.ix-tab'),bgs=$$('.ix-bg'),sim=$('#ix-sim'),cap=$('#ix-cap'),step=1;
  var caps=['Игроки «Уже в паре» недоступны для выбора','Приглашение действует 12 часов, потом можно пригласить другого','Кнопки состояния работают после отправки приглашения'];
  var smooth=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  function ui(n){
    step=n;
    tabs.forEach(function(t,i){var on=i===n-1;t.classList.toggle('on',on);t.setAttribute('aria-selected',on?'true':'false')});
    bgs.forEach(function(b,i){b.classList.toggle('on',i===n-1)});
    sim.classList.toggle('on',n===3);sim.setAttribute('aria-hidden',n===3?'false':'true');
    cap.classList.add('sw');setTimeout(function(){cap.textContent=caps[n-1];cap.classList.remove('sw')},220);
    send.classList.toggle('pulse',n===2);
  }
  function pick(){
    if(sel!=null)return;
    var b=$('.pl:not([aria-disabled="true"])');if(b)b.click();
  }
  function go(n){
    ui(n);
    if(n===1){
      if(!s2.classList.contains('off'))show(1);
      var t=$('#pl-list').offsetTop-150;s1.scrollTo({top:Math.max(0,t),behavior:smooth?'smooth':'auto'});
    }else if(n===2){
      if(!s2.classList.contains('off'))show(1);
      pick();
      setTimeout(function(){s1.scrollTo({top:0,behavior:smooth?'smooth':'auto'})},60);
    }else{
      if(s2.classList.contains('off')){pick();send.click()}
    }
  }
  tabs.forEach(function(t,i){t.addEventListener('click',function(){go(i+1)})});
  $('#ix-prev').addEventListener('click',function(){go(step===1?3:step-1)});
  $('#ix-next').addEventListener('click',function(){go(step===3?1:step+1)});
  // phone actions keep the tabs in sync
  list.addEventListener('click',function(e){var b=e.target.closest('.pl');if(b&&b.getAttribute('aria-disabled')!=='true'&&step===1)ui(2)});
  send.addEventListener('click',function(){if(!send.disabled)ui(3)});
  ['back-btn','cancel-btn','again','reset','back2'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('click',function(){ui(1)})});
  ui(1);
  show(1);buttons();
})();
