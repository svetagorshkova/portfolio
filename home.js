(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // split text into pull-up words (preserves .serif segments and nbsp)
  document.querySelectorAll('[data-pull]').forEach(function(el){
    var i=0;
    function walk(node,cls){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=document.createDocumentFragment();
          n.textContent.split(/[ \t\n]+/).filter(Boolean).forEach(function(t){
            var s=document.createElement('span');s.className='w'+(cls?' '+cls:'');
            s.style.setProperty('--i',i++);s.textContent=t;frag.appendChild(s);
            frag.appendChild(document.createTextNode(' '));
          });
          n.replaceWith(frag);
        }else if(n.nodeType===1){walk(n,cls)}
      });
    }
    walk(el,'');
  });

  // scroll-linked per-character opacity
  var revs=[];
  document.querySelectorAll('.reveal').forEach(function(rv){
    var chars=[],text=rv.textContent.trim();rv.textContent='';
    var words=text.split(/ +/);var total=text.replace(/ /g,'').length,idx=0;
    words.forEach(function(w,wi){
      var ws=document.createElement('span');ws.className='word';
      Array.from(w).forEach(function(c){
        var s=document.createElement('span');s.className='ch';s.textContent=c;
        s._p=idx++/total;ws.appendChild(s);chars.push(s);
      });
      rv.appendChild(ws);if(wi<words.length-1)rv.appendChild(document.createTextNode(' '));
    });
    revs.push({el:rv,chars:chars});
  });
  function clamp(x){return x<0?0:x>1?1:x}
  function onScroll(){
    if(reduce)return;
    revs.forEach(function(R){
      var r=R.el.getBoundingClientRect(),vh=innerHeight;
      var start=vh*0.8,end=vh*0.2;
      var prog=clamp((start-r.top)/((start-end)+r.height));
      R.chars.forEach(function(c){
        var a=c._p-0.1,b=c._p+0.05;
        c.style.opacity=(0.2+0.8*clamp((prog-a)/(b-a))).toFixed(3);
      });
    });
  }
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll);onScroll();

  // in-view triggers
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{rootMargin:'0px 0px -100px 0px',threshold:0.05});
  document.querySelectorAll('[data-pull],.fade-up,.card,.xcard,.hero-content').forEach(function(el){io.observe(el)});

  // hero video: poster frame stays visible if the video can't play
})();
