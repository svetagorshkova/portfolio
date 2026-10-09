(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // sections fade in as they enter the viewport
  var secs=document.querySelectorAll('.cs');
  if(reduce||!('IntersectionObserver' in window)){secs.forEach(function(s){s.classList.add('in')})}
  else{
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -60px 0px',threshold:0.02});
    secs.forEach(function(s){io.observe(s)});
  }
  // missing image -> neat placeholder instead of a broken icon
  document.querySelectorAll('.shot img').forEach(function(img){
    function miss(){img.classList.add('missing');img.removeAttribute('src');img.alt=img.alt||'Изображение будет здесь'}
    img.addEventListener('error',miss);
    if(img.complete&&img.naturalWidth===0&&img.getAttribute('src'))miss();
  });
  // lightbox
  var lb=document.getElementById('lightbox'),li=document.getElementById('lightbox-img');
  document.addEventListener('click',function(e){
    var img=e.target.closest&&e.target.closest('.shot img');
    if(img&&img.getAttribute('src')&&!img.classList.contains('missing')){li.src=img.currentSrc||img.src;lb.style.display='flex'}
  });
  lb.addEventListener('click',function(){lb.style.display='none'});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')lb.style.display='none'});
})();
