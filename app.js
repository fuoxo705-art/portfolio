const statement=document.querySelector('#statement');function openDialog(d){d.showModal();document.body.style.overflow='hidden';d.append(cursor)}const hibiProse=statement.querySelector('.prose').innerHTML;document.querySelectorAll('[data-statement]').forEach(button=>button.onclick=()=>{const ichigo=button.dataset.statement==='ichigo';statement.querySelector('h1').textContent=ichigo?'一期一会':'日々のありか';statement.querySelector('h1').hidden=false;statement.setAttribute('aria-label',ichigo?'一期一会':'日々のありか');statement.querySelector('.prose').innerHTML=ichigo?document.querySelector('#ichigo-prose').innerHTML:hibiProse;document.querySelector('[data-language="'+lang+'"]').click();openDialog(statement)});document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('close',()=>{document.body.style.overflow='';document.body.append(cursor)})});let lang='ja';document.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>{lang=button.dataset.language;statement.lang=lang==='zh'?'zh-CN':lang;document.querySelectorAll('.prose [data-ja]').forEach(e=>{const text=e.dataset[lang];e.textContent=text;if(lang==='zh'){const chars=Array.from(text);const tail=document.createElement('span');tail.className='paragraph-tail';tail.textContent=chars.slice(-6).join('');e.replaceChildren(document.createTextNode(chars.slice(0,-6).join('')),tail)}});document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))});const photos=[...document.querySelectorAll('#work .photo')],viewer=document.querySelector('#viewer'),full=document.querySelector('#full');let index=0,viewerPhotos=photos;function show(i){index=(i+viewerPhotos.length)%viewerPhotos.length;const img=viewerPhotos[index].querySelector('img');full.src=img.src;full.alt=img.alt}document.querySelectorAll('.photo').forEach(a=>a.onclick=e=>{e.preventDefault();viewerPhotos=[...a.closest('section').querySelectorAll('.photo')];show(viewerPhotos.indexOf(a));openDialog(viewer)});document.querySelector('#prev').onclick=()=>show(index-1);document.querySelector('#next').onclick=()=>show(index+1);viewer.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index-1)}if(e.key==='ArrowRight'){e.preventDefault();show(index+1)}});const cursor=document.querySelector('#cursor');if(matchMedia('(hover:hover) and (pointer:fine)').matches){document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;document.documentElement.classList.add('dot-cursor');cursor.style.transform=`translate(${e.clientX}px,${e.clientY}px)`;cursor.classList.add('visible')});document.documentElement.addEventListener('pointerleave',()=>{cursor.classList.remove('visible');document.documentElement.classList.remove('dot-cursor')});window.addEventListener('blur',()=>{cursor.classList.remove('visible');document.documentElement.classList.remove('dot-cursor')})}
const slideshowPhotos=[...document.querySelectorAll('.gallery .photo')];const pages=[...document.querySelectorAll('.page')],slide=document.querySelector('#slideshow img'),pause=document.querySelector('#pause');let slideIndex=0,timer=null,paused=matchMedia('(prefers-reduced-motion:reduce)').matches;function stopSlides(){clearInterval(timer);timer=null}function startSlides(){stopSlides();pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-label',paused?'Play slideshow':'Pause slideshow');if(!paused&&!document.hidden&&(!location.hash||location.hash==='#home'))timer=setInterval(()=>{slideIndex=(slideIndex+1)%slideshowPhotos.length;const photo=slideshowPhotos[slideIndex],img=photo.querySelector('img');slide.src=img.src;slide.alt=img.alt;document.querySelector('#slideshow').href='#'+photo.closest('section').id;const next=new Image();next.src=slideshowPhotos[(slideIndex+1)%slideshowPhotos.length].querySelector('img').src},3000)}function route(){const key=location.hash.slice(1)||'home';const active=pages.some(p=>p.id===key)?key:'home';pages.forEach(p=>p.hidden=p.id!==active);document.body.classList.toggle('home-view',active==='home');document.querySelectorAll('nav a').forEach(a=>{const selected=a.hash==='#'+(active.startsWith('work')?'portfolio':active);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});window.scrollTo({top:0,behavior:'instant'});startSlides()}pause.onclick=()=>{paused=!paused;startSlides()};window.addEventListener('hashchange',route);document.addEventListener('visibilitychange',startSlides);route();photos.forEach(a=>{const img=new Image();img.src=a.href});

function updateHeader(){document.body.classList.toggle('header-scrolled',scrollY>24)}
addEventListener('scroll',updateHeader,{passive:true});addEventListener('resize',updateHeader);updateHeader();

const freeWall=document.querySelector('.free-wall'),freePhotos=[...document.querySelectorAll('.free-photo')];let wallDrag=null,activePinch=null,activeResize=null,wallDragged=false;const activePointers=new Map(),reduceWallMotion=matchMedia('(prefers-reduced-motion:reduce)');function scrollPhotos(){const bottom=document.documentElement.scrollHeight-innerHeight;window.scrollTo({top:scrollY>=bottom-5?0:Math.min(bottom,scrollY+innerHeight*.65),behavior:reduceWallMotion.matches?'instant':'smooth'})}let photoLayer=1;
const photoCoasts=new Map();
const MIN_PHOTO_SCALE=.55,MAX_PHOTO_SCALE=2.8;
freePhotos.forEach(photo=>['nw','ne','sw','se'].forEach(corner=>{const handle=document.createElement('span');handle.className=`resize-handle resize-handle-${corner}`;handle.dataset.corner=corner;handle.setAttribute('aria-hidden','true');photo.append(handle)}));
function getPhotoScale(photo){return Number(photo.dataset.scale||1)}
function placePhoto(photo,x,y,scale=getPhotoScale(photo)){scale=Math.min(MAX_PHOTO_SCALE,Math.max(MIN_PHOTO_SCALE,scale));photo.dataset.x=x;photo.dataset.y=y;photo.dataset.scale=scale;photo.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`}
function stopPhotoCoast(photo){const frame=photoCoasts.get(photo);if(frame!==undefined)cancelAnimationFrame(frame);photoCoasts.delete(photo)}
function coastPhoto(photo,vx,vy){
 stopPhotoCoast(photo);
 if(reduceWallMotion.matches)return;
 const speed=Math.hypot(vx,vy),scale=speed>.65?.65/speed:1;
 vx*=scale;vy*=scale;
 let previous=performance.now();
 function step(now){
  const dt=Math.min(now-previous,40);previous=now;
  const decay=Math.exp(-dt/150),distance=150*(1-decay);
  placePhoto(photo,Number(photo.dataset.x||0)+vx*distance,Number(photo.dataset.y||0)+vy*distance);
  vx*=decay;vy*=decay;
  if(Math.hypot(vx,vy)>.008)photoCoasts.set(photo,requestAnimationFrame(step));else photoCoasts.delete(photo);
 }
 if(Math.hypot(vx,vy)>.008)photoCoasts.set(photo,requestAnimationFrame(step));
}
freeWall.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='touch'&&e.button!==0)return;
 const photo=e.target.closest('.free-photo');if(!photo)return;
 const handle=e.target.closest('.resize-handle');
 if(handle&&e.pointerType!=='touch'){
  e.preventDefault();stopPhotoCoast(photo);wallDragged=true;photo.style.zIndex=String(++photoLayer);
  const rect=photo.getBoundingClientRect(),centerX=rect.left+rect.width/2,centerY=rect.top+rect.height/2;
  activeResize={photo,id:e.pointerId,centerX,centerY,startDistance:Math.max(1,Math.hypot(e.clientX-centerX,e.clientY-centerY)),baseScale:getPhotoScale(photo)};
  if(photo.setPointerCapture)photo.setPointerCapture(e.pointerId);return;
 }
 if(activePointers.size&&![...activePointers.values()].every(point=>point.photo===photo))return;
 e.preventDefault();
 stopPhotoCoast(photo);
 activePointers.set(e.pointerId,{photo,x:e.clientX,y:e.clientY});
 if(photo.setPointerCapture)photo.setPointerCapture(e.pointerId);
 photo.style.zIndex=String(++photoLayer);
 const now=performance.now();
 const points=[...activePointers.entries()].filter(([,point])=>point.photo===photo);
 if(points.length===1){
  wallDragged=false;activePinch=null;
  wallDrag={photo,id:e.pointerId,x:e.clientX,y:e.clientY,scroll:scrollY,baseX:Number(photo.dataset.x||0),baseY:Number(photo.dataset.y||0),samples:[{x:e.clientX,y:e.clientY,time:now}],lastMove:now};
 }else if(points.length===2){
  wallDragged=true;wallDrag=null;
  const [a,b]=points.map(([id,point])=>({id,...point}));
  activePinch={photo,ids:[a.id,b.id],distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),centerX:(a.x+b.x)/2,centerY:(a.y+b.y)/2,baseX:Number(photo.dataset.x||0),baseY:Number(photo.dataset.y||0),baseScale:getPhotoScale(photo)};
 }
});
window.addEventListener('pointermove',e=>{
 if(activeResize&&e.pointerId===activeResize.id){e.preventDefault();const distance=Math.max(1,Math.hypot(e.clientX-activeResize.centerX,e.clientY-activeResize.centerY));placePhoto(activeResize.photo,Number(activeResize.photo.dataset.x||0),Number(activeResize.photo.dataset.y||0),activeResize.baseScale*distance/activeResize.startDistance);return}
 const point=activePointers.get(e.pointerId);if(!point)return;
 point.x=e.clientX;point.y=e.clientY;
 if(activePinch&&activePinch.ids.includes(e.pointerId)){
  const a=activePointers.get(activePinch.ids[0]),b=activePointers.get(activePinch.ids[1]);if(!a||!b)return;
  e.preventDefault();wallDragged=true;
  const distance=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),centerX=(a.x+b.x)/2,centerY=(a.y+b.y)/2;
  placePhoto(activePinch.photo,activePinch.baseX+centerX-activePinch.centerX,activePinch.baseY+centerY-activePinch.centerY,activePinch.baseScale*distance/activePinch.distance);
  return;
 }
 if(!wallDrag||e.pointerId!==wallDrag.id)return;
 const dx=e.clientX-wallDrag.x,dy=e.clientY-wallDrag.y+scrollY-wallDrag.scroll;
 if(Math.hypot(dx,dy)>5)wallDragged=true;
 if(wallDragged){
  e.preventDefault();
  placePhoto(wallDrag.photo,wallDrag.baseX+dx,wallDrag.baseY+dy);
  wallDrag.photo.style.zIndex=String(++photoLayer);
  const now=performance.now();wallDrag.lastMove=now;
  wallDrag.samples.push({x:e.clientX,y:e.clientY,time:now});
  while(wallDrag.samples.length>2&&wallDrag.samples[1].time<now-90)wallDrag.samples.shift();
 }
});
function endPhotoDrag(e){
 if(!e){activePointers.clear();activePinch=null;activeResize=null;wallDrag=null;return}
 if(activeResize&&e.pointerId===activeResize.id){const resize=activeResize;activeResize=null;if(resize.photo.hasPointerCapture?.(resize.id))resize.photo.releasePointerCapture(resize.id);return}
 const point=activePointers.get(e.pointerId);if(!point)return;
 activePointers.delete(e.pointerId);
 if(point.photo.hasPointerCapture?.(e.pointerId))point.photo.releasePointerCapture(e.pointerId);
 if(activePinch&&activePinch.ids.includes(e.pointerId)){
  const pinchPhoto=activePinch.photo;activePinch=null;wallDrag=null;
  const remaining=[...activePointers.entries()].find(([,p])=>p.photo===pinchPhoto);
  if(remaining){const [id,p]=remaining,now=performance.now();wallDrag={photo:pinchPhoto,id,x:p.x,y:p.y,scroll:scrollY,baseX:Number(pinchPhoto.dataset.x||0),baseY:Number(pinchPhoto.dataset.y||0),samples:[{x:p.x,y:p.y,time:now}],lastMove:now}}
  return;
 }
 if(!wallDrag||e.pointerId!==wallDrag.id)return;
 const drag=wallDrag;wallDrag=null;
 if(e?.type==='pointerup'&&wallDragged&&performance.now()-drag.lastMove<100){
  const first=drag.samples[0],last=drag.samples[drag.samples.length-1],dt=last.time-first.time;
  if(dt>0){const fade=Math.exp(-(performance.now()-drag.lastMove)/55);coastPhoto(drag.photo,(last.x-first.x)/dt*fade,(last.y-first.y)/dt*fade)}
 }
}
function stopAllPhotoMotion(){endPhotoDrag();for(const photo of photoCoasts.keys())stopPhotoCoast(photo)}
window.addEventListener('pointerup',endPhotoDrag);
window.addEventListener('pointercancel',endPhotoDrag);
window.addEventListener('blur',stopAllPhotoMotion);
window.addEventListener('hashchange',stopAllPhotoMotion);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAllPhotoMotion()});
reduceWallMotion.addEventListener('change',()=>{if(reduceWallMotion.matches)stopAllPhotoMotion()});
freeWall.addEventListener('wheel',e=>{const photo=e.target.closest('.free-photo');if(!photo||(!e.ctrlKey&&!e.metaKey))return;e.preventDefault();stopPhotoCoast(photo);placePhoto(photo,Number(photo.dataset.x||0),Number(photo.dataset.y||0),getPhotoScale(photo)*Math.exp(-e.deltaY*.002));photo.style.zIndex=String(++photoLayer)},{passive:false});
freeWall.addEventListener('dragstart',e=>e.preventDefault());freeWall.addEventListener('click',e=>{if(wallDragged){e.preventDefault();wallDragged=false;return}const selected=e.target.closest('.free-photo');if(selected){viewerPhotos=freePhotos;show(freePhotos.indexOf(selected));openDialog(viewer)}else scrollPhotos()});freeWall.addEventListener('keydown',e=>{if(e.target===freeWall&&(e.key==='Enter'||e.key===' ')){e.preventDefault();scrollPhotos()}});
